const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Banco = sequelize.define("Banco", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo_cuenta: {
    type: DataTypes.ENUM("Ahorro", "Corriente"),
    allowNull: true,
  },
  cedula_rif: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  numero_cta: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tipo_pago: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cedula_asociada: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  banco_asociado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  deletedAt: {
    type: DataTypes.DATE,
  },
  deletedBy: {
    type: DataTypes.INTEGER,
  },
});

module.exports = Banco;
