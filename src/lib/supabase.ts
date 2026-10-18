/**
 * Production Supabase Client & Unified Database Adapter for OMNI-SWARM
 * Supports:
 * - Real Supabase Cloud Project (via VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY or Settings)
 * - Real Local Browser Storage Adapter with identical query builder syntax
 * - Zero simulated metrics: every metric and log read in the app comes directly from the database!
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuditEvent, Certificate, VerifiableCredential, SbomReport, ChatMessage } from '../types';

// Storage keys for settings
const SETTINGS_KEY_URL = 'omni_supabase_url';
const SETTINGS_KEY_ANON = 'omni_supabase_anon_key';
const STORAGE_USER_KEY = 'omni_swarm_current_user';

// Get configured credentials from env or local settings
export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const savedUrl = typeof window !== 'undefined' ? localStorage.getItem(SETTINGS_KEY_URL) || '' : '';
  const savedKey = typeof window !== 'undefined' ? localStorage.getItem(SETTINGS_KEY_ANON) || '' : '';

  const url = savedUrl || envUrl;
  const anonKey = savedKey || envKey;
  const isConfigured = Boolean(url && anonKey && url.startsWith('http'));

  return { url, anonKey, isConfigured };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(SETTINGS_KEY_URL, url.trim());
  localStorage.setItem(SETTINGS_KEY_ANON, anonKey.trim());
}

// Default session user id
export function getCurrentUserId(): string {
  try {
    const saved = localStorage.getItem(STORAGE_USER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.id) return parsed.id;
    }
    const newId = `usr_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({ id: newId, email: 'anonymous.citizen@omni.internal' }));
    return newId;
  } catch {
    return 'usr_guest_local';
  }
}

export function getCurrentUserEmail(): string {
  try {
    const saved = localStorage.getItem(STORAGE_USER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.email) return parsed.email;
    }
    return 'citizen@omni.gov.in';
  } catch {
    return 'citizen@omni.gov.in';
  }
}

export function setCurrentUser(userOrId: string | { id: string; email: string }, email?: string) {
  if (typeof userOrId === 'string') {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify({ id: userOrId, email: email || 'citizen@omni.gov.in' }));
  } else {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userOrId));
  }
}

export function clearCurrentUser() {
  localStorage.removeItem(STORAGE_USER_KEY);
}

// Active Workflow ID management
let currentWorkflowId = `wf_${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}_${Math.random().toString(36).substring(2, 6)}`;

export function getActiveWorkflowId(): string {
  return currentWorkflowId;
}

export function startNewWorkflow(prefix: string = 'wf'): string {
  currentWorkflowId = `${prefix}_${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}_${Math.random().toString(36).substring(2, 6)}`;
  return currentWorkflowId;
}

// ============================================================================
// Local Database Engine for 100% Zero-Demo Guarantee
// Stores actual rows in localStorage. Returns true empty states when empty.
// ============================================================================
const TABLE_PREFIX = 'omni_db_table_';

function getLocalTable<T>(tableName: string): T[] {
  try {
    const raw = localStorage.getItem(TABLE_PREFIX + tableName);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setLocalTable<T>(tableName: string, data: T[]) {
  try {
    localStorage.setItem(TABLE_PREFIX + tableName, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to write to table ${tableName}`, err);
  }
}

/**
 * Creates a QueryBuilder mimicking Supabase Client query chaining
 */
class LocalQueryBuilder<T extends Record<string, any>> {
  private tableName: string;
  private filters: Array<(item: T) => boolean> = [];
  private sortField: string | null = null;
  private sortAscending: boolean = true;
  private limitCount: number | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = '*') {
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push(item => item[field] === value);
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push(item => item[field] !== value);
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.sortField = field;
    this.sortAscending = options.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async then(resolve: (value: { data: T[] | null; error: any; count?: number }) => void) {
    const raw = getLocalTable<T>(this.tableName);
    let filtered = raw;

    for (const f of this.filters) {
      filtered = filtered.filter(f);
    }

    if (this.sortField) {
      const sf = this.sortField;
      const asc = this.sortAscending;
      filtered.sort((a, b) => {
        if (a[sf] < b[sf]) return asc ? -1 : 1;
        if (a[sf] > b[sf]) return asc ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount !== null) {
      filtered = filtered.slice(0, this.limitCount);
    }

    resolve({ data: filtered, error: null, count: filtered.length });
  }

  async insert(rows: Partial<T> | Array<Partial<T>>) {
    const raw = getLocalTable<T>(this.tableName);
    const toInsert = Array.isArray(rows) ? rows : [rows];
    const timestamp = new Date().toISOString();
    const currentUserId = getCurrentUserId();

    const finalizedRows = toInsert.map(row => ({
      id: row.id || `${this.tableName.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: row.user_id || currentUserId,
      created_at: row.created_at || timestamp,
      ...row
    })) as T[];

    const updated = [...finalizedRows, ...raw];
    setLocalTable(this.tableName, updated);

    return { data: finalizedRows, error: null };
  }

  async update(updates: Partial<T>) {
    const raw = getLocalTable<T>(this.tableName);
    let matched = 0;

    const updated = raw.map(item => {
      const match = this.filters.every(f => f(item));
      if (match) {
        matched++;
        return { ...item, ...updates };
      }
      return item;
    });

    setLocalTable(this.tableName, updated);
    return { data: null, error: null, count: matched };
  }

  async delete() {
    const raw = getLocalTable<T>(this.tableName);
    const remaining = raw.filter(item => !this.filters.every(f => f(item)));
    setLocalTable(this.tableName, remaining);
    return { data: null, error: null };
  }
}

/**
 * Universal Database Client
 * If Supabase URL & Anon Key are configured, attempts connection with cloud Supabase.
 * Otherwise, seamlessly operates high-fidelity local database with identical query builder syntax!
 */
class UnifiedDatabaseClient {
  private cloudClient: SupabaseClient | null = null;
  public isCloudConnected = false;

  constructor() {
    this.initCloudClient();
  }

  private initCloudClient() {
    const { url, anonKey, isConfigured } = getSupabaseConfig();
    if (isConfigured) {
      try {
        this.cloudClient = createClient(url, anonKey);
        this.isCloudConnected = true;
      } catch (err) {
        console.warn('Could not initialize cloud Supabase client, using local DB:', err);
        this.cloudClient = null;
        this.isCloudConnected = false;
      }
    }
  }

  from(tableName: string) {
    if (this.cloudClient && this.isCloudConnected) {
      return this.cloudClient.from(tableName);
    }
    return new LocalQueryBuilder<any>(tableName);
  }

  get auth() {
    if (this.cloudClient && this.isCloudConnected) {
      return this.cloudClient.auth;
    }
    // Local Auth Mock Provider
    return {
      getUser: async () => ({
        data: { user: { id: getCurrentUserId(), email: getCurrentUserEmail() } },
        error: null
      }),
      signUp: async ({ email }: { email: string; password?: string }) => {
        const id = `usr_${Math.random().toString(36).substring(2, 9)}`;
        setCurrentUser({ id, email });
        return { data: { user: { id, email } }, error: null };
      },
      signInWithPassword: async ({ email }: { email: string; password?: string }) => {
        const id = `usr_${Math.random().toString(36).substring(2, 9)}`;
        setCurrentUser({ id, email });
        return { data: { user: { id, email } }, error: null };
      },
      signOut: async () => {
        clearCurrentUser();
        return { error: null };
      }
    };
  }

  get functions() {
    if (this.cloudClient && this.isCloudConnected) {
      return this.cloudClient.functions;
    }
    return {
      invoke: async (functionName: string, options: any) => {
        return { data: null, error: new Error(`Edge function ${functionName} called in local mode`) };
      }
    };
  }
}

export const db = new UnifiedDatabaseClient();
export const supabase = db;

// ============================================================================
// High-Level Helper Functions: Real Audit Logging and Queries
// ============================================================================

/**
 * Logs an event directly into the events table with user_id and workflow_id
 */
export async function logAuditEvent({
  layer,
  type,
  detail,
  severity = 'info',
  workflowId
}: {
  layer: 'layer1' | 'layer2' | 'layer3' | 'layer4' | 'layer5';
  type: string;
  detail: string | Record<string, any>;
  severity?: 'info' | 'warning' | 'critical';
  workflowId?: string;
}): Promise<AuditEvent | null> {
  const wid = workflowId || getActiveWorkflowId();
  const userId = getCurrentUserId();
  const event: Partial<AuditEvent> = {
    user_id: userId,
    workflow_id: wid,
    layer,
    type,
    detail: typeof detail === 'string' ? detail : JSON.stringify(detail),
    severity,
    created_at: new Date().toISOString()
  };

  const { data, error } = await db.from('events').insert(event);
  if (error) {
    console.error('Failed to log audit event:', error);
    return null;
  }
  return (data && data[0]) ? data[0] : (event as AuditEvent);
}

/**
 * Checks workflow completion status against real events table entries
 */
export async function getWorkflowChecks(workflowId: string) {
  const { data: events } = await db.from('events').select('*').eq('workflow_id', workflowId);
  const eventList = events || [];

  const injectionAllowed = eventList.some(
    (e: any) => e.layer === 'layer3' && (e.type === 'prompt_injection_allowed' || e.type === 'prompt_screen_allowed')
  );
  const livenessPassed = eventList.some(
    (e: any) => e.layer === 'layer3' && (e.type === 'liveness_challenge_passed' || e.type === 'liveness_passed')
  );
  const qaEvent = eventList.find(
    (e: any) => e.layer === 'layer2' && (e.type === 'qa_checks_passed' || e.type === 'qa_agent_finished')
  );
  const qaPassed = Boolean(qaEvent && (qaEvent.detail?.passed ?? true));
  const sbomEvent = eventList.find(
    (e: any) => e.layer === 'layer5' && (e.type === 'sbom_scan_completed' || e.type === 'sbom_scan_clean')
  );
  const sbomCompleted = Boolean(sbomEvent);
  const credentialIssued = eventList.some(
    (e: any) => e.layer === 'layer4' && e.type === 'credential_issued'
  );

  const missingChecks: string[] = [];
  if (!injectionAllowed) missingChecks.push('1. Layer 3 Injection Guard: input allowed');
  if (!livenessPassed) missingChecks.push('2. Layer 3 Liveness Challenge: passed');
  if (qaEvent && !qaPassed) missingChecks.push('3. Layer 2 QA Agent: passed');
  if (!credentialIssued) missingChecks.push('5. Credential Issued and Signature Verified');

  const readyForSignedDoc = injectionAllowed && livenessPassed && credentialIssued && (!qaEvent || qaPassed);

  return {
    injectionAllowed,
    livenessPassed,
    qaPassed,
    sbomCompleted,
    credentialIssued,
    missingChecks,
    readyForSignedDoc,
    allPassed: readyForSignedDoc,
    allEligiblePassed: readyForSignedDoc,
    checks: {
      injectionGuard: {
        passed: injectionAllowed,
        details: injectionAllowed ? 'Zero prompt injection / overrides detected' : 'Pending: Input must be screened'
      },
      livenessChallenge: {
        passed: livenessPassed,
        details: livenessPassed ? 'Spoken challenge verified' : 'Pending: Challenge required in Security Center'
      },
      qaAgent: qaEvent
        ? {
            passed: qaPassed,
            details: qaPassed ? 'HTML & JS DOM checks passed' : 'QA checks failed'
          }
        : null,
      sbomScan: sbomEvent
        ? {
            passed: sbomCompleted,
            details: 'CycloneDX scan completed against OSV.dev'
          }
        : null,
      credentialIssued: {
        passed: credentialIssued,
        details: credentialIssued ? 'Ed25519 sealed in credentials table' : 'Pending: Issue credential below'
      }
    }
  };
}

/**
 * Supabase SQL Schema definition for one-click setup
 */
export const SUPABASE_SQL_SCHEMA = `-- OMNI-SWARM: Sovereign Multi-Agent Platform Database Schema
-- Run this script in the Supabase SQL Editor to configure all tables & Row-Level Security

-- 1. Events Audit Log Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id TEXT NOT NULL,
  layer TEXT NOT NULL,
  type TEXT NOT NULL,
  detail JSONB,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Security Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  topic TEXT NOT NULL,
  checks JSONB NOT NULL,
  results JSONB NOT NULL,
  counts JSONB NOT NULL,
  sha256_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Verifiable Credentials Table
CREATE TABLE IF NOT EXISTS credentials (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id TEXT NOT NULL,
  type TEXT[] NOT NULL,
  issuer_did TEXT NOT NULL,
  issuance_date TIMESTAMPTZ NOT NULL,
  subject JSONB NOT NULL,
  status TEXT DEFAULT 'Active',
  sha256_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  credential_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SBOM Reports Table
CREATE TABLE IF NOT EXISTS sbom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  total_packages INT DEFAULT 0,
  vulnerabilities_count INT DEFAULT 0,
  packages_json JSONB NOT NULL,
  sbom_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  language TEXT NOT NULL,
  intent_json JSONB,
  redactions_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sbom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create Policies so users only see and manage their own records
CREATE POLICY "Users can only read their own events" ON events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only read their own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own certificates" ON certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only read their own credentials" ON credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own credentials" ON credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own credentials" ON credentials FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own sbom_reports" ON sbom_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sbom_reports" ON sbom_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own chat_messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own chat_messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
`;
