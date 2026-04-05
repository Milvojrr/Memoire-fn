require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.route");
const ticketRoutes = require("./routes/ticket.route");
const serviceRoutes = require("./routes/service.route");
const userRoutes = require("./routes/user.route");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Rate limit: max 5 tickets per IP per minute
const ticketLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many requests. Please wait before taking another ticket." }
});

// inject socket
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);

// Apply rate limit only to ticket creation
app.use("/api/tickets/create", ticketLimiter);

// Admin broadcast message endpoint
app.post("/api/broadcast", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });
  io.emit("broadcastMessage", { message, time: new Date().toLocaleTimeString() });
  res.json({ success: true });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});