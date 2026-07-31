// src/Components/ShopTheLook/ShopTheLook.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import styles from "./ShopTheLook.module.css";

// Import asset video
import homeVideo from "../../assets/videoforhomescreen.MP4";

const REELS = [
  {
    id: "r1",
    name: "Zircon Drop Earrings",
    price: 1499,
    video: "/IMG_1581.MP4",
  },
  {
    id: "r2",
    name: "Kundan Choker Necklace",
    price: 3299,
    video: "/IMG_1582.MP4",
  },
  {
    id: "r3",
    name: "Rose Gold Band Ring",
    price: 999,
    video: "/IMG_1583.MP4",
  },
  {
    id: "r4",
    name: "Pearl Charm Bracelet",
    price: 1799,
    video: "/IMG_1584.MP4",
  },
  {
    id: "r5",
    name: "Aurevian Collection",
    price: 1999,
    video: homeVideo,
  },
 
 
];

function ReelCard({ reel, isMuted, onToggleMute, videoRef }) {
  return (
    <div className={styles.card}>
      <div className={styles.mediaWrap}>
        <video
          ref={videoRef}
          className={styles.video}
          src={reel.video}
          muted={isMuted}
          autoPlay
          loop
          playsInline
          preload="auto"
        />

        <button
          type="button"
          className={styles.muteBtn}
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute(reel.id);
          }}
        >
          {isMuted ? <FiVolumeX size={13} /> : <FiVolume2 size={13} />}
        </button>

        <div className={styles.bottomGradient} />

        <Link
          to={`/product/${reel.id}`}
          className={styles.productTag}
          onClick={(e) => e.stopPropagation()}
        >
          <span className={styles.productName}>{reel.name}</span>
          <span className={styles.productPrice}>
            ₹{reel.price.toLocaleString("en-IN")}
          </span>
        </Link>

        <div className={styles.shopBadge}>
          <span>Shop Now</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function ShopTheLook() {
  const videoRefs = useRef({});
  const [mutedMap, setMutedMap] = useState({});
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = true;
        video.play().catch(() => {});
      }
    });
  }, []);

  const toggleMute = (id) => {
    const video = videoRefs.current[id];
    if (!video) return;

    const newMuted = !video.muted;
    video.muted = newMuted;

    setMutedMap((prev) => ({
      ...prev,
      [id]: newMuted,
    }));
  };

  // Handle scroll arrows visibility
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 20);
    };

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section
      className={styles.section}
      aria-labelledby="shop-the-look-heading"
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.topText}>✦ SHOP THE LOOK ✦</p>
          <h2 id="shop-the-look-heading" className={styles.heading}>
            Watch & Shop
          </h2>
          <p className={styles.subText}>
            Scroll horizontally to explore our collection
          </p>
        </div>

        <div className={styles.scrollWrapper}>
          {/* Left Arrow */}
          {showLeftArrow && (
            <button 
              className={`${styles.scrollArrow} ${styles.scrollArrowLeft}`}
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <button 
              className={`${styles.scrollArrow} ${styles.scrollArrowRight}`}
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          )}

          <div 
            className={styles.grid} 
            ref={scrollContainerRef}
          >
            {REELS.map((reel) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                isMuted={mutedMap[reel.id] ?? true}
                onToggleMute={toggleMute}
                videoRef={(el) => {
                  if (el) {
                    videoRefs.current[reel.id] = el;
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Scroll Progress Indicator */}
        <div className={styles.scrollProgress}>
          <div className={styles.progressBar} />
        </div>
      </div>
    </section>
  );
}