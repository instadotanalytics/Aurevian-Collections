import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginWithEmail, setOTPSent } from "../redux/slices/authSlice.js";
import GoogleLoginButton from "../Auth/GoogleLoginButton.jsx";
import toast from "react-hot-toast";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiDroplet,
  FiShield,
  FiFeather,
  FiAward,
  FiGift,
  FiTruck,
  FiCheck,
} from "react-icons/fi";
import { FaGem } from "react-icons/fa";
import Header from "../Pages/Layout/Header/Header";
import Footer from "../Pages/Layout/Footer/Footer";
import logo from "../assets/Aurevianlogo.png";
import craftImage from "../assets/jewellery-craft.png";
import styles from "./Login.module.css";

/* ------------------------------------------------------------------
   Static content — hero features, "why choose us" rows, craft points
------------------------------------------------------------------- */
const HERO_FEATURES = [
  { icon: <FiDroplet />, title: "Waterproof", text: "Wear it every day" },
  { icon: <FiShield />, title: "Anti Tarnish", text: "Stays brilliant" },
  { icon: <FiFeather />, title: "Skin Safe", text: "Hypoallergenic" },
  { icon: <FiAward />, title: "1 Year Warranty", text: "Crafted to last" },
];

const WHY_CARDS = [
  {
    icon: <FaGem />,
    title: "Premium Finish",
    text: "18k gold plating over premium base metal for a lasting shine.",
  },
  {
    icon: <FiDroplet />,
    title: "Waterproof",
    text: "Designed to hold up against daily wear, wash, and weather.",
  },
  {
    icon: <FiShield />,
    title: "Anti Tarnish",
    text: "A protective layer keeps every piece looking newly made.",
  },
  {
    icon: <FiFeather />,
    title: "Skin Friendly",
    text: "Nickel-free and hypoallergenic for sensitive skin.",
  },
  {
    icon: <FiGift />,
    title: "Gift Ready",
    text: "Arrives in signature Aurevian packaging, ready to gift.",
  },
  {
    icon: <FiTruck />,
    title: "Fast Delivery",
    text: "Quick, insured shipping on every single order.",
  },
];

const CRAFT_POINTS = [
  "Hand-finished with 18k gold plating for a shine that lasts",
  "Waterproof and anti-tarnish, made for everyday wear",
  "Nickel-free, hypoallergenic materials on every piece",
  "Trusted by 5000+ customers with a 4.9★ average rating",
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading: authLoading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(loginWithEmail({ email, password })).unwrap();

      toast.success("Login successful! Welcome back.");

      navigate(`/`);
    } catch (error) {
      if (error?.requireVerification) {
        dispatch(setOTPSent(email));
        toast.error("Email not verified. OTP sent to your email.");
        navigate("/verify-otp", { state: { email } });
      } else {
        toast.error(error.message || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.page}>
        {/* ============================= HERO ============================= */}
        <section className={styles.hero} aria-label="Aurevian — luxury jewellery">
          <div className={styles.heroDecor} aria-hidden="true">
            <span className={`${styles.blob} ${styles.blob1}`} />
            <span className={`${styles.blob} ${styles.blob2}`} />
            <span className={`${styles.blob} ${styles.blob3}`} />
          </div>

          <div className={styles.heroInner}>
            {/* ---------- Left: brand content ---------- */}
            <div className={styles.heroLeft}>
              <h1 className={styles.heroTitle}>
                Timeless <span className={styles.heroHighlight}>Elegance</span>,
                <br />
                Crafted for
                <br />
                Every Occasion.
              </h1>

              <p className={styles.heroDesc}>
                Discover waterproof, anti-tarnish jewellery designed to elevate
                your everyday style. Beautiful craftsmanship, luxury finish,
                made to shine forever.
              </p>

              <div className={styles.heroCtas}>
                <Link to="/collections" className={styles.ctaPrimary}>
  Explore Collection
</Link>
                <a href="#why-aurevian" className={styles.ctaSecondary}>
                  Learn More
                </a>
              </div>

              <ul className={styles.heroFeatures} role="list">
                {HERO_FEATURES.map((f) => (
                  <li className={styles.heroFeatureCard} key={f.title}>
                    <span className={styles.heroFeatureIcon}>{f.icon}</span>
                    <span className={styles.heroFeatureTitle}>{f.title}</span>
                    <span className={styles.heroFeatureText}>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ---------- Right: login card (functionality untouched) ---------- */}
            <div className={styles.heroRight}>
              <div className={styles.card}>
                {/* Logo */}
                <div className={styles.cardLogo}>
                  <img src={logo} alt="Aurevian" className={styles.cardLogoImage} />
                </div>

                {/* Header */}
                <div className={styles.header}>
                  <h1 className={styles.title}>Welcome Back!</h1>
                  <p className={styles.subtitle}>Sign in to continue shopping</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="login-email">
                      Email Address
                    </label>
                    <div className={styles.inputWrapper}>
                      <FiMail className={styles.inputIcon} />
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        placeholder="john@example.com"
                        required
                        disabled={isLoading || authLoading}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="login-password">
                      Password
                    </label>
                    <div className={styles.inputWrapper}>
                      <FiLock className={styles.inputIcon} />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        placeholder="••••••••"
                        required
                        disabled={isLoading || authLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={styles.eyeButton}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.optionsRow}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" className={styles.checkbox} />
                      Remember me
                    </label>
                    <Link to="/forgot-password" className={styles.forgotLink}>
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || authLoading}
                    className={styles.submitButton}
                  >
                    {isLoading || authLoading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                {/* Divider */}
                <div className={styles.divider}>
                  <span>or continue with</span>
                </div>

                {/* Google Login */}
                <GoogleLoginButton redirectTo="/dashboard" />

                {/* Register Link */}
                <p className={styles.footerText}>
                  Don't have an account?{" "}
                  <Link to="/register" className={styles.footerLink}>
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================= WHY AUREVIAN ========================= */}
        <section
          id="why-aurevian"
          className={styles.whySection}
          aria-labelledby="why-heading"
        >
          <div className={styles.whyInner}>
            <div className={styles.whyIntro}>
              <span className={styles.whyEyebrow}>The Aurevian Standard</span>
              <h2 id="why-heading" className={styles.whyTitle}>
                The Aurevian Difference
              </h2>
              <p className={styles.whySubtitle}>
                Every piece is held to a quiet standard of craft — the kind
                you feel rather than see. Here's what sets it apart.
              </p>
            </div>

            <div className={styles.whyShowcase}>
              {WHY_CARDS.map((card, i) => (
                <div className={styles.whyRow} key={card.title}>
                  <span className={styles.whyIndex}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.whyRowIcon}>{card.icon}</span>
                  <div className={styles.whyRowContent}>
                    <h3 className={styles.whyRowTitle}>{card.title}</h3>
                    <p className={styles.whyRowText}>{card.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================= CRAFTSMANSHIP (image + content) ========================= */}
        <section className={styles.craftSection} aria-labelledby="craft-heading">
          <div className={styles.craftInner}>
            <div className={styles.craftImageWrap}>
              <div className={styles.craftImageFrame}>
                <img
                  src={craftImage}
                  alt="Aurevian jewellery craftsmanship"
                  className={styles.craftImage}
                />
              </div>
              <span className={styles.craftAccentTop} aria-hidden="true" />
              <span className={styles.craftAccentBottom} aria-hidden="true" />
            </div>

            <div className={styles.craftContent}>
              <span className={styles.craftEyebrow}>Our Craftsmanship</span>
              <h2 id="craft-heading" className={styles.craftTitle}>
                Made to Be Cherished,
                <br />
                Not Just Worn.
              </h2>
              <p className={styles.craftDesc}>
                Every Aurevian piece passes through skilled hands before it
                reaches yours — plated, polished, and finished to a standard
                that holds up to daily life, not just a single occasion.
              </p>

              <ul className={styles.craftList} role="list">
                {CRAFT_POINTS.map((point) => (
                  <li className={styles.craftListItem} key={point}>
                    <span className={styles.craftCheck}>
                      <FiCheck />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

          <Link to="/collections" className={styles.craftCta}>
  Explore The Collection
</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Login;