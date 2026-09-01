// src/Components/common/HomePageSkeleton/HomePageSkeleton.jsx
//
// Loading-state stand-in for the Home Page shell (Header + HomeBanner +
// ShopByCategory + Offers + OffersBanner + GiftGuide + GiftGuideBanner +
// ShopCardCategory + NewArrivalsBanner + NewCollections + ShopTheLook +
// Footer), matching Home.jsx's actual section order.
//
// This only covers the loading gap BEFORE Home.jsx mounts (the app-level
// auth-check in App.jsx). Once Home.jsx is mounted, every section already
// has its own real skeleton (Offers/GiftGuide/ShopCardCategory/
// NewCollections SkeletonCard, HomeBanner/OffersBanner/etc. loadingOverlay)
// that takes over per-section loading — this component does not replace
// or duplicate those.

import React from "react";
import styles from "./HomePageSkeleton.module.css";

// ============================================
// PRIMITIVES
// ============================================

const ShimmerBar = ({ className = "", style }) => (
  <span
    className={`${styles.shimmer} ${className}`}
    style={style}
    aria-hidden="true"
  />
);

// ============================================
// HEADER BAR
// ============================================
function HeaderBarSkeleton() {
  return (
    <div className={styles.headerBar} aria-hidden="true">
      <div className={styles.headerInner}>
        <ShimmerBar className={styles.headerLogo} />
        <div className={styles.headerNavGroup}>
          <ShimmerBar className={styles.headerNavItem} />
          <ShimmerBar className={styles.headerNavItem} />
          <ShimmerBar className={styles.headerNavItem} />
          <ShimmerBar className={styles.headerNavItem} />
        </div>
        <div className={styles.headerIconGroup}>
          <ShimmerBar className={styles.headerIcon} />
          <ShimmerBar className={styles.headerIcon} />
          <ShimmerBar className={styles.headerIcon} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// HERO (matches HomeBanner's height steps)
// ============================================
function HeroSkeleton() {
  return (
    <div className={styles.hero} aria-hidden="true">
      <div className={styles.heroContent}>
        <ShimmerBar className={styles.heroTag} />
        <ShimmerBar className={styles.heroTitle} />
        <ShimmerBar className={styles.heroSubtitle} />
        <ShimmerBar className={styles.heroOffer} />
        <ShimmerBar className={styles.heroSubtext} />
        <ShimmerBar className={styles.heroBtn} />
      </div>
      <div className={styles.heroDots}>
        <span className={styles.heroDot} />
        <span className={styles.heroDot} />
        <span className={styles.heroDot} />
      </div>
    </div>
  );
}

// ============================================
// SECTION TITLE (topText + heading + optional divider)
// ============================================
function SectionTitleSkeleton({ align = "center", withDivider = true }) {
  return (
    <div
      className={`${styles.sectionTitle} ${align === "left" ? styles.titleLeft : ""}`}
      aria-hidden="true"
    >
      <ShimmerBar className={styles.titleTag} />
      <ShimmerBar className={styles.titleHeading} />
      {withDivider && <ShimmerBar className={styles.titleDivider} />}
    </div>
  );
}

// ============================================
// FULL-WIDTH PROMO BANNER (Offers/GiftGuide/NewArrivals banners)
// ============================================
function PromoBannerSkeleton() {
  return (
    <div className={styles.bannerWrap} aria-hidden="true">
      <ShimmerBar className={styles.bannerBlock} />
    </div>
  );
}

// ============================================
// CARD SHAPES — one shared shimmer block per real card style
// ============================================
function CategoryCardSkeleton() {
  return (
    <div className={styles.categoryCard} aria-hidden="true">
      <ShimmerBar className={styles.categoryCircle} />
      <ShimmerBar className={styles.categoryLabel} />
    </div>
  );
}

function ProductCardSkeleton({ shape = "rect" }) {
  const shapeClass =
    shape === "arch"
      ? styles.cardArch
      : shape === "medallion"
        ? styles.cardMedallion
        : shape === "shield"
          ? styles.cardShield
          : styles.cardRect;
  return (
    <div className={`${styles.productCard} ${shapeClass}`} aria-hidden="true">
      <ShimmerBar className={styles.productImage} />
      <div className={styles.productLines}>
        <ShimmerBar className={styles.productLineWide} />
        <ShimmerBar className={styles.productLineNarrow} />
      </div>
    </div>
  );
}

function ReelCardSkeleton() {
  return (
    <div className={styles.reelCard} aria-hidden="true">
      <ShimmerBar className={styles.reelBlock} />
    </div>
  );
}

// ============================================
// HORIZONTAL ROW — overflow hidden, no scrollbar; CSS breakpoints shrink
// card width so fewer are visible on smaller screens, same technique the
// real horizontal-scroll sections use (no JS-computed counts needed).
// ============================================
function CardRow({ children, className = "" }) {
  return (
    <div className={`${styles.cardRow} ${className}`} aria-hidden="true">
      {children}
    </div>
  );
}

function FooterSkeleton() {
  return (
    <div className={styles.footer} aria-hidden="true">
      <div className={styles.footerColumns}>
        {Array.from({ length: 4 }, (_, i) => (
          <div className={styles.footerColumn} key={i}>
            <ShimmerBar className={styles.footerHeading} />
            <ShimmerBar className={styles.footerLine} />
            <ShimmerBar className={styles.footerLine} />
            <ShimmerBar className={styles.footerLineShort} />
          </div>
        ))}
      </div>
      <ShimmerBar className={styles.footerRule} />
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function HomePageSkeleton() {
  return (
    <div
      className={styles.page}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className={styles.srOnly}>Loading Aurevian Collections…</span>

      <HeaderBarSkeleton />

      {/* HomeBanner */}
      <HeroSkeleton />

      {/* ShopByCategory */}
      <section className={styles.section}>
        <SectionTitleSkeleton />
        <CardRow className={styles.rowCategory}>
          {Array.from({ length: 8 }, (_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </CardRow>
      </section>

      {/* Offers ("Specially Made") */}
      <section className={styles.section}>
        <SectionTitleSkeleton align="left" />
        <CardRow className={styles.rowShield}>
          {Array.from({ length: 6 }, (_, i) => (
            <ProductCardSkeleton key={i} shape="shield" />
          ))}
        </CardRow>
      </section>

      {/* OffersBanner */}
      <PromoBannerSkeleton />

      {/* GiftGuide ("Curated For You") */}
      <section className={styles.section}>
        <SectionTitleSkeleton />
        <CardRow className={styles.rowArch}>
          {Array.from({ length: 6 }, (_, i) => (
            <ProductCardSkeleton key={i} shape="arch" />
          ))}
        </CardRow>
      </section>

      {/* GiftGuideBanner */}
      <PromoBannerSkeleton />

      {/* ShopCardCategory ("Trending Picks") */}
      <section className={styles.section}>
        <SectionTitleSkeleton />
        <CardRow className={styles.rowRect}>
          {Array.from({ length: 6 }, (_, i) => (
            <ProductCardSkeleton key={i} shape="rect" />
          ))}
        </CardRow>
      </section>

      {/* NewArrivalsBanner */}
      <PromoBannerSkeleton />

      {/* NewCollections */}
      <section className={styles.section}>
        <SectionTitleSkeleton align="left" />
        <CardRow className={styles.rowMedallion}>
          {Array.from({ length: 6 }, (_, i) => (
            <ProductCardSkeleton key={i} shape="medallion" />
          ))}
        </CardRow>
      </section>

      {/* ShopTheLook */}
      <section className={styles.section}>
        <SectionTitleSkeleton />
        <CardRow className={styles.rowReel}>
          {Array.from({ length: 5 }, (_, i) => (
            <ReelCardSkeleton key={i} />
          ))}
        </CardRow>
      </section>

      <FooterSkeleton />
    </div>
  );
}
