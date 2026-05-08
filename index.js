require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConnect = require('./config/database');
const port = process.env.PORT || 3000;
const configureSocketServer = require('./socketServer');
const health = require('./services/health');
const cron = require('node-cron');
const reminderScript = require('./scripts/reminder');
const { DateTime } = require('luxon');
const mongoose = require('mongoose'); // Asegúrate de tener esto importado
const AuditLog = require('./models/auditLog');
const { formEditAccess } = require('./middlewares/formEditAccess');

const app = express();
const now = new Date();
const appTimezone = process.env.APP_TIMEZONE || 'America/Argentina/Buenos_Aires';

require("./instrument.js");




// Configuración inicial
// Middleware para rastrear solicitudes únicas y evitar duplicaciones
const requestTracker = new Map();

app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substring(7); // Genera un ID único para cada solicitud
  const key = `${req.method}-${req.originalUrl}`;

  // Detecta solicitudes duplicadas
  if (requestTracker.has(key)) {
    console.warn(`[DUPLICATE] Request detected for ID: ${req.requestId}, Route: ${key}`);
  } else {
    requestTracker.set(key, true);
  }

  // Limpia el rastreo después de 5 segundos
  setTimeout(() => requestTracker.delete(key), 5000);

  console.log(`[START] [${req.method}] ${req.originalUrl} - Request ID: ${req.requestId}`);
  next();
});

// Middleware para finalizar logs de respuestas
app.use((req, res, next) => {
  const originalSend = res.send.bind(res);
  if (!res.originalSend) {
    // Solo declarar originalSend si no ha sido declarado previamente
    res.originalSend = res.send.bind(res);
  }
  let responseLogged = false; // Control para evitar múltiples logs

  res.send = (body) => {
    if (!responseLogged) {
      responseLogged = true;
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
      const dataSize = Buffer.byteLength(bodyString, 'utf8');
      console.log(`[END] [${req.method}] ${req.originalUrl} - ID: ${req.requestId}, Response Size: ${(dataSize / 1024).toFixed(2)} KB`);
    }
    return res.originalSend(body);
  };

  next();
});

app.use(cors());
app.use(express.json());

console.log(health);




const fileUpload = require('express-fileupload');
const bakupsRouter = require('./routes/bakups.js');
app.use('/api/bakups', fileUpload(), bakupsRouter);


 

// Rutas de estructuras
app.use('/api/users', require('./routes/user'));
app.use('/api/health', require('./routes/health'));
app.use('/api/dbhealth', require('./routes/dbHealth'));
// Rutas de pilares
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/establecimientos', require('./routes/establecimientos'));
app.use('/api/profesionales', require('./routes/profesionales'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api', require('./routes/importarEstablecimientos'));
app.use('/api/ciuu', require('./routes/ciuu'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/audit', require('./routes/auditLogs'));
app.use('/api/notification-preferences', require('./routes/notificationPreferenceRoutes'));
app.use('/api/estudios-por-vencer', require('./routes/estudiosPorVencer'));
app.use('/api/aguabac', formEditAccess, require('./routes/form/aguaBacteriologico'));
app.use('/api/fisicoquimico', formEditAccess, require('./routes/form/aguaFisicoQuimico'));
app.use('/api/pat', formEditAccess, require('./routes/form/pat'));
// Rutas ASP divididas en tres estudios
app.use('/api/asp/ensayo', formEditAccess, require('./routes/form/aspEnsayo'));
app.use('/api/asp/hidraulica', formEditAccess, require('./routes/form/aspHidraulica'));
app.use('/api/asp/canerias', formEditAccess, require('./routes/form/aspCanerias'));
app.use('/api/asp', formEditAccess, require('./routes/form/asp'));
app.use('/api/ot', formEditAccess, require('./routes/form/ot'));
app.use('/api/capacitaciones', formEditAccess, require('./routes/form/capacitaciones'));
app.use(
  '/api/capacitacionriesgoespecifico',
  formEditAccess,
  require('./routes/form/capacitacionRiesgoEspecifico')
);
app.use('/api/capacitacionincendio', formEditAccess, require('./routes/form/capacitacionIncendio.js'));
app.use(
  '/api/capacitacionautoelevadorres96015',
  formEditAccess,
  require('./routes/form/capacitacionAutoelevadorRes96015.js')
);

app.use('/api/iluminacionyruido', formEditAccess, require('./routes/form/iluminacionyruido'));
app.use('/api/ergonomico', formEditAccess, require('./routes/form/ergonomico'));
app.use('/api/art', formEditAccess, require('./routes/form/art'));
app.use('/api/artrgrgl', formEditAccess, require('./routes/form/artRGRGL'));
app.use('/api/cargadefuego', formEditAccess, require('./routes/form/cargaDeFuego'));
app.use('/api/termografia', formEditAccess, require('./routes/form/termografia'));
app.use('/api/vibracion', formEditAccess, require('./routes/form/vibracion'));
app.use('/api/antisinestral', formEditAccess, require('./routes/form/antisinestral'));
app.use('/api/analisist', formEditAccess, require('./routes/form/analisist'));
app.use('/api/analisisderiesgo', formEditAccess, require('./routes/form/analisisDeRiego'));

app.use('/api/artclient', formEditAccess, require('./routes/form/artClient'));
app.use('/api/cronot', formEditAccess, require('./routes/form/cronot'));
app.use('/api/cronoc', formEditAccess, require('./routes/form/cronoc'));
app.use('/api/contaminantelabs', formEditAccess, require('./routes/form/contaminantelab'));
app.use('/api/controlextintor', formEditAccess, require('./routes/form/controlExtintor'));
app.use('/api/entregaepp', formEditAccess, require('./routes/form/entregaepp.js'));
app.use('/api/capacitacionemergencias', formEditAccess, require('./routes/form/capacitacionEnEmergencias.js'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/estudioh', formEditAccess, require('./routes/form/estudiohumo.js'));
app.use('/api/verificacion', formEditAccess, require('./routes/form/verificacion.js'));
app.use('/api/leysap', formEditAccess, require('./routes/form/leysap.js'));
app.use('/api/residuosespeciales', formEditAccess, require('./routes/form/residuosEspeciales.js'));
app.use('/api/certificadoredincendio', formEditAccess, require('./routes/form/certificadoRedIncendio.js'));


// Al final de index.js o app.js
app.get('/test/resumen-mensual', async (req, res) => {
  const { enviarResumenMensual } = require('./scripts/jobs/resumenMensual.js');
  await enviarResumenMensual();
  res.send('Resumen mensual enviado correctamente.');
});

//depurar base de datos
mongoose.set('debug', true);
// Conexión a la base de datos
dbConnect();



console.log('La hora del servidor es: ', now.toString());
console.log('La hora UTC es: ', now.toUTCString());

cron.schedule('0 8 * * *', async () => {
  console.log('[REMINDER] Ejecutando recordatorio de vencimientos del día...');

  try {
    await reminderScript.checkDueTasks({ zone: appTimezone });
  } catch (error) {
    console.error('[REMINDER] Falló el recordatorio diario:', error);
  }
}, { timezone: appTimezone });

cron.schedule('0 3 * * *', async () => {
  const retentionWindow = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    const { deletedCount } = await AuditLog.deleteMany({
      createdAt: { $lt: retentionWindow },
    });
    console.log(
      `[AUDIT CLEANUP] ${deletedCount} registros eliminados anteriores a ${retentionWindow.toISOString()}`
    );
  } catch (error) {
    console.error('[AUDIT CLEANUP] Falló la limpieza:', error);
  }
});


// Manejo de zonas horarias
const fechaUTC = "2024-06-01T19:15:34.230Z";
const fechaEnUTC = DateTime.fromISO(fechaUTC, { zone: 'utc' });
const fechaEnArgentina = fechaEnUTC.setZone(appTimezone);

console.log('Fecha y hora en UTC:', fechaEnUTC.toString());
console.log('Fecha y hora en Argentina:', fechaEnArgentina.toString());
console.log('Hora en Argentina:', fechaEnArgentina.toFormat('HH:mm:ss'));

const { exec } = require('child_process');

// Ruta para actualización automática
app.post('/api/deploy', (req, res) => {
  const secret = req.headers['x-github-secret'];
  if (secret !== process.env.DEPLOY_SECRET) {
    return res.status(403).send('Forbidden');
  }

  exec('/usr/local/bin/update-inteli.sh', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error en deploy: ${stderr}`);
      return res.status(500).send('Error al actualizar');
    }
    console.log(stdout);
    res.status(200).send('Actualizado correctamente');
  });
});

// Iniciar servidor
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Tu app está lista en 0.0.0.0:${port}`);
});
console.log('DB_URI:', process.env.DB_URI);



configureSocketServer(server);
