const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Folder IDs
const IMAGE_FOLDER_ID = '1-p1tE8_PrSDvbR1MtIhNEiOUMihla_ha';
const VIDEO_FOLDER_ID = '16EVbfsq2qAoJedXGa371zxykKRU6AFuW';

async function getFileIds() {
  try {
    // Initialize auth
    let auth;
    const credentialsPath = path.join(__dirname, '../credentials.json');
    
    if (fs.existsSync(credentialsPath)) {
      const credentials = JSON.parse(fs.readFileSync(credentialsPath));
      auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });
    } else {
      console.error('❌ credentials.json not found!');
      console.log('📝 Please follow GOOGLE_DRIVE_SETUP.md to setup credentials');
      process.exit(1);
    }

    const drive = google.drive({ version: 'v3', auth });

    console.log('📁 Getting files from Google Drive...\n');

    // Get images
    console.log('🖼️  Images Folder:');
    try {
      const imagesResponse = await drive.files.list({
        q: `'${IMAGE_FOLDER_ID}' in parents and trashed=false`,
        fields: 'files(id, name, webViewLink)',
      });

      if (imagesResponse.data.files.length === 0) {
        console.log('  No images found');
      } else {
        imagesResponse.data.files.forEach((file, index) => {
          const directLink = `https://drive.google.com/uc?export=view&id=${file.id}`;
          console.log(`  ${index + 1}. ${file.name}`);
          console.log(`     ID: ${file.id}`);
          console.log(`     Direct Link: ${directLink}`);
          console.log(`     View Link: ${file.webViewLink}\n`);
        });
      }
    } catch (error) {
      console.error('  Error accessing images folder:', error.message);
      console.log('  Make sure the folder is shared with the service account\n');
    }

    // Get videos
    console.log('📹 Videos Folder:');
    try {
      const videosResponse = await drive.files.list({
        q: `'${VIDEO_FOLDER_ID}' in parents and trashed=false`,
        fields: 'files(id, name, webViewLink)',
      });

      if (videosResponse.data.files.length === 0) {
        console.log('  No videos found');
      } else {
        videosResponse.data.files.forEach((file, index) => {
          const directLink = `https://drive.google.com/uc?export=view&id=${file.id}`;
          console.log(`  ${index + 1}. ${file.name}`);
          console.log(`     ID: ${file.id}`);
          console.log(`     Direct Link: ${directLink}`);
          console.log(`     View Link: ${file.webViewLink}\n`);
        });
      }
    } catch (error) {
      console.error('  Error accessing videos folder:', error.message);
      console.log('  Make sure the folder is shared with the service account\n');
    }

    console.log('✅ Done!');
    console.log('\n💡 Copy the file IDs and update add-sample-data.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getFileIds();

