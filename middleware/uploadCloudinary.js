const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { imageStorage, videoStorage, getCloudinaryUrl, getVideoThumbnail } = require('../services/cloudinary');

// Create local uploads directory as fallback
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.mkdirSync(path.join(uploadDir, 'videos'), { recursive: true });
  fs.mkdirSync(path.join(uploadDir, 'images'), { recursive: true });
}

// Multer configuration for images
const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Multer configuration for videos
const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for videos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  },
});

// Middleware to process Cloudinary response
const processCloudinaryUpload = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Cloudinary multer-storage-cloudinary returns file info in req.file
    // Structure: { fieldname, originalname, encoding, mimetype, size, bucket, key, acl, contentType, contentDisposition, storageClass, metadata, location, etag, versionId, version, ... }
    
    // Cloudinary storage returns: path, filename, public_id, format, resource_type, secure_url, url, etc.
    const cloudinaryFile = req.file;
    
    // Get the public_id (Cloudinary identifier)
    const publicId = cloudinaryFile.public_id || cloudinaryFile.filename;
    
    // Get the secure URL (HTTPS)
    const secureUrl = cloudinaryFile.secure_url || cloudinaryFile.url || cloudinaryFile.path;
    
    // Store in req.file for use in routes
    req.file.cloudinaryUrl = secureUrl;
    req.file.publicId = publicId;
    req.file.resourceType = cloudinaryFile.resource_type || (cloudinaryFile.mimetype?.startsWith('video/') ? 'video' : 'image');
    
    // For videos, generate thumbnail URL
    if (req.file.resourceType === 'video' && publicId) {
      req.file.thumbnail = getVideoThumbnail(publicId);
    }
    
    console.log(`✅ File uploaded to Cloudinary:`);
    console.log(`   Public ID: ${publicId}`);
    console.log(`   URL: ${secureUrl}`);
    if (req.file.thumbnail) {
      console.log(`   Thumbnail: ${req.file.thumbnail}`);
    }
    
    next();
  } catch (error) {
    console.error('❌ Error processing Cloudinary upload:', error);
    next(error);
  }
};

module.exports = {
  uploadImage: uploadImage.single('image'),
  uploadVideo: uploadVideo.single('video'),
  processCloudinaryUpload,
};

