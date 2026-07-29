// src/Components/Banner/OffersBanner.jsx

import React, { useState, useEffect, useRef } from "react";
import styles from "./OffersBanner.module.css";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

const OffersBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const autoPlayRef = useRef(null);

  // Static banners for frontend demo
  const staticBanners = [
    {
      _id: "1",
      title: "Exclusive Offers",
      subtitle: "Limited Time Only",
      subtext: "Discover our curated collection of luxury jewelry",
      offer: "Up to 40% Off on Selected Pieces",
      image: {
        url: "https://i.pinimg.com/1200x/9e/59/fc/9e59fcb67c7f265ee6ab76c57df94d19.jpg",
      },
      buttonText: "Explore Collection",
      buttonLink: "/offers",
      placement: "offers",
    },
    {
      _id: "2",
      title: "Silver Collection",
      subtitle: "Adira Silver Jewellery",
      subtext: "Timeless silver pieces for every occasion",
      offer: "New Arrivals Weekly",
      image: {
        url: "https://i.pinimg.com/1200x/f9/c8/29/f9c829e8ffdabb1c08093fcf1e63861e.jpg",
      },
      buttonText: "Explore Silver",
      buttonLink: "/offers/silver",
      placement: "offers",
    },
    {
      _id: "3",
      title: "Golden Elegance",
      subtitle: "Luxury Gold Collection",
      subtext: "Crafted with precision and passion",
      offer: "Exclusive Gold Pieces",
      image: {
        url: "https://i.pinimg.com/736x/01/6b/d7/016bd70af4047b53b46047f9388da767.jpg",
      },
      buttonText: "View Gold Collection",
      buttonLink: "/offers/gold",
      placement: "offers",
    },
    {
      _id: "4",
      title: "Diamond Brilliance",
      subtitle: "Radiant Diamond Collection",
      subtext: "For your most memorable moments",
      offer: "Luxury Diamonds",
      image: {
        url: "https://i.pinimg.com/1200x/ad/d5/5a/add55a844907ba87d682e719a4d48dab.jpg",
      },
      buttonText: "Explore Diamonds",
      buttonLink: "/offers/diamonds",
      placement: "offers",
    },
  ];

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`${API_BASE}/banners/active?placement=offers`);
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setBanners(data.data);
        } else {
          setBanners(staticBanners);
        }
      } catch (err) {
        console.error("OffersBanner fetch error:", err);
        setBanners(staticBanners);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanner();
  }, []);

  // Auto-play functionality
  const startTimer = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    if (banners && banners.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5500);
    }
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [banners]);

  if (isLoading) {
    return <div className={styles.skeletonBanner} />;
  }

  const activeBanners = banners && banners.length > 0 ? banners : staticBanners;
  const total = activeBanners.length;

  return (
    <section className={styles.offersSection}>
      <div className={styles.bannerWrapper}>
        <div className={styles.bannerContainer}>
          {activeBanners.map((banner, index) => {
            const isActive = index === currentIndex;

            return (
              <div
                key={banner._id || index}
                className={`${styles.slide} ${isActive ? styles.activeSlide : ""}`}
              >
                <div
                  className={styles.slideBg}
                  style={{ backgroundImage: `url(${banner.image?.url})` }}
                />

                {/* Corner appraisal marks */}
                <div className={styles.cornerMarks} aria-hidden="true">
                  <span className={styles.cornerTL} />
                  <span className={styles.cornerTR} />
                  <span className={styles.cornerBL} />
                  <span className={styles.cornerBR} />
                </div>

                {/* Content Card */}
                <div
                  className={`${styles.card} ${isActive ? styles.showCard : ""}`}
                >
                  <span className={styles.eyebrow}>
                    {banner.subtitle || "Special Offer"}
                  </span>

                  <h2 className={styles.title}>
                    {banner.title?.split(" ").map((word, i) => (
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

                  <div className={styles.divider}>
                    <span className={styles.dividerLine} />
                    <span className={styles.dividerDot} />
                  </div>

                  {banner.subtext && (
                    <p className={styles.subtext}>{banner.subtext}</p>
                  )}
                  {banner.offer && (
                    <p className={styles.offer}>{banner.offer}</p>
                  )}

                  <a
                    href={banner.buttonLink || "/offers"}
                    className={styles.cta}
                  >
                    <span>{banner.buttonText || "Explore Collection"}</span>
                    <svg width="16" height="12" viewBox="0 0 18 12" fill="none">
                      <path
                        d="M12 1L17 6M17 6L12 11M17 6H1"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}

          {/* Dots Navigation */}
          {total > 1 && (
            <div className={styles.dotsContainer}>
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ""}`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OffersBanner;
