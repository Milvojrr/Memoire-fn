import { useState, useEffect } from "react";
import { Container, Card, Table, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import API from "../services/api";

const STATUS_CONFIG = {
  EN_ATTENTE: { label: "Waiting", bg: "warning", text: "dark" },
  EN_COURS:   { label: "Being Served", bg: "primary", text: "white" },
  TERMINE:    { label: "Completed", bg: "success", text: "white" },
};

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/tickets/my")
      .then(res => setTickets(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-vh-100 bg-body pb-5">
      <div className="bg-dark text-white py-4 shadow-sm mb-5">
        <Container>
          <h2 className="mb-0 fw-bold">
            <i className="bi bi-clock-history me-3 text-primary"></i> My Ticket History
          </h2>
        </Container>
      </div>
      <Container>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="p-4 border-bottom bg-body-tertiary">
                <h5 className="mb-0 fw-bold">All Your Tickets</h5>
              </div>
              {loading ? (
                <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-5 opacity-50">
                  <i className="bi bi-ticket-perforated d-block mb-3" style={{ fontSize: "4rem" }}></i>
                  <h5 className="text-muted">No tickets yet</h5>
                  <p className="text-muted small">Take a ticket from the Client Dashboard to get started</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-body-secondary">
                      <tr>
                        <th className="ps-4 py-3">Ticket #</th>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Issued At</th>
                        <th className="pe-4">Served At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map(t => {
                        const s = STATUS_CONFIG[t.statut] || STATUS_CONFIG.EN_ATTENTE;
                        return (
                          <tr key={t.id}>
                            <td className="ps-4 fw-bold fs-5">#{t.numero}</td>
                            <td><span className="badge bg-body-secondary text-body border">{t.service?.nom || "General"}</span></td>
                            <td><Badge bg={s.bg} text={s.text} className="px-3 py-2 rounded-pill">{s.label}</Badge></td>
                            <td className="text-muted">{new Date(t.heureCreation).toLocaleString()}</td>
                            <td className="pe-4 text-muted">{t.heureFin ? new Date(t.heureFin).toLocaleString() : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
