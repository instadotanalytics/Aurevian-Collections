// src/Pages/Seller/BecomePartner.jsx

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiArrowRight, 
  FiShield, 
  FiTruck, 
  FiTrendingUp, 
  FiUsers, 
  FiAward, 
  FiCheckCircle,
  FiStar,
  FiHeart,
  FiGlobe,
  FiClock,
  FiThumbsUp
} from 'react-icons/fi';
import { FaGem } from 'react-icons/fa';
import styles from './BecomePartner.module.css';
import Contactimg from "../../assets/partner.png";
import B1Image from "../../assets/b1.png";
import Footer from "../Layout/Footer/Footer";

const BecomePartner = () => {
  const navigate = useNavigate();

  // Memoized data
  const features = useMemo(() => [
    {
      icon: <FiShield />,
      title: 'Verified Seller Badge',
      description: 'Build trust and credibility with customers',
    },
    {
      icon: <FiTrendingUp />,
      title: 'Grow Your Business',
      description: 'Reach thousands of luxury customers worldwide',
    },
    {
      icon: <FiTruck />,
      title: 'Easy Shipping & Logistics',
      description: 'Focus on creating while we handle shipping',
    },
    {
      icon: <FiUsers />,
      title: 'Dedicated Support',
      description: 'Get 24/7 support from our expert team',
    },
    {
      icon: <FiAward />,
      title: 'Marketing & Promotion',
      description: 'We promote your products to the right audience',
    },
    {
      icon: <FiCheckCircle />,
      title: 'Secure Payments',
      description: 'Get paid securely and on time every sale',
    }
  ], []);

  const benefits = useMemo(() => [
    'Premium luxury customer base access',
    'Zero monthly subscription fees',
    'Competitive commission rates',
    'Professional storefront design',
    'Advanced analytics dashboard',
    'Priority customer support',
    'Marketing & promotional opportunities',
    'Secure & timely payments'
  ], []);

  const trustBadges = useMemo(() => [
    { icon: <FiShield />, label: '100% Secure' },
    { icon: <FiGlobe />, label: 'Global Reach' },
    { icon: <FiClock />, label: '24/7 Support' },
    { icon: <FiThumbsUp />, label: '98% Satisfaction' }
  ], []);

  const steps = useMemo(() => [
    { number: '1', title: 'Register', desc: 'Create your seller account' },
    { number: '2', title: 'Verify', desc: 'Submit your business documents' },
    { number: '3', title: 'Get Approved', desc: 'Our team reviews your application' },
    { number: '4', title: 'Start Selling', desc: 'List and sell to luxury customers' }
  ], []);

  const stats = useMemo(() => [
    { number: '500+', label: 'Active Sellers' },
    { number: '10K+', label: 'Products Sold' },
    { number: '98%', label: 'Satisfaction Rate' }
  ], []);

  // Marquee items with Indian prices (₹)
  const marqueeItems = useMemo(() => [
    { title: 'Luxury Jewelry', price: '₹1,990', tag: 'Hua Shitopeng' },
    { title: 'Lighting - Jewellery', price: '₹5,500', tag: 'Outepia Luxury Prodi' },
    { title: 'Sing Enurumual', price: '₹5,000', tag: 'Heetish 434 Premium' },
    { title: 'Shopy likeprepl', price: '₹12,000', tag: 'Luxers' },
    { title: 'Aislyp Chest Eiffel', price: '₹12,000', tag: 'Premium' },
    { title: 'Chopy Product Thents', price: '₹12,000', tag: 'Luxury' },
  ], []);

  // Handle navigation
  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  return (
    <>
    <div className={styles.page}>
      <div className={styles.contentWrapper}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>
              <FaGem className={styles.badgeIcon} /> Become a Partner
            </span>
            <h1 className={styles.heroTitle}>
              Join Aurevian as a <br />
              <span className={styles.highlight}>Seller Partner</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Showcase your exquisite jewellery to a global audience of luxury enthusiasts. 
              Start selling on Aurevian and grow your business with us.
            </p>
            <div className={styles.heroButtons}>
              <button 
                onClick={() => handleNavigate('/seller/register')} 
                className={styles.primaryBtn}
              >
                Get Started Now <FiArrowRight />
              </button>
              <Link to="/seller/login" className={styles.secondaryBtn}>
                Already a Partner? Login
              </Link>
            </div>
            <div className={styles.heroStats}>
              {stats.map((stat, index) => (
                <div key={index} className={styles.stat}>
                  <span className={styles.statNumber}>{stat.number}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.heroImage}>
            <img 
              src={Contactimg} 
              alt="Luxury Jewellery" 
              className={styles.heroImageImg} 
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>

        {/* Trust Badges */}
        <section className={styles.trustBadges}>
          {trustBadges.map((badge, index) => (
            <div key={index} className={styles.trustBadge}>
              <div className={styles.trustBadgeIcon}>{badge.icon}</div>
              <span>{badge.label}</span>
            </div>
          ))}
        </section>

        {/* Features - Why Partner with Us */}
        <section className={styles.features}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>✦ Why Partner with Us</span>
            <h2>Everything You Need to Succeed</h2>
            <p>Designed for jewellery sellers who want to scale their business</p>
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

        {/* Marquee Section - Auto Scroll Right to Left */}
        <section className={styles.marqueeSection}>
          <div className={styles.marqueeContainer}>
            <div className={styles.marqueeTrack}>
              {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => (
                <div key={index} className={styles.marqueeCard}>
                  <div className={styles.marqueeCardContent}>
                    <FaGem className={styles.marqueeIcon} />
                    <h4>{item.title}</h4>
                    <p className={styles.marqueeTag}>{item.tag}</p>
                    <span className={styles.marqueePrice}>{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section with New Image */}
        <section className={styles.benefits}>
          <div className={styles.benefitsContent}>
            <div className={styles.benefitsLeft}>
              <span className={styles.badge}>
                <FiHeart className={styles.badgeIcon} /> Benefits
              </span>
              <h2>Why Sellers Love Aurevian</h2>
              <p>
                Join hundreds of successful jewellery sellers who have grown their 
                business with Aurevian. Here's what you get:
              </p>
              <ul className={styles.benefitsList}>
                {benefits.map((benefit, index) => (
                  <li key={index}>
                    <FiCheckCircle className={styles.benefitCheck} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.benefitsCta}>
                <button 
                  onClick={() => handleNavigate('/seller/register')} 
                  className={styles.benefitsBtn}
                >
                  Start Selling Today <FiArrowRight />
                </button>
              </div>
            </div>
            <div className={styles.benefitsRight}>
              <div className={styles.benefitsImageWrapper}>
                <img 
                  src={B1Image} 
                  alt="Aurevian Luxury Collection" 
                  className={styles.benefitsImage}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>
                  <FiStar /><FiStar /><FiStar /><FiStar /><FiStar />
                </div>
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

        {/* How It Works */}
        <section className={styles.howItWorks}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>✦ Simple Process</span>
            <h2>How It Works</h2>
            <p>Get started in 4 simple steps</p>
          </div>
          <div className={styles.steps}>
            {steps.map((step, index) => (
              <div key={index} className={styles.step}>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepContent}>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <div className={styles.ctaBadge}>
              <FaGem className={styles.ctaGem} />
              <span>Limited Spots Available</span>
            </div>
            <h2>Ready to Start Your Journey?</h2>
            <p>
              Join Aurevian today and take your jewellery business to the next level.
              We're here to help you succeed.
            </p>
            <button 
              onClick={() => handleNavigate('/seller/register')} 
              className={styles.ctaBtn}
            >
              Get Started Now <FiArrowRight />
            </button>
            <p className={styles.ctaNote}>
              Already have an account? <Link to="/seller/login">Sign in here</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
          <Footer />
</>
  );
};

export default BecomePartner;