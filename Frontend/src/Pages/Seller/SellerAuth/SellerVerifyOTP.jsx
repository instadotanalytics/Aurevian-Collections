// src/Pages/Seller/SellerAuth/SellerVerifyOTP.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmailOTP, verifyPhoneOTP, resendOTP, fetchCurrentSeller } from '../../../redux/slices/sellerSlice';
import toast from 'react-hot-toast';
import styles from './SellerVerifyOTP.module.css';
import LoadingScreen from '../../Layout/LoadingScreen/Loadingscreen';

const SellerVerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { seller, isLoading } = useSelector((state) => state.seller);
  
  const [emailOTP, setEmailOTP] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [emailTimer, setEmailTimer] = useState(120);
  const [phoneTimer, setPhoneTimer] = useState(120);
  const [emailCanResend, setEmailCanResend] = useState(false);
  const [phoneCanResend, setPhoneCanResend] = useState(false);
  
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');

  useEffect(() => {
    const stateEmail = location.state?.email;
    const statePhone = location.state?.phone;
    const storedEmail = localStorage.getItem('sellerEmail');
    const storedPhone = localStorage.getItem('sellerPhone');

    const email = stateEmail || storedEmail || seller?.email;
    const phone = statePhone || storedPhone || seller?.phone;

    setUserEmail(email);
    setUserPhone(phone);

    if (!email && !phone) {
      toast.error('No seller data found. Please register again.');
      navigate('/seller/register');
      return;
    }

    if (seller?.emailVerified) setEmailVerified(true);
    if (seller?.phoneVerified) setPhoneVerified(true);

    if (!seller?.emailVerified) setEmailTimer(120);
    if (!seller?.phoneVerified) setPhoneTimer(120);

  }, [seller, navigate, location]);

  // Timers
  useEffect(() => {
    if (emailVerified || emailTimer <= 0) {
      setEmailCanResend(emailTimer <= 0 && !emailVerified);
      return;
    }
    const interval = setInterval(() => {
      setEmailTimer(prev => {
        if (prev <= 1) {
          setEmailCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [emailTimer, emailVerified]);

  useEffect(() => {
    if (phoneVerified || phoneTimer <= 0) {
      setPhoneCanResend(phoneTimer <= 0 && !phoneVerified);
      return;
    }
    const interval = setInterval(() => {
      setPhoneTimer(prev => {
        if (prev <= 1) {
          setPhoneCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phoneTimer, phoneVerified]);

  const handleVerifyEmail = async () => {
    if (!emailOTP || emailOTP.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await dispatch(verifyEmailOTP({ email: userEmail, otp: emailOTP })).unwrap();
      if (result.success) {
        setEmailVerified(true);
        toast.success('✅ Email verified successfully!');
        // Only fetch current seller if token exists (user is logged in)
        if (localStorage.getItem("sellerAccessToken")) {
          await dispatch(fetchCurrentSeller());
        }
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to verify email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneOTP || phoneOTP.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await dispatch(verifyPhoneOTP({ phone: userPhone, otp: phoneOTP })).unwrap();
      if (result.success) {
        setPhoneVerified(true);
        toast.success('✅ Phone verified successfully!');
        // Only fetch current seller if token exists (user is logged in)
        if (localStorage.getItem("sellerAccessToken")) {
          await dispatch(fetchCurrentSeller());
        }
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to verify phone');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async (type) => {
    const contact = type === 'email' ? userEmail : userPhone;
    if (!contact) {
      toast.error(`${type} not found`);
      return;
    }
    
    try {
      await dispatch(resendOTP({ contact, type })).unwrap();
      if (type === 'email') {
        setEmailTimer(120);
        setEmailCanResend(false);
      } else {
        setPhoneTimer(120);
        setPhoneCanResend(false);
      }
      toast.success(`OTP resent to ${type}`);
    } catch (error) {
      toast.error(error?.message || 'Failed to resend OTP');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ Both verified → Show success → Redirect to Login
  useEffect(() => {
    if (emailVerified && phoneVerified) {
      toast.success('🎉 Email and Phone verified successfully!');
      toast.success('📋 Your account is under review. You will receive approval within 24 hours.');
      setTimeout(() => {
        navigate('/seller/login');
      }, 3000);
    }
  }, [emailVerified, phoneVerified, navigate]);

  // ✅ After both verified, show success screen
  if (emailVerified && phoneVerified) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>✅</div>
              <h1 className={styles.successTitle}>Verification Complete!</h1>
              <p className={styles.successMessage}>
                Your email and phone have been verified successfully.
              </p>
              <p className={styles.successSubMessage}>
                📋 Your account is under review. You will receive approval within 24 hours.
              </p>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.redirectMessage}>Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userEmail && !userPhone) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}><LoadingScreen/></h1>
            <p className={styles.subtitle}>Please wait while we fetch your details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Verify Your Account</h1>
          <p className={styles.subtitle}>Please verify your email and phone number</p>

          {!emailVerified && userEmail && (
            <div className={styles.otpSection}>
              <h3>📧 Email Verification</h3>
              <p className={styles.otpHint}>We sent a 6-digit OTP to <strong>{userEmail}</strong></p>
              <div className={styles.otpInputGroup}>
                <input 
                  type="text" 
                  placeholder="Enter OTP" 
                  value={emailOTP} 
                  onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                  maxLength={6} 
                  disabled={isLoading || isSubmitting} 
                />
                <button 
                  onClick={handleVerifyEmail} 
                  disabled={isLoading || isSubmitting || emailOTP.length !== 6} 
                  className={styles.verifyBtn}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              <div className={styles.otpActions}>
                <span className={styles.timer}>⏱️ {formatTime(emailTimer)}</span>
                <button 
                  className={styles.resendBtn} 
                  onClick={() => handleResendOTP('email')} 
                  disabled={!emailCanResend || isLoading || isSubmitting}
                >
                  {emailCanResend ? 'Resend OTP' : `Wait ${formatTime(emailTimer)}`}
                </button>
              </div>
            </div>
          )}

          {!phoneVerified && userPhone && (
            <div className={styles.otpSection}>
              <h3>📱 Phone Verification</h3>
              <p className={styles.otpHint}>We sent a 6-digit OTP to <strong>{userPhone}</strong></p>
              <div className={styles.otpInputGroup}>
                <input 
                  type="text" 
                  placeholder="Enter OTP" 
                  value={phoneOTP} 
                  onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                  maxLength={6} 
                  disabled={isLoading || isSubmitting} 
                />
                <button 
                  onClick={handleVerifyPhone} 
                  disabled={isLoading || isSubmitting || phoneOTP.length !== 6} 
                  className={styles.verifyBtn}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              <div className={styles.otpActions}>
                <span className={styles.timer}>⏱️ {formatTime(phoneTimer)}</span>
                <button 
                  className={styles.resendBtn} 
                  onClick={() => handleResendOTP('phone')} 
                  disabled={!phoneCanResend || isLoading || isSubmitting}
                >
                  {phoneCanResend ? 'Resend OTP' : `Wait ${formatTime(phoneTimer)}`}
                </button>
              </div>
            </div>
          )}

          <div className={styles.status}>
            <div className={styles.statusItem}>
              <span>Email:</span>
              <span className={emailVerified ? styles.verified : styles.pending}>
                {emailVerified ? '✅ Verified' : '⏳ Pending'}
              </span>
            </div>
            <div className={styles.statusItem}>
              <span>Phone:</span>
              <span className={phoneVerified ? styles.verified : styles.pending}>
                {phoneVerified ? '✅ Verified' : '⏳ Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerVerifyOTP;