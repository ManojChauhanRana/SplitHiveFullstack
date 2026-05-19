import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { registerUser } from '../../slices/register/thunk';
import { RootState } from '../../slices';
import Logo from '../../components/Logo';
import { useTheme } from '../../components/useTheme';
import { Sun, Moon } from 'lucide-react';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite_token') || '';
  const { registrationError, loading, success, message } = useSelector((state: RootState) => state.Register);
  const { theme, toggle } = useTheme();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerUser({ email, password, full_name: fullName, invite_token: inviteToken }, navigate) as any);
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
            Join the hive
          </h2>
          <p style={{ opacity: 0.85, fontSize: '0.95rem', lineHeight: 1.6 }}>
            Create your free account and start splitting expenses with friends, roommates, or travel groups.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Free forever — no credit card', 'Invite friends instantly', 'Works for any group size'].map((feat) => (
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
          <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Create account</h3>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
            Get started in seconds — it's free
          </p>

          {registrationError && <Alert variant="danger" className="py-2">{registrationError}</Alert>}
          {success && <Alert variant="success" className="py-2">{message}</Alert>}

          {!success && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="fullName">
                <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  size="lg"
                />
              </Form.Group>

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
                <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem' }}>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="lg"
                />
              </Form.Group>

              <div className="d-grid">
                <Button
                  className="btn-brand"
                  type="submit"
                  size="lg"
                  disabled={loading}
                  style={{ borderRadius: 10 }}
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </Button>
              </div>
            </Form>
          )}

          <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
            <span className="text-muted">Already have an account? </span>
            <Link
              to="/login"
              className="text-decoration-none fw-semibold"
              style={{ color: '#d97706' }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
