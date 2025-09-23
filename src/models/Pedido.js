const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Pedido = sequelize.define(
  "Pedido",
  {
    nombreCliente: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cedulaIdentidad: {
      type: DataTypes.STRING,
      allowNull: true, // O false si quieres que sea obligatorio
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metodoPago: {
      type: DataTypes.ENUM(
        "efectivo",
        "transferencia",
        "pago_movil",
        "zelle",
        "bitcoin",
        "criptomoneda"
      ),
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    referenciaPago: {
      type: DataTypes.STRING,
      allowNull: true, // Será obligatorio solo para ciertos métodos de pago
    },
    bancoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Bancos",
        key: "id",
      },
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "en_proceso", "entregado", "cancelado"),
      defaultValue: "pendiente",
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: true, // o false si quieres forzar que solo usuarios logueados hagan pedidos
      references: {
        model: "Usuarios",
        key: "id",
      },
    },
  },
  {
    tableName: "Pedidos",
  }
);

module.exports = Pedido;
