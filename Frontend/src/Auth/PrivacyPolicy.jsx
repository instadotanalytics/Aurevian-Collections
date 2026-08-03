// src/Components/Pages/PrivacyPolicy/PrivacyPolicy.jsx

import React, { useEffect, useRef, useState } from "react";
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
  FiShare2,
  FiServer,
  FiUsers,
  FiRefreshCw,
  FiExternalLink,
  FiHeart,
  FiArrowRight,
} from "react-icons/fi";
import styles from "./PrivacyPolicy.module.css";
import Footer from "../Pages/Layout/Footer/Footer.jsx";
import Header from "../Pages/Layout/Header/Header.jsx";
// You can replace these with different images later
import heroImage from "../assets/46banner.png";
import detailImage from "../assets/46banner.png";

/* ---------- Scroll-reveal wrapper with slower, smoother animation ---------- */
const Reveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${visible ? styles.visible : ""} ${className}`}
      style={{ 
        transitionDelay: `${delay}ms`,
        transitionDuration: "1.2s"
      }}
    >
      {children}
    </div>
  );
};

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
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      const sections = document.querySelectorAll("[data-section]");
      let current = "";
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 200) {
          current = section.getAttribute("data-section") || "";
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "collect", label: "Collection" },
    { id: "use", label: "Usage" },
    { id: "security", label: "Security" },
    { id: "rights", label: "Your Rights" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <>
      <Header />

      {/* Reading progress bar */}
      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${scrollProgress}%` }} />
      </div>

      <div className={styles.privacyPage}>
        {/* ========== HERO - 80vh with content pushed down ========== */}
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            <img src={heroImage} alt="Aurevian Collections luxury background" />
            <div className={styles.heroOverlay} />
          </div>
          <div className={styles.heroContent}>
            <div className={styles.heroInner}>
              <span className={styles.heroEyebrow}>Aurevian Collections</span>
              <h1 className={styles.heroTitle}>
                Your Privacy, <br /><span>Our Promise</span>
              </h1>
              <p className={styles.heroDesc}>
                Every piece we craft is held to a standard of care — and so is
                every detail you share with us.
              </p>
              <div className={styles.heroMeta}>
                <span>Last Updated — August 2026</span>
              </div>
              <nav className={styles.heroNav} aria-label="Quick navigation">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`${styles.heroNavLink} ${
                      activeSection === item.id ? styles.active : ""
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
          {/* Scroll indicator at bottom of banner */}
          <div className={styles.scrollIndicator}>
            <span className={styles.scrollText}>Scroll to explore</span>
            <span className={styles.scrollArrow}>↓</span>
          </div>
        </section>

        <div className={styles.container}>
          {/* ========== SECTION 1: INFORMATION COLLECTION ========== */}
          <Reveal delay={100}>
            <section id="collect" data-section="collect" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>01</span>
                <span className={styles.sectionLabel}>Information We Collect</span>
              </div>
              <div className={styles.sectionInner}>
                <div className={styles.sectionContent}>
                  <p className={styles.sectionLead}>
                    We collect information that helps us provide a seamless and 
                    personalised experience when you interact with our website 
                    or make a purchase.
                  </p>
                </div>
                <div className={styles.dataGrid}>
                  {[
                    { icon: FiUser, label: "Full Name" },
                    { icon: FiMail, label: "Email Address" },
                    { icon: FiPhone, label: "Phone Number" },
                    { icon: FiMapPin, label: "Shipping & Billing Address" },
                    { icon: FiCreditCard, label: "Payment Details", tag: "Secure" },
                    { icon: FiShoppingBag, label: "Order History" },
                    { icon: FiDatabase, label: "Device & Browser Info" },
                    { icon: FiGlobe, label: "Cookies & Usage Data" },
                  ].map((item, idx) => (
                    <div key={idx} className={styles.dataItem}>
                      <item.icon className={styles.dataIcon} />
                      <span>{item.label}</span>
                      {item.tag && <span className={styles.dataTag}>{item.tag}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>

          <Divider />

          {/* ========== SECTION 2: HOW WE USE ========== */}
          <Reveal delay={150}>
            <section id="use" data-section="use" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>02</span>
                <span className={styles.sectionLabel}>How We Use Your Information</span>
              </div>
              <div className={styles.sectionInner}>
                <div className={styles.sectionContent}>
                  <p className={styles.sectionLead}>
                    Your information helps us serve you better — from processing 
                    orders to personalising your experience.
                  </p>
                </div>
                <div className={styles.useGrid}>
                  {[
                    "Process and deliver your orders",
                    "Manage your account",
                    "Provide customer support",
                    "Improve website performance",
                    "Personalize your shopping experience",
                    "Notify you about offers and promotions",
                    "Prevent fraud and maintain security",
                  ].map((item, idx) => (
                    <div key={idx} className={styles.useItem}>
                      <FiCheckCircle className={styles.useCheck} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>

          <Divider />

          {/* ========== SECTION 3: COOKIES ========== */}
          <Reveal delay={100}>
            <section data-section="cookies" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>03</span>
                <span className={styles.sectionLabel}>Cookies & Tracking</span>
              </div>
              <div className={styles.sectionInner}>
                <div className={styles.sectionContent}>
                  <p className={styles.sectionLead}>
                    We use cookies to enhance your experience, analyse site 
                    traffic and personalise content. You can control your 
                    preferences anytime.
                  </p>
                </div>
                <div className={styles.cookieGrid}>
                  {[
                    "Remember your preferences",
                    "Improve website performance",
                    "Analyze visitor behaviour",
                    "Provide a seamless shopping experience",
                  ].map((item, idx) => (
                    <div key={idx} className={styles.cookieItem}>
                      <span className={styles.cookieDot} />
                      <span>{item}</span>
                    </div>
                  ))}
                  <p className={styles.cookieNote}>
                    You may disable cookies anytime through your browser settings.
                  </p>
                </div>
              </div>
            </section>
          </Reveal>

          <Divider />

          {/* ========== SECTION 4: SECURITY ========== */}
          <Reveal delay={150}>
            <section id="security" data-section="security" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>04</span>
                <span className={styles.sectionLabel}>Data Security</span>
              </div>
              <div className={styles.sectionInner}>
                <div className={styles.sectionContent}>
                  <p className={styles.sectionLead}>
                    We implement industry-standard security measures to protect 
                    your data from unauthorised access, alteration or disclosure.
                  </p>
                </div>
                <div className={styles.securityGrid}>
                  {[
                    "SSL Encryption",
                    "Secure Servers",
                    "Access Controls",
                    "Regular Security Monitoring",
                    "Data Encryption Practices",
                  ].map((item, idx) => (
                    <div key={idx} className={styles.securityItem}>
                      <FiLock className={styles.securityIcon} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>

          <Divider />

          {/* ========== EDITORIAL BREAK WITH IMAGE ========== */}
          <Reveal delay={200}>
            <div className={styles.editorialBreak}>
              <div className={styles.editorialImage}>
                <img src={detailImage} alt="Aurevian craftsmanship detail" />
              </div>
              <div className={styles.editorialText}>
                <span className={styles.editorialEyebrow}>Our Philosophy</span>
                <blockquote className={styles.editorialQuote}>
                  “Crafted with intention, protected with the same care we
                  give every piece that carries our name.”
                </blockquote>
                <p className={styles.editorialBody}>
                  Just as every design leaving our atelier is finished by
                  hand, every piece of data you share with us is handled
                  deliberately — never carelessly, never sold.
                </p>
              </div>
            </div>
          </Reveal>

          <Divider />

          {/* ========== SECTION 5: THIRD PARTY ========== */}
          <Reveal delay={100}>
            <section data-section="thirdparty" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>05</span>
                <span className={styles.sectionLabel}>Third-Party Services</span>
              </div>
              <div className={styles.sectionInner}>
                <div className={styles.sectionContent}>
                  <p className={styles.sectionLead}>
                    We may share your information with trusted third-party 
                    providers who assist us in operating our website and services.
                  </p>
                  <div className={styles.thirdPartyNote}>
                    <FiUsers className={styles.thirdPartyIcon} />
                    <p>We do not sell or rent your personal information.</p>
                  </div>
                </div>
                <div className={styles.thirdPartyGrid}>
                  {[
                    "Payment Providers",
                    "Delivery Partners",
                    "Customer Support Services",
                    "Legal Authorities",
                  ].map((item, idx) => (
                    <div key={idx} className={styles.thirdPartyItem}>
                      <span className={styles.thirdPartyDot} />
                      <span>{item}</span>
                      {item === "Legal Authorities" && (
                        <span className={styles.thirdPartyTag}>when required</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>

          <Divider />

          {/* ========== SECTION 6: YOUR RIGHTS ========== */}
          <Reveal delay={150}>
            <section id="rights" data-section="rights" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>06</span>
                <span className={styles.sectionLabel}>Your Rights</span>
              </div>
              <div className={styles.sectionInner}>
                <div className={styles.sectionContent}>
                  <p className={styles.sectionLead}>
                    You have control over your personal information. Here's 
                    what you can do.
                  </p>
                </div>
                <div className={styles.rightsGrid}>
                  {[
                    "Access your personal information",
                    "Update your profile",
                    "Request correction of inaccurate data",
                    "Delete your account",
                    "Withdraw marketing consent",
                    "Request a copy of your stored information",
                  ].map((item, idx) => (
                    <div key={idx} className={styles.rightsItem}>
                      <FiCheckCircle className={styles.rightsIcon} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>

          <Divider />

          {/* ========== SECTION 7: POLICY UPDATES ========== */}
          <Reveal delay={100}>
            <section data-section="updates" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>07</span>
                <span className={styles.sectionLabel}>Policy Updates</span>
              </div>
              <div className={styles.sectionInner}>
                <div className={styles.sectionContent}>
                  <p className={styles.sectionLead}>
                    We may update this Privacy Policy from time to time. 
                    Changes will be posted on this page with the updated date.
                  </p>
                </div>
                <div className={styles.updateNote}>
                  <FiRefreshCw className={styles.updateIcon} />
                  <p>Last Updated: August 2026</p>
                  <span className={styles.updateSub}>
                    Please review this page periodically to stay informed.
                  </span>
                </div>
              </div>
            </section>
          </Reveal>

          <Divider />

          {/* ========== SECTION 8: MARKETING ========== */}
          <Reveal delay={150}>
            <section data-section="marketing" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>08</span>
                <span className={styles.sectionLabel}>Marketing Emails</span>
              </div>
              <div className={styles.sectionInner}>
                <div className={styles.sectionContent}>
                  <p className={styles.sectionLead}>
                    With your consent, we may send you updates, offers and 
                    newsletters. You can unsubscribe at any time.
                  </p>
                </div>
                <div className={styles.marketingNote}>
                  <FiMail className={styles.marketingIcon} />
                  <p>Manage your preferences anytime through your account settings.</p>
                </div>
              </div>
            </section>
          </Reveal>

          <Divider />

          {/* ========== SECTION 9: CHILDREN ========== */}
          <Reveal delay={100}>
            <section data-section="children" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>09</span>
                <span className={styles.sectionLabel}>Children's Privacy</span>
              </div>
              <div className={styles.sectionInner}>
                <div className={styles.sectionContent}>
                  <p className={styles.sectionLead}>
                    Our services are not intended for children under 13. We 
                    do not knowingly collect personal data from children.
                  </p>
                </div>
                <div className={styles.childrenNote}>
                  <span className={styles.childrenIcon}>👶</span>
                  <p>We take children's privacy seriously and comply with applicable regulations.</p>
                </div>
              </div>
            </section>
          </Reveal>

          <Divider />

          {/* ========== SECTION 10: ACCOUNT DELETION ========== */}
          <Reveal delay={150}>
            <section data-section="deletion" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>10</span>
                <span className={styles.sectionLabel}>Account Deletion</span>
              </div>
              <div className={styles.sectionInner}>
                <div className={styles.sectionContent}>
                  <p className={styles.sectionLead}>
                    You can request deletion of your account and data by 
                    contacting our support team. We will process your request 
                    securely.
                  </p>
                </div>
                <div className={styles.deletionNote}>
                  <FiUsers className={styles.deletionIcon} />
                  <p>Contact us at <strong>support@aureviancollections.in</strong></p>
                </div>
              </div>
            </section>
          </Reveal>

          <Divider />

          {/* ========== CONTACT SECTION ========== */}
          <Reveal delay={200}>
            <section id="contact" data-section="contact" className={styles.contactSection}>
              <div className={styles.contactInner}>
                <span className={styles.contactEyebrow}>Get in Touch</span>
                <h2 className={styles.contactTitle}>Need Help Regarding Your Privacy?</h2>
                <p className={styles.contactDesc}>
                  Our support team is here to help you with any privacy-related 
                  questions or requests.
                </p>
                <div className={styles.contactInfo}>
                  <a href="mailto:support@aureviancollections.in" className={styles.contactLink}>
                    <FiMail />
                    support@aureviancollections.in
                  </a>
                  <a href="#" className={styles.contactLink}>
                    <FiExternalLink />
                    aureviancollections.in
                  </a>
                  <span className={styles.contactLink}>
                    <FiMapPin />
                    India
                  </span>
                </div>
                <a href="#" className={styles.contactCta}>
                  Contact Support
                  <FiArrowRight />
                </a>
              </div>
            </section>
          </Reveal>

          {/* ========== BOTTOM BANNER ========== */}
          <Reveal delay={150}>
            <section className={styles.bottomBanner}>
              <div className={styles.bottomBannerIcon}>
                <FiHeart />
              </div>
              <h2 className={styles.bottomBannerTitle}>
                Your Trust Inspires Everything We Do
              </h2>
              <p className={styles.bottomBannerDesc}>
                At Aurevian Collections, protecting your privacy is just as
                important as delivering timeless elegance.
              </p>
            </section>
          </Reveal>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;