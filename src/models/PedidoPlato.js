const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PedidoPlato = sequelize.define(
  "PedidoPlato",
  {
    pedidoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "pedidos",
        key: "id",
      },
    },
    platoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "platos",
        key: "id",
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "pedido_plato",
    timestamps: false,
  }
);

module.exports = PedidoPlato;
