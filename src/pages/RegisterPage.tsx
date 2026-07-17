import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/AuthContext';

export function RegisterPage() {
  const { userRegister, isLoading } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await userRegister(name, email, password);
      navigate('/'); // Redirect to home on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">🌿</div>
          <h1 className="auth-brand-title">Create Account</h1>
          <p className="auth-brand-sub">Join The Precious Creations today</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="auth-error" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="register-name" className="auth-label">Full Name</label>
            <input
              id="register-name"
              type="text"
              className="auth-input"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-email" className="auth-label">Email Address</label>
            <input
              id="register-email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-password" className="auth-label">
              Password <span className="auth-label-hint">(min. 6 characters)</span>
            </label>
            <input
              id="register-password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            className="auth-btn"
            disabled={submitting || !name || !email || !password}
          >
            {submitting ? <span className="auth-btn-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/user/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
