import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AuthContext';
import { getOpenAIKey } from '../services/storageService';

// ─── Main Component ──────────────────────────────────────
export function AdminPage() {
  const { admin, adminLogout } = useAdmin();
  const navigate = useNavigate();
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);
  const [insightError, setInsightError] = useState<string>('');
  const [loggingOut, setLoggingOut] = useState(false);

  // Auto-generate initial insights on mount
  useEffect(() => {
    void fetchAIInsights();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await adminLogout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const fetchAIInsights = async () => {
    const key = getOpenAIKey();
    if (!key) {
      setInsightError('Configure your xAI key to enable instant business insights.');
      return;
    }

    setLoadingInsight(true);
    setInsightError('');

    const prompt = `You are a professional business operations analyst for 'The Precious Creations', a natural cosmetics brand.
Based on the current store state (no live data available yet), provide 2 short, actionable startup recommendations for a new cosmetics e-commerce business:
1. How to attract the first 100 customers.
2. Which product category to focus on first for maximum early revenue.
Keep the tone professional, direct, and constructive. Do not output markdown codeblocks, just the paragraphs or lists.`;

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'grok-4.5',
          messages: [
            { role: 'system', content: 'You are a helpful business operations assistant.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const resJson = await response.json() as { choices: { message: { content: string } }[] };
      setAiInsight(resJson.choices[0].message.content.trim());
    } catch (err) {
      setInsightError('Failed to fetch AI insights. Check network connection or API key.');
      console.error(err);
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="db-root">
      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <img src="/logo.png" alt="TPC" className="db-logo" />
          <h2 className="db-sidebar-title">Admin Dashboard</h2>
          <p className="db-sidebar-sub">Control Center</p>
        </div>

        <nav className="db-nav">
          <Link to="/admin" className="db-nav-item active">
            <i className="fas fa-chart-line" /> Dashboard
          </Link>
          <Link to="/admin/publish" className="db-nav-item">
            <i className="fas fa-plus-circle" /> Publish Product
          </Link>
          <Link to="/admin/ai" className="db-nav-item">
            <i className="fas fa-robot" /> AI Center
          </Link>
          <Link to="/admin/hubspot" className="db-nav-item">
            <i className="fas fa-address-book" /> HubSpot CRM
          </Link>
        </nav>

        <div className="db-sidebar-footer">
          {/* Admin info */}
          {admin && (
            <div className="db-admin-info">
              <p className="db-admin-name">{admin.name}</p>
              <p className="db-admin-email">{admin.email}</p>
            </div>
          )}
          <button
            type="button"
            className="db-logout-btn"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
          >
            <i className="fas fa-sign-out-alt" />
            {loggingOut ? 'Signing out...' : 'Logout'}
          </button>
          <Link to="/" className="db-back-link" style={{ marginTop: '10px' }}>
            <i className="fas fa-arrow-left" /> Back to Website
          </Link>
        </div>
      </aside>

      {/* Main content column */}
      <main className="db-main">
        {/* Topbar */}
        <header className="db-topbar">
          <div className="db-topbar-left">
            <h1 className="db-topbar-title">Operations Dashboard</h1>
            <p className="db-topbar-date">
              Live updates • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="db-actions">
            <Link to="/admin/publish" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', padding: '8px 16px', height: '36px', boxSizing: 'border-box', lineHeight: '1' }}>
              <i className="fas fa-plus" /> Publish Product
            </Link>
            <Link to="/admin/ai" className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: '#A8A8C0', borderColor: 'rgba(255,255,255,0.15)', padding: '8px 16px', height: '36px', boxSizing: 'border-box', lineHeight: '1' }}>
              <i className="fas fa-brain" /> Open AI Center
            </Link>
            <button
              type="button"
              className="db-logout-btn-top"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
            >
              <i className="fas fa-sign-out-alt" />
              {loggingOut ? 'Signing out...' : 'Logout'}
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="db-content">
          {/* Welcome card */}
          <div className="db-welcome-card">
            <div className="db-welcome-icon">👋</div>
            <div>
              <h2 className="db-welcome-title">
                Welcome back{admin?.name ? `, ${admin.name}` : ''}!
              </h2>
              <p className="db-welcome-sub">
                Your dashboard is ready. Start by publishing products or using the AI Center to generate content.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <section className="db-quick-actions">
            <h2 className="db-section-title">Quick Actions</h2>
            <div className="db-actions-grid">
              <Link to="/admin/publish" className="db-action-card">
                <i className="fas fa-box-open db-action-icon" />
                <span className="db-action-label">Publish Product</span>
                <span className="db-action-desc">Add a new product to the store</span>
              </Link>
              <Link to="/admin/ai" className="db-action-card">
                <i className="fas fa-robot db-action-icon" />
                <span className="db-action-label">AI Center</span>
                <span className="db-action-desc">Generate copy, images & more</span>
              </Link>
              <Link to="/admin/hubspot" className="db-action-card">
                <i className="fas fa-address-book db-action-icon" />
                <span className="db-action-label">HubSpot CRM</span>
                <span className="db-action-desc">Look up synced contacts</span>
              </Link>
              <Link to="/" className="db-action-card">
                <i className="fas fa-store db-action-icon" />
                <span className="db-action-label">View Store</span>
                <span className="db-action-desc">See the live storefront</span>
              </Link>
            </div>
          </section>

          {/* AI Insights widget */}
          <div className="db-widget" style={{ maxWidth: 700 }}>
            <div className="db-widget-header">
              <h2 className="db-widget-title">✨ AI Business Insights</h2>
              <button type="button" className="db-widget-action" onClick={() => void fetchAIInsights()} disabled={loadingInsight}>
                {loadingInsight ? 'Updating...' : 'Refresh'}
              </button>
            </div>

            {loadingInsight ? (
              <div className="db-ai-insight-loading">
                <span className="pp-spinner" />
                <p style={{ fontSize: '13px', margin: 0 }}>Generating business insights...</p>
              </div>
            ) : insightError ? (
              <div className="db-ai-insight-box" style={{ borderStyle: 'solid', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <p className="pp-error" style={{ margin: 0 }}>{insightError}</p>
              </div>
            ) : aiInsight ? (
              <div className="db-ai-insight-box">
                <div className="db-ai-insight-header">
                  <i className="fas fa-brain" />
                  <span>RECOMMENDATIONS</span>
                </div>
                <div className="db-ai-insight-text">
                  {aiInsight.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
