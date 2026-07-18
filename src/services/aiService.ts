import { AI_ASSISTANTS } from '../data/aiAssistants';
import { FIREBASE_COLLECTIONS } from '../data/brand';
import type { AssistantId, ChatMessage } from '../types';
import { getOpenAIKey, saveToFirestore } from './storageService';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateAIResponse(
  userMessage: string,
  assistantType: AssistantId,
  history: ChatMessage[] = []
): Promise<string> {
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    throw new Error('Groq API key not configured. Please set it in the Admin Dashboard.');
  }

  const assistant = AI_ASSISTANTS[assistantType];
  const systemMessage: OpenAIMessage = { role: 'system', content: assistant.systemPrompt };

  // Build full conversation history for context-aware responses
  const historyMessages: OpenAIMessage[] = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const currentUserMsg: OpenAIMessage = { role: 'user', content: userMessage };

  await saveToFirestore(FIREBASE_COLLECTIONS.AI_REQUESTS, {
    assistant: assistantType,
    messages: [currentUserMsg],
    timestamp: new Date().toISOString(),
  });

  let response: Response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [systemMessage, ...historyMessages, currentUserMsg],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });
  } catch (networkErr) {
    console.error('Network error calling Groq:', networkErr);
    throw new Error('Could not reach Groq. Check your internet connection and try again.');
  }

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = response.statusText;
    }
    console.error(`Groq API error [${response.status}]:`, errorData);
    const parsed = errorData as { error?: string | { message?: string }; message?: string };
    const errMsg =
      (typeof parsed?.error === 'string' ? parsed.error : parsed?.error?.message)
      ?? parsed?.message
      ?? `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`Groq error: ${errMsg}`);
  }

  const data = await response.json() as {
    choices: { message: { content: string } }[];
  };
  const aiResponse = data.choices[0].message.content;

  await saveToFirestore(FIREBASE_COLLECTIONS.AI_RESPONSES, {
    assistant: assistantType,
    request: userMessage,
    response: aiResponse,
    timestamp: new Date().toISOString(),
  });

  if (assistantType === 'beauty' || assistantType === 'customer') {
    await saveToFirestore(FIREBASE_COLLECTIONS.CUSTOMER_CHATS, {
      assistant: assistantType,
      userMessage,
      aiResponse,
      timestamp: new Date().toISOString(),
    });
  }

  return aiResponse;
}
