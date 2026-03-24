const router = require("express").Router();
const ctrl = require("../controllers/ticket.controller");
const auth = require("../middlewares/auth.middleware");
const optionalAuth = require("../middlewares/optionalAuth.middleware");
const role = require("../middlewares/role.middleware");

router.post("/create", optionalAuth, ctrl.createTicket);
router.post("/call", auth, role("agent", "admin"), ctrl.callNext);
router.post("/serve", auth, role("agent", "admin"), ctrl.markServed);
router.patch("/priority", auth, role("agent", "admin"), ctrl.setPriority);
router.get("/queue", auth, role("agent", "admin"), ctrl.getQueue);
router.get("/stats", auth, ctrl.getStats);
router.get("/stats/detailed", auth, role("admin", "agent"), ctrl.getDetailedStats);
router.get("/my", auth, ctrl.getMyTickets);
router.get("/all", auth, role("admin", "agent"), ctrl.getAllTickets);
router.get("/current", ctrl.getCurrentTicket);

module.exports = router;