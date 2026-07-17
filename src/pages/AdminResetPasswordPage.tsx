import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminAuthService } from '../services/authService';

export function AdminResetPasswordPage() {
  const { token } = useParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid reset link');
      return;
    }
    setSubmitting(true);
    try {
      await adminAuthService.resetPassword(token, password);
      window.location.assign('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-page--admin">
      <div className="auth-card">
        <div className="auth-brand">
          <h1 className="auth-brand-title">Reset Password</h1>
          <p className="auth-brand-sub">Choose a new password for your admin account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error" role="alert">{error}</div>}

          <div className="auth-field">
            <label htmlFor="reset-password" className="auth-label">New Password</label>
            <input
              id="reset-password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reset-confirm" className="auth-label">Confirm Password</label>
            <input
              id="reset-confirm"
              type="password"
              className="auth-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn--admin"
            disabled={submitting || !password || !confirm}
          >
            {submitting ? <span className="auth-btn-spinner" /> : 'Update Password'}
          </button>
        </form>

        <p className="auth-footer-text">
          <Link to="/login" className="auth-link">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
