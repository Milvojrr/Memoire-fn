const prisma = require("../config/prisma");

exports.createService = async (req, res) => {
  const service = await prisma.service.create({
    data: req.body
  });

  res.json(service);
};

exports.getServices = async (req, res) => {
  const services = await prisma.service.findMany();
  res.json(services);
};

exports.deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    // Delete all tickets linked to this service first
    await prisma.ticket.deleteMany({ where: { serviceId: parseInt(id) } });
    await prisma.service.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Service deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete service" });
  }
};