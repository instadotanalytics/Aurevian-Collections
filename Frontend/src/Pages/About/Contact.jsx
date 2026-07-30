// src/Pages/Contact/Contact.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiStar,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiHeart,
} from "react-icons/fi";
import { FaGem } from "react-icons/fa";
import styles from "./Contact.module.css";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";

const CONTACT_IMAGE_URL =
  "https://i.pinimg.com/1200x/dd/00/8a/dd008ab532e9e0b616fd21f83c621256.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
  },
};

const imageReveal = {
  hidden: { opacity: 0, scale: 1.04 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.05 },
  },
};

const viewportOnce = { once: true, amount: 0.25 };

const infoCards = [
  {
    icon: FiMapPin,
    title: "Visit Our Showroom",
    details: ["123 Luxury Avenue", "New York, NY 10001"],
  },
  {
    icon: FiPhone,
    title: "Call Us",
    details: ["+1 (555) 123-4567", "24 hours available"],
  },
  {
    icon: FiMail,
    title: "Email Us",
    details: ["info@aurevian.com", "support@aurevian.com"],
  },
];

const socialProof = [
  { id: "clients", num: "500+", label: "Happy Clients" },
  { id: "satisfaction", num: "98%", label: "Satisfaction Rate" },
  { id: "rating", num: "4.9", label: "Rating", star: true },
];

const features = [
  { icon: FiShield, label: "Lifetime Warranty" },
  { icon: FaGem, label: "Certified Diamonds" },
  { icon: FiHeart, label: "Expert Support" },
];

const faqs = [
  {
    q: "What is your return policy?",
    a: "We offer a 30-day return policy on unworn items in their original packaging. Custom orders may have different conditions.",
  },
  {
    q: "Do you offer custom jewelry design?",
    a: "Yes, we offer bespoke custom design services. Schedule a consultation with our expert designers.",
  },
  {
    q: "How long does shipping take?",
    a: "Domestic orders arrive within 3-5 business days. International orders take 7-14 business days.",
  },
  {
    q: "Are your products certified?",
    a: "All our jewellery is hallmarked and certified with authenticity certificates for your peace of mind.",
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", phone: "", message: "" });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.container}>
        {/* ================= HERO ================= */}
        <section className={styles.hero}>
          <motion.div
            className={styles.heroText}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.span variants={fadeUp} className={styles.eyebrow}>
              Let's Create
            </motion.span>
            <motion.hr variants={fadeUp} className={styles.hairline} />
            <motion.h1 variants={fadeUp} className={styles.heroTitle}>
              Something{" "}
              <span className={styles.heroTitleAccent}>Beautiful</span>
            </motion.h1>
            <motion.p variants={fadeUp} className={styles.heroSub}>
              Whether you have a question about our collections, need assistance
              with an order, or want to book a private consultation, we're here
              to help with elegance and care.
            </motion.p>
            <motion.div variants={fadeUp} className={styles.featureList}>
              {features.map(({ icon: Icon, label }) => (
                <span className={styles.feature} key={label}>
                  <Icon className={styles.featureIcon} />
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.heroMedia}
            variants={imageReveal}
            initial="hidden"
            animate="visible"
          >
            <img src={CONTACT_IMAGE_URL} alt="Aurevian luxury jewellery" />
          </motion.div>
        </section>

        {/* ================= CONTACT GRID ================= */}
        <section className={styles.contactGrid}>
          {/* ---- Info column ---- */}
          <motion.div
            className={styles.infoColumn}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.span variants={fadeUp} className={styles.eyebrow}>
              Get in Touch
            </motion.span>
            <motion.hr variants={fadeUp} className={styles.hairline} />
            <motion.h2 variants={fadeUp} className={styles.sectionTitle}>
              We'd Love to Hear From You
            </motion.h2>
            <motion.p variants={fadeUp} className={styles.sectionLead}>
              Our team of jewelry experts is dedicated to providing you with the
              finest experience. Reach out through any of the channels below.
            </motion.p>

            <div className={styles.infoCards}>
              {infoCards.map((card, index) => (
                <motion.div
                  key={index}
                  className={styles.infoCard}
                  variants={fadeUp}
                >
                  <card.icon className={styles.infoIcon} aria-hidden="true" />
                  <div className={styles.infoContent}>
                    <h4>{card.title}</h4>
                    {card.details.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} className={styles.socialProof}>
              {socialProof.map((item) => (
                <div className={styles.socialProofItem} key={item.id}>
                  <span className={styles.socialProofNum}>
                    {item.num}
                    {item.star && <FiStar className={styles.starIcon} />}
                  </span>
                  <span className={styles.socialProofLabel}>{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ---- Form column ---- */}
          <motion.div
            className={styles.formColumn}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <span className={styles.eyebrow}>Aurevian</span>
            <hr className={styles.hairline} />
            <h3 className={styles.formTitle}>Send Us a Message</h3>
            <p className={styles.formSub}>We'll respond within 24 hours</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={`${styles.formInput} ${
                    errors.name ? styles.inputError : ""
                  }`}
                />
                {errors.name && (
                  <span className={styles.errorMessage}>{errors.name}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`${styles.formInput} ${
                    errors.email ? styles.inputError : ""
                  }`}
                />
                {errors.email && (
                  <span className={styles.errorMessage}>{errors.email}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className={`${styles.formInput} ${styles.textarea} ${
                    errors.message ? styles.inputError : ""
                  }`}
                  rows="4"
                />
                {errors.message && (
                  <span className={styles.errorMessage}>{errors.message}</span>
                )}
              </div>

              <button type="submit" className={styles.submitButton}>
                {isSubmitted ? (
                  <>
                    <FiCheckCircle className={styles.submitIcon} /> Message
                    Sent!
                  </>
                ) : (
                  <>
                    Send Message
                    <FiArrowRight className={styles.submitArrow} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </section>

        {/* ================= FAQ ================= */}
        <section className={styles.faqSection}>
          <motion.div
            className={styles.sectionHeader}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.span variants={fadeUp} className={styles.eyebrow}>
              FAQ
            </motion.span>
            <motion.hr variants={fadeUp} className={styles.hairline} />
            <motion.h2 variants={fadeUp} className={styles.sectionTitle}>
              Frequently Asked Questions
            </motion.h2>
          </motion.div>

          <motion.div
            className={styles.faqList}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {faqs.map((faq, index) => (
              <motion.div
                className={styles.faqRow}
                key={index}
                variants={fadeUp}
              >
                <span className={styles.faqIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className={styles.faqBody}>
                  <h4>{faq.q}</h4>
                  <p>{faq.a}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ================= BOTTOM CTA ================= */}
        <section className={styles.cta}>
          <motion.span
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className={styles.eyebrowLight}
          >
            Aurevian
          </motion.span>
          <motion.h3
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className={styles.ctaTitle}
          >
            Let's Create Something Beautiful Together
          </motion.h3>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className={styles.ctaSub}
          >
            Whether you're looking for the perfect piece or need expert
            guidance, our team is here to bring your vision to life.
          </motion.p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
