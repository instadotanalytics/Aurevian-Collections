// backend/scripts/dropPhoneIndex.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropPhoneIndex = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // ✅ Check existing indexes
    const indexes = await collection.indexes();
    console.log('\n📊 Current indexes:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });
    
    // ✅ Drop phone_1 index
    try {
      await collection.dropIndex('phone_1');
      console.log('\n✅ Successfully dropped "phone_1" index');
    } catch (err) {
      if (err.code === 27) {
        console.log('\nℹ️ "phone_1" index already dropped');
      } else {
        console.log('\n⚠️ Error dropping index:', err.message);
      }
    }
    
    // ✅ Verify after drop
    const updatedIndexes = await collection.indexes();
    console.log('\n📊 Updated indexes:');
    updatedIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

dropPhoneIndex();