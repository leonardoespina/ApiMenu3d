const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Categoria = sequelize.define("Categoria", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
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

module.exports = Categoria;
