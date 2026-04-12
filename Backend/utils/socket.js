const { Server } = require('socket.io');
// Library used for real-time communication (chat, notifications, live updates).
// We extract Server class from socket.io.
// Used to:
// Create socket server
// Handle connections
const jwt = require('jsonwebtoken');
// Used to:
// Verify JWT tokens
// Extract user info from tokens
const logger = require('./logger');


let io;
const connectedUsers = new Map();
// io - Stores socket server instance.
// map() - (userId → socketId) Track online users Send messages to specific users

const initializeSocket = (server) => {
	io = new Server(server, {
	  cors: {
		origin: process.env.FRONTEND_URL || 'http://localhost:3000',
		methods: ['GET', 'POST'],
		credentials: true
	  }
	});
  
	io.use((socket, next) => {
	  try {
		const token = socket.handshake.auth.token;
		if (!token) {
		  return next(new Error('Authentication error: No token provided'));
		}
  
		let decoded;
		try {
		  decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
		} catch (userError) {
		  try {
			decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
		  } catch (adminError) {
			return next(new Error('Authentication error: Invalid token'));
		  }
		}
  
		socket.userId = decoded.id;
		socket.userRole = decoded.role || 'user';
		next();
	  } catch (error) {
		logger.error('Socket authentication error:', error);
		next(new Error('Authentication error'));
	  }
	});
  
	io.on('connection', (socket) => {
	  logger.info(`User connected: ${socket.userId} (${socket.userRole})`);
	  
	  connectedUsers.set(socket.userId, socket.id);
  
	  socket.join(`user_${socket.userId}`);
  
	  if (socket.userRole === 'admin') {
		socket.join('admin_room');
	  }
  
	  socket.on('disconnect', () => {
		logger.info(`User disconnected: ${socket.userId}`);
		connectedUsers.delete(socket.userId);
	  });
  
	  socket.on('check_user_status', (callback) => {
		callback({ status: 'checked' });
	  });
	});
  
	logger.info('Socket.IO initialized successfully');
	return io;
  };

  module.exports = {
	initializeSocket
  }