const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ["GET", "POST"]
  }
});

// Make io accessible to routes
app.set('io', io);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // For easier development
}));
app.use(compression());
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 10000 : 100
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/frenchmaster', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
};

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_group', (groupId) => {
    socket.join(groupId);
    console.log(`User joined group: ${groupId}`);
  });

  socket.on('leave_group', (groupId) => {
    socket.leave(groupId);
    console.log(`User left group: ${groupId}`);
  });

  socket.on('typing', ({ groupId, userName }) => {
    socket.to(groupId).emit('user_typing', { userName });
  });

  // WebRTC Call Signaling
  socket.on('call_user', ({ groupId, callerName, type }) => {
    // Broadcast to the group that someone is calling
    socket.to(groupId).emit('incoming_call', {
      groupId,
      callerName,
      type,
      callerId: socket.id
    });
  });

  socket.on('accept_call', ({ to, accepterName }) => {
    socket.to(to).emit('call_accepted', { from: socket.id, accepterName });
  });

  socket.on('reject_call', ({ to }) => {
    socket.to(to).emit('call_rejected', { from: socket.id });
  });

  socket.on('end_call', ({ groupId }) => {
    socket.to(groupId).emit('call_ended');
  });

  socket.on('webrtc_signal', ({ to, signal }) => {
    socket.to(to).emit('webrtc_signal', { from: socket.id, signal });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/study-groups', require('./routes/studyGroups'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/progress-share', require('./routes/progressShare'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/topics', require('./routes/topics'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/scenarios', require('./routes/scenarios'));
app.use('/api/notes', require('./routes/notes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

// Start server
const startServer = async () => {
  await connectDB();

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📱 Real-time Sockets enabled`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = server;


