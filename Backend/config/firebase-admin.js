// Backend/config/firebase-admin.js

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account
let serviceAccount;
try {
  const filePath = path.join(__dirname, "../firebase-service-account.json");
  if (fs.existsSync(filePath)) {
    serviceAccount = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log("✅ Firebase service account loaded from file");
  } else {
    console.log("⚠️ Service account file not found, using env variables");
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
  }
} catch (error) {
  console.error("❌ Error loading service account:", error.message);
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
}

// Initialize Firebase Admin
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log("✅ Firebase Admin Initialized");
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
  }
}

const firebaseAdmin = {
  auth: () => getAuth(),
  app: getApps()[0],
};

export default firebaseAdmin;