const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const platoController = require("../controllers/platoController");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { permit } = require("../middlewares/role.middleware");

router.get("/", platoController.getPlatos);

router.get("/:id", authenticateToken, platoController.getPlatoById);

router.post(
  "/",
  authenticateToken,
  permit("admin", "superadmin"),
  upload.single("imagen"),
  platoController.createPlato
);

router.put(
  "/:id",
  authenticateToken,
  permit("admin", "superadmin"),
  upload.single("imagen"),
  platoController.updatePlato
);

router.delete(
  "/:id",
  authenticateToken,
  permit("admin", "superadmin"),
  platoController.deletePlato
);

module.exports = router;
