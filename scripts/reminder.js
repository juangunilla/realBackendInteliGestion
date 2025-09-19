const cron = require('node-cron');
const moment = require('moment');
const { default: mongoose, model } = require('mongoose');
const Task = require('../models/form/aguaBacteriologico');
const transporter = require('../config/mailer');

const sendReminderEmail = (userEmail, estudioNombre, dueDate,razonSocialCliente,calle,numero) => {
  const mailOptions = {
    from: 'gestionsepa@inteli.com.ar',
    to: userEmail,
    subject: 'Recordatorio de estudio o tareas por vencer',
    text: `Hola,\n\nEl estudio "${estudioNombre}" de ${razonSocialCliente} con dirección ${calle} ${numero} está por vencer el ${moment(dueDate).format('DD/MM/YYYY')}. revisa tus tareas o estudios por vencer. https://gestionsepa.netlify.app/ \n\nSaludos,\nInteli`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error al enviar el correo:', err);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
};
  
  const checkDueTasks = async () => {
    try {
      const now = moment();
      const tomorrow = moment().add(3, 'days');
  
      const tasks = await Task.find({
        vencimiento: { $gte: now.toDate(), $lte: tomorrow.toDate() },
      }).populate('cliente profesional');
  
      tasks.forEach((task) => {
        const userEmail = task.profesional[0]?.correo; // Ajusta esto según tu estructura
        const estudioNombre = "Agua Bacteriologico"; // Ajusta esto según tu estructura de modelo de tarea
        const razonSocialCliente = task.cliente[0].rozonSocial;
        const calle= task.establecimiento[0].calle
        const numero= task.establecimiento[0].numero
        console.log(calle,numero)
        if (userEmail && estudioNombre) {
          sendReminderEmail(userEmail, estudioNombre, task.vencimiento, razonSocialCliente, calle, numero);
        }
    });
    
    } catch (error) {
      console.error('Error al verificar tareas por vencer:', error);
    }
  };
  module.exports = { checkDueTasks };

  
  