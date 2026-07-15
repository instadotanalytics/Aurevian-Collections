import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { verifyOTP, resendOTP } from "../redux/slices/authSlice.js";
import toast from "react-hot-toast";
import { FiArrowLeft, FiMail, FiRefreshCw } from "react-icons/fi";
import styles from "./VerifyOTP.module.css";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || useSelector((state) => state.auth.emailForOTP);

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }

    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const otpArray = pastedData.split("");
    const newOtp = [...otp];
    
    otpArray.forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    
    setOtp(newOtp);
    
    const lastIndex = Math.min(otpArray.length, 5);
    if (inputRefs.current[lastIndex]) {
      inputRefs.current[lastIndex].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(verifyOTP({ email, otp: otpCode, type: "email" })).unwrap();
      
      toast.success("Email verified successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "OTP verification failed");
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await dispatch(resendOTP(email)).unwrap();
      toast.success("OTP resent successfully!");
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
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
          <div className={styles.iconWrapper}>
            <FiMail className={styles.mailIcon} />
          </div>
          <h1 className={styles.title}>Verify Your Email</h1>
          <p className={styles.subtitle}>
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.otpContainer}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`${styles.otpInput} ${digit ? styles.filled : ""}`}
                disabled={isLoading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className={styles.resendSection}>
          <p className={styles.resendText}>
            Didn't receive the code?{" "}
            {canResend ? (
              <button onClick={handleResend} className={styles.resendButton}>
                <FiRefreshCw className={styles.resendIcon} />
                Resend OTP
              </button>
            ) : (
              <span className={styles.timer}>Resend in {timer}s</span>
            )}
          </p>
        </div>

        <p className={styles.footerText}>
          Check your spam folder if you don't see the email
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;