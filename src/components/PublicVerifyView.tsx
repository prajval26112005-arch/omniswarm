/**
 * Public Verification Page (/verify?id=...)
 * Verifies Ed25519 digital signature over canonical RFC 8785 JSON,
 * checks issuer DID, checks revocation status, and clearly flags tampered records.
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  ArrowLeft,
  Key,
  Layers,
  FileText,
  Clock,
  User,
  ExternalLink,
  Info
} from 'lucide-react';
import { db } from '../lib/supabase';
import { VerifiableCredential } from '../types';
import { verifyVerifiableCredential } from '../lib/vcManager';

interface PublicVerifyViewProps {
  onBackToApp?: () => void;
  initialId?: string;
}

export default function PublicVerifyView({ onBackToApp, initialId }: PublicVerifyViewProps) {
  // Query param id
  const [searchId, setSearchId] = useState<string>(() => {
    if (initialId) return initialId;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('id') || '';
    }
    return '';
  });

  const [loading, setLoading] = useState(false);
  const [credential, setCredential] = useState<VerifiableCredential | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    isRevoked: boolean;
    hashValid: boolean;
    signatureValid: boolean;
    computedHash: string;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);

  const performLookup = async (idToQuery: string) => {
    if (!idToQuery.trim()) return;
    setLoading(true);
    setNotFound(false);
    setCredential(null);
    setVerificationResult(null);

    try {
      // Find matching credential
      const { data, error } = await db
        .from('credentials')
        .select('*')
        .eq('id', idToQuery.trim())
        .maybeSingle();

      if (error || !data) {
        // Also try matching by workflow_id or document_id prefix
        const { data: fallbackData } = await db
          .from('credentials')
          .select('*')
          .order('created_at', { ascending: false });

        const matched = fallbackData?.find(
          (c) =>
            c.id.toLowerCase() === idToQuery.toLowerCase() ||
            c.workflow_id.toLowerCase().includes(idToQuery.toLowerCase()) ||
            idToQuery.toLowerCase().includes(c.workflow_id.toLowerCase())
        );

        if (matched) {
          setCredential(matched);
          const result = await verifyVerifiableCredential(matched);
          setVerificationResult(result);
        } else {
          setNotFound(true);
        }
      } else {
        setCredential(data);
        const result = await verifyVerifiableCredential(data);
        setVerificationResult(result);
      }
    } catch (err) {
      console.error('Verification query failed:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchId) {
      performLookup(searchId);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(searchId);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B2A5B] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0B2A5B] tracking-tight">
                OMNI-SWARM Public Verification Portal
              </h1>
              <p className="text-xs text-[#0F766E] font-medium font-mono">
                Decentralized Ed25519 Signature & Cryptographic Ledger Verification
              </p>
            </div>
          </div>

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-xs font-semibold text-[#0B2A5B] flex items-center gap-1.5 shadow-2xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Record / Credential ID (e.g. vc:omni:172924... or DOC-WF-...)"
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F766E] font-mono text-slate-800"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-[#0B2A5B] hover:bg-[#081e42] text-white text-xs font-semibold transition flex items-center gap-1.5"
          >
            <span>{loading ? 'Verifying...' : 'Verify Record'}</span>
          </button>
        </form>

        {/* Verification Status Card */}
        {loading && (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-semibold text-slate-700">Recomputing SHA-256 hash & evaluating Ed25519 signature...</p>
          </div>
        )}

        {notFound && !loading && (
          <div className="p-8 text-center text-xs bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
            <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Record Not Found in Ledger</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              No matching verifiable record was located for ID <code className="font-mono text-rose-700">{searchId}</code>. Ensure the full credential identifier was copied correctly.
            </p>
          </div>
        )}

        {credential && verificationResult && !loading && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-5 animate-fadeIn">
            {/* Status Banner */}
            <div
              className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                verificationResult.valid
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                  : verificationResult.isRevoked
                  ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                  : 'bg-rose-50/70 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {verificationResult.valid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : verificationResult.isRevoked ? (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}

                <div>
                  <h3 className="text-base font-bold tracking-tight">
                    {verificationResult.valid
                      ? 'Record Cryptographically Valid'
                      : verificationResult.isRevoked
                      ? 'Record Revoked by Issuer'
                      : 'TAMPERED / SIGNATURE MISMATCH'}
                  </h3>
                  <p className="text-xs mt-0.5 opacity-90">
                    {verificationResult.valid
                      ? 'Ed25519 digital signature verified successfully against the canonical SHA-256 digest. No modifications detected.'
                      : verificationResult.isRevoked
                      ? 'The cryptographic signature is mathematically valid, but the issuing authority marked this credential as REVOKED.'
                      : 'The stored record digest does not match the Ed25519 signature. The document content has been altered or corrupted.'}
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  verificationResult.valid
                    ? 'bg-emerald-600 text-white'
                    : verificationResult.isRevoked
                    ? 'bg-amber-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {verificationResult.valid ? 'VALID' : verificationResult.isRevoked ? 'REVOKED' : 'TAMPERED'}
              </span>
            </div>

            {/* Record Summary Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wide">
                Recorded Credential Metadata
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Record Title</span>
                  <span className="font-bold text-slate-800">{credential.subject.title}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Workflow Correlation</span>
                  <span className="font-mono text-slate-700">{credential.workflow_id}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Issuing Authority DID</span>
                  <span className="font-mono text-[11px] text-[#0F766E] break-all">{credential.issuer_did}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Issuance Date</span>
                  <span className="text-slate-700">
                    {new Date(credential.issuance_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Recorded Summary Statement
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {credential.subject.summary}
                </p>
              </div>

              {credential.subject.handwrittenSignature && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Recorded Handwritten Signature / Seal
                  </span>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 inline-block shadow-xs">
                    <img
                      src={credential.subject.handwrittenSignature}
                      alt="Recorded Handwritten Signature"
                      className="h-12 max-w-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-teal-800 font-medium mt-1">
                    🔒 Bound into the canonical SHA-256 digest verified below.
                  </p>
                </div>
              )}
            </div>

            {/* Cryptographic Attestation Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-[#0B2A5B] uppercase tracking-wide">
                Cryptographic Attestation
              </h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-900 text-slate-100 rounded-lg">
                  <div className="text-[10px] text-teal-400 uppercase font-sans font-semibold">
                    Recomputed SHA-256 Digest (RFC 8785)
                  </div>
                  <div className="break-all text-[11px] mt-0.5">{verificationResult.computedHash}</div>
                </div>

                <div className="p-2.5 bg-slate-900 text-slate-100 rounded-lg">
                  <div className="text-[10px] text-teal-400 uppercase font-sans font-semibold">
                    Recorded Ed25519 Signature
                  </div>
                  <div className="break-all text-[11px] mt-0.5">{credential.signature}</div>
                </div>
              </div>
            </div>

            {/* Honest Integrity Notice */}
            <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200 text-xs text-teal-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                <strong>Notice on Document Integrity:</strong> The digital signature covers the recorded canonical content above. If someone edits the downloaded Word (.docx) file, verification against this stored record will still show the original unaltered evidence.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
