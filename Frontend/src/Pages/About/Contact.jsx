import React, { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiAward,
  FiMessageCircle,
} from "react-icons/fi";
import styles from "./Contact.module.css";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";
import Contactimg from "../../assets/ContactImage.png"

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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

    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });

    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const contactDetails = [
    {
      icon: FiMapPin,
      title: "Visit Our Showroom",
      details: ["123 Luxury Avenue", "New York, NY 10001"],
    },
    {
      icon: FiPhone,
      title: "Call Us",
      details: ["+1 (555) 123-4567", "Mon-Fri: 10AM - 7PM EST"],
    },
    {
      icon: FiMail,
      title: "Email Us",
      details: ["info@aurevian.com", "support@aurevian.com"],
    },
  ];

  const faqs = [
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship worldwide. Shipping costs and delivery times vary by location. Please see our shipping policy for details."
    },
    {
      question: "Do you offer jewelry repairs?",
      answer: "Yes, we provide repair services for both Aurevian pieces and other jewelry. Contact us for a quote."
    },
    {
      question: "Can I return or exchange a product?",
      answer: "We offer a 30-day return policy on all unworn items in their original packaging. Custom orders may have different terms."
    },
    {
      question: "How do I book a consultation?",
      answer: "You can schedule a virtual or in-person consultation through our booking system or by calling us directly."
    },
    {
      question: "Do you offer custom jewelry design?",
      answer: "Absolutely! Our master craftsmen can bring your vision to life with custom designs. Schedule a consultation to get started."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. For large purchases, we also offer financing options."
    }
  ];

  return (
    <>
      <Header />
      <div className={styles.contactPage}>
        <div className={styles.contactContainer}>
          {/* Hero Section */}
          {/* Hero Section */}

          <header className={styles.hero}>

            {/* Left Content */}

            <div className={styles.heroContent}>

              <span className={styles.badge}>
                AUREVIAN
              </span>

              <h1 className={styles.title}>
                Let's Create <br />
                Something <span>Beautiful</span>
              </h1>

              <div className={styles.divider}></div>

              <p className={styles.subtitle}>
                Whether you have a question about our collections, need
                assistance with an order, or want to book a private
                consultation, we're here to help with elegance and care.
              </p>

              <div className={styles.featureList}>

                <div className={styles.feature}>
                  <span>🛡</span>
                  <p>Lifetime Warranty</p>
                </div>

                <div className={styles.feature}>
                  <span>💎</span>
                  <p>Certified Diamonds</p>
                </div>

                <div className={styles.feature}>
                  <span>🎧</span>
                  <p>Expert Support</p>
                </div>

              </div>

            </div>

            {/* Right Image */}

            <div className={styles.heroImage}>

              <img
                src={Contactimg}
                alt="Luxury Jewellery"
              />

            </div>

          </header>

          {/* Contact Grid */}
          <div className={styles.contactGrid}>
            {/* Left Column - Contact Info */}
            <div className={styles.contactInfo}>

              <h2 className={styles.sectionTitle}>We'd Love to Hear From You</h2>
              <p className={styles.sectionSubtitle}>
                Our team of jewelry experts is dedicated to providing you with the finest
                experience. Reach out to us through any of the channels below.
              </p>

              <div className={styles.infoCards}>
                {contactDetails.map((item, index) => (
                  <div key={index} className={styles.infoCard}>
                    <div className={styles.infoIconWrapper}>
                      <item.icon className={styles.infoIcon} />
                    </div>
                    <div className={styles.infoContent}>
                      <h4>{item.title}</h4>
                      {item.details.map((detail, i) => (
                        <p key={i}>{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.socialProof}>
                <div className={styles.socialProofItem}>
                  <span className={styles.socialProofNumber}>500+</span>
                  <span className={styles.socialProofLabel}>Happy Clients</span>
                </div>
                <div className={styles.socialProofDivider}></div>
                <div className={styles.socialProofItem}>
                  <span className={styles.socialProofNumber}>98%</span>
                  <span className={styles.socialProofLabel}>Satisfaction Rate</span>
                </div>
                <div className={styles.socialProofDivider}></div>
                <div className={styles.socialProofItem}>
                  <span className={styles.socialProofNumber}>4.9★</span>
                  <span className={styles.socialProofLabel}>Rating</span>
                </div>
              </div>
            </div>

            {/* Right Column - Compact Form */}
            <div className={styles.contactFormWrapper}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Send a Message</h2>
                <p className={styles.formSubtitle}>
                  We'll respond within 24 hours
                </p>
              </div>

              <form className={styles.contactForm} onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`${styles.formInput} ${errors.name ? styles.inputError : ""
                        }`}
                      placeholder="Enter your full name"
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
                      className={`${styles.formInput} ${errors.email ? styles.inputError : ""
                        }`}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <span className={styles.errorMessage}>{errors.email}</span>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="What is this regarding?"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Your Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={`${styles.formInput} ${styles.textarea} ${errors.message ? styles.inputError : ""
                      }`}
                    placeholder="Tell us how we can help you..."
                    rows="3"
                  />
                  {errors.message && (
                    <span className={styles.errorMessage}>{errors.message}</span>
                  )}
                </div>

                <button type="submit" className={styles.submitButton}>
                  {isSubmitted ? (
                    <>
                      <FiCheckCircle className={styles.submitIcon} />
                      Message Sent Successfully
                    </>
                  ) : (
                    <>
                      Send Message
                      <FiArrowRight className={styles.submitArrow} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Image Banner */}
          <div className={styles.imageBanner}>
            <div className={styles.imageBannerContent}>
              <div className={styles.imageBannerText}>
                <h3>Experience Luxury in Person</h3>
                <p>Visit our showroom to explore our exclusive collections and receive personalized guidance from our jewelry experts.</p>
                <div className={styles.imageBannerFeatures}>
                  <span>✨ Expert Consultation</span>
                  <span>💎 Exclusive Collections</span>
                  <span>🛠️ Custom Designs</span>
                </div>
              </div>
              <div className={styles.imageBannerImage}>
                <div className={styles.bannerImagePlaceholder}>
                  <span className={styles.bannerLogo}>AUREVIAN</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className={styles.faqSection}>
            <div className={styles.faqHeader}>
              <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
              <p className={styles.faqSubtitle}>
                Find answers to commonly asked questions about our jewelry and services
              </p>
            </div>

            <div className={styles.faqGrid}>
              {faqs.map((faq, index) => (
                <div key={index} className={styles.faqItem}>
                  <div className={styles.faqContent}>
                    <h4>{faq.question}</h4>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className={styles.bottomCta}>
            <div className={styles.bottomCtaContent}>
              <h3>Let's Create Your Masterpiece</h3>
              <p>Book a private consultation with our master craftsmen and bring your vision to life.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Contact;