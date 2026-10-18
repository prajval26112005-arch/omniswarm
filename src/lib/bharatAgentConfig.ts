/**
 * Bharat Agent Configuration & Settings Persistence
 */

export const DEFAULT_BHARAT_AGENT_URL = 'https://bharat-agent-rcrg2kjhujukkroyfijmkb.streamlit.app/?embed=true';
const STORAGE_KEY = 'omni_bharat_agent_url';

export function getBharatAgentUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_BHARAT_AGENT_URL;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_BHARAT_AGENT_URL;
}

export function saveBharatAgentUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const clean = url.trim() || DEFAULT_BHARAT_AGENT_URL;
  localStorage.setItem(STORAGE_KEY, clean);
}
