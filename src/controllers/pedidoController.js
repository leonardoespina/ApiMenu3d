const { Pedido, PedidoPlato, Plato, Usuario, Banco } = require("../models");
const sequelize = require("../config/database");
const { paginateAndSearch } = require("../utils/paginationHelper");

const requiereLogin = false;

const ESTADOS_VALIDOS = ["pendiente", "en_proceso", "entregado", "cancelado"];

const generarMensajeWhatsApp = (pedido, platos) => {
  let mensaje = `🧾 *NUEVO PEDIDO* 🧾\n\n`;
  mensaje += `👤 *Cliente:* ${pedido.nombreCliente}\n`;
  mensaje += `📞 *Teléfono:* ${pedido.telefono}\n`;

  if (pedido.cedulaIdentidad)
    mensaje += `🆔 *Cédula:* ${pedido.cedulaIdentidad}\n`;

  if (pedido.direccion) mensaje += `📍 *Dirección:* ${pedido.direccion}\n`;

  mensaje += `💳 *Método de pago:* ${pedido.metodoPago}\n`;

  // Información de referencia de pago si existe
  if (pedido.referenciaPago) {
    mensaje += `🔢 *Referencia de pago:* ${pedido.referenciaPago}\n`;
  }

  // Información del banco si existe
  if (pedido.Banco) {
    mensaje += `🏦 *Banco:* ${pedido.Banco.nombre}\n`;
    mensaje += `📋 *Cuenta:* ${pedido.Banco.tipo_cuenta} - ${pedido.Banco.cedula_rif}\n`;

    if (pedido.Banco.telefono) {
      mensaje += `📱 *Pago Móvil:* ${pedido.Banco.telefono}\n`;
    }
  }

  if (pedido.observaciones)
    mensaje += `📝 *Observaciones:* ${pedido.observaciones}\n`;

  mensaje += `\n🍽️ *PLATOS:*\n`;
  mensaje += `────────────────\n`;

  platos.forEach((item) => {
    mensaje += `• ${item.nombre} x${item.PedidoPlato.cantidad} = $${(
      item.PedidoPlato.precio * item.PedidoPlato.cantidad
    ).toFixed(2)}\n`;
  });

  mensaje += `────────────────\n`;
  mensaje += `💰 *TOTAL: $${pedido.total.toFixed(2)}*\n\n`;
  mensaje += `⏰ *Hora del pedido:* ${new Date().toLocaleString()}\n`;
  mensaje += `🆔 *Nº de pedido:* ${pedido.id}`;

  return mensaje;
};

exports.crearPedido = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    if (requiereLogin && !req.user?.id) {
      return res.status(401).json({ error: "No autorizado." });
    }

    const {
      nombreCliente,
      telefono,
      direccion,
      metodoPago,
      cedulaIdentidad, // Nuevo campo
      referenciaPago, // Nuevo campo
      bancoId, // Nuevo campo
      observaciones,
      total,
      platos = [],
    } = req.body;

    // Validar referencia para métodos electrónicos
    if (
      ["transferencia", "pago_movil", "pago móvil"].includes(
        metodoPago?.toLowerCase()
      ) &&
      !referenciaPago
    ) {
      return res.status(400).json({
        error:
          "Debes proporcionar un número de referencia para este método de pago.",
      });
    }

    if (!Array.isArray(platos) || platos.length === 0) {
      return res
        .status(400)
        .json({ error: "Debes incluir al menos un plato." });
    }

    const pedido = await Pedido.create(
      {
        nombreCliente,
        telefono,
        direccion,
        metodoPago,
        cedulaIdentidad, // Nuevo campo
        referenciaPago,
        bancoId,
        observaciones,
        total,
        usuarioId: req.user?.id || null,
      },
      { transaction: t }
    );

    const pedidoPlatos = platos.map((item) => ({
      pedidoId: pedido.id,
      platoId: item.platoId,
      cantidad: item.cantidad,
      precio: item.precio,
    }));

    await PedidoPlato.bulkCreate(pedidoPlatos, { transaction: t });
    await t.commit();

    const pedidoConPlatos = await Pedido.findByPk(pedido.id, {
      include: [
        {
          model: Plato,
          through: { attributes: ["cantidad", "precio"] },
        },
        {
          model: Banco,
          attributes: [
            "id",
            "nombre",
            "tipo_cuenta",
            "cedula_rif",
            "telefono",
            "cedula_asociada",
            "banco_asociado",
          ],
        },
      ],
    });

    const mensaje = generarMensajeWhatsApp(
      pedidoConPlatos,
      pedidoConPlatos.Platos
    );

    return res.status(201).json({
      pedido: pedidoConPlatos,
      mensajeWhatsApp: encodeURIComponent(mensaje),
      whatsappUrl: `https://wa.me/?text=${encodeURIComponent(mensaje)}`,
    });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error al crear el pedido:", error);
    return res.status(500).json({ error: "Error al crear el pedido." });
  }
};

// Actualizar la función generarMensajeWhatsApp

// En pedidoController.js, actualizar obtenerPedidos y obtenerPedidoPorId
exports.obtenerPedidos = async (req, res) => {
  try {
    const paginatedResult = await paginateAndSearch(
      Pedido,
      req.query,
      ["nombreCliente", "telefono"],
      {
        include: [
          {
            model: Plato,
            through: { attributes: ["cantidad", "precio"] },
          },
          {
            model: Usuario,
            attributes: ["id", "nombre", "correo"],
          },
          {
            model: Banco,
            attributes: ["id", "nombre", "tipo_cuenta", "cedula_rif"],
          },
        ],
        order: [["createdAt", "DESC"]],
      }
    );

    return res.json(paginatedResult);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return res.status(500).json({ error: "Error al obtener pedidos." });
  }
};

exports.obtenerPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Pedido.findByPk(id, {
      include: [
        {
          model: Plato,
          through: { attributes: ["cantidad", "precio"] },
        },
        {
          model: Usuario,
          attributes: ["id", "nombre", "correo"],
        },
        {
          model: Banco,
          attributes: [
            "id",
            "nombre",
            "tipo_cuenta",
            "cedula_rif",
            "telefono",
            "cedula_asociada",
            "banco_asociado",
          ],
        },
      ],
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    return res.json(pedido);
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    return res.status(500).json({ error: "Error al obtener pedido." });
  }
};

exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: "Estado inválido." });
    }

    const pedido = await Pedido.findByPk(id, {
      include: [
        { model: Plato, through: { attributes: ["cantidad", "precio"] } },
      ],
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    pedido.estado = estado;
    await pedido.save();

    const io = req.app.get("io");
    io.emit("pedido_actualizado", pedido); // Notifica al panel admin

    return res.json(pedido);
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    return res.status(500).json({ error: "Error al actualizar estado." });
  }
};

exports.actualizarPedidoCompleto = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      nombreCliente,
      telefono,
      direccion,
      metodoPago,
      cedulaIdentidad, // Nuevo campo
      observaciones,
      total,
      estado,
      platos = [],
    } = req.body;

    const pedido = await Pedido.findByPk(id);
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: "Estado inválido." });
    }

    // Actualizar datos generales
    Object.assign(pedido, {
      nombreCliente,
      telefono,
      direccion,
      metodoPago,
      cedulaIdentidad, // Nuevo campo
      observaciones,
      total,
      estado,
    });

    await pedido.save({ transaction: t });

    if (platos.length > 0) {
      // Eliminar platos anteriores
      await PedidoPlato.destroy({ where: { pedidoId: id }, transaction: t });

      // Insertar nuevos
      const nuevosPlatos = platos.map((item) => ({
        pedidoId: id,
        platoId: item.platoId,
        cantidad: item.cantidad,
        precio: item.precio,
      }));

      await PedidoPlato.bulkCreate(nuevosPlatos, { transaction: t });
    }

    await t.commit();

    // Obtener el pedido actualizado con relaciones
    const pedidoActualizado = await Pedido.findByPk(id, {
      include: [
        { model: Plato, through: { attributes: ["cantidad", "precio"] } },
        { model: Usuario, attributes: ["id", "nombre", "correo"] },
      ],
    });

    const io = req.app.get("io");
    io.emit("pedido_actualizado", pedidoActualizado);

    return res.json(pedidoActualizado);
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Error al actualizar pedido:", error);
    return res.status(500).json({ error: "Error al actualizar el pedido." });
  }
};

exports.eliminarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Pedido.findByPk(id);
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    await PedidoPlato.destroy({ where: { pedidoId: id } });
    await pedido.destroy();

    return res.json({ mensaje: "Pedido eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    return res.status(500).json({ error: "Error al eliminar el pedido." });
  }
};
