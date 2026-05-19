import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { loginUser } from '../../slices/login/thunk';
import { RootState } from '../../slices';
import { post } from '../../helpers/api_helper';
import { POST_DEMO_PREPARE } from '../../helpers/url_helper';
import Logo from '../../components/Logo';
import { useTheme } from '../../components/useTheme';
import { Sun, Moon } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite_token') || '';
  const { error, loading } = useSelector((state: RootState) => state.Login);
  const { theme, toggle } = useTheme();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [demoError, setDemoError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password, invite_token: inviteToken }, navigate) as any);
  };

  const handleDemoLogin = async () => {
    setDemoError('');
    try {
      await post(POST_DEMO_PREPARE, {});
      dispatch(loginUser({ email: 'demo@splithive.dev', password: 'Password123!' }, navigate) as any);
    } catch (err: any) {
      setDemoError(err.response?.data?.message || 'Demo account could not be prepared. Please try again.');
    }
  };

  return (
    <div className="auth-outer">
      {/* Theme toggle (top-right) */}
      <button
        className="theme-toggle"
        onClick={toggle}
        style={{ position: 'fixed', top: 16, right: 20, zIndex: 999 }}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        {theme === 'light' ? 'Dark' : 'Light'}
      </button>

      <div className="auth-card">
        {/* ── Brand panel ─────────────────────────────── */}
        <div className="auth-brand-panel">
          <Logo size={52} showText={true} textColor="#fff" className="mb-4" />
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.75rem' }}>
            Welcome back!
          </h2>
          <p style={{ opacity: 0.85, fontSize: '0.95rem', lineHeight: 1.6 }}>
            Split expenses effortlessly with friends and groups. Track what you owe and what's owed to you.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Split any expense fairly', 'Track group balances', 'Settle up in one tap'].map((feat) => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem' }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, flexShrink: 0
                }}>✓</span>
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* ── Form panel ──────────────────────────────── */}
        <div className="auth-form-panel">
          <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Sign in</h3>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
            Enter your credentials to continue
          </p>

          {error && <Alert variant="danger" className="py-2">{error}</Alert>}
          {demoError && <Alert variant="danger" className="py-2">{demoError}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="lg"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label className="fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>Password</Form.Label>
                <Link
                  to="/forgot-password"
                  className="text-decoration-none"
                  style={{ fontSize: '0.8rem', color: 'var(--brand-dark)' }}
                >
                  Forgot password?
                </Link>
              </div>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="lg"
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button
                className="btn-brand"
                type="submit"
                size="lg"
                disabled={loading}
                style={{ borderRadius: 10 }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
              <Button
                variant="outline-secondary"
                type="button"
                size="lg"
                disabled={loading}
                onClick={handleDemoLogin}
                style={{ borderRadius: 10 }}
              >
                Try Demo Account
              </Button>
            </div>
          </Form>

          <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
            <span className="text-muted">Don't have an account? </span>
            <Link
              to={inviteToken
                ? `/register?email=${encodeURIComponent(email)}&invite_token=${encodeURIComponent(inviteToken)}`
                : '/register'}
              className="text-decoration-none fw-semibold"
              style={{ color: '#d97706' }}
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
