require('dotenv').config();  // 👈 IMPORTANTE: SIEMPRE PRIMERO

const mongoose = require('mongoose');

const DB_URI = process.env.DB_URI;

// Log temporal para ver si carga bien el .env
console.log(">>> DB_URI RECIBIDA:", JSON.stringify(DB_URI));
console.log('DB_URI =>', JSON.stringify(process.env.DB_URI));

const dbConnect = async () => {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Conectado con la base de datos');

    const db = mongoose.connection;
    const stats = await db.db.stats();

    console.log(`Base de datos: ${stats.db}`);
    console.log(`Tamaño datos: ${(stats.dataSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Tamaño índices: ${(stats.indexSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Tamaño total: ${(stats.storageSize / (1024 * 1024)).toFixed(2)} MB`);
console.log('DB_URI RAW =>', JSON.stringify(process.env.DB_URI));

  } catch (err) {
    console.error('Error al conectar con la base de datos:', err);
  }
};

module.exports = dbConnect;
