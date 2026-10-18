import React, { useState, useRef, useEffect } from 'react';
import { 
  FileCheck, 
  PenTool, 
  Award, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  Wallet, 
  QrCode, 
  ExternalLink,
  RotateCcw,
  Sparkles,
  Lock,
  Radio,
  Terminal,
  ShieldAlert
} from 'lucide-react';
import { 
  generateShramSetuSettlementVC, 
  getStoredSettlements, 
  formatCertificateDate 
} from '../utils/vcCrypto';

export default function Layer4GovernanceSettlement({ 
  activeVC, 
  currentTopic: propTopic, 
  securityCertificate, 
  onRestartSession, 
  onTriggerLayer5 
}) {
  const [hasSigned, setHasSigned] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [settledVC, setSettledVC] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  // Dynamic topic passed from prior layers
  const currentTopic = propTopic || securityCertificate?.topic || activeVC?.topic || activeVC?.credentialSubject?.topic || activeVC?.credentialSubject?.raw_transcript || 'Agricultural Subsidy in Kannada';

  // Signature canvas
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHasDrawing, setCanvasHasDrawing] = useState(false);

  // Canvas drawing handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setCanvasHasDrawing(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasHasDrawing(false);
  };

  const handleBiometricAutoSign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw stylish sovereign seal signature path
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.moveTo(30, 70);
    ctx.bezierCurveTo(70, 20, 110, 110, 150, 45);
    ctx.bezierCurveTo(190, 10, 230, 95, 280, 50);
    ctx.stroke();

    // Secondary flourish
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.8;
    ctx.moveTo(50, 85);
    ctx.lineTo(260, 85);
    ctx.stroke();

    setCanvasHasDrawing(true);
  };

  // Requirement 5: Authorize & Cryptographically Sign Settlement, wiring Security Certificate into Wallet
  const handleAuthorizeSettlement = () => {
    setIsSigning(true);

    setTimeout(() => {
      const generated = generateShramSetuSettlementVC({
        layer1VC: activeVC,
        serviceEndpoint: 'https://api.omniswarm.internal/v1/service/live',
        socStatus: 'VERIFIED_100_SECURE',
        securityCertificate: securityCertificate || {
          id: 'CERT-OMNI-2026-X992',
          topic: currentTopic,
          promptInjection: 'PASSED',
          livenessScore: '99.4%',
          sessionToken: 'VALID',
          sha256Hash: '0x7f8a93e82b1c4d9a5e2f0714b6c8d3e91a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
          statusStamp: 'CRYPTOGRAPHICALLY SIGNED & AUTHORIZED',
          timestamp: formatCertificateDate(new Date())
        },
        topic: currentTopic
      });

      setSettledVC(generated);
      setHasSigned(true);
      setIsSigning(false);
    }, 800);
  };

  const handleCopyHash = () => {
    if (!settledVC) return;
    navigator.clipboard.writeText(settledVC.cryptographicHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadVC = () => {
    if (!settledVC) return;
    const blob = new Blob([JSON.stringify(settledVC, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-shramsetu-${settledVC.vc_id.replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Layer Header */}
      <div className="p-4 rounded-xl glass-panel-glow border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-400/30 text-cyan-300">
            <FileCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Layer 4: Verifiable Credential Wallet & Executive Governance Settlement
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Digital ShramSetu Spec
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              National Sovereign Governance Master Sign-Off: Issues immutable, tamper-proof W3C credential sealing audit record for <span className="text-cyan-300 font-semibold">{currentTopic}</span> into user edge wallet.
            </p>
          </div>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <span className={`w-2.5 h-2.5 rounded-full ${hasSigned ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
          <span>{hasSigned ? 'SETTLED & IMMUTABLE' : 'Awaiting Master Key Authorization'}</span>
        </div>
      </div>

      {/* Executive Master Sign-Off Component */}
      {!hasSigned ? (
        <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-cyan-400" />
                Sovereign Master Key Authorization
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulating executive/national leadership digital signature pad to seal the microservice deployment, fund allocation, and Layer 3 Security Certificate for <strong className="text-white">{currentTopic}</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBiometricAutoSign}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-mono text-cyan-300 transition"
              >
                1-Click Biometric Sign
              </button>
              <button
                type="button"
                onClick={handleClearSignature}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Connected Audit Certificate Notice */}
          <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Attached Layer 3 Certificate: <strong className="text-cyan-300">{securityCertificate?.id || 'CERT-OMNI-2026-X992'}</strong></span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              VERIFIED READY
            </span>
          </div>

          {/* Interactive HTML5 Signature Pad */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xl h-36 bg-slate-950 rounded-xl border border-dashed border-cyan-500/40 relative overflow-hidden flex items-center justify-center cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={560}
                height={144}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full block"
              />
              {!canvasHasDrawing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-600 font-mono text-xs">
                  Draw signature with cursor/touch or click "1-Click Biometric Sign" above
                </div>
              )}
            </div>

            <div className="w-full max-w-xl flex items-center justify-between mt-2 text-[11px] font-mono text-slate-400">
              <span>Authority: <strong className="text-cyan-400">National Sovereign Controller</strong></span>
              <span>Key: <strong className="text-slate-300">Ed25519-TEE-0x992B</strong></span>
            </div>
          </div>

          {/* Prominent Authorize Button */}
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={handleAuthorizeSettlement}
              disabled={isSigning}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 text-slate-950 hover:from-cyan-400 hover:to-emerald-400 shadow-xl shadow-cyan-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSigning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Signing & Anchoring Ledger...</span>
                </>
              ) : (
                <>
                  <span>✍️ Authorize & Cryptographically Sign Settlement</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Final Settled Digital Wallet Receipt Card */
        <div className="space-y-6">
          <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 border-emerald-500/50 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white font-mono">
                      Digital Wallet Receipt Card
                    </h3>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      SETTLED & IMMUTABLE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Final W3C Verifiable Credential based on Digital ShramSetu specification for <strong className="text-cyan-300">{currentTopic}</strong>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadVC}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-mono text-emerald-300 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download VC</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition"
                >
                  <span>{showRawJson ? 'Hide JSON' : 'View JSON'}</span>
                </button>
              </div>
            </div>

            {/* Credential Specification Grid */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Status</div>
                <div className="text-emerald-400 font-bold mt-1 text-sm">{settledVC.status}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Issuer</div>
                <div className="text-slate-200 font-semibold truncate mt-1">{settledVC.issuer}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Holder Wallet</div>
                <div className="text-cyan-300 font-semibold truncate mt-1">{settledVC.holderWallet}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Standard Spec</div>
                <div className="text-amber-300 font-medium truncate mt-1">Digital ShramSetu v2.4</div>
              </div>
            </div>

            {/* Attached Sealed Security Audit Certificate (Requirement 5) */}
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/40 font-mono text-xs shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-bold uppercase tracking-wider text-xs">
                    Sealed Security Audit Certificate Attachment
                  </span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  {settledVC.governanceRecord?.security_certificate?.status_stamp || 'CRYPTOGRAPHICALLY SIGNED & AUTHORIZED'}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase">Certificate ID</span>
                  <span className="text-cyan-300 font-bold">{settledVC.governanceRecord?.security_certificate?.certificate_id || 'CERT-OMNI-2026-X992'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 truncate">
                  <span className="text-slate-400 text-[10px] block uppercase">Topic / Intent</span>
                  <span className="text-white font-semibold truncate block">{settledVC.governanceRecord?.topic || currentTopic}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase">Audit Timestamp</span>
                  <span className="text-emerald-400">{settledVC.governanceRecord?.security_certificate?.certified_timestamp || formatCertificateDate(new Date())}</span>
                </div>
              </div>

              <div className="mt-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-2">
                <div className="flex items-center gap-2 truncate text-slate-300 overflow-hidden">
                  <span className="text-slate-400 shrink-0">SHA-256 Hash:</span>
                  <span className="text-emerald-400 font-mono truncate">{settledVC.governanceRecord?.security_certificate?.cryptographic_signature || '0x7f8a93...'}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    INJECTION: PASSED
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    LIVENESS: 99.4%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                    TOKEN: VALID
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Hash Bar */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="overflow-hidden">
                <div className="text-[10px] uppercase text-slate-400">Governance Master Hash (SHA-256):</div>
                <div className="text-emerald-400 font-bold truncate mt-0.5">
                  {settledVC.cryptographicHash}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyHash}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition shrink-0"
              >
                {copiedHash ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Hash</span>
                  </>
                )}
              </button>
            </div>

            {/* Visual Tamper-Proof Seal Card */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-cyan-950/40 border border-emerald-500/30 flex items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-900/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <QrCode className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-white font-bold">On-Device Local Storage Ledger Updated</div>
                  <div className="text-[11px] text-slate-400">Key: <code className="text-cyan-300">omni_settled_credentials</code></div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider hidden sm:block">
                VERIFIED IMMUTABLE
              </span>
            </div>

            {/* Collapsible Raw JSON */}
            {showRawJson && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                <pre className="leading-relaxed">{JSON.stringify(settledVC, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* End-to-End System Summary Matrix (Full 5-Layer Journey) */}
          <div className="glass-panel rounded-2xl p-6 border-slate-800">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-mono font-bold text-white">
                End-to-End System Summary Matrix (Full 5-Layer Journey)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 font-mono text-xs">
              {/* Layer 1 Summary */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">Layer 1</span>
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="font-bold text-white">Vernacular Voice Intent</div>
                <p className="text-[11px] text-slate-300 truncate" title={currentTopic}>
                  Topic: {currentTopic}
                </p>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-slate-800">
                  Status: 100% On-Device
                </div>
              </div>

              {/* Layer 2 Summary */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">Layer 2</span>
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="font-bold text-white">Multi-Agent CLI Swarm</div>
                <p className="text-[11px] text-slate-300">
                  Queried AIKosh and deployed microservice on edge loopback.
                </p>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-slate-800">
                  Endpoint: /v1/service/live
                </div>
              </div>

              {/* Layer 3 Summary */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">Layer 3</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="font-bold text-white">Autonomous SOC Defense</div>
                <p className="text-[11px] text-slate-300">
                  Zero Trust & Deepfake verified. Issued Security Audit Cert.
                </p>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-slate-800">
                  Cert: {securityCertificate?.id || 'CERT-OMNI-2026-X992'}
                </div>
              </div>

              {/* Layer 4 Summary */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Layer 4</span>
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="font-bold text-white">Cryptographic Settlement</div>
                <p className="text-[11px] text-slate-300">
                  Digital ShramSetu Wallet updated with immutable sovereign master key signature.
                </p>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-slate-800">
                  Status: SETTLED & IMMUTABLE
                </div>
              </div>

              {/* Layer 5 Summary */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-teal-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-teal-400 font-bold uppercase">Layer 5</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="font-bold text-white">Vendor Guardian</div>
                <p className="text-[11px] text-slate-300">
                  Autonomous external vendor risk & supply chain assurance node connected via TLS 1.3.
                </p>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-slate-800">
                  Status: CONNECTED & ONLINE
                </div>
              </div>
            </div>

            {/* Actions: Proceed to Layer 5 & Restart Button */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-center gap-4">
              {onTriggerLayer5 && (
                <button
                  type="button"
                  onClick={onTriggerLayer5}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 border border-emerald-400/40"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>🛡️ Proceed to Layer 5: Vendor Guardian Security Engine</span>
                </button>
              )}
              <button
                type="button"
                onClick={onRestartSession}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-cyan-400 shadow-lg transition-all hover:scale-105"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>🔄 Start New Voice Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
