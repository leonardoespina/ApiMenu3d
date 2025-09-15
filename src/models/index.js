// src/models/index.js
const Usuario = require("./Usuario");
const Categoria = require("./Categoria");
const Plato = require("./Plato");
const Pedido = require("./Pedido");
const PedidoPlato = require("./PedidoPlato");

const Empresa = require("./Empresa");
const Banco = require("./Banco");

// Relaciones
Categoria.hasMany(Plato, { foreignKey: "categoriaId" });
Plato.belongsTo(Categoria, { foreignKey: "categoriaId" });

Usuario.hasMany(Pedido, { foreignKey: "usuarioId" });
Pedido.belongsTo(Usuario, { foreignKey: "usuarioId" });

Pedido.belongsTo(Banco, { foreignKey: "bancoId" });
Banco.hasMany(Pedido, { foreignKey: "bancoId" });

Pedido.belongsToMany(Plato, {
  through: PedidoPlato,
  foreignKey: "pedidoId",
});
Plato.belongsToMany(Pedido, {
  through: PedidoPlato,
  foreignKey: "platoId",
});

module.exports = {
  Usuario,
  Categoria,
  Plato,
  Pedido,
  PedidoPlato,

  Empresa,
  Banco,
};
