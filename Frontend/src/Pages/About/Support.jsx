// src/components/Support.jsx
import React, { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiClock,
  FiCheckCircle,
  FiPackage,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiStar,
  FiHeadphones,
  FiAward,
  FiGlobe,
  FiLock,
  FiPlus,
  FiMinus,
  FiChevronRight,
  FiMapPin,
  FiSend,
  FiBookOpen,
  FiHelpCircle,
  FiUser,
  FiShoppingBag,
  FiCreditCard,
  FiHeart,
  FiPhoneCall,
} from "react-icons/fi";
import { FaRupeeSign, FaRegGem } from "react-icons/fa";
import styles from "./Support.module.css";
// import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";
import Contactimg from "../../assets/ContactImage.png";

const Support = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const faqs = [
    {
      question: "How can I track my order?",
      answer: "You can track your order by logging into your account and visiting 'My Orders'. You'll also receive a tracking number via email once your order ships.",
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy on unworn items in their original packaging. Custom orders and personalized items may have different return conditions.",
    },
    {
      question: "How can I care for my jewellery?",
      answer: "Store your jewellery in a cool, dry place. Clean with a soft cloth and avoid contact with chemicals, perfumes, and water.",
    },
    {
      question: "Do you offer gift wrapping?",
      answer: "Yes, we offer complimentary gift wrapping for all orders. You can select this option at checkout.",
    },
    {
      question: "Are your products certified?",
      answer: "Yes, all our jewellery is hallmarked and certified with authenticity certificates for your peace of mind.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, Google Pay, and UPI payments for your convenience.",
    },
  ];

  return (
    <>
      {/* <Header /> */}
      <div className={styles.supportPage}>
        <div className={styles.supportContainer}>
          {/* Hero Section with Background Image */}
          <div className={styles.heroSection}>
            <div className={styles.heroOverlay}></div>
            <div className={styles.heroContent}>
              <span className={styles.heroBadge}>✦ WE ARE HERE FOR YOU</span>
              <h1 className={styles.heroTitle}>
                How Can We <br />
                <span className={styles.heroHighlight}>Help You?</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Our support team is dedicated to providing you with the best experience.
              </p>
            </div>
          </div>

          {/* Get in Touch Section */}
          <div className={styles.getInTouch}>
            <h2 className={styles.sectionTitle}>We'd Love to Hear From You</h2>
            <div className={styles.contactCards}>
              <div className={styles.contactCard}>
                <div className={styles.contactCardIcon}>
                  <FiHeadphones />
                </div>
                <h4>Customer Support</h4>
                <p>Our team is available to assist you.</p>
                <span className={styles.contactCardDetail}>+91 91650 13748</span>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactCardIcon}>
                  <FiMail />
                </div>
                <h4>Email Us</h4>
                <p>Send us an email anytime.</p>
                <span className={styles.contactCardDetail}>support@aurevian.com</span>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactCardIcon}>
                  <FiMessageCircle />
                </div>
                <h4>Live Chat</h4>
                <p>Chat with our support team instantly.</p>
                <span className={styles.contactCardDetail}>Start Chat</span>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactCardIcon}>
                  <FiClock />
                </div>
                <h4>Working Hours</h4>
                <p>Monday-Saturday</p>
                <span className={styles.contactCardDetail}>10:00AM - 7:00PM</span>
                <small>Sunday Closed</small>
              </div>
            </div>
          </div>

          {/* Contact Form & FAQ Section */}
          <div className={styles.contactFaqGrid}>
            {/* FAQ Section - Left */}
            <div className={styles.faqWrapper}>
              <h3 className={styles.faqTitle}>FREQUENTLY ASKED QUESTIONS</h3>
              <div className={styles.faqList}>
                {faqs.map((faq, index) => (
                  <div 
                    key={index} 
                    className={`${styles.faqItem} ${openFaq === index ? styles.faqItemOpen : ''}`}
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
                    <div className={`${styles.faqAnswer} ${openFaq === index ? styles.faqAnswerOpen : ''}`}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form - Right */}
            <div className={styles.contactFormWrapper}>
              <h3 className={styles.formTitle}>SEND US A MESSAGE</h3>
              <form className={styles.contactForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.formInput}
                    required
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
                  />
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
                  />
                </div>
                <button type="submit" className={styles.submitBtn}>
                  SEND MESSAGE
                </button>
              </form>
            </div>
          </div>

          {/* Trust Section */}
          <div className={styles.trustSection}>
            <div className={styles.trustCard}>
              <FiShield className={styles.trustIcon} />
              <div>
                <h4>Secure & Safe</h4>
                <p>Your information is 100% protected.</p>
              </div>
            </div>
            <div className={styles.trustCard}>
              <FiTruck className={styles.trustIcon} />
              <div>
                <h4>Fast Delivery</h4>
                <p>Timely and safe delivery to your door.</p>
              </div>
            </div>
            <div className={styles.trustCard}>
              <FaRegGem className={styles.trustIcon} />
              <div>
                <h4>Certified Jewellery</h4>
                <p>All our jewellery is authentic & certified.</p>
              </div>
            </div>
            <div className={styles.trustCard}>
              <FiRefreshCw className={styles.trustIcon} />
              <div>
                <h4>Easy Returns</h4>
                <p>Hassle-free returns within 7 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Support;