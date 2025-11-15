const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const check = require('../middlewares/auth');
const { requireSuperAdminRole } = require('../middlewares/superAdmin');

router.use(check.auth, requireSuperAdminRole);

router.get('/backup/download', (req, res) => {
  const mongoURI = process.env.DB_URI || process.env.MONGO_URI;
  const mongodumpBin = process.env.MONGODUMP_PATH || 'mongodump';

  if (!mongoURI) {
    return res
      .status(500)
      .json({ message: 'No se encontró la cadena de conexión a la base (DB_URI/MONGO_URI).' });
  }

  const backupFile = `/tmp/backup_${Date.now()}.gz`;
  const command = `${mongodumpBin} --uri="${mongoURI}" --archive=${backupFile} --gzip`;

  exec(command, (error) => {
    if (error) {
      console.error('Error en mongodump:', error);
      if (error.code === 127) {
        return res.status(500).json({
          message:
            'mongodump no está instalado o no se encuentra en el PATH. Instalalo (mongodb-database-tools) o definí MONGODUMP_PATH.',
        });
      }
      return res.status(500).json({ message: 'Error al generar el backup, revisá los logs.' });
    }

    res.download(backupFile, (err) => {
      if (err) {
        console.error('Error al enviar backup:', err);
      }
      fs.unlink(backupFile, () => {});
    });
  });
});

router.post('/backup/restore', async (req, res) => {
  const mongoURI = process.env.DB_URI || process.env.MONGO_URI;
  const mongorestoreBin =
    process.env.MONGORESTORE_PATH || process.env.MONGO_RESTORE_BIN || 'mongorestore';

  if (!mongoURI) {
    return res
      .status(500)
      .json({ message: 'No se encontró la cadena de conexión a la base (DB_URI/MONGO_URI).' });
  }

  if (!req.files || (!req.files.file && !req.files.backupFile)) {
    return res.status(400).json({ message: 'Subí un archivo .gz generado por el módulo de backups.' });
  }

  const uploadedFile = req.files.file || req.files.backupFile;
  if (!uploadedFile.name.endsWith('.gz')) {
    return res.status(400).json({ message: 'Sólo se admiten archivos .gz generados con mongodump.' });
  }

  const tempRestorePath = path.join('/tmp', `restore_${Date.now()}.gz`);

  try {
    await uploadedFile.mv(tempRestorePath);
  } catch (error) {
    console.error('No se pudo mover el archivo de backup:', error);
    return res.status(500).json({ message: 'No se pudo procesar el archivo recibido.' });
  }

  const command = `${mongorestoreBin} --uri="${mongoURI}" --archive=${tempRestorePath} --gzip --drop`;

  exec(command, (error, stdout, stderr) => {
    fs.unlink(tempRestorePath, () => {});

    if (error) {
      console.error('Error en mongorestore:', error);
      if (error.code === 127) {
        return res.status(500).json({
          message:
            'mongorestore no está instalado o no se encuentra en el PATH. Instalalo (mongodb-database-tools) o definí MONGORESTORE_PATH.',
        });
      }
      return res
        .status(500)
        .json({ message: 'Falló la restauración. Revisá los logs para más detalles.' });
    }

    console.log('Restauración completada:', stdout || stderr);
    return res.json({
      status: 'success',
      message: 'La base se restauró correctamente. Todas las colecciones se reemplazaron (sin duplicados).',
    });
  });
});

module.exports = router;
