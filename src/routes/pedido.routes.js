const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Crear pedido (requiere login si está activado en el controlador)
router.post("/", pedidoController.crearPedido);

// Obtener todos los pedidos
router.get("/", pedidoController.obtenerPedidos);

// Obtener pedido por ID
router.get("/:id", pedidoController.obtenerPedidoPorId);

// Actualizar estado de un pedido
router.put("/:id", authenticateToken, pedidoController.actualizarEstado);

// ✅ Actualizar pedido completo (datos + platos + estado)
router.put(
  "/:id/completo",
  authenticateToken,
  pedidoController.actualizarPedidoCompleto
);

// Eliminar pedido
router.delete("/:id", authenticateToken, pedidoController.eliminarPedido);

module.exports = router;
