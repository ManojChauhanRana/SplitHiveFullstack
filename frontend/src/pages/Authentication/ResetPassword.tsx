import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { put } from '../../helpers/api_helper';
import { PUT_PASSWORD_RESET } from '../../helpers/url_helper';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const resetToken = queryParams.get('reset_password_token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError("No reset token found. Please use the link from your email.");
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      return setError("Passwords do not match.");
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await put(PUT_PASSWORD_RESET, { 
        user: { 
          reset_password_token: token, 
          password: password,
          password_confirmation: passwordConfirmation
        } 
      });
      setMessage(response?.status?.message || "Password successfully reset!");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.status?.message || err.response?.data?.error || "Failed to reset password. Token might be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={5}>
          <Card className="shadow-lg border-0 rounded-lg mt-5">
            <Card.Header className="bg-primary text-white text-center py-4">
              <h3 className="font-weight-light my-1">Reset Password</h3>
            </Card.Header>
            <Card.Body className="p-5">
              {error && <Alert variant="danger">{error}</Alert>}
              {message && <Alert variant="success">{message}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={!token}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="passwordConfirmation">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    disabled={!token}
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" size="lg" disabled={loading || !token}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center py-3">
              <div className="small">
                <Link to="/login">Go to Login</Link>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
