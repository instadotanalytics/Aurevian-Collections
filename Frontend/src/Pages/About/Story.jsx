import React, { useRef, memo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { PiDiamondLight, PiLeafLight, PiHeartLight } from "react-icons/pi";
import styles from "./Story.module.css";
import { storyData } from "./storyData";

/**
 * Story.jsx — "Our Story" editorial section for the Aurevian jewellery site.
 *
 * Design intent
 * ---------------------------------------------------------------------------
 * This mirrors the visual language already established in Header.module.css
 * (ink / ivory / gold, Cormorant Garamond + Inter, hairline dividers, slow
 * 0.25s micro-transitions) and extends it into slower, editorial motion
 * (0.6s–1.5s) appropriate for a full-page brand story rather than UI chrome.
 *
 * All copy and imagery live in storyData.js. This file only maps that data
 * onto markup — replacing content later (from a CMS or API) never requires
 * touching this component.
 *
 * Animation strategy
 * ---------------------------------------------------------------------------
 * - Section-level reveals use Framer Motion's `whileInView` (built on
 *   IntersectionObserver) with `viewport={{ once: true }}` so animations
 *   play once, not on every scroll pass — calmer, and cheaper to render.
 * - The hero and the journey "thread" use `useScroll` + `useTransform` for
 *   genuine scroll-linked parallax rather than a timed animation.
 * - Every transition uses an eased duration between 0.6s and 1.2s. No
 *   spring/bounce easings are used anywhere, per the brief.
 */

// ---------------------------------------------------------------------------
// Shared motion variants (defined once, outside the component, so they are
// not recreated on every render).
// ---------------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
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
  hidden: { opacity: 0, scale: 1.04 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.05 },
  },
};

// Maps the plain string keys in storyData.js to real icon components, so
// the data file never needs to import React or JSX.
const CRAFT_ICONS = {
  diamond: PiDiamondLight,
  leaf: PiLeafLight,
  heart: PiHeartLight,
};

const viewportOnce = { once: true, amount: 0.3 };

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
function Hero({ data }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Subtle parallax: the background drifts slower than scroll, the content
  // fades and lifts slightly as the hero leaves the viewport.
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      aria-label="Aurevian — Where Light Becomes Legacy"
    >
      <motion.div className={styles.heroBackground} style={{ y: imageY }}>
        <img
          src={data.backgroundImage}
          alt={data.backgroundAlt}
          className={styles.heroImage}
          fetchpriority="high"
        />
      </motion.div>

      <div className={styles.heroOverlay} aria-hidden="true" />

      <motion.div
        className={styles.heroContent}
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.span
          className={styles.heroBrand}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        >
          {data.brand}
        </motion.span>

        <motion.h1
          className={styles.heroTagline}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.45 }}
        >
          {data.tagline}
        </motion.h1>
      </motion.div>

      <motion.div
        className={styles.heroScroll}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        aria-hidden="true"
      >
        <span className={styles.heroScrollLabel}>{data.scrollLabel}</span>
        <span className={styles.heroScrollLine} />
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Editorial Quote
// ---------------------------------------------------------------------------
function EditorialQuote({ data }) {
  return (
    <section className={styles.quoteSection} aria-label="Brand philosophy">
      <motion.p
        className={styles.quoteText}
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {data.lines.map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </motion.p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Reusable editorial split (image + copy) — powers both "Our Story" and
// the "Craftsmanship" section so the layout logic exists in exactly one
// place, per the brief's request for a minimal, reusable file structure.
// ---------------------------------------------------------------------------
function EditorialSplit({ eyebrow, heading, paragraphs, image, imageAlt, reverse, children, headingLevel: Heading = "h2" }) {
  return (
    <div className={`${styles.split} ${reverse ? styles.splitReverse : ""}`}>
      <motion.div
        className={styles.splitMedia}
        variants={imageReveal}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <img
          src={image}
          alt={imageAlt}
          className={styles.splitImage}
          loading="lazy"
          decoding="async"
        />
      </motion.div>

      <motion.div
        className={styles.splitContent}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <motion.span variants={fadeUp} className={styles.eyebrow}>
          {eyebrow}
        </motion.span>
        <motion.hr variants={fadeUp} className={styles.hairline} />
        <motion.div variants={fadeUp}>
          <Heading className={styles.splitHeading}>{heading}</Heading>
        </motion.div>
        {paragraphs.map((p, i) => (
          <motion.p key={i} variants={fadeUp} className={styles.splitParagraph}>
            {p}
          </motion.p>
        ))}
        {children}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Journey Timeline
// ---------------------------------------------------------------------------
function JourneyTimeline({ items, media }) {
  const trackRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 75%", "end 55%"],
  });
  const threadHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className={styles.journey} aria-label="Our journey">
      <motion.div
        className={styles.journeyHeader}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <motion.span variants={fadeUp} className={styles.eyebrow}>
          The Journey
        </motion.span>
        <motion.h2 variants={fadeUp} className={styles.journeyHeading}>
          From First Spark to Lasting Legacy
        </motion.h2>
      </motion.div>

      <div className={styles.journeyGrid}>
        <div className={styles.journeyTrack} ref={trackRef}>
          <motion.div
            className={styles.journeyThreadFill}
            style={{ height: threadHeight }}
            aria-hidden="true"
          />

          {items.map((item) => (
            <motion.div
              key={item.id}
              className={styles.journeyItem}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <span className={styles.journeyDot} aria-hidden="true" />
              <div className={styles.journeyCard}>
                <span className={styles.journeyOrder}>{item.order}</span>
                <h3 className={styles.journeyTitle}>{item.title}</h3>
                <p className={styles.journeyDescription}>{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

{media && (
          <div className={styles.journeySticky}>
            <div className={styles.journeyStickyInner}>
              <motion.div
                className={styles.journeyImageFrame}
                variants={imageReveal}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
              >
                <img
                  src={media.image}
                  alt={media.imageAlt}
                  className={styles.journeyImage}
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>

              {media.caption && (
                <motion.div
                  className={styles.journeyMediaCaption}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                >
                  <span className={styles.journeyMediaLine} aria-hidden="true" />
                  <span className={styles.journeyMediaText}>{media.caption}</span>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Craftsmanship — reuses EditorialSplit, adds a minimal feature row (no
// cards — just icon + label, as specified).
// ---------------------------------------------------------------------------
function Craftsmanship({ data }) {
  return (
    <section aria-label="Craftsmanship">
      <EditorialSplit
        eyebrow={data.eyebrow}
        heading={data.heading}
        paragraphs={data.paragraphs}
        image={data.image}
        imageAlt={data.imageAlt}
        reverse
      >
        <motion.ul variants={fadeUp} className={styles.featureList}>
          {data.features.map((feature) => {
            const Icon = CRAFT_ICONS[feature.icon];
            return (
              <li key={feature.id} className={styles.featureItem}>
                {Icon && <Icon className={styles.featureIcon} aria-hidden="true" />}
                <span>{feature.label}</span>
              </li>
            );
          })}
        </motion.ul>
      </EditorialSplit>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Image Gallery Strip
// ---------------------------------------------------------------------------
function GalleryStrip({ items }) {
  return (
    <section className={styles.gallerySection} aria-label="Campaign gallery">
      <div className={styles.galleryHeader}>
        <motion.span
          className={styles.eyebrow}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          In Frame
        </motion.span>
      </div>

      <motion.div
        className={styles.galleryTrack}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {items.map((item) => (
          <motion.figure key={item.id} className={styles.galleryItem} variants={fadeUp}>
            <img
              src={item.image}
              alt={item.alt}
              className={styles.galleryImage}
              loading="lazy"
              decoding="async"
            />
            <figcaption className={styles.galleryCaption}>{item.caption}</figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Founder Philosophy
// ---------------------------------------------------------------------------
function FounderPhilosophy({ data }) {
  return (
    <section className={styles.founder} aria-label="Founder's philosophy">
      <motion.p
        className={styles.founderQuote}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        “{data.quote}”
      </motion.p>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <p className={styles.founderSignature}>{data.name}</p>
        <p className={styles.founderTitle}>{data.title}</p>
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Legacy
// ---------------------------------------------------------------------------
function Legacy({ data }) {
  return (
    <section className={styles.legacy} aria-label="Our legacy">
      <motion.span
        className={styles.eyebrow}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {data.eyebrow}
      </motion.span>
      <motion.h2
        className={styles.legacyHeading}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {data.heading}
      </motion.h2>
      {data.paragraphs.map((p, i) => (
        <motion.p
          key={i}
          className={styles.legacyParagraph}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {p}
        </motion.p>
      ))}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Call To Action
// ---------------------------------------------------------------------------
function CallToAction({ data }) {
  return (
    <section className={styles.cta} aria-label="Shop the collection">
      <motion.a
        href={data.buttonHref}
        className={styles.ctaButton}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {data.buttonLabel}
        <FiArrowRight className={styles.ctaArrow} aria-hidden="true" />
      </motion.a>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Story — top-level export
// ---------------------------------------------------------------------------
function Story({ data = storyData }) {
  return (
    <main className={styles.story}>
      <Hero data={data.hero} />
      <EditorialQuote data={data.editorialQuote} />

      <EditorialSplit
        eyebrow={data.ourStory.eyebrow}
        heading={data.ourStory.heading}
        paragraphs={data.ourStory.paragraphs}
        image={data.ourStory.image}
        imageAlt={data.ourStory.imageAlt}
      />

      <JourneyTimeline items={data.journey} media={data.journeyMedia} />
      <Craftsmanship data={data.craftsmanship} />
      <GalleryStrip items={data.gallery} />
      <FounderPhilosophy data={data.founder} />
      <Legacy data={data.legacy} />
      <CallToAction data={data.cta} />
    </main>
  );
}

export default memo(Story);