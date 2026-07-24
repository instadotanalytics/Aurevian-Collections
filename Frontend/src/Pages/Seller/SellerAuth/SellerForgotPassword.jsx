// src/Pages/Seller/SellerForgotPassword/SellerForgotPassword.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiShield, FiSend, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import styles from './SellerForgotPassword.module.css';
// import ForgotImage from "../../../assets/forgot.png";
import LoginImage from "../../../assets/b1.png";
import Header from "../../Layout/Header/Header"
import Footer from "../../Layout/Footer/Footer"

const SellerForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/seller/forgot-password`, { email });
      
      if (response.data.success) {
        setEmailSent(true);
        toast.success('Password reset link sent to your email!');
      } else {
        setError(response.data.message || 'Something went wrong');
        toast.error(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            {/* Left Side - Image */}
            <div className={styles.leftPanel}>
              <div className={styles.imageWrapper}>
                <img src={ForgotImage} alt="Aurevian Forgot Password" className={styles.sideImage} />
              </div>
            </div>

            {/* Right Side - Success Message */}
            <div className={styles.rightPanel}>
              <div className={styles.successContent}>
                <div className={styles.successIcon}>
                  <FiCheckCircle size={64} color="#10B981" />
                </div>
                <h2 className={styles.successTitle}>Check Your Email</h2>
                <p className={styles.successMessage}>
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className={styles.successSubMessage}>
                  Please check your inbox and follow the instructions to reset your password.
                  The link will expire in 10 minutes.
                </p>
                <div className={styles.successActions}>
                  <Link to="/seller/login" className={styles.backToLoginBtn}>
                    Back to Login
                  </Link>
                  <button 
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                    className={styles.resendBtn}
                  >
                    Try Another Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <Header/>
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Left Side - Image */}
          <div className={styles.leftPanel}>
            <div className={styles.imageWrapper}>
              <img src={LoginImage} alt="Aurevian Forgot Password" className={styles.sideImage} />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className={styles.rightPanel}>
            <div className={styles.header}>
              <div className={styles.iconWrapper}>
                <FiShield className={styles.shieldIcon} />
              </div>
              <h1 className={styles.title}>Forgot Password?</h1>
              <p className={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
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
                    className={`${styles.input} ${error ? styles.inputError : ''}`}
                    placeholder="seller@example.com"
                    disabled={isLoading}
                  />
                </div>
                {error && <p className={styles.errorText}>{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend size={18} />
                    Send Reset Link
                  </>
                )}
              </button>

              <div className={styles.helpText}>
                <p>
                  Remember your password? <Link to="/seller/login" className={styles.loginLink}>Login</Link>
                </p>
              </div>
            </form>

            <div className={styles.footer}>
              <p>© {new Date().getFullYear()} Aurevian Collections. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default SellerForgotPassword;