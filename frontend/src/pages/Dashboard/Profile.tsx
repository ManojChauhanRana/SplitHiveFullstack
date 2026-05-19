import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../slices';
import { put } from '../../helpers/api_helper';
import { loginSuccess } from '../../slices/login/reducer';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.Login);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let currentUser = user;
    
    // If Redux user is empty (e.g. on page refresh), fallback to localStorage
    if (!currentUser || !currentUser.id) {
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser);
        } catch (e) {
          console.error("Error parsing authUser from local storage", e);
        }
      }
    }

    if (currentUser) {
      setFullName(currentUser.full_name || '');
      setEmail(currentUser.email || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== passwordConfirmation) {
      return setError("New passwords do not match.");
    }
    if (!currentPassword) {
      return setError("Current password is required to update your profile.");
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response: any = await put('/users', { 
        user: { 
          full_name: fullName,
          email,
          current_password: currentPassword,
          password: password || undefined,
          password_confirmation: passwordConfirmation || undefined
        } 
      });
      setMessage(response?.status?.message || "Profile successfully updated!");
      if (response?.data) {
        // Update user state globally
        dispatch(loginSuccess(response.data));
        // Also update local storage so it persists
        localStorage.setItem("authUser", JSON.stringify(response.data));
      }
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
    } catch (err: any) {
      setError(err.response?.data?.status?.message || err.response?.data?.error || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className="py-3">
              <h4 className="mb-0">Profile Settings</h4>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              {message && <Alert variant="success">{message}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="fullName">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />
                <h5 className="mb-3">Change Password (Optional)</h5>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="passwordConfirmation">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />
                <h5 className="mb-3">Confirm Changes</h5>

                <Form.Group className="mb-4" controlId="currentPassword">
                  <Form.Label>Current Password <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Required to save changes"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    We need your current password to verify your identity.
                  </Form.Text>
                </Form.Group>

                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
