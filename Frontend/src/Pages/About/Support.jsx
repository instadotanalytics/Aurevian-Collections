// src/components/Support.jsx
import React, { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiPackage,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiStar,
  FiHeadphones,
  FiAward,
  FiGlobe,
  FiLock,
} from "react-icons/fi";
import styles from "./Support.module.css";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";

const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

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

    console.log("Support form submitted:", formData);
    setIsSubmitted(true);
    setFormData({
      name: "",
      email: "",
      orderNumber: "",
      subject: "",
      message: "",
    });

    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const supportOptions = [
    {
      icon: FiHeadphones,
      title: "24/7 Support",
      description: "Always here to assist you",
    },
    {
      icon: FiPackage,
      title: "Order Tracking",
      description: "Real-time order updates",
    },
    {
      icon: FiRefreshCw,
      title: "Easy Returns",
      description: "30-day hassle-free returns",
    },
    {
      icon: FiShield,
      title: "Secure Shopping",
      description: "100% encrypted protection",
    },
    {
      icon: FiTruck,
      title: "Fast Shipping",
      description: "Express delivery options",
    },
    {
      icon: FiAward,
      title: "Quality Guarantee",
      description: "Finest materials & craftsmanship",
    },
  ];

  const faqs = [
    {
      question: "How do I track my order?",
      answer:
        "Log into your account and visit 'My Orders' or check your email for tracking information.",
    },
    {
      question: "What is your return policy?",
      answer:
        "30-day return policy on unworn items in original packaging. Custom orders may vary.",
    },
    {
      question: "Do you offer gift wrapping?",
      answer:
        "Yes, complimentary gift wrapping is available for all orders at checkout.",
    },
    {
      question: "How do I care for my jewelry?",
      answer:
        "Store in a cool, dry place. Clean with a soft cloth and avoid chemicals.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "All major credit cards, PayPal, Apple Pay, and Google Pay.",
    },
    {
      question: "How long does shipping take?",
      answer: "3-5 business days domestic, 7-14 business days international.",
    },
    {
      question: "Can I cancel or modify my order?",
      answer:
        "Yes, within 2 hours of placing your order. Contact support immediately.",
    },
    {
      question: "Do you offer custom jewelry design?",
      answer:
        "Yes, we offer custom design services. Schedule a consultation with our experts.",
    },
  ];

  return (
    <>
      <Header />
      <div className={styles.supportPage}>
        <div className={styles.supportContainer}>
          {/* Hero Section */}
          <div className={styles.heroSection}>
            <h1 className={styles.heroTitle}>We're Here to Help</h1>
            <p className={styles.heroSubtitle}>
              Our dedicated support team is ready to assist you with any
              questions about your order, our jewelry, or any other inquiries
              you may have.
            </p>
          </div>

          {/* Support Options - Smaller Cards */}
          <div className={styles.supportOptions}>
            {supportOptions.map((option, index) => (
              <div key={index} className={styles.supportCard}>
                <div className={styles.supportIconWrapper}>
                  <option.icon className={styles.supportIcon} />
                </div>
                <h4>{option.title}</h4>
                <p>{option.description}</p>
              </div>
            ))}
          </div>

          {/* Commitment Section - Cleaner */}
          <div className={styles.commitmentSection}>
            <h3 className={styles.commitmentTitle}>Our Commitment to You</h3>
            <div className={styles.commitmentGrid}>
              <div className={styles.commitmentItem}>
                <FiClock className={styles.commitmentIcon} />
                <div>
                  <h4>24/7 Availability</h4>
                  <p>Round-the-clock support</p>
                </div>
              </div>
              <div className={styles.commitmentItem}>
                <FiGlobe className={styles.commitmentIcon} />
                <div>
                  <h4>Worldwide Service</h4>
                  <p>Global customer support</p>
                </div>
              </div>
              <div className={styles.commitmentItem}>
                <FiLock className={styles.commitmentIcon} />
                <div>
                  <h4>Secure & Private</h4>
                  <p>Advanced encryption</p>
                </div>
              </div>
              <div className={styles.commitmentItem}>
                <FiStar className={styles.commitmentIcon} />
                <div>
                  <h4>Quality Assured</h4>
                  <p>Expert craftsmanship</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Support Grid */}
          <div className={styles.supportGrid}>
            {/* Left Column - Contact Info */}
            <div className={styles.supportInfo}>
              <h2 className={styles.sectionTitle}>Get in Touch</h2>
              <p className={styles.sectionSubtitle}>
                Our support team is ready to assist you with any questions or
                concerns.
              </p>

              <div className={styles.contactMethods}>
                <div className={styles.contactMethod}>
                  <div className={styles.contactIconWrapper}>
                    <FiMail className={styles.contactIcon} />
                  </div>
                  <div className={styles.contactContent}>
                    <h4>Email Us</h4>
                    <p>support@aurevian.com</p>
                    <span className={styles.contactTime}>
                      Response within 24 hours
                    </span>
                  </div>
                </div>

                <div className={styles.contactMethod}>
                  <div className={styles.contactIconWrapper}>
                    <FiPhone className={styles.contactIcon} />
                  </div>
                  <div className={styles.contactContent}>
                    <h4>Call Us</h4>
                    <p>+1 (555) 123-4567</p>
                    <span className={styles.contactTime}>
                      Mon-Fri: 10AM - 7PM EST
                    </span>
                  </div>
                </div>

                <div className={styles.contactMethod}>
                  <div className={styles.contactIconWrapper}>
                    <FiMessageCircle className={styles.contactIcon} />
                  </div>
                  <div className={styles.contactContent}>
                    <h4>Live Chat</h4>
                    <p>Chat with our support team</p>
                    <span className={styles.contactTime}>Available 24/7</span>
                  </div>
                </div>
              </div>

              <div className={styles.trustBadges}>
                <div className={styles.trustItem}>
                  <FiStar className={styles.trustIcon} />
                  <span>4.9★ Rating</span>
                </div>
                <div className={styles.trustDivider}></div>
                <div className={styles.trustItem}>
                  <FiClock className={styles.trustIcon} />
                  <span>24/7 Support</span>
                </div>
                <div className={styles.trustDivider}></div>
                <div className={styles.trustItem}>
                  <FiShield className={styles.trustIcon} />
                  <span>100% Secure</span>
                </div>
              </div>
            </div>

            {/* Right Column - Support Form */}
            <div className={styles.supportFormWrapper}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Submit a Request</h2>
                <p className={styles.formSubtitle}>
                  Fill out the form below and we'll get back to you
                </p>
              </div>

              <form className={styles.supportForm} onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`${styles.formInput} ${
                        errors.name ? styles.inputError : ""
                      }`}
                      placeholder="Enter your name"
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
                      className={`${styles.formInput} ${
                        errors.email ? styles.inputError : ""
                      }`}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <span className={styles.errorMessage}>
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="e.g., #AUR-12345"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={styles.formInput}
                  >
                    <option value="">Select a subject</option>
                    <option value="order">Order Status</option>
                    <option value="return">Returns & Exchanges</option>
                    <option value="product">Product Inquiry</option>
                    <option value="shipping">Shipping Question</option>
                    <option value="custom">Custom Design</option>
                    <option value="repair">Repair Service</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={`${styles.formInput} ${styles.textarea} ${
                      errors.message ? styles.inputError : ""
                    }`}
                    placeholder="Describe your issue or question..."
                    rows="4"
                  />
                  {errors.message && (
                    <span className={styles.errorMessage}>
                      {errors.message}
                    </span>
                  )}
                </div>

                <button type="submit" className={styles.submitButton}>
                  {isSubmitted ? (
                    <>
                      <FiCheckCircle className={styles.submitIcon} />
                      Request Submitted
                    </>
                  ) : (
                    <>Submit Request</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Section - Shorter Descriptions */}
          <div className={styles.faqSection}>
            <div className={styles.faqHeader}>
              <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
              <p className={styles.faqSubtitle}>
                Quick answers to our most commonly asked questions
              </p>
            </div>

            <div className={styles.faqGrid}>
              {faqs.map((faq, index) => (
                <div key={index} className={styles.faqItem}>
                  {/* <div className={styles.faqNumber}>0{index + 1}</div> */}
                  <div className={styles.faqContent}>
                    <h4>{faq.question}</h4>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Support;
