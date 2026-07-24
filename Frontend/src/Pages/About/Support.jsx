// src/components/Support.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiClock,
  FiHeadphones,
  FiPlus,
  FiMinus,
  FiLoader,
  FiShield,
  FiTruck,
  FiRefreshCw,
} from "react-icons/fi";
import { FaRegGem } from "react-icons/fa";
import styles from "./Support.module.css";
import Footer from "../Layout/Footer/Footer";
import toast from "react-hot-toast";
import { createSupportTicket, clearSupportError, clearSupportSuccess } from "../../redux/slices/supportSlice";

const Support = () => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.support);

  const [openFaq, setOpenFaq] = useState(null);
  const [subjectLength, setSubjectLength] = useState(0);
  const [messageLength, setMessageLength] = useState(0);
  const MAX_SUBJECT_LENGTH = 200;
  const MAX_MESSAGE_LENGTH = 5000;
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
    
    if (name === "subject") {
      setSubjectLength(value.length);
    }
    if (name === "message") {
      setMessageLength(value.length);
    }
  };

  // ============================================
  // ✅ TRUNCATE SUBJECT IF TOO LONG
  // ============================================
  const truncateSubject = (subject) => {
    if (subject.length > MAX_SUBJECT_LENGTH) {
      return subject.substring(0, MAX_SUBJECT_LENGTH);
    }
    return subject;
  };

  // ============================================
  // ✅ HANDLE FORM SUBMIT
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // ✅ Truncate subject if too long
    const ticketData = {
      ...formData,
      subject: truncateSubject(formData.subject),
    };

    try {
      const result = await dispatch(createSupportTicket(ticketData)).unwrap();
      
      if (result.success) {
        toast.success("✅ Ticket created successfully! We'll get back to you within 24 hours.");
        
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setSubjectLength(0);
        setMessageLength(0);
        setOpenFaq(null);
        
        setTimeout(() => {
          dispatch(clearSupportSuccess());
        }, 3000);
      }
    } catch (error) {
      toast.error(error || "Failed to create ticket. Please try again.");
    }
  };

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearSupportError());
    };
  }, [dispatch]);

  // Show error toast if any
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearSupportError());
    }
  }, [error, dispatch]);

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
      <div className={styles.supportPage}>
        <div className={styles.supportContainer}>
          {/* Hero Section */}
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
                    <span className={subjectLength > MAX_SUBJECT_LENGTH ? styles.exceeded : ""}>
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
                    <span className={messageLength > MAX_MESSAGE_LENGTH ? styles.exceeded : ""}>
                      {messageLength}/{MAX_MESSAGE_LENGTH}
                    </span>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FiLoader className={styles.spinner} />
                      SENDING...
                    </>
                  ) : (
                    "SEND MESSAGE"
                  )}
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