import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginWithEmail, setOTPSent } from "../redux/slices/authSlice.js";
import GoogleLoginButton from "../Auth/GoogleLoginButton.jsx";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading: authLoading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(loginWithEmail({ email, password })).unwrap();
      
      toast.success("Login successful! Welcome back.");
      navigate("/dashboard");
    } catch (error) {
      if (error?.requireVerification) {
        dispatch(setOTPSent(email));
        toast.error("Email not verified. OTP sent to your email.");
        navigate("/verify-otp", { state: { email } });
      } else {
        toast.error(error.message || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Back Button */}
        <Link to="/" className={styles.backButton}>
          <FiArrowLeft />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back! 👋</h1>
          <p className={styles.subtitle}>Sign in to continue shopping</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <FiMail className={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="john@example.com"
                required
                disabled={isLoading || authLoading}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <FiLock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                required
                disabled={isLoading || authLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <div className={styles.optionsRow}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" className={styles.checkbox} />
              Remember me
            </label>
            <Link to="/forgot-password" className={styles.forgotLink}>
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading || authLoading}
            className={styles.submitButton}
          >
            {isLoading || authLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span>or continue with</span>
        </div>

        {/* Google Login */}
        <GoogleLoginButton redirectTo="/dashboard" />

        {/* Register Link */}
        <p className={styles.footerText}>
          Don't have an account?{" "}
          <Link to="/register" className={styles.footerLink}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;