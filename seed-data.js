const mongoose = require('mongoose');
const Video = require('./models/Video');
const Gallery = require('./models/Gallery');
const dotenv = require('dotenv');

dotenv.config();

// Sample data
const sampleVideos = [
  {
    title: 'Quá trình xăm tay nghệ thuật',
    description: 'Xem quá trình thực hiện một tác phẩm xăm tay đẹp mắt',
    videoUrl: '/uploads/videos/sample-video-1.mp4',
    thumbnail: '',
    views: 0,
    likes: 0,
    order: 1
  },
  {
    title: 'Xăm hình hoa văn truyền thống',
    description: 'Nghệ thuật xăm truyền thống Việt Nam',
    videoUrl: '/uploads/videos/sample-video-2.mp4',
    thumbnail: '',
    views: 0,
    likes: 0,
    order: 2
  }
];

const sampleGallery = [
  {
    title: 'Hoa văn truyền thống',
    description: 'Mẫu xăm hoa văn truyền thống Việt Nam, phù hợp với mọi vị trí',
    imageUrl: '/uploads/images/sample-tattoo-1.jpg',
    category: 'traditional',
    price: 2000000,
    views: 0,
    likes: 0
  },
  {
    title: 'Hình xăm chân thực',
    description: 'Tác phẩm xăm chân thực với độ chi tiết cao',
    imageUrl: '/uploads/images/sample-tattoo-2.jpg',
    category: 'realism',
    price: 5000000,
    views: 0,
    likes: 0
  },
  {
    title: 'Hình học hiện đại',
    description: 'Thiết kế hình học độc đáo, phong cách hiện đại',
    imageUrl: '/uploads/images/sample-tattoo-3.jpg',
    category: 'geometric',
    price: 3000000,
    views: 0,
    likes: 0
  },
  {
    title: 'Màu nước nghệ thuật',
    description: 'Phong cách màu nước mềm mại, nghệ thuật',
    imageUrl: '/uploads/images/sample-tattoo-4.jpg',
    category: 'watercolor',
    price: 4000000,
    views: 0,
    likes: 0
  },
  {
    title: 'Minimalist đơn giản',
    description: 'Thiết kế tối giản nhưng đầy ý nghĩa',
    imageUrl: '/uploads/images/sample-tattoo-5.jpg',
    category: 'minimalist',
    price: 1500000,
    views: 0,
    likes: 0
  },
  {
    title: 'Tác phẩm độc đáo',
    description: 'Mẫu xăm độc quyền, thiết kế riêng',
    imageUrl: '/uploads/images/sample-tattoo-6.jpg',
    category: 'other',
    price: 6000000,
    views: 0,
    likes: 0
  }
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/duy-nhu-tattoo', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data (optional)
    // await Video.deleteMany({});
    // await Gallery.deleteMany({});

    // Check if data already exists
    const existingVideos = await Video.countDocuments();
    const existingGallery = await Gallery.countDocuments();

    if (existingVideos === 0) {
      console.log('Seeding videos...');
      // Note: In production, you would upload actual video files first
      // These are just placeholder records
      console.log('Note: Video files need to be uploaded manually through admin panel');
    } else {
      console.log(`Already have ${existingVideos} videos`);
    }

    if (existingGallery === 0) {
      console.log('Seeding gallery...');
      // Note: In production, you would upload actual image files first
      // These are just placeholder records
      console.log('Note: Image files need to be uploaded manually through admin panel');
    } else {
      console.log(`Already have ${existingGallery} gallery items`);
    }

    console.log('\n✅ Seed data check complete!');
    console.log('📝 To add actual content:');
    console.log('   1. Login to admin panel');
    console.log('   2. Upload videos and images');
    console.log('   3. Content will appear on the website');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();

