const Banco = require("../models/Banco");

exports.getAllBancos = async (req, res) => {
  try {
    const bancos = await Banco.findAll({ where: { status: true } });
    res.json(bancos);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los bancos" });
  }
};

exports.getBancoById = async (req, res) => {
  try {
    const { id } = req.params;
    const banco = await Banco.findOne({
      where: { id, status: true },
    });

    if (!banco) {
      return res.status(404).json({ error: "Banco no encontrado" });
    }

    res.json(banco);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el banco" });
  }
};

exports.createBanco = async (req, res) => {
  console.log(req.body.tipo_pago);
  try {
    const { body } = req;

    // Validaciones
    if (!body.nombre || !body.tipo_pago) {
      return res
        .status(400)
        .json({ error: "Nombre y tipo de pago son obligatorios" });
    }

    if (body.tipo_pago === "transferencia") {
      if (
        !body.numero_cta ||
        !body.cedula_asociada ||
        !body.tipo_cuenta ||
        !body.banco_asociado
      ) {
        return res.status(400).json({
          error:
            "Para Transferencia, se requieren todos los campos específicos",
        });
      }
    } else if (body.tipo_pago === "pago_movil") {
      if (!body.cedula_asociada || !body.telefono || !body.banco_asociado) {
        return res.status(400).json({
          error: "Para Pago Movil, se requieren todos los campos específicos",
        });
      }
    } else {
      // Otro tipo de pago
      if (!body.email) {
        return res
          .status(400)
          .json({ error: "Para este tipo de pago, se requiere un email" });
      }
    }

    const banco = await Banco.create(body);
    res.status(201).json(banco);
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      const errors = err.errors.map((error) => error.message);
      return res.status(400).json({ error: errors });
    }
    res.status(500).json({ error: "Error al crear el banco" });
  }
};

exports.updateBanco = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;

    const banco = await Banco.findOne({ where: { id, status: true } });
    if (!banco) {
      return res.status(404).json({ error: "Banco no encontrado" });
    }

    // Validaciones
    if (body.tipo_pago) {
      if (body.tipo_pago === "transferencia") {
        if (
          !body.numero_cta ||
          !body.cedula_asociada ||
          !body.tipo_cuenta ||
          !body.banco_asociado
        ) {
          return res.status(400).json({
            error:
              "Para Transferencia, se requieren todos los campos específicos",
          });
        }
      } else if (body.tipo_pago === "pago_movil") {
        if (!body.cedula_asociada || !body.telefono || !body.banco_asociado) {
          return res.status(400).json({
            error: "Para Pago Movil, se requieren todos los campos específicos",
          });
        }
      } else {
        // Otro tipo de pago
        if (!body.email) {
          return res
            .status(400)
            .json({ error: "Para este tipo de pago, se requiere un email" });
        }
      }
    }

    await banco.update(body);
    res.json({ message: "Banco actualizado correctamente", banco });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      const errors = err.errors.map((error) => error.message);
      return res.status(400).json({ error: errors });
    }
    res.status(500).json({ error: "Error al actualizar el banco" });
  }
};

exports.deleteBanco = async (req, res) => {
  console.log(req.user.id);

  try {
    const { id } = req.params;
    const banco = await Banco.findByPk(id);

    if (!banco || !banco.status) {
      return res.status(404).json({ error: "Banco no encontrado" });
    }

    // Verificación de seguridad para req.usuario
    if (!req.user || !req.user.id) {
      // Si no hay información del usuario, se puede decidir si fallar o permitir la eliminación sin auditoría.
      // Por seguridad, es mejor fallar si se espera un usuario.
      return res.status(401).json({
        error: "No autenticado. No se puede realizar la eliminación.",
      });
    }

    await banco.update({
      status: false,
      deletedAt: new Date(),
      deletedBy: req.user.id,
    });

    res.json({ message: "Banco eliminado correctamente" });
  } catch (err) {
    // Mejorar el logging de errores
    console.error("Error detallado al eliminar banco:", err);
    res.status(500).json({
      error: "Error interno del servidor al eliminar el banco.",
      detalle: err.message,
    });
  }
};
