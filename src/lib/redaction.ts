/**
 * Privacy Redaction Engine
 * Scans and redacts Aadhaar numbers, Indian mobile numbers, PAN cards, and emails
 * before any text is processed or dispatched to LLM APIs.
 */

export interface RedactedItem {
  type: 'Aadhaar' | 'Phone Number' | 'PAN Card' | 'Email Address';
  original: string;
  redacted: string;
}

export function redactSensitivePii(rawText: string): {
  cleanText: string;
  redactedItems: RedactedItem[];
  hasRedactions: boolean;
} {
  if (!rawText) {
    return { cleanText: '', redactedItems: [], hasRedactions: false };
  }

  let text = rawText;
  const redactedItems: RedactedItem[] = [];

  // 1. Aadhaar Number (12 digits, often formatted as 4-4-4 or spaced)
  const aadhaarRegex = /\b[2-9]{1}\d{3}[ -]?\d{4}[ -]?\d{4}\b/g;
  text = text.replace(aadhaarRegex, (match) => {
    const redacted = '[REDACTED AADHAAR: XXXX-XXXX-XXXX]';
    redactedItems.push({
      type: 'Aadhaar',
      original: match,
      redacted
    });
    return redacted;
  });

  // 2. PAN Card (5 letters, 4 numbers, 1 letter: e.g., ABCDE1234F)
  const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;
  text = text.replace(panRegex, (match) => {
    const redacted = '[REDACTED PAN: XXXXX0000X]';
    redactedItems.push({
      type: 'PAN Card',
      original: match,
      redacted
    });
    return redacted;
  });

  // 3. Indian Phone Numbers (10 digits starting with 6-9, optional +91 or 0)
  const phoneRegex = /(?:\+91[\-\s]?|0)?[6-9]\d{4}[\-\s]?\d{5}\b/g;
  text = text.replace(phoneRegex, (match) => {
    // Avoid redacting parts of already redacted strings
    if (match.includes('REDACTED')) return match;
    const redacted = '[REDACTED PHONE: +91 XXXXX XXXXX]';
    redactedItems.push({
      type: 'Phone Number',
      original: match.trim(),
      redacted
    });
    return redacted;
  });

  // 4. Email Address
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  text = text.replace(emailRegex, (match) => {
    const redacted = '[REDACTED EMAIL: user@domain]';
    redactedItems.push({
      type: 'Email Address',
      original: match,
      redacted
    });
    return redacted;
  });

  return {
    cleanText: text,
    redactedItems,
    hasRedactions: redactedItems.length > 0
  };
}
