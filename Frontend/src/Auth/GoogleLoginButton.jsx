import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  auth,
  googleProvider,
  signInWithPopup,
} from "./firebase/firebaseConfig"; // <-- adjust path if needed

import { googleLogin } from "../api/authApi";

const GoogleLoginButton = ({ redirectTo = "/dashboard" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      // Google popup
      const result = await signInWithPopup(auth, googleProvider);

      // Firebase ID Token
      const idToken = await result.user.getIdToken();

      // Send token to backend
      const response = await googleLogin(idToken);

      if (!response.success) {
        throw new Error(response.message);
      }

      toast.success("Google login successful!");
      navigate(redirectTo);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Google Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="google-login-btn"
    >
      {loading ? "Signing in..." : "Continue with Google"}
    </button>
  );
};

export default GoogleLoginButton;