// src/Pages/Seller/SellerForgotPassword/SellerForgotPassword.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiShield, FiSend, FiCheckCircle, FiLock } from 'react-icons/fi';
import { FaGem } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import styles from './SellerForgotPassword.module.css';
import LoginImage from "../../../assets/sellerpass.png";
import Header from "../../Layout/Header/Header";
import Footer from "../../Layout/Footer/Footer";

const SellerForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

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
      <>
        <Header />
        <div className={styles.page}>
          <div className={styles.container}>
            <div className={styles.card}>
              {/* Image Section - Top on Mobile */}
              <div className={styles.imageSection}>
                <div className={styles.imageWrapper}>
                  <img src={LoginImage} alt="Aurevian" className={styles.loginImage} />
                </div>
              </div>

              {/* Success Section - Bottom on Mobile */}
              <div className={styles.successSection}>
                <div className={styles.successContainer}>
                  <div className={styles.successIconWrapper}>
                    <FiCheckCircle className={styles.successIcon} />
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
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            {/* Image Section - Top on Mobile */}
            <div className={styles.imageSection}>
              <div className={styles.imageWrapper}>
                <img src={LoginImage} alt="Aurevian" className={styles.loginImage} />
              </div>
            </div>

            {/* Form Section - Bottom on Mobile */}
            <div className={styles.formSection}>
              <div className={styles.formContainer}>
                <div className={styles.header}>
                  <div className={styles.logoIcon}>
                    <FaGem className={styles.gemIcon} />
                  </div>
                  <h1 className={styles.title}>
                    <span>AUREVIAN</span>
                  </h1>
                  <p className={styles.subtitle}>
                    Reset Your Password
                  </p>
                </div>

                {error && <p className={styles.errorBanner}>{error}</p>}

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>Email Address</label>
                    <div className={`${styles.inputWrapper} ${focusedField === 'email' ? styles.focused : ''}`}>
                      <FiMail className={styles.inputIcon} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => handleFocus('email')}
                        onBlur={handleBlur}
                        className={styles.input}
                        placeholder="Enter your email address"
                        disabled={isLoading}
                      />
                    </div>
                    {error && <p className={styles.errorText}>{error}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.primaryBtn}
                  >
                    {isLoading ? (
                      <>
                        <span className={styles.spinner}></span>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  <div className={styles.footerLinks}>
                    <Link to="/seller/login" className={styles.backLink}>
                      <FiArrowLeft className={styles.backIcon} />
                      Back to Login
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SellerForgotPassword;