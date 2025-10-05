const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

router.get('/backup/download', (req, res) => {
  const mongoURI = process.env.MONGO_URI;
  const backupFile = `/tmp/backup_${Date.now()}.gz`;

  exec(`mongodump --uri="${mongoURI}" --archive=${backupFile} --gzip`, (error) => {
    if (error) {
      console.error('Error en mongodump:', error);
      return res.status(500).json({ message: 'Error al generar backup' });
    }

    res.download(backupFile, (err) => {
      if (err) console.error('Error al enviar backup:', err);
      fs.unlink(backupFile, () => {}); // limpia después
    });
  });
});

module.exports = router;
