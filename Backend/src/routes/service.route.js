const router = require("express").Router();
const ctrl = require("../controllers/service.controller");

router.post("/", ctrl.createService);
router.get("/", ctrl.getServices);
router.delete("/:id", ctrl.deleteService);

module.exports = router;