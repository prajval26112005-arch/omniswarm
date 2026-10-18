/**
 * Speech Recognition utility with Web Speech API and fallback simulation.
 * Supports Kannada (kn-IN), Hindi (hi-IN), and English (en-IN).
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'auto', label: 'Auto-Detect (ಸ್ವಯಂ / स्वचालित / Auto)', bcp47: 'en-IN' },
  { code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)', bcp47: 'kn-IN' },
  { code: 'hi-IN', label: 'Hindi (हिन्दी)', bcp47: 'hi-IN' },
  { code: 'en-IN', label: 'English (English - IN)', bcp47: 'en-IN' },
];

/**
 * Detect language script from text input
 */
export function detectLanguageFromText(text = '') {
  if (!text || text.trim() === '') return 'English';
  
  // Kannada Unicode block: \u0C80-\u0CFF
  const kannadaRegex = /[\u0C80-\u0CFF]/;
  // Devanagari Unicode block: \u0900-\u097F
  const devanagariRegex = /[\u0900-\u097F]/;

  if (kannadaRegex.test(text)) return 'Kannada';
  if (devanagariRegex.test(text)) return 'Hindi';
  return 'English';
}

/**
 * Check if the browser supports native Web Speech API
 */
export function isWebSpeechSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Initialize Web Speech API instance
 */
export function createSpeechRecognizer({
  language = 'auto',
  onResult,
  onError,
  onEnd,
  onStart
}) {
  if (!isWebSpeechSupported()) {
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  // Set initial language; auto will default to kn-IN / hi-IN depending on regional default or en-IN
  recognition.lang = language === 'auto' ? 'kn-IN' : language;

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcriptPiece = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcriptPiece;
      } else {
        interimTranscript += transcriptPiece;
      }
    }

    if (onResult) {
      onResult({
        finalTranscript,
        interimTranscript,
        isFinal: Boolean(finalTranscript && !interimTranscript)
      });
    }
  };

  recognition.onerror = (event) => {
    if (onError) onError(event);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
