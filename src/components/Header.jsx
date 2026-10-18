import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Radio, 
  Layers, 
  Activity, 
  Sparkles,
  Terminal, 
  RotateCcw,
  Info
} from 'lucide-react';

export default function Header({ 
  onOpenAuditDrawer, 
  onRestartChat,
  securityCertificate 
}) {
  const [showEnclaveDetails, setShowEnclaveDetails] = useState(false);

  return (
    <header className="border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Edge Status Bar */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-slate-950 to-cyan-950/80 border-b border-emerald-500/25 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Main System Status: Green Badge requested in Requirement 2 */}
          <div className="flex items-center gap-2 relative">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div 
              onClick={() => setShowEnclaveDetails(!showEnclaveDetails)}
              className="cursor-pointer hover:opacity-90 transition flex items-center gap-1.5 font-mono font-semibold tracking-wide text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30"
              title="Click to view enclave hardware security details"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>🔒 Protected by Sovereign Zero-Trust Engine</span>
            </div>

            {/* Enclave Details Popover */}
            {showEnclaveDetails && (
              <div className="absolute top-8 left-0 z-50 w-80 p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl font-mono text-[11px] text-slate-300 space-y-2 animate-fadeIn">
                <div className="font-bold text-emerald-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span>Silent Zero-Trust Security Kernel</span>
                  <span className="text-[10px] text-slate-400">ACTIVE</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hardware TEE:</span>
                    <span className="text-cyan-300 font-semibold">AMD SEV-SNP Enclave</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cloud Egress:</span>
                    <span className="text-emerald-400 font-semibold">0 Bytes (Airgapped)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Prompt Injection Screen:</span>
                    <span className="text-emerald-400 font-semibold">CLEAN (&lt;0.001 delta)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Layer 4 Settlement:</span>
                    <span className="text-cyan-300 font-semibold">Digital ShramSetu VC</span>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 text-center">
                  Click badge again to dismiss
                </div>
              </div>
            )}
          </div>

          {/* Real-time Enclave Telemetry Badges */}
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span className="text-slate-400">Enclave:</span>
              <span className="text-cyan-300 font-medium">AMD SEV-SNP TEE</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-400">Egress:</span>
              <span className="text-emerald-400 font-semibold">0 B (Airgapped)</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-slate-400">SLM:</span>
              <span className="text-amber-300 font-medium">AIKosh Sovereign-v2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-emerald-600 to-sky-500 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Project Omni-Swarm
                <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Vernacular Chatbot
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Vernacular Voice Edge Runtime • Autonomous Swarm • Silent Zero-Trust SOC • Digital ShramSetu
            </p>
          </div>
        </div>

        {/* Right Action Controls: Top-Right Audit Drawer Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onRestartChat && (
            <button
              onClick={onRestartChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition"
              title="Start a new chat session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          {/* Requirement 3: Top-right button labeled "⚙️ View System Logs & Security Audit" */}
          <button
            onClick={onOpenAuditDrawer}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/15 via-slate-900 to-emerald-500/15 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 hover:text-white font-mono text-xs font-bold shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all cursor-pointer group"
            title="Inspect 5-Layer Telemetry, JSON Payloads, and Cryptographic Certificates"
          >
            <span className="group-hover:rotate-45 transition-transform duration-300">⚙️</span>
            <span>View System Logs &amp; Security Audit</span>
            <span className="hidden md:inline-flex text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              5 Layers
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
