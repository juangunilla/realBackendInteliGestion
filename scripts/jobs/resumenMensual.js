const cron = require('node-cron');
const getTodosLosEstudiosDelMes = require('../../routes/getTodosLosEstudios');
const transporter = require('../../config/mailer');
const clientes = require('../../models/clientes');

const enviarResumenMensual = async () => {
  try {
    const estudios = await getTodosLosEstudiosDelMes();

    // Aquí agrupás los estudios por profesional
    const agrupados = {};


    estudios.forEach((est) => {
      const prof = est.profesional?.[0];
      console.log(prof)
      if (!prof || !prof.correo) return;

      if (!agrupados[prof._id]) {
        agrupados[prof._id] = {
          nombre: prof.nombreyapellido,
          correo: prof.correo,
          estudios: [],
        };
      }


      console.log('Cliente:', JSON.stringify(est.cliente, null, 2));

      console.log(est.cliente[0].establecimientos[0].calle)
      agrupados[prof._id].estudios.push({
        tipo: est.tipo,
        cliente: est.cliente[0].rozonSocial,
        direccion: `${est.cliente[0]?.establecimientos?.[0]?.calle || 'Calle desconocida'} ${est.cliente[0]?.establecimientos?.[0]?.numero || ''}`,

        fecha: est.vencimiento,
      });
    });


    for (const id in agrupados) {
      const { nombre, correo, estudios } = agrupados[id];
      if (estudios.length === 0) continue;

      let cuerpo = `Hola ${nombre},\n\nEste es tu resumen mensual de estudios asignados:\n\n`;
      estudios.forEach((e, i) => {
        cuerpo += `${i + 1}. ${e.tipo} - ${e.cliente}, ${e.direccion}, vence: ${new Date(e.fecha).toLocaleDateString()}\n`;
      });
      cuerpo += `\nPodés revisar todos tus estudios en: https://gestionsepa.netlify.app/\n\nSaludos,\nInteli Gestión`;

      await transporter.sendMail({
        from: 'gestionsepa@inteli.com.ar',
        to: correo,
        subject: '📋 Resumen mensual de estudios asignados',
        text: cuerpo,
      });

      console.log(`✅ Resumen enviado a ${correo}`);
      console.log(nombre)
    }

  } catch (error) {
    console.error('❌ Error al enviar resumen mensual:', error);
  }
};

// CRON: día 1 de cada mes a las 08:00 AM
cron.schedule('0 8 1 * *', enviarResumenMensual);

module.exports = { enviarResumenMensual };
