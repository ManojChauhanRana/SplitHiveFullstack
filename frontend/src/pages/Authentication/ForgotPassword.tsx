import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { post } from '../../helpers/api_helper';
import { POST_PASSWORD_FORGOT } from '../../helpers/url_helper';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await post(POST_PASSWORD_FORGOT, { user: { email } });
      setMessage(response?.status?.message || "If this email exists, a reset link has been sent.");
    } catch (err: any) {
      setError(err.response?.data?.status?.message || err.response?.data?.error || "Failed to send reset link.");
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
              <h3 className="font-weight-light my-1">Forgot Password</h3>
            </Card.Header>
            <Card.Body className="p-5">
              {error && <Alert variant="danger">{error}</Alert>}
              {message && <Alert variant="success">{message}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email to receive reset link"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" size="lg" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center py-3">
              <div className="small">
                <Link to="/login">Remembered your password? Login</Link>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
