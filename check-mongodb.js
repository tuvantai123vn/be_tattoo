const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function checkMongoDB() {
  const defaultMongoURI = 'mongodb+srv://admin:admin@node-products.o0dvpt9.mongodb.net/duynhuart?retryWrites=true&w=majority';
  const mongoUri = process.env.MONGODB_URI || defaultMongoURI;
  
  console.log('🔍 Checking MongoDB connection...');
  console.log('📍 URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
  
  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(mongoUri, options);
    console.log('✅ MongoDB connection successful!');
    
    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📦 Collections:', collections.map(c => c.name).join(', ') || 'None');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n💡 Possible issues:');
      console.log('   1. MongoDB server is not running');
      console.log('   2. Connection string is incorrect');
      console.log('   3. Network/firewall blocking connection');
      console.log('   4. MongoDB Atlas IP whitelist issue');
    }
    
    process.exit(1);
  }
}

checkMongoDB();

