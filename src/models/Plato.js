const { DataTypes } = require("sequelize");
const db = require("../config/database");

const Plato = db.define("Plato", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  imagen: {
    type: DataTypes.STRING,
  },
  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
  },
  deletedBy: {
    type: DataTypes.INTEGER,
  },
  deletedAt: {
    type: DataTypes.DATE,
  },
});

module.exports = Plato;
