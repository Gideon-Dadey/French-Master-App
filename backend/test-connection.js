// Quick script to test MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI || 'mongodb://localhost:27017/frenchmaster');
    
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/frenchmaster',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    
    // Test a simple query
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`   Collections: ${collections.length}`);
    
    await mongoose.connection.close();
    console.log('✅ Connection test passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check if MongoDB is running');
    console.log('2. Verify MONGODB_URI in .env file');
    console.log('3. Check network/firewall settings');
    console.log('4. For Atlas: Verify IP is whitelisted');
    process.exit(1);
  }
};

testConnection();

