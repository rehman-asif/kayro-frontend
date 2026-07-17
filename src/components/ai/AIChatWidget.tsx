import { useEffect, useRef, useState } from 'react';
import { AI_ASSISTANTS } from '../../data/aiAssistants';
import { useAIChat } from '../../context/AppContext';

const CHAT_ASSISTANTS = ['beauty', 'productFinder', 'customer', 'business'] as const;

export function AIChatWidget() {
  const {
    isOpen, assistant, messages, isLoading,
    closeChat, toggleChat, setAssistant, sendMessage,
  } = useAIChat();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input;
    setInput('');
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="ai-chat-widget">
      <div className={`ai-chat-panel${isOpen ? ' open' : ''}`}>
        <div className="ai-chat-header">
          <h4><i className="fas fa-robot" /> {AI_ASSISTANTS[assistant].name}</h4>
          <button type="button" className="ai-chat-close" onClick={closeChat} aria-label="Close chat">
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="ai-chat-select">
          <select
            value={assistant}
            onChange={(e) => setAssistant(e.target.value as typeof assistant)}
          >
            {CHAT_ASSISTANTS.map((id) => (
              <option key={id} value={id}>{AI_ASSISTANTS[id].name}</option>
            ))}
          </select>
        </div>
        <div className="ai-chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`ai-message ${msg.role}`}>
              {msg.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          ))}
          {isLoading && (
            <div className="ai-message assistant">
              <span className="loading" /> Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="ai-chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about skincare, products..."
            disabled={isLoading}
          />
          <button type="button" onClick={handleSend} disabled={isLoading}>
            <i className="fas fa-paper-plane" />
          </button>
        </div>
      </div>
      <button type="button" className="ai-chat-toggle" onClick={toggleChat} aria-label="Open AI chat">
        <i className="fas fa-robot" />
      </button>
    </div>
  );
}
