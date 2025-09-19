const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  getItems, 
  getUsuarios, 
  postItem, 
  profile, 
  updateItem, 
  updateCorreo, 
  uploader, 
  updateAvatar, 
  avatar, 
  forgotPassword, 
  resetPassword,
  saveSubscription,  // Importar nueva función
  sendNotification,    // Importar nueva función
  sendNotificationsToAll
} = require('../controllers/user');
const check = require('../middlewares/auth');

// Configuración de subida
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './img/upload/');
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 megabytes (en bytes)
  },
  filename: (req, file, cb) => {
    cb(null, 'avatar-' + Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Rutas existentes
router.post('/login', getItems);
router.get('/lista', check.auth, getUsuarios);
router.post('/register', postItem);
router.get('/profile/:_id', profile);
router.put('/update/:_id', updateItem);
router.put('/correo/:_id', updateCorreo);
router.post('/upload/:_id', [check.auth, upload.single('file')], uploader);
router.put('/avatar/:_id', updateAvatar);
router.get('/avatar/:file', avatar);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword); // Nueva ruta para restablecer la contraseña

// Rutas para notificaciones Push
router.post('/save-subscription', saveSubscription); // Ruta para guardar la suscripción
router.post('/send-notification', sendNotification); // Ruta para enviar notificaciones
router.post('/send-notifications-to-all', sendNotificationsToAll);


module.exports = router;
