const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { uploadVideo, processCloudinaryUpload } = require('../middleware/uploadCloudinary');

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ order: 1, createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    // Increment views
    video.views += 1;
    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create video (admin only - should add auth middleware)
router.post('/', uploadVideo, processCloudinaryUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }
    
    // Use Cloudinary URL
    const videoUrl = req.file.cloudinaryUrl;
    const thumbnail = req.file.thumbnail || '';
    
    if (!videoUrl) {
      return res.status(500).json({ message: 'Failed to upload video to Cloudinary' });
    }
    
    console.log('📹 Video uploaded to Cloudinary:', {
      title: req.body.title,
      url: videoUrl,
      publicId: req.file.publicId,
      thumbnail: thumbnail
    });
    
    const video = new Video({
      title: req.body.title,
      description: req.body.description,
      videoUrl: videoUrl,
      thumbnail: thumbnail || req.body.thumbnail || '',
      order: req.body.order || 0
    });
    const savedVideo = await video.save();
    res.status(201).json(savedVideo);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update video
router.put('/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete video
router.delete('/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json({ message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like video
router.post('/:id/like', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    video.likes += 1;
    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

