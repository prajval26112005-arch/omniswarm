/**
 * Bharat Agent Component (Layer 2)
 * Full-width card with embedded Streamlit iframe, loading skeleton,
 * always-visible "Open in new tab" button, wake-up hint, external app privacy notice,
 * and automatic audit logging (layer: bharat-agent, type: external_app_opened).
 */

import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Bot,
  Info,
  Clock
} from 'lucide-react';
import { getBharatAgentUrl, DEFAULT_BHARAT_AGENT_URL } from '../lib/bharatAgentConfig';
import { logAuditEvent, getActiveWorkflowId } from '../lib/supabase';

export default function BharatAgentView() {
  const activeWf = getActiveWorkflowId();
  const [embedUrl, setEmbedUrl] = useState<string>(() => getBharatAgentUrl());
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);

  // Requirement 5: Write an audit-log event every time the page is opened
  useEffect(() => {
    logAuditEvent({
      layer: 'bharat-agent',
      type: 'external_app_opened',
      detail: {
        url: embedUrl,
        trigger: 'page_mounted',
        timestamp: new Date().toISOString()
      },
      severity: 'info',
      workflowId: activeWf
    });
  }, [activeWf, embedUrl]);

  // Handle "Open in new tab" click audit logging
  const handleOpenNewTab = () => {
    logAuditEvent({
      layer: 'bharat-agent',
      type: 'external_app_opened',
      detail: {
        url: embedUrl,
        trigger: 'new_tab_button_clicked',
        timestamp: new Date().toISOString()
      },
      severity: 'info',
      workflowId: activeWf
    });
  };

  // Raw URL for new tab (cleaner without ?embed=true if desired, or keep as is)
  const newTabUrl = embedUrl.replace(/\?embed=true$/, '');

  return (
    <div className="space-y-4 max-w-7xl mx-auto animate-fadeIn">
      {/* 1. Header with Title and One-line Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 text-[#0F766E] uppercase">
              Layer 2 Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">Streamlit Runtime • Indic Agent</span>
          </div>
          <h2 className="text-xl font-bold text-[#0B2A5B] tracking-tight mt-1 flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#0F766E]" />
            <span>Bharat Agent</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            External Indic conversational intelligence and multi-modal task assistant deployed on Streamlit Cloud.
          </p>
        </div>

        {/* 3. Always-visible "Open in new tab" button */}
        <div className="flex flex-col sm:items-end gap-1 shrink-0">
          <a
            href={newTabUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenNewTab}
            className="px-4 py-2 rounded-xl bg-[#0B2A5B] hover:bg-[#071E43] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            title="Open Bharat Agent directly in a new browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
            <span>Open in new tab</span>
          </a>

          {/* Wake-up hint */}
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span>If the app is asleep, click its wake-up button and wait about 30 seconds.</span>
          </span>
        </div>
      </div>

      {/* 4. Notice: External app privacy and security boundary */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-900 block">External Application Notice:</span>
          <p className="text-[11px] text-amber-900/90 leading-relaxed mt-0.5">
            This is an external app. Text typed here is not covered by OMNI-SWARM's privacy redaction or injection guard.
          </p>
        </div>
      </div>

      {/* 2. Full-width Card with iframe, min-height 75vh, loading skeleton, and sandbox */}
      <div className="relative w-full rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[75vh]">
        {/* Loading Skeleton */}
        {iframeLoading && (
          <div className="absolute inset-0 z-10 bg-slate-50 flex flex-col items-center justify-center p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F766E] animate-pulse">
              <Bot className="w-6 h-6 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-[#0B2A5B]">
                Connecting to Bharat Agent on Streamlit Cloud...
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Loading runtime container. If the application is sleeping, click "Open in new tab" above to wake the cloud instance.
              </p>
            </div>
            <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
              <div className="w-2/3 h-full bg-[#0F766E] rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Embedded Iframe */}
        <iframe
          src={embedUrl}
          title="Bharat Agent Streamlit Application"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          className="w-full flex-1 border-0 rounded-2xl min-h-[75vh]"
          style={{ minHeight: '75vh', width: '100%' }}
          onLoad={() => setIframeLoading(false)}
        />
      </div>
    </div>
  );
}
