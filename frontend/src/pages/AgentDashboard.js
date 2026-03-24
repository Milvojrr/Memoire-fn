import { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Badge, Form, Table } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import socket from "../services/socket";
import AppButton from "../components/Button";

const PRIORITY_CONFIG = {
  0: { label: "Normal", variant: "secondary", icon: "bi-person" },
  1: { label: "Priority", variant: "warning", icon: "bi-arrow-up-circle-fill" },
  2: { label: "Urgent", variant: "danger", icon: "bi-exclamation-circle-fill" },
};

export default function AgentDashboard() {
  const [stats, setStats] = useState({ total: 0, waiting: 0, served: 0 });
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [queue, setQueue] = useState([]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get("/tickets/stats");
      setStats(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchQueue = useCallback(async (svcId) => {
    try {
      const params = svcId ? `?serviceId=${svcId}` : "";
      const res = await API.get(`/tickets/queue${params}`);
      setQueue(res.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    const init = async () => {
      fetchStats();
      try {
        const res = await API.get("/services");
        setServices(res.data);
        if (res.data.length > 0) {
          setSelectedServiceId(res.data[0].id);
          fetchQueue(res.data[0].id);
        }
      } catch (e) { console.error(e); }

      try {
        const res = await API.get("/tickets/current");
        if (res.data && res.data.id) setActiveTicket(res.data);
      } catch (e) {}
    };
    init();

    socket.on("newTicket", () => { fetchStats(); fetchQueue(selectedServiceId); });
    socket.on("callTicket", (ticket) => { fetchStats(); setActiveTicket(ticket); fetchQueue(ticket.serviceId); });
    socket.on("ticketServed", () => { fetchStats(); });
    socket.on("queueUpdated", () => { fetchQueue(selectedServiceId); });

    return () => {
      socket.off("newTicket");
      socket.off("callTicket");
      socket.off("ticketServed");
      socket.off("queueUpdated");
    };
  }, []); // eslint-disable-line

  const handleServiceChange = (e) => {
    const id = e.target.value;
    setSelectedServiceId(id);
    fetchQueue(id || ""); // empty string = all services
  };

  const callNext = async () => {
    if (!selectedServiceId) return alert("Select a service first!");
    setLoading(true);
    try {
      const res = await API.post("/tickets/call", { serviceId: parseInt(selectedServiceId) });
      if (res.data.message) alert(res.data.message);
      fetchQueue(selectedServiceId);
    } catch (e) { alert("Erreur lors de l'appel"); }
    finally { setLoading(false); }
  };

  const markServed = async () => {
    if (!activeTicket) return;
    setLoading(true);
    try {
      await API.post("/tickets/serve", { ticketId: activeTicket.id });
      setActiveTicket(null);
      fetchStats();
      fetchQueue(selectedServiceId);
    } catch (e) { alert("Erreur lors de la clôture"); }
    finally { setLoading(false); }
  };

  const cyclePriority = async (ticket) => {
    const nextPriority = (ticket.priorite + 1) % 3;
    try {
      await API.patch("/tickets/priority", { ticketId: ticket.id, priority: nextPriority });
      fetchQueue(selectedServiceId);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-vh-100 bg-body pb-5">
      {/* Header */}
      <div className="bg-dark text-white py-4 shadow-sm mb-5">
        <Container>
          <h2 className="mb-0 fw-bold">
            <i className="bi bi-headset me-3 text-primary"></i> Agent Workspace
          </h2>
        </Container>
      </div>

      <Container>
        {/* Stats Row */}
        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100" style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)", color: "white" }}>
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-uppercase fw-bold opacity-75">Waiting</p>
                  <h2 className="display-4 fw-bold mb-0">{stats.waiting}</h2>
                </div>
                <i className="bi bi-people-fill opacity-50" style={{ fontSize: "4rem" }}></i>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100" style={{ background: "linear-gradient(135deg, #198754 0%, #146c43 100%)", color: "white" }}>
              <Card.Body className="p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 text-uppercase fw-bold opacity-75">Processed</p>
                  <h2 className="display-4 fw-bold mb-0">{stats.served}</h2>
                </div>
                <i className="bi bi-check2-all opacity-50" style={{ fontSize: "4rem" }}></i>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100 bg-body-tertiary">
              <Card.Body className="p-4 d-flex flex-column justify-content-center">
                <p className="mb-2 text-uppercase fw-bold text-muted small">Active Service Queue</p>
                <Form.Select size="lg" className="fw-bold text-primary shadow-sm border-0"
                  value={selectedServiceId} onChange={handleServiceChange}>
                  <option value="">🌐 All Services</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </Form.Select>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          {/* Control Panel */}
          <Col lg={5}>
            <Card className="border-0 shadow-lg h-100" style={{ borderRadius: "2rem", overflow: "hidden" }}>
              <div className="bg-body-tertiary p-4 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Queue Control</h5>
                <Badge bg="success" className="px-3 py-2 rounded-pill">
                  <i className="bi bi-broadcast me-2"></i>Online
                </Badge>
              </div>
              <Card.Body className="p-4 text-center bg-body d-flex flex-column justify-content-between">
                <div>
                  <p className="text-uppercase text-muted fw-bold mb-2 small">Currently Serving</p>
                  <AnimatePresence mode="popLayout">
                    <motion.div key={activeTicket ? activeTicket.id : "empty"}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="my-3">
                      {activeTicket ? (
                        <div>
                          <h1 className="fw-bold text-primary" style={{ fontSize: "5rem", lineHeight: "1" }}>#{activeTicket.numero}</h1>
                          {activeTicket.service && <h5 className="text-muted mt-2">{activeTicket.service.nom}</h5>}
                        </div>
                      ) : (
                        <div className="py-3 opacity-50">
                          <i className="bi bi-cup-hot d-block mb-2" style={{ fontSize: "3rem" }}></i>
                          <h5 className="text-muted fw-bold">Standby</h5>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="d-flex flex-column gap-3 mt-3">
                  {activeTicket && (
                    <AppButton variant="success" size="lg" onClick={markServed} disabled={loading}
                      className="w-100 py-3 fw-bold d-flex justify-content-center align-items-center gap-2"
                      style={{ borderRadius: "1rem" }}>
                      {loading
                        ? <span className="spinner-border spinner-border-sm"></span>
                        : <><i className="bi bi-check-circle-fill fs-5"></i> MARK AS SERVED</>}
                    </AppButton>
                  )}
                  <AppButton variant="primary" size="lg" onClick={callNext}
                    disabled={loading || !selectedServiceId}
                    className="w-100 py-4 fw-bold fs-5 shadow d-flex justify-content-center align-items-center gap-3 position-relative"
                    style={{ borderRadius: "1.5rem" }}>
                    {loading
                      ? <span className="spinner-border" style={{ width: "2rem", height: "2rem" }}></span>
                      : <>
                          <i className="bi bi-mic-fill fs-4"></i> CALL NEXT CLIENT
                          {stats.waiting > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                              style={{ fontSize: "0.9rem", padding: "0.4rem 0.7rem" }}>
                              {stats.waiting}
                            </span>
                          )}
                        </>}
                  </AppButton>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Live Queue Panel */}
          <Col lg={7}>
            <Card className="border-0 shadow-lg h-100" style={{ borderRadius: "2rem", overflow: "hidden" }}>
              <div className="bg-body-tertiary p-4 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-list-ol me-2 text-primary"></i>
                  Live Queue
                </h5>
                <div className="d-flex gap-2 align-items-center">
                  <span className="badge bg-primary rounded-pill px-3 py-2">{queue.length} waiting</span>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => fetchQueue(selectedServiceId)}>
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
              <Card.Body className="p-0 bg-body overflow-auto" style={{ maxHeight: "500px" }}>
                {queue.length === 0 ? (
                  <div className="text-center py-5 text-muted opacity-50">
                    <i className="bi bi-inbox d-block mb-3" style={{ fontSize: "3rem" }}></i>
                    <h5>Queue is empty</h5>
                  </div>
                ) : (
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-body-tertiary border-bottom">
                      <tr>
                        <th className="ps-4 py-3">Position</th>
                        <th>Ticket</th>
                        <th>Service</th>
                        <th>Wait Time</th>
                        <th className="pe-4 text-end">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {queue.map((t, idx) => {
                          const pCfg = PRIORITY_CONFIG[t.priorite] || PRIORITY_CONFIG[0];
                          const waitMs = Date.now() - new Date(t.heureCreation).getTime();
                          const waitMin = Math.floor(waitMs / 60000);
                          return (
                            <motion.tr key={t.id}
                              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
                              className={t.priorite > 0 ? "table-warning" : ""}>
                              <td className="ps-4 py-3">
                                <span className={`badge rounded-circle ${idx === 0 ? "bg-primary" : "bg-secondary"} p-2`}
                                  style={{ width: "2rem", height: "2rem", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="fw-bold fs-5">#{t.numero}</td>
                              <td><span className="badge bg-body-secondary text-body border">{t.service?.nom || "General"}</span></td>
                              <td className="text-muted small">{waitMin > 0 ? `${waitMin}m ago` : "Just now"}</td>
                              <td className="pe-4 text-end">
                                <button
                                  className={`btn btn-${pCfg.variant} btn-sm px-3 py-1 rounded-pill fw-bold`}
                                  onClick={() => cyclePriority(t)}
                                  title="Click to cycle priority">
                                  <i className={`bi ${pCfg.icon} me-1`}></i>
                                  {pCfg.label}
                                </button>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </Table>
                )}
              </Card.Body>
              <div className="p-3 bg-body-tertiary border-top">
                <div className="d-flex gap-3 justify-content-center">
                  {Object.entries(PRIORITY_CONFIG).map(([lvl, cfg]) => (
                    <span key={lvl} className={`badge bg-${cfg.variant} px-3 py-2 rounded-pill`}>
                      <i className={`bi ${cfg.icon} me-1`}></i>{cfg.label}
                    </span>
                  ))}
                  <span className="text-muted small align-self-center">← Click ticket to toggle</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}