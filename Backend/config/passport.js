// config/passport.js

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from 'dotenv';

dotenv.config();

const configurePassport = () => {
  // ============================================
  // Check if Google OAuth credentials are configured
  // ============================================
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL;

  console.log('🔍 Checking Google OAuth Configuration:');
  console.log(`  GOOGLE_CLIENT_ID: ${googleClientId ? '✅ Configured' : '❌ Missing'}`);
  console.log(`  GOOGLE_CLIENT_SECRET: ${googleClientSecret ? '✅ Configured' : '❌ Missing'}`);
  console.log(`  GOOGLE_CALLBACK_URL: ${googleCallbackURL || '❌ Missing'}`);

  // ============================================
  // Serialization
  // ============================================
  passport.serializeUser((user, done) => {
    done(null, user._id || user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id)
        .select("-password -refreshToken")
        .lean();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // ============================================
  // Google Strategy - Only if credentials exist
  // ============================================
  if (googleClientId && googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: googleCallbackURL || 'http://localhost:5000/api/auth/google/callback',
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            console.log("🟢 Google profile received:", profile.id);
            console.log("  Email:", profile.emails?.[0]?.value);
            console.log("  Name:", profile.displayName);
            
            const user = await User.findOrCreateGoogleUser(profile);
            user.lastLogin = new Date();
            await user.save();
            
            return done(null, user);
          } catch (error) {
            console.error("❌ Google Strategy Error:", error);
            return done(error, null);
          }
        }
      )
    );
    console.log('✅ Google OAuth Strategy configured');
  } else {
    console.log('⚠️ Google OAuth Strategy SKIPPED - Missing credentials');
  }

  return passport;
};

export default configurePassport;