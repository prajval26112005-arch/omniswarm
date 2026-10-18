import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  Activity, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Cpu, 
  Zap, 
  FileCheck, 
  Award,
  Terminal,
  Clock,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  History
} from 'lucide-react';
import { 
  generateSecurityCertificate, 
  getStoredCertificates, 
  formatCertificateDate 
} from '../utils/vcCrypto';

export default function Layer3SOCDefense({ 
  activeVC, 
  currentTopic: propTopic, 
  securityCertificate: parentCert,
  onCertificateGenerated, 
  onExecuteLayer4 
}) {
  // Topic passed dynamically from Layer 1 / Layer 2
  const currentTopic = propTopic || activeVC?.topic || activeVC?.credentialSubject?.topic || activeVC?.credentialSubject?.raw_transcript || 'Agricultural Subsidy in Kannada';

  // Attack Simulation State
  const [simulationMode, setSimulationMode] = useState('safe'); // 'safe' | 'attack' | 'neutralized'
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Real-time Risk Checks State
  const [riskMetrics, setRiskMetrics] = useState({
    promptInjection: { status: 'PASSED', text: 'CLEAN / NO OVERRIDES DETECTED', delta: '< 0.001' },
    acousticLiveness: { status: 'PASSED', text: '99.4% VERIFIED HUMAN VOICE', score: '99.4%' },
    sessionToken: { status: 'VALID', text: 'VERIFIED (Zero Trust Identity)', hardware: 'AMD-SEV-SNP' }
  });

  // Active Security Certificate
  const [activeCert, setActiveCert] = useState(() => {
    if (parentCert) return parentCert;
    return generateSecurityCertificate({
      topic: currentTopic,
      promptText: activeVC?.credentialSubject?.raw_transcript || currentTopic
    });
  });

  // Certificate History Ledger
  const [historyLedger, setHistoryLedger] = useState(() => getStoredCertificates());
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCertId, setCopiedCertId] = useState(false);
  const [selectedLedgerCert, setSelectedLedgerCert] = useState(null);

  const [defenseLogs, setDefenseLogs] = useState([
    {
      time: '00:00:01',
      tag: 'KERNEL',
      msg: `Autonomous SOC Sentinel initialized for topic: '${currentTopic}'. Continuous spectral & semantic scanning engaged.`
    },
    {
      time: '00:00:02',
      tag: 'TEE',
      msg: 'AMD SEV-SNP memory encryption pages locked. Zero cloud leakage verified.'
    }
  ]);

  // Update active certificate whenever currentTopic or activeVC changes
  useEffect(() => {
    const cert = generateSecurityCertificate({
      topic: currentTopic,
      promptText: activeVC?.credentialSubject?.raw_transcript || currentTopic
    });
    setActiveCert(cert);
    if (onCertificateGenerated) {
      onCertificateGenerated(cert);
    }
    setHistoryLedger(getStoredCertificates());

    setDefenseLogs(prev => [
      {
        time: new Date().toISOString().substring(11, 19),
        tag: 'TOPIC_SYNC',
        msg: `Zero-Trust Defense Kernel synced to incoming topic: '${currentTopic}'. Cert ID: ${cert.id}`
      },
      ...prev
    ]);
  }, [currentTopic, activeVC?.vc_id]);

  // Handler for Safe Payload
  const handleInjectSafe = () => {
    setIsSimulating(true);
    setSimulationMode('safe');

    setTimeout(() => {
      setIsSimulating(false);
      const newTime = new Date().toISOString().substring(11, 19);

      setRiskMetrics({
        promptInjection: { status: 'PASSED', text: 'CLEAN / NO OVERRIDES DETECTED', delta: '< 0.001' },
        acousticLiveness: { status: 'PASSED', text: '99.4% VERIFIED HUMAN VOICE', score: '99.4%' },
        sessionToken: { status: 'VALID', text: 'VERIFIED (Zero Trust Identity)', hardware: 'AMD-SEV-SNP' }
      });

      const newCert = generateSecurityCertificate({
        topic: currentTopic,
        promptText: activeVC?.credentialSubject?.raw_transcript || currentTopic,
        statusOverrides: {
          promptInjection: 'PASSED',
          promptInjectionText: 'CLEAN / NO OVERRIDES DETECTED',
          livenessScore: '99.4%',
          livenessText: '99.4% VERIFIED HUMAN VOICE',
          sessionToken: 'VALID',
          sessionTokenText: 'VERIFIED (Zero Trust Identity)'
        }
      });

      setActiveCert(newCert);
      if (onCertificateGenerated) {
        onCertificateGenerated(newCert);
      }
      setHistoryLedger(getStoredCertificates());

      setDefenseLogs(prev => [
        {
          time: newTime,
          tag: 'VALIDATION',
          msg: `Safe payload evaluated for '${currentTopic}': Prompt Injection: CLEAN | Acoustic Liveness: 99.4% | Session Token: VALID.`
        },
        ...prev
      ]);
    }, 400);
  };

  // Handler for Malicious Deepfake / Prompt Attack
  const handleSimulateAttack = () => {
    setIsSimulating(true);
    setSimulationMode('attack');

    setRiskMetrics({
      promptInjection: { status: 'ALERT', text: 'MALICIOUS INJECTION OVERRIDE DETECTED', delta: '0.982' },
      acousticLiveness: { status: 'ALERT', text: 'SYNTHETIC AUDIO SPOOF (99.8%)', score: '0.2%' },
      sessionToken: { status: 'REVOKED', text: 'REVOKED & QUARANTINED (0.4ms)', hardware: 'LOCKED' }
    });

    const attackTime = new Date().toISOString().substring(11, 19);
    setDefenseLogs(prev => [
      {
        time: attackTime,
        tag: 'CRITICAL',
        msg: `⚠️ MALICIOUS PROMPT INJECTION & DEEPFAKE OVERRIDE DETECTED for '${currentTopic}'! Threat Vector: Audio Spectrogram Synthesis Attack (99.8% synthetic).`
      },
      ...prev
    ]);

    // Fast autonomous mitigation (0.4ms simulated)
    setTimeout(() => {
      const mitigationTime = new Date().toISOString().substring(11, 19);
      setDefenseLogs(prev => [
        {
          time: mitigationTime,
          tag: 'DEFENSE',
          msg: `Autonomous SOC Agent intervening... Session token revoked in 0.4ms... Applying hotfix code patch to API gateway... Threat neutralized for '${currentTopic}'.`
        },
        ...prev
      ]);

      setRiskMetrics({
        promptInjection: { status: 'PASSED', text: 'CLEAN / HOTFIX APPLIED & NO OVERRIDES', delta: '< 0.001' },
        acousticLiveness: { status: 'PASSED', text: '99.4% VERIFIED HUMAN VOICE', score: '99.4%' },
        sessionToken: { status: 'VALID', text: 'VERIFIED (Zero Trust Identity - Re-keyed)', hardware: 'AMD-SEV-SNP' }
      });

      const postMitigationCert = generateSecurityCertificate({
        topic: currentTopic,
        promptText: activeVC?.credentialSubject?.raw_transcript || currentTopic,
        statusOverrides: {
          promptInjection: 'PASSED',
          promptInjectionText: 'CLEAN / NO OVERRIDES DETECTED',
          livenessScore: '99.4%',
          livenessText: '99.4% VERIFIED HUMAN VOICE',
          sessionToken: 'VALID',
          sessionTokenText: 'VERIFIED (Zero Trust Identity)'
        }
      });

      setActiveCert(postMitigationCert);
      if (onCertificateGenerated) {
        onCertificateGenerated(postMitigationCert);
      }
      setHistoryLedger(getStoredCertificates());
      setSimulationMode('neutralized');
      setIsSimulating(false);
    }, 1200);
  };

  const handleCopyHash = () => {
    if (!activeCert?.sha256Hash) return;
    navigator.clipboard.writeText(activeCert.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyCertId = () => {
    if (!activeCert?.id) return;
    navigator.clipboard.writeText(activeCert.id);
    setCopiedCertId(true);
    setTimeout(() => setCopiedCertId(false), 2000);
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Layer Header */}
      <div className={`p-4 rounded-xl border transition-all duration-500 ${
        simulationMode === 'attack'
          ? 'glass-panel-red-alert border-rose-500/80 animate-pulse'
          : 'glass-panel-glow border-cyan-500/30'
      } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            simulationMode === 'attack'
              ? 'bg-rose-500/30 border-rose-400 text-rose-300'
              : 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300'
          }`}>
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Layer 3: Autonomous SOC Cyber Defense Kernel
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                simulationMode === 'attack'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
                {simulationMode === 'attack' ? 'INCIDENT IN PROGRESS' : '100% SECURE & OPERATIONAL'}
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Autonomous microsecond defensive response kernel. Mitigates prompt injection, voice deepfakes, and credential hijacking on-edge for <span className="text-cyan-300 font-semibold">{currentTopic}</span>.
            </p>
          </div>
        </div>

        {/* Real-time Heartbeat & Topic Tag */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5 shadow-sm">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Auditing Topic: <strong className="text-white">{currentTopic}</strong></span>
          </div>
        </div>
      </div>

      {/* Red Alert Banner when attack is simulated */}
      {simulationMode === 'attack' && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 border-2 border-rose-500 text-white shadow-2xl shadow-rose-600/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-rose-300 shrink-0" />
            <div>
              <h4 className="font-mono font-bold text-sm text-rose-100 tracking-wide uppercase">
                MALICIOUS PROMPT INJECTION & DEEPFAKE OVERRIDE DETECTED!
              </h4>
              <p className="text-xs text-rose-200 font-mono mt-0.5">
                Autonomous SOC Agent intervening... Session token revoked in 0.4ms... Applying hotfix code patch to API gateway... Threat neutralized.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-rose-500 text-white font-mono text-xs font-bold rounded-lg uppercase tracking-wider shrink-0">
            AUTO-DEFENSE ENGAGED
          </span>
        </div>
      )}

      {/* Neutralized Banner */}
      {simulationMode === 'neutralized' && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-mono font-bold text-sm text-emerald-300">
                THREAT NEUTRALIZED BY AUTONOMOUS SENTINEL
              </h4>
              <p className="text-xs text-emerald-400/80 font-mono">
                Malicious session quarantined in 0.4ms. Enclave gateway hotfix applied. System state restored and freshly signed audit certificate generated.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSimulationMode('safe')}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition shrink-0"
          >
            Dismiss Alert
          </button>
        </div>
      )}

      {/* Zero-Trust Threat Monitor Dashboard & Radar Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Visualizer Card */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border-cyan-500/20 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Spectral Radar Scanner
            </span>
            <span className="text-[11px] text-cyan-400">48 kHz PCM</span>
          </div>

          {/* Interactive Circular Radar */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-cyan-500/40 bg-slate-950 flex items-center justify-center my-3 shadow-inner shadow-cyan-950">
            {/* Concentric distance rings */}
            <div className="absolute w-36 h-36 rounded-full border border-cyan-500/25" />
            <div className="absolute w-24 h-24 rounded-full border border-cyan-500/25" />
            <div className="absolute w-12 h-12 rounded-full border border-cyan-500/30" />
            
            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-cyan-500/20" />
            <div className="absolute h-full w-[1px] bg-cyan-500/20" />

            {/* Rotating Radar Sweep Beam */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div 
                className="w-1/2 h-1/2 origin-bottom-right animate-radar"
                style={{
                  background: 'linear-gradient(45deg, rgba(6, 182, 212, 0.4) 0%, transparent 80%)'
                }}
              />
            </div>

            {/* Target Blips */}
            <div className="absolute top-12 left-16 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <div className="absolute bottom-14 right-14 w-2 h-2 rounded-full bg-emerald-400" />
            {simulationMode === 'attack' && (
              <div className="absolute top-14 right-12 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            )}

            <div className="z-10 font-mono text-[10px] text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
              ZERO-TRUST RADAR
            </div>
          </div>

          <div className="text-[11px] font-mono text-center text-slate-400 mt-1">
            Revolving sweep: 360° deepfake & semantic anomaly detection
          </div>
        </div>

        {/* Live Threat Metrics Cards */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-5 border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Zero-Trust Real-Time Risk Checks
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Evaluation Window: 100ms
              </span>
            </div>

            {/* 3 Metrics Cards (Requirement 3: Prompt Injection, Acoustic Liveness, Session Token) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {/* Metric 1: Prompt Injection Screen */}
              <div className={`p-4 rounded-xl border transition-all ${
                riskMetrics.promptInjection.status === 'ALERT'
                  ? 'bg-rose-950/40 border-rose-500/80 text-rose-300'
                  : 'bg-slate-900/80 border-emerald-500/30 text-slate-200'
              }`}>
                <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>Prompt Injection Screen</span>
                  <Zap className={`w-3.5 h-3.5 ${riskMetrics.promptInjection.status === 'ALERT' ? 'text-rose-400' : 'text-emerald-400'}`} />
                </div>
                <div className={`text-sm font-mono font-bold mt-2 ${
                  riskMetrics.promptInjection.status === 'ALERT' ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {riskMetrics.promptInjection.text}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Status: <strong className={riskMetrics.promptInjection.status === 'ALERT' ? 'text-rose-400' : 'text-emerald-300'}>
                    [{riskMetrics.promptInjection.status === 'ALERT' ? 'OVERRIDE FLAGGED' : 'PASSED'}]
                  </strong>
                </div>
              </div>

              {/* Metric 2: Acoustic Liveness Score */}
              <div className={`p-4 rounded-xl border transition-all ${
                riskMetrics.acousticLiveness.status === 'ALERT'
                  ? 'bg-rose-950/40 border-rose-500/80 text-rose-300'
                  : 'bg-slate-900/80 border-emerald-500/30 text-slate-200'
              }`}>
                <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>Acoustic Liveness Score</span>
                  <Activity className={`w-3.5 h-3.5 ${riskMetrics.acousticLiveness.status === 'ALERT' ? 'text-rose-400' : 'text-emerald-400'}`} />
                </div>
                <div className={`text-sm font-mono font-bold mt-2 ${
                  riskMetrics.acousticLiveness.status === 'ALERT' ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {riskMetrics.acousticLiveness.text}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Status: <strong className={riskMetrics.acousticLiveness.status === 'ALERT' ? 'text-rose-400' : 'text-emerald-300'}>
                    [{riskMetrics.acousticLiveness.status === 'ALERT' ? 'FAILED' : '99.4%'}]
                  </strong>
                </div>
              </div>

              {/* Metric 3: Session Token Status */}
              <div className={`p-4 rounded-xl border transition-all ${
                riskMetrics.sessionToken.status === 'REVOKED'
                  ? 'bg-amber-950/40 border-amber-500/80 text-amber-300'
                  : 'bg-slate-900/80 border-emerald-500/30 text-slate-200'
              }`}>
                <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>Session Token Status</span>
                  <Lock className={`w-3.5 h-3.5 ${riskMetrics.sessionToken.status === 'REVOKED' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>
                <div className={`text-sm font-mono font-bold mt-2 ${
                  riskMetrics.sessionToken.status === 'REVOKED' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {riskMetrics.sessionToken.text}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Status: <strong className={riskMetrics.sessionToken.status === 'REVOKED' ? 'text-amber-400' : 'text-emerald-300'}>
                    [{riskMetrics.sessionToken.status === 'REVOKED' ? 'REVOKED' : 'VALID'}]
                  </strong>
                </div>
              </div>
            </div>

            {/* Defense Audit Log Window */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/90 font-mono text-xs">
              <div className="text-[11px] text-slate-400 pb-1.5 border-b border-slate-800/80 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-cyan-400" />
                  Autonomous SOC Defense Live Kernel Stream
                </span>
                <span className="text-[10px] text-slate-500">Auto-Remediation Active</span>
              </div>
              <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                {defenseLogs.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    <span className="text-slate-500">[{item.time}]</span>
                    <span className={`px-1 rounded text-[10px] font-bold ${
                      item.tag === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : (item.tag === 'DEFENSE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-300')
                    }`}>
                      {item.tag}
                    </span>
                    <span className={item.tag === 'CRITICAL' ? 'text-rose-200' : (item.tag === 'DEFENSE' ? 'text-emerald-300' : 'text-slate-300')}>
                      {item.msg}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Attack Vector Simulation Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-mono text-slate-400">
              Interactive Attack Vector Simulation:
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleInjectSafe}
                disabled={isSimulating}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-semibold transition"
              >
                <span>🧪 Inject Safe Payload</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateAttack}
                disabled={isSimulating}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-mono text-xs font-semibold transition hover:scale-[1.02] shadow-lg shadow-rose-500/20"
              >
                <span>⚠️ Simulate Deepfake / Prompt Attack</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Requirement 3: Official CRITICAL SECURITY AUDIT CERTIFICATE Card */}
      {activeCert && (
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/50 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 relative overflow-hidden shadow-2xl animate-fadeIn">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Header & Status Stamp */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-emerald-500/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 border border-emerald-400/40 shrink-0">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wider">
                    Official Verification Card
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Sovereign Edge Standard v2.4
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-mono font-extrabold text-white tracking-wide uppercase mt-1">
                  CRITICAL SECURITY AUDIT CERTIFICATE
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Autonomous Zero-Trust Hardware Attestation issued for <strong className="text-cyan-300">{activeCert.topic}</strong>
                </p>
              </div>
            </div>

            {/* Official Cryptographic Status Stamp */}
            <div className="flex flex-col items-start lg:items-end">
              <div className="px-4 py-2.5 rounded-xl border-2 border-emerald-400/80 bg-emerald-950/80 text-emerald-300 font-mono text-xs sm:text-sm font-black tracking-widest uppercase shadow-xl shadow-emerald-500/20 border-dashed transform lg:rotate-[-2deg] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{activeCert.statusStamp}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1.5 flex items-center gap-2">
                <span>Hardware Attestation:</span>
                <span className="text-cyan-300 font-semibold">{activeCert.enclaveAttestation}</span>
              </div>
            </div>
          </div>

          {/* Certificate Metadata Grid: ID, Topic, Date & Time */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Field 1: Certificate ID */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner flex flex-col justify-between">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                Certificate ID
              </div>
              <div className="flex items-center justify-between gap-2 mt-1.5">
                <span className="text-cyan-300 font-extrabold text-sm sm:text-base tracking-wide">
                  {activeCert.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCertId}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 flex items-center gap-1 transition"
                  title="Copy Certificate ID"
                >
                  {copiedCertId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCertId ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Field 2: Topic / Intent Title */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner flex flex-col justify-between">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                Topic / Intent Title
              </div>
              <div className="text-white font-bold text-sm sm:text-base mt-1.5 truncate" title={activeCert.topic}>
                {activeCert.topic}
              </div>
            </div>

            {/* Field 3: Exact Date & Time */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner flex flex-col justify-between">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold flex items-center justify-between">
                <span>Exact Date & Time</span>
                <Clock className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-emerald-400 font-bold text-xs sm:text-sm mt-1.5">
                {activeCert.timestamp}
              </div>
            </div>
          </div>

          {/* Security Status Badges Row */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Security Status Badges</span>
              <span className="text-emerald-400 text-[10px]">Zero-Trust Enforcement: 100%</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
                <span className="text-slate-300">Prompt Injection</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">
                  [{activeCert.promptInjection}: {activeCert.promptInjection}]
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
                <span className="text-slate-300">Acoustic Liveness</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">
                  [Liveness: {activeCert.livenessScore}]
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
                <span className="text-slate-300">Session Token</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs">
                  [Session Token: {activeCert.sessionToken}]
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic Signature: SHA-256 Hash Bar */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="overflow-hidden flex-1">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cryptographic Signature (SHA-256 Hash):</span>
              </div>
              <div className="text-cyan-300 font-bold text-xs sm:text-sm mt-1 truncate select-all">
                {activeCert.sha256Hash}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyHash}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition shrink-0 border border-slate-700 hover:border-cyan-400"
            >
              {copiedHash ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Hash</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Hash</span>
                </>
              )}
            </button>
          </div>

          {/* Execute Layer 4 Trigger Button */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-emerald-500/20">
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Audit certificate generated and verified. Ready for Sovereign Digital ShramSetu Settlement.</span>
            </div>

            <button
              type="button"
              onClick={() => onExecuteLayer4 && onExecuteLayer4(activeCert)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 hover:from-emerald-400 hover:to-cyan-400 shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>📜 Execute Layer 4: Final Governance Wallet Settlement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Requirement 4: Collapsible Security Certificate History Ledger */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {/* Collapsible Header */}
        <div 
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">📜</span>
            <div>
              <h4 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                Security Certificate History Ledger
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {historyLedger.length} Records Logged
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Audit trail of all cryptographically signed security certificates issued during this session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1 rounded bg-slate-900 border border-slate-800"
            >
              <span>{isHistoryExpanded ? 'Collapse Ledger' : 'Expand Ledger'}</span>
              {isHistoryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Ledger Table Content */}
        {isHistoryExpanded && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Cert ID</th>
                  <th className="py-2.5 px-3">Topic / Intent</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Security Status Badges</th>
                  <th className="py-2.5 px-3">SHA-256 Hash</th>
                  <th className="py-2.5 px-3">Status Stamp</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {historyLedger.map((cert, index) => {
                  const isCurrent = cert.id === activeCert?.id;
                  return (
                    <tr 
                      key={cert.id || index}
                      className={`hover:bg-slate-900/50 transition-colors ${isCurrent ? 'bg-cyan-950/20' : ''}`}
                    >
                      <td className="py-3 px-3 font-bold text-cyan-300 flex items-center gap-1.5">
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                        <span>{cert.id}</span>
                      </td>

                      <td className="py-3 px-3 max-w-[200px] truncate font-semibold text-white" title={cert.topic}>
                        {cert.topic}
                      </td>

                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                        {cert.timestamp}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Inj: {cert.promptInjection}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Live: {cert.livenessScore}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Token: {cert.sessionToken}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px] max-w-[140px] truncate" title={cert.sha256Hash}>
                        {cert.sha256Hash ? `${cert.sha256Hash.substring(0, 10)}...${cert.sha256Hash.substring(cert.sha256Hash.length - 8)}` : '0x7f8a93...'}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                          AUTHORIZED
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCert(cert);
                            if (onCertificateGenerated) onCertificateGenerated(cert);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-[11px] font-semibold transition"
                        >
                          View Audit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
