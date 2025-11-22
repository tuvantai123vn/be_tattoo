const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded files - ensure directories exist
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  fs.mkdirSync(path.join(uploadsPath, 'videos'), { recursive: true });
  fs.mkdirSync(path.join(uploadsPath, 'images'), { recursive: true });
  console.log('✅ Created uploads directories');
}
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// MongoDB Connection
const mongoOptions = {
  serverSelectionTimeoutMS: 10000, // Timeout after 10s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

// Default MongoDB Atlas connection string (from create-admin.js)
const defaultMongoURI = 'mongodb+srv://admin:admin@node-products.o0dvpt9.mongodb.net/duynhuart?retryWrites=true&w=majority';

mongoose.connect(process.env.MONGODB_URI || defaultMongoURI, mongoOptions)
.then(() => {
  console.log('✅ MongoDB Connected');
  mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
  });
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.log('💡 Make sure MongoDB is running or check your MONGODB_URI in .env file');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

