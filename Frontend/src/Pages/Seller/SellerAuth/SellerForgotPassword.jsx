// src/Pages/Seller/SellerForgotPassword/SellerForgotPassword.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
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
              {/* Image Section */}
              <div className={styles.imageSection}>
                <div className={styles.imageWrapper}>
                  <img src={LoginImage} alt="Aurevian" className={styles.loginImage} />
                </div>
              </div>

              {/* Seal — signature element bridging image and content */}
              <div className={styles.seal} aria-hidden="true">
                <FiCheckCircle className={styles.sealIcon} />
              </div>

              {/* Success Section */}
              <div className={styles.formSection}>
                <div className={styles.formContainer}>
                  <div className={styles.header}>
                    <span className={styles.eyebrow}>Email Sent</span>
                    <h1 className={styles.title}>Check Your Inbox</h1>
                    <p className={styles.subtitle}>
                      We sent a reset link to <strong>{email}</strong>
                    </p>
                  </div>

                  <p className={styles.helperText}>
                    Follow the instructions in the email to reset your password.
                    The link expires in 10 minutes.
                  </p>

                  <div className={styles.successActions}>
                    <Link to="/seller/login" className={styles.primaryBtn}>
                      Back to Login
                    </Link>
                    <button
                      onClick={() => {
                        setEmailSent(false);
                        setEmail('');
                      }}
                      className={styles.secondaryBtn}
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
            {/* Image Section */}
            <div className={styles.imageSection}>
              <div className={styles.imageWrapper}>
                <img src={LoginImage} alt="Aurevian" className={styles.loginImage} />
              </div>
            </div>

            {/* Seal — signature element bridging image and form */}
            <div className={styles.seal} aria-hidden="true">
              <FaGem className={styles.sealIcon} />
            </div>

            {/* Form Section */}
            <div className={styles.formSection}>
              <div className={styles.formContainer}>
                <div className={styles.header}>
                  <span className={styles.eyebrow}>Seller Portal</span>
                  <h1 className={styles.title}>Forgot Password?</h1>
                  <p className={styles.subtitle}>
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                {error && (
                  <div className={styles.errorBanner} role="alert">
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.field}>
                    <label htmlFor="email" className={styles.label}>Email Address</label>
                    <div className={`${styles.inputWrapper} ${focusedField === 'email' ? styles.focused : ''}`}>
                      <FiMail className={styles.inputIcon} />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => handleFocus('email')}
                        onBlur={handleBlur}
                        className={styles.input}
                        placeholder="name@example.com"
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.primaryBtn}
                  >
                    {isLoading ? (
                      <>
                        <span className={styles.spinner}></span>
                        Sending…
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