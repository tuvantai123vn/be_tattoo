const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register admin (first time setup)
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, zalo, facebook } = req.body;
    
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const admin = new Admin({
      username,
      password,
      email,
      zalo,
      facebook
    });

    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login admin
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        zalo: admin.zalo,
        facebook: admin.facebook
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get admin info
router.get('/info', async (req, res) => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database not connected' });
    }
    
    const admin = await Admin.findOne().maxTimeMS(5000);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json({
      username: admin.username,
      email: admin.email,
      zalo: admin.zalo || '',
      facebook: admin.facebook || '',
      facebookPageId: admin.facebookPageId || '',
      zaloPageId: admin.zaloPageId || ''
    });
  } catch (error) {
    if (error.name === 'MongoServerSelectionError' || error.name === 'MongoTimeoutError') {
      return res.status(503).json({ message: 'Database connection timeout. Please check your MongoDB connection.' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update admin info
router.put('/info', async (req, res) => {
  try {
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.email = req.body.email || admin.email;
    admin.zalo = req.body.zalo || admin.zalo;
    admin.facebook = req.body.facebook || admin.facebook;
    admin.facebookPageId = req.body.facebookPageId || admin.facebookPageId;
    admin.zaloPageId = req.body.zaloPageId || admin.zaloPageId;

    await admin.save();
    res.json({
      username: admin.username,
      email: admin.email,
      zalo: admin.zalo,
      facebook: admin.facebook
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

