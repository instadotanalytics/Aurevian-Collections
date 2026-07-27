// src/Pages/Contact/Contact.jsx
import React, { useState } from 'react';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiStar,
  FiUsers,
  FiTrendingUp,
  FiShield,
  FiClock,
  FiCheckCircle,
  FiSend,
  FiArrowRight,
  FiHeart,
  FiAward,
  FiTruck,
} from 'react-icons/fi';
import { FaGem } from 'react-icons/fa';
import styles from './Contact.module.css';
import ContactImage from "../../assets/ContactImage.png";
import Footer from "../Layout/Footer/Footer";


const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const infoCards = [
    {
      icon: FiMapPin,
      title: 'Visit Our Showroom',
      details: ['123 Luxury Avenue', 'New York, NY 10001'],
    },
    {
      icon: FiPhone,
      title: 'Call Us',
      details: ['+1 (555) 123-4567', '24 hours available'],
    },
    {
      icon: FiMail,
      title: 'Email Us',
      details: ['info@aurevian.com', 'support@aurevian.com'],
    },
  ];

  const faqs = [
    {
      q: 'What is your return policy?',
      a: 'We offer a 30-day return policy on unworn items in their original packaging. Custom orders may have different conditions.',
    },
    {
      q: 'Do you offer custom jewelry design?',
      a: 'Yes, we offer bespoke custom design services. Schedule a consultation with our expert designers.',
    },
    {
      q: 'How long does shipping take?',
      a: 'Domestic orders arrive within 3-5 business days. International orders take 7-14 business days.',
    },
    {
      q: 'Are your products certified?',
      a: 'All our jewellery is hallmarked and certified with authenticity certificates for your peace of mind.',
    },
  ];

  return (
    <div className={styles.contactPage}>
      <div className={styles.contactContainer}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>✦ Let's Create</span>
            <h1 className={styles.title}>
              Something <span>Beautiful</span>
            </h1>
            <div className={styles.divider} />
            <p className={styles.subtitle}>
              Whether you have a question about our collections, need assistance with an order, 
              or want to book a private consultation, we're here to help with elegance and care.
            </p>
            <div className={styles.featureList}>
              <div className={styles.feature}>
                <FiShield className={styles.featureIcon} />
                <span>Lifetime Warranty</span>
              </div>
              <div className={styles.feature}>
                <FaGem className={styles.featureIcon} />
                <span>Certified Diamonds</span>
              </div>
              <div className={styles.feature}>
                <FiHeart className={styles.featureIcon} />
                <span>Expert Support</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img src={ContactImage} alt="Aurevian Luxury Jewellery" />
          </div>
        </section>

        {/* Contact Grid */}
        <div className={styles.contactGrid}>
          {/* Left Column - Contact Info */}
          <div className={styles.contactInfo}>
            <span className={styles.sectionBadge}>✦ Get in Touch</span>
            <h2 className={styles.sectionTitle}>We'd Love to Hear From You</h2>
            <p className={styles.sectionSubtitle}>
              Our team of jewelry experts is dedicated to providing you with the finest experience.
              Reach out to us through any of the channels below.
            </p>

            <div className={styles.infoCards}>
              {infoCards.map((card, index) => (
                <div key={index} className={styles.infoCard}>
                  <div className={styles.infoIconWrapper}>
                    <card.icon className={styles.infoIcon} />
                  </div>
                  <div className={styles.infoContent}>
                    <h4>{card.title}</h4>
                    {card.details.map((line, i) => (
                      <p key={i}>{line}</p>
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
              <div className={styles.socialProofDivider} />
              <div className={styles.socialProofItem}>
                <span className={styles.socialProofNumber}>98%</span>
                <span className={styles.socialProofLabel}>Satisfaction Rate</span>
              </div>
              <div className={styles.socialProofDivider} />
              <div className={styles.socialProofItem}>
                <span className={styles.socialProofNumber}>
                  4.9 <FiStar className={styles.starIcon} />
                </span>
                <span className={styles.socialProofLabel}>Rating</span>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className={styles.contactFormWrapper}>
            <div className={styles.formHeader}>
              <span className={styles.formLogo}>✦ Aurevian</span>
              <h3 className={styles.formTitle}>Send Us a Message</h3>
              <p className={styles.formSubtitle}>
                We'll respond within 24 hours
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                  />
                  {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                  />
                  {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className={`${styles.formInput} ${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                    rows="4"
                  />
                  {errors.message && <span className={styles.errorMessage}>{errors.message}</span>}
                </div>
              </div>

              <button type="submit" className={styles.submitButton}>
                {isSubmitted ? (
                  <>
                    <FiCheckCircle className={styles.submitIcon} /> Message Sent!
                  </>
                ) : (
                  <>
                    Send Message <FiArrowRight className={styles.submitArrow} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <div className={styles.faqHeader}>
            <span className={styles.sectionBadge}>✦ FAQ</span>
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
            <p className={styles.faqSubtitle}>Quick answers to common questions</p>
          </div>
          <div className={styles.faqGrid}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <div className={styles.faqContent}>
                  <h4>{faq.q}</h4>
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className={styles.bottomCta}>
          <div className={styles.bottomCtaContent}>
            <span className={styles.bottomCtaLogo}>✦ Aurevian</span>
            <h3>Let's Create Something Beautiful Together</h3>
            <p>
              Whether you're looking for the perfect piece or need expert guidance,
              our team is here to bring your vision to life.
            </p>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Contact;