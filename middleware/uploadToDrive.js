const multer = require('multer');
const path = require('path');
const fs = require('fs');
const googleDriveService = require('../services/googleDrive');

// Temporary storage for files before uploading to Drive
const uploadDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadDir;
    if (file.fieldname === 'video') {
      uploadPath = path.join(uploadDir, 'videos');
    } else if (file.fieldname === 'image') {
      uploadPath = path.join(uploadDir, 'images');
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  } else if (file.fieldname === 'image') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: fileFilter
});

// Middleware to upload file to Google Drive after multer
const uploadToDrive = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const fileName = req.file.originalname || req.file.filename;
    
    // Prepare final upload directory
    const finalUploadDir = path.join(__dirname, '../uploads');
    const finalSubDir = req.file.fieldname === 'video' ? 'videos' : 'images';
    const finalDir = path.join(finalUploadDir, finalSubDir);
    
    // Ensure final directory exists
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    
    const finalFilePath = path.join(finalDir, req.file.filename);
    
    let driveResult;
    let useDrive = false;
    
    // Try to upload to Google Drive if available
    try {
      if (req.file.fieldname === 'video') {
        driveResult = await googleDriveService.uploadVideo(filePath, fileName);
      } else if (req.file.fieldname === 'image') {
        driveResult = await googleDriveService.uploadImage(filePath, fileName);
      }
      
      // Check if upload was successful (has id or directLink)
      if (driveResult && (driveResult.id || driveResult.directLink)) {
        useDrive = true;
        req.file.driveUrl = driveResult.directLink || driveResult.webViewLink;
        req.file.driveId = driveResult.id;
        console.log(`✅ File uploaded to Google Drive: ${fileName}`);
      }
    } catch (driveError) {
      console.warn('⚠️  Google Drive upload failed, using local storage:', driveError.message);
    }
    
    // Always copy file to final location for local serving (as backup or primary)
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, finalFilePath);
      console.log(`✅ File saved locally: ${finalFilePath}`);
    }
    
    // Set the URL to use
    if (useDrive && req.file.driveUrl) {
      req.file.finalUrl = req.file.driveUrl;
    } else {
      req.file.finalUrl = `/uploads/${finalSubDir}/${req.file.filename}`;
    }
    
    req.file.localPath = `/uploads/${finalSubDir}/${req.file.filename}`;

    // Clean up temporary file after a delay
    setTimeout(() => {
      if (fs.existsSync(filePath) && filePath !== finalFilePath) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn('Could not delete temp file:', err.message);
        }
      }
    }, 5000); // Delete after 5 seconds

    next();
  } catch (error) {
    console.error('❌ Error in upload middleware:', error);
    // Fallback: ensure file is in final location
    try {
      const finalUploadDir = path.join(__dirname, '../uploads');
      const finalSubDir = req.file.fieldname === 'video' ? 'videos' : 'images';
      const finalDir = path.join(finalUploadDir, finalSubDir);
      
      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
      }
      
      const finalFilePath = path.join(finalDir, req.file.filename);
      if (fs.existsSync(req.file.path)) {
        fs.copyFileSync(req.file.path, finalFilePath);
      }
      
      req.file.finalUrl = `/uploads/${finalSubDir}/${req.file.filename}`;
      req.file.localPath = `/uploads/${finalSubDir}/${req.file.filename}`;
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
    next();
  }
};

module.exports = { upload, uploadToDrive };

