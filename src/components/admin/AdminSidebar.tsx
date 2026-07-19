import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AuthContext';
import { useState } from 'react';

export type AdminNavKey =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'categories'
  | 'blog'
  | 'publish'
  | 'ai'
  | 'hubspot';

const NAV: { key: AdminNavKey; to: string; icon: string; label: string }[] = [
  { key: 'dashboard', to: '/admin', icon: 'fas fa-chart-line', label: 'Dashboard' },
  { key: 'pos', to: '/admin/pos', icon: 'fas fa-cash-register', label: 'POS' },
  { key: 'products', to: '/admin/products', icon: 'fas fa-boxes', label: 'Manage Products' },
  { key: 'categories', to: '/admin/categories', icon: 'fas fa-th-large', label: 'Categories' },
  { key: 'blog', to: '/admin/blog', icon: 'fas fa-book-open', label: 'Education' },
  { key: 'publish', to: '/admin/publish', icon: 'fas fa-plus-circle', label: 'Publish Product' },
  { key: 'ai', to: '/admin/ai', icon: 'fas fa-robot', label: 'AI Center' },
  { key: 'hubspot', to: '/admin/hubspot', icon: 'fas fa-address-book', label: 'HubSpot CRM' },
];

interface AdminSidebarProps {
  active: AdminNavKey;
}

export function AdminSidebar({ active }: AdminSidebarProps) {
  const { admin, adminLogout } = useAdmin();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await adminLogout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <aside className="db-sidebar">
      <div className="db-sidebar-brand">
        <img src="/logo.png" alt="TPC" className="db-logo" />
        <h2 className="db-sidebar-title">Admin Dashboard</h2>
        <p className="db-sidebar-sub">The Precious Creations</p>
      </div>
      <nav className="db-nav">
        {NAV.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={`db-nav-item${active === item.key ? ' active' : ''}`}
          >
            <i className={item.icon} /> {item.label}
          </Link>
        ))}
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
        <Link to="/" className="db-back-link" style={{ marginTop: 10 }}>
          <i className="fas fa-arrow-left" /> Back to Website
        </Link>
      </div>
    </aside>
  );
}
