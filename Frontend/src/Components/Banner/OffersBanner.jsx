// src/Components/Banner/OffersBanner.jsx

import React, { useState, useEffect } from "react";
import styles from "./OffersBanner.module.css";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

const OffersBanner = () => {
  const [banner, setBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Static banner data
  const staticBanner = {
    _id: "1",
    title: "Exclusive Offers",
    subtitle: "Limited Time Only",
    subtext: "Discover our curated collection of luxury jewelry",
    offer: "Up to 40% Off on Selected Pieces",
    image: {
      url: "https://i.pinimg.com/736x/f8/2f/2d/f82f2de62fa0ecdb782a15261430098b.jpg",
    },
    buttonText: "Explore Collection",
    buttonLink: "/offers",
    placement: "offers",
  };

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`${API_BASE}/banners/active?placement=offers`);
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setBanner(data.data[0]);
        } else {
          setBanner(staticBanner);
        }
      } catch (err) {
        console.error("OffersBanner fetch error:", err);
        setBanner(staticBanner);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanner();
  }, []);

  if (isLoading) {
    return <div className={styles.skeletonBanner} />;
  }

  if (!banner) {
    return (
      <section className={styles.offersSection}>
        <div className={styles.bannerWrapper}>
          <div
            className={styles.bannerContainer}
            style={{
              backgroundImage: `url('https://i.pinimg.com/736x/13/31/d2/1331d205ba720d84c4b8e66f0e179311.jpg')`,
            }}
          >
            <div className={styles.decorativeBorder}></div>
            <div className={styles.contentWrapper}>
              <span className={styles.eyebrow}>✦ Special Offer ✦</span>
              <h2 className={styles.title}>Exclusive Collection</h2>
              <div className={styles.divider}>
                <span className={styles.dividerLine} />
                <span className={styles.dividerDot} />
                <span className={styles.dividerLine} />
              </div>
              <p className={styles.subtext}>
                Discover timeless elegance at exceptional prices
              </p>
              <p className={styles.offer}>Up to 40% Off</p>
              <a href="/offers" className={styles.cta}>
                <span>Explore Collection</span>
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
        </div>
      </section>
    );
  }

  return (
    <section className={styles.offersSection}>
      <div className={styles.bannerWrapper}>
        <div
          className={styles.bannerContainer}
          style={{
            backgroundImage: `url(${banner.image?.url})`,
          }}
        >
          {/* Decorative White Border */}
          <div className={styles.decorativeBorder}></div>

          {/* Main Content */}
          <div className={styles.contentWrapper}>
            <span className={styles.eyebrow}>
              ✦ {banner.subtitle || "Special Offer"} ✦
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
              <span className={styles.dividerLine} />
            </div>

            {banner.subtext && (
              <p className={styles.subtext}>{banner.subtext}</p>
            )}
            {banner.offer && <p className={styles.offer}>{banner.offer}</p>}

            <a href={banner.buttonLink || "/offers"} className={styles.cta}>
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
      </div>
    </section>
  );
};

export default OffersBanner;
