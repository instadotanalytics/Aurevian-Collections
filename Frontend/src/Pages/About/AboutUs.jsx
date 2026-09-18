import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiFeather, FiRepeat, FiArrowRight, FiTrendingUp } from "react-icons/fi";
import styles from "./AboutUs.module.css";

// ---------------------------------------------------------------------------
// Local assets — About page imagery (accessories brand, 60% men / 40% women)
// ---------------------------------------------------------------------------
import aboutHero from "../../assets/AboutHero.jpg";
import aboutDisplay1 from "../../assets/AboutDisplay1.jfif";
import aboutDisplay2 from "../../assets/AboutDisplay2.jfif";
import craftImage1 from "../../assets/CraftImage1.png";
import craftImage2 from "../../assets/CraftImage1.jfif";

import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";

// ---------------------------------------------------------------------------
// Motion variants
// ---------------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.1, ease: [0.4, 0, 0.2, 1] },
  },
};

const imageReveal = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.16, delayChildren: 0.05 },
  },
};

const viewportOnce = { once: true, amount: 0.3 };

// ---------------------------------------------------------------------------
// Brand values — accessories-focused, no gender, no jewellery
// ---------------------------------------------------------------------------
const values = [
  {
    id: "materials",
    icon: FiFeather,
    num: "01",
    title: "Material-first construction",
    copy: "Every piece starts with the material — full-grain leathers, brushed metals, quality textiles — chosen for how they age, not just how they photograph.",
  },
  {
    id: "everyday",
    icon: FiRepeat,
    num: "02",
    title: "Made for every day, not one occasion",
    copy: "No pieces that only come out twice a year. Aurevian is built around a rotation — accessories that work from weekday to weekend without a second thought.",
  },
  {
    id: "evolution",
    icon: FiTrendingUp,
    num: "03",
    title: "Designed to evolve with you",
    copy: "Timeless finishes, considered proportions, and construction that holds up — so every addition still fits the collection you already have.",
  },
];

const craftStats = [
  { id: "materials", num: "100%", label: "Responsibly sourced materials" },
  { id: "checks", num: "3×", label: "Quality checks per piece" },
  { id: "wear", num: "365", label: "Days of wear testing" },
];

// ---------------------------------------------------------------------------
// HERO
// ---------------------------------------------------------------------------
function Hero() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  return (
    <section ref={heroRef} className={styles.hero} aria-label="About Aurevian">
      <motion.div
        className={styles.heroText}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.span variants={fadeUp} className={styles.eyebrow}>
          About Aurevian
        </motion.span>
        <motion.hr variants={fadeUp} className={styles.hairline} />
        <motion.h1 variants={fadeUp} className={styles.heroTitle}>
          Everyday essentials, made to last.
        </motion.h1>
        <motion.p variants={fadeUp} className={styles.heroSub}>
          Aurevian builds modern accessories — belts, wallets, watches, bags,
          and perfumes — for people who carry things with intention.
        </motion.p>
      </motion.div>

      <motion.div className={styles.heroMedia} style={{ y: imageY }}>
        <motion.img
          src={aboutHero}
          alt="Aurevian accessories editorial — belt, wallet, watch, and sunglasses"
          className={styles.heroImage}
          variants={imageReveal}
          initial="hidden"
          animate="visible"
        />
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// OUR STORY
// ---------------------------------------------------------------------------
function OurStory() {
  return (
    <section className={styles.storySection} aria-label="Our story">
      <div className={styles.storyGrid}>
        <motion.div
          className={styles.storyGallery}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.div className={styles.storyImgMain} variants={imageReveal}>
            <img
              src={aboutDisplay1}
              alt="Man wearing Aurevian leather belt, watch, and carrying a briefcase"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
          <motion.div className={styles.storyImgAccent} variants={imageReveal}>
            <img
              src={aboutDisplay2}
              alt="Close-up of a leather cardholder wallet and wristwatch"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.storyText}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.span variants={fadeUp} className={styles.eyebrow}>
            Our Story
          </motion.span>
          <motion.hr variants={fadeUp} className={styles.hairline} />
          <motion.h2 variants={fadeUp} className={styles.h2}>
            Why we started Aurevian
          </motion.h2>
          <motion.p variants={fadeUp} className={styles.storyParagraph}>
            Accessories had split into two camps — fast, disposable pieces on
            one side, and unreachable luxury pricing on the other. Neither was
            built for someone who actually carries their things every day.
          </motion.p>
          <motion.p variants={fadeUp} className={styles.storyParagraph}>
            So Aurevian set out to design the middle ground: considered
            materials, honest construction, and detailing built to hold up year
            after year — for anyone who values quality without the luxury
            markup.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// WHAT WE BELIEVE
// ---------------------------------------------------------------------------
function WhatWeBelieve() {
  return (
    <section className={styles.valuesSection} aria-label="What we believe">
      <motion.div
        className={styles.sectionHeader}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <motion.span variants={fadeUp} className={styles.eyebrow}>
          What We Believe
        </motion.span>
        <motion.hr variants={fadeUp} className={styles.hairline} />
        <motion.h2 variants={fadeUp} className={styles.sectionHeading}>
          Three things we won't compromise on
        </motion.h2>
      </motion.div>

      <motion.div
        className={styles.valuesGrid}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {values.map(({ id, icon: Icon, num, title, copy }) => (
          <motion.div className={styles.valueCard} key={id} variants={fadeUp}>
            <span className={styles.valueNum}>{num}</span>
            <Icon className={styles.valueIcon} aria-hidden="true" />
            <h3 className={styles.valueTitle}>{title}</h3>
            <p className={styles.valueCopy}>{copy}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// THE CRAFT
// ---------------------------------------------------------------------------
function TheCraft() {
  const mediaRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: mediaRef,
    offset: ["start end", "end start"],
  });
  const image1Y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const image2Y = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  return (
    <section className={styles.craftSection} aria-label="The craft">
      <div className={styles.craftGrid}>
        <motion.div
          className={styles.craftText}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.span variants={fadeUp} className={styles.eyebrowLight}>
            The Craft
          </motion.span>
          <motion.hr variants={fadeUp} className={styles.hairlineLight} />
          <motion.h2
            variants={fadeUp}
            className={`${styles.h2} ${styles.h2Light}`}
          >
            Behind every stitch
          </motion.h2>
          <motion.p variants={fadeUp} className={styles.craftCopy}>
            Each piece passes through three rounds of quality checking before
            it reaches you — tested for finish, durability, and how it holds up
            after months of daily use, not just how it looks in the studio.
          </motion.p>
          <motion.ul variants={fadeUp} className={styles.craftStats}>
            {craftStats.map(({ id, num, label }) => (
              <li key={id}>
                <span className={styles.craftStatNum}>{num}</span>
                <span className={styles.craftStatLabel}>{label}</span>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <div className={styles.craftGallery} ref={mediaRef}>
          <motion.div
            className={styles.craftImgMain}
            style={{ y: image1Y }}
            variants={imageReveal}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <img
              src={craftImage1}
              alt="Craftsman hand-finishing a leather piece on a workbench"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
          <motion.div
            className={styles.craftImgAccent}
            style={{ y: image2Y }}
            variants={imageReveal}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <img
              src={craftImage2}
              alt="Close-up of hand-stitched leather detailing"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CLOSING QUOTE
// ---------------------------------------------------------------------------
function ClosingQuote() {
  return (
    <section className={styles.quoteSection} aria-label="In their words">
      <motion.div
        className={styles.quoteRule}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        aria-hidden="true"
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className={styles.quoteBody}
      >
        <motion.span variants={fadeUp} className={styles.eyebrow}>
          In Their Words
        </motion.span>
        <motion.blockquote variants={fadeIn} className={styles.quote}>
          “We didn't set out to make trend pieces. We set out to make the belt,
          the wallet, the watch — the pieces you reach for first, every day.”
        </motion.blockquote>
        <motion.cite variants={fadeUp} className={styles.quoteCite}>
          Founder, Aurevian
        </motion.cite>
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CTA
// ---------------------------------------------------------------------------
function CallToAction() {
  return (
    <section className={styles.cta} aria-label="Shop the collection">
      <motion.h2
        className={styles.ctaTitle}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        Ready to build your everyday carry?
      </motion.h2>
      <motion.a
        href="/collections"
        className={styles.ctaButton}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        Explore the Collection
        <FiArrowRight className={styles.ctaArrow} aria-hidden="true" />
      </motion.a>
    </section>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------
const AboutUs = () => {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <Hero />
        <OurStory />
        <WhatWeBelieve />
        <TheCraft />
        <ClosingQuote />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
};

export default AboutUs;