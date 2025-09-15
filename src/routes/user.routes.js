const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { permit: roleMiddleware } = require("../middlewares/role.middleware");

// Solo admin y superadmin pueden gestionar usuarios
router.get(
  "/",
  authenticateToken,
  roleMiddleware("admin", "superadmin"),
  userController.getUsers
);
router.get(
  "/:id",
  authenticateToken,
  roleMiddleware("admin", "superadmin"),
  userController.getUserById
);
router.post(
  "/",
  authenticateToken,
  roleMiddleware("admin", "superadmin"),
  userController.createUser
);
router.put(
  "/:id",
  authenticateToken,
  roleMiddleware("admin", "superadmin"),
  userController.updateUser
);
router.delete(
  "/:id",
  authenticateToken,
  roleMiddleware("admin", "superadmin"),
  userController.deleteUser
);

module.exports = router;
