// src/Pages/Seller/SellerResetPassword/SellerResetPassword.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiShield, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import styles from './SellerResetPassword.module.css';

const SellerResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Validate token exists
    if (!token) {
      setIsTokenValid(false);
      setError('Invalid reset link. Please request a new one.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/seller/reset-password/${token}`, {
        password,
        confirmPassword
      });
      
      if (response.data.success) {
        setIsSuccess(true);
        toast.success('Password reset successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/seller/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Something went wrong');
        toast.error(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>
            <FiShield size={48} color="#EF4444" />
          </div>
          <h2 className={styles.errorTitle}>Invalid Reset Link</h2>
          <p className={styles.errorMessage}>
            This password reset link is invalid or has expired.
          </p>
          <Link to="/seller/forgot-password" className={styles.requestNewBtn}>
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successIcon}>
            <FiCheckCircle size={64} color="#10B981" />
          </div>
          <h2 className={styles.successTitle}>Password Reset Successful!</h2>
          <p className={styles.successMessage}>
            Your password has been reset successfully.
          </p>
          <p className={styles.successSubMessage}>
            You will be redirected to the login page shortly.
          </p>
          <Link to="/seller/login" className={styles.backToLoginBtn}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Back Button */}
        <Link to="/seller/login" className={styles.backButton}>
          <FiArrowLeft size={18} />
          <span>Back to Login</span>
        </Link>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <FiShield className={styles.shieldIcon} />
          </div>
          <h1 className={styles.title}>Set New Password</h1>
          <p className={styles.subtitle}>
            Enter your new password below.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>New Password</label>
            <div className={styles.inputWrapper}>
              <FiLock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                placeholder="Enter new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.inputWrapper}>
              <FiLock className={styles.inputIcon} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                placeholder="Confirm new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.eyeButton}
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.passwordRequirements}>
            <p className={styles.requirementsTitle}>Password must contain:</p>
            <ul className={styles.requirementsList}>
              <li className={password.length >= 6 ? styles.requirementMet : ''}>
                ✓ At least 6 characters
              </li>
              <li className={password.length >= 8 ? styles.requirementMet : ''}>
                ✓ At least 8 characters (recommended)
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>© {new Date().getFullYear()} Aurevian Collections. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SellerResetPassword;