const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// Inicialización del cliente de WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Generación del código QR para la autenticación
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Confirmación de conexión exitosa
client.on("ready", () => {
  console.log("Cliente de WhatsApp está listo!");
});

// Manejo de mensajes entrantes (ejemplo)
client.on("message", (message) => {
  if (message.body === "!ping") {
    message.reply("pong");
  }
});

// Función para inicializar el servicio
const initializeWhatsApp = () => {
  client.initialize();
};

module.exports = {
  client,
  initializeWhatsApp,
};
