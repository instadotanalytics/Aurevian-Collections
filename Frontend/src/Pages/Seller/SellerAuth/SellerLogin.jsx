// src/Pages/Seller/SellerAuth/SellerLogin.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sellerLogin, clearSellerError } from '../../../redux/slices/sellerSlice';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiArrowRight,
  FiShield
} from 'react-icons/fi';
import { FaGem } from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from './SellerLogin.module.css';
import LoginImage from "../../../assets/partnerlogin.png";
import Header from "../../Layout/Header/Header";
import Footer from "../../Layout/Footer/Footer";

const SellerLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated, seller } = useSelector((state) => state.seller);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  // Redirect based on status
  useEffect(() => {
    if (isAuthenticated && seller) {
      if (!seller.emailVerified || !seller.phoneVerified) {
        navigate('/seller/verify-otp');
        return;
      }

      if (seller.status === 'pending') {
        toast.info('⏳ Your account is pending approval. Please wait for verification (within 24 hours).');
        return;
      }

      if (seller.status === 'approved') {
        navigate('/seller/dashboard');
        return;
      }

      if (seller.status === 'rejected') {
        toast.error('Your account has been rejected. Please contact support.');
      } else if (seller.status === 'suspended') {
        toast.error('Your account has been suspended. Please contact support.');
      }
    }
  }, [isAuthenticated, seller, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearSellerError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setLocalError(null);
    dispatch(clearSellerError());
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const { email, password } = formData;

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const result = await dispatch(sellerLogin({ email, password }));

    if (sellerLogin.fulfilled.match(result)) {
      const sellerData = result.payload;

      if (!sellerData.emailVerified || !sellerData.phoneVerified) {
        localStorage.setItem('sellerEmail', email);
        localStorage.setItem('sellerPhone', sellerData.phone);
        toast.info('Please verify your email and phone first.');
        navigate('/seller/verify-otp', {
          state: {
            email: email,
            phone: sellerData.phone
          }
        });
        return;
      }

      if (sellerData.status === 'pending') {
        toast.info('⏳ Your account is pending approval. You will receive an email within 24 hours.');
        return;
      } else if (sellerData.status === 'approved') {
        toast.success('Welcome back! Redirecting to dashboard...');
        navigate('/seller/dashboard');
      } else {
        toast.error('Your account is not approved yet.');
      }
    } else {
      setLocalError(result.payload?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>

            {/* Image Section */}
            <div className={styles.imageSection}>
              <div className={styles.imageWrapper}>
                <img src={LoginImage} alt="Aurevian Luxury Collection" className={styles.loginImage} />
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

                  <h1 className={styles.title}>Seller Login </h1>
                  <p className={styles.subtitle}>Sign in to your Aurevian account</p>
                </div>

                {(localError || error) && (
                  <div className={styles.errorBanner} role="alert">
                    <FiAlertCircle className={styles.errorIcon} />
                    <span>{localError || error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                  <div className={styles.field}>
                    <label htmlFor="email">Email Address</label>
                    <div className={`${styles.inputWrapper} ${focusedField === 'email' ? styles.focused : ''}`}>
                      <FiMail className={styles.inputIcon} />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => handleFocus('email')}
                        onBlur={handleBlur}
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="password">Password</label>
                    <div className={`${styles.inputWrapper} ${focusedField === 'password' ? styles.focused : ''}`}>
                      <FiLock className={styles.inputIcon} />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => handleFocus('password')}
                        onBlur={handleBlur}
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className={styles.visibilityBtn}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.options}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="remember"
                        checked={formData.remember}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <span>Remember me</span>
                    </label>
                    <Link to="/seller/forgot-password" className={styles.forgotLink}>
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in…' : 'Secure Your Account'}
                    {!isLoading && <FiArrowRight className={styles.btnArrow} />}
                  </button>
                </form>

                <div className={styles.trustRow}>
                  <FiShield className={styles.trustIcon} />
                  <span>Your details are encrypted and never shared</span>
                </div>

                <div className={styles.footer}>
                  <p className={styles.registerText}>
                    New to Aurevian? <Link to="/seller/register">Create Account</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SellerLogin;