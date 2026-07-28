// src/Pages/Seller/BecomePartner.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
  FiThumbsUp,
  FiDollarSign,
  FiBarChart2,
  FiSmile,
  FiZap,
  FiLayers,
  FiEye
} from 'react-icons/fi';
import { FaGem } from 'react-icons/fa';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './BecomePartner.module.css';
import Contactimg from "../../assets/partner.png";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const BecomePartner = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);
  const stepsRef = useRef(null);
  const ctaRef = useRef(null);
  const testimonialRef = useRef(null);
  const featureCardsRef = useRef([]);
  const benefitItemsRef = useRef([]);
  const stepItemsRef = useRef([]);
  const statsItemsRef = useRef([]);
  const [animationsReady, setAnimationsReady] = useState(false);

  const features = [
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
  ];

  const benefits = [
    'Premium luxury customer base access',
    'Zero monthly subscription fees',
    'Competitive commission rates',
    'Professional storefront design',
    'Advanced analytics dashboard',
    'Priority customer support',
    'Marketing & promotional opportunities',
    'Secure & timely payments'
  ];

  const trustBadges = [
    { icon: <FiShield />, label: '100% Secure' },
    { icon: <FiGlobe />, label: 'Global Reach' },
    { icon: <FiClock />, label: '24/7 Support' },
    { icon: <FiThumbsUp />, label: '98% Satisfaction' }
  ];

  // Initialize animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Run animations when ready
  useEffect(() => {
    if (!animationsReady) return;

    // Kill all existing ScrollTriggers to prevent conflicts
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Refresh ScrollTrigger
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      // 1. Hero Section
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true
        }
      });

      // 2. Stats - Simple fade in (no number counting to avoid NaN)
      statsItemsRef.current.forEach((item, index) => {
        if (item) {
          gsap.from(item, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            delay: index * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 90%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true
            }
          });
        }
      });

      // 3. Features
      featureCardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.from(card, {
            opacity: 0,
            y: 40,
            duration: 0.6,
            delay: index * 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true
            }
          });
        }
      });

      // 4. Benefits
      gsap.from(benefitsRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: benefitsRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true
        }
      });

      // 5. Benefit Items
      benefitItemsRef.current.forEach((item, index) => {
        if (item) {
          gsap.from(item, {
            opacity: 0,
            x: -20,
            duration: 0.4,
            delay: index * 0.06,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 92%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true
            }
          });
        }
      });

      // 6. Testimonial
      gsap.from(testimonialRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: testimonialRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true
        }
      });

      // 7. Steps
      stepItemsRef.current.forEach((item, index) => {
        if (item) {
          gsap.from(item, {
            opacity: 0,
            y: 30,
            duration: 0.5,
            delay: index * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true
            }
          });
        }
      });

      // 8. CTA
      gsap.from(ctaRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true
        }
      });

      // 9. Hero Image Parallax
      const heroImg = heroRef.current?.querySelector('img');
      if (heroImg) {
        gsap.to(heroImg, {
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      }

      // Refresh ScrollTrigger after setup
      ScrollTrigger.refresh();

    }, []);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [animationsReady]);

  // Refresh on window resize
  useEffect(() => {
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero} ref={heroRef}>
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
            <Link to="/seller/register" className={styles.primaryBtn}>
              Get Started Now <FiArrowRight />
            </Link>
            <Link to="/seller/login" className={styles.secondaryBtn}>
              Already a Partner? Login
            </Link>
          </div>
          <div className={styles.heroStats}>
            {[
              { number: '500+', label: 'Active Sellers' },
              { number: '10K+', label: 'Products Sold' },
              { number: '98%', label: 'Satisfaction Rate' }
            ].map((stat, index) => (
              <div key={index} className={styles.stat} ref={(el) => (statsItemsRef.current[index] = el)}>
                <span className={styles.statNumber}>{stat.number}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.heroImage}>
          <img src={Contactimg} alt="Luxury Jewellery" className={styles.heroImageImg} />
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

      {/* Features */}
      <section className={styles.features} ref={featuresRef}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>✦ Why Partner with Us</span>
          <h2>Everything You Need to Succeed</h2>
          <p>Designed for jewellery sellers who want to scale their business</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={styles.featureCard}
              ref={(el) => (featureCardsRef.current[index] = el)}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className={styles.benefits}>
        <div className={styles.benefitsContent}>
          <div className={styles.benefitsLeft} ref={benefitsRef}>
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
                <li key={index} ref={(el) => (benefitItemsRef.current[index] = el)}>
                  <FiCheckCircle className={styles.benefitCheck} />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className={styles.benefitsCta}>
              <Link to="/seller/register" className={styles.benefitsBtn}>
                Start Selling Today <FiArrowRight />
              </Link>
            </div>
          </div>
          <div className={styles.benefitsRight}>
            <div className={styles.testimonialCard} ref={testimonialRef}>
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
          {[
            { number: '1', title: 'Register', desc: 'Create your seller account and tell us about your business' },
            { number: '2', title: 'Verify & Submit', desc: 'Submit your business documents for verification' },
            { number: '3', title: 'Get Approved', desc: 'Our team reviews and approves your application' },
            { number: '4', title: 'Start Selling', desc: 'List your products and start selling to luxury customers' }
          ].map((step, index) => (
            <div key={index} className={styles.step} ref={(el) => (stepItemsRef.current[index] = el)}>
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
      <section className={styles.cta} ref={ctaRef}>
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