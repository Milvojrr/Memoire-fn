const prisma = require("../config/prisma");

exports.createTicket = async (req, res) => {
  try {
    const { serviceId } = req.body;

    // Count only today's tickets so number resets at midnight
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const count = await prisma.ticket.count({
      where: { serviceId, heureCreation: { gte: todayStart } }
    });

    let clientId = req.user ? req.user.id : null;
    if (!clientId) {
      const guest = await prisma.utilisateur.findFirst({ where: { role: 'client' } });
      if (guest) clientId = guest.id;
      else return res.status(500).json({ error: "No guest client available to attach ticket to." });
    }

    const ticket = await prisma.ticket.create({
      data: {
        numero: count + 1,
        statut: "EN_ATTENTE",
        clientId,
        serviceId
      }
    });

    req.io.emit("newTicket", ticket); // 🔥 temps réel
    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.callNext = async (req, res) => {
  const { serviceId } = req.body;

  const ticket = await prisma.ticket.findFirst({
    where: { serviceId, statut: "EN_ATTENTE" },
    orderBy: [{ priorite: "desc" }, { heureCreation: "asc" }]
  });

  if (!ticket) return res.json({ message: "Aucun client" });

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: { statut: "EN_COURS", heureAppel: new Date() },
    include: { service: true }
  });

  req.io.emit("callTicket", updated);

  res.json(updated);
};

exports.getStats = async (req, res) => {
  const total = await prisma.ticket.count();
  const waiting = await prisma.ticket.count({ where: { statut: "EN_ATTENTE" } });
  const served = await prisma.ticket.count({ where: { statut: { in: ["EN_COURS", "TERMINE"] } } });

  // Compute average handling time (minutes) from completed tickets today
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const done = await prisma.ticket.findMany({
    where: { statut: "TERMINE", heureFin: { not: null }, heureAppel: { not: null }, heureCreation: { gte: todayStart } },
    select: { heureAppel: true, heureFin: true }
  });
  let avgHandling = 3; // default 3 min fallback
  if (done.length > 0) {
    const totalMs = done.reduce((acc, t) => acc + (new Date(t.heureFin) - new Date(t.heureAppel)), 0);
    avgHandling = Math.ceil(totalMs / done.length / 60000);
  }
  const estimatedWaitMinutes = waiting * avgHandling;

  res.json({ total, waiting, served, avgHandling, estimatedWaitMinutes });
};

exports.markServed = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { statut: "TERMINE", heureFin: new Date() }
    });
    // Let the network know the ticket is finished
    req.io.emit("ticketServed", updated);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: "Failed to mark as served" });
  }
};

exports.getAllTickets = async (req, res) => {
  const tickets = await prisma.ticket.findMany({
    orderBy: { heureCreation: "desc" },
    include: { service: true, client: true }
  });
  
  // Clean up client password
  const safeTickets = tickets.map(t => {
    if (t.client) delete t.client.password;
    return t;
  });

  res.json(safeTickets);
};

exports.getCurrentTicket = async (req, res) => {
  const ticket = await prisma.ticket.findFirst({
    where: { statut: "EN_COURS" },
    orderBy: { heureAppel: "desc" },
    include: { service: true }
  });
  res.json(ticket || { numero: "--" });
};

// Returns the live waiting queue ordered by priority desc then creation asc
exports.getQueue = async (req, res) => {
  const { serviceId } = req.query;
  const where = { statut: "EN_ATTENTE" };
  if (serviceId) where.serviceId = parseInt(serviceId);

  const queue = await prisma.ticket.findMany({
    where,
    orderBy: [{ priorite: "desc" }, { heureCreation: "asc" }],
    include: { service: true }
  });
  res.json(queue);
};

// Toggle priority on a ticket (0 -> 1 -> 2 -> 0)
exports.setPriority = async (req, res) => {
  try {
    const { ticketId, priority } = req.body;
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { priorite: priority }
    });
    req.io.emit("queueUpdated");
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: "Failed to set priority" });
  }
};

// Get tickets for the authenticated user
exports.getMyTickets = async (req, res) => {
  const tickets = await prisma.ticket.findMany({
    where: { clientId: req.user.id },
    orderBy: { heureCreation: "desc" },
    include: { service: true }
  });
  res.json(tickets);
};

// Detailed statistics for the stats page
exports.getDetailedStats = async (req, res) => {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

  const [allTickets, services] = await Promise.all([
    prisma.ticket.findMany({
      where: { heureCreation: { gte: todayStart } },
      include: { service: true }
    }),
    prisma.service.findMany()
  ]);

  // Per-service breakdown
  const byService = services.map(s => {
    const sTickets = allTickets.filter(t => t.serviceId === s.id);
    return {
      name: s.nom,
      total: sTickets.length,
      waiting: sTickets.filter(t => t.statut === "EN_ATTENTE").length,
      served: sTickets.filter(t => t.statut === "TERMINE").length,
    };
  });

  // Hourly distribution (0-23)
  const byHour = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: allTickets.filter(t => new Date(t.heureCreation).getHours() === h).length
  }));

  // Average handling time from completed tickets
  const done = allTickets.filter(t => t.statut === "TERMINE" && t.heureAppel && t.heureFin);
  const avgHandlingMs = done.length
    ? done.reduce((acc, t) => acc + (new Date(t.heureFin) - new Date(t.heureAppel)), 0) / done.length
    : 0;
  const avgHandlingMin = Math.round(avgHandlingMs / 60000);

  // Peak hour
  const peakHour = byHour.reduce((max, h) => h.count > max.count ? h : max, { hour: 0, count: 0 });

  const completionRate = allTickets.length
    ? Math.round((done.length / allTickets.length) * 100)
    : 0;

  res.json({
    total: allTickets.length,
    waiting: allTickets.filter(t => t.statut === "EN_ATTENTE").length,
    served: done.length,
    avgHandlingMin,
    completionRate,
    peakHour,
    byService,
    byHour
  });
};