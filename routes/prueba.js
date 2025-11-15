app.get('/test/resumen', async (req, res) => {
  const { enviarResumenMensual } = require('./scripts/jobs/resumenMensual');
  await enviarResumenMensual();
  res.send('Resumen enviado');
});
