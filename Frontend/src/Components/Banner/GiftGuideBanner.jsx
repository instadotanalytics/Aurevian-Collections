// src/Components/Banner/GiftGuideBanner.jsx

import React, { useState, useEffect, useRef } from "react";
import styles from "./GiftGuideBanner.module.css";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

const GiftGuideBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const autoPlayRef = useRef(null);

  // Static banners for frontend demo
  const staticBanners = [
    {
      _id: "1",
      title: "Perfect Gifts for Every Occasion",
      subtitle: "Find the ideal gift",
      subtext: "Curated collections for your loved ones",
      offer: "Gift Guide",
      image: {
        url: "https://i.pinimg.com/1200x/30/96/75/3096757dd278bf67181c5cfd50fc9bcf.jpg",
      },
      buttonText: "Explore Gifts",
      buttonLink: "/gifts",
      placement: "giftGuide",
      textColor: "white",
      textAlign: "right",
    },
    {
      _id: "2",
      title: "Luxury Gift Collection",
      subtitle: "For those who deserve the best",
      subtext: "Timeless pieces that tell a story",
      offer: "Luxury Selection",
      image: {
        url: "https://i.pinimg.com/1200x/a1/ec/77/a1ec770fb323250a52a5e76074015f99.jpg",
      },
      buttonText: "Shop Luxury Gifts",
      buttonLink: "/gifts/luxury",
      placement: "giftGuide",
      textColor: "dark",
      textAlign: "right",
    },
    {
      _id: "3",
      title: "Anniversary & Wedding Gifts",
      subtitle: "Celebrate love with elegance",
      subtext: "Handpicked for your special moments",
      offer: "Anniversary Collection",
      image: {
        url: "https://i.pinimg.com/1200x/57/8b/9c/578b9c84c818747af10b0eed35940944.jpg",
      },
      buttonText: "View Collection",
      buttonLink: "/gifts/anniversary",
      placement: "giftGuide",
      textColor: "dark",
      textAlign: "left",
    },
    {
      _id: "4",
      title: "Birthday Gift Ideas",
      subtitle: "Make their day unforgettable",
      subtext: "Unique pieces for every personality",
      offer: "Birthday Special",
      image: {
        url: "https://i.pinimg.com/1200x/fe/22/cb/fe22cbb464c016b582ac5d754cc1325d.jpg",
      },
      buttonText: "Find Birthday Gifts",
      buttonLink: "/gifts/birthday",
      placement: "giftGuide",
      textColor: "light",
      textAlign: "left",
    },
    // In the staticBanners array, update the fifth banner:
    {
      _id: "5",
      title: "Corporate Gifting",
      subtitle: "Impress with Sophistication",
      subtext: "Premium gifts for your clients", // Shortened
      offer: "Corporate Collection",
      image: {
        url: "https://i.pinimg.com/1200x/cb/a7/ac/cba7ac799d0958e903a3216352bad1cf.jpg",
      },
      buttonText: "Explore Corporate Gifts",
      buttonLink: "/gifts/corporate",
      placement: "giftGuide",
      textColor: "dark",
      textAlign: "left",
    },
  ];

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/banners/active?placement=giftGuide`,
        );
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setBanners(data.data);
        } else {
          setBanners(staticBanners);
        }
      } catch (err) {
        console.error("GiftGuideBanner fetch error:", err);
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
          backgroundImage: `url('https://i.pinimg.com/1200x/fe/5b/a2/fe5ba20cf268393a36c5b977498cc12e.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className={styles.content}>
          <span className={styles.eyebrow}>Gift Guide</span>
          <h2 className={styles.title}>Find the Perfect Gift</h2>
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerDot} />
            <span className={styles.dividerLine} />
          </div>
          <p className={styles.subtext}>
            Curated collections for every occasion
          </p>
          <a href="/gifts" className={styles.cta}>
            <span>Explore Gifts</span>
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
          const isWhiteText = banner.textColor === "white";
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
                  ${isDarkText ? styles.darkText : ""} 
                  ${isWhiteText ? styles.whiteText : ""} 
                  ${!isDarkText && !isWhiteText ? styles.lightText : ""}
                  ${isRightAligned ? styles.rightAligned : styles.leftAligned}`}
              >
                <span
                  className={`${styles.eyebrow} 
                  ${isDarkText ? styles.eyebrowDark : ""} 
                  ${isWhiteText ? styles.eyebrowWhite : ""} 
                  ${!isDarkText && !isWhiteText ? styles.eyebrowLight : ""}`}
                >
                  {banner.subtitle || "Gift Guide"}
                </span>

                <h2
                  className={`${styles.title} 
                  ${isDarkText ? styles.titleDark : ""} 
                  ${isWhiteText ? styles.titleWhite : ""} 
                  ${!isDarkText && !isWhiteText ? styles.titleLight : ""}`}
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
                    ${isDarkText ? styles.dividerLineDark : ""} 
                    ${isWhiteText ? styles.dividerLineWhite : ""} 
                    ${!isDarkText && !isWhiteText ? styles.dividerLineLight : ""}`}
                  />
                  <span
                    className={`${styles.dividerDot} 
                    ${isDarkText ? styles.dividerDotDark : ""} 
                    ${isWhiteText ? styles.dividerDotWhite : ""} 
                    ${!isDarkText && !isWhiteText ? styles.dividerDotLight : ""}`}
                  />
                  <span
                    className={`${styles.dividerLine} 
                    ${isDarkText ? styles.dividerLineDark : ""} 
                    ${isWhiteText ? styles.dividerLineWhite : ""} 
                    ${!isDarkText && !isWhiteText ? styles.dividerLineLight : ""}`}
                  />
                </div>

                {banner.subtext && (
                  <p
                    className={`${styles.subtext} 
                    ${isDarkText ? styles.subtextDark : ""} 
                    ${isWhiteText ? styles.subtextWhite : ""} 
                    ${!isDarkText && !isWhiteText ? styles.subtextLight : ""}`}
                  >
                    {banner.subtext}
                  </p>
                )}
                {banner.offer && (
                  <p
                    className={`${styles.offer} 
                    ${isDarkText ? styles.offerDark : ""} 
                    ${isWhiteText ? styles.offerWhite : ""} 
                    ${!isDarkText && !isWhiteText ? styles.offerLight : ""}`}
                  >
                    {banner.offer}
                  </p>
                )}

                <a
                  href={banner.buttonLink || "/gifts"}
                  className={`${styles.cta} 
                  ${isDarkText ? styles.ctaDark : ""} 
                  ${isWhiteText ? styles.ctaWhite : ""} 
                  ${!isDarkText && !isWhiteText ? styles.ctaLight : ""}`}
                >
                  <span>{banner.buttonText || "Explore Gifts"}</span>
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

export default GiftGuideBanner;
