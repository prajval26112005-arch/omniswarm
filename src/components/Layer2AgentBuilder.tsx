/**
 * Layer 2: Multi-Agent Builder
 * Sequential 3-Agent Pipeline: Architect -> Developer -> QA (with live retries)
 * Dual View: Sandboxed iframe Live Preview vs Source Code view
 * Real ZIP export via JSZip
 */

import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Code2,
  Eye,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Play,
  Info
} from 'lucide-react';
import {
  runArchitectAgent,
  runDeveloperAgent,
  runQAAgent,
  downloadAgentProjectZip
} from '../lib/agentBuilderEngine';
import { getActiveWorkflowId } from '../lib/supabase';
import { AgentArchitectPlan, AgentDeveloperCode, QAReport } from '../types';

export default function Layer2AgentBuilder() {
  const [goal, setGoal] = useState('Appointment portal for a rural clinic');
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeStep, setActiveStep] = useState<'idle' | 'architect' | 'developer' | 'qa' | 'done'>('idle');

  // Outputs
  const [plan, setPlan] = useState<AgentArchitectPlan | null>(null);
  const [code, setCode] = useState<AgentDeveloperCode | null>(null);
  const [qaReport, setQaReport] = useState<QAReport | null>(null);

  // View state
  const [activeView, setActiveView] = useState<'preview' | 'code' | 'qa'>('preview');
  const [selectedCodeFile, setSelectedCodeFile] = useState<'html' | 'python' | 'requirements' | 'readme'>('html');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const workflowId = getActiveWorkflowId();

  const handleBuild = async (overrideGoal?: string) => {
    const targetGoal = overrideGoal || goal;
    if (!targetGoal.trim() || isBuilding) return;

    setIsBuilding(true);
    setPlan(null);
    setCode(null);
    setQaReport(null);

    try {
      // 1. Architect Agent
      setActiveStep('architect');
      const architectPlan = await runArchitectAgent(targetGoal, workflowId);
      setPlan(architectPlan);

      // 2. Developer Agent
      setActiveStep('developer');
      let developerCode = await runDeveloperAgent(architectPlan, [], workflowId);
      setCode(developerCode);

      // 3. QA Agent (with up to 2 retries)
      setActiveStep('qa');
      let report = await runQAAgent(developerCode, 1, workflowId);
      let attempt = 1;

      while (!report.passed && attempt < 3) {
        attempt++;
        // Developer Agent retry with QA feedback
        setActiveStep('developer');
        developerCode = await runDeveloperAgent(architectPlan, report.errorsCaught, workflowId);
        setCode(developerCode);

        // Re-run QA
        setActiveStep('qa');
        report = await runQAAgent(developerCode, attempt, workflowId);
      }

      setQaReport(report);
      setActiveStep('done');
    } catch (err) {
      console.error('Agent builder error:', err);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleCopy = (content: string, name: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(name);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const PRESET_GOALS = [
    'Appointment portal for a rural clinic',
    'Seed subsidy and quota tracker for Raitha Samparka Kendra',
    'Scholarship application manager for college students',
    'Grievance intake portal for Gram Panchayat'
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Top Configuration & Goal Input Card */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 text-[#0F766E] font-bold uppercase">
              Layer 2 Engine
            </span>
            <span className="text-xs text-slate-500">Autonomous 3-Agent Microservice Synthesizer</span>
          </div>
          <h2 className="text-lg font-bold text-[#0B2A5B] mt-1">Multi-Agent Application Builder</h2>
          <p className="text-xs text-slate-500">
            Define your application goal. Three sequential agents—<strong>Architect</strong> (spec & real data sources), <strong>Developer</strong> (HTML/JS & FastAPI), and <strong>QA</strong> (DOMParser, sandboxed runtime & linter)—synthesize a production-ready package.
          </p>
        </div>

        {/* Goal Input & Trigger Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Type your application goal (e.g. appointment portal for a clinic)..."
            disabled={isBuilding}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0F766E] text-xs sm:text-sm text-[#0B2A5B]"
          />

          <button
            onClick={() => handleBuild()}
            disabled={isBuilding || !goal.trim()}
            className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer shrink-0 ${
              isBuilding
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-[#0B2A5B] hover:bg-[#071E43] text-white shadow-xs'
            }`}
          >
            {isBuilding ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                <span>Agents Running...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Synthesize with Swarm</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Goal Presets */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-[11px] text-slate-400 font-medium">Quick Prompts:</span>
          {PRESET_GOALS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setGoal(preset);
                handleBuild(preset);
              }}
              disabled={isBuilding}
              className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-slate-200 hover:border-[#0F766E] text-slate-600 hover:text-[#0B2A5B] text-[11px] font-medium transition cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Execution Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
        {/* Step 1: Architect */}
        <div className={`p-4 rounded-xl border transition ${
          activeStep === 'architect'
            ? 'bg-blue-50/60 border-blue-300 shadow-xs'
            : plan
            ? 'bg-white border-slate-200'
            : 'bg-slate-50/50 border-slate-200 text-slate-400'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Agent 1: Architect</span>
            {activeStep === 'architect' && <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
            {plan && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          </div>
          <div className="text-sm font-bold text-[#0B2A5B] mt-1">System Architecture Plan</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {plan ? `${plan.pages.length} pages • ${plan.apiEndpoints.length} endpoints planned` : 'Pending goal input...'}
          </div>
        </div>

        {/* Step 2: Developer */}
        <div className={`p-4 rounded-xl border transition ${
          activeStep === 'developer'
            ? 'bg-blue-50/60 border-blue-300 shadow-xs'
            : code
            ? 'bg-white border-slate-200'
            : 'bg-slate-50/50 border-slate-200 text-slate-400'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Agent 2: Developer</span>
            {activeStep === 'developer' && <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
            {code && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          </div>
          <div className="text-sm font-bold text-[#0B2A5B] mt-1">HTML/JS & FastAPI Synthesis</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {code ? 'HTML single-file & main.py created' : 'Waiting for Architect...'}
          </div>
        </div>

        {/* Step 3: QA */}
        <div className={`p-4 rounded-xl border transition ${
          activeStep === 'qa'
            ? 'bg-blue-50/60 border-blue-300 shadow-xs'
            : qaReport?.passed
            ? 'bg-emerald-50/50 border-emerald-300'
            : qaReport && !qaReport.passed
            ? 'bg-rose-50/50 border-rose-300'
            : 'bg-slate-50/50 border-slate-200 text-slate-400'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Agent 3: QA Reviewer</span>
            {activeStep === 'qa' && <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
            {qaReport?.passed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {qaReport && !qaReport.passed && <XCircle className="w-4 h-4 text-rose-600" />}
          </div>
          <div className="text-sm font-bold text-[#0B2A5B] mt-1">DOMParser & Sandbox Checks</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {qaReport ? (qaReport.passed ? `Passed on attempt ${qaReport.attempt}` : 'Retrying code fixes...') : 'Waiting for Developer...'}
          </div>
        </div>
      </div>

      {/* Main Dual-View Workspace */}
      {code ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Workspace Top Toolbar */}
          <div className="px-5 py-3 border-b border-slate-200 bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
            {/* View Switcher Subtabs */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveView('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeView === 'preview'
                    ? 'bg-[#0B2A5B] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Sandboxed Preview</span>
              </button>

              <button
                onClick={() => setActiveView('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeView === 'code'
                    ? 'bg-[#0B2A5B] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code View</span>
              </button>

              <button
                onClick={() => setActiveView('qa')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeView === 'qa'
                    ? 'bg-[#0B2A5B] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>QA Verification ({qaReport?.checks.filter(c => c.passed).length}/{qaReport?.checks.length})</span>
              </button>
            </div>

            {/* ZIP Export Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadAgentProjectZip(code, plan?.projectName || 'omni-app')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Download full project source code as standard .zip"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Project ZIP</span>
              </button>
            </div>
          </div>

          {/* View 1: Live Sandboxed Iframe (sandbox="allow-scripts", no same-origin) */}
          {activeView === 'preview' && (
            <div className="p-4 bg-slate-100 flex flex-col items-center">
              <div className="w-full h-[520px] bg-white rounded-xl shadow-xs overflow-hidden border border-slate-300">
                <iframe
                  title="Sandboxed Agent Application Preview"
                  sandbox="allow-scripts"
                  srcDoc={code.htmlApp}
                  className="w-full h-full border-0"
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-2 text-center">
                *Rendered inside an isolated sandbox (<code className="font-mono">sandbox="allow-scripts"</code>, no same-origin credentials).
              </div>
            </div>
          )}

          {/* View 2: Code View */}
          {activeView === 'code' && (
            <div className="flex flex-col">
              {/* File Subtabs */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-xs font-mono border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCodeFile('html')}
                    className={`px-2.5 py-1 rounded transition ${
                      selectedCodeFile === 'html' ? 'bg-slate-800 text-teal-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    index.html
                  </button>
                  <button
                    onClick={() => setSelectedCodeFile('python')}
                    className={`px-2.5 py-1 rounded transition ${
                      selectedCodeFile === 'python' ? 'bg-slate-800 text-teal-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    main.py (FastAPI)
                  </button>
                  <button
                    onClick={() => setSelectedCodeFile('requirements')}
                    className={`px-2.5 py-1 rounded transition ${
                      selectedCodeFile === 'requirements' ? 'bg-slate-800 text-teal-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    requirements.txt
                  </button>
                  <button
                    onClick={() => setSelectedCodeFile('readme')}
                    className={`px-2.5 py-1 rounded transition ${
                      selectedCodeFile === 'readme' ? 'bg-slate-800 text-teal-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    README.md
                  </button>
                </div>

                <button
                  onClick={() => {
                    const content =
                      selectedCodeFile === 'html'
                        ? code.htmlApp
                        : selectedCodeFile === 'python'
                        ? code.pythonFastAPI
                        : selectedCodeFile === 'requirements'
                        ? code.requirementsTxt
                        : code.readmeMd;
                    handleCopy(content, selectedCodeFile);
                  }}
                  className="flex items-center gap-1 text-slate-300 hover:text-white text-xs cursor-pointer"
                >
                  {copiedFile === selectedCodeFile ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-400" />
                      <span className="text-teal-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Pre/Code */}
              <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs max-h-[500px] overflow-auto">
                <pre>
                  <code>
                    {selectedCodeFile === 'html' && code.htmlApp}
                    {selectedCodeFile === 'python' && code.pythonFastAPI}
                    {selectedCodeFile === 'requirements' && code.requirementsTxt}
                    {selectedCodeFile === 'readme' && code.readmeMd}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {/* View 3: QA Verification Checklist */}
          {activeView === 'qa' && qaReport && (
            <div className="p-5 space-y-4 font-sans text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#0B2A5B] text-sm">
                    QA Evaluation Status: {qaReport.passed ? '✓ PASSED (Ready for Export)' : '⚠️ Check Required'}
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    Evaluated on attempt {qaReport.attempt} of 3. Checked via DOMParser syntax inspection and Python AST checks.
                  </div>
                </div>
                <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Real Checks Only
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {qaReport.checks.map((check, idx) => (
                  <div key={idx} className="p-3.5 flex items-start gap-3 bg-white">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-[#0B2A5B]">{check.name}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5">{check.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <Terminal className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-700">No application synthesized yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Type your project goal above and click "Synthesize with Swarm" to run the 3-agent pipeline.
          </p>
        </div>
      )}

      {/* Honest Deployment Note */}
      <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
        <div>
          <strong>Deployment Notice:</strong> OMNI-SWARM provides the complete exportable package (HTML single-file, FastAPI <code className="font-mono text-[11px]">main.py</code>, and requirements). We do not claim live backend hosting; the ZIP export is designed for immediate deployment to Vercel, Netlify, Render, or your preferred infrastructure.
        </div>
      </div>
    </div>
  );
}
