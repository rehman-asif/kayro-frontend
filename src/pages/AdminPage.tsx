import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AuthContext';
import { getOpenAIKey, setOpenAIKey } from '../services/storageService';
import { PRODUCTS } from '../data/products';
import { getPublishedProducts, syncPublishedProductsFromApi } from '../services/productService';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface DashStats {
  totalProducts: number;
  inventoryStatus: { inStock: number; lowStock: number; outOfStock: number };
  topProducts: { id: string; name: string; category: string; price: number; stock: number; featured?: boolean }[];
  lowStockItems: { name: string; stock: number }[];
}

export function AdminPage() {
  const { admin, adminLogout } = useAdmin();
  const navigate = useNavigate();
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);
  const [insightError, setInsightError] = useState<string>('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [stats, setStats] = useState<DashStats | null>(null);

  useEffect(() => {
    setHasApiKey(!!getOpenAIKey());
    void fetchAIInsights();
    void loadStats();
  }, []);

  const loadStats = async () => {
    await syncPublishedProductsFromApi();
    try {
      const res = await fetch(`${API_BASE}/products/stats`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json() as { success: boolean; data: DashStats };
        if (json.success) {
          setStats(json.data);
          return;
        }
      }
    } catch {
      // fall through to local fallback
    }

    const published = getPublishedProducts();
    const catalogCount = PRODUCTS.length + published.length;
    setStats({
      totalProducts: catalogCount,
      inventoryStatus: {
        inStock: catalogCount,
        lowStock: 0,
        outOfStock: PRODUCTS.filter((p) => p.comingSoon).length,
      },
      topProducts: PRODUCTS.filter((p) => p.featured).slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.comingSoon ? 0 : 25,
        featured: true,
      })),
      lowStockItems: PRODUCTS.filter((p) => p.comingSoon).slice(0, 3).map((p) => ({
        name: p.name,
        stock: 0,
      })),
    });
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await adminLogout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const handleSaveApiKey = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;
    setOpenAIKey(trimmed);
    setApiKeyInput('');
    setApiKeySaved(true);
    setHasApiKey(true);
    setTimeout(() => setApiKeySaved(false), 2500);
  };

  const fetchAIInsights = async () => {
    const key = getOpenAIKey();
    if (!key) {
      setInsightError('Enter your AI API key below to enable business insights.');
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
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
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

  const publishedCount = getPublishedProducts().length;
  const notifications = [
    {
      text: publishedCount
        ? `${publishedCount} product(s) published from Admin this session.`
        : 'No newly published products yet — use Publish Product to add one.',
      time: 'Just now',
    },
    {
      text: 'Cloudinary image uploads are ready for admin product publishing.',
      time: 'System',
    },
    {
      text: 'Sales, orders, and revenue will update when checkout orders are connected.',
      time: 'Note',
    },
  ];

  return (
    <div className="db-root">
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <img src="/logo.png" alt="TPC" className="db-logo" />
          <h2 className="db-sidebar-title">Admin Dashboard</h2>
          <p className="db-sidebar-sub">The Precious Creations</p>
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

      <main className="db-main">
        <header className="db-topbar">
          <div className="db-topbar-left">
            <h1 className="db-topbar-title">Operations Dashboard</h1>
            <p className="db-topbar-date">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="db-actions">
            <Link
              to="/admin/publish"
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '13px',
                padding: '8px 16px',
                height: '36px',
                boxSizing: 'border-box',
                lineHeight: '1',
              }}
            >
              <i className="fas fa-plus" /> Publish Product
            </Link>
            <Link
              to="/admin/ai"
              className="btn btn-sm btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '13px',
                color: '#A8A8C0',
                borderColor: 'rgba(255,255,255,0.15)',
                padding: '8px 16px',
                height: '36px',
                boxSizing: 'border-box',
                lineHeight: '1',
              }}
            >
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

        <div className="db-content">
          <div className="db-welcome-card">
            <div className="db-welcome-icon">
              <i className="fas fa-store" />
            </div>
            <div>
              <h2 className="db-welcome-title">Welcome to The Precious Creations dashboard</h2>
              <p className="db-welcome-sub">
                {admin?.name ? `Signed in as ${admin.name}. ` : ''}
                Publish products, manage AI content, and grow your store from here.
              </p>
            </div>
          </div>

          <div className="db-grid-4">
            <div className="db-metric-card">
              <div className="db-metric-header">
                <span className="db-metric-label">Total Sales</span>
                <div className="db-metric-icon-box" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                  <i className="fas fa-chart-line" />
                </div>
              </div>
              <div className="db-metric-value">M0.00</div>
              <div className="db-metric-footer">
                <span className="db-trend-neutral">Pending orders</span>
                <span className="db-trend-sub">live after checkout</span>
              </div>
            </div>
            <div className="db-metric-card">
              <div className="db-metric-header">
                <span className="db-metric-label">Today&apos;s Revenue</span>
                <div className="db-metric-icon-box" style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>
                  <i className="fas fa-coins" />
                </div>
              </div>
              <div className="db-metric-value">M0.00</div>
              <div className="db-metric-footer">
                <span className="db-trend-neutral">No sales yet</span>
              </div>
            </div>
            <div className="db-metric-card">
              <div className="db-metric-header">
                <span className="db-metric-label">Orders</span>
                <div className="db-metric-icon-box" style={{ background: 'rgba(168,85,247,0.15)', color: '#A855F7' }}>
                  <i className="fas fa-shopping-bag" />
                </div>
              </div>
              <div className="db-metric-value">0</div>
              <div className="db-metric-footer">
                <span className="db-trend-sub">Awaiting first order</span>
              </div>
            </div>
            <div className="db-metric-card">
              <div className="db-metric-header">
                <span className="db-metric-label">Customers</span>
                <div className="db-metric-icon-box" style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316' }}>
                  <i className="fas fa-users" />
                </div>
              </div>
              <div className="db-metric-value">0</div>
              <div className="db-metric-footer">
                <span className="db-trend-sub">Synced via HubSpot when available</span>
              </div>
            </div>
          </div>

          <div className="db-layout-split">
            <div className="db-col">
              <section className="db-widget">
                <div className="db-widget-header">
                  <h2 className="db-widget-title">Inventory Status</h2>
                  <span className="db-trend-sub">{stats?.totalProducts ?? '—'} products</span>
                </div>
                <div className="db-grid-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  <div>
                    <div className="db-metric-value" style={{ fontSize: '1.4rem' }}>{stats?.inventoryStatus.inStock ?? 0}</div>
                    <div className="db-metric-label">In stock</div>
                  </div>
                  <div>
                    <div className="db-metric-value" style={{ fontSize: '1.4rem', color: '#F59E0B' }}>{stats?.inventoryStatus.lowStock ?? 0}</div>
                    <div className="db-metric-label">Low stock</div>
                  </div>
                  <div>
                    <div className="db-metric-value" style={{ fontSize: '1.4rem', color: '#EF4444' }}>{stats?.inventoryStatus.outOfStock ?? 0}</div>
                    <div className="db-metric-label">Out of stock</div>
                  </div>
                </div>
                {(stats?.lowStockItems?.length ?? 0) > 0 && (
                  <div className="db-stock-indicator" style={{ marginTop: 8 }}>
                    {stats!.lowStockItems.map((item) => (
                      <div key={item.name} className="db-stock-meta">
                        <span className="db-stock-name">{item.name}</span>
                        <span className={`db-stock-count ${item.stock === 0 ? 'out' : 'low'}`}>
                          {item.stock === 0 ? 'Out' : `${item.stock} left`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="db-widget">
                <div className="db-widget-header">
                  <h2 className="db-widget-title">Top Products</h2>
                </div>
                <div className="db-stock-indicator">
                  {(stats?.topProducts ?? []).map((p) => (
                    <div key={p.id} className="db-stock-meta">
                      <span className="db-stock-name">{p.name}</span>
                      <span className="db-stock-count" style={{ color: '#A8A8C0' }}>M{p.price}</span>
                    </div>
                  ))}
                  {!stats?.topProducts?.length && (
                    <p className="db-welcome-sub" style={{ margin: 0 }}>Publish products to see rankings here.</p>
                  )}
                </div>
              </section>
            </div>

            <div className="db-col">
              <section className="db-widget">
                <div className="db-widget-header">
                  <h2 className="db-widget-title">Notifications</h2>
                </div>
                <div className="db-notif-list">
                  {notifications.map((n) => (
                    <div key={n.text} className="db-notif-item">
                      <span className="db-notif-dot" />
                      <div className="db-notif-content">
                        <p className="db-notif-text">{n.text}</p>
                        <span className="db-notif-time">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="db-widget">
                <div className="db-widget-header">
                  <h2 className="db-widget-title">AI Business Insights</h2>
                  <button
                    type="button"
                    className="db-widget-action"
                    onClick={() => void fetchAIInsights()}
                    disabled={loadingInsight}
                  >
                    {loadingInsight ? 'Updating...' : 'Refresh'}
                  </button>
                </div>

                {loadingInsight ? (
                  <div className="db-ai-insight-loading">
                    <span className="pp-spinner" />
                    <p style={{ fontSize: '13px', margin: 0 }}>Generating business insights...</p>
                  </div>
                ) : insightError ? (
                  <div
                    className="db-ai-insight-box"
                    style={{ borderStyle: 'solid', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    <p className="pp-error" style={{ margin: 0 }}>
                      {insightError}
                    </p>
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
              </section>
            </div>
          </div>

          <section className="db-widget" style={{ maxWidth: 700 }}>
            <div className="db-widget-header">
              <h2 className="db-widget-title">AI API Key</h2>
            </div>
            <p className="db-welcome-sub" style={{ marginBottom: 12 }}>
              Enter your Groq API key here. It is saved in this browser and used for AI
              Center and insights.
              {hasApiKey ? ' A key is currently saved.' : ' No key saved yet.'}
            </p>
            <form className="auth-form" onSubmit={handleSaveApiKey} style={{ maxWidth: '100%' }}>
              <div className="auth-field">
                <label htmlFor="admin-api-key" className="auth-label">
                  API Key
                </label>
                <input
                  id="admin-api-key"
                  type="password"
                  className="auth-input"
                  placeholder="Paste your API key"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="auth-btn auth-btn--admin" disabled={!apiKeyInput.trim()}>
                Save API Key
              </button>
              {apiKeySaved && (
                <p className="auth-success" style={{ marginTop: 10 }}>
                  API key saved.
                </p>
              )}
            </form>
          </section>

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
        </div>
      </main>
    </div>
  );
}
