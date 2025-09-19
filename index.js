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

const app = express();
const now = new Date();

require("./instrument.js");




// Configuración inicial
// Middleware para rastrear el flujo de middlewares
app.use((req, res, next) => {
  console.log(`[TRACE] Middleware executed for: ${req.method} ${req.originalUrl}`);
  next();
});

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

// Configurar cabeceras CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});




 

// Rutas de estructuras
app.use('/api/users', require('./routes/user'));
app.use('/api/health', require('./routes/health'));
app.use('/api/dbhealth', require('./routes/dbHealth'));
// Rutas de pilares
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/establecimientos', require('./routes/establecimientos'));
app.use('/api/profesionales', require('./routes/profesionales'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/ciuu', require('./routes/ciuu'));
app.use('/api/aguabac', require('./routes/form/aguaBacteriologico'));
app.use('/api/fisicoquimico', require('./routes/form/aguaFisicoQuimico'));
app.use('/api/pat', require('./routes/form/pat'));
app.use('/api/asp', require('./routes/form/asp'));
app.use('/api/ot', require('./routes/form/ot'));
app.use('/api/capacitaciones', require('./routes/form/capacitaciones'));
app.use('/api/iluminacionyruido', require('./routes/form/iluminacionyruido'));
app.use('/api/ergonomico', require('./routes/form/ergonomico'));
app.use('/api/art', require('./routes/form/art'));
app.use('/api/cargadefuego', require('./routes/form/cargaDeFuego'));
app.use('/api/vibracion', require('./routes/form/vibracion'));
app.use('/api/antisinestral', require('./routes/form/antisinestral'));
app.use('/api/artclient', require('./routes/form/artClient'));
app.use('/api/cronot', require('./routes/form/cronot'));
app.use('/api/cronoc', require('./routes/form/cronoc'));
app.use('/api/contaminantelabs', require('./routes/form/contaminantelab'));
app.use('/api/controlextintor', require('./routes/form/controlExtintor'));
app.use('/api/analisist', require('./routes/form/analisist'));
app.use('/api/leysap', require('./routes/form/leysap.js'));
app.use('/api/entregaepp', require('./routes/form/entregaepp.js'));
app.use('/api/estudioh', require('./routes/form/estudiohumo.js'));
app.use('/api/verificacion', require('./routes/form/verificacion.js'));


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

// Ejecuta el script de recordatorio junto con tu servidor
cron.schedule('15 20 * * *', () => {
  console.log('Ejecutando recordatorio de tareas por vencer...');
  reminderScript.checkDueTasks();
});

// Manejo de zonas horarias
const fechaUTC = "2024-06-01T19:15:34.230Z";
const fechaEnUTC = DateTime.fromISO(fechaUTC, { zone: 'utc' });
const fechaEnArgentina = fechaEnUTC.setZone('America/Argentina/Buenos_Aires');

console.log('Fecha y hora en UTC:', fechaEnUTC.toString());
console.log('Fecha y hora en Argentina:', fechaEnArgentina.toString());
console.log('Hora en Argentina:', fechaEnArgentina.toFormat('HH:mm:ss'));

// Iniciar servidor
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Tu app está lista en 0.0.0.0:${port}`);
});


configureSocketServer(server);