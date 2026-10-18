/**
 * Live Dashboard View
 * Every single metric and table row comes directly from the database!
 * Zero fabricated stats. Honest empty states when fresh.
 */

import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  ShieldAlert,
  Award,
  Wallet,
  Activity,
  FileCheck,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
  Inbox
} from 'lucide-react';
import { db } from '../lib/supabase';
import { AuditEvent } from '../types';
import { NavTab } from './Sidebar';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    messagesHandled: 0,
    injectionsBlocked: 0,
    certificatesIssued: 0,
    credentialsIssued: 0,
    credentialsRevoked: 0,
    vulnerabilitiesFound: 0,
    documentsDownloaded: 0
  });
  const [recentEvents, setRecentEvents] = useState<AuditEvent[]>([]);

  const fetchLiveMetrics = async () => {
    setLoading(true);
    try {
      // 1. Messages Handled
      const { data: messages } = await db.from('chat_messages').select();
      const messagesCount = messages?.length || 0;

      // 2. Events & Injections Blocked
      const { data: events } = await db.from('events').select().order('created_at', { ascending: false });
      const eventList = events || [];

      const blockedCount = eventList.filter(
        (e: any) => e.type === 'prompt_injection_blocked' || e.type.includes('blocked')
      ).length;

      const docsDownloaded = eventList.filter(
        (e: any) => e.type === 'document_downloaded'
      ).length;

      // 3. Certificates
      const { data: certs } = await db.from('certificates').select();
      const certCount = certs?.length || 0;

      // 4. Credentials
      const { data: creds } = await db.from('credentials').select();
      const credList = creds || [];
      const credCount = credList.length;
      const revokedCount = credList.filter((c: any) => c.status === 'Revoked').length;

      // 5. SBOM Reports & Vulnerabilities
      const { data: sboms } = await db.from('sbom_reports').select();
      const sbomList = sboms || [];
      const vulnCount = sbomList.reduce((acc: number, r: any) => acc + (r.vulnerabilities_count || 0), 0);

      setMetrics({
        messagesHandled: messagesCount,
        injectionsBlocked: blockedCount,
        certificatesIssued: certCount,
        credentialsIssued: credCount,
        credentialsRevoked: revokedCount,
        vulnerabilitiesFound: vulnCount,
        documentsDownloaded: docsDownloaded
      });

      setRecentEvents(eventList.slice(0, 10));
    } catch (err) {
      console.error('Error fetching live metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, []);

  const cards = [
    {
      id: 'assistant' as NavTab,
      label: 'Messages Handled',
      value: metrics.messagesHandled,
      desc: 'Vernacular questions & citizen intakes',
      icon: MessageSquare,
      color: 'text-[#0B2A5B]',
      bg: 'bg-blue-50/60',
      badge: 'Layer 1'
    },
    {
      id: 'security' as NavTab,
      label: 'Injections Blocked',
      value: metrics.injectionsBlocked,
      desc: 'Zero-trust rule & classifier blocks',
      icon: ShieldAlert,
      color: 'text-rose-600',
      bg: 'bg-rose-50/60',
      badge: 'Layer 3'
    },
    {
      id: 'security' as NavTab,
      label: 'Certificates Issued',
      value: metrics.certificatesIssued,
      desc: 'Ed25519 canonical audit records',
      icon: Award,
      color: 'text-[#0F766E]',
      bg: 'bg-teal-50/60',
      badge: 'Layer 3'
    },
    {
      id: 'wallet' as NavTab,
      label: 'Credentials Active',
      value: `${metrics.credentialsIssued - metrics.credentialsRevoked} / ${metrics.credentialsIssued}`,
      desc: `${metrics.credentialsRevoked} revoked credentials`,
      icon: Wallet,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/60',
      badge: 'Layer 4'
    },
    {
      id: 'vendor' as NavTab,
      label: 'Vulnerabilities Logged',
      value: metrics.vulnerabilitiesFound,
      desc: 'Identified via OSV.dev batch scan',
      icon: Activity,
      color: 'text-amber-600',
      bg: 'bg-amber-50/60',
      badge: 'Layer 5'
    },
    {
      id: 'wallet' as NavTab,
      label: 'Signed Documents',
      value: metrics.documentsDownloaded,
      desc: 'Gated verified .docx exports',
      icon: FileCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/60',
      badge: 'Layer 4'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Welcome & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#0B2A5B]">Platform Operational Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every metric below is populated by direct queries to the events, certificates, and credentials database tables.
          </p>
        </div>

        <button
          onClick={fetchLiveMetrics}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#0F766E] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 6 Core Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={() => onNavigate(card.id)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover-card-lift cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {card.badge}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-2xl font-bold text-[#0B2A5B] tracking-tight">
                    {loading ? <span className="text-slate-300 animate-pulse">--</span> : card.value}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">{card.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{card.desc}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-[#0F766E] group-hover:text-[#115E59]">
                <span>Inspect in {card.badge}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0B2A5B] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0F766E]" />
              <span>Real-Time System Audit Events</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live chronological stream of actions logged to the <code className="text-slate-700 font-mono">events</code> database table.
            </p>
          </div>

          <button
            onClick={() => onNavigate('audit')}
            className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
          >
            <span>View Full Audit Log</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">No events recorded yet</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              This is a clean, honest database state. Ask the Vernacular Assistant a question or trigger the Multi-Agent Builder to record events.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('assistant')}
                className="px-4 py-2 rounded-xl bg-[#0B2A5B] hover:bg-[#071E43] text-white text-xs font-semibold transition"
              >
                Open Vernacular Assistant &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-4">Layer</th>
                  <th className="py-2.5 px-4">Event Type</th>
                  <th className="py-2.5 px-4">Workflow ID</th>
                  <th className="py-2.5 px-4">Details</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {recentEvents.map((evt) => {
                  const detailStr = typeof evt.detail === 'string' ? evt.detail : JSON.stringify(evt.detail);
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-semibold text-[#0B2A5B]">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] uppercase">
                          {evt.layer}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {evt.type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                        {evt.workflow_id?.slice(0, 12)}...
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate" title={detailStr}>
                        {detailStr}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            evt.severity === 'critical'
                              ? 'bg-rose-100 text-rose-700'
                              : evt.severity === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {evt.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
