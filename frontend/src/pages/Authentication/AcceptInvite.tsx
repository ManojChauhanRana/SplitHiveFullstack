import React, { useEffect, useRef, useState } from 'react';
import { Alert, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '../../helpers/api_helper';
import { POST_ACCEPT_INVITE } from '../../helpers/url_helper';

const AcceptInvite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const requestStarted = useRef(false);
  const [message, setMessage] = useState('Accepting invitation...');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const acceptInvite = async () => {
      if (requestStarted.current) return;
      requestStarted.current = true;

      if (!token) {
        setError('Invitation link is missing a token.');
        setLoading(false);
        return;
      }

      try {
        const response: any = await post(POST_ACCEPT_INVITE, { token });
        const params = `email=${encodeURIComponent(response.email || '')}&invite_token=${encodeURIComponent(token)}`;

        if (response.status === 'joined') {
          if (localStorage.getItem('token')) {
            navigate(`/groups/${response.group_id}`);
            return;
          }

          navigate(`/login?${params}`);
          return;
        }

        navigate(`/register?${params}`);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to accept invitation.');
      } finally {
        setLoading(false);
      }
    };

    acceptInvite();
  }, [navigate, token]);

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={5}>
          <Card className="shadow-lg border-0 rounded-lg mt-5">
            <Card.Header className="bg-success text-white text-center py-4">
              <h3 className="font-weight-light my-1">SplitHive Invitation</h3>
            </Card.Header>
            <Card.Body className="p-5 text-center">
              {loading ? (
                <>
                  <Spinner animation="border" variant="success" className="mb-3" />
                  <p className="mb-0">{message}</p>
                </>
              ) : error ? (
                <Alert variant="danger" className="mb-0">{error}</Alert>
              ) : (
                <Alert variant="success" className="mb-0">{message}</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AcceptInvite;
