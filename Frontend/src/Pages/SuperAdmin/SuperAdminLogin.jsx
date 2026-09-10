// src/Pages/SuperAdmin/SuperAdminLogin/SuperAdminLogin.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { superAdminLogin } from "../../redux/slices/superAdminSlice";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import styles from "./SuperAdminLogin.module.css";
import shopHero from "../../assets/newlogo1.png";
import superadminimg from "../../assets/superadmin.png";

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useSelector((state) => state.superAdmin);

  const from = location.state?.from?.pathname
    ? location.state.from.pathname + (location.state.from.search || "")
    : "/super-admin/dashboard";

  // ✅ If already authenticated, redirect to the page they came from (or dashboard)
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setIsLoading(true);
      const result = await dispatch(superAdminLogin({ email, password })).unwrap();
      console.log("✅ Login successful:", result);
      toast.success("Welcome Super Admin!");
      navigate(from, { replace: true });
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left image panel - full height, hidden on mobile/tablet */}
      <div
        className={styles.imagePanel}
        style={{ backgroundImage: `url(${superadminimg})` }}
      />

      {/* Right form panel - full height */}
      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          {/* Back Button */}
          <Link to="/" className={styles.backButton}>
            <FiArrowLeft />
            <span>Back to Home</span>
          </Link>

          {/* Header with Logo */}
          <div className={styles.header}>
            <img src={shopHero} alt="AUREVIAN" className={styles.logo} />
            <h1 className={styles.title}>Super Admin</h1>
            <p className={styles.subtitle}>Secure access to the admin panel</p>
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
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;