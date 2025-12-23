const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
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
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    if (error.message.includes('whitelist')) {
      console.error('\n📋 To fix this issue:');
      console.error('1. Go to https://cloud.mongodb.com/');
      console.error('2. Navigate to your cluster → Network Access');
      console.error('3. Click "Add IP Address"');
      console.error('4. Click "Add Current IP Address" or add 0.0.0.0/0 (allow all IPs - less secure)');
      console.error('5. Wait a few minutes for changes to propagate\n');
    }
    console.warn('⚠️  Server will continue without database connection. Some features may not work.');
    return false;
  }
};

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

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

// Start server
const startServer = async () => {
  const dbConnected = await connectDB();
  
  // Listen on all network interfaces (0.0.0.0) to allow access from mobile devices
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📱 Accessible at: http://0.0.0.0:${PORT}/api`);
    console.log(`🌐 Local access: http://localhost:${PORT}/api`);
    if (!dbConnected) {
      console.warn('⚠️  Running without database connection. API endpoints may return errors.');
    }
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      console.error('💡 To fix this:');
      console.error(`   1. Find the process: netstat -ano | findstr :${PORT}`);
      console.error('   2. Kill it: taskkill /PID <process_id> /F');
      console.error(`   3. Or use a different port by setting PORT environment variable\n`);
      process.exit(1);
    } else {
      throw error;
    }
  });
};

startServer();

module.exports = app;

