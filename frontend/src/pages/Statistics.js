import { useState, useEffect } from "react";
import { Container, Row, Col, Card, ProgressBar, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import API from "../services/api";

export default function Statistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/tickets/stats/detailed")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!data) return <div className="p-5 text-center">No data available</div>;

  return (
    <div className="min-vh-100 bg-body pb-5">
      <div className="bg-dark text-white py-4 shadow-sm mb-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0 fw-bold">
              <i className="bi bi-graph-up-arrow me-3 text-primary"></i> 
              Detailed Analytics
            </h2>
            <button className="btn btn-outline-light btn-sm" onClick={() => window.print()}>
              <i className="bi bi-file-pdf me-1"></i> Export PDF
            </button>
          </div>
        </Container>
      </div>

      <Container>
        {/* KPI Row */}
        <Row className="g-4 mb-5">
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-primary text-white">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-uppercase fw-bold opacity-75 small">Completion Rate</p>
                  <h2 className="display-5 fw-bold mb-0">{data.completionRate}%</h2>
                </div>
                <i className="bi bi-pie-chart-fill opacity-50 fs-1"></i>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-success text-white">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-uppercase fw-bold opacity-75 small">Avg Handling</p>
                  <h2 className="display-5 fw-bold mb-0">{data.avgHandlingMin} <small className="fs-6">min</small></h2>
                </div>
                <i className="bi bi-stopwatch-fill opacity-50 fs-1"></i>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-warning text-dark">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-uppercase fw-bold opacity-75 small">Peak Hour</p>
                  <h2 className="display-5 fw-bold mb-0">{data.peakHour.hour}:00</h2>
                </div>
                <i className="bi bi-lightning-charge-fill opacity-50 fs-1"></i>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-info text-white">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-uppercase fw-bold opacity-75 small">Total Clients</p>
                  <h2 className="display-5 fw-bold mb-0">{data.total}</h2>
                </div>
                <i className="bi bi-people-fill opacity-50 fs-1"></i>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          {/* Service Breakdown */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100 rounded-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Service Performance</h5>
                {data.byService.map((s, i) => (
                  <div key={i} className="mb-4">
                    <div className="d-flex justify-content-between mb-1 small fw-bold">
                      <span>{s.name}</span>
                      <span>{s.served} / {s.total} Served</span>
                    </div>
                    <ProgressBar 
                      now={s.total > 0 ? (s.served / s.total) * 100 : 0} 
                      variant={s.served / s.total > 0.8 ? "success" : "primary"}
                      style={{ height: "10px" }}
                      className="rounded-pill"
                    />
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>

          {/* Hourly Traffic Chart (CSS based) */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100 rounded-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Hourly Traffic (Today)</h5>
                <div className="d-flex align-items-end justify-content-between" style={{ height: "200px", paddingBottom: "20px" }}>
                  {data.byHour.filter(h => h.hour >= 8 && h.hour <= 18).map((h, i) => {
                    const height = data.total > 0 ? (h.count / Math.max(...data.byHour.map(x => x.count || 1))) * 100 : 0;
                    return (
                      <div key={i} className="text-center" style={{ flex: 1 }}>
                        <motion.div 
                          initial={{ height: 0 }} 
                          animate={{ height: `${height}%` }}
                          className="bg-primary mx-1 rounded-top"
                          style={{ minWidth: "10px" }}
                          title={`${h.count} tickets at ${h.hour}:00`}
                        />
                        <div className="small text-muted mt-2" style={{ fontSize: "0.6rem" }}>{h.hour}h</div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center text-muted small mt-3">
                  Peak hour recorded at <strong>{data.peakHour.hour}:00</strong> with <strong>{data.peakHour.count}</strong> tickets.
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mt-1">
          <Col md={12}>
            <Card className="border-0 shadow-sm rounded-4 bg-body-tertiary">
              <Card.Body className="p-4 text-center">
                <p className="text-muted mb-0 small">
                  <i className="bi bi-info-circle me-1"></i>
                  Data is local to this workstation and reflects the current server state since midnight.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
