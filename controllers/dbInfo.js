// controllers/databaseController.js
const mongoose = require('mongoose');

const getDatabaseInfo = (req, res) => {
    const db = mongoose.connection;
    db.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('Error al obtener colecciones:', err);
        res.status(500).json({ error: 'Error al obtener información de la base de datos' });
        return res.send({
            status:'error',
        });
      }
      
      console.log('Collections:', collections);
    
    const usedSpace = (collections.reduce((acc, collection) => acc + collection.size, 0) / (1024 * 1024)).toFixed(2);
    const availableSpace = ((db.stats.dataSize + db.stats.indexSize) / (1024 * 1024)).toFixed(2);
    
    const databaseInfo = {
      usedSpace: `${usedSpace} MB`,
      availableSpace: `${availableSpace} MB`,
    };
    console.log(databaseInfo)
    res.send({
        usedSpace,
        availableSpace
    });
  });
};

// Espacio usado/libre en MB según db.stats (MongoDB Atlas)
const getDatabaseStorage = async (req, res) => {
  try {
    const db = mongoose.connection?.db;
    if (!db) {
      return res.status(503).send({ status: 'error', message: 'Conexión a base de datos no inicializada' });
    }

    // scale en bytes -> MB
    const stats = await db.stats({ scale: 1024 * 1024 });

    const dataSizeMb = Number((stats.dataSize || 0).toFixed(2));
    const storageSizeMb = Number((stats.storageSize || 0).toFixed(2));
    const indexSizeMb = Number((stats.indexSize || 0).toFixed(2));

    // Espacio que ocupa la base: almacenamiento asignado + índices
    const usedMb = Number((storageSizeMb + indexSizeMb).toFixed(2));

    const totalMb = stats.fsTotalSize ? Number((stats.fsTotalSize).toFixed(2)) : null;
    const freeMb =
      stats.fsTotalSize && stats.fsUsedSize
        ? Number((stats.fsTotalSize - stats.fsUsedSize).toFixed(2))
        : null;

    return res.send({
      status: 'success',
      data: {
        usedMb,
        freeMb,
        totalMb,
        dataSizeMb,
        storageSizeMb,
        indexSizeMb,
        collections: stats.collections,
      },
      source: 'db.stats',
    });
  } catch (error) {
    console.error('[DB] Error al obtener almacenamiento', error);
    return res.status(500).send({
      status: 'error',
      message: 'No se pudo obtener el espacio de la base de datos',
    });
  }
};

module.exports = {
  getDatabaseInfo,
  getDatabaseStorage,
};
