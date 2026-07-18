// Backend/services/superAdminService.js

import SuperAdmin from '../models/SuperAdmin.js';
import bcrypt from 'bcryptjs';

class SuperAdminService {
  async initializeSuperAdmin() {
    try {
      const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@aurevian.com';
      const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@2024';

      let admin = await SuperAdmin.findOne({ email });
      
      if (admin) {
        console.log('✅ Super Admin already exists');
        return admin;
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      admin = new SuperAdmin({
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
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      
      return admin;
    } catch (error) {
      console.error('❌ Failed to initialize Super Admin:', error.message);
      throw error;
    }
  }

  async verifyCredentials(email, password) {
    try {
      const admin = await SuperAdmin.findOne({ email }).select('+password');
      if (!admin) {
        return { success: false, message: 'Invalid credentials' };
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid credentials' };
      }

      return { success: true, data: admin };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default new SuperAdminService();