const socketIO = require('socket.io');
const users = require('./models/user');

function configureSocketServer(server) {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });

  const connectedUsers = new Map(); // Almacenar los IDs de los usuarios conectados y sus nombres

  io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);

    try {
      // Obtener la lista de usuarios desde el modelo users
      const userListFromDatabase = await users.find({}, 'nombreyapellido');
      console.log('Lista de usuarios:', userListFromDatabase);

      // Escuchar el evento 'setUser' del cliente y agregar el usuario al mapa
      socket.on('setUser', (user) => {
        connectedUsers.set(socket.id, user.nombreyapellido);
        emitUserList();
      });

      // Escuchar el evento 'sendMessageToUser' del cliente y procesar el mensaje
      socket.on('sendMessageToUser', ({ message, to }) => {
        const senderUsername = connectedUsers.get(socket.id);
        const recipientSocketId = [...connectedUsers.entries()].find((entry) => entry[1] === to)?.[0];
        
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receivedMessage', { senderUsername, message });
;
        }
      });
      

      // Escuchar el evento 'sendMessage' del cliente y procesar el mensaje
      socket.on('sendMessage', (message) => {
        const senderUsername = connectedUsers.get(socket.id); // Obtener el nombre del remitente
        io.emit('receivedMessage', { senderUsername, message });
        console.log(message);
      });

      // Escuchar el evento 'disconnect' del cliente y eliminar el usuario desconectado del mapa
      socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
        connectedUsers.delete(socket.id);
        emitUserList();
      });

      // Emitir la lista de usuarios conectados al cliente recién conectado
      emitUserList();
    } catch (error) {
      console.error('Error al obtener la lista de usuarios:', error);
    }
  });

  function emitUserList() {
    io.emit('userList', Array.from(connectedUsers.values()));
  }
}

module.exports = configureSocketServer;
