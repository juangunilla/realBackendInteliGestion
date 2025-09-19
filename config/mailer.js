const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'gestionsepa@inteli.com.ar',
    pass: 'inteliSepa23!',
  },
  tls: {
    rejectUnauthorized: false,
  },
  greetingTimeout: 30000,
});

module.exports = transporter;
