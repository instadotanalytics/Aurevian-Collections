// src/Components/Banner/NewArrivalsBanner.jsx

import React, { useState, useEffect, useRef } from "react";
import styles from "./NewArrivalsBanner.module.css";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

const NewArrivalsBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const autoPlayRef = useRef(null);

  // Static banners for frontend demo
  const staticBanners = [
    {
      _id: "1",
      title: "New Arrivals Dropping Daily",
      subtitle: "Monday through Friday",
      subtext: "Explore the Latest Launches Now!",
      offer: "500+ New Items",
      image: {
        url: "https://i.pinimg.com/1200x/97/01/22/970122a3cac03bfea644a03a90443bca.jpg",
      },
      buttonText: "Shop New Arrivals",
      buttonLink: "/shop",
      placement: "newArrivals",
      textColor: "dark",
      textAlign: "left",
    },
    {
      _id: "2",
      title: "Festival of Diamonds",
      subtitle: "Designs crafted for natural diamonds",
      subtext: "to sparkle the brightest",
      offer: "Limited Edition",
      image: {
        url: "https://i.pinimg.com/1200x/fe/5b/a2/fe5ba20cf268393a36c5b977498cc12e.jpg",
      },
      buttonText: "Explore Now",
      buttonLink: "/shop",
      placement: "newArrivals",
      textColor: "light",
      textAlign: "left",
    },
    {
      _id: "3",
      title: "Luxury Collection",
      subtitle: "Discover our premium selection",
      subtext: "",
      offer: "New Arrival",
      image: {
        url: "https://i.pinimg.com/1200x/33/11/29/3311298869cabc74336286a4f66cd79a.jpg",
      },
      buttonText: "View Collection",
      buttonLink: "/shop",
      placement: "newArrivals",
      textColor: "dark",
      textAlign: "left",
    },
    {
      _id: "4",
      title: "Elegant Evening Collection",
      subtitle: "Timeless designs for special moments",
      subtext: "Crafted with precision and passion",
      offer: "Premium Selection",
      image: {
        url: "https://i.pinimg.com/1200x/1b/7e/37/1b7e3775dd9d353ad275e7f38c8c0404.jpg",
      },
      buttonText: "Discover Collection",
      buttonLink: "/shop",
      placement: "newArrivals",
      textColor: "light",
      textAlign: "left",
    },
    {
      _id: "5",
      title: "Bridal Luxe Collection",
      subtitle: "For your most memorable day",
      subtext: "Exclusive designs for the modern bride",
      offer: "Bridal Collection",
      image: {
        url: "https://i.pinimg.com/1200x/8f/d6/09/8fd60934470252379a882695dde64fc1.jpg",
      },
      buttonText: "Explore Bridal",
      buttonLink: "/shop",
      placement: "newArrivals",
      textColor: "light", // Changed to light for better visibility
      textAlign: "right",
    },
  ];

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/banners/active?placement=newArrivals`,
        );
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setBanners(data.data);
        } else {
          setBanners(staticBanners);
        }
      } catch (err) {
        console.error("NewArrivalsBanner fetch error:", err);
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
      }, 5000);
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
    return <div className={`${styles.banner} ${styles.skeletonBanner}`} />;
  }

  if (!banners || banners.length === 0) {
    return (
      <section
        className={styles.banner}
        style={{
          backgroundImage: `url('https://i.pinimg.com/736x/d2/9f/4e/d29f4ed60c10a0752eb3f321839eaf6b.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className={styles.content}>
          <span className={styles.eyebrow}>New Arrivals</span>
          <h2 className={styles.title}>Fresh Designs, Daily</h2>
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerDot} />
            <span className={styles.dividerLine} />
          </div>
          <p className={styles.subtext}>
            New pieces added every week — explore what&apos;s just landed.
          </p>
          <a href="/shop" className={styles.cta}>
            <span>Explore now</span>
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
      </section>
    );
  }

  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.bannerContainer}>
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;
          const isDarkText = banner.textColor === "dark";
          const isRightAligned = banner.textAlign === "right";

          return (
            <div
              key={banner._id || index}
              className={`${styles.slide} ${isActive ? styles.activeSlide : ""}`}
              style={{
                backgroundImage: `url(${banner.image?.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div
                className={`${styles.content} ${isActive ? styles.showContent : ""} 
                  ${isDarkText ? styles.darkText : styles.lightText} 
                  ${isRightAligned ? styles.rightAligned : styles.leftAligned}`}
              >
                <span
                  className={`${styles.eyebrow} 
                  ${isDarkText ? styles.eyebrowDark : styles.eyebrowLight}`}
                >
                  {banner.subtitle || "New Arrivals"}
                </span>

                <h2
                  className={`${styles.title} 
                  ${isDarkText ? styles.titleDark : styles.titleLight}`}
                >
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
                  <span
                    className={`${styles.dividerLine} 
                    ${isDarkText ? styles.dividerLineDark : styles.dividerLineLight}`}
                  />
                  <span
                    className={`${styles.dividerDot} 
                    ${isDarkText ? styles.dividerDotDark : styles.dividerDotLight}`}
                  />
                  <span
                    className={`${styles.dividerLine} 
                    ${isDarkText ? styles.dividerLineDark : styles.dividerLineLight}`}
                  />
                </div>

                {banner.subtext && (
                  <p
                    className={`${styles.subtext} 
                    ${isDarkText ? styles.subtextDark : styles.subtextLight}`}
                  >
                    {banner.subtext}
                  </p>
                )}
                {banner.offer && (
                  <p
                    className={`${styles.offer} 
                    ${isDarkText ? styles.offerDark : styles.offerLight}`}
                  >
                    {banner.offer}
                  </p>
                )}

                <a
                  href={banner.buttonLink || "/shop"}
                  className={`${styles.cta} 
                  ${isDarkText ? styles.ctaDark : styles.ctaLight}`}
                >
                  <span>{banner.buttonText || "Explore Now"}</span>
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
      </div>

      {/* Dots Navigation */}
      {banners.length > 1 && (
        <div className={styles.dotsContainer}>
          {banners.map((_, index) => (
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
  );
};

export default NewArrivalsBanner;
