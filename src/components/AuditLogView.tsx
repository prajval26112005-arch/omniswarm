/**
 * System Audit Log View
 * Real query from the `events` table with live filtering by Layer, Severity, and Workflow ID,
 * expandable event JSON payloads, and instant real CSV export.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Layers,
  ChevronDown
} from 'lucide-react';
import { db, getActiveWorkflowId } from '../lib/supabase';
import { AuditEvent } from '../types';

export default function AuditLogView() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [layerFilter, setLayerFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Event for JSON view
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await db
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Failed to query events table:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    if (layerFilter !== 'all' && e.layer !== layerFilter) return false;
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchWf = e.workflow_id?.toLowerCase().includes(query);
      const matchType = e.type?.toLowerCase().includes(query);
      const matchDetail = JSON.stringify(e.detail || {}).toLowerCase().includes(query);
      if (!matchWf && !matchType && !matchDetail) return false;
    }
    return true;
  });

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredEvents.length === 0) {
      alert('No events to export.');
      return;
    }

    const headers = ['ID', 'Timestamp_ISO', 'Layer', 'Event_Type', 'Severity', 'Workflow_ID', 'User_ID', 'Detail_JSON'];
    const rows = filteredEvents.map((e) => [
      e.id,
      e.created_at,
      e.layer,
      e.type,
      e.severity,
      e.workflow_id,
      e.user_id,
      `"${JSON.stringify(e.detail || {}).replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `omni-swarm-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Critical
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Warning
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Info
          </span>
        );
    }
  };

  const getLayerBadge = (layer: string) => {
    const map: Record<string, { label: string; color: string }> = {
      layer1: { label: 'L1 Assistant', color: 'bg-teal-50 text-[#0F766E] border-teal-200' },
      layer2: { label: 'L2 Builder', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      layer3: { label: 'L3 Security', color: 'bg-rose-50 text-rose-700 border-rose-200' },
      layer4: { label: 'L4 Wallet', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      layer5: { label: 'L5 Vendor', color: 'bg-purple-50 text-purple-700 border-purple-200' }
    };

    const entry = map[layer] || { label: layer, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${entry.color}`}>
        {entry.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#0B2A5B] tracking-tight">
            System Audit Log & Telemetry Ledger
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Immutable trace of every operation across all five layers, queried live from the database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-[#0B2A5B] hover:border-slate-300 shadow-2xs transition"
            title="Refresh events"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredEvents.length === 0}
            className="px-4 py-2 rounded-xl bg-[#0B2A5B] hover:bg-[#081e42] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Layer Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Layer:</span>
            <select
              value={layerFilter}
              onChange={(e) => setLayerFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#0F766E]"
            >
              <option value="all">All Layers</option>
              <option value="layer1">Layer 1: Assistant</option>
              <option value="layer2">Layer 2: Agent Builder</option>
              <option value="layer3">Layer 3: Security Center</option>
              <option value="layer4">Layer 4: Credential Wallet</option>
              <option value="layer5">Layer 5: Vendor Guardian</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-[#0F766E]"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflow ID or detail..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F766E]"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-[#0B2A5B]">
            Audit Records ({filteredEvents.length} of {events.length})
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Table: <code className="font-semibold text-slate-600">events</code>
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F766E]" />
            Loading audit ledger...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No events found matching current criteria</p>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Perform an action in any layer to see its cryptographic audit trace appear.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-semibold text-slate-600">
                  <th className="py-2.5 px-4">Timestamp (IST)</th>
                  <th className="py-2.5 px-4">Layer</th>
                  <th className="py-2.5 px-4">Event Type</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Workflow ID</th>
                  <th className="py-2.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(e.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getLayerBadge(e.layer)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#0B2A5B]">
                      <code className="font-mono text-xs">{e.type}</code>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getSeverityBadge(e.severity)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      <button
                        onClick={() => setSearchQuery(e.workflow_id)}
                        className="hover:underline text-[#0F766E] truncate max-w-[140px] block"
                        title="Click to filter by this workflow ID"
                      >
                        {e.workflow_id.slice(0, 16)}...
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedEvent(e)}
                        className="p-1 rounded text-slate-400 hover:text-[#0B2A5B] hover:bg-slate-100 transition"
                        title="View raw JSON payload"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Event Detail JSON */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div>
                <h4 className="text-sm font-bold text-[#0B2A5B]">Audit Event Payload</h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  {selectedEvent.id} • {selectedEvent.type}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
              >
                &times;
              </button>
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 max-h-72 overflow-auto">
              <pre className="text-[11px] font-mono text-slate-800 whitespace-pre-wrap select-all">
                {JSON.stringify(selectedEvent, null, 2)}
              </pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-[#0B2A5B] text-white text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
