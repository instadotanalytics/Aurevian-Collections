import SuperAdmin from '../models/SuperAdmin.js';
import bcrypt from 'bcryptjs';

// Static Super Admin Credentials
const STATIC_SUPER_ADMIN = {
  email: 'superadmin@aurevian.com',
  password: 'SuperAdmin@2024',
  firstName: 'Super',
  lastName: 'Admin',
  fullName: 'Super Admin',
  phone: '+41 123 456 789',
  role: 'super_admin',
  isSuperAdmin: true,
};

class SuperAdminService {
  /**
   * Initialize Super Admin - Create if doesn't exist
   */
  async initializeSuperAdmin() {
    try {
      // Check if super admin exists
      let superAdmin = await SuperAdmin.findOne({ 
        email: STATIC_SUPER_ADMIN.email 
      });

      if (!superAdmin) {
        console.log('🔧 Creating Super Admin...');
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(STATIC_SUPER_ADMIN.password, salt);

        // Create super admin
        superAdmin = new SuperAdmin({
          firstName: STATIC_SUPER_ADMIN.firstName,
          lastName: STATIC_SUPER_ADMIN.lastName,
          fullName: STATIC_SUPER_ADMIN.fullName,
          email: STATIC_SUPER_ADMIN.email,
          password: hashedPassword,
          phone: STATIC_SUPER_ADMIN.phone,
          role: STATIC_SUPER_ADMIN.role,
          isSuperAdmin: STATIC_SUPER_ADMIN.isSuperAdmin,
          isActive: true,
        });

        await superAdmin.save();
        console.log('✅ Super Admin created successfully!');
        console.log(`📧 Email: ${STATIC_SUPER_ADMIN.email}`);
        console.log(`🔑 Password: ${STATIC_SUPER_ADMIN.password}`);
        console.log('⚠️ Please change the password after first login!');
      } else {
        console.log('✅ Super Admin already exists');
      }

      return superAdmin;
    } catch (error) {
      console.error('❌ Error initializing Super Admin:', error.message);
      throw error;
    }
  }

  /**
   * Verify Super Admin Credentials
   */
  async verifyCredentials(email, password) {
    try {
      // Find super admin
      const superAdmin = await SuperAdmin.findOne({ 
        email: email.toLowerCase() 
      }).select('+password');

      if (!superAdmin) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Check if active
      if (!superAdmin.isActive) {
        return { success: false, message: 'Account is deactivated' };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, superAdmin.password);
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid credentials' };
      }

      return { success: true, data: superAdmin };
    } catch (error) {
      console.error('❌ Error verifying credentials:', error.message);
      throw error;
    }
  }

  /**
   * Get Static Super Admin Credentials (for frontend reference)
   */
  getStaticCredentials() {
    return {
      email: STATIC_SUPER_ADMIN.email,
      // Don't return password for security
    };
  }

  /**
   * Update Super Admin Password
   */
  async updatePassword(email, oldPassword, newPassword) {
    try {
      const superAdmin = await SuperAdmin.findOne({ 
        email: email.toLowerCase() 
      }).select('+password');

      if (!superAdmin) {
        return { success: false, message: 'Super Admin not found' };
      }

      // Verify old password
      const isPasswordValid = await bcrypt.compare(oldPassword, superAdmin.password);
      if (!isPasswordValid) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      superAdmin.password = hashedPassword;
      await superAdmin.save();

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('❌ Error updating password:', error.message);
      throw error;
    }
  }
}

export default new SuperAdminService();