import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany(); // Clear existing generic users

    // Requested Admin Credentials
    const adminUser = new User({
      empId: 'EMP001',
      name: 'Director (Admin)',
      email: 'director@udanmetaplast.in',
      password: 'Admin@123',
      role: 'Admin',
      dept: 'Management',
      phone: '+91 00000 00000',
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
    });

    await adminUser.save();

    console.log('Database Seeded Successfully! Added Default Admin.');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
