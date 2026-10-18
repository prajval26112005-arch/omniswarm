/**
 * Verifiable Credential Engine for Layer 4
 * Issues, manages, revokes, and verifies W3C-style JSON-LD Verifiable Credentials
 * Uses Ed25519 signatures over canonical SHA-256 digests
 */

import { computeSha256, signCanonicalData, verifySignature, getIssuerKeypair } from './crypto';
import { db, logAuditEvent, getCurrentUserId } from './supabase';
import { VerifiableCredential, VerifiableCredentialSubject } from '../types';

export async function issueVerifiableCredential({
  workflowId,
  workflowType,
  title,
  language,
  summary,
  details,
  handwrittenSignature
}: {
  workflowId: string;
  workflowType: string;
  title: string;
  language: string;
  summary: string;
  details?: Record<string, any>;
  handwrittenSignature?: string;
}): Promise<VerifiableCredential> {
  const timestamp = new Date().toISOString();
  const id = `vc:omni:${Date.now()}`;
  const userId = getCurrentUserId();
  const { did } = await getIssuerKeypair();

  const credentialSubject: VerifiableCredentialSubject = {
    id: `did:omni:citizen:${userId.slice(0, 12)}`,
    workflow_id: workflowId,
    workflow_type: workflowType,
    title,
    language,
    user_id: userId,
    summary,
    ...(handwrittenSignature ? { handwrittenSignature } : {}),
    details: details || {}
  };

  // Canonical Credential Body
  const credentialBody = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1'
    ],
    id,
    type: ['VerifiableCredential', 'DigitalRecordCredential'],
    issuer: did,
    issuanceDate: timestamp,
    credentialSubject
  };

  // Sign with Ed25519 over canonical SHA-256
  const { hash, signature } = await signCanonicalData(credentialBody);

  const proof = {
    type: 'Ed25519Signature2020',
    created: timestamp,
    verificationMethod: `${did}#key-1`,
    proofPurpose: 'assertionMethod',
    jws: signature,
    canonicalSha256: hash
  };

  const fullCredentialJson = {
    ...credentialBody,
    proof
  };

  const credential: VerifiableCredential = {
    id,
    user_id: userId,
    workflow_id: workflowId,
    type: ['VerifiableCredential', 'DigitalRecordCredential'],
    issuer_did: did,
    issuance_date: timestamp,
    subject: credentialSubject,
    status: 'Active',
    sha256_hash: hash,
    signature,
    credential_json: fullCredentialJson,
    created_at: timestamp
  };

  // Insert into credentials table
  await db.from('credentials').insert(credential);

  // Log in events table
  await logAuditEvent({
    layer: 'layer4',
    type: 'credential_issued',
    detail: { credentialId: id, hash, type: 'DigitalRecordCredential' },
    severity: 'info',
    workflowId
  });

  return credential;
}

export async function revokeVerifiableCredential(credentialId: string, workflowId: string): Promise<boolean> {
  const { error } = await db.from('credentials').update({ status: 'Revoked' }).eq('id', credentialId);
  if (error) {
    console.error('Failed to revoke credential:', error);
    return false;
  }

  await logAuditEvent({
    layer: 'layer4',
    type: 'credential_revoked',
    detail: { credentialId, status: 'Revoked' },
    severity: 'warning',
    workflowId
  });

  return true;
}

export async function verifyVerifiableCredential(credential: VerifiableCredential): Promise<{
  valid: boolean;
  isRevoked: boolean;
  hashValid: boolean;
  signatureValid: boolean;
  computedHash: string;
}> {
  const isRevoked = credential.status === 'Revoked';

  // Extract base canonical body before proof
  const body = {
    '@context': credential.credential_json?.['@context'] || [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1'
    ],
    id: credential.id,
    type: credential.type,
    issuer: credential.issuer_did,
    issuanceDate: credential.issuance_date,
    credentialSubject: credential.subject
  };

  const verification = await verifySignature(body, credential.signature, credential.sha256_hash);

  return {
    valid: verification.valid && !isRevoked,
    isRevoked,
    hashValid: verification.valid,
    signatureValid: verification.signatureValid,
    computedHash: verification.computedHash
  };
}
