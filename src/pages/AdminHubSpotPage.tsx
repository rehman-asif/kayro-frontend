import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AuthContext';
import { hubspotService, type HubSpotContact } from '../services/hubspotService';

export function AdminHubSpotPage() {
  const { admin, adminLogout } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState<HubSpotContact | null>(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await adminLogout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setContact(null);
    setNotFound(false);
    setHasSearched(true);
    setSearching(true);
    try {
      const res = await hubspotService.getContactByEmail(email.trim());
      setContact(res.data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to look up contact.';
      if (msg.toLowerCase().includes('no hubspot contact')) {
        setNotFound(true);
        setError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    try {
      const res = await hubspotService.syncContact(
        email.trim(),
        admin?.name || email.trim().split('@')[0]
      );
      setContact(res.data);
      setNotFound(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync contact to HubSpot.');
    } finally {
      setSyncing(false);
    }
  };

  const props = contact?.properties;

  return (
    <div className="db-root">
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <img src="/logo.png" alt="TPC" className="db-logo" />
          <h2 className="db-sidebar-title">Admin Dashboard</h2>
          <p className="db-sidebar-sub">Control Center</p>
        </div>
        <nav className="db-nav">
          <Link to="/admin" className="db-nav-item"><i className="fas fa-chart-line" /> Dashboard</Link>
          <Link to="/admin/publish" className="db-nav-item"><i className="fas fa-plus-circle" /> Publish Product</Link>
          <Link to="/admin/ai" className="db-nav-item"><i className="fas fa-robot" /> AI Center</Link>
          <Link to="/admin/hubspot" className="db-nav-item active"><i className="fas fa-address-book" /> HubSpot CRM</Link>
        </nav>
        <div className="db-sidebar-footer">
          {admin && (
            <div className="db-admin-info">
              <p className="db-admin-name">{admin.name}</p>
              <p className="db-admin-email">{admin.email}</p>
            </div>
          )}
          <button type="button" className="db-logout-btn" onClick={() => void handleLogout()} disabled={loggingOut}>
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
            <h1 className="db-topbar-title">HubSpot CRM</h1>
            <p className="db-topbar-date">Look up contacts synced from storefront registration</p>
          </div>
          <div className="db-actions">
            <button type="button" className="db-logout-btn-top" onClick={() => void handleLogout()} disabled={loggingOut}>
              <i className="fas fa-sign-out-alt" />
              {loggingOut ? 'Signing out...' : 'Logout'}
            </button>
          </div>
        </header>
        <div className="db-content">
          <div className="db-widget" style={{ maxWidth: 640 }}>
            <div className="db-widget-header">
              <h2 className="db-widget-title">Contact Lookup</h2>
            </div>
            <p className="db-welcome-sub" style={{ marginBottom: 12 }}>
              Contacts are created when customers register on the store, or you can sync an email
              to HubSpot from here.
            </p>
            <form className="hs-search-form" onSubmit={(e) => void handleSearch(e)} noValidate>
              <div className="hs-search-row">
                <input
                  type="email"
                  className="auth-input"
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  aria-label="Contact email"
                />
                <button type="submit" className="btn btn-primary" disabled={searching || !email.trim()}>
                  {searching ? 'Searching...' : 'Look Up'}
                </button>
              </div>
            </form>
            {error && (
              <div className="auth-error" role="alert" style={{ marginTop: 16 }}>
                <span>⚠️</span> {error}
              </div>
            )}
            {notFound && (
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void handleSync()}
                  disabled={syncing || !email.trim()}
                >
                  {syncing ? 'Syncing...' : 'Create / Sync to HubSpot'}
                </button>
              </div>
            )}
            {contact && props && (
              <div className="hs-contact-card">
                <div className="hs-contact-header">
                  <i className="fas fa-user-circle" />
                  <div>
                    <h3 className="hs-contact-name">
                      {[props.firstname, props.lastname].filter(Boolean).join(' ') || 'Unknown'}
                    </h3>
                    <p className="hs-contact-id">HubSpot ID: {contact.id}</p>
                  </div>
                </div>
                <dl className="hs-contact-grid">
                  <div><dt>Email</dt><dd>{props.email || '—'}</dd></div>
                  <div><dt>Lead Status</dt><dd>{props.hs_lead_status || '—'}</dd></div>
                  <div><dt>Lifecycle Stage</dt><dd>{props.lifecyclestage || '—'}</dd></div>
                  <div><dt>First Name</dt><dd>{props.firstname || '—'}</dd></div>
                  <div><dt>Last Name</dt><dd>{props.lastname || '—'}</dd></div>
                </dl>
              </div>
            )}
            {hasSearched && !searching && !contact && !error && (
              <p className="hs-empty">No contact found for that email.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
