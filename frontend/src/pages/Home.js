import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-body-tertiary">
      <div className="flex-grow-1 d-flex align-items-center bg-primary text-white" style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)" }}>
        <Container>
          <Row className="align-items-center py-5">
            <Col lg={6} className="text-center text-lg-start mb-5 mb-lg-0">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <h1 className="display-3 fw-bold mb-4">Smart Queue Management</h1>
                <p className="lead mb-4 opacity-75">
                  Optimize your customer service with our intelligent, real-time ticketing system. Eliminate physical lines and increase customer satisfaction.
                </p>
                <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
                  <Button as={Link} to="/client" variant="light" size="lg" className="rounded-pill fw-bold px-4 shadow-sm">
                    <i className="bi bi-ticket-perforated me-2"></i> Get a Ticket
                  </Button>
                  <Button as={Link} to="/login" variant="outline-light" size="lg" className="rounded-pill px-4">
                    <i className="bi bi-person-fill-lock me-2"></i> Staff Login
                  </Button>
                </div>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <Card className="border-0 shadow-lg text-body bg-body rounded-4 overflow-hidden">
                  <div className="bg-body-secondary p-3 border-bottom d-flex align-items-center gap-2">
                    <div className="bg-danger rounded-circle" style={{width: "12px", height: "12px"}}></div>
                    <div className="bg-warning rounded-circle" style={{width: "12px", height: "12px"}}></div>
                    <div className="bg-success rounded-circle" style={{width: "12px", height: "12px"}}></div>
                  </div>
                  <Card.Body className="p-5 text-center">
                    <i className="bi bi-display text-primary mb-3" style={{ fontSize: "5rem" }}></i>
                    <h3>Live Status Updates</h3>
                    <p className="text-muted">Display boards sync in real-time across all devices thanks to WebSockets integration.</p>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="text-center g-4">
          <Col md={4}>
            <div className="p-4 bg-body rounded-4 shadow-sm h-100">
              <i className="bi bi-speedometer2 text-primary mb-3" style={{ fontSize: "3rem" }}></i>
              <h4>Fast & Efficient</h4>
              <p className="text-muted">Reduce perceived wait times and increase service throughput seamlessly.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 bg-body rounded-4 shadow-sm h-100">
              <i className="bi bi-graph-up-arrow text-success mb-3" style={{ fontSize: "3rem" }}></i>
              <h4>Analytics Dashboard</h4>
              <p className="text-muted">Monitor queue performance and operator efficiency from your admin panel.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 bg-white rounded-4 shadow-sm h-100">
              <i className="bi bi-phone text-info mb-3" style={{ fontSize: "3rem" }}></i>
              <h4>Mobile Ready</h4>
              <p className="text-muted">Fully responsive design allows clients to take tickets right from their smartphones.</p>
            </div>
          </Col>
        </Row>
      </Container>
      
      <footer className="bg-dark text-white-50 py-4 text-center mt-auto">
        <Container>
          <small>&copy; {new Date().getFullYear()} Graduation Project - Queue Management System</small>
        </Container>
      </footer>
    </div>
  );
}
