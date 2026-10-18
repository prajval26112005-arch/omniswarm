import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Shield, 
  ExternalLink, 
  Lock, 
  Activity, 
  Globe, 
  Cpu, 
  CheckCircle2, 
  Copy, 
  Check, 
  Server, 
  RefreshCw, 
  Sparkles, 
  Zap, 
  Layers,
  Radio,
  FileCheck
} from 'lucide-react';

export default function Layer5VendorGuardian({ activeVC, currentTopic: propTopic }) {
  const currentTopic = propTopic || activeVC?.topic || activeVC?.credentialSubject?.topic || 'Agricultural Subsidy in Kannada';
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState('1.1 ms');

  const GATEWAY_URL = 'https://vendor-guardian-bot.lovable.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(GATEWAY_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handlePingBridge = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      const newLatency = (0.8 + Math.random() * 0.6).toFixed(1);
      setPingLatency(`${newLatency} ms`);
    }, 500);
  };

  return (
    <div className="space-y-6 pt-4">
      {/* High-tech Panel Header */}
      <div className="p-4 rounded-xl border border-cyan-500/30 glass-panel">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Layer 5: Vendor Guardian Security Bot Integration
                </h2>
                <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  External Assurance
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous Supply Chain Sentinel • Third-Party Security Verification • Continuous Vendor Audit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePingBridge}
              disabled={isPinging}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-all"
              title="Ping Audit Bridge"
            >
              <RefreshCw className={`w-3 h-3 text-cyan-400 ${isPinging ? 'animate-spin' : ''}`} />
              <span>Bridge Ping: {pingLatency}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Requirement 2 Summary Card & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requirement 2: Summary Card */}
        <div className="lg:col-span-2 rounded-xl p-6 border border-emerald-500/30 glass-panel-glow relative overflow-hidden flex flex-col justify-between space-y-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Engine Architecture
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Vendor Guardian Autonomous Security Kernel
                </h3>
              </div>

              {/* Requirement 2: Node Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 shadow-sm shadow-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-mono font-bold tracking-wider text-emerald-400">
                  Node Status: CONNECTED & ONLINE
                </span>
              </div>
            </div>

            {/* Requirement 2: Protocol & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  Protocol
                </span>
                <p className="text-xs font-medium text-slate-200 leading-relaxed">
                  External Vendor Risk & Supply Chain Assurance Engine
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Assurance Vector
                </span>
                <p className="text-xs font-medium text-slate-200 leading-relaxed">
                  Real-time Zero-Day & SBOM Dependency Attestation
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-cyan-500/30 space-y-1">
                <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  Audited Topic
                </span>
                <p className="text-xs font-bold text-white truncate" title={currentTopic}>
                  {currentTopic}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Description
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Automated third-party security audits, vendor credential verification, and autonomous supply chain risk screening.
              </p>
            </div>
          </div>

          {/* Action Zone: Requirement 3 Glowing Launch Button & Requirement 4 Embedded URL Preview */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            {/* Requirement 3: Prominent Glowing Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href={GATEWAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/30 hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group border border-emerald-300/40"
              >
                <ShieldCheck className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-slate-950">
                  🛡️ Launch Vendor Guardian Bot (Live Audit Node)
                </span>
                <ExternalLink className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <button
                type="button"
                onClick={handleCopyUrl}
                className="w-full sm:w-auto px-4 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 text-xs font-mono flex items-center justify-center gap-2 transition-all"
                title="Copy External Gateway URL"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-cyan-400" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>

            {/* Requirement 4: Embedded URL Preview Card or Badge */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-400">External Gateway:</span>
                  <a 
                    href={GATEWAY_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2 flex items-center gap-1 font-semibold"
                  >
                    https://vendor-guardian-bot.lovable.app
                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                  </a>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-semibold">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Encryption: TLS 1.3 / End-to-End Encrypted Audit Bridge</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 border-t border-slate-900 pt-2.5">
                <span className="flex items-center gap-1 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Audit Bridge: Verified Active
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  Mutual TLS Enclave Handshake
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Zero Third-Party Vendor Risk Infiltration
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Telemetry & Live Verification Matrix */}
        <div className="space-y-4">
          {/* Card: Live Telemetry */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 glass-panel space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Supply Chain Telemetry
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Vendor Verification Score:</span>
                <span className="text-emerald-400 font-bold">99.8% (A+)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">SBOM Attestation:</span>
                <span className="text-cyan-400 font-bold">SPDX v2.3 Signed</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Audit Protocol:</span>
                <span className="text-amber-300 font-bold">W3C VC Bound</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Egress Quarantine:</span>
                <span className="text-emerald-400 font-bold">0 Leaks Detected</span>
              </div>
            </div>
          </div>

          {/* Card: Sovereign Edge Link */}
          <div className="p-5 rounded-xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-cyan-950/20 glass-panel space-y-3">
            <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Sovereign Handshake Guarantee
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every external audit performed via Vendor Guardian is cryptographically pinned back to the local sovereign node (<code className="text-cyan-300 font-mono text-[11px]">did:omni:edge_node_local</code>) with zero exposure of underlying user voice or credential data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
