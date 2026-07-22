// src/Pages/SuperAdmin/SuperAdminLogin/SuperAdminLogin.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { superAdminLogin } from "../../redux/slices/superAdminSlice";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiShield } from "react-icons/fi";
import styles from "./SuperAdminLogin.module.css";

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useSelector((state) => state.superAdmin);

  // ✅ If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/super-admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setIsLoading(true);
      const result = await dispatch(superAdminLogin({ email, password })).unwrap();
      console.log('✅ Login successful:', result);
      toast.success("Welcome Super Admin!");
      navigate("/super-admin/dashboard");
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error(error.message || "Login failed");
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
          <div className={styles.iconWrapper}>
            <FiShield className={styles.shieldIcon} />
          </div>
          <h1 className={styles.title}>Super Admin Login</h1>
          <p className={styles.subtitle}>Secure access to admin panel</p>
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
                placeholder="superadmin@aurevian.com"
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

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              <strong>Default Credentials:</strong>
              <br />
              Email: superadmin@aurevian.com
              <br />
              Password: SuperAdmin@2024
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || authLoading}
            className={styles.submitButton}
          >
            {isLoading || authLoading ? "Logging in..." : "Login as Super Admin"}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/login" className={styles.footerLink}>
            User Login
          </Link>
          <span className={styles.footerDivider}>|</span>
          <Link to="/admin/login" className={styles.footerLink}>
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;