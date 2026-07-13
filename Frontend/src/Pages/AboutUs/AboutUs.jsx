import React from "react";
import { FiDroplet, FiFeather, FiRepeat, FiArrowUpRight } from "react-icons/fi";
import styles from "./AboutUs.module.css";
import heroImage from "../../assets/HeroImage.png";
import displayImage1 from "../../assets/displayImage1.png";
import displayImage2 from "../../assets/displayImage2.png";
// TEMPORARY: reusing existing photos as placeholders so the build runs.
// Swap these two lines for real craft/close-up shots whenever you have them —
// just drop the files into src/assets/ and update the path + filename here.

import craftImage1 from "../../assets/craftImage1.png";
import craftImage2 from "../../assets/craftImage2.png";

import Header from "../../Component/Header/Header";

const values = [
  {
    id: "plating",
    icon: FiDroplet,
    title: "Tarnish-resistant plating",
    copy: "Every piece is layered in 18K gold vermeil over sterling silver, built to hold up to water, sweat and daily weather — not just special occasions.",
  },
  {
    id: "everyday",
    icon: FiFeather,
    title: "Made for everyday, not someday",
    copy: "No safety-deposit-box jewellery here. Aurevian pieces are designed to be worn on repeat, layered, and lived in.",
  },
  {
    id: "value",
    icon: FiRepeat,
    title: "Built to last, priced to repeat",
    copy: "Constructed to outlast trends and touch-ups, at a price that lets you build a full edit — not just one piece.",
  },
];

const craftStats = [
  { id: "gold", num: "18K", label: "Gold vermeil plating" },
  { id: "finish", num: "3×", label: "Hand-finishing passes" },
  { id: "durable", num: "100%", label: "Water & sweat tested" },
];

const sections = [
  { id: "story", eyebrow: "Our Story" },
  { id: "values", eyebrow: "What We Believe" },
  { id: "craft", eyebrow: "The Craft" },
  { id: "quote", eyebrow: "In Her Words" },
];

const AboutUs = () => {
  return (
    <>
      <Header />
      <main className={styles.page}>
        {/* ================= HERO ================= */}
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>About Aurevian</span>
            <h1 className={styles.heroTitle}>
              Gold-plated confidence,
              <br />
              worn every day.
            </h1>
            <p className={styles.heroSub}>
              Aurevian designs jewellery for the days that don't wait for an
              occasion.
            </p>
          </div>

          <img
            src={heroImage}
            alt="Aurevian Jewellery Showroom"
            className={styles.heroImage}
          />
        </section>

        {/* ================= CHAIN-RAIL BODY ================= */}
        <div className={styles.chainBody}>
          {/* ---- Our Story ---- */}
          <div className={styles.chainRow}>
            <div className={styles.railCell}>
              <span className={styles.bead} />
            </div>
            <div className={styles.rowContent}>
              <span className={styles.eyebrowSmall}>{sections[0].eyebrow}</span>
              <div className={styles.storyGrid}>
                <div className={styles.storyText}>
                  <h2 className={styles.h2}>Why we started Aurevian</h2>
                  <p>
                    Fine jewellery asks you to be careful with it — take it off
                    before the shower, before the gym, before you actually live
                    your life. We didn't want a jewellery box full of pieces we
                    were too nervous to wear.
                  </p>
                  <p>
                    So Aurevian set out to make demifine jewellery that behaves
                    like fine jewellery — the same warmth, the same weight, the
                    same finish — but priced and built for daily wear, not
                    display.
                  </p>
                </div>
                <div className={styles.storyImages}>
                  <img
                    src={displayImage1}
                    alt="Aurevian jewellery, close detail"
                    className={styles.displayImage1}
                  />
                  <img
                    src={displayImage2}
                    alt="Aurevian jewellery, worn styling"
                    className={styles.displayImage2}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ---- What We Believe ---- */}
          <div className={styles.chainRow}>
            <div className={styles.railCell}>
              <span className={styles.bead} />
            </div>
            <div className={styles.rowContent}>
              <span className={styles.eyebrowSmall}>{sections[1].eyebrow}</span>
              <h2 className={styles.h2}>What we believe</h2>
              <div className={styles.valuesGrid}>
                {values.map(({ id, icon: Icon, title, copy }) => (
                  <div className={styles.valueCard} key={id}>
                    <Icon className={styles.valueIcon} aria-hidden="true" />
                    <h3 className={styles.valueTitle}>{title}</h3>
                    <p className={styles.valueCopy}>{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---- The Craft (dark, full-bleed) ---- */}
          <div className={styles.chainRow}>
            <div className={styles.railCell}>
              <span className={styles.bead} />
            </div>
            <div className={styles.rowContent}>
              <span className={styles.eyebrowSmall}>{sections[2].eyebrow}</span>
              <div className={styles.craftPanel}>
                <div className={styles.craftText}>
                  <h2 className={`${styles.h2} ${styles.h2Light}`}>
                    Behind every clasp
                  </h2>
                  <p className={styles.craftCopy}>
                    Each design passes through three rounds of hand-finishing
                    before it's plated — checked for weight, balance, and how it
                    catches light, not just how it photographs.
                  </p>
                  <ul className={styles.craftStats}>
                    {craftStats.map(({ id, num, label }) => (
                      <li key={id}>
                        <span className={styles.craftStatNum}>{num}</span>
                        <span className={styles.craftStatLabel}>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.craftImages}>
                  <img
                    src={craftImage1}
                    alt="Hand-finishing a gold vermeil piece"
                    className={styles.craftImageMain}
                  />
                  <img
                    src={craftImage2}
                    alt="Close-up of clasp detailing"
                    className={styles.craftImageAccent}
                  />
                </div>
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
                "We didn't want to make cheaper jewellery. We wanted to make
                jewellery you don't have to be careful with."
                <cite className={styles.quoteCite}>— Founder, Aurevian</cite>
              </blockquote>
            </div>
          </div>
        </div>

        {/* ================= CTA ================= */}
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>
            Ready to build your everyday edit?
          </h2>
          <a href="/collections" className={styles.ctaButton}>
            Explore the collection <FiArrowUpRight />
          </a>
        </section>
      </main>
    </>
  );
};

export default AboutUs;
