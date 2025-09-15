const { Pedido, PedidoPlato, Plato, Usuario } = require("../models");

const generarMensajeWhatsApp = async (pedidoId) => {
  const pedido = await Pedido.findByPk(pedidoId, {
    include: [
      {
        model: Usuario,
        attributes: ["nombre", "telefono", "correo", "direccion"],
      },
      {
        model: PedidoPlato,
        include: [{ model: Plato, attributes: ["nombre", "precio"] }],
      },
    ],
  });

  if (!pedido) throw new Error("Pedido no encontrado");

  const usuario = pedido.Usuario;
  const platos = pedido.PedidoPlatos;

  let mensaje = `🍽 *Nuevo Pedido* #${pedido.id}\n`;
  mensaje += `👤 Cliente: ${usuario?.nombre || "Anónimo"}\n`;
  if (usuario?.telefono) mensaje += `📞 Tel: ${usuario.telefono}\n`;
  if (usuario?.direccion) mensaje += `🏠 Dirección: ${usuario.direccion}\n`;
  mensaje += `\n🧾 *Detalle del pedido:*\n`;

  platos.forEach((item, i) => {
    const linea = `  ${i + 1}. ${item.cantidad} x ${
      item.Plato.nombre
    } - $${item.precioUnitario.toFixed(2)}`;
    mensaje += linea + "\n";
  });

  mensaje += `\n💳 Método de pago: ${pedido.metodoPago}\n`;
  mensaje += `💰 Total: $${pedido.total.toFixed(2)}\n`;

  return mensaje;
};

module.exports = { generarMensajeWhatsApp };
