import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../context/AuthContext';

/**
 * Unified login used from Account icon — signs into the admin dashboard.
 */
export function LoginPage() {
  const { adminLogin, isLoading } = useAdmin();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await adminLogin(email.trim(), password);
      window.location.href = '/admin';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1 className="auth-brand-title">Welcome Back</h1>
          <p className="auth-brand-sub">Sign in to The Precious Creations dashboard</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="auth-error" role="alert">{error}</div>
          )}

          <div className="auth-field">
            <label htmlFor="login-email" className="auth-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password" className="auth-label">Password</label>
            <input
              id="login-password"
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
            id="login-submit"
            type="submit"
            className="auth-btn"
            disabled={submitting || !email || !password}
          >
            {submitting ? <span className="auth-btn-spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-text">
          <Link to="/admin/forgot-password" className="auth-link">Forgot password?</Link>
          {' · '}
          <Link to="/admin/register" className="auth-link">Create admin account</Link>
        </p>
        <p className="auth-footer-text">
          <button type="button" className="auth-link" onClick={() => navigate('/')}>
            Return to store
          </button>
        </p>
      </div>
    </div>
  );
}
