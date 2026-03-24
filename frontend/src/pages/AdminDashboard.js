import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert, Form, Table } from "react-bootstrap";
import API from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, waiting: 0, served: 0, estimatedWaitMinutes: 0 });
  const [history, setHistory] = useState([]);
  const [services, setServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);

  const fetchData = async () => {
    try {
      const resStats = await API.get("/tickets/stats");
      setStats(resStats.data);

      const resHistory = await API.get("/tickets/all");
      setHistory(resHistory.data);
      
      const resServices = await API.get("/services");
      setServices(resServices.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleCreateService = async (e) => {
    e.preventDefault();
    if(!newServiceName) return;
    try {
      await API.post("/services", { nom: newServiceName, description: newServiceDesc });
      setNewServiceName("");
      setNewServiceDesc("");
      fetchData();
    } catch(e) { console.error("Error creating service"); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    try {
      await API.post("/broadcast", { message: broadcastMsg });
      setBroadcastMsg("");
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 3000);
    } catch (e) { console.error("Broadcast failed"); }
  };

  return (
    <div className="min-vh-100 bg-body pb-5">
      <div className="bg-dark text-white py-4 shadow-sm mb-5">
        <Container>
          <h2 className="mb-0 fw-bold"><i className="bi bi-shield-lock me-3 text-primary"></i> Administrator Dashboard</h2>
        </Container>
      </div>

      <Container>
        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-primary text-white">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-uppercase fw-bold opacity-75">Total Tickets Today</p>
                  <h2 className="display-4 fw-bold mb-0">{stats.total}</h2>
                </div>
                <i className="bi bi-ticket-perforated opacity-50" style={{ fontSize: "4rem" }}></i>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-warning text-dark">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-uppercase fw-bold opacity-75">Currently Waiting</p>
                  <h2 className="display-4 fw-bold mb-0">{stats.waiting}</h2>
                </div>
                <i className="bi bi-hourglass-split opacity-50" style={{ fontSize: "4rem" }}></i>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-info text-white">
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-uppercase fw-bold opacity-75">Est. Wait Time</p>
                  <h2 className="display-4 fw-bold mb-0">{stats.estimatedWaitMinutes}<small className="fs-4"> min</small></h2>
                </div>
                <i className="bi bi-clock-history opacity-50" style={{ fontSize: "4rem" }}></i>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={4}>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Body className="p-4 bg-body-tertiary border-bottom">
                <h5 className="mb-0 fw-bold">Manage Services</h5>
              </Card.Body>
              <Card.Body className="p-4">
                 <Form onSubmit={handleCreateService} className="mb-4">
                    <Form.Group className="mb-3">
                      <Form.Label>Service Name</Form.Label>
                      <Form.Control type="text" placeholder="e.g. VIP Desk" value={newServiceName} onChange={e=>setNewServiceName(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control type="text" placeholder="Optional details..." value={newServiceDesc} onChange={e=>setNewServiceDesc(e.target.value)} />
                    </Form.Group>
                    <button className="btn btn-primary w-100 fw-bold">Add Service</button>
                 </Form>
                 <hr/>
                 <h6 className="fw-bold text-muted mb-3">Existing Services ({services.length})</h6>
                 {services.map(s => (
                   <div key={s.id} className="d-flex justify-content-between align-items-center p-2 border-bottom">
                     <span className="fw-bold">{s.nom}</span>
                     <span className="badge bg-secondary">ID: {s.id}</span>
                   </div>
                 ))}
              </Card.Body>
            </Card>

            {/* Broadcast Panel */}
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4 bg-body-tertiary border-bottom">
                <h5 className="mb-0 fw-bold"><i className="bi bi-megaphone-fill me-2 text-warning"></i>Broadcast Message</h5>
              </Card.Body>
              <Card.Body className="p-4">
                {broadcastSent && <Alert variant="success" className="py-2">✅ Message sent to all screens!</Alert>}
                <Form onSubmit={handleBroadcast}>
                  <Form.Group className="mb-3">
                    <Form.Label>Announcement</Form.Label>
                    <Form.Control as="textarea" rows={2} placeholder="e.g. Counter 3 is now open" value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} required />
                  </Form.Group>
                  <button className="btn btn-warning w-100 fw-bold text-dark">
                    <i className="bi bi-megaphone me-2"></i>Send to All Screens
                  </button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-0">
                <div className="p-4 border-bottom bg-body-tertiary d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Recent Ticket History</h5>
                  <button className="btn btn-outline-primary btn-sm" onClick={fetchData}>
                    <i className="bi bi-arrow-clockwise"></i> Refresh
                  </button>
                </div>
                <div className="table-responsive p-3">
                  <Table hover className="align-middle mb-0">
                    <thead className="text-muted">
                      <tr>
                        <th>Ticket #</th>
                        <th>Status</th>
                        <th>Service</th>
                        <th>Created At</th>
                        <th>Processed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length ? history.map((t) => (
                        <tr key={t.id}>
                          <td className="fw-bold">#{t.numero}</td>
                          <td>
                            <span className={`badge ${t.statut === "EN_COURS" ? "bg-success" : t.statut === "EN_ATTENTE" ? "bg-warning text-dark" : "bg-secondary"}`}>
                              {t.statut}
                            </span>
                          </td>
                          <td>{t.service?.nom || "Unknown"}</td>
                          <td>{new Date(t.heureCreation).toLocaleTimeString()}</td>
                          <td>{t.heureAppel ? new Date(t.heureAppel).toLocaleTimeString() : "-"}</td>
                        </tr>
                      )) : <tr><td colSpan="5" className="text-center py-4 text-muted">No tickets found</td></tr>}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
