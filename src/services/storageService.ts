const AI_KEY_STORAGE = 'tpc_ai_key';

export function getOpenAIKey(): string {
  // Clear any old cached keys from localStorage
  localStorage.removeItem('tpc_openai_key');
  return localStorage.getItem(AI_KEY_STORAGE)
    || import.meta.env.VITE_GROQ_API_KEY
    || import.meta.env.VITE_XAI_API_KEY
    || import.meta.env.VITE_OPENAI_API_KEY
    || '';
}

export function setOpenAIKey(key: string): void {
  localStorage.setItem(AI_KEY_STORAGE, key);
}

export function saveLocally<T extends Record<string, unknown>>(collection: string, data: T): void {
  const key = `tpc_${collection}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]') as T[];
  existing.push({ ...data, timestamp: new Date().toISOString(), id: Date.now().toString() } as T);
  localStorage.setItem(key, JSON.stringify(existing));
}

export async function saveToFirestore<T extends Record<string, unknown>>(
  collection: string,
  data: T
): Promise<string | null> {
  // Firebase integration placeholder — saves locally until Firebase SDK is configured
  saveLocally(collection, data);
  return null;
}
