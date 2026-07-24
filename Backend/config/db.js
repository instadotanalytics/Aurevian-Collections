// config/db.js

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in .env file');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Reconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB Disconnected - Attempting to reconnect...');
    });

    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);

    throw error;
  }
};

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('💤 MongoDB connection closed on app termination');
  process.exit(0);
});

export default connectDB;