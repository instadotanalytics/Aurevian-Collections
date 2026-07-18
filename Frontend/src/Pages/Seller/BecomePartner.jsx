// src/Pages/Seller/BecomePartner.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiTrendingUp, FiUsers, FiAward, FiCheckCircle } from 'react-icons/fi';
import styles from './BecomePartner.module.css';

const BecomePartner = () => {
  const features = [
    {
      icon: <FiShield />,
      title: 'Verified Seller Badge',
      description: 'Get a verified badge that builds trust and credibility with customers.'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Grow Your Business',
      description: 'Reach thousands of luxury customers looking for premium jewellery.'
    },
    {
      icon: <FiTruck />,
      title: 'Easy Shipping & Logistics',
      description: 'We handle shipping logistics so you can focus on creating beautiful pieces.'
    },
    {
      icon: <FiUsers />,
      title: 'Dedicated Support',
      description: 'Get 24/7 support from our team to help you succeed.'
    },
    {
      icon: <FiAward />,
      title: 'Marketing & Promotion',
      description: 'We promote your products through our channels to help you sell more.'
    },
    {
      icon: <FiCheckCircle />,
      title: 'Secure Payments',
      description: 'Get paid securely and on time for every sale you make.'
    }
  ];

  const benefits = [
    'Access to premium luxury customer base',
    'No monthly subscription fees',
    'Competitive commission rates',
    'Professional storefront',
    'Advanced analytics dashboard',
    'Priority customer support',
    'Marketing and promotional opportunities',
    'Secure and timely payments'
  ];

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>✨ Become a Partner</span>
          <h1 className={styles.heroTitle}>
            Join Aurevian as a <span className={styles.highlight}>Seller Partner</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Showcase your exquisite jewellery to a global audience of luxury enthusiasts. 
            Start selling on Aurevian and grow your business with us.
          </p>
          <div className={styles.heroButtons}>
            <Link to="/seller/register" className={styles.primaryBtn}>
              Get Started Now <FiArrowRight />
            </Link>
            <Link to="/seller/login" className={styles.secondaryBtn}>
              Already a Partner? Login
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Active Sellers</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>10K+</span>
              <span className={styles.statLabel}>Products Sold</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>98%</span>
              <span className={styles.statLabel}>Satisfaction Rate</span>
            </div>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.imagePlaceholder}>
            <span>✨</span>
            <p>Luxury Jewellery</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>Why Partner with Us?</h2>
          <p>Everything you need to succeed as a jewellery seller on Aurevian</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefits}>
        <div className={styles.benefitsContent}>
          <div className={styles.benefitsLeft}>
            <span className={styles.badge}>Benefits</span>
            <h2>Why Sellers Love Aurevian</h2>
            <p>
              Join hundreds of successful jewellery sellers who have grown their 
              business with Aurevian. Here's what you get:
            </p>
            <ul className={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <li key={index}>
                  <FiCheckCircle />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.benefitsRight}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialQuote}>
                "Aurevian helped me reach customers I never thought possible. 
                My sales have tripled in just 6 months!"
              </div>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}>⭐</div>
                <div>
                  <h4>Priya Sharma</h4>
                  <p>Jewellery Designer, Mumbai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <h2>How It Works</h2>
          <p>Get started in 4 simple steps</p>
        </div>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Register</h3>
            <p>Create your seller account and tell us about your business</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Verify & Submit Documents</h3>
            <p>Submit your business documents for verification</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Get Approved</h3>
            <p>Our team reviews and approves your application</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h3>Start Selling</h3>
            <p>List your products and start selling to luxury customers</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Ready to Start Your Journey?</h2>
          <p>
            Join Aurevian today and take your jewellery business to the next level.
            We're here to help you succeed.
          </p>
          <Link to="/seller/register" className={styles.ctaBtn}>
            Get Started Now <FiArrowRight />
          </Link>
          <p className={styles.ctaNote}>
            Already have an account? <Link to="/seller/login">Sign in here</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default BecomePartner;