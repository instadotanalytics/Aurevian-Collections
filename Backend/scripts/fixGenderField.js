// scripts/fixGenderField.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function fixGender() {
  await mongoose.connect(process.env.MONGO_URI); // adjust env var name to match your db.js

  const result = await User.updateMany(
    { $or: [{ gender: "" }, { gender: { $exists: false } }, { gender: null }] },
    { $set: { gender: "Prefer not to say" } }
  );

  console.log(`✅ Fixed ${result.modifiedCount} user(s) with invalid gender`);
  await mongoose.disconnect();
}

fixGender();