const { Server } = require('socket.io');

let io;
let activeUsers = 0;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*', // matches your existing CORS setup
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    activeUsers++;
    io.emit('activeUsers', activeUsers);

    socket.on('disconnect', () => {
      activeUsers--;
      io.emit('activeUsers', activeUsers);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket(server) first.');
  }
  return io;
}

module.exports = { initSocket, getIO };