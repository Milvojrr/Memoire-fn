import { useState } from "react";
import { Container, Row, Col, Card, Form, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import AppButton from "../components/Button";

export default function Register() {
  const [form, setForm] = useState({ nom: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await API.post("/auth/register", { nom: form.nom, email: form.email, password: form.password, role: "client" });
      navigate("/login", { state: { registered: true } });
    } catch (e) {
      setError(e.response?.data?.error || "Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)" }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-0 shadow-lg overflow-hidden" style={{ borderRadius: "2rem" }}>
                <Row className="g-0">
                  {/* Left panel */}
                  <Col md={5} className="d-none d-md-flex flex-column justify-content-center align-items-center p-5 text-white"
                    style={{ background: "linear-gradient(160deg, #0d6efd, #0aa2c0)" }}>
                    <i className="bi bi-person-plus-fill mb-4" style={{ fontSize: "5rem", opacity: 0.9 }}></i>
                    <h3 className="fw-bold text-center">Join QueueHub</h3>
                    <p className="text-center opacity-75 mt-2">Create your account to skip the wait, track your position in line, and print your ticket.</p>
                    <div className="mt-4 text-center">
                      <small className="opacity-75">Already have an account?</small><br />
                      <Link to="/login" className="text-white fw-bold">Sign In →</Link>
                    </div>
                  </Col>

                  {/* Right form */}
                  <Col md={7}>
                    <Card.Body className="p-5 bg-body text-body">
                      <h4 className="fw-bold mb-1">Create Account</h4>
                      <p className="text-muted mb-4">Fill in your details to get started</p>
                      {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold small">Full Name</Form.Label>
                          <Form.Control size="lg" name="nom" placeholder="e.g. John Doe" value={form.nom} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold small">Email Address</Form.Label>
                          <Form.Control size="lg" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold small">Password</Form.Label>
                          <Form.Control size="lg" type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-bold small">Confirm Password</Form.Label>
                          <Form.Control size="lg" type="password" name="confirm" placeholder="Repeat password" value={form.confirm} onChange={handleChange} required />
                        </Form.Group>
                        <AppButton type="submit" variant="primary" size="lg" className="w-100 fw-bold py-3" disabled={loading}>
                          {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-person-check-fill me-2"></i>}
                          {loading ? "Creating Account..." : "Create Account"}
                        </AppButton>
                      </Form>
                      <div className="text-center mt-4 d-md-none">
                        <small className="text-muted">Already have an account? </small>
                        <Link to="/login" className="fw-bold">Sign In</Link>
                      </div>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
