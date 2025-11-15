const mongoose = require('mongoose');
const DB_URI = process.env.DB_URI;

const dbConnect = () => {
  mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Conectado con la base de datos');
    
    // Obtener información sobre la base de datos
    const db = mongoose.connection;
    db.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('Error al obtener colecciones:', err);
        return;
      }
      
      const usedSpace = (collections.reduce((acc, collection) => acc + collection.size, 0) / (1024 * 1024)).toFixed(2);
      const availableSpace = ((db.stats.dataSize + db.stats.indexSize) / (1024 * 1024)).toFixed(2);
    
      console.log(`Espacio utilizado en la base de datos: ${usedSpace} MB`);
      console.log(`Espacio disponible en la base de datos: ${availableSpace} MB`);
    });
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err);
  });
};

module.exports = dbConnect;
