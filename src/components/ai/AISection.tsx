import { Link } from 'react-router-dom';
import type { AssistantId } from '../../types';
import { ASSISTANT_LIST } from '../../data/aiAssistants';
import { useAIChat } from '../../context/AppContext';

export function AICard({ assistantId }: { assistantId: AssistantId }) {
  const { openChat } = useAIChat();
  const assistant = ASSISTANT_LIST.find((a) => a.id === assistantId);
  if (!assistant) return null;

  return (
    <button
      type="button"
      className="ai-card"
      onClick={() => openChat(assistant.id)}
      style={{ textAlign: 'left', width: '100%' }}
    >
      <div className="ai-card-icon">{assistant.icon}</div>
      <h3>{assistant.name}</h3>
      <p>{assistant.description}</p>
    </button>
  );
}

export function AISection() {
  return (
    <section className="ai-section" id="ai-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Powered by AI</span>
          <h2 style={{ color: 'var(--white)' }}>Your Personal Beauty & Business Assistants</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            Experience intelligent skincare guidance and business tools powered by AI — exclusively for The Precious Creations
          </p>
        </div>
        <div className="ai-grid">
          {ASSISTANT_LIST.map((assistant) => (
            <AICard key={assistant.id} assistantId={assistant.id} />
          ))}
        </div>
        <div className="ai-dashboard-link">
          <Link to="/admin" className="btn btn-peach">Open Admin AI Center →</Link>
        </div>
      </div>
    </section>
  );
}
