import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { FIREBASE_CONFIG } from "../../utils/constants";

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Set custom parameters for Google provider
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export { auth, googleProvider, signInWithPopup, signOut };