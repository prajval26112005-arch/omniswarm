/**
 * Layer 5: Vendor Guardian SBOM & Supply Chain Vulnerability Scanner
 * Clean white/soft-gray UI with navy (#0B2A5B) text and teal (#0F766E) accents.
 * Queries real OSV.dev batch API, produces real CycloneDX SBOM JSON,
 * honest third-party risk disclosures, and real backend function health check for Vendor Guardian Bot.
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  FileCode,
  Upload,
  Download,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Radio,
  CheckCircle2,
  XCircle,
  FileText,
  Server,
  Layers,
  Info,
  Bot,
  Save,
  Check
} from 'lucide-react';
import { db, getActiveWorkflowId, getCurrentUserId } from '../lib/supabase';
import { SbomReport, SbomPackage } from '../types';
import {
  runVendorGuardianScan,
  checkVendorGuardianBackendStatus,
  generateCycloneDxSbom,
  getSavedVendorBotUrl,
  saveVendorBotUrl,
  DEFAULT_VENDOR_BOT_URL,
  VendorGuardianBackendResult
} from '../lib/sbomScanner';

// Default package.json for quick testing if user doesn't upload a custom file
const APP_DEFAULT_PACKAGE_JSON = JSON.stringify(
  {
    name: 'omni-swarm',
    version: '1.0.0',
    dependencies: {
      react: '18.2.0',
      'react-dom': '18.2.0',
      docx: '9.5.1',
      qrcode: '1.5.4',
      jszip: '3.10.1',
      '@noble/ed25519': '2.2.3',
      'lucide-react': '1.16.0',
      tailwindcss: '4.0.0'
    }
  },
  null,
  2
);

export default function Layer5VendorGuardian() {
  const activeWf = getActiveWorkflowId();

  // Reports state from DB
  const [reports, setReports] = useState<SbomReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SbomReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Scanning state
  const [scanning, setScanning] = useState(false);
  const [fileInputContent, setFileInputContent] = useState<string>(APP_DEFAULT_PACKAGE_JSON);
  const [filename, setFilename] = useState<string>('package.json');
  const [activeTab, setActiveTab] = useState<'scan' | 'bot' | 'risks'>('scan');

  // Vendor Guardian Bot State
  const [botUrl, setBotUrl] = useState<string>(() => getSavedVendorBotUrl());
  const [urlSavedFeedback, setUrlSavedFeedback] = useState<boolean>(false);
  const [checkingBotStatus, setCheckingBotStatus] = useState<boolean>(false);
  const [botStatusResult, setBotStatusResult] = useState<VendorGuardianBackendResult | null>(null);

  // Fetch reports from database
  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await db
        .from('sbom_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
      if (data && data.length > 0 && !selectedReport) {
        setSelectedReport(data[0]);
      }
    } catch (err) {
      console.error('Failed to load SBOM reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // Run an initial backend status check on load
    handleCheckBotStatus();
  }, [activeWf]);

  // Handle Save Bot URL to settings
  const handleSaveBotUrl = (newUrl: string) => {
    const val = newUrl.trim() || DEFAULT_VENDOR_BOT_URL;
    setBotUrl(val);
    saveVendorBotUrl(val);
    setUrlSavedFeedback(true);
    setTimeout(() => setUrlSavedFeedback(false), 2000);
  };

  // Handle Backend Status Check (calls Node.js backend function, not browser)
  const handleCheckBotStatus = async () => {
    setCheckingBotStatus(true);
    try {
      const result = await checkVendorGuardianBackendStatus(botUrl || DEFAULT_VENDOR_BOT_URL);
      setBotStatusResult(result);
    } catch (err: any) {
      setBotStatusResult({
        reachable: false,
        status: null,
        responseTimeMs: 0,
        reason: err.message || 'Backend function error',
        targetUrl: botUrl
      });
    } finally {
      setCheckingBotStatus(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFileInputContent(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  // Run Real Scan
  const handleRunScan = async () => {
    if (!fileInputContent.trim()) {
      alert('Please provide dependency file content (package.json or requirements.txt).');
      return;
    }

    setScanning(true);
    try {
      const newReport = await runVendorGuardianScan({
        filename,
        content: fileInputContent,
        workflowId: activeWf
      });

      setSelectedReport(newReport);
      await fetchReports();
      setActiveTab('scan');
    } catch (err: any) {
      console.error('Scan failed:', err);
      alert(`Scan error: ${err?.message || 'Check network connection'}`);
    } finally {
      setScanning(false);
    }
  };

  // Download CycloneDX JSON
  const handleDownloadSbomJson = (report: SbomReport) => {
    const jsonStr = JSON.stringify(report.sbom_json, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyclonedx-sbom-${report.filename.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Third-party risks catalog
  const thirdPartyRisks = [
    {
      service: 'OSV.dev Batch Vulnerability API',
      provider: 'Google Open Source Security / OpenSSF',
      endpoint: 'https://api.osv.dev/v1/querybatch',
      purpose: 'Vulnerability correlation for open source packages in real time.',
      dataSent: 'Package name (e.g. "docx") and semantic version string (e.g. "9.5.1"). Zero source code or PII transmitted.',
      retention: 'Public telemetry logs per Google Open Source privacy policy.'
    },
    {
      service: 'Web Speech API / Speech Recognition',
      provider: 'Browser Platform Vendor (e.g., Google Chrome, Apple WebKit)',
      endpoint: 'Browser IPC / WebkitSpeechRecognition',
      purpose: 'Vernacular spoken audio input transcription in Kannada, Hindi, Tamil, Telugu, and English.',
      dataSent: 'Audio stream from microphone. Note: Browser implementations (like Chrome) transmit audio to vendor cloud servers for inference.',
      retention: 'Subject to browser vendor privacy agreement; explicit privacy warning displayed on Layer 1 input.'
    },
    {
      service: 'LLM Edge Completion Provider',
      provider: 'Anthropic / OpenAI / Groq / Dedicated Edge Function',
      endpoint: 'api.anthropic.com or configured Supabase Edge Function',
      purpose: 'Vernacular intent interpretation, citizen scheme explanations, and multi-agent synthesis.',
      dataSent: 'Citizen question text AFTER client-side PII scrubbing (Aadhaar, PAN, phone numbers, and emails redacted).',
      retention: 'Configured by customer API key tier (zero-retention enterprise tier recommended).'
    },
    {
      service: 'Vendor Guardian Bot Integration',
      provider: 'Configured Bot Service',
      endpoint: botUrl || DEFAULT_VENDOR_BOT_URL,
      purpose: 'Autonomous third-party software supply chain audit bot.',
      dataSent: 'Backend server-side health probe only. No client credentials transmitted.',
      retention: 'Ephemeral.'
    },
    {
      service: 'Bharat Agent (Streamlit Runtime)',
      provider: 'Streamlit Cloud / Community Runtime',
      endpoint: 'https://bharat-agent-rcrg2kjhujukkroyfijmkb.streamlit.app/',
      purpose: 'External Indic conversational and multi-modal task assistant deployed on Streamlit Cloud.',
      dataSent: 'Direct interactions inside external iframe. Note: Not covered by OMNI-SWARM privacy redaction or injection guard.',
      retention: 'Subject to Streamlit Cloud hosting policy.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 text-[#0F766E] uppercase">
              Layer 5 Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">CycloneDX 1.4 • OSV.dev API • Vendor Guardian Bot</span>
          </div>
          <h2 className="text-xl font-bold text-[#0B2A5B] tracking-tight mt-1">
            Vendor Guardian SBOM & Vulnerability Scanner
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Real dependency vulnerability scanner querying the live OSV.dev batch database with zero hardcoded results.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'scan' ? 'bg-white text-[#0B2A5B] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vulnerability Scan
          </button>
          <button
            onClick={() => setActiveTab('bot')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'bot' ? 'bg-white text-[#0B2A5B] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vendor Guardian Bot
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'risks' ? 'bg-white text-[#0B2A5B] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Third-Party Risk
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VENDOR GUARDIAN BOT CARD (Prominently displayed in Layer 5)               */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover-card-lift space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B2A5B]">Vendor Guardian Bot</h3>
              <p className="text-[11px] text-slate-500">
                Automated security bot integration for software supply chain oversight.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 1. Always-enabled button "Open Vendor Guardian" */}
            <a
              href={botUrl || DEFAULT_VENDOR_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0c5f59] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
              title="Open Vendor Guardian in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Vendor Guardian</span>
            </a>

            {/* 2. "Check status" button that calls a backend function (not the browser) */}
            <button
              type="button"
              onClick={handleCheckBotStatus}
              disabled={checkingBotStatus}
              className="px-3.5 py-2 rounded-xl bg-[#0B2A5B] hover:bg-[#081e42] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition disabled:opacity-75 cursor-pointer active:scale-95"
              title="Request URL via backend function to measure real HTTP status"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${checkingBotStatus ? 'animate-spin' : ''}`} />
              <span>{checkingBotStatus ? 'Querying Backend...' : 'Check status'}</span>
            </button>
          </div>
        </div>

        {/* 3. Editable URL field saved in settings, defaulting to https://vendor-guardian-bot.lovable.app */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-700 uppercase">
              Target Bot Endpoint URL (Saved in Settings)
            </label>
            {urlSavedFeedback && (
              <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1 animate-fadeIn">
                <Check className="w-3 h-3 text-teal-600" /> Saved in settings
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={botUrl}
              onChange={(e) => setBotUrl(e.target.value)}
              onBlur={() => handleSaveBotUrl(botUrl)}
              placeholder="https://vendor-guardian-bot.lovable.app"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F766E] font-mono text-slate-800 bg-slate-50/50 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => handleSaveBotUrl(botUrl)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Status Display: Real HTTP status and response time, or "Unreachable" with reason */}
        {botStatusResult && (
          <div className="p-4 rounded-xl border text-xs space-y-2 bg-[#F8FAFC] border-slate-200 shadow-2xs animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#0B2A5B]" />
                <span className="font-semibold text-xs text-slate-800">
                  Backend Function Probe Result
                </span>
              </div>

              {botStatusResult.reachable ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  HTTP {botStatusResult.status} {botStatusResult.statusText || 'OK'}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Unreachable
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block uppercase font-semibold">
                  Response Time
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {botStatusResult.responseTimeMs} ms
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block uppercase font-semibold">
                  Probe Status Detail
                </span>
                <span className="text-slate-700 font-medium">
                  {botStatusResult.reachable
                    ? `Real HTTP status code ${botStatusResult.status} confirmed by Node.js backend function.`
                    : `Unreachable: ${botStatusResult.reason || 'Server did not respond'}`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Honest Disclosure */}
        <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong>Authentic Telemetry Disclosure:</strong> This probe executes via a server-side backend function (Node.js runtime, not browser-side) to evaluate true HTTP response headers without CORS blocking. Omni-Swarm does not claim TLS details or any audit result unless it comes from a real response.
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: Scan & Results                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'scan' && (
        <div className="space-y-6">
          {/* Input & Execution Box */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover-card-lift">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B2A5B]">Dependency File Input</h3>
                  <p className="text-[11px] text-slate-500">
                    Upload a real <code className="font-mono">package.json</code> or <code className="font-mono">requirements.txt</code>, or inspect the app's dependencies.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFileInputContent(APP_DEFAULT_PACKAGE_JSON);
                    setFilename('package.json');
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#0B2A5B] bg-slate-50 text-xs font-medium transition"
                >
                  Use App's Dependencies
                </button>

                <label className="px-3 py-1.5 rounded-lg border border-[#0F766E] text-[#0F766E] bg-teal-50/50 hover:bg-teal-50 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept=".json,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Target File: <code className="font-mono text-[#0B2A5B]">{filename}</code>
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  OSV Batch Query: https://api.osv.dev/v1/querybatch
                </span>
              </div>

              <textarea
                value={fileInputContent}
                onChange={(e) => setFileInputContent(e.target.value)}
                rows={6}
                className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0F766E] text-slate-800"
                placeholder="Paste JSON or requirements.txt content here..."
              />

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleRunScan}
                  disabled={scanning}
                  className="px-5 py-2.5 rounded-xl bg-[#0B2A5B] hover:bg-[#081e42] text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-teal-300" />
                      <span>Querying OSV.dev Database...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4 text-teal-400" />
                      <span>Run CycloneDX SBOM & Vulnerability Scan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Scan Results Display */}
          {selectedReport && (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0B2A5B]">
                      Scan Report: {selectedReport.filename}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedReport.vulnerabilities_count > 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedReport.vulnerabilities_count > 0
                        ? `${selectedReport.vulnerabilities_count} Vulnerabilities Found`
                        : 'Clean / Zero Known Vulnerabilities'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Report ID: {selectedReport.id} • Scanned at: {new Date(selectedReport.created_at).toLocaleString('en-IN')}
                  </p>
                </div>

                <button
                  onClick={() => handleDownloadSbomJson(selectedReport)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-[#0B2A5B] flex items-center gap-1.5 shadow-2xs transition"
                >
                  <Download className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Download CycloneDX JSON</span>
                </button>
              </div>

              {/* Package & Vulnerability Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-semibold text-slate-600">
                      <th className="py-2.5 px-3">Package</th>
                      <th className="py-2.5 px-3">Ecosystem</th>
                      <th className="py-2.5 px-3">Version</th>
                      <th className="py-2.5 px-3">Known Vulnerability IDs</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Fixed In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReport.packages_json.map((pkg, idx) => {
                      const hasVulns = pkg.vulnerabilities && pkg.vulnerabilities.length > 0;

                      return (
                        <tr
                          key={`${pkg.name}-${idx}`}
                          className={`hover:bg-slate-50 transition ${
                            hasVulns ? 'bg-rose-50/20' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-semibold text-[#0B2A5B]">
                            {pkg.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                            {pkg.type}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">
                            {pkg.version}
                          </td>
                          <td className="py-2.5 px-3">
                            {hasVulns ? (
                              <div className="space-y-1">
                                {pkg.vulnerabilities.map((v) => (
                                  <a
                                    key={v.id}
                                    href={`https://osv.dev/vulnerability/${v.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block text-[#0F766E] hover:underline font-mono text-[11px]"
                                    title={v.summary}
                                  >
                                    {v.id}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> None
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {hasVulns ? (
                              <div className="space-y-1">
                                {pkg.vulnerabilities.map((v, vIdx) => (
                                  <span
                                    key={vIdx}
                                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      v.severity === 'CRITICAL' || v.severity === 'HIGH'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {v.severity}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                            {hasVulns ? (
                              <div className="space-y-1">
                                {pkg.vulnerabilities.map((v, vIdx) => (
                                  <div key={vIdx}>{v.fixed_version}</div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Past Reports List */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-[#0B2A5B] mb-1">
              Historical SBOM Reports in Database
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Stored in the <code className="font-mono">sbom_reports</code> table with full CycloneDX JSON.
            </p>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No SBOM scans recorded yet. Run a scan above to generate one.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className={`py-3 px-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-50 transition text-xs ${
                      selectedReport?.id === r.id ? 'bg-teal-50/50 border border-teal-200' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0B2A5B]">{r.filename}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            r.vulnerabilities_count > 0
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {r.vulnerabilities_count} Vulns
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {r.total_packages} packages • {new Date(r.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSbomJson(r);
                      }}
                      className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>JSON</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Vendor Guardian Bot Dedicated View                                 */}
      {/* ========================================================================= */}
      {activeTab === 'bot' && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0B2A5B]">Vendor Guardian Bot Diagnostics</h3>
              <p className="text-xs text-slate-500">
                Live status and endpoint management for external bot integration.
              </p>
            </div>
            <a
              href={botUrl || DEFAULT_VENDOR_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#0c5f59] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch Bot in New Tab</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Configured Bot URL</span>
              <span className="font-mono text-slate-800 break-all">{botUrl}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Probe Type</span>
              <span className="font-medium text-slate-800">Node.js Server Backend Function</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Real Status</span>
              <span className="font-semibold text-[#0F766E]">
                {botStatusResult ? (botStatusResult.reachable ? `HTTP ${botStatusResult.status}` : 'Unreachable') : 'Pending Check'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: Third-Party Risk Catalog                                           */}
      {/* ========================================================================= */}
      {activeTab === 'risks' && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#0B2A5B]">
              Third-Party Service & Subprocessor Disclosures
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent accounting of every external API invoked by OMNI-SWARM, with precise data exposure boundaries.
            </p>
          </div>

          <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
            {thirdPartyRisks.map((risk, idx) => (
              <div key={idx} className="py-4 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="font-bold text-[#0B2A5B] text-sm">
                    {risk.service}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Provider: {risk.provider}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="block font-semibold text-slate-700 text-[11px] uppercase">
                      Endpoint Called
                    </span>
                    <code className="text-[11px] font-mono text-[#0F766E] break-all">
                      {risk.endpoint}
                    </code>
                  </div>

                  <div className="md:col-span-2">
                    <span className="block font-semibold text-slate-700 text-[11px] uppercase">
                      Functional Purpose
                    </span>
                    <p className="text-slate-600">{risk.purpose}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                  <div>
                    <span className="font-semibold text-slate-700">Data Transmitted: </span>
                    <span className="text-slate-600">{risk.dataSent}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Data Retention: </span>
                    <span className="text-slate-600">{risk.retention}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
