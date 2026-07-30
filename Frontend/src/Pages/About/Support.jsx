// src/components/Support.jsx

import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiClock,
  FiHeadphones,
  FiPlus,
  FiMinus,
  FiLoader,
} from "react-icons/fi";
import {
  PiShieldCheckLight,
  PiTruckLight,
  PiDiamondLight,
  PiArrowsClockwiseLight,
} from "react-icons/pi";
import styles from "./Support.module.css";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";
import toast from "react-hot-toast";
import {
  createSupportTicket,
  clearSupportError,
  clearSupportSuccess,
} from "../../redux/slices/supportSlice";

// ---------------------------------------------------------------------------
// Shared motion variants (mirrors Story.jsx exactly, so both pages move the
// same way — same easing, same durations).
// ---------------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.05 },
  },
};

const viewportOnce = { once: true, amount: 0.25 };

const HERO_IMAGE =
  "https://i.pinimg.com/1200x/6f/5f/6a/6f5f6aa1bea4fae5c1981d0ad606b029.jpg";

const CONTACT_CARDS = [
  {
    icon: FiHeadphones,
    title: "Customer Support",
    text: "Our team is available to assist you.",
    detail: "+91 91650 13748",
  },
  {
    icon: FiMail,
    title: "Email Us",
    text: "Send us an email anytime.",
    detail: "support@aurevian.com",
  },
  {
    icon: FiMessageCircle,
    title: "Live Chat",
    text: "Chat with our support team instantly.",
    detail: "Start Chat",
  },
  {
    icon: FiClock,
    title: "Working Hours",
    text: "Monday – Saturday",
    detail: "10:00 AM – 7:00 PM",
    small: "Sunday Closed",
  },
];

const TRUST_ITEMS = [
  {
    icon: PiShieldCheckLight,
    title: "Secure & Safe",
    text: "Your information is 100% protected.",
  },
  {
    icon: PiTruckLight,
    title: "Fast Delivery",
    text: "Timely and safe delivery to your door.",
  },
  {
    icon: PiDiamondLight,
    title: "Certified Jewellery",
    text: "All our jewellery is authentic & certified.",
  },
  {
    icon: PiArrowsClockwiseLight,
    title: "Easy Returns",
    text: "Hassle-free returns within 7 days.",
  },
];

const FAQS = [
  {
    question: "How can I track my order?",
    answer:
      "You can track your order by logging into your account and visiting 'My Orders'. You'll also receive a tracking number via email once your order ships.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy on unworn items in their original packaging. Custom orders and personalized items may have different return conditions.",
  },
  {
    question: "How can I care for my jewellery?",
    answer:
      "Store your jewellery in a cool, dry place. Clean with a soft cloth and avoid contact with chemicals, perfumes, and water.",
  },
  {
    question: "Do you offer gift wrapping?",
    answer:
      "Yes, we offer complimentary gift wrapping for all orders. You can select this option at checkout.",
  },
  {
    question: "Are your products certified?",
    answer:
      "Yes, all our jewellery is hallmarked and certified with authenticity certificates for your peace of mind.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, Google Pay, and UPI payments for your convenience.",
  },
];

const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

// ---------------------------------------------------------------------------
// Hero — same parallax treatment as Story's hero (background drifts on
// scroll, content fades/lifts as it leaves the viewport).
// ---------------------------------------------------------------------------
function Hero() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      aria-label="Support — How Can We Help You"
    >
      <motion.div className={styles.heroBackground} style={{ y: imageY }}>
        <img
          src={HERO_IMAGE}
          alt="Aurevian jewellery support"
          className={styles.heroImage}
          fetchpriority="high"
        />
      </motion.div>

      <div className={styles.heroOverlay} aria-hidden="true" />

      <motion.div
        className={styles.heroContent}
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.span
          className={styles.heroBrand}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        >
          We Are Here For You
        </motion.span>

        <motion.h1
          className={styles.heroTagline}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.45 }}
        >
          How Can We Help You?
        </motion.h1>

        <motion.p
          className={styles.heroSubtitle}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.65 }}
        >
          Our support team is dedicated to giving you the best experience.
        </motion.p>
      </motion.div>

      <motion.div
        className={styles.heroScroll}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        aria-hidden="true"
      >
        <span className={styles.heroScrollLabel}>Scroll</span>
        <span className={styles.heroScrollLine} />
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Contact cards
// ---------------------------------------------------------------------------
function ContactCards() {
  return (
    <section className={styles.getInTouch} aria-label="Ways to reach us">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className={styles.getInTouchHeader}
      >
        <motion.span variants={fadeUp} className={styles.eyebrow}>
          Get In Touch
        </motion.span>
        <motion.h2 variants={fadeUp} className={styles.sectionTitle}>
          We'd Love to Hear From You
        </motion.h2>
      </motion.div>

      <motion.div
        className={styles.contactCards}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {CONTACT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              className={styles.contactCard}
              variants={fadeUp}
            >
              <div className={styles.contactCardIcon}>
                <Icon />
              </div>
              <h4>{card.title}</h4>
              <p>{card.text}</p>
              <span className={styles.contactCardDetail}>{card.detail}</span>
              {card.small && <small>{card.small}</small>}
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FAQ + Contact form split
// ---------------------------------------------------------------------------
function FaqAndForm() {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.support);

  const [openFaq, setOpenFaq] = useState(null);
  const [subjectLength, setSubjectLength] = useState(0);
  const [messageLength, setMessageLength] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "subject") setSubjectLength(value.length);
    if (name === "message") setMessageLength(value.length);
  };

  const truncateSubject = (subject) =>
    subject.length > MAX_SUBJECT_LENGTH
      ? subject.substring(0, MAX_SUBJECT_LENGTH)
      : subject;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const ticketData = {
      ...formData,
      subject: truncateSubject(formData.subject),
    };

    try {
      const result = await dispatch(createSupportTicket(ticketData)).unwrap();

      if (result.success) {
        toast.success(
          "Ticket created successfully! We'll get back to you within 24 hours.",
        );
        setFormData({ name: "", email: "", subject: "", message: "" });
        setSubjectLength(0);
        setMessageLength(0);
        setOpenFaq(null);

        setTimeout(() => {
          dispatch(clearSupportSuccess());
        }, 3000);
      }
    } catch (err) {
      toast.error(err || "Failed to create ticket. Please try again.");
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearSupportError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearSupportError());
    }
  }, [error, dispatch]);

  return (
    <div className={styles.contactFaqGrid}>
      {/* FAQ */}
      <motion.div
        className={styles.faqWrapper}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <motion.span variants={fadeUp} className={styles.eyebrow}>
          Questions
        </motion.span>
        <motion.hr variants={fadeUp} className={styles.hairline} />
        <motion.h3 variants={fadeUp} className={styles.faqTitle}>
          Frequently Asked Questions
        </motion.h3>

        <div className={styles.faqList}>
          {FAQS.map((faq, index) => (
            <motion.div
              key={faq.question}
              variants={fadeUp}
              className={`${styles.faqItem} ${openFaq === index ? styles.faqItemOpen : ""}`}
            >
              <button
                className={styles.faqQuestion}
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>
                <span className={styles.faqIcon}>
                  {openFaq === index ? <FiMinus /> : <FiPlus />}
                </span>
              </button>
              <div
                className={`${styles.faqAnswer} ${openFaq === index ? styles.faqAnswerOpen : ""}`}
              >
                <p>{faq.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact form */}
      <motion.div
        className={styles.contactFormWrapper}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <motion.span variants={fadeUp} className={styles.eyebrow}>
          Message Us
        </motion.span>
        <motion.hr variants={fadeUp} className={styles.hairline} />
        <motion.h3 variants={fadeUp} className={styles.formTitle}>
          Send Us A Message
        </motion.h3>

        <motion.form
          variants={fadeUp}
          className={styles.contactForm}
          onSubmit={handleSubmit}
        >
          <div className={styles.formGroup}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className={styles.formInput}
              required
              disabled={loading}
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className={styles.formInput}
              required
              disabled={loading}
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              className={styles.formInput}
              maxLength={MAX_SUBJECT_LENGTH}
              disabled={loading}
            />
            <div className={styles.charCounter}>
              <span
                className={
                  subjectLength > MAX_SUBJECT_LENGTH ? styles.exceeded : ""
                }
              >
                {subjectLength}/{MAX_SUBJECT_LENGTH}
              </span>
            </div>
          </div>
          <div className={styles.formGroup}>
            <textarea
              name="message"
              placeholder="How can we help you?"
              value={formData.message}
              onChange={handleChange}
              className={styles.formTextarea}
              rows="4"
              required
              disabled={loading}
              maxLength={MAX_MESSAGE_LENGTH}
            />
            <div className={styles.charCounter}>
              <span
                className={
                  messageLength > MAX_MESSAGE_LENGTH ? styles.exceeded : ""
                }
              >
                {messageLength}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <FiLoader className={styles.spinner} />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trust strip
// ---------------------------------------------------------------------------
function TrustStrip() {
  return (
    <motion.section
      className={styles.trustSection}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      aria-label="Why shop with us"
    >
      {TRUST_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.title}
            className={styles.trustCard}
            variants={fadeUp}
          >
            <Icon className={styles.trustIcon} aria-hidden="true" />
            <div>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// Support — top level export
// ---------------------------------------------------------------------------
const Support = () => {
  return (
    <>
      <Header />
      <main className={styles.support}>
        <Hero />
        <div className={styles.supportContainer}>
          <ContactCards />
          <FaqAndForm />
          <TrustStrip />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Support;
