import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { adminAuthService } from '../services/authService';

export function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetUrl('');
    setSubmitting(true);
    try {
      const res = await adminAuthService.forgotPassword(email);
      setMessage(res.message);
      if (res.data?.resetUrl) setResetUrl(res.data.resetUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-page--admin">
      <div className="auth-card">
        <div className="auth-brand">
          <h1 className="auth-brand-title">Forgot Password</h1>
          <p className="auth-brand-sub">Enter your admin email to reset your password</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error" role="alert">{error}</div>}
          {message && !error && (
            <div className="auth-success" role="status">{message}</div>
          )}

          <div className="auth-field">
            <label htmlFor="forgot-email" className="auth-label">Admin Email</label>
            <input
              id="forgot-email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn--admin"
            disabled={submitting || !email}
          >
            {submitting ? <span className="auth-btn-spinner" /> : 'Send Reset Link'}
          </button>
        </form>

        {resetUrl && (
          <p className="auth-footer-text" style={{ wordBreak: 'break-all' }}>
            Reset link: <a href={resetUrl} className="auth-link">{resetUrl}</a>
          </p>
        )}

        <p className="auth-footer-text">
          <Link to="/login" className="auth-link">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
