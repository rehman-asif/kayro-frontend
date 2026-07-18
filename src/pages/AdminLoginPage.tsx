import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../context/AuthContext';

export function AdminLoginPage() {
  const { admin, adminLogin, isLoading } = useAdmin();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (admin) {
      navigate('/admin', { replace: true });
    }
  }, [admin, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await adminLogin(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="auth-page-loading">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="auth-page auth-page--admin">
      <div className="auth-card">
        <div className="auth-brand">
          <h1 className="auth-brand-title">Admin Portal</h1>
          <p className="auth-brand-sub">Sign in to The Precious Creations dashboard</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="auth-error" role="alert">{error}</div>
          )}

          <div className="auth-field">
            <label htmlFor="admin-email" className="auth-label">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              className="auth-input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label htmlFor="admin-password" className="auth-label">Password</label>
            <input
              id="admin-password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="admin-login-submit"
            type="submit"
            className="auth-btn auth-btn--admin"
            disabled={submitting || !email || !password}
          >
            {submitting ? <span className="auth-btn-spinner" /> : 'Sign In as Admin'}
          </button>
        </form>

        <p className="auth-footer-text">
          <Link to="/admin/forgot-password" className="auth-link">Forgot password?</Link>
          {' · '}
          <Link to="/admin/register" className="auth-link">Create admin account</Link>
        </p>
        <p className="auth-footer-text">
          <Link to="/" className="auth-link">Return to store</Link>
        </p>
      </div>
    </div>
  );
}
