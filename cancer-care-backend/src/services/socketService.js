const socketIO = require('socket.io');

let io;
const userSockets = new Map(); // userId -> socketId

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: ['http://localhost:4200', 'http://localhost:4201'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connecté:', socket.id);

    // Authentification
    socket.on('authenticate', (userId) => {
      userSockets.set(userId, socket.id);
      socket.userId = userId;
      console.log(`✅ User ${userId} authentifié`);
      
      // Notifier médecin si patient
      socket.broadcast.emit('patient-online', userId);
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
        socket.broadcast.emit('patient-offline', socket.userId);
        console.log(`❌ User ${socket.userId} déconnecté`);
      }
    });
  });

  return io;
};

// Envoyer notification à un utilisateur
const sendNotification = (userId, event, data) => {
  const socketId = userSockets.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
    console.log(`📤 Notification envoyée à ${userId}:`, event);
    return true;
  }
  return false;
};

// Envoyer alerte à tous les médecins
const alertDoctors = (event, data) => {
  if (io) {
    io.emit('doctor-alert', { event, data });
    console.log('🚨 Alerte envoyée aux médecins');
  }
};

module.exports = {
  initializeSocket,
  sendNotification,
  alertDoctors,
  getUserSocket: (userId) => userSockets.get(userId)
};
