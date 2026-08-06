
// src/Components/Pages/PrivacyPolicy/PrivacyPolicy.jsx

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiShield,
  FiLock,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiShoppingBag,
  FiDatabase,
  FiGlobe,
  FiCheckCircle,
  FiUsers,
  FiRefreshCw,
  FiHeart,
  FiArrowRight,
} from "react-icons/fi";
import styles from "./PrivacyPolicy.module.css";
import Footer from "../Pages/Layout/Footer/Footer.jsx";
import Header from "../Pages/Layout/Header/Header.jsx";

// Only keep banner image
import bannerImage from "../assets/BannerPrivacy.png";

/* ---------- Framer Motion variants ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const heroContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
  },
};

const valueGridContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const valueItemVariant = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
};

const viewportOnce = { once: true, amount: 0.15 };

/* ---------- Section Divider ---------- */
const Divider = () => (
  <div className={styles.divider} aria-hidden="true">
    <span className={styles.dividerLine} />
    <span className={styles.dividerDiamond}>◆</span>
    <span className={styles.dividerLine} />
  </div>
);

const PrivacyPolicy = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Header />

      {/* Reading progress bar */}
      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${scrollProgress}%` }} />
      </div>

      <div className={styles.privacyPage}>
        {/* ========== HERO BANNER ========== */}
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            <img src={bannerImage} alt="Aurevian Collections" />
            <div className={styles.heroOverlay} />
          </div>
          <div className={styles.heroContent}>
            <motion.div
              className={styles.heroInner}
              initial="hidden"
              animate="visible"
              variants={heroContainer}
            >
              <motion.span variants={heroItem} className={styles.heroEyebrow}>
                Aurevian Collections
              </motion.span>
              <motion.h1 variants={heroItem} className={styles.heroTitle}>
                Privacy <span>Policy</span>
              </motion.h1>
              <motion.p variants={heroItem} className={styles.heroDesc}>
                Your trust is as precious as every piece we create. Learn how Aurevian protects your personal information.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ========== SCROLL INDICATOR ========== */}
        <div className={styles.scrollIndicatorWrapper}>
          <span className={styles.scrollIndicatorLine} />
          <div className={styles.scrollIndicatorContent}>
            <span className={styles.scrollText}>Scroll to explore</span>
            <span className={styles.scrollArrow}>↓</span>
          </div>
          <span className={styles.scrollIndicatorLine} />
        </div>

        <div className={styles.container}>
          {/* ========== STEP 1: Information We Collect (Left) ========== */}
          <motion.section
            className={styles.section}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div className={styles.stepLayout}>
              <div className={styles.stepContent}>
                <span className={styles.stepNumber}>01</span>
                <h2 className={styles.stepTitle}>Information We Collect</h2>
                <p className={styles.stepLead}>
                  We collect information you provide directly, such as your name, email address, phone number, shipping address, and payment details when you interact with our platform.
                </p>
              </div>
            </div>
          </motion.section>

          <Divider />

          {/* ========== STEP 2: How We Use Information (Right) ========== */}
          <motion.section
            className={styles.section}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div className={`${styles.stepLayout} ${styles.stepRight}`}>
              <div className={styles.stepContent}>
                <span className={styles.stepNumber}>02</span>
                <h2 className={styles.stepTitle}>How We Use Information</h2>
                <p className={styles.stepLead}>
                  We use your information to process orders, provide customer support, improve our services, personalize your experience, and send important updates about your orders.
                </p>
              </div>
            </div>
          </motion.section>

          <Divider />

          {/* ========== STEP 3: Cookies (Left) ========== */}
          <motion.section
            className={styles.section}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div className={styles.stepLayout}>
              <div className={styles.stepContent}>
                <span className={styles.stepNumber}>03</span>
                <h2 className={styles.stepTitle}>Cookies</h2>
                <p className={styles.stepLead}>
                  We use cookies to enhance your browsing experience, analyze website traffic, and personalize content. You can manage your cookie preferences anytime.
                </p>
              </div>
            </div>
          </motion.section>

          <Divider />

          {/* ========== STEP 4: Payment Security (Right) ========== */}
          <motion.section
            className={styles.section}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div className={`${styles.stepLayout} ${styles.stepRight}`}>
              <div className={styles.stepContent}>
                <span className={styles.stepNumber}>04</span>
                <h2 className={styles.stepTitle}>Payment Security</h2>
                <p className={styles.stepLead}>
                  Your payment information is encrypted and processed securely through trusted payment gateways. We do not store your full card details on our servers.
                </p>
              </div>
            </div>
          </motion.section>

          <Divider />

          {/* ========== STEP 5: Data Protection (Left) ========== */}
          <motion.section
            className={styles.section}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div className={styles.stepLayout}>
              <div className={styles.stepContent}>
                <span className={styles.stepNumber}>05</span>
                <h2 className={styles.stepTitle}>Data Protection</h2>
                <p className={styles.stepLead}>
                  We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>
            </div>
          </motion.section>

          <Divider />

          {/* ========== STEP 6: Third Party Services (Right) ========== */}
          <motion.section
            className={styles.section}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div className={`${styles.stepLayout} ${styles.stepRight}`}>
              <div className={styles.stepContent}>
                <span className={styles.stepNumber}>06</span>
                <h2 className={styles.stepTitle}>Third Party Services</h2>
                <p className={styles.stepLead}>
                  We may share your information with trusted third-party service providers only to the extent necessary to operate our business and serve you better.
                </p>
              </div>
            </div>
          </motion.section>

          <Divider />

          {/* ========== STEP 7: Your Rights (Left) ========== */}
          <motion.section
            className={styles.section}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div className={styles.stepLayout}>
              <div className={styles.stepContent}>
                <span className={styles.stepNumber}>07</span>
                <h2 className={styles.stepTitle}>Your Rights</h2>
                <p className={styles.stepLead}>
                  You have the right to access, update, or delete your personal information. You may also opt out of marketing communications at any time.
                </p>
              </div>
            </div>
          </motion.section>

          <Divider />

          {/* ========== STEP 8: Contact Us (Right) ========== */}
          <motion.section
            className={styles.section}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div className={`${styles.stepLayout} ${styles.stepRight}`}>
              <div className={styles.stepContent}>
                <span className={styles.stepNumber}>08</span>
                <h2 className={styles.stepTitle}>Contact Us</h2>
                <p className={styles.stepLead}>
                  If you have any questions about this Privacy Policy or how we handle your data, please reach out to our support team. We're here to help.
                </p>
              </div>
            </div>
          </motion.section>

          {/* ========== DIVIDER - Between Contact Us and Value Props ========== */}
          <Divider />

          {/* ========== VALUE PROPS BANNER ========== */}
          <motion.section
            className={styles.valueBanner}
            variants={valueGridContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div className={styles.valueGrid}>
              <motion.div className={styles.valueItem} variants={valueItemVariant}>
                <FiShield className={styles.valueIcon} />
                <h3>Secure Data</h3>
                <p>Your information is protected with industry-leading security measures.</p>
              </motion.div>
              <motion.div className={styles.valueItem} variants={valueItemVariant}>
                <FiHeart className={styles.valueIcon} />
                <h3>Privacy First</h3>
                <p>We never sell your data. Your privacy is our priority.</p>
              </motion.div>
              <motion.div className={styles.valueItem} variants={valueItemVariant}>
                <FiCheckCircle className={styles.valueIcon} />
                <h3>Trusted Experience</h3>
                <p>Thousands of customers trust us with their personal information.</p>
              </motion.div>
              <motion.div className={styles.valueItem} variants={valueItemVariant}>
                <FiUsers className={styles.valueIcon} />
                <h3>Premium Support</h3>
                <p>Our team is always ready to assist with any privacy concerns.</p>
              </motion.div>
            </div>
          </motion.section>

          {/* ========== NO DIVIDER ABOVE BOTTOM BANNER - Removed ========== */}

          {/* ========== BOTTOM BANNER ========== */}
          <motion.section
            className={styles.bottomBanner}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <div className={styles.bottomBannerContent}>
              <FiHeart className={styles.bottomBannerIcon} />
              <h2 className={styles.bottomBannerTitle}>Your Privacy Matters</h2>
              <p className={styles.bottomBannerDesc}>
                At Aurevian, we believe that trust is the foundation of every relationship.
                Your privacy is as precious as every piece we create.
              </p>
              <div className={styles.bottomBannerDivider} />
              <span className={styles.bottomBannerFooter}>
                Aurevian Collections — Since 2020
              </span>
            </div>
          </motion.section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;