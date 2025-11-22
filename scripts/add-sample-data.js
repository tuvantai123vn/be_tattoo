const mongoose = require('mongoose');
const Video = require('../models/Video');
const Gallery = require('../models/Gallery');
const dotenv = require('dotenv');

dotenv.config();

// Sample data với Google Drive links
// Bạn cần thay thế các link này bằng link thực từ Google Drive của bạn
const sampleVideos = [
  {
    title: 'Quá trình xăm tay nghệ thuật',
    description: 'Xem quá trình thực hiện một tác phẩm xăm tay đẹp mắt với kỹ thuật chuyên nghiệp',
    videoUrl: 'https://drive.google.com/uc?export=view&id=YOUR_VIDEO_ID_1',
    thumbnail: '',
    views: 0,
    likes: 0,
    order: 1
  },
  {
    title: 'Xăm hình hoa văn truyền thống',
    description: 'Nghệ thuật xăm truyền thống Việt Nam với hoa văn độc đáo',
    videoUrl: 'https://drive.google.com/uc?export=view&id=YOUR_VIDEO_ID_2',
    thumbnail: '',
    views: 0,
    likes: 0,
    order: 2
  },
  {
    title: 'Xăm màu nước nghệ thuật',
    description: 'Kỹ thuật xăm màu nước hiện đại, tạo hiệu ứng mềm mại',
    videoUrl: 'https://drive.google.com/uc?export=view&id=YOUR_VIDEO_ID_3',
    thumbnail: '',
    views: 0,
    likes: 0,
    order: 3
  }
];

const sampleGallery = [
  {
    title: 'Hoa văn truyền thống',
    description: 'Mẫu xăm hoa văn truyền thống Việt Nam, phù hợp với mọi vị trí trên cơ thể',
    imageUrl: 'https://drive.google.com/uc?export=view&id=YOUR_IMAGE_ID_1',
    category: 'traditional',
    price: 2000000,
    views: 0,
    likes: 0
  },
  {
    title: 'Hình xăm chân thực',
    description: 'Tác phẩm xăm chân thực với độ chi tiết cao, tái hiện hình ảnh sống động',
    imageUrl: 'https://drive.google.com/uc?export=view&id=YOUR_IMAGE_ID_2',
    category: 'realism',
    price: 5000000,
    views: 0,
    likes: 0
  },
  {
    title: 'Hình học hiện đại',
    description: 'Thiết kế hình học độc đáo, phong cách hiện đại và cá tính',
    imageUrl: 'https://drive.google.com/uc?export=view&id=YOUR_IMAGE_ID_3',
    category: 'geometric',
    price: 3000000,
    views: 0,
    likes: 0
  },
  {
    title: 'Màu nước nghệ thuật',
    description: 'Phong cách màu nước mềm mại, nghệ thuật và độc đáo',
    imageUrl: 'https://drive.google.com/uc?export=view&id=YOUR_IMAGE_ID_4',
    category: 'watercolor',
    price: 4000000,
    views: 0,
    likes: 0
  },
  {
    title: 'Minimalist đơn giản',
    description: 'Thiết kế tối giản nhưng đầy ý nghĩa, phù hợp với phong cách hiện đại',
    imageUrl: 'https://drive.google.com/uc?export=view&id=YOUR_IMAGE_ID_5',
    category: 'minimalist',
    price: 1500000,
    views: 0,
    likes: 0
  },
  {
    title: 'Tác phẩm độc đáo',
    description: 'Mẫu xăm độc quyền, thiết kế riêng theo yêu cầu khách hàng',
    imageUrl: 'https://drive.google.com/uc?export=view&id=YOUR_IMAGE_ID_6',
    category: 'other',
    price: 6000000,
    views: 0,
    likes: 0
  }
];

async function addSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/duy-nhu-tattoo', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing sample data (optional)
    // await Video.deleteMany({ title: { $in: sampleVideos.map(v => v.title) } });
    // await Gallery.deleteMany({ title: { $in: sampleGallery.map(g => g.title) } });

    // Add videos
    console.log('\n📹 Adding sample videos...');
    for (const video of sampleVideos) {
      const existing = await Video.findOne({ title: video.title });
      if (!existing) {
        await Video.create(video);
        console.log(`  ✓ Added: ${video.title}`);
      } else {
        console.log(`  - Skipped (exists): ${video.title}`);
      }
    }

    // Add gallery items
    console.log('\n🖼️  Adding sample gallery items...');
    for (const item of sampleGallery) {
      const existing = await Gallery.findOne({ title: item.title });
      if (!existing) {
        await Gallery.create(item);
        console.log(`  ✓ Added: ${item.title}`);
      } else {
        console.log(`  - Skipped (exists): ${item.title}`);
      }
    }

    console.log('\n✅ Sample data added successfully!');
    console.log('\n📝 Note: Please update the Google Drive file IDs in this script with your actual file IDs.');
    console.log('   To get file ID from Google Drive link:');
    console.log('   - Open file in Google Drive');
    console.log('   - Click Share > Get link');
    console.log('   - Copy the link and extract the file ID');
    console.log('   - Format: https://drive.google.com/uc?export=view&id=FILE_ID');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    process.exit(1);
  }
}

addSampleData();

