import { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { Link, useNavigate } from "react-router-dom";

export default function AppNavbar() {
  const [theme, setTheme] = useState("light");
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  // Decode role from JWT payload (no library needed)
  let userRole = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userRole = payload.role;
    } catch (e) {}
  }

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <Navbar bg={theme === "light" ? "light" : "dark"} variant={theme} expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
          <i className="bi bi-infinity me-2"></i>QueueHub
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/display">Display Board</Nav.Link>
            {isAuthenticated ? (
              <>
                {/* All authenticated users can see Client */}
                <Nav.Link as={Link} to="/client">Client</Nav.Link>
                <Nav.Link as={Link} to="/my-tickets">My Tickets</Nav.Link>

                {/* Agent and Admin only */}
                {(userRole === "agent" || userRole === "admin") && (
                  <>
                    <Nav.Link as={Link} to="/agent">Agent</Nav.Link>
                    <Nav.Link as={Link} to="/stats">Stats</Nav.Link>
                  </>
                )}

                {/* Admin only */}
                {userRole === "admin" && (
                  <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
                )}
              </>
            ) : (
              <Nav.Link as={Link} to="/register">Register</Nav.Link>
            )}
          </Nav>
          <div className="d-flex align-items-center gap-3">
            <Button variant={theme === "light" ? "outline-dark" : "outline-light"} size="sm" onClick={toggleTheme}>
              {theme === "light" ? <i className="bi bi-moon-stars-fill"></i> : <i className="bi bi-sun-fill"></i>}
            </Button>
            {isAuthenticated ? (
              <Button variant="danger" size="sm" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </Button>
            ) : (
              <Button as={Link} to="/login" variant="primary" size="sm" className="rounded-pill px-3">
                Login
              </Button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}