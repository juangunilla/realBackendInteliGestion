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

module.exports = {
  getDatabaseInfo,
};
