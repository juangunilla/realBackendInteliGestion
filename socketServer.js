const socketIO = require('socket.io');
const users = require('./models/user');

let ioInstance = null;
const userSockets = new Map(); // userId -> Set(socketId)

const getSocketsForUser = (userId) => userSockets.get(String(userId)) || new Set();

const addSocketForUser = (userId, socketId) => {
  const key = String(userId);
  if (!userSockets.has(key)) {
    userSockets.set(key, new Set());
  }
  userSockets.get(key).add(socketId);
};

const removeSocketForUser = (userId, socketId) => {
  const key = String(userId);
  if (!userSockets.has(key)) return;
  const sockets = userSockets.get(key);
  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(key);
  }
};

async function emitPresence() {
  if (!ioInstance) return;
  const presence = await users
    .find({}, 'nombreyapellido image online lastSeen')
    .lean();
  ioInstance.emit('chat:presence', presence);
}

async function markUserStatus(userId, online) {
  if (!userId) return;
  await users.findByIdAndUpdate(
    userId,
    { online, lastSeen: new Date() },
    { new: true }
  );
  emitPresence().catch((err) => console.error('Error emitiendo presencia', err));
}

function emitToUser(userId, event, payload) {
  if (!ioInstance) return;
  const sockets = getSocketsForUser(userId);
  sockets.forEach((socketId) => {
    ioInstance.to(socketId).emit(event, payload);
  });
}

function configureSocketServer(server) {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.on('chat:setUser', async (userPayload) => {
      const { _id, nombreyapellido } = userPayload || {};
      if (!_id) return;
      socket.data.userId = _id;
      socket.data.nombre = nombreyapellido || 'Usuario';
      addSocketForUser(_id, socket.id);
      await markUserStatus(_id, true);
    });

    socket.on('disconnect', async () => {
      const { userId } = socket.data || {};
      if (userId) {
        removeSocketForUser(userId, socket.id);
        if (getSocketsForUser(userId).size === 0) {
          await markUserStatus(userId, false);
        }
      }
    });
  });
}

function getIO() {
  return ioInstance;
}

module.exports = configureSocketServer;
module.exports.getIO = getIO;
module.exports.emitToUser = emitToUser;
