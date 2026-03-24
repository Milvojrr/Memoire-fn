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