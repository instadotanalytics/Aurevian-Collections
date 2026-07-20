// src/Pages/Home/HomeBanner/HomeBanner.jsx

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchActiveBanners } from "../../redux/slices/bannerSlice";
import styles from "./HomeBanner.module.css";

const HomeBanner = () => {
  const dispatch = useDispatch();
  const { activeBanners, isLoading, error } = useSelector((state) => state.banners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoPlayRef = useRef(null);

  // Fetch active banners on mount
  useEffect(() => {
    dispatch(fetchActiveBanners());
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('📊 Active Banners Updated:', activeBanners);
    console.log('📊 Number of banners:', activeBanners?.length || 0);
  }, [activeBanners]);

  // Auto-play functionality
  const startTimer = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    if (activeBanners && activeBanners.length > 1) {
      autoPlayRef.current = setInterval(() => {
        handleNext();
      }, 6000);
    }
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [activeBanners]);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setCurrentIndex((prev) => 
      prev === 0 ? activeBanners.length - 1 : prev - 1
    );
    startTimer();
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setCurrentIndex((prev) => 
      (prev + 1) % activeBanners.length
    );
    startTimer();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.bannerContainer}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading banners...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error('Banner Error:', error);
    return (
      <div className={styles.bannerContainer}>
        <div className={styles.emptyState}>
          <p>Error loading banners. Please try again.</p>
          <button onClick={() => dispatch(fetchActiveBanners())}>Retry</button>
        </div>
      </div>
    );
  }

  // Empty state - Show placeholder banner
  if (!activeBanners || activeBanners.length === 0) {
    return (
      <div className={styles.bannerContainer}>
        <div className={styles.slide} style={{
          backgroundImage: `linear-gradient(to right, rgba(244,249,246,0.96) 28%, rgba(244,249,246,0.70) 45%, rgba(244,249,246,0.15) 70%, rgba(244,249,246,0) 100%), url('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80')`,
          opacity: 1,
          visibility: 'visible',
        }}>
          <div className={styles.contentWrapper}>
            <span className={styles.brandTag}>— FINE JEWELLERY, FOREVER —</span>
            <h2 className={styles.title}>Welcome to Aurevian Collections</h2>
            <p className={styles.subtitle}>Luxury Jewellery for Every Occasion</p>
            <h1 className={styles.offerHighlight}>Flat 15% OFF</h1>
            <p className={styles.subtext}>on your first purchase</p>
            <button className={styles.shopBtn} onClick={() => window.location.href = '/shop'}>
              SHOP NOW
              <span className={styles.arrowIcon}>
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                  <path d="M12 1L17 6M17 6L12 11M17 6H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bannerContainer}>
      {activeBanners.map((slide, index) => {
        const isActive = index === currentIndex;

        return (
          <div
            key={slide._id}
            className={`${styles.slide} ${isActive ? styles.activeSlide : ""}`}
            style={{
              backgroundImage: `linear-gradient(
                to right,
                rgba(244,249,246,0.96) 28%,
                rgba(244,249,246,0.70) 45%,
                rgba(244,249,246,0.15) 70%,
                rgba(244,249,246,0) 100%
              ), url(${slide.image?.url || slide.image})`,
              // ✅ Removed transform for parallax effect
            }}
          >
            <div
              className={`${styles.contentWrapper} ${isActive ? styles.showContent : ""}`}
            >
              <span className={styles.brandTag}>
                — FINE JEWELLERY, FOREVER —
              </span>

              <h2 className={styles.title}>
                {slide.title?.split(" ").map((word, i) => (
                  <span key={i} className={styles.wordWrapper}>
                    <span
                      className={styles.animatedWord}
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      {word}&nbsp;
                    </span>
                  </span>
                ))}
              </h2>

              {slide.subtitle && (
                <p className={styles.subtitle}>{slide.subtitle}</p>
              )}
              
              {slide.offer && (
                <h1 className={styles.offerHighlight}>{slide.offer}</h1>
              )}
              
              {slide.subtext && (
                <p className={styles.subtext}>{slide.subtext}</p>
              )}

              <button 
                className={styles.shopBtn}
                onClick={() => {
                  if (slide.buttonLink) {
                    window.location.href = slide.buttonLink;
                  }
                }}
              >
                {slide.buttonText || 'SHOP NOW'}
                <span className={styles.arrowIcon}>
                  <svg
                    width="18"
                    height="12"
                    viewBox="0 0 18 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 1L17 6M17 6L12 11M17 6H1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        );
      })}

      {/* Navigation Buttons */}
      {activeBanners && activeBanners.length > 1 && (
        <>
          <button
            className={`${styles.navArrowButton} ${styles.leftArrow}`}
            onClick={handlePrev}
            aria-label="Previous Slide"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            className={`${styles.navArrowButton} ${styles.rightArrow}`}
            onClick={handleNext}
            aria-label="Next Slide"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className={styles.dotsContainer}>
            {activeBanners.map((_, index) => (
              <button
                key={index}
                className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomeBanner;