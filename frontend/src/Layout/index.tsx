import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../slices/login/thunk';
import Logo from '../components/Logo';
import { useTheme } from '../components/useTheme';
import { Sun, Moon, LogOut, User } from 'lucide-react';

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const handleLogout = () => {
    dispatch(logoutUser() as any);
    navigate('/login');
  };

  return (
    <>
      <Navbar expand="lg" className="mb-4" style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <Container>
          <Navbar.Brand as={Link} to="/dashboard" className="p-0">
            <Logo size={36} showText={true} textColor="#fff" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-nav" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>☰</span>
          </Navbar.Toggle>

          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto ms-4 gap-1">
              <Nav.Link
                as={Link}
                to="/dashboard"
                style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, fontSize: '0.9rem' }}
                className="px-3 py-2 rounded"
              >
                Dashboard
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/groups"
                style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, fontSize: '0.9rem' }}
                className="px-3 py-2 rounded"
              >
                Groups
              </Nav.Link>
            </Nav>

            <Nav className="align-items-center gap-2">
              {/* Theme toggle */}
              <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                {theme === 'light' ? 'Dark' : 'Light'}
              </button>

              {/* Profile */}
              <Nav.Link
                as={Link}
                to="/profile"
                className="d-flex align-items-center gap-1 px-2"
                style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}
              >
                <User size={16} />
                Profile
              </Nav.Link>

              {/* Logout */}
              <Button
                size="sm"
                onClick={handleLogout}
                style={{
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.35)',
                  color: '#fbbf24',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.85rem'
                }}
              >
                <LogOut size={14} />
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Outlet />
      </Container>
    </>
  );
};

export default Layout;
