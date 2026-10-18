/**
 * Professional Left Sidebar for OMNI-SWARM
 * Clean white/soft-gray look with navy typography and teal accent highlight bar
 */

import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Cpu,
  ShieldCheck,
  Wallet,
  Activity,
  FileText,
  Settings,
  Lock,
  ChevronRight,
  ExternalLink,
  Bot
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'assistant'
  | 'bharat-agent'
  | 'builder'
  | 'security'
  | 'wallet'
  | 'vendor'
  | 'audit'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'assistant' as NavTab, label: 'Assistant', icon: MessageSquare, badge: 'L1' },
    { id: 'bharat-agent' as NavTab, label: 'Bharat Agent', icon: Bot, badge: 'L2' },
    { id: 'builder' as NavTab, label: 'Agent Builder', icon: Cpu, badge: 'L3' },
    { id: 'security' as NavTab, label: 'Security Center', icon: ShieldCheck, badge: 'L4' },
    { id: 'wallet' as NavTab, label: 'Credential Wallet', icon: Wallet, badge: 'L5' },
    { id: 'vendor' as NavTab, label: 'Vendor Guardian', icon: Activity, badge: 'L6' },
    { id: 'audit' as NavTab, label: 'Audit Log', icon: FileText, badge: null },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings, badge: null }
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0B2A5B] flex items-center justify-center text-white shadow-sm">
              <svg
                className="w-5 h-5 text-teal-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
                <path d="m14.83 14.83 4.24 4.24" />
                <path d="m9.17 14.83-4.24 4.24" />
                <circle cx="12" cy="12" r="4" fill="#0F766E" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm text-[#0B2A5B] tracking-tight block">
                OMNI-SWARM
              </span>
              <span className="text-[10px] text-[#0F766E] font-medium tracking-wide block uppercase">
                Sovereign Platform
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium sidebar-item ${
                  isActive
                    ? 'active text-[#0B2A5B]'
                    : 'text-slate-600 hover:text-[#0B2A5B] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#0F766E]' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      isActive
                        ? 'bg-teal-100 text-[#0F766E]'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Security & System Info Footer */}
        <div className="p-4 border-t border-slate-200 bg-[#F8FAFC]">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#0B2A5B]">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#0F766E]" />
                Zero-Trust Active
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Hardware TEE attestation & airgapped audit logging enabled.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
