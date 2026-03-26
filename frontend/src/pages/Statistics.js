import { useState, useEffect } from "react";
import { Container, Row, Col, Card, ProgressBar, Spinner, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import API from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Statistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = () => {
    setLoading(true);
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    API.get("/tickets/stats/detailed", { params })
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  if (loading && !data) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!data) return <div className="p-5 text-center">No data available</div>;

  // Chart Data: Hourly Traffic
  const barData = {
    labels: data.byHour.filter(h => h.hour >= 8 && h.hour <= 18).map(h => `${h.hour}h`),
    datasets: [
      {
        label: 'Tickets',
        data: data.byHour.filter(h => h.hour >= 8 && h.hour <= 18).map(h => h.count),
        backgroundColor: 'rgba(13, 110, 253, 0.7)',
        borderColor: 'rgb(13, 110, 253)',
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  // Chart Data: Service Distribution
  const pieData = {
    labels: data.byService.map(s => s.name),
    datasets: [
      {
        data: data.byService.map(s => s.total),
        backgroundColor: [
          'rgba(13, 110, 253, 0.7)',
          'rgba(25, 135, 84, 0.7)',
          'rgba(255, 193, 7, 0.7)',
          'rgba(13, 202, 240, 0.7)',
          'rgba(220, 53, 69, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-vh-100 bg-body pb-5">
      <div className="bg-dark text-white py-4 shadow-sm mb-4">
        <Container>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h2 className="mb-0 fw-bold">
              <i className="bi bi-graph-up-arrow me-3 text-primary"></i> 
              Detailed Analytics
            </h2>
            <div className="d-flex align-items-center gap-2">
              <Form.Control 
                type="date" 
                size="sm" 
                className="bg-secondary text-white border-0"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-white-50">to</span>
              <Form.Control 
                type="date" 
                size="sm" 
                className="bg-secondary text-white border-0"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <button className="btn btn-outline-light btn-sm ms-2" onClick={() => window.print()}>
                <i className="bi bi-file-pdf me-1"></i> Export PDF
              </button>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        {loading && <div className="text-center mb-3"><Spinner size="sm" animation="border" variant="primary" /> Updating...</div>}
        
        {/* KPI Row */}
        <Row className="g-4 mb-5">
          <Col lg={3} md={6}>
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
          <Col lg={3} md={6}>
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
          <Col lg={3} md={6}>
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
          <Col lg={3} md={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-info text-white">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-uppercase fw-bold opacity-75 small">Total Tickets</p>
                  <h2 className="display-5 fw-bold mb-0">{data.total}</h2>
                </div>
                <i className="bi bi-people-fill opacity-50 fs-1"></i>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mb-4">
          {/* Service Breakdown - Pie Chart */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100 rounded-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Service Distribution</h5>
                <div style={{ maxHeight: "300px" }} className="d-flex justify-content-center">
                  <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Hourly Traffic - Bar Chart */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100 rounded-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Hourly Traffic</h5>
                <div style={{ height: "300px" }}>
                  <Bar 
                    data={barData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } },
                      plugins: { legend: { display: false } }
                    }} 
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Detailed Table view or alternative view */}
        <Row className="g-4">
          <Col md={12}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Service Performance Details</h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Service Name</th>
                        <th>Total Tickets</th>
                        <th>Served</th>
                        <th>Success Rate</th>
                        <th style={{ width: "200px" }}>Completion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byService.map((s, i) => {
                        const rate = s.total > 0 ? Math.round((s.served / s.total) * 100) : 0;
                        return (
                          <tr key={i}>
                            <td className="fw-bold">{s.name}</td>
                            <td>{s.total}</td>
                            <td>{s.served}</td>
                            <td>{rate}%</td>
                            <td>
                              <ProgressBar 
                                now={rate} 
                                variant={rate > 80 ? "success" : rate > 50 ? "info" : "warning"}
                                style={{ height: "8px" }}
                                className="rounded-pill"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                  Data reflects tickets created between <strong>{startDate || "Today"}</strong> and <strong>{endDate || "Now"}</strong>.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
