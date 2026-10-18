import React, { useEffect } from 'react';
import { X, Maximize2, Minimize2, Download, ExternalLink, Globe, ShieldCheck } from 'lucide-react';
import DynamicAppPreview from './DynamicAppPreview';
import { downloadProjectZip } from '../utils/projectExporter';

export default function FullscreenAppModal({
  isOpen,
  onClose,
  currentTopic,
  activeVC
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const cred = activeVC?.credentialSubject || {};
    downloadProjectZip({
      project_type: cred.project_type || 'CUSTOM',
      user_name: cred.user_name || '',
      title: cred.title || currentTopic,
      items_or_skills: cred.items_or_skills || [],
      raw_input: cred.raw_input || currentTopic,
      currentTopic
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-950 border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-slate-900/90 px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
              <span className="text-xs font-bold text-white font-mono">
                {currentTopic}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Full-Screen Mode
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 font-mono text-xs transition"
              title="Download Full Project ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download ZIP</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Close Full Screen (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable App Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/80">
          <DynamicAppPreview 
            currentTopic={currentTopic}
            activeVC={activeVC}
          />
        </div>
      </div>
    </div>
  );
}
