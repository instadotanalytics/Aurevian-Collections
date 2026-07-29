// src/Components/ShopTheLook/ShopTheLook.jsx

import React, { useEffect, useRef, useState } from "react";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import styles from "./ShopTheLook.module.css";

// ==========================================================
// REEL DATA — paste your real video link into each `video`
// field below. All reels autoplay and loop continuously.
// ==========================================================
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
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <FiVolumeX size={13} /> : <FiVolume2 size={13} />}
        </button>

        <div className={styles.bottomGradient} aria-hidden="true" />

        <a
          href={`/product/${reel.id}`}
          className={styles.productTag}
          onClick={(e) => e.stopPropagation()}
        >
          <span className={styles.productName}>{reel.name}</span>
          <span className={styles.productPrice}>₹{reel.price.toLocaleString("en-IN")}</span>
        </a>
      </div>
    </div>
  );
}

export default function ShopTheLook() {
  const videoRefs = useRef({});
  const [mutedMap, setMutedMap] = useState({});

  // Make sure every reel actually starts playing as soon as it mounts —
  // browsers allow autoplay reliably only when muted, which is the
  // default state here anyway.
  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      video?.play().catch(() => {});
    });
  }, []);

  const toggleMute = (id) => {
    setMutedMap((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  return (
    <section className={styles.section} aria-labelledby="shop-the-look-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.topText}>✦ SHOP THE LOOK ✦</p>
          <h2 id="shop-the-look-heading" className={styles.heading}>
            Watch &amp; Shop
          </h2>
        </div>

        <div className={styles.grid}>
          {REELS.map((reel) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              isMuted={mutedMap[reel.id] ?? true}
              onToggleMute={toggleMute}
              videoRef={(el) => (videoRefs.current[reel.id] = el)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}