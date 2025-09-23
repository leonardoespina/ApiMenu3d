const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PedidoPlato = sequelize.define(
  "PedidoPlato",
  {
    pedidoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Pedidos",
        key: "id",
      },
    },
    platoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Platos",
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
    tableName: "Pedido_plato",
    timestamps: false,
  }
);

module.exports = PedidoPlato;
