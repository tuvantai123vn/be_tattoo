const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { uploadImage, processCloudinaryUpload } = require('../middleware/uploadCloudinary');

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const gallery = await Gallery.find(query).sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single gallery item
router.get('/:id', async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    // Increment views
    item.views += 1;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create gallery item (admin only)
router.post('/', uploadImage, processCloudinaryUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    
    // Use Cloudinary URL
    const imageUrl = req.file.cloudinaryUrl;
    
    if (!imageUrl) {
      return res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
    }
    
    console.log('🖼️  Image uploaded to Cloudinary:', {
      title: req.body.title,
      url: imageUrl,
      publicId: req.file.publicId
    });
    
    const galleryItem = new Gallery({
      title: req.body.title,
      description: req.body.description,
      imageUrl: imageUrl,
      category: req.body.category || 'other',
      price: req.body.price || 0
    });
    const savedItem = await galleryItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update gallery item
router.put('/:id', async (req, res) => {
  try {
    const item = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete gallery item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like gallery item
router.post('/:id/like', async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    item.likes += 1;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

