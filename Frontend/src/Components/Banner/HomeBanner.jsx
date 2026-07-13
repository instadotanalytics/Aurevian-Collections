import React, { useState, useEffect, useRef } from "react";
import styles from "./HomeBanner.module.css";

const BANNER_DATA = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
    title: "Free 9KT Gold Pendant",
    subtitle: "on order above ₹20,000",
    offer: "Flat 15% OFF",
    subtext: "on gold worth ₹20,000 or below",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80",
    title: "Bridal Collection 2026",
    subtitle: "Crafted for your special day",
    offer: "Exclusive Designs",
    subtext: "Explore premium handcrafted necklaces",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80",
    title: "Timeless Diamond Rings",
    subtitle: "Shine bright forever",
    offer: "Up to 20% OFF",
    subtext: "On diamond making charges",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80",
    title: "Royal Heritage Bangles",
    subtitle: "Tradition meets elegance",
    offer: "New Arrivals",
    subtext: "Limited edition luxury pieces available",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    title: "Minimalist Gold Chains",
    subtitle: "For everyday luxury lifestyle",
    offer: "Buy 2 Get 1 Free",
    subtext: "On selected minimalist accessories",
  },
];

const HomeBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const autoPlayRef = useRef(null);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX - window.innerWidth / 2) * 0.02;
    const y = (clientY - window.innerHeight / 2) * 0.02;
    setMouseCoords({ x, y });
  };

  const startTimer = () => {
    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 6000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(autoPlayRef.current);
  }, []);

  const handlePrev = (e) => {
    e.stopPropagation();
    clearInterval(autoPlayRef.current);
    setCurrentIndex((prev) => (prev === 0 ? BANNER_DATA.length - 1 : prev - 1));
    startTimer();
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    clearInterval(autoPlayRef.current);
    setCurrentIndex((prev) => (prev + 1) % BANNER_DATA.length);
    startTimer();
  };

  return (
    <div className={styles.bannerContainer} onMouseMove={handleMouseMove}>
      {BANNER_DATA.map((slide, index) => {
        const isActive = index === currentIndex;

        return (
          <div
            key={slide.id}
            className={`${styles.slide} ${isActive ? styles.activeSlide : ""}`}
            style={{
              backgroundImage: `linear-gradient(
                to right,
                rgba(244,249,246,0.96) 28%,
                rgba(244,249,246,0.70) 45%,
                rgba(244,249,246,0.15) 70%,
                rgba(244,249,246,0) 100%
              ), url(${slide.image})`,
              transform: isActive
                ? `translate(${mouseCoords.x}px, ${mouseCoords.y}px) scale(1.02)`
                : "translate(0px, 0px) scale(1)",
            }}
          >
            <div
              className={`${styles.contentWrapper} ${isActive ? styles.showContent : ""}`}
            >
              <span className={styles.brandTag}>
                — FINE JEWELLERY, FOREVER —
              </span>

              <h2 className={styles.title}>
                {slide.title.split(" ").map((word, i) => (
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

              <p className={styles.subtitle}>{slide.subtitle}</p>
              <h1 className={styles.offerHighlight}>{slide.offer}</h1>
              <p className={styles.subtext}>{slide.subtext}</p>

              <button className={styles.shopBtn}>
                SHOP NOW
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

      {/* Far Left and Far Right Corner Navigation Buttons */}
      <button
        className={`${styles.navArrowButton} ${styles.leftArrow}`}
        onClick={handlePrev}
        aria-label="Previous Slide"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 19L8 12L15 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        className={`${styles.navArrowButton} ${styles.rightArrow}`}
        onClick={handleNext}
        aria-label="Next Slide"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 5L16 12L9 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default HomeBanner;
