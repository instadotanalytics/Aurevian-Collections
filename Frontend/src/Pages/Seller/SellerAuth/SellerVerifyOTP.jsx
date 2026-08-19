// src/Pages/Seller/SellerAuth/SellerVerifyOTP.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  verifyEmailOTP,
  verifyPhoneOTP,
  resendOTP,
  fetchCurrentSeller,
} from "../../../redux/slices/sellerSlice";
import toast from "react-hot-toast";
import styles from "./SellerVerifyOTP.module.css";
import LoadingScreen from "../../Layout/LoadingScreen/Loadingscreen";

const SellerVerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const {
    seller,
    isLoading,
    otpDeliveryStatus: reduxOtpDeliveryStatus,
    otpDeliveryDetail: reduxOtpDeliveryDetail,
  } = useSelector((state) => state.seller);

  const [emailOTP, setEmailOTP] = useState("");
  const [phoneOTP, setPhoneOTP] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [emailTimer, setEmailTimer] = useState(120);
  const [phoneTimer, setPhoneTimer] = useState(120);
  const [emailCanResend, setEmailCanResend] = useState(false);
  const [phoneCanResend, setPhoneCanResend] = useState(false);

  // ✅ NEW — tracks whether the OTP was actually delivered, so we never
  // show a countdown/"pending" state for a channel that never got an OTP.
  const [emailDeliveryFailed, setEmailDeliveryFailed] = useState(false);
  const [phoneDeliveryFailed, setPhoneDeliveryFailed] = useState(false);
  const [emailDeliveryError, setEmailDeliveryError] = useState(null);
  const [phoneDeliveryError, setPhoneDeliveryError] = useState(null);

  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  useEffect(() => {
    const stateEmail = location.state?.email;
    const statePhone = location.state?.phone;
    const storedEmail = localStorage.getItem("sellerEmail");
    const storedPhone = localStorage.getItem("sellerPhone");

    const email = stateEmail || storedEmail || seller?.email;
    const phone = statePhone || storedPhone || seller?.phone;

    setUserEmail(email);
    setUserPhone(phone);

    if (!email && !phone) {
      toast.error("No seller data found. Please register again.");
      navigate("/seller/register");
      return;
    }

    if (seller?.emailVerified) setEmailVerified(true);
    if (seller?.phoneVerified) setPhoneVerified(true);

    // ✅ NEW — pull real delivery status from wherever it's available:
    // freshest is router state (just came from registration/resend),
    // fallback is redux (survives a resend on this same page),
    // otherwise we don't know — assume delivered so older/refreshed
    // sessions keep the original countdown behavior instead of a false
    // "failed" state.
    const deliveryStatus =
      location.state?.otpDeliveryStatus || reduxOtpDeliveryStatus || null;
    const deliveryDetail =
      location.state?.otpDeliveryDetail || reduxOtpDeliveryDetail || {};

    if (deliveryStatus) {
      const emailFailed = deliveryStatus.email === false;
      const phoneFailed = deliveryStatus.phone === false;

      setEmailDeliveryFailed(emailFailed);
      setPhoneDeliveryFailed(phoneFailed);
      setEmailDeliveryError(deliveryDetail.emailError || null);
      setPhoneDeliveryError(deliveryDetail.phoneError || null);

      if (emailFailed && !seller?.emailVerified) {
        setEmailTimer(0);
        setEmailCanResend(true);
      } else if (!seller?.emailVerified) {
        setEmailTimer(120);
      }

      if (phoneFailed && !seller?.phoneVerified) {
        setPhoneTimer(0);
        setPhoneCanResend(true);
      } else if (!seller?.phoneVerified) {
        setPhoneTimer(120);
      }
    } else {
      if (!seller?.emailVerified) setEmailTimer(120);
      if (!seller?.phoneVerified) setPhoneTimer(120);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seller, navigate, location.state]);

  // Timers — unchanged, but now only meaningfully "counts down" when
  // delivery actually succeeded (failed channels start at 0/canResend=true above).
  useEffect(() => {
    if (emailVerified || emailTimer <= 0) {
      setEmailCanResend(emailTimer <= 0 && !emailVerified);
      return;
    }
    const interval = setInterval(() => {
      setEmailTimer((prev) => {
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
      setPhoneTimer((prev) => {
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
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await dispatch(
        verifyEmailOTP({ email: userEmail, otp: emailOTP }),
      ).unwrap();
      if (result.success) {
        setEmailVerified(true);
        toast.success("✅ Email verified successfully!");
        if (localStorage.getItem("sellerAccessToken")) {
          await dispatch(fetchCurrentSeller());
        }
      }
    } catch (error) {
      toast.error(error?.message || "Failed to verify email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneOTP || phoneOTP.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await dispatch(
        verifyPhoneOTP({ phone: userPhone, otp: phoneOTP }),
      ).unwrap();
      if (result.success) {
        setPhoneVerified(true);
        toast.success("✅ Phone verified successfully!");
        if (localStorage.getItem("sellerAccessToken")) {
          await dispatch(fetchCurrentSeller());
        }
      }
    } catch (error) {
      toast.error(error?.message || "Failed to verify phone");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ REWRITTEN — reads the real result of the resend attempt instead of
  // blindly assuming success and resetting the timer to 120.
  const handleResendOTP = async (type) => {
    const contact = type === "email" ? userEmail : userPhone;
    if (!contact) {
      toast.error(`${type} not found`);
      return;
    }

    try {
      const result = await dispatch(resendOTP({ contact, type })).unwrap();
      const delivered = result?.otpDeliveryStatus?.[type];
      const errorMsg = result?.otpDeliveryDetail?.[`${type}Error`];

      if (delivered) {
        if (type === "email") {
          setEmailDeliveryFailed(false);
          setEmailDeliveryError(null);
          setEmailTimer(120);
          setEmailCanResend(false);
        } else {
          setPhoneDeliveryFailed(false);
          setPhoneDeliveryError(null);
          setPhoneTimer(120);
          setPhoneCanResend(false);
        }
        // sellerSlice's resendOTP thunk already fires the accurate toast
      } else {
        // Still failed — keep it retryable, don't fake a "sent" countdown.
        if (type === "email") {
          setEmailDeliveryFailed(true);
          setEmailDeliveryError(errorMsg);
          setEmailCanResend(true);
        } else {
          setPhoneDeliveryFailed(true);
          setPhoneDeliveryError(errorMsg);
          setPhoneCanResend(true);
        }
      }
    } catch (error) {
      // e.g. the new 60s cooldown (429) — real message already toasted
      // by the thunk's catch block; nothing to fake here.
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (emailVerified && phoneVerified) {
      toast.success("🎉 Email and Phone verified successfully!");
      toast.success(
        "📋 Your account is under review. You will receive approval within 24 hours.",
      );
      setTimeout(() => {
        navigate("/seller/login");
      }, 3000);
    }
  }, [emailVerified, phoneVerified, navigate]);

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
                📋 Your account is under review. You will receive approval
                within 24 hours.
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
            <h1 className={styles.title}>
              <LoadingScreen />
            </h1>
            <p className={styles.subtitle}>
              Please wait while we fetch your details
            </p>
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
          <p className={styles.subtitle}>
            Please verify your email and phone number
          </p>

          {!emailVerified && userEmail && (
            <div className={styles.otpSection}>
              <h3>📧 Email Verification</h3>
              {emailDeliveryFailed ? (
                // ✅ NEW — honest "not delivered" state, no fake countdown
                <p className={styles.otpHint} style={{ color: "#dc2626" }}>
                  ⚠️ We couldn't send the OTP to <strong>{userEmail}</strong>.
                  {emailDeliveryError ? ` ${emailDeliveryError}` : ""}
                </p>
              ) : (
                <p className={styles.otpHint}>
                  We sent a 6-digit OTP to <strong>{userEmail}</strong>
                </p>
              )}
              <div className={styles.otpInputGroup}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={emailOTP}
                  onChange={(e) =>
                    setEmailOTP(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  disabled={isLoading || isSubmitting || emailDeliveryFailed}
                />
                <button
                  onClick={handleVerifyEmail}
                  disabled={
                    isLoading ||
                    isSubmitting ||
                    emailOTP.length !== 6 ||
                    emailDeliveryFailed
                  }
                  className={styles.verifyBtn}
                >
                  {isSubmitting ? "Verifying..." : "Verify"}
                </button>
              </div>
              <div className={styles.otpActions}>
                {!emailDeliveryFailed && (
                  <span className={styles.timer}>
                    ⏱️ {formatTime(emailTimer)}
                  </span>
                )}
                <button
                  className={styles.resendBtn}
                  onClick={() => handleResendOTP("email")}
                  disabled={!emailCanResend || isLoading || isSubmitting}
                >
                  {emailDeliveryFailed
                    ? "Send OTP"
                    : emailCanResend
                      ? "Resend OTP"
                      : `Wait ${formatTime(emailTimer)}`}
                </button>
              </div>
            </div>
          )}

          {!phoneVerified && userPhone && (
            <div className={styles.otpSection}>
              <h3>📱 Phone Verification</h3>
              {phoneDeliveryFailed ? (
                <p className={styles.otpHint} style={{ color: "#dc2626" }}>
                  ⚠️ We couldn't send the OTP to <strong>{userPhone}</strong>.
                  {phoneDeliveryError ? ` ${phoneDeliveryError}` : ""}
                </p>
              ) : (
                <p className={styles.otpHint}>
                  We sent a 6-digit OTP to <strong>{userPhone}</strong>
                </p>
              )}
              <div className={styles.otpInputGroup}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={phoneOTP}
                  onChange={(e) =>
                    setPhoneOTP(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  disabled={isLoading || isSubmitting || phoneDeliveryFailed}
                />
                <button
                  onClick={handleVerifyPhone}
                  disabled={
                    isLoading ||
                    isSubmitting ||
                    phoneOTP.length !== 6 ||
                    phoneDeliveryFailed
                  }
                  className={styles.verifyBtn}
                >
                  {isSubmitting ? "Verifying..." : "Verify"}
                </button>
              </div>
              <div className={styles.otpActions}>
                {!phoneDeliveryFailed && (
                  <span className={styles.timer}>
                    ⏱️ {formatTime(phoneTimer)}
                  </span>
                )}
                <button
                  className={styles.resendBtn}
                  onClick={() => handleResendOTP("phone")}
                  disabled={!phoneCanResend || isLoading || isSubmitting}
                >
                  {phoneDeliveryFailed
                    ? "Send OTP"
                    : phoneCanResend
                      ? "Resend OTP"
                      : `Wait ${formatTime(phoneTimer)}`}
                </button>
              </div>
            </div>
          )}

          <div className={styles.status}>
            <div className={styles.statusItem}>
              <span>Email:</span>
              <span
                className={emailVerified ? styles.verified : styles.pending}
              >
                {emailVerified
                  ? "✅ Verified"
                  : emailDeliveryFailed
                    ? "⚠️ Not sent"
                    : "⏳ Pending"}
              </span>
            </div>
            <div className={styles.statusItem}>
              <span>Phone:</span>
              <span
                className={phoneVerified ? styles.verified : styles.pending}
              >
                {phoneVerified
                  ? "✅ Verified"
                  : phoneDeliveryFailed
                    ? "⚠️ Not sent"
                    : "⏳ Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerVerifyOTP;
