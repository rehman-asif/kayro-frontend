import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ASSISTANT_LIST, AI_ASSISTANTS } from '../data/aiAssistants';
import type { AssistantId, ChatMessage } from '../types';
import { generateAIResponse } from '../services/aiService';

interface AssistantSession {
  messages: ChatMessage[];
  loading: boolean;
  input: string;
}

const CATEGORY_MAP: Record<string, AssistantId[]> = {
  'Customer & Sales': ['beauty', 'productFinder', 'customer', 'sales'],
  'Content & Marketing': ['blogWriter', 'captionGenerator', 'marketing'],
  'Business Intelligence': ['business', 'insights', 'financial', 'economist', 'inventory'],
};

const ACCENT_MAP: Record<AssistantId, string> = {
  business:         '#8B5CF6',
  beauty:           '#EC4899',
  productFinder:    '#F59E0B',
  sales:            '#10B981',
  blogWriter:       '#3B82F6',
  captionGenerator: '#F43F5E',
  marketing:        '#EF4444',
  insights:         '#6366F1',
  financial:        '#14B8A6',
  economist:        '#F97316',
  inventory:        '#84CC16',
  customer:         '#06B6D4',
};

function mkSession(): AssistantSession {
  return { messages: [], loading: false, input: '' };
}

export function AdminAICenter() {
  const [activeId, setActiveId] = useState<AssistantId>('business');
  const [sessions, setSessions] = useState<Record<string, AssistantSession>>(
    () => Object.fromEntries(ASSISTANT_LIST.map((a) => [a.id, mkSession()]))
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const active = AI_ASSISTANTS[activeId];
  const session = sessions[activeId];
  const accent = ACCENT_MAP[activeId];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);

  const setSession = (id: AssistantId, patch: Partial<AssistantSession>) => {
    setSessions((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const sendMessage = async () => {
    const text = session.input.trim();
    if (!text || session.loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...session.messages, userMsg];
    setSession(activeId, { messages: newMessages, input: '', loading: true });

    try {
      const reply = await generateAIResponse(text, activeId, newMessages);
      setSession(activeId, {
        messages: [...newMessages, { role: 'assistant', content: reply }],
        loading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setSession(activeId, {
        messages: [...newMessages, { role: 'assistant', content: `❌ ${msg}` }],
        loading: false,
      });
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const clearChat = () => setSession(activeId, { messages: [], loading: false });

  const switchAssistant = (id: AssistantId) => {
    setActiveId(id);
    if (window.innerWidth < 900) setSidebarOpen(false);
  };

  return (
    <div className="aic-root">
      {/* ── Sidebar ── */}
      <aside className={`aic-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="aic-sidebar-header">
          <Link to="/" className="aic-logo-link">
            <img src="/logo.png" alt="TPC" className="aic-logo" />
          </Link>
          <div className="aic-brand">
            <span className="aic-brand-tag">ADMIN</span>
            <h2 className="aic-brand-title">AI Center</h2>
          </div>
        </div>

        <nav className="aic-nav">
          {Object.entries(CATEGORY_MAP).map(([cat, ids]) => (
            <div key={cat} className="aic-nav-group">
              <span className="aic-nav-category">{cat}</span>
              {ids.map((id) => {
                const a = AI_ASSISTANTS[id];
                const isActive = id === activeId;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`aic-nav-item${isActive ? ' active' : ''}`}
                    style={isActive ? { '--item-accent': ACCENT_MAP[id] } as React.CSSProperties : undefined}
                    onClick={() => switchAssistant(id)}
                  >
                    <span className="aic-nav-icon">{a.icon}</span>
                    <span className="aic-nav-label">{a.name}</span>
                    {sessions[id].messages.length > 0 && (
                      <span className="aic-nav-badge">{sessions[id].messages.filter(m => m.role === 'user').length}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="aic-sidebar-footer">
          <Link to="/" className="aic-back-link">
            <i className="fas fa-arrow-left" /> Back to Website
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="aic-main">
        {/* Top Bar */}
        <header className="aic-topbar">
          <div className="aic-topbar-left">
            <button
              type="button"
              className="aic-menu-btn"
              onClick={() => setSidebarOpen((p) => !p)}
              aria-label="Toggle sidebar"
            >
              <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`} />
            </button>
            <div className="aic-topbar-info">
              <span className="aic-topbar-icon" style={{ background: `${accent}22`, color: accent }}>
                {active.icon}
              </span>
              <div>
                <h1 className="aic-topbar-title">{active.name}</h1>
                <p className="aic-topbar-desc">{active.description}</p>
              </div>
            </div>
          </div>
          <div className="aic-topbar-right">
            <span className="aic-status-dot" />
            <span className="aic-status-label">xAI Grok • Live</span>
            {session.messages.length > 0 && (
              <button type="button" className="aic-clear-btn" onClick={clearChat}>
                <i className="fas fa-trash-alt" /> Clear
              </button>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div className="aic-chat-area">
          {session.messages.length === 0 ? (
            <div className="aic-empty">
              <div className="aic-empty-icon" style={{ background: `${accent}18`, color: accent }}>
                {active.icon}
              </div>
              <h2 className="aic-empty-title">{active.name}</h2>
              <p className="aic-empty-desc">{active.description}</p>
              <div className="aic-empty-hints">
                {getHints(activeId).map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    className="aic-hint"
                    style={{ borderColor: `${accent}55`, color: accent }}
                    onClick={() => {
                      setSession(activeId, { input: hint });
                      inputRef.current?.focus();
                    }}
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="aic-messages">
              {session.messages.map((msg, i) => (
                <div key={i} className={`aic-msg aic-msg--${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="aic-msg-avatar" style={{ background: `${accent}22`, color: accent }}>
                      {active.icon}
                    </div>
                  )}
                  <div className="aic-msg-bubble" style={
                    msg.role === 'assistant'
                      ? { borderLeft: `3px solid ${accent}` }
                      : {}
                  }>
                    <MessageContent content={msg.content} />
                  </div>
                  {msg.role === 'user' && (
                    <div className="aic-msg-avatar aic-msg-avatar--user">
                      <i className="fas fa-user" />
                    </div>
                  )}
                </div>
              ))}
              {session.loading && (
                <div className="aic-msg aic-msg--assistant">
                  <div className="aic-msg-avatar" style={{ background: `${accent}22`, color: accent }}>
                    {active.icon}
                  </div>
                  <div className="aic-msg-bubble aic-msg-bubble--typing">
                    <span className="aic-dot" />
                    <span className="aic-dot" />
                    <span className="aic-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="aic-input-bar">
          <div className="aic-input-wrap" style={{ '--bar-accent': accent } as React.CSSProperties}>
            <textarea
              ref={inputRef}
              className="aic-input"
              value={session.input}
              onChange={(e) => setSession(activeId, { input: e.target.value })}
              onKeyDown={handleKey}
              placeholder={`Ask ${active.name}… (Enter to send, Shift+Enter for new line)`}
              disabled={session.loading}
              rows={1}
            />
            <button
              type="button"
              className="aic-send-btn"
              style={{ background: accent }}
              onClick={() => void sendMessage()}
              disabled={session.loading || !session.input.trim()}
              aria-label="Send message"
            >
              {session.loading
                ? <span className="aic-spinner" />
                : <i className="fas fa-paper-plane" />
              }
            </button>
          </div>
          <p className="aic-input-hint">
            Powered by <strong>xAI Grok</strong> · {active.name}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Render markdown-like bold/bullet content ── */
function MessageContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="aic-resp-h4">{line.slice(4)}</h4>;
        if (line.startsWith('## ')) return <h3 key={i} className="aic-resp-h3">{line.slice(3)}</h3>;
        if (line.startsWith('# ')) return <h2 key={i} className="aic-resp-h2">{line.slice(2)}</h2>;
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} className="aic-resp-li">{renderInline(line.slice(2))}</li>;
        }
        if (/^\d+\.\s/.test(line)) {
          return <li key={i} className="aic-resp-li aic-resp-li--num">{renderInline(line.replace(/^\d+\.\s/, ''))}</li>;
        }
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} className="aic-resp-p">{renderInline(line)}</p>;
      })}
    </>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="aic-code">{part.slice(1, -1)}</code>;
    return part;
  });
}

function getHints(id: AssistantId): string[] {
  const hints: Record<AssistantId, string[]> = {
    business:         ['What are the top 3 growth strategies for TPC?', 'How can I scale my skincare brand in Africa?', 'Draft a 90-day business plan outline'],
    beauty:           ['Best routine for oily skin?', 'How does Vitamin C serum help skin?', 'What ingredients treat dark spots naturally?'],
    productFinder:    ['Find a product for dry and sensitive skin', 'What bundle suits a complete skincare beginner?', 'Best product for hyperpigmentation?'],
    sales:            ['How do I upsell our bundles?', 'Write a WhatsApp sales script for our serums', 'Top 5 customer objections and how to handle them'],
    blogWriter:       ['Write a blog on the benefits of turmeric for skin', 'Draft an intro for a glass skin guide', 'Write about natural hair growth tips'],
    captionGenerator: ['Caption for a Vitamin C serum Instagram post', 'TikTok caption for a skincare routine video', 'Facebook caption for a product launch'],
    marketing:        ['Plan a product launch campaign for our new serum', 'How to grow TPC on Instagram organically?', 'Create a 30-day content calendar idea'],
    insights:         ['What are skincare trends in Southern Africa?', 'Which product category has most growth potential?', 'Analyse customer buying patterns for beauty brands'],
    financial:        ['How to price a handmade skincare serum?', 'Calculate profit margin at 40% COGS', 'Budgeting tips for a small beauty brand'],
    economist:        ['How does Lesotho\'s economy affect beauty spending?', 'What is the skincare market size in Africa?', 'Currency risk for importing raw materials?'],
    inventory:        ['How to forecast stock for 3 months?', 'Reorder point formula for serums', 'Manage seasonal demand spikes for gift bundles'],
    customer:         ['Draft a reply to a late delivery complaint', 'Template for order confirmation message', 'How do I handle a product allergy complaint?'],
  };
  return hints[id] || [];
}
