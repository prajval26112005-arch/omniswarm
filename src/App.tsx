/**
 * OMNI-SWARM: Sovereign Multi-Agent Platform
 * Professional production-grade architecture (React + TypeScript + Tailwind)
 * Clean white background, soft-gray (#F8FAFC) surfaces, navy (#0B2A5B) text, teal (#0F766E) accents.
 * Strict zero hardcoded demo numbers or simulated results. Every metric queried from database.
 */

import React, { useState, useEffect } from 'react';
import IntroAnimation from './components/IntroAnimation';
import Sidebar, { NavTab } from './components/Sidebar.tsx';
import TopBar, { LANGUAGES } from './components/TopBar.tsx';
import Dashboard from './components/Dashboard';
import Layer1Assistant from './components/Layer1Assistant';
import Layer2AgentBuilder from './components/Layer2AgentBuilder';
import Layer3SecurityCenter from './components/Layer3SecurityCenter';
import Layer4CredentialWallet from './components/Layer4CredentialWallet';
import Layer5VendorGuardian from './components/Layer5VendorGuardian.tsx';
import AuditLogView from './components/AuditLogView';
import SettingsView from './components/SettingsView.tsx';
import AuthModal from './components/AuthModal';
import PublicVerifyView from './components/PublicVerifyView';
import BharatAgentView from './components/BharatAgentView';
import { getActiveWorkflowId, getCurrentUserEmail } from './lib/supabase';

export default function App() {
  // Navigation State (supports /bharat-agent route)
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/bharat-agent')) return 'bharat-agent';
      if (path.includes('/assistant')) return 'assistant';
      if (path.includes('/builder')) return 'builder';
      if (path.includes('/security')) return 'security';
      if (path.includes('/wallet')) return 'wallet';
      if (path.includes('/vendor')) return 'vendor';
      if (path.includes('/audit')) return 'audit';
      if (path.includes('/settings')) return 'settings';
    }
    return 'dashboard';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Language State (Defaults to Kannada kn-IN per vernacular citizen priority)
  const [currentLanguage, setCurrentLanguage] = useState<string>('kn-IN');
  
  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Check if URL is /verify or contains ?id=
  const [isVerifyRoute, setIsVerifyRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const search = window.location.search;
      return path.includes('/verify') || (search.includes('id=') && !search.includes('tab='));
    }
    return false;
  });

  const [verifyId, setVerifyId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('id') || '';
    }
    return '';
  });

  // Handle URL changes & back button
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const search = window.location.search;
      if (path.includes('/verify') || (search.includes('id=') && !search.includes('tab='))) {
        setIsVerifyRoute(true);
        const params = new URLSearchParams(search);
        setVerifyId(params.get('id') || '');
      } else {
        setIsVerifyRoute(false);
        if (path.includes('/bharat-agent')) setActiveTab('bharat-agent');
        else if (path.includes('/assistant')) setActiveTab('assistant');
        else if (path.includes('/builder')) setActiveTab('builder');
        else if (path.includes('/security')) setActiveTab('security');
        else if (path.includes('/wallet')) setActiveTab('wallet');
        else if (path.includes('/vendor')) setActiveTab('vendor');
        else if (path.includes('/audit')) setActiveTab('audit');
        else if (path.includes('/settings')) setActiveTab('settings');
        else if (path === '/' || path === '') setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const targetPath = tab === 'dashboard' ? '/' : `/${tab}`;
      window.history.pushState({}, '', targetPath);
    }
  };

  // If viewing the public /verify page
  if (isVerifyRoute) {
    return (
      <PublicVerifyView
        initialId={verifyId}
        onBackToApp={() => {
          setIsVerifyRoute(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Intro Animation: 1-second converge into OMNI-SWARM logo on first load only */}
      <IntroAnimation onComplete={() => {}} />

      {/* Main Application Container */}
      <div className="flex flex-1">
        {/* 2. Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* 3. Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0 bg-[#F8FAFC]">
          {/* Top Bar */}
          <TopBar
            activeTab={activeTab}
            currentLanguage={currentLanguage}
            onSelectLanguage={(lang) => setCurrentLanguage(lang)}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
            onNavigateSettings={() => handleSelectTab('settings')}
          />

          {/* Dynamic Layer / Page View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard onNavigateTab={handleSelectTab} />
            )}

            {activeTab === 'assistant' && (
              <Layer1Assistant
                currentLanguage={currentLanguage}
                onLanguageChange={(lang) => setCurrentLanguage(lang)}
              />
            )}

            {activeTab === 'bharat-agent' && <BharatAgentView />}

            {activeTab === 'builder' && <Layer2AgentBuilder />}

            {activeTab === 'security' && <Layer3SecurityCenter />}

            {activeTab === 'wallet' && <Layer4CredentialWallet />}

            {activeTab === 'vendor' && <Layer5VendorGuardian />}

            {activeTab === 'audit' && <AuditLogView />}

            {activeTab === 'settings' && <SettingsView />}
          </main>

          {/* Clean Professional Footer */}
          <footer className="border-t border-slate-200 bg-white py-3.5 px-6 text-xs text-slate-500 shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="font-semibold text-[#0B2A5B]">
                  OMNI-SWARM • Sovereign Multi-Agent Enclave
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>Ed25519 Signed</span>
                <span>•</span>
                <span>W3C JSON-LD</span>
                <span>•</span>
                <span>OSV.dev Batch</span>
                <span>•</span>
                <span>Zero Demo Data</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={() => {
          // Refresh user view
          window.location.reload();
        }}
      />
    </div>
  );
}
