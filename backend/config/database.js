// Database configuration
// This file can be used for additional database setup if needed

module.exports = {
  // MongoDB connection options
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};

