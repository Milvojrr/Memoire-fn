import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import socket from "../services/socket";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import AppCard from "../components/Card";
import AppButton from "../components/Button";

export default function ClientDashboard() {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentServing, setCurrentServing] = useState("--");
  const [services, setServices] = useState([]);
  const [waitTime, setWaitTime] = useState(null);
  const [broadcast, setBroadcast] = useState(null);

  // Request browser notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    API.get("/services").then(res => setServices(res.data)).catch(() => {});

    API.get("/tickets/current").then(res => {
      if (res.data && res.data.numero) setCurrentServing(res.data.numero);
    }).catch(() => {});

    API.get("/tickets/stats").then(res => {
      if (res.data.estimatedWaitMinutes !== undefined) setWaitTime(res.data.estimatedWaitMinutes);
    }).catch(() => {});

    socket.on("callTicket", (data) => {
      setCurrentServing(data.numero);
      // Notify the user if this is their ticket
      setTicket(prev => {
        if (prev && prev.numero === data.numero) {
          // Browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("🎉 It's Your Turn!", {
              body: `Ticket #${data.numero} — please proceed to the counter.`,
              icon: "/favicon.ico"
            });
          }
          // Audio bell
          try { new Audio("/bell.mp3").play().catch(() => {}); } catch (e) {}
        }
        return prev;
      });
    });

    socket.on("broadcastMessage", (data) => {
      setBroadcast(data);
      setTimeout(() => setBroadcast(null), 10000); // auto-dismiss after 10s
    });

    return () => {
      socket.off("callTicket");
      socket.off("broadcastMessage");
    };
  }, []);

  const printTicket = () => {
    const win = window.open("", "_blank", "width=400,height=600");
    win.document.write(`
      <html><head><title>Queue Ticket</title>
      <style>
        body { font-family: 'Courier New', monospace; text-align: center; padding: 30px; background: white; color: #000; }
        .ticket { border: 2px solid #000; padding: 20px; max-width: 300px; margin: auto; }
        .title { font-size: 1.2rem; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
        .divider { border-top: 2px dashed #000; margin: 14px 0; }
        .num { font-size: 5rem; font-weight: 900; margin: 10px 0; }
        .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #555; }
        .value { font-size: 1rem; font-weight: bold; margin-bottom: 10px; }
        .barcode { font-size: 2.5rem; letter-spacing: 5px; opacity: 0.4; }
      </style></head><body>
      <div class="ticket">
        <div class="title">Queue Management System</div>
        <div class="divider"></div>
        <div class="label">Your Ticket Number</div>
        <div class="num">#${ticket.numero}</div>
        <div class="divider"></div>
        <div class="label">Service</div>
        <div class="value">${ticket.serviceId ? 'Service #' + ticket.serviceId : 'General'}</div>
        <div class="label">Issued At</div>
        <div class="value">${new Date(ticket.heureCreation).toLocaleString()}</div>
        <div class="divider"></div>
        <div class="barcode">||| |||| ||| ||||</div>
        <div class="label" style="margin-top:10px;font-size:0.65rem">Please wait for your number to be called</div>
      </div>
      <script>window.onload=()=>{window.print();window.close();}<\/script>
      </body></html>
    `);
    win.document.close();
  };

  const takeTicket = async (serviceId) => {
    setLoading(true);
    try {
      const res = await API.post("/tickets/create", { serviceId });
      setTicket(res.data);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la prise de ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)" }}>
      <Container className="py-5 flex-grow-1 d-flex flex-column justify-content-center">
        
        {/* Admin Broadcast Banner */}
        <AnimatePresence>
          {broadcast && (
            <motion.div key="broadcast" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
              className="bg-warning text-dark rounded-3 p-3 mb-3 d-flex align-items-center gap-3 shadow">
              <i className="bi bi-megaphone-fill fs-4 flex-shrink-0"></i>
              <div>
                <strong>Announcement</strong> — {broadcast.message}
                <span className="ms-2 text-muted small">({broadcast.time})</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Queue Banner */}
        <Row className="justify-content-center mb-5">
          <Col md={10} lg={8}>
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <div className="bg-white text-dark rounded-pill shadow-lg d-flex align-items-center justify-content-between px-4 py-3 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-3">
                  <div className="spinner-grow text-success spinner-grow-sm" role="status"></div>
                  <span className="fw-bold fs-5">Live Queue Status</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  {waitTime !== null && (
                    <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                      <i className="bi bi-clock me-1"></i>~{waitTime} min wait
                    </span>
                  )}
                  <div className="fs-5">Serving: <Badge text={currentServing} /></div>
                </div>
              </div>
            </motion.div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <AnimatePresence mode="wait">
              {!ticket ? (
                <motion.div key="selector" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="text-center mb-4 text-white">
                    <h2 className="fw-bold display-5">Virtual Kiosk</h2>
                    <p className="lead opacity-75">Select a service to join the queue</p>
                  </div>
                  
                  <Row className="g-4 justify-content-center">
                    {services.length === 0 && <div className="text-center text-white"><span className="spinner-border"></span> Loading Services...</div>}
                    {services.map(s => (
                       <Col md={6} key={s.id}>
                         <AppCard className="border-0 shadow-lg text-center p-4 rounded-4 bg-body text-body h-100 d-flex flex-column hover-lift">
                           <i className={`bi ${s.nom.toLowerCase().includes('vip') ? 'bi-star-fill text-warning' : 'bi-person-badge text-primary'} mb-3 d-block`} style={{ fontSize: "4rem" }}></i>
                           <h4 className="fw-bold mb-2">{s.nom}</h4>
                           <p className="text-muted mb-4 small flex-grow-1">
                             {s.description || "Join this queue for immediate orientation."}
                           </p>
                           <AppButton 
                             size="lg" 
                             onClick={() => takeTicket(s.id)} 
                             disabled={loading}
                             className="w-100 py-3 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2"
                             variant={s.nom.toLowerCase().includes('vip') ? 'warning' : 'primary'}
                           >
                             {loading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-ticket-detailed-fill"></i> Select</>}
                           </AppButton>
                         </AppCard>
                       </Col>
                    ))}
                  </Row>
                </motion.div>
              ) : (
                <motion.div key="ticket" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0.4 }}>
                  <Card className="border-0 shadow-lg mx-auto bg-body text-body" style={{ maxWidth: "450px", borderRadius: "2rem", overflow: "hidden" }}>
                    <div className="bg-dark text-white text-center py-4">
                      <i className="bi bi-check-circle-fill text-success mb-2" style={{ fontSize: "3rem" }}></i>
                      <h4 className="mb-0 fw-bold mt-2">YOU ARE IN LINE</h4>
                    </div>
                    
                    <Card.Body className="text-center p-5 bg-body-tertiary">
                      <p className="text-uppercase text-muted fw-bold mb-1">Your Ticket</p>
                      <h1 className="fw-bold text-primary my-3" style={{ fontSize: "6rem", lineHeight: "1" }}>#{ticket.numero}</h1>
                      
                      <div className="mt-4 p-3 bg-body rounded-3 border">
                        <p className="text-muted small mb-1">Estimated Status</p>
                        {parseInt(ticket.numero) === parseInt(currentServing) ? (
                          <h4 className="text-success fw-bold mb-0">IT'S YOUR TURN!</h4>
                        ) : parseInt(ticket.numero) - parseInt(currentServing !== "--" ? currentServing : 0) === 1 ? (
                          <h5 className="text-warning fw-bold mb-0">You are next!</h5>
                        ) : (
                          <h5 className="text-dark fw-bold mb-0">Please wait...</h5>
                        )}
                      </div>
                    </Card.Body>
                    
                    <div className="bg-body-tertiary px-5">
                      <div style={{ borderTop: "3px dashed #dee2e6", margin: "0 -2rem" }}></div>
                    </div>
                    
                    <Card.Body className="text-center p-4 bg-body-tertiary d-flex justify-content-between align-items-center">
                      <i className="bi bi-upc-scan text-muted opacity-50" style={{ fontSize: "3rem" }}></i>
                      <div className="text-end">
                        <small className="text-muted d-block text-uppercase fw-bold">Issued At</small>
                        <span className="fw-bold fs-5">{new Date(ticket.heureCreation).toLocaleTimeString()}</span>
                      </div>
                    </Card.Body>
                    
                    <div className="p-3 bg-body d-flex justify-content-center gap-3 border-top">
                      <Button variant="outline-dark" className="fw-bold rounded-pill px-4" onClick={printTicket}>
                        <i className="bi bi-printer-fill me-2"></i>Print Ticket
                      </Button>
                      <Button variant="link" className="text-decoration-none text-muted fw-bold" onClick={() => setTicket(null)}>
                        <i className="bi bi-x-circle me-1"></i>Leave Queue
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

// Helper component for badge
function Badge({ text }) {
  return <span className="badge bg-primary fs-4 shadow-sm">#{text}</span>;
}