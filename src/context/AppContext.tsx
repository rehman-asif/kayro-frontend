import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AssistantId, ChatMessage } from '../types';
import { generateAIResponse } from '../services/aiService';

interface ToastContextValue {
  showToast: (message: string) => void;
}

interface AIChatContextValue {
  isOpen: boolean;
  assistant: AssistantId;
  messages: ChatMessage[];
  isLoading: boolean;
  openChat: (assistant?: AssistantId) => void;
  closeChat: () => void;
  toggleChat: () => void;
  setAssistant: (assistant: AssistantId) => void;
  sendMessage: (content: string) => Promise<void>;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const AIChatContext = createContext<AIChatContextValue | null>(null);

const DEFAULT_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: "Hello! I'm your Beauty AI Assistant. How can I help you with your skincare today?",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [assistant, setAssistantState] = useState<AssistantId>('beauty');
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  // Keep a ref in sync so sendMessage always has the latest messages
  const messagesRef = useRef<ChatMessage[]>([DEFAULT_MESSAGE]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const openChat = useCallback((a: AssistantId = 'beauty') => {
    setAssistantState(a);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);

  const setAssistant = useCallback((a: AssistantId) => {
    setAssistantState(a);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: content.trim() };
    const updatedHistory = [...messagesRef.current, userMsg];
    messagesRef.current = updatedHistory;
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // Pass full conversation history for context-aware AI responses
      const response = await generateAIResponse(content.trim(), assistant, updatedHistory);
      const aiMsg: ChatMessage = { role: 'assistant', content: response };
      messagesRef.current = [...updatedHistory, aiMsg];
      setMessages(messagesRef.current);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      const errMsg: ChatMessage = { role: 'assistant', content: `❌ ${message}` };
      messagesRef.current = [...updatedHistory, errMsg];
      setMessages(messagesRef.current);
    } finally {
      setIsLoading(false);
    }
  }, [assistant, isLoading]);

  const toastValue = useMemo(() => ({ showToast }), [showToast]);
  const aiValue = useMemo(
    () => ({
      isOpen, assistant, messages, isLoading,
      openChat, closeChat, toggleChat, setAssistant, sendMessage,
    }),
    [isOpen, assistant, messages, isLoading, openChat, closeChat, toggleChat, setAssistant, sendMessage]
  );

  return (
    <ToastContext.Provider value={toastValue}>
      <AIChatContext.Provider value={aiValue}>
        {children}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
            background: '#2C2C2C', color: '#fff', padding: '12px 24px',
            borderRadius: 8, zIndex: 10000, fontSize: 14,
          }}>
            {toast}
          </div>
        )}
      </AIChatContext.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within AppProvider');
  return ctx;
}

export function useAIChat(): AIChatContextValue {
  const ctx = useContext(AIChatContext);
  if (!ctx) throw new Error('useAIChat must be used within AppProvider');
  return ctx;
}
