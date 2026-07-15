import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../redux/slices/authSlice.js";
import toast from "react-hot-toast";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import styles from "./ForgotPassword.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(forgotPassword(email)).unwrap();
      toast.success("OTP sent to your email!");
      navigate("/reset-password", { state: { email } });
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Link to="/login" className={styles.backButton}>
          <FiArrowLeft />
          <span>Back to Login</span>
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>Forgot Password? 🔑</h1>
          <p className={styles.subtitle}>
            Enter your email and we'll send you an OTP to reset your password
          </p>
        </div>

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
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className={styles.footerText}>
          Remember your password?{" "}
          <Link to="/login" className={styles.footerLink}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;