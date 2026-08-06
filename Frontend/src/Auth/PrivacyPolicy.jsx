
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

/* ---------- Reusable Step Section ---------- */
const Step = ({ number, title, right, children }) => (
  <motion.section
    className={styles.section}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={viewportOnce}
  >
    <div className={`${styles.stepLayout} ${right ? styles.stepRight : ""}`}>
      <div className={styles.stepContent}>
        <span className={styles.stepNumber}>{number}</span>
        <h2 className={styles.stepTitle}>{title}</h2>
        {children}
      </div>
    </div>
  </motion.section>
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
              <motion.p variants={heroItem} className={styles.heroMeta}>
                Last updated: August 6, 2026
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
          {/* ========== STEP 1: Information We Collect ========== */}
          <Step number="01" title="Information We Collect">
            <p className={styles.stepLead}>
              We collect information you provide directly, such as your name, email address, phone number, shipping address, and payment details when you interact with our platform. We also automatically collect certain technical information, including your IP address, browser type, device identifiers, and pages visited, to help us operate and improve the Site.
            </p>
            <p className={styles.stepLead}>
              Where you contact our support team, we may also collect the content of your messages, order references, and any attachments you choose to share with us.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 2: How We Use Information ========== */}
          <Step number="02" title="How We Use Information" right>
            <p className={styles.stepLead}>
              We use your information to process orders, provide customer support, improve our services, personalize your experience, and send important updates about your orders. This includes order confirmations, shipping notifications, and responses to enquiries you raise with us.
            </p>
            <p className={styles.stepLead}>
              With your consent, we may also use your details to send marketing communications about new collections, promotions, and events. You can withdraw this consent at any time.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 3: Cookies ========== */}
          <Step number="03" title="Cookies">
            <p className={styles.stepLead}>
              We use cookies to enhance your browsing experience, analyze website traffic, and personalize content. You can manage your cookie preferences anytime through your browser settings.
            </p>
            <p className={styles.stepLead}>
              Some cookies are essential for the Site to function, such as those that remember items in your cart, while others help us understand how visitors use the Site so we can improve it. Disabling non-essential cookies will not affect your ability to browse or check out.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 4: Payment Security ========== */}
          <Step number="04" title="Payment Security" right>
            <p className={styles.stepLead}>
              Your payment information is encrypted and processed securely through trusted, PCI-compliant payment gateways. We do not store your full card details on our servers.
            </p>
            <p className={styles.stepLead}>
              All payment pages are secured with industry-standard encryption, and any tokenised payment data retained for faster future checkout is held by our payment partners under their own security protocols, not by Aurevian directly.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 5: Data Protection ========== */}
          <Step number="05" title="Data Protection">
            <p className={styles.stepLead}>
              We implement industry-standard security measures, including encryption, access controls, and regular security reviews, to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p className={styles.stepLead}>
              Access to personal data within our organisation is limited to employees and contractors who need it to perform their duties, and all such personnel are bound by confidentiality obligations.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 6: Third Party Services ========== */}
          <Step number="06" title="Third Party Services" right>
            <p className={styles.stepLead}>
              We may share your information with trusted third-party service providers only to the extent necessary to operate our business and serve you better. This includes payment processors, courier and logistics partners, email and SMS delivery providers, and website analytics tools.
            </p>
            <p className={styles.stepLead}>
              These providers are contractually required to use your information solely to perform the services we engage them for, and are not permitted to use it for their own independent purposes. We never sell your personal information to third parties.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 7: Data Retention ========== */}
          <Step number="07" title="Data Retention">
            <p className={styles.stepLead}>
              We retain your personal information for as long as necessary to fulfil the purposes described in this Policy, including order history, legal and tax record-keeping, and fraud prevention.
            </p>
            <p className={styles.stepLead}>
              When information is no longer required, we securely delete or anonymise it. Account information is generally retained for the lifetime of your account plus a reasonable period afterward, unless you request earlier deletion and no legal obligation requires us to retain it.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 8: International Data Transfers ========== */}
          <Step number="08" title="International Data Transfers" right>
            <p className={styles.stepLead}>
              As some of our service providers operate outside India, your information may be transferred to and processed in other countries. Where this occurs, we take reasonable steps to ensure your data receives an adequate level of protection consistent with this Policy.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 9: Marketing Communications ========== */}
          <Step number="09" title="Marketing Communications">
            <p className={styles.stepLead}>
              If you have opted in to receive marketing emails or SMS messages, you can unsubscribe at any time using the link provided in our emails or by contacting our support team directly.
            </p>
            <p className={styles.stepLead}>
              Opting out of marketing communications will not affect transactional messages related to your orders, such as shipping confirmations or delivery updates, which we send regardless of your marketing preferences.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 10: Children's Privacy ========== */}
          <Step number="10" title="Children's Privacy" right>
            <p className={styles.stepLead}>
              Our Site is not directed at individuals under the age of 18, and we do not knowingly collect personal information from children. If we become aware that we have inadvertently collected data from a minor without appropriate consent, we will take steps to delete it promptly.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 11: Your Rights ========== */}
          <Step number="11" title="Your Rights">
            <p className={styles.stepLead}>
              You have the right to access, correct, update, or delete your personal information. You may also request a copy of the data we hold about you, or ask us to restrict certain uses of it.
            </p>
            <p className={styles.stepLead}>
              To exercise any of these rights, please contact our support team. We will respond to verified requests within a reasonable timeframe and in accordance with applicable law.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 12: Data Breach Notification ========== */}
          <Step number="12" title="Data Breach Notification" right>
            <p className={styles.stepLead}>
              In the unlikely event of a data breach that poses a risk to your rights and freedoms, we will notify affected users and relevant authorities in accordance with applicable law, and take immediate steps to contain and remediate the incident.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 13: Do Not Track & Analytics ========== */}
          <Step number="13" title="Do Not Track & Analytics">
            <p className={styles.stepLead}>
              Our Site does not currently respond to "Do Not Track" browser signals. We use analytics tools to understand aggregate visitor behaviour, such as which pages are most visited and how users navigate the Site, in order to improve the shopping experience.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 14: Changes to This Policy ========== */}
          <Step number="14" title="Changes to This Policy" right>
            <p className={styles.stepLead}>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. The "Last updated" date at the top of this page indicates the most recent revision, and we encourage you to review it periodically.
            </p>
          </Step>

          <Divider />

          {/* ========== STEP 15: Contact Us ========== */}
          <Step number="15" title="Contact Us">
            <p className={styles.stepLead}>
              If you have any questions about this Privacy Policy or how we handle your data, please reach out to our support team. We're here to help.
            </p>
            <ul className={styles.contactList}>
              <li><strong>Email:</strong> info.aurevian.switzerland@gmail.com</li>
              <li><strong>Phone:</strong> +91 6261478315</li>
              <li><strong>Address:</strong> Indore, Madhya Pradesh, India</li>
            </ul>
          </Step>

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