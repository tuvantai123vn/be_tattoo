const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dg6vuam0z',
  api_key: process.env.CLOUDINARY_API_KEY || '744475612498239',
  api_secret: process.env.CLOUDINARY_API_SECRET || '6LBIcPnilFqIBO4Zhn95g_KqG1I',
});

// Storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tattoo-shop/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
    ],
  },
});

// Storage for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tattoo-shop/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'mov', 'avi'],
    transformation: [
      { quality: 'auto', fetch_format: 'auto' }
    ],
  },
});

// Helper function to get Cloudinary URL
function getCloudinaryUrl(publicId, resourceType = 'image') {
  if (!publicId) return null;
  
  if (resourceType === 'video') {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'mp4',
    });
  } else {
    return cloudinary.url(publicId, {
      format: 'auto',
      quality: 'auto',
    });
  }
}

// Helper function to get thumbnail for video
function getVideoThumbnail(publicId) {
  if (!publicId) return null;
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
  });
}

module.exports = {
  cloudinary,
  imageStorage,
  videoStorage,
  getCloudinaryUrl,
  getVideoThumbnail,
};

