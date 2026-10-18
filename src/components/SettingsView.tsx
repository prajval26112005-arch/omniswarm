/**
 * Settings & Infrastructure Configuration View
 * Configure Supabase credentials, LLM API keys (Anthropic / OpenAI / Groq),
 * Sarvam / Bhashini keys, and inspect/copy the full SQL schema migration.
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Key,
  Mic,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers,
  Terminal,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  SUPABASE_SQL_SCHEMA,
  getActiveWorkflowId,
  startNewWorkflow,
  getCurrentUserEmail,
  getCurrentUserId
} from '../lib/supabase';
import { getLlmConfig, saveLlmConfig } from '../lib/assistantEngine';
import { getBharatAgentUrl, saveBharatAgentUrl, DEFAULT_BHARAT_AGENT_URL } from '../lib/bharatAgentConfig';

export default function SettingsView() {
  const currentConfig = getSupabaseConfig();
  const currentLlm = getLlmConfig();

  // Supabase state
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.anonKey);
  const [savedSupabaseMsg, setSavedSupabaseMsg] = useState(false);

  // LLM state
  const [llmProvider, setLlmProvider] = useState<string>(currentLlm.provider);
  const [llmApiKey, setLlmApiKey] = useState<string>(currentLlm.apiKey);
  const [savedLlmMsg, setSavedLlmMsg] = useState(false);

  // Speech API state
  const [sarvamKey, setSarvamKey] = useState(() => localStorage.getItem('omni_sarvam_key') || '');
  const [bhashiniKey, setBhashiniKey] = useState(() => localStorage.getItem('omni_bhashini_key') || '');
  const [savedSpeechMsg, setSavedSpeechMsg] = useState(false);

  // Bharat Agent URL state
  const [bharatAgentUrl, setBharatAgentUrl] = useState(() => getBharatAgentUrl());
  const [savedBharatAgentMsg, setSavedBharatAgentMsg] = useState(false);

  // Schema copy state
  const [copiedSchema, setCopiedSchema] = useState(false);

  const activeWf = getActiveWorkflowId();
  const userEmail = getCurrentUserEmail();
  const userId = getCurrentUserId();

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setSavedSupabaseMsg(true);
    setTimeout(() => {
      setSavedSupabaseMsg(false);
      window.location.reload();
    }, 1200);
  };

  const handleSaveLlm = (e: React.FormEvent) => {
    e.preventDefault();
    saveLlmConfig(llmProvider as any, llmApiKey);
    setSavedLlmMsg(true);
    setTimeout(() => setSavedLlmMsg(false), 2000);
  };

  const handleSaveSpeech = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('omni_sarvam_key', sarvamKey.trim());
    localStorage.setItem('omni_bhashini_key', bhashiniKey.trim());
    setSavedSpeechMsg(true);
    setTimeout(() => setSavedSpeechMsg(false), 2000);
  };

  const handleSaveBharatAgent = (e: React.FormEvent) => {
    e.preventDefault();
    saveBharatAgentUrl(bharatAgentUrl);
    setSavedBharatAgentMsg(true);
    setTimeout(() => setSavedBharatAgentMsg(false), 2000);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleResetWorkflow = () => {
    const newId = startNewWorkflow();
    alert(`Started new workflow session: ${newId}`);
    window.location.reload();
  };

  const handleClearLocalData = () => {
    if (confirm('Are you sure you want to clear local database cache and reset sessions? Configured API keys will remain.')) {
      const keysToKeep = ['omni_supabase_url', 'omni_supabase_anon_key', 'omni_llm_provider', 'omni_llm_api_key', 'omni_sarvam_key', 'omni_bhashini_key'];
      const savedVals: Record<string, string | null> = {};
      keysToKeep.forEach((k) => (savedVals[k] = localStorage.getItem(k)));

      localStorage.clear();

      keysToKeep.forEach((k) => {
        if (savedVals[k]) localStorage.setItem(k, savedVals[k]!);
      });

      alert('Local database cache cleared.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-[#0B2A5B] tracking-tight">
          Platform Settings & Infrastructure Secrets
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Manage Supabase connection keys, LLM providers, vernacular speech engines, and database migrations.
        </p>
      </div>

      {/* Grid: 2 Columns for config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Supabase Cloud Connection */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B2A5B]">Supabase Credentials</h3>
              <p className="text-[11px] text-slate-500">
                Syncs audit events, credentials & chat tables to your cloud instance.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSupabase} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F766E] font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Anon Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F766E] font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Mode:{' '}
                <strong className={currentConfig.isConfigured ? 'text-teal-700' : 'text-amber-700'}>
                  {currentConfig.isConfigured ? 'Supabase Cloud' : 'Local Verified'}
                </strong>
              </span>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0B2A5B] hover:bg-[#081e42] text-white font-semibold text-xs transition"
              >
                Save & Reconnect
              </button>
            </div>

            {savedSupabaseMsg && (
              <div className="p-2 rounded-lg bg-teal-50 text-teal-800 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Supabase credentials saved. Reloading client...</span>
              </div>
            )}
          </form>
        </div>

        {/* 2. LLM Provider Configuration */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B2A5B]">Edge LLM Provider</h3>
              <p className="text-[11px] text-slate-500">
                Powers conversational assistance and multi-agent synthesis.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveLlm} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Model Provider
              </label>
              <select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F766E] bg-white font-medium text-slate-800"
              >
                <option value="mock">Local Sovereign Engine (Zero cloud egress, deterministic)</option>
                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="groq">Groq (LLaMA 3.3 70B Versatile)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                API Key (Optional for Local Engine)
              </label>
              <input
                type="password"
                value={llmApiKey}
                onChange={(e) => setLlmApiKey(e.target.value)}
                placeholder="sk-ant-... / sk-... / gsk_..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F766E] font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Active:{' '}
                <strong className="text-slate-700 capitalize">{llmProvider}</strong>
              </span>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0c5f59] text-white font-semibold text-xs transition"
              >
                Save LLM Settings
              </button>
            </div>

            {savedLlmMsg && (
              <div className="p-2 rounded-lg bg-teal-50 text-teal-800 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>LLM provider preferences updated.</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* 3. Vernacular Speech Recognition Engine */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0B2A5B]">Vernacular Speech Recognition Keys</h3>
            <p className="text-[11px] text-slate-500">
              By default uses Web Speech API (in-browser). If BHASHINI or Sarvam keys are provided, requests will route through them.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSpeech} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Sarvam AI API Key (Optional)
              </label>
              <input
                type="password"
                value={sarvamKey}
                onChange={(e) => setSarvamKey(e.target.value)}
                placeholder="sarvam_api_key_..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F766E] font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                For high-accuracy Indic speech-to-text in Kannada, Tamil, Telugu, Hindi.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Bhashini API Key (Optional)
              </label>
              <input
                type="password"
                value={bhashiniKey}
                onChange={(e) => setBhashiniKey(e.target.value)}
                placeholder="bhashini_api_key_..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F766E] font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                National Language Translation Mission endpoint.
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition"
            >
              Save Speech Keys
            </button>
          </div>

          {savedSpeechMsg && (
            <div className="p-2 rounded-lg bg-teal-50 text-teal-800 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Speech recognition secrets saved.</span>
            </div>
          )}
        </form>
      </div>

      {/* 4. Bharat Agent Embed URL Configuration */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0B2A5B]">Bharat Agent Embed URL</h3>
            <p className="text-[11px] text-slate-500">
              Configure the embedded Streamlit application runtime URL for Layer 2 Bharat Agent.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBharatAgent} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
              Streamlit Embed Endpoint URL
            </label>
            <input
              type="url"
              value={bharatAgentUrl}
              onChange={(e) => setBharatAgentUrl(e.target.value)}
              placeholder={DEFAULT_BHARAT_AGENT_URL}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F766E] font-mono"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                setBharatAgentUrl(DEFAULT_BHARAT_AGENT_URL);
                saveBharatAgentUrl(DEFAULT_BHARAT_AGENT_URL);
                setSavedBharatAgentMsg(true);
                setTimeout(() => setSavedBharatAgentMsg(false), 2000);
              }}
              className="text-[11px] text-slate-500 hover:text-[#0B2A5B] underline"
            >
              Reset to Default URL
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0B2A5B] hover:bg-[#071E43] text-white font-semibold text-xs transition"
            >
              Save Bharat Agent URL
            </button>
          </div>

          {savedBharatAgentMsg && (
            <div className="p-2 rounded-lg bg-teal-50 text-teal-800 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Bharat Agent URL saved to settings.</span>
            </div>
          )}
        </form>
      </div>

      {/* 5. Complete Supabase SQL Migration Script */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#0B2A5B]" />
            <h3 className="text-sm font-bold text-[#0B2A5B]">Supabase SQL Schema & RLS Policies</h3>
          </div>

          <button
            onClick={handleCopySchema}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-[#0B2A5B] flex items-center gap-1.5 shadow-2xs transition"
          >
            {copiedSchema ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-teal-700">Copied SQL!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy SQL Schema</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Run this exact script in your Supabase SQL Editor. It creates all 5 tables (<code className="font-mono">events</code>, <code className="font-mono">certificates</code>, <code className="font-mono">credentials</code>, <code className="font-mono">sbom_reports</code>, <code className="font-mono">chat_messages</code>) with strict Row Level Security (RLS) policies.
        </p>

        <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-72">
          <pre>{SUPABASE_SQL_SCHEMA}</pre>
        </div>
      </div>

      {/* 5. Diagnostic Tools & State Management */}
      <div className="p-5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-3 text-xs">
        <h3 className="text-sm font-bold text-[#0B2A5B]">Session & Enclave Diagnostics</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">User Account</span>
            <span className="font-medium text-slate-800 truncate block">{userEmail}</span>
            <span className="font-mono text-[10px] text-slate-400">{userId}</span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Active Workflow</span>
            <span className="font-mono text-[11px] text-[#0F766E] truncate block">{activeWf}</span>
            <button
              onClick={handleResetWorkflow}
              className="text-[11px] text-[#0B2A5B] hover:underline font-semibold mt-1"
            >
              Start New Workflow &rarr;
            </button>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Database Maintenance</span>
            <button
              onClick={handleClearLocalData}
              className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold mt-1 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear Local DB Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
