// Backend/scripts/createSuperAdmin.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const createSuperAdmin = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const SuperAdmin = (await import('../models/SuperAdmin.js')).default;

    const email = 'superadmin@aurevian.com';
    const password = 'SuperAdmin@2024';

    // Delete existing if any
    await SuperAdmin.deleteMany({ email });

    console.log('🆕 Creating new Super Admin...');
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const admin = new SuperAdmin({
      firstName: 'Super',
      lastName: 'Admin',
      fullName: 'Super Admin',
      email: email,
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
      isSuperAdmin: true,
    });
    
    await admin.save();
    console.log('✅ Super Admin created successfully');

    const verifyAdmin = await SuperAdmin.findOne({ email }).select('+password');
    const isValid = await bcrypt.compare(password, verifyAdmin.password);
    
    console.log('\n📋 Super Admin Credentials:');
    console.log('='.repeat(40));
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`✅ Password Verified: ${isValid ? 'SUCCESS' : 'FAILED'}`);
    console.log('='.repeat(40));

    await mongoose.disconnect();
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createSuperAdmin();