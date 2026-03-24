const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { nom, email, password, role } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.utilisateur.create({
    data: { nom, email, password: hash, role }
  });

  res.json(user);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.utilisateur.findUnique({ where: { email } });

  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign(
    { id: user.id, nom: user.nom, email: user.email, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({ token, user: { id: user.id, nom: user.nom, email: user.email, role: user.role } });
};