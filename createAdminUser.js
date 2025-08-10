const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const catchAsync = require('./utils/catchAsync');
dotenv.config({ path: './config.env' });

const User = require('./models/userModel'); // Adjust the path to your User model

const createAdminUser = catchAsync(async () => {
  await mongoose.connect(
    'mongodb+srv://mamdouh:12345@cluster0.hdwdm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    }
  );

  const adminExists = await User.findOne({ username: 'drwael' });
  if (adminExists) {
    console.log('Admin user already exists');
    process.exit(0);
  }

  //   const hashedPassword = await bcrypt.hash('drwael@2024', 12);
  const adminUser = await User.create({
    username: 'drwael',
    // password: hashedPassword,
    password: 'drwael@2024',
    role: 'ادمن',
    //   email: 'drwael@zayed.com',
  });

  //   await adminUser.save();
  console.log('Admin user created successfully');

  process.exit(0);
});

createAdminUser();
