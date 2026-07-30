import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiDroplet, FiFeather, FiRepeat, FiArrowRight } from "react-icons/fi";
import styles from "./AboutUs.module.css";
import craftImage1 from "../../assets/CraftImage1.png";
import craftImage2 from "../../assets/CraftImage2.png";

import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";

const heroImage =
  "https://i.pinimg.com/1200x/07/b4/c0/07b4c09ebe702682087fb62a5f72d301.jpg";
const displayImage1 =
  "https://i.pinimg.com/1200x/d9/0f/0b/d90f0b0c3032dc4f1674f204a8e1fdd0.jpg";
const displayImage2 =
  "https://i.pinimg.com/1200x/50/8b/dd/508bddb1d6999237bddcc41e80084f6e.jpg";

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

const values = [
  {
    id: "plating",
    icon: FiDroplet,
    num: "01",
    title: "Tarnish-resistant plating",
    copy: "Every piece is layered in 18K gold vermeil over sterling silver, built to hold up to water, sweat and daily weather — not just special occasions.",
  },
  {
    id: "everyday",
    icon: FiFeather,
    num: "02",
    title: "Made for everyday, not someday",
    copy: "No safety-deposit-box jewellery here. Aurevian pieces are designed to be worn on repeat, layered, and lived in.",
  },
  {
    id: "value",
    icon: FiRepeat,
    num: "03",
    title: "Built to last, priced to repeat",
    copy: "Constructed to outlast trends and touch-ups, at a price that lets you build a full edit — not just one piece.",
  },
];

const craftStats = [
  { id: "gold", num: "18K", label: "Gold vermeil plating" },
  { id: "finish", num: "3×", label: "Hand-finishing passes" },
  { id: "durable", num: "100%", label: "Water & sweat tested" },
];

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
          Gold-plated confidence, worn every day.
        </motion.h1>
        <motion.p variants={fadeUp} className={styles.heroSub}>
          Aurevian designs jewellery for the days that don't wait for an
          occasion.
        </motion.p>
      </motion.div>

      <motion.div className={styles.heroMedia} style={{ y: imageY }}>
        <motion.img
          src={heroImage}
          alt="Aurevian jewellery showroom"
          className={styles.heroImage}
          variants={imageReveal}
          initial="hidden"
          animate="visible"
        />
      </motion.div>
    </section>
  );
}

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
              src={displayImage1}
              alt="Aurevian jewellery, close detail"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
          <motion.div className={styles.storyImgAccent} variants={imageReveal}>
            <img
              src={displayImage2}
              alt="Aurevian jewellery, worn styling"
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
            Fine jewellery asks you to be careful with it — take it off before
            the shower, before the gym, before you actually live your life. We
            didn't want a jewellery box full of pieces we were too nervous to
            wear.
          </motion.p>
          <motion.p variants={fadeUp} className={styles.storyParagraph}>
            So Aurevian set out to make demifine jewellery that behaves like
            fine jewellery — the same warmth, the same weight, the same finish —
            but priced and built for daily wear, not display.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

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
            Behind every clasp
          </motion.h2>
          <motion.p variants={fadeUp} className={styles.craftCopy}>
            Each design passes through three rounds of hand-finishing before
            it's plated — checked for weight, balance, and how it catches light,
            not just how it photographs.
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
              alt="Hand-finishing a gold vermeil piece"
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
              alt="Close-up of clasp detailing"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ClosingQuote() {
  return (
    <section className={styles.quoteSection} aria-label="In her words">
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
          In Her Words
        </motion.span>
        <motion.blockquote variants={fadeIn} className={styles.quote}>
          “We didn't want to make cheaper jewellery. We wanted to make jewellery
          you don't have to be careful with.”
        </motion.blockquote>
        <motion.cite variants={fadeUp} className={styles.quoteCite}>
          Founder, Aurevian
        </motion.cite>
      </motion.div>
    </section>
  );
}

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
        Ready to build your everyday edit?
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
