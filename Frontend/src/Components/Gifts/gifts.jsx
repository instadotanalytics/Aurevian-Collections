import React from "react";
import styles from "./gifts.module.css";
import Header from "../../Pages/Layout/Header/Header";
import Footer from "../../Pages/Layout/Footer/Footer";

import solitaireBand from "../../assets/solitaire-band.jpg.jfif";
import layeredChain from "../../assets/layered-chain.jpg.jfif";
import dropStuds from "../../assets/drop-studs.jpg.jfif";
import charmBracelet from "../../assets/charm-bracelet.jpg.jfif";
import bridalJewelSet from "../../assets/bridal-jewel-set.jpg.jfif";
import hoopEarrings from "../../assets/hoop-earrings.jpg.jfif";
import pendantChain from "../../assets/pendant-chain.jpg.jfif";
import pearlStuds from "../../assets/pearl-studs.jpg.jfif";

import { FiGift } from "react-icons/fi";

const occasions = [
  { name: "Anniversary", icon: "💍" },
  { name: "Birthday", icon: "🎂" },
  { name: "Wedding", icon: "👰" },
  { name: "Valentine's Day", icon: "❤️" },
  { name: "Mother's Day", icon: "🌸" },
  { name: "Just Because", icon: "✨" },
];

const recipients = [
  { name: "For Her", icon: "👩" },
  { name: "For Him", icon: "🧑" },
  { name: "For Couples", icon: "💑" },
  { name: "For Kids", icon: "🧒" },
];

const budgets = [
  { label: "Under ₹1,000", value: "under-1000" },
  { label: "₹1,000 – ₹3,000", value: "1000-3000" },
  { label: "₹3,000 – ₹6,000", value: "3000-6000" },
  { label: "Above ₹6,000", value: "above-6000" },
];

const featuredGifts = [
  {
    id: 1,
    badge: "Gift Wrapped",
    name: "Aurevian Solitaire Band",
    priceNow: "₹2,100",
    priceOld: "₹3,000",
    image: solitaireBand,
  },
  {
    id: 2,
    badge: "Best Seller",
    name: "Layla Layered Chain",
    priceNow: "₹3,400",
    priceOld: "₹4,250",
    image: layeredChain,
  },
  {
    id: 3,
    badge: "Gift Wrapped",
    name: "Amara Drop Studs",
    priceNow: "₹1,650",
    priceOld: "₹2,200",
    image: dropStuds,
  },
  {
    id: 4,
    badge: "Trending",
    name: "Celeste Charm Bracelet",
    priceNow: "₹1,800",
    priceOld: "₹3,000",
    image: charmBracelet,
  },
  {
    id: 5,
    badge: "Premium Gift",
    name: "Anaya Bridal Jewel Set",
    priceNow: "₹6,300",
    priceOld: "₹7,000",
    image: bridalJewelSet,
  },
  {
    id: 6,
    badge: "Gift Wrapped",
    name: "Zoya Hoop Earrings",
    priceNow: "₹1,300",
    priceOld: "₹2,000",
    image: hoopEarrings,
  },
  {
    id: 7,
    badge: "Best Seller",
    name: "Ishani Pendant Chain",
    priceNow: "₹2,750",
    priceOld: "₹5,000",
    image: pendantChain,
  },
  {
    id: 8,
    badge: "Gift Wrapped",
    name: "Sana Pearl Studs",
    priceNow: "₹1,450",
    priceOld: "₹1,950",
    image: pearlStuds,
  },
];

const perks = [
  {
    icon: "🎁",
    title: "Free Gift Wrapping",
    text: "Every gift order wrapped at no extra cost",
  },
  {
    icon: "💌",
    title: "Personalised Note",
    text: "Add a free handwritten message card",
  },
  {
    icon: "🔄",
    title: "Easy Exchange",
    text: "Hassle-free exchange within 15 days",
  },
];

export default function Gifts() {
  return (
    <div className={styles.page}>
      {/* ================= HEADER ================= */}
      <Header />

      {/* ================= MAIN CONTENT ================= */}
      <div className={styles.mainContent}>
        {/* ================= HERO ================= */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.heroKicker}>
              <FiGift /> Gift Guide
            </span>
            <h1 className={styles.heroTitle}>The Gift Edit</h1>
            <p className={styles.heroSubtitle}>
              Thoughtfully chosen jewellery gifts for every person and every
              occasion — wrapped and ready to give.
            </p>
          </div>
        </section>

        {/* ================= SHOP BY OCCASION ================= */}
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>Shop by Occasion</h2>
            <p>Find the perfect piece for the moment that matters</p>
          </div>
          <div className={styles.occasionGrid}>
            {occasions.map((o) => (
              <a href="#" className={styles.occasionCard} key={o.name}>
                <span className={styles.occasionIcon}>{o.icon}</span>
                <span className={styles.occasionName}>{o.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* ================= SHOP BY RECIPIENT ================= */}
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>Shop by Recipient</h2>
            <p>Curated picks for everyone on your list</p>
          </div>
          <div className={styles.recipientGrid}>
            {recipients.map((r) => (
              <a href="#" className={styles.recipientCard} key={r.name}>
                <span className={styles.recipientIcon}>{r.icon}</span>
                <span className={styles.recipientName}>{r.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* ================= SHOP BY BUDGET ================= */}
        <section className={styles.section}>
         
          <div className={styles.budgetRow}>
            {budgets.map((b) => (
              <a href="#" className={styles.budgetPill} key={b.value}>
                {b.label}
              </a>
            ))}
          </div>
        </section>

        {/* ================= FEATURED GIFTS GRID ================= */}
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>Featured Gift Picks</h2>
            <p>Our most-loved pieces, ready to gift</p>
          </div>
          <div className={styles.productGrid}>
            {featuredGifts.map((p) => (
              <div className={styles.productCard} key={p.id}>
                <div className={styles.productMedia}>
                  <span className={styles.badge}>{p.badge}</span>
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className={styles.productImage}
                    />
                  ) : (
                    <span className={styles.placeholderLabel}>
                      Product Image
                    </span>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.productName}>{p.name}</div>
                  <div className={styles.productPrice}>
                    <span className={styles.priceNow}>{p.priceNow}</span>
                    <span className={styles.priceOld}>{p.priceOld}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= PERKS STRIP ================= */}
        <section className={styles.perks}>
          {perks.map((perk) => (
            <div className={styles.perk} key={perk.title}>
              <div className={styles.icon}>{perk.icon}</div>
              <div>
                <h4>{perk.title}</h4>
                <p>{perk.text}</p>
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
}