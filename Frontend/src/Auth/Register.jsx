
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { register, setOTPSent } from "../redux/slices/authSlice.js";
import GoogleLoginButton from "../auth/GoogleLoginButton.jsx";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiStar,
  FiHeart,
  FiTruck,
  FiGift,
} from "react-icons/fi";
import Header from "../Pages/Layout/Header/Header";
import Footer from "../Pages/Layout/Footer/Footer";
import logo from "../assets/Aurevianlogo.png";

import styles from "./Register.module.css";

/* ------------------------------------------------------------------
   Static content — member benefits shown in the second section
------------------------------------------------------------------- */
const PERKS = [
  {
    icon: <FiStar />,
    title: "Early Access",
    text: "Be first to shop new arrivals and limited drops.",
  },
  {
    icon: <FiHeart />,
    title: "Save Favorites",
    text: "Build a wishlist and pick up right where you left off.",
  },
  {
    icon: <FiTruck />,
    title: "Track Orders",
    text: "Follow every order from checkout to your doorstep.",
  },
  {
    icon: <FiGift />,
    title: "Birthday Rewards",
    text: "A special gift on us, every year you're with us.",
  },
];

/* ------------------------------------------------------------------
   Static content — short highlights shown beside the hero copy
------------------------------------------------------------------- */
const HERO_HIGHLIGHTS = [
  { icon: <FiStar />, text: "Curated, limited-run collections" },
  { icon: <FiHeart />, text: "A wishlist that remembers what you love" },
  { icon: <FiTruck />, text: "Tracked delivery, every step of the way" },
];

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, password, confirmPassword, phone } = formData;

    if (!firstName || !lastName || !email || !password) {
      toast.error("Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(register({ firstName, lastName, email, password, phone })).unwrap();

      dispatch(setOTPSent(email));
      toast.success("Registration successful! Please verify your email.");
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.page}>
        {/* ============================= HERO ============================= */}
        <section className={styles.hero} aria-label="Create your Aurevian account">
          <div className={styles.heroDecor} aria-hidden="true">
            <span className={`${styles.blob} ${styles.blob1}`} />
            <span className={`${styles.blob} ${styles.blob2}`} />
          </div>

          <div className={styles.heroInner}>
            {/* ---------- Left: editorial text content ---------- */}
            <div className={styles.heroLeft}>
              <div className={styles.heroContent}>
                <span className={styles.heroEyebrow}>Welcome to Aurevian</span>

                <h1 className={styles.heroHeading}>
                  Your Story In
                  <span className={styles.heroHeadingAccent}> Gold</span>
                  <br />
                  Starts Here
                </h1>

                <p className={styles.heroText}>
                  A place built for those who notice detail — the weight of a
                  clasp, the warmth of a finish, the quiet of good design.
                  Create your account and step into a wardrobe of pieces
                  chosen to be kept, not just worn.
                </p>

                <ul className={styles.heroHighlights}>
                  {HERO_HIGHLIGHTS.map((item) => (
                    <li key={item.text} className={styles.heroHighlightItem}>
                      <span className={styles.heroHighlightIcon}>{item.icon}</span>
                      <span className={styles.heroHighlightText}>{item.text}</span>
                    </li>
                  ))}
                </ul>

                <figure className={styles.heroQuote}>
                  <span className={styles.heroQuoteMark} aria-hidden="true">
                    "
                  </span>
                  <blockquote className={styles.heroQuoteText}>
                    Every piece has a story. Yours is about to begin.
                  </blockquote>
                </figure>
              </div>
            </div>

            {/* ---------- Right: register form ---------- */}
            <div className={styles.heroRight}>
              <div className={styles.card}>
                {/* Logo */}
                <div className={styles.cardLogo}>
                  <img src={logo} alt="Aurevian" className={styles.cardLogoImage} />
                </div>

                {/* Header */}
                <div className={styles.header}>
                  <h2 className={styles.title}>Create Account</h2>
                  <p className={styles.subtitle}>Join Aurevian Collections today</p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>First Name</label>
                      <div className={styles.inputWrapper}>
                        <FiUser className={styles.inputIcon} />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="First Name"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Last Name</label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`${styles.input} ${styles.inputNoIcon}`}
                          placeholder="Last Name"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <div className={styles.inputWrapper}>
                      <FiMail className={styles.inputIcon} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="name@example.com"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number (Optional)</label>
                    <div className={styles.inputWrapper}>
                      <FiPhone className={styles.inputIcon} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Enter Your number"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Password</label>
                      <div className={styles.inputWrapper}>
                        <FiLock className={styles.inputIcon} />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="••••••••"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={styles.eyeButton}
                          aria-label={showPassword ? "Hide password" : "Show password"}
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
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="••••••••"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className={styles.eyeButton}
                          aria-label={
                            showConfirmPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <FiEyeOff size={18} />
                          ) : (
                            <FiEye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitButton}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                {/* Divider */}
                <div className={styles.divider}>
                  <span>or continue with</span>
                </div>

                {/* Google Login */}
                <GoogleLoginButton redirectTo="/" />

                {/* Login Link */}
                <p className={styles.footerText}>
                  Already have an account?{" "}
                  <Link to="/login" className={styles.footerLink}>
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================= MEMBER BENEFITS ========================= */}
        <section className={styles.perksSection} aria-labelledby="perks-heading">
          <div className={styles.perksInner}>
            <div className={styles.perksIntro}>
              <span className={styles.perksEyebrow}>Member Benefits</span>
              <h2 id="perks-heading" className={styles.perksTitle}>
                More Than Just Shopping
              </h2>
              <p className={styles.perksSubtitle}>
                Create your account and unlock a more personal way to shop
                Aurevian — saved favorites, faster checkout, and rewards
                that build over time.
              </p>
            </div>

            <div className={styles.perksGrid}>
              {PERKS.map((perk) => (
                <div className={styles.perkCard} key={perk.title}>
                  <span className={styles.perkRing}>
                    <span className={styles.perkIcon}>{perk.icon}</span>
                  </span>
                  <h3 className={styles.perkTitle}>{perk.title}</h3>
                  <p className={styles.perkText}>{perk.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Register;