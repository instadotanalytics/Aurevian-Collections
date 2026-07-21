
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../redux/slices/authSlice.js";
import toast from "react-hot-toast";
import {
  FiMail,
  FiArrowLeft,
  FiShield,
  FiClock,
  FiKey,
  FiSend,
  FiLock,
} from "react-icons/fi";
import Header from "../Pages/Layout/Header/Header";
import Footer from "../Pages/Layout/Footer/Footer";
import logo from "../assets/Aurevianlogo.png";
import styles from "./ForgotPassword.module.css";

/* ------------------------------------------------------------------
   Static content — reassurances shown beside the hero copy
------------------------------------------------------------------- */
const HERO_HIGHLIGHTS = [
  { icon: <FiShield />, text: "Your details stay private and secure" },
  { icon: <FiClock />, text: "Codes expire quickly, for your safety" },
  { icon: <FiKey />, text: "Regain access in under a minute" },
];

/* ------------------------------------------------------------------
   Static content — recovery process, shown as a numbered sequence
------------------------------------------------------------------- */
const PROCESS_STEPS = [
  {
    number: "01",
    icon: <FiSend />,
    title: "Enter Your Email",
    text: "Tell us the address tied to your account and we'll send a one-time code straight to your inbox.",
  },
  {
    number: "02",
    icon: <FiKey />,
    title: "Verify The Code",
    text: "Open the email and enter the OTP to confirm it's really you — quick, simple, secure.",
  },
  {
    number: "03",
    icon: <FiLock />,
    title: "Set A New Password",
    text: "Choose a fresh password and step straight back into your Aurevian account.",
  },
];

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
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.page}>
        {/* ============================= HERO ============================= */}
        <section className={styles.hero} aria-label="Recover your Aurevian account">
          <div className={styles.heroDecor} aria-hidden="true">
            <span className={`${styles.blob} ${styles.blob1}`} />
            <span className={`${styles.blob} ${styles.blob2}`} />
          </div>

          <div className={styles.heroInner}>
            {/* ---------- Left: editorial text content ---------- */}
            <div className={styles.heroLeft}>
              <div className={styles.heroContent}>
                <span className={styles.heroEyebrow}>Account Recovery</span>

                <h1 className={styles.heroHeading}>
                  Locked Out?
                  <br />
                  Let's Get You
                  <span className={styles.heroHeadingAccent}> Back In</span>
                </h1>

                <p className={styles.heroText}>
                  It happens to the best of us. A forgotten password shouldn't
                  stand between you and your favourite pieces — just enter
                  your email and we'll walk you through it, one simple step
                  at a time.
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

            {/* ---------- Right: forgot password form ---------- */}
            <div className={styles.heroRight}>
              <div className={styles.card}>
          

                <div className={styles.cardLogo}>
                  <img src={logo} alt="Aurevian" className={styles.cardLogoImage} />
                </div>

                <div className={styles.header}>
                  <h2 className={styles.title}>Forgot Password?</h2>
                  <p className={styles.subtitle}>
                    Enter your email and we'll send you an OTP to reset your
                    password
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
                        placeholder="name@example.com"
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
          </div>
        </section>

        {/* ========================= RECOVERY PROCESS ========================= */}
        <section className={styles.processSection} aria-labelledby="process-heading">
          <div className={styles.processInner}>
            <div className={styles.processIntro}>
              <span className={styles.processEyebrow}>The Process</span>
              <h2 id="process-heading" className={styles.processTitle}>
                Three Steps Back To You
              </h2>
              <p className={styles.processSubtitle}>
                No long forms, no waiting on hold — just a short, guided
                path that gets you back into your account.
              </p>
            </div>

            <div className={styles.timeline}>
              {PROCESS_STEPS.map((step, i) => (
                <React.Fragment key={step.number}>
                  <div className={styles.timelineStep}>
                    <div className={styles.timelineMarker}>
                      <span className={styles.timelineIcon}>{step.icon}</span>
                      <span className={styles.timelineNumber}>{step.number}</span>
                    </div>
                    <h3 className={styles.timelineTitle}>{step.title}</h3>
                    <p className={styles.timelineText}>{step.text}</p>
                  </div>

                  {i < PROCESS_STEPS.length - 1 && (
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

export default ForgotPassword;