// scripts/limpiarIndicesUsuarios.js

const sequelize = require("../src/config/database"); // Ajusta si tu path es distinto

async function eliminarIndicesDuplicados() {
  try {
    const [results] = await sequelize.query(`
      SHOW INDEX FROM usuarios WHERE Key_name LIKE 'cedula_%' OR Key_name LIKE 'correo_%';
    `);

    for (const index of results) {
      const indexName = index.Key_name;
      console.log(`Eliminando índice: ${indexName}`);
      await sequelize.query(`DROP INDEX \`${indexName}\` ON usuarios;`);
    }

    console.log("✅ Índices duplicados eliminados correctamente.");
    await sequelize.close();
  } catch (error) {
    console.error("❌ Error al eliminar los índices:", error.message);
    process.exit(1);
  }
}

eliminarIndicesDuplicados();
