/**
 * Layer 1: Vernacular Voice & Citizen Assistant
 * Claude-style chat with fixed bottom prompt bar, Web Speech API input/output,
 * PII redaction, collapsible structured intent panel, and patient guidance.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertCircle,
  FileText,
  X,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Info
} from 'lucide-react';
import { askOmniSwarmAssistant } from '../lib/assistantEngine';
import { getActiveWorkflowId, db, logAuditEvent } from '../lib/supabase';
import { screenPromptInjection } from '../lib/securityGuard';
import { ChatMessage } from '../types';
import { LANGUAGES } from './TopBar.tsx';

interface Layer1AssistantProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export default function Layer1Assistant({
  currentLanguage,
  onLanguageChange
}: Layer1AssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [activeAudioMessageId, setActiveAudioMessageId] = useState<string | null>(null);
  const [expandedIntentIds, setExpandedIntentIds] = useState<Record<string, boolean>>({});
  const [securityBlockReason, setSecurityBlockReason] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workflowId = getActiveWorkflowId();

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Load chat messages from database table
  useEffect(() => {
    async function loadChatMessages() {
      const { data } = await db.from('chat_messages').select().order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setMessages(data);
      }
    }
    loadChatMessages();
  }, []);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = currentLanguage;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interim);
        if (final) {
          setInputText(prev => (prev ? `${prev} ${final}` : final).trim());
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } catch (err) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [currentLanguage]);

  // Voice toggle
  const handleToggleMic = () => {
    if (!speechSupported) return;

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = currentLanguage;
          recognitionRef.current.start();
        }
      } catch (err) {
        console.warn('Recognition start notice:', err);
      }
    }
  };

  // Text-to-Speech Output
  const handleSpeakText = (messageId: string, text: string, lang: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (activeAudioMessageId === messageId) {
      window.speechSynthesis.cancel();
      setActiveAudioMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang || currentLanguage;
    utterance.rate = 0.95; // Gentle, patient cadence

    utterance.onend = () => setActiveAudioMessageId(null);
    utterance.onerror = () => setActiveAudioMessageId(null);

    setActiveAudioMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : 'Attached file content binary';
      setAttachedFile({
        name: file.name,
        content: text.slice(0, 4000) // excerpt for summary
      });
    };
    reader.readAsText(file);
  };

  // Message Send
  const handleSendMessage = async (textOverride?: string) => {
    const raw = (textOverride || inputText || interimTranscript).trim();
    if (!raw && !attachedFile) return;

    if (isListening) {
      handleToggleMic();
    }

    setSecurityBlockReason(null);
    setInputText('');
    setInterimTranscript('');

    // LAYER 3 AUTOMATED GATE: Run prompt-injection screening on EVERY input before LLM
    const securityCheck = screenPromptInjection(raw);
    if (!securityCheck.allowed) {
      setSecurityBlockReason(securityCheck.reason || 'Input blocked by Layer 3 Autonomous Security Center.');
      await logAuditEvent({
        layer: 'layer3',
        type: 'prompt_injection_blocked',
        detail: { prompt: raw, reason: securityCheck.reason, confidence: securityCheck.confidence },
        severity: 'critical',
        workflowId
      });
      return;
    }

    // Log security allow
    await logAuditEvent({
      layer: 'layer3',
      type: 'prompt_injection_allowed',
      detail: { confidence: securityCheck.confidence, stage: securityCheck.stage },
      severity: 'info',
      workflowId
    });

    setIsProcessing(true);

    try {
      const response = await askOmniSwarmAssistant({
        rawPrompt: raw,
        language: currentLanguage,
        workflowId,
        uploadedFileContent: attachedFile?.content
      });

      // Append locally to chat stream
      const userMsg: ChatMessage = {
        id: `msg_u_${Date.now()}`,
        user_id: 'local',
        workflow_id: workflowId,
        sender: 'user',
        text: raw,
        language: currentLanguage,
        redactions_json: response.redactedItems,
        created_at: new Date().toISOString()
      };

      const asstMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        user_id: 'local',
        workflow_id: workflowId,
        sender: 'assistant',
        text: response.message,
        language: currentLanguage,
        intent_json: response.intentJson,
        redactions_json: response.redactedItems,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMsg, asstMsg]);
      setAttachedFile(null);
    } catch (err) {
      console.error('Error exchanging assistant message:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleIntentPanel = (id: string) => {
    setExpandedIntentIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const QUICK_QUESTIONS = [
    { label: '🌾 Raitha Sanjeevini Seed Subsidy', q: 'How to apply for subsidized seeds at Raitha Samparka Kendra in Kannada?' },
    { label: '🎓 SSP Post-Matric Scholarship', q: 'What documents are required for SSP Post-Matric Scholarship e-attestation?' },
    { label: '📝 Tehsildar Income Application', q: 'Draft an application letter to the Tehsildar requesting an income certificate' },
    { label: '🏥 Ayushman Bharat PM-JAY Card', q: 'Where and how can a rural family get an Ayushman Bharat hospital card?' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[550px] max-w-4xl mx-auto w-full">
      {/* Upper Conversation Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {messages.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-xl mx-auto my-6">
            <div className="w-12 h-12 rounded-2xl bg-[#0B2A5B] text-teal-400 mx-auto flex items-center justify-center shadow-sm">
              <Bot className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#0B2A5B]">OMNI-SWARM Citizen & Student Guide</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                A patient assistant for rural citizens, farmers, and students. I explain government schemes, assist with documentation, draft letters, and verify application steps without fabricating details.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Suggested Questions (Click to Ask):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {QUICK_QUESTIONS.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(item.q)}
                    className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 hover:border-[#0F766E] text-xs text-[#0B2A5B] font-medium transition text-left hover-card-lift cursor-pointer"
                  >
                    <div className="font-semibold text-[11px] text-[#0F766E]">{item.label}</div>
                    <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{item.q}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-2 animate-fadeIn">
              {msg.sender === 'user' ? (
                /* User Message Bubble */
                <div className="flex items-start justify-end gap-2.5 max-w-2xl ml-auto">
                  <div className="bg-[#0B2A5B] text-white p-4 rounded-2xl rounded-tr-xs shadow-xs text-xs font-sans leading-relaxed space-y-1">
                    <div>{msg.text}</div>
                    {msg.redactions_json && msg.redactions_json.length > 0 && (
                      <div className="pt-1.5 border-t border-blue-900/40 text-[10px] text-teal-300 font-mono flex items-center gap-1">
                        <Shield className="w-3 h-3 text-teal-300 shrink-0" />
                        <span>PII Protected ({msg.redactions_json.length} items redacted)</span>
                      </div>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                /* Assistant Message Bubble */
                <div className="flex items-start gap-3 max-w-3xl mr-auto">
                  <div className="w-8 h-8 rounded-full bg-[#0F766E] flex items-center justify-center text-white text-xs shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>

                  <div className="flex-1 space-y-2 overflow-hidden">
                    <div className="bg-white p-5 rounded-2xl rounded-tl-xs border border-slate-200 shadow-xs text-xs text-[#0B2A5B] space-y-3 font-sans leading-relaxed">
                      <div className="whitespace-pre-line">{msg.text}</div>

                      {/* Message Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <button
                          onClick={() => handleSpeakText(msg.id, msg.text, msg.language)}
                          className="flex items-center gap-1.5 text-slate-600 hover:text-[#0F766E] transition font-medium cursor-pointer"
                        >
                          {activeAudioMessageId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                              <span className="text-rose-600 font-semibold">Stop Speaking</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-[#0F766E]" />
                              <span>Listen in Vernacular</span>
                            </>
                          )}
                        </button>

                        {/* Collapsible Intent Toggle Button */}
                        {msg.intent_json && (
                          <button
                            onClick={() => toggleIntentPanel(msg.id)}
                            className="flex items-center gap-1 text-[#0F766E] hover:text-[#115E59] font-medium cursor-pointer"
                          >
                            <span>How I understood this</span>
                            {expandedIntentIds[msg.id] ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Collapsible "How I understood this" JSON Panel */}
                    {msg.intent_json && expandedIntentIds[msg.id] && (
                      <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-mono text-slate-700 space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#0B2A5B] border-b border-slate-200 pb-1.5">
                          <span>Structured Intent & Entity Schema</span>
                          <span className="text-[10px] text-[#0F766E]">Layer 1 Intent Parser</span>
                        </div>
                        <pre className="text-[11px] bg-white p-2.5 rounded-lg border border-slate-200/80 overflow-x-auto text-[#0B2A5B]">
                          <code>{JSON.stringify(msg.intent_json, null, 2)}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center animate-spin">
              <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
            </div>
            <span>Assistant is reviewing official scheme databases & drafting response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Security Block Alert */}
      {securityBlockReason && (
        <div className="mx-4 mb-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span><strong>Input Blocked (Layer 3 Guard):</strong> {securityBlockReason}</span>
          </div>
          <button
            onClick={() => setSecurityBlockReason(null)}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Fixed Bottom Prompt Area */}
      <div className="px-4 pb-4 pt-1 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent shrink-0">
        {/* Visible Privacy Note (Mandatory) */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>
              <strong>Privacy Protection Active:</strong> Aadhaar, phone, PAN, and email are automatically redacted before sending.
            </span>
          </div>
          <span className="hidden sm:inline text-slate-400">
            *Speech recognition may use browser vendor servers.
          </span>
        </div>

        {/* Attached File Preview Tag */}
        {attachedFile && (
          <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-50 border border-teal-200 text-xs font-medium text-[#0F766E]">
            <FileText className="w-3.5 h-3.5" />
            <span className="truncate max-w-xs">{attachedFile.name}</span>
            <button onClick={() => setAttachedFile(null)} className="hover:text-rose-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Large Rounded Claude-Style Prompt Bar */}
        <div className="bg-white rounded-2xl border border-slate-300 focus-within:border-[#0F766E] shadow-sm p-2 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder={
              isListening
                ? (interimTranscript ? `🎙️ "${interimTranscript}"` : '🎙️ Listening... speak in your selected language')
                : 'Ask a question in Kannada, Hindi, Tamil, Telugu, or English (e.g. seed subsidy, scholarship steps, draft application)...'
            }
            className="w-full bg-transparent border-none text-xs sm:text-sm text-[#0B2A5B] placeholder:text-slate-400 focus:outline-none resize-none p-1.5"
            disabled={isProcessing}
          />

          {/* Bar Control Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
            <div className="flex items-center gap-2">
              {/* File Attachment Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B2A5B] hover:bg-slate-100 transition"
                title="Attach document or form (PDF/Image/Text)"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Web Speech Mic Button */}
              <button
                type="button"
                onClick={handleToggleMic}
                disabled={!speechSupported}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isListening
                    ? 'bg-rose-500 text-white shadow-xs animate-pulse'
                    : 'text-slate-600 hover:text-[#0B2A5B] hover:bg-slate-100'
                }`}
                title={speechSupported ? 'Speak in selected vernacular language' : 'Browser lacks SpeechRecognition'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span className="hidden sm:inline">Voice</span>
                  </>
                )}
              </button>

              {/* Language Switcher */}
              <div className="relative">
                <select
                  value={currentLanguage}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="bg-transparent text-xs text-slate-600 font-medium hover:text-[#0B2A5B] focus:outline-none cursor-pointer pr-4"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={(!inputText.trim() && !attachedFile && !interimTranscript.trim()) || isProcessing}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition shadow-xs ${
                (inputText.trim() || attachedFile || interimTranscript.trim()) && !isProcessing
                  ? 'bg-[#0B2A5B] hover:bg-[#071E43] text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
