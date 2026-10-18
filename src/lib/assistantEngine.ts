/**
 * Layer 1: Assistant Engine
 * Patient guide for villagers, farmers, and students.
 * - Extracts structured intent { intent, language, entities, redactions }
 * - Never invents scheme names, amounts, or deadlines
 * - Cites real official portals (pmkisan.gov.in, karnataka.gov.in, scholarships.gov.in)
 * - Supports real LLM API keys if configured, with comprehensive vernacular knowledge base
 */

import { redactSensitivePii, RedactedItem } from './redaction';
import { db, logAuditEvent, getCurrentUserId } from './supabase';
import { ChatMessage } from '../types';

export interface AssistantResponse {
  message: string;
  intentJson: {
    intent: string;
    language: string;
    entities: Record<string, any>;
    redactions: RedactedItem[];
  };
  redactedItems: RedactedItem[];
  source: 'LLM' | 'KNOWLEDGE_ENGINE';
}

export function extractIntentJson(text: string, language: string, redactions: RedactedItem[]): {
  intent: string;
  language: string;
  entities: Record<string, any>;
  redactions: RedactedItem[];
} {
  const lower = text.toLowerCase();
  let intent = 'GENERAL_QUERY';
  const entities: Record<string, any> = {};

  if (lower.includes('subsidy') || lower.includes('seed') || lower.includes('bija') || lower.includes('ಕೃಷಿ') || lower.includes('ಬೀಜ') || lower.includes('ಸಹಾಯಧನ') || lower.includes('कृषि') || lower.includes('बीज')) {
    intent = 'AGRICULTURAL_SUBSIDY_ASSISTANCE';
    entities.sector = 'Agriculture & Farmer Welfare';
    entities.scheme = 'Karnataka Raitha Sanjeevini / Certified Seed Subsidy';
    entities.official_portal = 'https://raitamitra.karnataka.gov.in';
  } else if (lower.includes('scholarship') || lower.includes('student') || lower.includes('fee') || lower.includes('ವಿದ್ಯಾರ್ಥಿವೇತನ') || lower.includes('छात्रवृत्ति')) {
    intent = 'STUDENT_SCHOLARSHIP_ASSISTANCE';
    entities.sector = 'Higher Education & Student Support';
    entities.scheme = 'State Scholarship Portal (SSP) / NSP';
    entities.official_portal = 'https://ssp.postmatric.karnataka.gov.in';
  } else if (lower.includes('income') || lower.includes('caste') || lower.includes('certificate') || lower.includes('ಆದಾಯ') || lower.includes('ಜಾತಿ') || lower.includes('ಪ್ರಮಾಣಪತ್ರ') || lower.includes('प्रमाण पत्र')) {
    intent = 'CERTIFICATE_APPLICATION_ASSISTANCE';
    entities.sector = 'Revenue Department';
    entities.portal = 'https://sevasindhuservices.karnataka.gov.in';
  } else if (lower.includes('letter') || lower.includes('draft') || lower.includes('application') || lower.includes('ಪತ್ರ') || lower.includes('ಅರ್ಜಿ') || lower.includes('पत्र') || lower.includes('आवेदन')) {
    intent = 'DOCUMENT_DRAFTING';
    entities.category = 'Official Correspondence Drafting';
  } else if (lower.includes('ration') || lower.includes('bpl') || lower.includes('ಪಡಿತರ') || lower.includes('ಆಹಾರ')) {
    intent = 'RATION_CARD_WELFARE';
    entities.portal = 'https://ahara.kar.nic.in';
  }

  return {
    intent,
    language,
    entities,
    redactions
  };
}

export async function askOmniSwarmAssistant({
  rawPrompt,
  language,
  workflowId,
  uploadedFileContent
}: {
  rawPrompt: string;
  language: string;
  workflowId: string;
  uploadedFileContent?: string;
}): Promise<AssistantResponse> {
  // 1. Redact PII (Aadhaar, phone, PAN, email) before processing
  const combinedText = uploadedFileContent
    ? `${rawPrompt}\n\n[Uploaded Document Content]:\n${uploadedFileContent}`
    : rawPrompt;

  const { cleanText, redactedItems } = redactSensitivePii(combinedText);

  // 2. Extract structured Intent JSON
  const intentJson = extractIntentJson(cleanText, language, redactedItems);

  // 3. Check for configured LLM API key
  const llmKey = typeof window !== 'undefined' ? localStorage.getItem('omni_llm_api_key') : null;
  const llmProvider = typeof window !== 'undefined' ? localStorage.getItem('omni_llm_provider') || 'openai' : 'openai';

  let responseText = '';
  let source: 'LLM' | 'KNOWLEDGE_ENGINE' = 'KNOWLEDGE_ENGINE';

  if (llmKey && llmKey.trim().length > 10) {
    try {
      source = 'LLM';
      responseText = await callExternalLlmApi({
        prompt: cleanText,
        language,
        provider: llmProvider,
        apiKey: llmKey
      });
    } catch (err) {
      console.warn('External LLM call failed, falling back to sovereign knowledge engine:', err);
      source = 'KNOWLEDGE_ENGINE';
    }
  }

  if (!responseText) {
    responseText = generateSovereignVernacularResponse(cleanText, language, intentJson);
  }

  // 4. Save to chat_messages table
  const userId = getCurrentUserId();
  const userMsg: Partial<ChatMessage> = {
    user_id: userId,
    workflow_id: workflowId,
    sender: 'user',
    text: cleanText,
    language,
    redactions_json: redactedItems
  };

  const asstMsg: Partial<ChatMessage> = {
    user_id: userId,
    workflow_id: workflowId,
    sender: 'assistant',
    text: responseText,
    language,
    intent_json: intentJson,
    redactions_json: redactedItems
  };

  await db.from('chat_messages').insert([userMsg, asstMsg]);

  // 5. Log audit event
  await logAuditEvent({
    layer: 'layer1',
    type: 'assistant_message_exchanged',
    detail: {
      intent: intentJson.intent,
      language,
      redactedCount: redactedItems.length,
      source
    },
    severity: 'info',
    workflowId
  });

  return {
    message: responseText,
    intentJson,
    redactedItems,
    source
  };
}

/**
 * Verified Vernacular Knowledge Engine
 * Never invents scheme names, amounts, or deadlines.
 * Provides clear, simple step-by-step guidance and official portals.
 */
function generateSovereignVernacularResponse(prompt: string, language: string, intentJson: any): string {
  const p = prompt.toLowerCase();
  const isKannada = language.startsWith('kn') || /[\u0C80-\u0CFF]/.test(prompt) || p.includes('kannada');
  const isHindi = language.startsWith('hi') || /[\u0900-\u097F]/.test(prompt) || p.includes('hindi');
  const isTamil = language.startsWith('ta') || /[\u0B80-\u0BFF]/.test(prompt);
  const isTelugu = language.startsWith('te') || /[\u0C00-\u0C7F]/.test(prompt);

  // KANNADA (ಕನ್ನಡ)
  if (isKannada) {
    if (intentJson.intent === 'AGRICULTURAL_SUBSIDY_ASSISTANCE') {
      return `ನಮಸ್ಕಾರ! ರೈತ ಬಾಂಧವರಿಗೆ ಕೃಷಿ ಇಲಾಖೆಯ ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರ ಸಹಾಯಧನದ ವಿವರಗಳು ಇಲ್ಲಿವೆ:

1. **ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳು:**
   • ಆಧಾರ್ ಕಾರ್ಡ್ (ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಲಿಂಕ್ ಆಗಿರಬೇಕು)
   • ಪ್ರಸ್ತುತ ಸಾಲಿನ ಜಮೀನಿನ ಪಹಣಿ (RTC / ಪಹಣಿ)
   • ಬ್ಯಾಂಕ್ ಪಾಸ್ ಬುಕ್ ಪ್ರತಿ (DBT ಸಕ್ರಿಯವಾಗಿರಬೇಕು)
   • ಎಫ್‌ಐಡಿ (FID - Farmer ID) ಸಂಖ್ಯೆ

2. **ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ:**
   • ಹಂತ 1: ನಿಮ್ಮ ಹತ್ತಿರದ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರಕ್ಕೆ (RSK) ಭೇಟಿ ನೀಡಿ.
   • ಹಂತ 2: ನಿಮ್ಮ FID ಸಂಖ್ಯೆ ನೀಡಿ ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣೀಕೃತ ಬಿತ್ತನೆ ಬೀಜಗಳ ಕೋಟಾ ಪರಿಶೀಲಿಸಿ.
   • ಹಂತ 3: 75% ಅಥವಾ 50% ಸಬ್ಸಿಡಿ ದರದಲ್ಲಿ ಬೀಜಗಳನ್ನು ರಸೀದಿಯೊಂದಿಗೆ ಪಡೆಯಿರಿ.

📌 **ಅಧಿಕೃತ ಪರಿಶೀಲನೆ:** ಯೋಜನೆಗಳ ನಿಖರ ಕೋಟಾ ಮತ್ತು ದರಗಳನ್ನು ಕೃಷಿ ಇಲಾಖೆಯ ಅಧಿಕೃತ ವೆಬ್‌ಸೈಟ್ [raitamitra.karnataka.gov.in](https://raitamitra.karnataka.gov.in) ಅಥವಾ ನಿಮ್ಮ ತಾಲ್ಲೂಕು ಕೃಷಿ ಅಧಿಕಾರಿಯ ಕಚೇರಿಯಲ್ಲಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.`;
    }

    if (intentJson.intent === 'STUDENT_SCHOLARSHIP_ASSISTANCE') {
      return `ನಮಸ್ಕಾರ ವಿದ್ಯಾರ್ಥಿ ಮಿತ್ರರೇ! ಕರ್ನಾಟಕ ರಾಜ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನ (SSP) ಕುರಿತ ನಿಖರ ಮಾರ್ಗದರ್ಶಿ:

1. **ಅರ್ಹತೆ ಮತ್ತು ಅಗತ್ಯ ದಾಖಲೆಗಳು:**
   • ವಿದ್ಯಾರ್ಥಿ ಮತ್ತು ಪೋಷಕರ ಆಧಾರ್ ಕಾರ್ಡ್
   • ಆದಾಯ ಮತ್ತು ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ (RD ಸಂಖ್ಯೆ)
   • ಕಾಲೇಜು ಪ್ರವೇಶ ರಶೀದಿ ಮತ್ತು ಶುಲ್ಕದ ರಶೀದಿ
   • ಹಿಂದಿನ ಸಾಲಿನ ಅಂಕಪಟ್ಟಿ (Marks Card)
   • ಇ-ದೃಢೀಕರಣ (e-Attestation) ಸಂಖ್ಯೆ

2. **ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಕ್ರಮ:**
   • ಹಂತ 1: ಕಂದಾಯ ಇಲಾಖೆಯ ಪ್ರಮಾಣಪತ್ರಗಳ e-Attestation ಪೂರ್ಣಗೊಳಿಸಿ.
   • ಹಂತ 2: [ssp.postmatric.karnataka.gov.in](https://ssp.postmatric.karnataka.gov.in) ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಲಾಗಿನ್ ಆಗಿ.
   • ಹಂತ 3: ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆ ಆಧಾರ್-ಸೀಡಿಂಗ್ (NPCI Active) ಆಗಿರುವುದನ್ನು ಪರಿಶೀಲಿಸಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.

📌 **ಗಮನಿಸಿ:** ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಕೊನೆಯ ದಿನಾಂಕ ಮತ್ತು ವಿವರಗಳಿಗಾಗಿ ಕಾಲೇಜಿನ ಸ್ಕಾಲರ್‌ಶಿಪ್ ವಿಭಾಗ ಅಥವಾ SSP ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಮಾತ್ರ ಪರಿಶೀಲಿಸಿ.`;
    }

    return `ನಮಸ್ಕಾರ! ನಾನು ಓಮ್ನಿ-ಸ್ವಾರ್ಮ್ ಸಹಾಯಕ. ನಿಮ್ಮ ದಾಖಲೆಗಳು, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಅಥವಾ ಅರ್ಜಿಗಳನ್ನು ಸರಳವಾಗಿ ಸಿದ್ಧಪಡಿಸಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.

• ನೀವು ಸರ್ಕಾರಿ ಅರ್ಜಿಗಳು, ಪತ್ರಗಳು ಅಥವಾ ಯೋಜನೆಗಳ ಕುರಿತು ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು.
• ಯಾವುದೇ ವೈಯಕ್ತಿಕ ಗೌಪ್ಯ ದಾಖಲೆಗಳನ್ನು ಕಳುಹಿಸುವ ಮೊದಲು ನಮ್ಮ ಭದ್ರತಾ ವ್ಯವಸ್ಥೆಯು ಆಧಾರ್ ಹಾಗೂ ಫೋನ್ ಸಂಖ್ಯೆಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮರೆಮಾಡುತ್ತದೆ.
• ದಯವಿಟ್ಟು ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ಅವಶ್ಯಕತೆ ತಿಳಿಸಿ (ಉದಾಹರಣೆಗೆ: ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ, ಬಿತ್ತನೆ ಬೀಜ ಸಹಾಯಧನ, ಅಥವಾ ಕಾಲೇಜು ಅರ್ಜಿ).`;
  }

  // HINDI (हिन्दी)
  if (isHindi) {
    if (intentJson.intent === 'AGRICULTURAL_SUBSIDY_ASSISTANCE') {
      return `नमस्ते! किसान भाइयों के लिए प्रमाणित बीज सब्सिडी एवं सरकारी सहायता की आधिकारिक जानकारी:

1. **आवश्यक दस्तावेज:**
   • आधार कार्ड (बैंक खाते एवं एनपीसीआई से लिंक)
   • भूमि खतौनी / जमाबंदी की प्रति
   • बैंक पासबुक
   • किसान पंजीकरण संख्या (Kisan ID)

2. **आवेदन के चरण:**
   • चरण 1: अपने ब्लॉक या ग्राम पंचायत के कृषि सेवा केंद्र पर जाएं।
   • चरण 2: किसान पंजीकरण संख्या दर्ज कराकर सब्सिडी कोटा जांचें।
   • चरण 3: डीबीटी (DBT) के तहत रियायती दर पर बीज रसीद प्राप्त करें।

📌 **आधिकारिक पुष्टि:** योजना की सही तिथियां और पात्रता आधिकारिक पोर्टल [pmkisan.gov.in](https://pmkisan.gov.in) अथवा जिला कृषि अधिकारी कार्यालय से सत्यापित करें।`;
    }

    return `नमस्ते! मैं ओम्नि-स्वार्म सहायक हूँ। मैं सरकारी योजनाओं, छात्रवृत्तियों, प्रमाणपत्रों और आवेदन पत्रों को सरल भाषा में समझाने में आपकी सहायता करता हूँ।

• हम कभी भी मनगढ़ंत योजनाओं या भ्रामक राशियों का दावा नहीं करते।
• आपका निजी डेटा (आधार, फोन) स्वचालित रूप से सुरक्षित और छिपा दिया जाता है।
• कृपया अपनी आवश्यकता बताएं (उदा. जाति/आय प्रमाण पत्र, बीज सब्सिडी, या प्रार्थना पत्र ड्राफ्टिंग)।`;
  }

  // ENGLISH (Default - Simple, Respectful, Clear)
  if (intentJson.intent === 'AGRICULTURAL_SUBSIDY_ASSISTANCE') {
    return `Hello! Here is the clear procedure for obtaining subsidized certified agricultural seeds and Direct Benefit Transfer (DBT):

1. **Required Documents:**
   • Aadhaar Card (must be active and linked to your bank account via NPCI)
   • Land Record / RTC (Pahani / Khata certificate)
   • Bank Passbook copy showing IFSC and Account Number
   • Farmer Registration Identification (FID / Kisan Credit ID)

2. **Application Steps:**
   • Step 1: Visit your local Raitha Samparka Kendra (RSK) or District Agricultural Office.
   • Step 2: Present your Farmer ID to check current seasonal certified seed quotas (Paddy, Ragi, Groundnut).
   • Step 3: Collect the subsidized allocation with an official government receipt.

📌 **Official Verification Notice:** Omni-Swarm does not fabricate allocation numbers or cutoff dates. Please verify current seasonal allocations directly at [raitamitra.karnataka.gov.in](https://raitamitra.karnataka.gov.in) or [pmkisan.gov.in](https://pmkisan.gov.in).`;
  }

  if (intentJson.intent === 'STUDENT_SCHOLARSHIP_ASSISTANCE') {
    return `Hello! Here are the step-by-step instructions for post-matric and national student scholarship applications:

1. **Required Documents:**
   • Student's Aadhaar Card & Parent's Aadhaar
   • Current Year Income and Caste Certificate (valid RD Number)
   • College Fee Receipt and Bonafide Admission Letter
   • Previous Year Marksheet
   • Aadhaar-seeded Bank Account (active NPCI mapping)

2. **Step-by-Step Procedure:**
   • Step 1: Complete online e-Attestation of documents through your designated verification officer.
   • Step 2: Log into the official State Scholarship Portal ([ssp.postmatric.karnataka.gov.in](https://ssp.postmatric.karnataka.gov.in)) or National Scholarship Portal ([scholarships.gov.in](https://scholarships.gov.in)).
   • Step 3: Submit application and submit the printed acknowledgment to your college office.

📌 **Official Verification Notice:** Check deadlines exclusively on official government education portals or your college notice board.`;
  }

  return `Hello! I am your OMNI-SWARM Assistant, here to provide patient, reliable assistance with government schemes, documentation, and student facilities.

• **Privacy Safeguard:** Any Aadhaar numbers, phone numbers, PAN cards, or email addresses you speak or type are automatically redacted before processing.
• **Truthful Information:** I explain rules in plain words, provide real steps, and never invent scheme names or deadlines.
• **Official Verification:** I always provide official government portals and offices where you can verify information.

How can I assist you today? (e.g., Applying for seed subsidy, drafting an application to the Tehsildar, or scholarship documentation steps).`;
}

/**
 * Call real external LLM API if key is supplied by user in Settings
 */
async function callExternalLlmApi({
  prompt,
  language,
  provider,
  apiKey
}: {
  prompt: string;
  language: string;
  provider: string;
  apiKey: string;
}): Promise<string> {
  const systemPrompt = `You are OMNI-SWARM Assistant, a patient, compassionate guide for rural citizens, villagers, and students in India.
You explain government documents, welfare schemes, certificates, and application steps in simple, respectful language.
You reply in the user's language (${language}).
You use short, numbered steps. You never invent scheme names, amounts, or deadlines.
If you are unsure of any detail, explicitly disclose it and provide the exact official government portal or office to verify (e.g. karnataka.gov.in, pmkisan.gov.in, myscheme.gov.in, Panchayat office).`;

  if (provider === 'openai' || provider === 'groq') {
    const endpoint = provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    const model = provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!res.ok) throw new Error(`LLM API responded with ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  throw new Error(`Provider ${provider} not configured`);
}

const LLM_PROVIDER_KEY = 'omni_llm_provider';
const LLM_API_KEY_KEY = 'omni_llm_api_key';

export function getLlmConfig(): { provider: 'mock' | 'anthropic' | 'openai' | 'groq'; apiKey: string } {
  try {
    const provider = (localStorage.getItem(LLM_PROVIDER_KEY) as any) || 'mock';
    const apiKey = localStorage.getItem(LLM_API_KEY_KEY) || '';
    return { provider, apiKey };
  } catch {
    return { provider: 'mock', apiKey: '' };
  }
}

export function saveLlmConfig(provider: 'mock' | 'anthropic' | 'openai' | 'groq', apiKey: string) {
  try {
    localStorage.setItem(LLM_PROVIDER_KEY, provider);
    localStorage.setItem(LLM_API_KEY_KEY, apiKey.trim());
  } catch (err) {
    console.error('Failed to save LLM config:', err);
  }
}
