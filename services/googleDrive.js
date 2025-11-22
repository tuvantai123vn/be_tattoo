const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleDriveService {
  constructor() {
    // Folder IDs từ Google Drive
    this.IMAGE_FOLDER_ID = '1-p1tE8_PrSDvbR1MtIhNEiOUMihla_ha';
    this.VIDEO_FOLDER_ID = '16EVbfsq2qAoJedXGa371zxykKRU6AFuW';
    
    // Initialize auth
    this.auth = null;
    this.drive = null;
    this.initialized = false;
    // Initialize auth asynchronously (don't block)
    this.initializeAuth().catch(err => {
      console.warn('Google Drive initialization error:', err.message);
    });
  }

  async initializeAuth() {
    try {
      // Sử dụng Service Account hoặc OAuth2
      // Option 1: Service Account (khuyến nghị cho production)
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        try {
          const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
          this.auth = new google.auth.GoogleAuth({
            credentials: serviceAccountKey,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
          });
        } catch (parseError) {
          console.warn('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY. Files will be saved locally.');
          return;
        }
      }
      // Option 2: OAuth2 Client
      else if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        this.auth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );
        this.auth.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });
      }
      // Option 3: API Key (chỉ đọc, không upload được)
      else if (process.env.GOOGLE_API_KEY) {
        this.auth = process.env.GOOGLE_API_KEY;
      }
      // Fallback: Sử dụng file credentials.json
      else {
        const credentialsPath = path.join(__dirname, '../credentials.json');
        if (fs.existsSync(credentialsPath)) {
          try {
            const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
            this.auth = new google.auth.GoogleAuth({
              credentials: credentials,
              scopes: ['https://www.googleapis.com/auth/drive.file'],
            });
          } catch (parseError) {
            console.warn('Failed to parse credentials.json. Files will be saved locally.');
            return;
          }
        } else {
          console.warn('Google Drive credentials not found. Files will be saved locally.');
          return;
        }
      }

      if (this.auth) {
        this.drive = google.drive({ version: 'v3', auth: this.auth });
        this.initialized = true;
        console.log('✅ Google Drive initialized successfully');
      } else {
        this.initialized = true;
      }
    } catch (error) {
      console.warn('⚠️  Google Drive initialization failed. Files will be saved locally:', error.message);
      this.auth = null;
      this.drive = null;
      this.initialized = true;
    }
  }

  async uploadFile(filePath, fileName, mimeType, folderId) {
    try {
      if (!this.drive) {
        // Fallback: return local path
        return { webViewLink: filePath, id: null };
      }

      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      };

      const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
      });

      // Make file publicly accessible
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Get direct download link
      const directLink = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
      
      return {
        id: response.data.id,
        webViewLink: response.data.webViewLink,
        directLink: directLink,
        webContentLink: response.data.webContentLink,
      };
    } catch (error) {
      console.error('Error uploading to Google Drive:', error.message);
      // Fallback: return local path
      return { webViewLink: filePath, id: null, error: error.message };
    }
  }

  async uploadImage(filePath, fileName) {
    const mimeType = this.getMimeType(fileName);
    return await this.uploadFile(filePath, fileName, mimeType, this.IMAGE_FOLDER_ID);
  }

  async uploadVideo(filePath, fileName) {
    const mimeType = this.getMimeType(fileName);
    return await this.uploadFile(filePath, fileName, mimeType, this.VIDEO_FOLDER_ID);
  }

  getMimeType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // Convert Google Drive share link to direct download link
  static getDirectLink(shareLink) {
    // Extract file ID from various Google Drive link formats
    let fileId = null;
    
    if (shareLink.includes('/file/d/')) {
      fileId = shareLink.split('/file/d/')[1].split('/')[0];
    } else if (shareLink.includes('id=')) {
      fileId = shareLink.split('id=')[1].split('&')[0];
    } else if (shareLink.length === 33) {
      // Direct file ID
      fileId = shareLink;
    }

    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return shareLink;
  }
}

module.exports = new GoogleDriveService();

