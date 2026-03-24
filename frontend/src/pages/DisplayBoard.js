import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../services/socket";
import API from "../services/api";
import { Container, Card } from "react-bootstrap";

export default function DisplayBoard() {
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    // Fetch initial state
    API.get("/tickets/current").then(res => {
      if (res.data && res.data.numero) setCurrent(res.data);
    }).catch(() => {});

    // Listen to live calls
    socket.on("callTicket", (data) => {
      setCurrent(data);
      try {
        new Audio("/bell.mp3").play().catch(() => {});
      } catch (e) {}
    });

    return () => {
      socket.off("callTicket");
    };
  }, []);

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center text-white" style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)" }}>
      <Container className="text-center">
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="display-4 fw-bold shadow-sm d-inline-block px-5 py-3 rounded-pill bg-white text-primary">
            <i className="bi bi-display me-3"></i>Display Board
          </h1>
        </motion.div>

        <Card className="border-0 shadow-lg bg-white rounded-4 overflow-hidden mx-auto" style={{ maxWidth: "800px" }}>
          <div className="bg-body-secondary py-3 border-bottom text-muted fw-bold text-uppercase tracking-widest">
            Currently Serving
          </div>
          <Card.Body className="p-5 d-flex align-items-center justify-content-center" style={{ minHeight: "400px" }}>
            <AnimatePresence mode="wait">
              {current && current.numero !== "--" ? (
                <motion.div
                  key={current.numero}
                  initial={{ scale: 0, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 5 }}
                  className="w-100 text-center"
                >
                  <h1 className="fw-bold text-dark m-0 pb-3" style={{ fontSize: "14rem", lineHeight: "1" }}>
                    #{current.numero}
                  </h1>
                  {current.service && (
                    <div className="badge bg-primary text-white rounded-pill px-5 py-3 mt-4" style={{ fontSize: "3rem" }}>
                      <i className="bi bi-geo-alt-fill me-3"></i>{current.service.nom}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.h3
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-muted opacity-50"
                  style={{ fontSize: "3rem" }}
                >
                  Waiting for Next Client...
                </motion.h3>
              )}
            </AnimatePresence>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}