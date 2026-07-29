
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../redux/slices/authSlice.js";
import toast from "react-hot-toast";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiKey,
  FiShield,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import Header from "../Pages/Layout/Header/Header";
import Footer from "../Pages/Layout/Footer/Footer";
import logo from "../assets/Aurevianlogo.png";
import styles from "./ResetPassword.module.css";

/* ------------------------------------------------------------------
   Static content — reassurances shown beside the hero copy
------------------------------------------------------------------- */
const HERO_HIGHLIGHTS = [
  { icon: <FiShield />, text: "Your details stay private and secure" },
  { icon: <FiClock />, text: "This OTP expires quickly, for your safety" },
  { icon: <FiKey />, text: "One new password and you're back in" },
];

/* ------------------------------------------------------------------
   Static content — password hygiene tips, shown as a numbered sequence
------------------------------------------------------------------- */
const PROTECT_STEPS = [
  {
    number: "01",
    icon: <FiLock />,
    title: "Make It Strong",
    text: "Mix letters, numbers, and symbols. Longer passwords are always harder to crack than clever ones.",
  },
  {
    number: "02",
    icon: <FiShield />,
    title: "Keep It Private",
    text: "Never share your password or OTP with anyone — not even someone claiming to be from Aurevian.",
  },
  {
    number: "03",
    icon: <FiRefreshCw />,
    title: "Refresh It Regularly",
    text: "Update your password every few months, and always choose something you haven't used before.",
  },
];

const ResetPassword = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(resetPassword({ email, otp, newPassword })).unwrap();
      toast.success("Password reset successfully! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.page}>
        {/* ============================= HERO ============================= */}
        <section className={styles.hero} aria-label="Reset your Aurevian password">
          <div className={styles.heroDecor} aria-hidden="true">
            <span className={`${styles.blob} ${styles.blob1}`} />
            <span className={`${styles.blob} ${styles.blob2}`} />
          </div>

          <div className={styles.heroInner}>
            {/* ---------- Left: editorial text content ---------- */}
            <div className={styles.heroLeft}>
              <div className={styles.heroContent}>
                

                <h1 className={styles.heroHeading}>
                  Almost Back In?
                  <br />
                  Set Your
                  <span className={styles.heroHeadingAccent}> New Password</span>
                </h1>

                <p className={styles.heroText}>
                  Enter the OTP we sent to your inbox along with a fresh
                  password, and you'll be right back to browsing your
                  favourite pieces in no time.
                </p>

                <ul className={styles.heroHighlights}>
                  {HERO_HIGHLIGHTS.map((item) => (
                    <li key={item.text} className={styles.heroHighlightItem}>
                      <span className={styles.heroHighlightIcon}>{item.icon}</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>

                <figure className={styles.heroQuote}>
                  <span className={styles.heroQuoteMark} aria-hidden="true">
                    “
                  </span>
                  <blockquote className={styles.heroQuoteText}>
                    Security you can feel, simplicity you'll appreciate.
                  </blockquote>
                </figure>
              </div>
            </div>

            {/* ---------- Right: reset password form ---------- */}
            <div className={styles.heroRight}>
              <div className={styles.card}>
                <div className={styles.cardLogo}>
                  <img src={logo} alt="Aurevian" className={styles.cardLogoImage} />
                </div>

                <div className={styles.header}>
                  <h2 className={styles.title}>Reset Password</h2>
                  <p className={styles.subtitle}>
                    Enter the OTP sent to <strong>{email}</strong> and choose
                    a new password
                  </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>OTP Code</label>
                    <div className={styles.inputWrapper}>
                      <FiKey className={styles.inputIcon} />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className={styles.input}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>New Password</label>
                    <div className={styles.inputWrapper}>
                      <FiLock className={styles.inputIcon} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={styles.input}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={styles.eyeButton}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
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
                        className={styles.input}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className={styles.eyeButton}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitButton}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
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
          </div>
        </section>

        {/* ========================= STAY PROTECTED ========================= */}
        <section className={styles.processSection} aria-labelledby="protect-heading">
          <div className={styles.processInner}>
            <div className={styles.processIntro}>
              <span className={styles.processEyebrow}>Stay Protected</span>
              <h2 id="protect-heading" className={styles.processTitle}>
                Good Habits, Safer Account
              </h2>
              <p className={styles.processSubtitle}>
                A few simple habits go a long way in keeping your Aurevian
                account safe for the long run.
              </p>
            </div>

            <div className={styles.timeline}>
              {PROTECT_STEPS.map((step, i) => (
                <React.Fragment key={step.number}>
                  <div className={styles.timelineStep}>
                    <div className={styles.timelineMarker}>
                      <span className={styles.timelineIcon}>{step.icon}</span>
                      <span className={styles.timelineNumber}>{step.number}</span>
                    </div>
                    <h3 className={styles.timelineTitle}>{step.title}</h3>
                    <p className={styles.timelineText}>{step.text}</p>
                  </div>

                  {i < PROTECT_STEPS.length - 1 && (
                    <span className={styles.timelineConnector} aria-hidden="true" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPassword;