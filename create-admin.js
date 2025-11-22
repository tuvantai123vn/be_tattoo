const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');

dotenv.config();

async function createAdmin() {
  try {
    const mongoOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    
    const defaultMongoURI = 'mongodb+srv://admin:admin@node-products.o0dvpt9.mongodb.net/duynhuart?retryWrites=true&w=majority';
    await mongoose.connect(process.env.MONGODB_URI || defaultMongoURI, mongoOptions);
    console.log('✅ Connected to MongoDB');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Username: ', (username) => {
      rl.question('Password: ', (password) => {
        rl.question('Email (optional): ', (email) => {
          rl.question('Zalo (optional): ', (zalo) => {
            rl.question('Facebook URL (optional): ', (facebook) => {
              const admin = new Admin({
                username,
                password,
                email: email || '',
                zalo: zalo || '',
                facebook: facebook || ''
              });

              admin.save()
                .then(() => {
                  console.log('Admin created successfully!');
                  process.exit(0);
                })
                .catch((err) => {
                  if (err.code === 11000) {
                    console.error('Username already exists!');
                  } else {
                    console.error('Error:', err.message);
                  }
                  process.exit(1);
                });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();

