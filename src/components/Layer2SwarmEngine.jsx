import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Terminal, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Copy, 
  Check, 
  Play, 
  Activity, 
  Sparkles,
  ShieldAlert,
  Code2,
  Server,
  X,
  Radio,
  FileCode,
  Layout,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Download,
  FolderArchive,
  Cloud,
  Zap
} from 'lucide-react';
import DynamicAppPreview, { detectTopicCategory } from './DynamicAppPreview';
import { downloadProjectZip, generateProjectFiles } from '../utils/projectExporter.js';
import { parseIntentFromText } from '../utils/intentParser.js';

export default function Layer2SwarmEngine({ activeVC, currentTopic: propTopic, onTriggerLayer3 }) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  const [isTestingEndpoint, setIsTestingEndpoint] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  // Dual-View Switcher state ('visual' | 'backend')
  const [activeView, setActiveView] = useState('visual');
  const [showTerminalDetail, setShowTerminalDetail] = useState(true);
  
  // Live API Response Viewer Modal State
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [copiedModalJson, setCopiedModalJson] = useState(false);
  const [deployedAt, setDeployedAt] = useState(() => new Date().toISOString());

  // Export & Deployment Panel State
  const [selectedDeployTab, setSelectedDeployTab] = useState('vercel');
  const [downloadedZipInfo, setDownloadedZipInfo] = useState(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState('src/App.jsx');
  const [copiedCommand, setCopiedCommand] = useState(null);

  const terminalEndRef = useRef(null);

  // Dynamic topic passed from Layer 1
  const currentTopic = propTopic || activeVC?.topic || activeVC?.credentialSubject?.topic || activeVC?.credentialSubject?.raw_transcript || 'Agricultural Subsidy in Kannada';

  // Resolved dynamic parameters from activeVC or intent parser
  const resolvedParams = useMemo(() => {
    const cred = activeVC?.credentialSubject || activeVC?.parameters || {};
    if (cred.project_type && (cred.user_name !== undefined || cred.items_or_skills !== undefined)) {
      return {
        project_type: cred.project_type || 'CUSTOM',
        user_name: cred.user_name || '',
        title: cred.title || '',
        items_or_skills: Array.isArray(cred.items_or_skills) ? cred.items_or_skills : [],
        raw_input: cred.raw_input || cred.raw_transcript || currentTopic || ''
      };
    }
    return parseIntentFromText(currentTopic || '');
  }, [activeVC, currentTopic]);

  // Detected domain category (portfolio, hospital, realestate, chatbot, ecommerce, default)
  const topicCategory = detectTopicCategory(currentTopic, resolvedParams.project_type);

  // Generated project files for bundling and preview
  const projectFiles = useMemo(() => {
    return generateProjectFiles({
      ...resolvedParams,
      currentTopic
    });
  }, [resolvedParams, currentTopic]);

  // Handle ZIP Download
  const handleDownloadZip = () => {
    const result = downloadProjectZip({
      ...resolvedParams,
      currentTopic
    });
    setDownloadedZipInfo(result);
    setTimeout(() => setDownloadedZipInfo(null), 4000);
  };

  // Deployed live endpoint URL
  const endpointUrl = 'https://api.omniswarm.internal/v1/service/live';

  // Active microservice nodes
  const activeNodes = [
    'did:omni:edge_node_local',
    'node-blr-edge-01 (AMD SEV-SNP)',
    'node-del-edge-04 (AMD SEV-SNP)'
  ];

  // Agent Workflow Logs Sequence with dynamic parameters
  const getLogSequence = (topic, userName) => [
    {
      agent: 'AGENT 1 [Architect Agent]',
      color: 'text-cyan-400',
      text: `Analyzing user intent parameters for '${userName || topic}'...`,
      delay: 300
    },
    {
      agent: 'AGENT 1 [Architect Agent]',
      color: 'text-cyan-400',
      text: `Querying AIKosh repository (7,500+ open datasets, 273 pre-trained models) for: '${topic}'...`,
      delay: 750
    },
    {
      agent: 'AGENT 1 [Architect Agent]',
      color: 'text-cyan-400',
      text: `Selected model: 'sovereign-slm-v2'. Domain architecture synthesized for '${userName || topic}'.`,
      delay: 1200
    },
    {
      agent: 'AGENT 2 [Developer Agent]',
      color: 'text-emerald-400',
      text: `Generating custom React 19 layout & dynamic components for '${userName || topic}'...`,
      delay: 1650
    },
    {
      agent: 'AGENT 2 [Developer Agent]',
      color: 'text-emerald-400',
      text: `Linking database schema... Compiling confidential TEE container for '${topic}'...`,
      delay: 2100
    },
    {
      agent: 'AGENT 2 [Developer Agent]',
      color: 'text-emerald-400',
      text: `Code generation complete: Full-Stack React + FastAPI microservice synthesized in 1.2s.`,
      delay: 2450
    },
    {
      agent: 'AGENT 3 [QA Agent]',
      color: 'text-amber-400',
      text: `Validating component state & rendering visual application preview.`,
      delay: 2750
    },
    {
      agent: 'AGENT 3 [QA Agent]',
      color: 'text-amber-400',
      text: `All checks PASSED (exit code 0). Microservice and Visual UI live on edge loopback.`,
      delay: 3050
    }
  ];

  // Auto-run swarm simulation when activeVC or currentTopic changes
  useEffect(() => {
    runSwarmSimulation();
    setDeployedAt(new Date().toISOString());
  }, [activeVC?.vc_id, currentTopic]);

  const runSwarmSimulation = () => {
    setIsBuilding(true);
    setIsCompleted(false);
    setProgress(0);
    setLogs([]);
    setTestResponse(null);

    const startTime = Date.now();
    const duration = 3200; // ~3 seconds simulation
    const sequence = getLogSequence(currentTopic, resolvedParams.user_name);

    // Progress timer
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(progressInterval);
        setIsBuilding(false);
        setIsCompleted(true);
      }
    }, 50);

    // Schedule log events
    sequence.forEach((item) => {
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString().substring(11, 23),
            agent: item.agent,
            color: item.color,
            text: item.text
          }
        ]);
      }, item.delay);
    });

    return () => {
      clearInterval(progressInterval);
    };
  };

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(endpointUrl);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  // Response object for Live API Response Viewer
  const liveApiResponse = {
    status: '200 OK',
    topic: currentTopic,
    domain_category: topicCategory,
    user_name: resolvedParams.user_name || null,
    project_type: resolvedParams.project_type,
    items_or_skills: resolvedParams.items_or_skills,
    deployed_at: deployedAt,
    active_nodes: activeNodes,
    endpoint: endpointUrl,
    http_method: 'POST',
    runtime_environment: 'FastAPI / Sovereign AMD SEV-SNP Enclave',
    telemetry: {
      latency_ms: 1.4,
      memory_mb: 14.8,
      confidential_vm_state: 'ENCRYPTED',
      zero_trust_status: 'AUTHENTICATED'
    }
  };

  const handleCopyModalJson = () => {
    navigator.clipboard.writeText(JSON.stringify(liveApiResponse, null, 2));
    setCopiedModalJson(true);
    setTimeout(() => setCopiedModalJson(false), 2000);
  };

  const handleTestCurl = () => {
    setIsTestingEndpoint(true);
    setTestResponse(null);

    setTimeout(() => {
      setIsTestingEndpoint(false);
      setTestResponse({
        status: '200 OK',
        topic: currentTopic,
        domain_category: topicCategory,
        user_name: resolvedParams.user_name || null,
        deployed_at: deployedAt,
        active_nodes: activeNodes,
        response_time_ms: 18,
        service: 'live',
        payload_accepted: true,
        cluster_node: 'did:omni:edge_node_local'
      });
    }, 500);
  };

  const SAMPLE_MICROSERVICE_CODE = `from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List
import datetime

# Universal Full-Stack Agent Synthesizer
# Synthesized for: "${resolvedParams.user_name || currentTopic}" (Domain: ${topicCategory})
app = FastAPI(title="OmniSwarm Full-Stack - ${resolvedParams.title || currentTopic}", version="2.0.0")

class IntentPayload(BaseModel):
    topic: str = "${currentTopic}"
    domain: str = "${topicCategory}"
    user_name: str = "${resolvedParams.user_name || ''}"
    items_or_skills: List[str] = ${JSON.stringify(resolvedParams.items_or_skills)}
    parameters: Dict[str, Any]
    verifiable_token: str

@app.post("/v1/service/live")
async def handle_vernacular_execution(payload: IntentPayload):
    """
    Live full-stack microservice endpoint serving ${currentTopic}
    """
    if not payload.verifiable_token.startswith("0x_mock"):
        raise HTTPException(status_code=403, detail="Zero-Trust validation failed")
    
    return {
        "status": "200 OK",
        "topic": "${currentTopic}",
        "domain": "${topicCategory}",
        "user_name": "${resolvedParams.user_name || ''}",
        "items_or_skills": ${JSON.stringify(resolvedParams.items_or_skills)},
        "deployed_at": datetime.datetime.utcnow().isoformat() + "Z",
        "active_nodes": ${JSON.stringify(activeNodes)},
        "enclave": "AMD-SEV-SNP-VALIDATED"
    }
`;

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border-cyan-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Layer 2 of 5 • Swarm Synthesis
              </span>
              <span className="text-xs font-mono text-slate-400">
                AIKosh Connected (7,500+ Datasets)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-cyan-400" />
              Universal Multi-Agent Swarm Builder
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Synthesizing domain interfaces, confidential TEE microservices, and deployable source packages for: <strong className="text-cyan-300">{resolvedParams.user_name ? `${resolvedParams.user_name} (${currentTopic})` : currentTopic}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono text-xs hidden sm:block">
              <div className="text-slate-400">Swarm Compilation</div>
              <div className="text-cyan-400 font-bold">{progress}% Completed</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono font-bold shadow-lg shadow-cyan-500/10">
              {progress === 100 ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-scaleIn" />
              ) : (
                <span>{progress}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-slate-900 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
          <div 
            className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-150 shadow-sm shadow-cyan-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Terminal Logs Collapsible Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
        <div 
          onClick={() => setShowTerminalDetail(!showTerminalDetail)}
          className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition"
        >
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">Autonomous Swarm Terminal Execution Logs</span>
            <span className="text-[11px] text-cyan-400 font-normal">
              • Target: <strong className="text-white">{currentTopic}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                runSwarmSimulation();
              }}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition"
              title="Re-run Swarm Simulation"
            >
              Restart
            </button>
            <span>{showTerminalDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</span>
          </div>
        </div>

        {showTerminalDetail && (
          <div className="p-4 font-mono text-xs sm:text-sm space-y-2 max-h-[200px] overflow-y-auto scanlines bg-slate-950/90">
            <div className="text-slate-500 text-xs">
              [omni-swarm-kernel] Booting full-stack builder container in AMD SEV-SNP secure enclave...
            </div>
            <div className="text-emerald-400 text-xs">
              $ omniswarm synthesize --topic "{currentTopic}" --domain "{topicCategory}" --runtime edge-react-fastapi
            </div>

            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 animate-fadeIn">
                <span className="text-slate-500 text-[11px] shrink-0">[{log.timestamp}]</span>
                <span className={`font-bold shrink-0 ${log.color}`}>{log.agent}:</span>
                <span className="text-slate-200">{log.text}</span>
              </div>
            ))}

            {isBuilding && (
              <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                <span className="inline-block w-2 h-4 bg-cyan-400 animate-ping" />
                <span className="text-xs">Agents synthesizing full-stack layout and endpoints...</span>
              </div>
            )}

            <div ref={terminalEndRef} />
          </div>
        )}
      </div>

      {/* DUAL-VIEW TOGGLE SWITCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2 rounded-2xl bg-slate-900/90 border border-slate-800 gap-3 shadow-lg">
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveView('visual')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs font-bold transition-all ${
              activeView === 'visual'
                ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>🖥️ Visual Web Application Preview</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-slate-950 uppercase font-black">
              Live UI
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('backend')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs font-bold transition-all ${
              activeView === 'backend'
                ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>⚡ Deployed Backend API (JSON)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              :live
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1">
          <span className="text-slate-400">Synthesized Domain:</span>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase tracking-wider text-[11px]">
            {resolvedParams.project_type || topicCategory}
          </span>
        </div>
      </div>

      {/* VIEW A: Visual Web Application Preview */}
      {activeView === 'visual' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Universal Dynamic App Preview Component with Dynamic Binding */}
          <DynamicAppPreview 
            currentTopic={currentTopic} 
            activeVC={activeVC} 
          />
        </div>
      )}

      {/* VIEW B: Deployed Backend API (JSON) & Microservice View */}
      {activeView === 'backend' && (
        <div className="glass-panel-glow rounded-3xl p-6 border-emerald-500/40 animate-fadeIn space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center text-white">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  Live Microservice Deployed
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Active & Listening
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Synthesized microservice compiled into on-device confidential enclave for <span className="text-cyan-300 font-semibold">{resolvedParams.user_name || currentTopic}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition"
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showCode ? 'Hide Code' : 'View Generated Code (142 lines)'}</span>
              </button>
            </div>
          </div>

          {/* Microservice Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">Service Intent Topic</div>
              <div className="text-cyan-300 font-bold truncate mt-1">{currentTopic}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">Execution Latency</div>
              <div className="text-emerald-400 font-bold mt-1">1.4 milliseconds</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">Runtime Status</div>
              <div className="text-cyan-300 font-semibold mt-1">Active & Listening</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">Confidential Sandbox</div>
              <div className="text-slate-200 font-medium mt-1">AMD SEV-SNP Isolation</div>
            </div>
          </div>

          {/* Clickable Endpoint Bar */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3 overflow-hidden flex-1">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 uppercase font-bold shrink-0">
                POST
              </span>

              {/* Clickable Endpoint Link */}
              <button
                type="button"
                onClick={() => setShowResponseModal(true)}
                className="group text-left font-mono text-xs text-cyan-300 hover:text-white transition flex items-center gap-2 truncate"
                title="Click to open Live API Response Viewer"
              >
                <span className="underline decoration-cyan-500/40 group-hover:decoration-cyan-300 font-semibold truncate">
                  {endpointUrl}
                </span>
                <span className="shrink-0 text-[10px] font-sans px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 group-hover:bg-cyan-500 group-hover:text-slate-950 transition flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  <span>View Live API</span>
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyEndpoint}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition"
              >
                {copiedEndpoint ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestCurl}
                disabled={isTestingEndpoint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-mono text-cyan-300 transition"
              >
                <Play className="w-3 h-3 text-cyan-400" />
                <span>{isTestingEndpoint ? 'Sending...' : 'Test cURL'}</span>
              </button>
            </div>
          </div>

          {/* Simulated cURL Live Response */}
          {testResponse && (
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 font-mono text-xs text-cyan-300 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800 mb-2">
                <span className="text-emerald-400 font-bold">cURL Response [200 OK]</span>
                <span>Latency: {testResponse.response_time_ms}ms</span>
              </div>
              <pre className="text-[11px] leading-relaxed overflow-x-auto">
                {JSON.stringify(testResponse, null, 2)}
              </pre>
            </div>
          )}

          {/* Collapsible Microservice Source Code */}
          {showCode && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
              <div className="text-[11px] text-slate-500 pb-2 border-b border-slate-800 mb-3">
                # Synthesized Microservice (142 lines) - FastAPI / Sovereign Edge Enclave
              </div>
              <pre className="leading-relaxed whitespace-pre-wrap">{SAMPLE_MICROSERVICE_CODE}</pre>
            </div>
          )}
        </div>
      )}

      {/* REQUIREMENT 3: EXPORTABLE & DEPLOYABLE APPLICATION PACKAGE PANEL */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/40 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Full-Stack Package Ready (.ZIP)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              📥 Export Source Code & Deploy Live
            </h3>
            <p className="text-xs text-slate-300">
              Download the complete standalone React 19 + Tailwind + Vite + FastAPI microservice project tailored for <strong className="text-cyan-300">{resolvedParams.user_name || resolvedParams.title || currentTopic}</strong>.
            </p>
          </div>

          {/* Primary 1-Click Download Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDownloadZip}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{downloadedZipInfo ? `✓ Downloaded ${downloadedZipInfo.filename}` : 'Download Full Project (.ZIP)'}</span>
            </button>
          </div>
        </div>

        {/* Bundled Files Summary Pills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              Generated Project Files ({projectFiles.length} Files Included in ZIP):
            </span>
            <span className="text-[11px] text-cyan-400">Pure Client-Side Generator • Zero Backend Dependency</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs font-mono">
            {projectFiles.map(f => (
              <button
                key={f.path}
                type="button"
                onClick={() => setSelectedFilePreview(f.path)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  selectedFilePreview === f.path
                    ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold truncate text-[11px]">{f.path}</div>
                <div className="text-[10px] text-slate-500 truncate">
                  {f.path.endsWith('.jsx') ? 'React Component' : (f.path.endsWith('.py') ? 'FastAPI Microservice' : (f.path.endsWith('.json') ? 'Dependencies' : 'Config'))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* File Code Viewer Drawer */}
        {selectedFilePreview && (
          <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>File Preview: {selectedFilePreview}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const file = projectFiles.find(f => f.path === selectedFilePreview);
                  if (file) {
                    navigator.clipboard.writeText(file.content);
                    setCopiedCommand('file');
                    setTimeout(() => setCopiedCommand(null), 2000);
                  }
                }}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
              >
                {copiedCommand === 'file' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCommand === 'file' ? 'Copied' : 'Copy Content'}</span>
              </button>
            </div>
            <div className="p-4 max-h-56 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950/90 leading-relaxed">
              <pre className="whitespace-pre-wrap">
                {projectFiles.find(f => f.path === selectedFilePreview)?.content || 'Loading preview...'}
              </pre>
            </div>
          </div>
        )}

        {/* Step-by-Step Deployment Instructions */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-400" />
              Step-by-Step Deployment Instructions
            </h4>
            <div className="flex items-center gap-1 font-mono text-xs">
              {['vercel', 'netlify', 'localhost'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedDeployTab(tab)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider text-[11px] font-bold transition ${
                    selectedDeployTab === tab
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'vercel' ? '▲ Vercel' : (tab === 'netlify' ? '◆ Netlify' : '💻 Localhost:3000')}
                </button>
              ))}
            </div>
          </div>

          {/* Deployment Tab Content */}
          {selectedDeployTab === 'vercel' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-bold text-cyan-300">Deploy to Vercel (Zero-Configuration, Live in 30s)</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('npm install -g vercel && vercel');
                    setCopiedCommand('vercel');
                    setTimeout(() => setCopiedCommand(null), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                >
                  {copiedCommand === 'vercel' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCommand === 'vercel' ? 'Copied' : 'Copy Commands'}</span>
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>Extract the downloaded ZIP archive to your desired directory.</li>
                <li>Open your terminal inside the project directory and install dependencies: <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">npm install</code></li>
                <li>Deploy instantly with the Vercel CLI: <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">npx vercel</code></li>
                <li>Accept the automatic defaults. Vercel will build and output your production HTTPS URL immediately.</li>
              </ol>
            </div>
          )}

          {selectedDeployTab === 'netlify' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-bold text-emerald-300">Deploy to Netlify (Drag & Drop or CLI)</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('npm install && npm run build && npx netlify deploy --prod --dir=dist');
                    setCopiedCommand('netlify');
                    setTimeout(() => setCopiedCommand(null), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                >
                  {copiedCommand === 'netlify' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCommand === 'netlify' ? 'Copied' : 'Copy Commands'}</span>
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li>Build the production bundle: <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">npm run build</code></li>
                <li><strong>Option A (CLI):</strong> Run <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">npx netlify deploy --prod --dir=dist</code></li>
                <li><strong>Option B (Web Drop):</strong> Drag and drop your compiled <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded">dist/</code> folder into <span className="text-white underline">app.netlify.com/drop</span>.</li>
              </ol>
            </div>
          )}

          {selectedDeployTab === 'localhost' && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-bold text-amber-300">Run Locally on Localhost (Frontend Port 5173 / Backend Port 3000)</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('npm install && npm run dev');
                    setCopiedCommand('localhost');
                    setTimeout(() => setCopiedCommand(null), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                >
                  {copiedCommand === 'localhost' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCommand === 'localhost' ? 'Copied' : 'Copy Commands'}</span>
                </button>
              </div>
              <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-cyan-300 font-semibold mb-1">Terminal 1: Start React + Vite Frontend (Port 5173)</div>
                  <code className="text-slate-200">npm install && npm run dev</code>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-emerald-400 font-semibold mb-1">Terminal 2: Start FastAPI Microservice (Port 3000)</div>
                  <code className="text-slate-200">pip install fastapi uvicorn && python -m uvicorn backend.server:app --port 3000 --reload</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unified Pipeline Integration: Trigger Layer 3 below Visual Preview / Export */}
      <div className="glass-panel-glow rounded-3xl p-6 border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-300 font-mono flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Application synthesized & package ready. Proceed to Autonomous SOC Cyber Defense Check.</span>
        </div>

        <button
          type="button"
          onClick={onTriggerLayer3}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 hover:from-emerald-400 hover:to-cyan-400 shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>🛡️ Trigger Layer 3: Autonomous SOC Defense Check</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Live API Response Viewer Modal */}
      {showResponseModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowResponseModal(false)}
        >
          <div 
            className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden glass-panel-glow"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 border border-cyan-400/30">
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                    Live API Response Viewer
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      200 OK
                    </span>
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">
                    Sovereign Edge Loopback • Airgapped AMD SEV-SNP Enclave
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowResponseModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 truncate">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px]">
                    POST
                  </span>
                  <span className="text-cyan-300 truncate">{endpointUrl}</span>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  Latency: <strong className="text-emerald-400">1.4ms</strong>
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    Live Microservice JSON Response Payload:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyModalJson}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition"
                  >
                    {copiedModalJson ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl bg-slate-950 border border-cyan-500/30 p-4 font-mono text-xs overflow-x-auto text-cyan-300 max-h-72">
                  <pre className="leading-relaxed">
                    {JSON.stringify(liveApiResponse, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Status</span>
                  <span className="text-emerald-400 font-bold">200 OK</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 truncate">
                  <span className="text-slate-400 text-[10px] block">Topic</span>
                  <span className="text-cyan-300 font-semibold truncate block">{currentTopic}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Nodes</span>
                  <span className="text-white font-bold">3 Active Nodes</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Security</span>
                  <span className="text-emerald-400 font-bold">Zero Trust</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">ESC</kbd> or click outside to dismiss
              </span>

              <button
                type="button"
                onClick={() => setShowResponseModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
