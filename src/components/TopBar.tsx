/**
 * TopBar Component
 * Includes Language Selector, Workflow ID correlation tracker, User Menu & Setup Banner
 */

import React, { useState } from 'react';
import {
  Globe,
  User,
  LogOut,
  LogIn,
  AlertCircle,
  Menu,
  Shield,
  Layers,
  ChevronDown
} from 'lucide-react';
import { getSupabaseConfig, getCurrentUserEmail, getActiveWorkflowId, startNewWorkflow, clearCurrentUser } from '../lib/supabase';
import { NavTab } from './Sidebar';

export const LANGUAGES = [
  { code: 'kn-IN', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'en-IN', name: 'English', flag: '🇬🇧' }
];

interface TopBarProps {
  activeTab: NavTab;
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  onOpenMobileMenu: () => void;
  onOpenAuth: () => void;
  onNavigateSettings: () => void;
}

export default function TopBar({
  activeTab,
  currentLanguage,
  onSelectLanguage,
  onOpenMobileMenu,
  onOpenAuth,
  onNavigateSettings
}: TopBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userEmail = getCurrentUserEmail();
  const { isConfigured } = getSupabaseConfig();
  const activeWf = getActiveWorkflowId();

  const tabTitles: Record<NavTab, string> = {
    dashboard: 'Platform Dashboard',
    assistant: 'Vernacular Citizen Assistant',
    'bharat-agent': 'Bharat Agent',
    builder: 'Multi-Agent Application Builder',
    security: 'Autonomous Security Center',
    wallet: 'Verifiable Credential Wallet',
    vendor: 'Vendor Guardian SBOM Scanner',
    audit: 'System Audit Log',
    settings: 'Platform Settings & Secrets'
  };

  const handleSignOut = () => {
    clearCurrentUser();
    window.location.reload();
  };

  const handleResetWorkflow = () => {
    startNewWorkflow();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Setup Banner if Supabase / API Key is missing */}
      {!isConfigured && (
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-1.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2 max-w-3xl">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>Setup Notice:</strong> Cloud Supabase URL is unconfigured. Operating in <strong>Local Verified Mode</strong> (real zero-demo database). Add <code className="bg-amber-100 px-1 rounded font-mono text-[11px]">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 rounded font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> to enable cloud sync.
            </span>
          </div>
          <button
            onClick={onNavigateSettings}
            className="text-xs font-semibold text-[#0B2A5B] hover:text-[#0F766E] underline underline-offset-2 shrink-0 ml-3"
          >
            Configure in Settings &rarr;
          </button>
        </div>
      )}

      {/* Main Top Bar */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium capitalize">
                Omni-Swarm / {activeTab}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-[#0B2A5B] tracking-tight">
              {tabTitles[activeTab]}
            </h1>
          </div>
        </div>

        {/* Right: Workflow Tracker, Language Selector, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Workflow ID Badge */}
          <div
            onClick={handleResetWorkflow}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs text-slate-600 hover:border-slate-300 cursor-pointer transition"
            title="Click to start a fresh workflow tracing session"
          >
            <Layers className="w-3 h-3 text-[#0F766E]" />
            <span className="text-[11px] font-mono text-slate-500">Workflow:</span>
            <span className="text-[11px] font-mono font-semibold text-[#0B2A5B]">
              {activeWf.slice(0, 14)}...
            </span>
          </div>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <select
              value={currentLanguage}
              onChange={(e) => onSelectLanguage(e.target.value)}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 text-[#0B2A5B] font-medium text-xs rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:border-[#0F766E] cursor-pointer shadow-2xs transition"
              title="Select Assistant & Recognition Language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* User Profile / Auth Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-medium text-[#0B2A5B] shadow-2xs transition"
            >
              <div className="w-5 h-5 rounded-full bg-[#0B2A5B] text-white flex items-center justify-center text-[10px] font-bold">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-32 truncate">{userEmail}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50 text-xs font-medium animate-fadeIn">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="text-[11px] text-slate-400">Signed in as</div>
                  <div className="text-xs font-semibold text-[#0B2A5B] truncate">{userEmail}</div>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenAuth();
                  }}
                  className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                >
                  <User className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Switch Account / Sign In</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
