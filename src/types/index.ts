/**
 * OMNI-SWARM: Core TypeScript Type Definitions
 * Covers all 5 layers, Database Models, Cryptographic Records, and Workflows
 */

export type LayerId = 'layer1' | 'layer2' | 'layer3' | 'layer4' | 'layer5';
export type Severity = 'info' | 'warning' | 'critical';

export interface AuditEvent {
  id: string;
  user_id: string;
  workflow_id: string;
  layer: LayerId;
  type: string;
  detail: string | Record<string, any>;
  severity: Severity;
  created_at: string;
}

export interface SecurityChecks {
  promptInjectionRule: 'PASSED' | 'BLOCKED';
  promptInjectionClassifier: 'CLEAN' | 'FLAGGED';
  livenessChallenge?: 'PASSED' | 'FAILED' | 'PENDING';
  sessionRateLimit: 'VALID' | 'RATE_LIMITED';
  egressEnclave: '0_BYTES_AIRGAPPED';
}

export interface SecurityResults {
  overallStatus: 'ALLOWED' | 'BLOCKED';
  confidence: number;
  reason?: string;
  ruleViolations?: string[];
  latencyMs: number;
}

export interface Certificate {
  id: string;
  user_id: string;
  workflow_id: string;
  timestamp: string; // ISO
  topic: string;
  checks: SecurityChecks;
  results: SecurityResults;
  counts: {
    blocked: number;
    allowed: number;
  };
  sha256_hash: string;
  signature: string;
  created_at: string;
}

export interface VerifiableCredentialSubject {
  id: string;
  workflow_id: string;
  workflow_type: string;
  title: string;
  language: string;
  user_id?: string;
  user_name?: string;
  summary: string;
  handwrittenSignature?: string;
  details?: Record<string, any>;
  checks_summary?: Record<string, string>;
  [key: string]: any;
}

export interface VerifiableCredential {
  id: string;
  user_id: string;
  workflow_id: string;
  type: string[];
  issuer_did: string;
  issuance_date: string; // ISO
  subject: VerifiableCredentialSubject;
  status: 'Active' | 'Revoked';
  sha256_hash: string;
  signature: string;
  credential_json: Record<string, any>;
  created_at: string;
}

export interface SbomPackage {
  name: string;
  version: string;
  type: string;
  purl?: string;
  vulnerabilities: Array<{
    id: string;
    summary: string;
    severity: string;
    fixed_version?: string;
  }>;
}

export interface SbomReport {
  id: string;
  user_id: string;
  workflow_id: string;
  filename: string;
  total_packages: number;
  vulnerabilities_count: number;
  packages_json: SbomPackage[];
  sbom_json: Record<string, any>;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  workflow_id: string;
  sender: 'user' | 'assistant';
  text: string;
  language: string;
  intent_json?: {
    intent: string;
    language: string;
    entities: Record<string, any>;
    redactions: Array<{ type: string; original: string; redacted: string }>;
  };
  redactions_json?: Array<{ type: string; original: string; redacted: string }>;
  created_at: string;
}

export interface AgentArchitectPlan {
  projectName: string;
  architectureSummary: string;
  pages: Array<{ name: string; description: string }>;
  dataSchema: Array<{ entity: string; fields: string[] }>;
  apiEndpoints: Array<{ method: string; path: string; description: string }>;
  realDataSources: Array<{ name: string; url: string; rationale: string }>;
}

export interface AgentDeveloperCode {
  htmlApp: string;
  pythonFastAPI: string;
  requirementsTxt: string;
  readmeMd: string;
}

export interface QACheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

export interface QAReport {
  passed: boolean;
  attempt: number;
  checks: QACheckResult[];
  errorsCaught: string[];
  reviewedAt: string;
}

export interface WorkflowGateStatus {
  layer3InjectionAllowed?: boolean;
  layer3LivenessPassed?: boolean;
  layer2QAPassed?: boolean;
  layer5SbomCompleted?: boolean;
  credentialIssued?: boolean;
  allEligiblePassed?: boolean;
  missingChecks: string[];
  readyForSignedDoc: boolean;
  allPassed: boolean;
  checks: {
    injectionGuard: { passed: boolean; details: string };
    livenessChallenge: { passed: boolean; details: string };
    qaAgent: { passed: boolean; details: string } | null;
    sbomScan: { passed: boolean; details: string } | null;
    credentialIssued: { passed: boolean; details: string };
  };
}
