import React from "react";
import {
  FiShield,
  FiDroplet,
  FiHeart,
  FiRefreshCw,
  FiAward,
  FiPackage,
  FiArrowUpRight,
} from "react-icons/fi";
import styles from "./WhyAurevian.module.css";
import heroImage from "../../assets/HeroImage1.png";
import productImage from "../../assets/ProductImage.png";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";

// Comparison rows — real trade-offs a shopper is actually weighing,
// not filler bullet points. Aurevian is positioned as premium artificial
// (imitation) jewellery — not solid/real gold.
const comparison = [
  {
    id: "material",
    label: "What it's made of",
    mall: "Cheap alloy, thin plating",
    fine: "Solid gold, real gemstones",
    aurevian: "Premium gold-plated alloy, skin-safe",
  },
  {
    id: "durability",
    label: "Everyday wear",
    mall: "Fades and tarnishes in weeks",
    fine: "Built to last, but you'll still be careful with it",
    aurevian: "Anti-tarnish coating — shower, gym, everything",
  },
  {
    id: "price",
    label: "Price for a full edit",
    mall: "Cheap, but you'll rebuy every season",
    fine: "Real-gold prices, one piece at a time",
    aurevian: "A fraction of the cost — build a whole stack",
  },
  {
    id: "skin",
    label: "Sensitive skin",
    mall: "Often nickel, turns green",
    fine: "Safe, at a steep price",
    aurevian: "Hypoallergenic, nickel-free alloy",
  },
  {
    id: "warranty",
    label: "If something goes wrong",
    mall: "No warranty",
    fine: "Repairs, but pricey",
    aurevian: "1-year plating warranty",
  },
];

const reasons = [
  {
    id: "plating",
    icon: FiShield,
    title: "Premium gold-plated finish",
    copy: "A rich, even gold-tone plating over a skin-safe alloy base — made to look and catch light like fine jewellery, without the fine-jewellery price.",
  },
  {
    id: "water",
    icon: FiDroplet,
    title: "Water & sweat safe",
    copy: "Shower in it, work out in it, forget it's even there. It's built for your actual routine.",
  },
  {
    id: "skin",
    icon: FiHeart,
    title: "Hypoallergenic",
    copy: "Nickel-free and gentle on sensitive skin, so it stays comfortable through a full day of wear.",
  },
  {
    id: "resize",
    icon: FiRefreshCw,
    title: "Free resizing, 30 days",
    copy: "Rings that don't fit right get resized once, free, within your first month — no back-and-forth.",
  },
  {
    id: "warranty",
    icon: FiAward,
    title: "1-year plating warranty",
    copy: "If the plating wears thin within a year of normal wear, we replate or replace it, no questions asked.",
  },
  {
    id: "kit",
    icon: FiPackage,
    title: "Care kit included",
    copy: "Every order ships with a polishing cloth and a pouch, so keeping it looking new takes thirty seconds.",
  },
];

const promiseStats = [
  { id: "warranty", num: "1 Yr", label: "Plating warranty" },
  { id: "returns", num: "30 Day", label: "Free returns" },
  { id: "worn", num: "10K+", label: "Pieces worn daily" },
];

const sections = [
  { id: "difference", eyebrow: "The Difference" },
  { id: "reasons", eyebrow: "What You Get" },
  { id: "promise", eyebrow: "Our Promise" },
  { id: "quote", eyebrow: "In Her Words" },
];

const WhyAurevian = () => {
  return (
    <>
    <Header/>
    <main className={styles.page}>
      {/* ================= HERO ================= */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Why Aurevian</span>
          <h1 className={styles.heroTitle}>
            Jewellery that keeps up
            <br />
            with your actual life.
          </h1>
          <p className={styles.heroSub}>
            Not fast-fashion that fades, not fine jewellery you're scared to
            wear. Here's exactly what makes Aurevian different — and why it
            holds up.
          </p>
        </div>

        <img
          src={heroImage}
          alt="Aurevian jewellery, styled on a model"
          className={styles.heroImage}
        />
      </section>

      {/* ================= CHAIN-RAIL BODY ================= */}
      <div className={styles.chainBody}>
        {/* ---- The Difference (comparison table) ---- */}
        <div className={styles.chainRow}>
          <div className={styles.railCell}>
            <span className={styles.bead} />
          </div>
          <div className={styles.rowContent}>
            <span className={styles.eyebrowSmall}>{sections[0].eyebrow}</span>
            <h2 className={styles.h2}>How we actually compare</h2>
            <div className={styles.tableWrap}>
              <div className={`${styles.tableRow} ${styles.tableHeader}`}>
                <span></span>
                <span>Mall Jewellery</span>
                <span>Fine Jewellery</span>
                <span className={styles.tableHeaderHighlight}>Aurevian</span>
              </div>
              {comparison.map((row) => (
                <div className={styles.tableRow} key={row.id}>
                  <span className={styles.tableLabel}>{row.label}</span>
                  <span className={styles.tableCell}>{row.mall}</span>
                  <span className={styles.tableCell}>{row.fine}</span>
                  <span
                    className={`${styles.tableCell} ${styles.tableCellHighlight}`}
                  >
                    {row.aurevian}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- What You Get ---- */}
        <div className={styles.chainRow}>
          <div className={styles.railCell}>
            <span className={styles.bead} />
          </div>
          <div className={styles.rowContent}>
            <span className={styles.eyebrowSmall}>{sections[1].eyebrow}</span>
            <h2 className={styles.h2}>Six reasons it lasts</h2>
            <div className={styles.reasonsGrid}>
              {reasons.map(({ id, icon: Icon, title, copy }) => (
                <div className={styles.reasonCard} key={id}>
                  <Icon className={styles.reasonIcon} aria-hidden="true" />
                  <h3 className={styles.reasonTitle}>{title}</h3>
                  <p className={styles.reasonCopy}>{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Our Promise (dark, full-bleed) ---- */}
        <div className={styles.chainRow}>
          <div className={styles.railCell}>
            <span className={styles.bead} />
          </div>
          <div className={styles.rowContent}>
            <span className={styles.eyebrowSmall}>{sections[2].eyebrow}</span>
            <div className={styles.promisePanel}>
              <div className={styles.promiseText}>
                <h2 className={`${styles.h2} ${styles.h2Light}`}>
                  Wear it. If it lets you down, we'll fix it.
                </h2>
                <p className={styles.promiseCopy}>
                  Every piece leaves our workshop backed by a plating warranty,
                  not just a return window. If something's off, we make it right
                  — replate, resize, or replace.
                </p>
                <ul className={styles.promiseStats}>
                  {promiseStats.map(({ id, num, label }) => (
                    <li key={id}>
                      <span className={styles.promiseStatNum}>{num}</span>
                      <span className={styles.promiseStatLabel}>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <img
                src={productImage}
                alt="Aurevian jewellery, everyday wear"
                className={styles.promiseImage}
              />
            </div>
          </div>
        </div>

        {/* ---- In Her Words ---- */}
        <div className={`${styles.chainRow} ${styles.chainRowLast}`}>
          <div className={`${styles.railCell} ${styles.railCellLast}`}>
            <span className={styles.bead} />
          </div>
          <div className={styles.rowContent}>
            <span className={styles.eyebrowSmall}>{sections[3].eyebrow}</span>
            <blockquote className={styles.quote}>
              "People don't stop wearing jewellery because they stop loving it.
              They stop because it stops looking new. We just fixed that part."
              <cite className={styles.quoteCite}>— Founder, Aurevian</cite>
            </blockquote>
          </div>
        </div>
      </div>

      {/* ================= CTA ================= */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Ready to build your everyday edit?</h2>
        <a href="/collections" className={styles.ctaButton}>
          Explore the collection <FiArrowUpRight />
        </a>
      </section>
    </main>
    <Footer/>
    </>
  );
};

export default WhyAurevian;
