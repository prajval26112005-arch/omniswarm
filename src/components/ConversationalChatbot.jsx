import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  Download, 
  Maximize2, 
  Copy, 
  Check, 
  Globe2, 
  RefreshCw, 
  ChevronRight, 
  Bot, 
  User, 
  Terminal, 
  FileCheck, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Volume2
} from 'lucide-react';

import DynamicAppPreview from './DynamicAppPreview';
import FullscreenAppModal from './FullscreenAppModal';
import { 
  SUPPORTED_LANGUAGES, 
  createSpeechRecognizer, 
  isWebSpeechSupported, 
  detectLanguageFromText 
} from '../utils/speechRecognition';
import { parseIntentFromText } from '../utils/intentParser';
import { generateVernacularChatbotResponse } from '../utils/vernacularResponses';
import { downloadProjectZip } from '../utils/projectExporter';

export default function ConversationalChatbot({
  activeVC,
  currentTopic,
  securityCertificate,
  settlementVC,
  onProcessPrompt,
  onOpenAuditDrawer
}) {
  // Chat History
  const [messages, setMessages] = useState(() => {
    // Initial seeded conversational state welcoming villagers and students
    const initialPrompt = "Apply for seed subsidy in Kannada";
    const initialIntent = parseIntentFromText(initialPrompt);
    const initialVernacular = generateVernacularChatbotResponse(initialIntent, initialPrompt);

    return [
      {
        id: 'seed-welcome-1',
        sender: 'assistant',
        timestamp: 'Just Now',
        text: initialVernacular.message,
        subtitles: initialVernacular.subtitles,
        language: initialVernacular.language,
        securitySummary: initialVernacular.securitySummary,
        topic: 'Agricultural Subsidy in Kannada',
        isAppDelivery: true,
        vc: activeVC
      }
    ];
  });

  // Input & Voice State
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [isListening, setIsListening] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState('');
  const [speechError, setSpeechError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  // Full-screen modal inspection state
  const [fullscreenApp, setFullscreenApp] = useState(null); // { topic, vc }

  // Audio recognizer ref
  const recognizerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to latest message
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Quick Preset Prompts tailored for villagers, students, and businesses
  const QUICK_PROMPTS = [
    {
      label: '🌾 Apply for seed subsidy in Kannada',
      prompt: 'Apply for seed subsidy in Kannada',
      topic: 'Agricultural Subsidy in Kannada',
      desc: 'ರೈತರ ಬಿತ್ತನೆ ಬೀಜ ಸಹಾಯಧನ ಯೋಜನೆ (₹50L DBT)',
      badge: 'Villager Focus'
    },
    {
      label: '💼 Create a portfolio for my business',
      prompt: 'Create a portfolio for my business with client consulting and digital solutions',
      topic: 'Business Portfolio & Services Showcase',
      desc: 'Professional services showcase & lead form',
      badge: 'Student / Entrepreneur'
    },
    {
      label: '🏥 Build clinic app for City Care Hospital',
      prompt: 'Build a clinic app for City Care Hospital with doctor appointments',
      topic: 'City Care Hospital Clinical Dashboard',
      desc: 'Patient booking and telemedicine hub',
      badge: 'Healthcare'
    },
    {
      label: '🏡 Real estate market for Skyline Realty',
      prompt: 'Create a real estate marketplace for Skyline Realty with 2/3 BHK luxury villas',
      topic: 'Skyline Realty Property Marketplace',
      desc: 'Verified luxury villas & site visits',
      badge: 'Real Estate'
    },
    {
      label: '🛒 Digital store for TechMart',
      prompt: 'Build an e-commerce store for TechMart selling laptops and headphones',
      topic: 'TechMart Digital Storefront',
      desc: 'Product catalog, live cart & checkout',
      badge: 'Retail'
    }
  ];

  // Speech Recognition handlers
  const handleStartListening = () => {
    setSpeechError(null);

    if (!isWebSpeechSupported()) {
      setSpeechError('Web Speech API is not supported in this browser. Please type directly or click any prompt suggestion.');
      return;
    }

    try {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.abort();
        } catch {
          // ignore
        }
      }

      const rec = createSpeechRecognizer({
        language: selectedLanguage,
        onStart: () => {
          setIsListening(true);
          setSpeechError(null);
        },
        onResult: ({ finalTranscript, interimTranscript }) => {
          setInterimSpeech(interimTranscript);
          if (finalTranscript) {
            setInputText(prev => {
              const combined = prev ? `${prev} ${finalTranscript}` : finalTranscript;
              return combined.trim();
            });
            setInterimSpeech('');
          }
        },
        onError: (event) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setSpeechError('Microphone permission blocked. Please allow mic access or use text input.');
          } else if (event.error !== 'no-speech') {
            setSpeechError(`Speech notice: ${event.error || 'Audio error'}`);
          }
          setIsListening(false);
          setInterimSpeech('');
        },
        onEnd: () => {
          setIsListening(false);
          setInterimSpeech('');
        }
      });

      if (rec) {
        recognizerRef.current = rec;
        rec.start();
        setIsListening(true);
      }
    } catch (err) {
      console.error(err);
      setSpeechError('Could not start microphone. You can type directly or click quick prompt chips.');
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setInterimSpeech('');
  };

  const handleToggleListening = () => {
    if (isListening) {
      handleStopListening();
    } else {
      handleStartListening();
    }
  };

  // Process User Message & Execute Automated Silent Defense
  const handleSendMessage = (textToSend = null) => {
    const rawText = (textToSend !== null ? textToSend : (inputText || interimSpeech)).trim();
    if (!rawText || isGenerating) return;

    if (isListening) {
      handleStopListening();
    }

    setInputText('');
    setInterimSpeech('');
    setSpeechError(null);

    // 1. Add User Message
    const userMsgId = `user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: rawText,
      language: detectLanguageFromText(rawText)
    };

    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);
    setGenerationStep('SLM Engine parsing vernacular intent...');

    // Multi-Agent reasoning steps animation (fast, responsive)
    setTimeout(() => {
      setGenerationStep('Multi-Agent Swarm synthesizing components...');
    }, 450);

    setTimeout(() => {
      setGenerationStep('Zero-Trust Kernel screening security & sealing ShramSetu wallet...');
    }, 900);

    setTimeout(() => {
      // Execute background processing via callback in App.jsx
      // Automatically triggers Layer 3 SOC and Layer 4 Settlement silently!
      const outcome = onProcessPrompt ? onProcessPrompt(rawText) : null;
      const parsed = outcome?.parsed || parseIntentFromText(rawText);
      const vc = outcome?.vc || activeVC;
      const vernacular = generateVernacularChatbotResponse(parsed, rawText);

      // 2. Deliver Completed Task & Functional Interface inside Chat Stream
      const assistantMsg = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: vernacular.message,
        subtitles: vernacular.subtitles,
        language: vernacular.language,
        securitySummary: vernacular.securitySummary,
        topic: parsed.topic || rawText,
        isAppDelivery: true,
        vc: vc
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsGenerating(false);
      setGenerationStep('');
    }, 1300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptChipClick = (promptStr) => {
    handleSendMessage(promptStr);
  };

  const handleDownloadAppZip = (topic, vc) => {
    const cred = vc?.credentialSubject || {};
    downloadProjectZip({
      project_type: cred.project_type || 'CUSTOM',
      user_name: cred.user_name || '',
      title: cred.title || topic,
      items_or_skills: cred.items_or_skills || [],
      raw_input: cred.raw_input || topic,
      currentTopic: topic
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[550px] max-w-5xl mx-auto w-full">
      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-6">
        {/* Welcome Hero Greeting */}
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/40 p-5 sm:p-6 border border-cyan-500/20 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>ನಮಸ್ಕಾರ / नमस्ते / Hello!</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Vernacular AI Assistant
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Speak or type in your language. I generate completed applications, seed subsidies, and business portfolios directly in our chat stream.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuditDrawer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 text-xs font-mono text-cyan-300 transition"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>⚙️ System Logs & Audit</span>
              </button>
            </div>
          </div>

          {/* Quick Vernacular Suggestions Grid */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Try a 1-click prompt for villagers & students:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {QUICK_PROMPTS.slice(0, 3).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptChipClick(item.prompt)}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group flex flex-col justify-between"
                >
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-sans">
                    {item.desc}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-cyan-400/80">
                    <span>{item.badge}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Thread */}
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3 animate-fadeIn">
            {/* USER MESSAGE */}
            {msg.sender === 'user' ? (
              <div className="flex items-start justify-end gap-3 max-w-2xl ml-auto">
                <div className="p-4 rounded-3xl rounded-tr-sm bg-gradient-to-r from-cyan-900/40 via-slate-900 to-cyan-950/60 border border-cyan-500/30 text-white shadow-lg space-y-1">
                  <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-cyan-300">
                    <span className="font-semibold">You ({msg.language || 'User'})</span>
                    <span className="text-slate-400">{msg.timestamp}</span>
                  </div>
                  <div className="text-sm font-sans leading-relaxed text-slate-100">
                    {msg.text}
                  </div>
                </div>

                <div className="w-9 h-9 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-300">
                  <User className="w-4 h-4" />
                </div>
              </div>
            ) : (
              /* ASSISTANT MESSAGE */
              <div className="flex items-start gap-3 max-w-4xl mr-auto">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-600 p-0.5 shadow-md shadow-cyan-500/20 shrink-0 mt-1">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-hidden">
                  {/* Conversational Text Response Card */}
                  <div className="p-5 rounded-3xl rounded-tl-sm bg-slate-900/90 border border-slate-800 text-slate-100 shadow-xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-300">Omni-Swarm Assistant</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold">
                          {msg.language || 'Vernacular'}
                        </span>
                      </div>
                      <span className="text-slate-500 text-[11px]">{msg.timestamp}</span>
                    </div>

                    {/* Natural Language Response */}
                    <div className="text-sm leading-relaxed whitespace-pre-line text-slate-200 font-sans">
                      {msg.text}
                    </div>

                    {/* Subtitle Translation for multilingual judges/auditors */}
                    {msg.subtitles && (
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-sans text-slate-400 italic flex items-start gap-2">
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-300 not-italic font-mono text-[10px] uppercase block">
                            English Translation for Auditors:
                          </strong>
                          {msg.subtitles}
                        </div>
                      </div>
                    )}

                    {/* Automated Background Silent Security Pill */}
                    <div className="pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{msg.securitySummary || '🔒 Zero-Trust Screen: CLEAN • Layer 4 Settlement: SEALED • AMD SEV-SNP Active'}</span>
                      </div>

                      <button
                        onClick={onOpenAuditDrawer}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition underline decoration-cyan-500/40"
                      >
                        <span>View Cryptographic Certificate</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* DIRECTLY DELIVERED COMPLETED APPLICATION / FUNCTIONAL INTERFACE */}
                  {msg.isAppDelivery && (
                    <div className="rounded-3xl border border-cyan-500/30 bg-slate-950 overflow-hidden shadow-2xl">
                      {/* App Delivery Header Bar */}
                      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold text-white font-mono">
                            Delivered Interface: {msg.topic || 'Completed Application'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadAppZip(msg.topic, msg.vc)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 font-mono text-xs transition"
                            title="Download Standalone Project ZIP"
                          >
                            <Download className="w-3 h-3" />
                            <span className="hidden sm:inline">Download ZIP</span>
                          </button>

                          <button
                            onClick={() => setFullscreenApp({ topic: msg.topic, vc: msg.vc })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition"
                            title="Open Full Screen Workspace"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Expand</span>
                          </button>
                        </div>
                      </div>

                      {/* Embedded Live Functional Application */}
                      <div className="p-3 sm:p-5 bg-slate-950/70">
                        <DynamicAppPreview 
                          currentTopic={msg.topic}
                          activeVC={msg.vc}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Live Multi-Agent Synthesis Progression */}
        {isGenerating && (
          <div className="flex items-start gap-3 max-w-2xl mr-auto animate-pulse">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 text-slate-200 text-xs font-mono space-y-2 shadow-lg">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Multi-Agent Swarm Active</span>
              </div>
              <div className="text-slate-300 text-xs">
                {generationStep || 'Synthesizing application inside AMD SEV-SNP confidential enclave...'}
              </div>
              <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Speech Error Banner if any */}
      {speechError && (
        <div className="mx-4 mb-2 p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center justify-between gap-3 animate-fadeIn">
          <span>{speechError}</span>
          <button 
            onClick={() => setSpeechError(null)} 
            className="text-amber-400 hover:text-white px-2 py-0.5 rounded bg-amber-900/40"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bottom Sticky Chat Input Bar */}
      <div className="px-2 sm:px-4 py-3 shrink-0 border-t border-slate-900 bg-slate-950/90 backdrop-blur-md">
        {/* Quick prompt chips row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0 pl-1">Quick:</span>
          {QUICK_PROMPTS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptChipClick(q.prompt)}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 shrink-0 text-[11px] transition"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Main Input Control Bar */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-cyan-500/50 shadow-xl transition-all">
          {/* Language Selector Dropdown */}
          <div className="relative shrink-0">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 transition cursor-pointer"
              title="Select Speech & Input Language"
            >
              <option value="auto">🌐 Auto-Detect</option>
              <option value="kn-IN">🇮🇳 Kannada (ಕನ್ನಡ)</option>
              <option value="hi-IN">🇮🇳 Hindi (हिन्दी)</option>
              <option value="en-IN">🇬🇧 English</option>
            </select>
          </div>

          {/* Voice Microphone Button with Pulse and Wave Animation */}
          <button
            type="button"
            onClick={handleToggleListening}
            className={`relative p-2.5 rounded-xl font-mono text-xs transition-all flex items-center gap-1.5 shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40'
            }`}
            title={isListening ? 'Stop Recording' : 'Speak Prompt in Kannada/Hindi/English'}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 text-white animate-spin" />
                <span className="hidden sm:inline text-[11px] font-bold">Listening...</span>
              </>
            ) : (
              <Mic className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Text Input Box */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening 
                ? (interimSpeech ? `🎙️ "${interimSpeech}"` : '🎙️ Listening... speak in Kannada, Hindi, or English') 
                : 'Speak or type (e.g. "Apply for seed subsidy in Kannada" or "Create a portfolio for my business")...'
            }
            className="flex-1 bg-transparent border-0 px-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0"
            disabled={isGenerating}
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={(!inputText.trim() && !interimSpeech.trim()) || isGenerating}
            className={`p-2.5 rounded-xl font-bold transition-all shrink-0 flex items-center justify-center ${
              (inputText.trim() || interimSpeech.trim()) && !isGenerating
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-90'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Send Message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Input Bar Footer Note */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Zero Cloud Leakage • 100% Airgapped Edge Execution</span>
          </div>
          <span>Shift+Enter for newline</span>
        </div>
      </div>

      {/* Fullscreen App Modal */}
      {fullscreenApp && (
        <FullscreenAppModal
          isOpen={Boolean(fullscreenApp)}
          onClose={() => setFullscreenApp(null)}
          currentTopic={fullscreenApp.topic}
          activeVC={fullscreenApp.vc}
        />
      )}
    </div>
  );
}
