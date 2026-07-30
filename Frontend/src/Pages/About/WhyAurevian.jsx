import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FiShield,
  FiDroplet,
  FiHeart,
  FiRefreshCw,
  FiAward,
  FiPackage,
  FiArrowRight,
} from "react-icons/fi";
import styles from "./WhyAurevian.module.css";
import productImage from "../../assets/ProductImage.png";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";

const HERO_IMAGE_URL =
  "https://i.pinimg.com/1200x/20/2a/df/202adfdd80a767b9a2c34653860b6eed.jpg";

const MAKING_IMAGE_URL =
  "https://i.pinimg.com/736x/54/19/95/541995c08c6b6a81bab622d111446fa4.jpg";

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
    transition: { staggerChildren: 0.15, delayChildren: 0.05 },
  },
};

const growLine = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1, ease: [0.4, 0, 0.2, 1] },
  },
};

const viewportOnce = { once: true, amount: 0.3 };

const makingPoints = [
  {
    id: "material",
    num: "01",
    title: "The Base",
    copy: "A skin-safe alloy, chosen for what it can hold, not just what it costs.",
  },
  {
    id: "plating",
    num: "02",
    title: "The Finish",
    copy: "Layered gold, thick enough to survive real wear — not just a photograph.",
  },
  {
    id: "check",
    num: "03",
    title: "The Check",
    copy: "Every piece inspected by hand before it ever reaches a box.",
  },
];

const reasons = [
  {
    id: "plating",
    icon: FiShield,
    title: "A finish that behaves like gold",
    copy: "An even, considered layer of gold over a base built to hold it — so it catches light the way fine jewellery does, without asking a fine-jewellery budget of you.",
  },
  {
    id: "water",
    icon: FiDroplet,
    title: "Built for a life, not a display case",
    copy: "Showers, workouts, forgetting it's even on — it's made for the version of you that actually lives in it, not the version that takes it off first.",
  },
  {
    id: "skin",
    icon: FiHeart,
    title: "Gentle by design",
    copy: "Nickel-free from the first sketch, so a full day of wear never becomes a reason to take it off early.",
  },
  {
    id: "resize",
    icon: FiRefreshCw,
    title: "One resize, no back-and-forth",
    copy: "If a ring doesn't sit right, we fix it once, free, within your first thirty days — no forms, no negotiation.",
  },
  {
    id: "warranty",
    icon: FiAward,
    title: "A year behind every piece",
    copy: "Plating that thins from ordinary wear within the year gets replated or replaced. That's not a policy we advertise loudly — it's just what we do.",
  },
  {
    id: "kit",
    icon: FiPackage,
    title: "The care, already included",
    copy: "A cloth and a pouch in every order, because keeping something looking new should take thirty seconds, not a routine.",
  },
];

const promiseStats = [
  { id: "warranty", num: "1 Yr", label: "Plating warranty" },
  { id: "returns", num: "30 Day", label: "Free returns" },
  { id: "worn", num: "10K+", label: "Pieces worn daily" },
];

const ritual = [
  {
    id: "wear",
    icon: FiHeart,
    order: "01",
    title: "Wear It, Without Thinking Twice",
    desc: "On for the commute, the gym, the shower. That's the point.",
  },
  {
    id: "rinse",
    icon: FiDroplet,
    order: "02",
    title: "Rinse Off Sweat or Chlorine",
    desc: "A quick rinse under water is all it ever needs — no soaking, no special solution.",
  },
  {
    id: "restore",
    icon: FiRefreshCw,
    order: "03",
    title: "Wipe With the Included Cloth",
    desc: "Thirty seconds with the cloth in your box brings the shine right back.",
  },
];

function Hero() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section ref={heroRef} className={styles.hero} aria-label="Why Aurevian">
      <motion.div className={styles.heroBackground} style={{ y: imageY }}>
        <img
          src={HERO_IMAGE_URL}
          alt="Aurevian jewellery, styled editorially"
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
          className={styles.heroEyebrow}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        >
          Why Aurevian
        </motion.span>

        <motion.h1
          className={styles.heroTagline}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.45 }}
        >
          Jewellery that keeps up with your actual life.
        </motion.h1>

        <motion.p
          className={styles.heroSub}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.65 }}
        >
          Not fast-fashion that fades by the third wear, not fine jewellery
          you're afraid to put on. Here's what sits in between — and why it
          holds.
        </motion.p>
      </motion.div>
    </section>
  );
}

function EditorialQuote() {
  return (
    <section className={styles.quoteSection} aria-label="Philosophy">
      <motion.p
        className={styles.quoteText}
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <span>We didn't set out to make jewellery cheaper.</span>
        <span>We set out to make it honest.</span>
      </motion.p>
    </section>
  );
}

function MakingOf() {
  const mediaRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: mediaRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section className={styles.makingSection} aria-label="How it's made">
      <div className={styles.makingGrid}>
        <div className={styles.makingMedia} ref={mediaRef}>
          <motion.div
            className={styles.makingImageInner}
            variants={imageReveal}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{ y: imageY }}
          >
            <img
              src={MAKING_IMAGE_URL}
              alt="Hands shaping a gold jewellery setting"
              className={styles.makingImage}
              loading="lazy"
              decoding="async"
            />
          </motion.div>
          <div className={styles.makingFrameMark} aria-hidden="true" />
        </div>

        <motion.div
          className={styles.makingContent}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.span variants={fadeUp} className={styles.eyebrow}>
            The Difference
          </motion.span>
          <motion.hr variants={fadeUp} className={styles.hairline} />
          <motion.h2 variants={fadeUp} className={styles.sectionHeading}>
            Made the slower way, on purpose.
          </motion.h2>
          <motion.p variants={fadeUp} className={styles.sectionLead}>
            The gap between mall jewellery and fine jewellery was never really
            about price — it was about how much care goes into what's under the
            shine. That's the part we chose not to skip.
          </motion.p>

          <div className={styles.makingPoints}>
            {makingPoints.map((point) => (
              <motion.div
                key={point.id}
                className={styles.makingPoint}
                variants={fadeUp}
              >
                <span className={styles.makingPointNum}>{point.num}</span>
                <div>
                  <h3 className={styles.makingPointTitle}>{point.title}</h3>
                  <p className={styles.makingPointCopy}>{point.copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Reasons() {
  return (
    <section className={styles.reasonsSection} aria-label="What you get">
      <motion.div
        className={styles.sectionHeader}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <motion.span variants={fadeUp} className={styles.eyebrow}>
          What You Get
        </motion.span>
        <motion.hr variants={fadeUp} className={styles.hairline} />
        <motion.h2 variants={fadeUp} className={styles.sectionHeading}>
          Six reasons it lasts
        </motion.h2>
      </motion.div>

      <motion.div
        className={styles.reasonsList}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {reasons.map(({ id, icon: Icon, title, copy }, i) => (
          <motion.div className={styles.reasonRow} key={id} variants={fadeUp}>
            <span className={styles.reasonIndex}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <Icon className={styles.reasonIcon} aria-hidden="true" />
            <div className={styles.reasonBody}>
              <h3 className={styles.reasonTitle}>{title}</h3>
              <p className={styles.reasonCopy}>{copy}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function Promise() {
  return (
    <section className={styles.promiseSection} aria-label="Our promise">
      <div className={styles.promiseGrid}>
        <motion.div
          className={styles.promiseText}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.span variants={fadeUp} className={styles.eyebrowLight}>
            Our Promise
          </motion.span>
          <motion.hr variants={fadeUp} className={styles.hairlineLight} />
          <motion.h2 variants={fadeUp} className={styles.promiseHeading}>
            Wear it. If it lets you down, we'll fix it.
          </motion.h2>
          <motion.p variants={fadeUp} className={styles.promiseCopy}>
            Every piece leaves our workshop backed by a plating warranty, not
            just a return window. If something's off, we make it right —
            replate, resize, or replace. No fine print, no runaround.
          </motion.p>
          <motion.ul variants={fadeUp} className={styles.promiseStats}>
            {promiseStats.map(({ id, num, label }) => (
              <li key={id}>
                <span className={styles.promiseStatNum}>{num}</span>
                <span className={styles.promiseStatLabel}>{label}</span>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          className={styles.promiseMedia}
          variants={imageReveal}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <img
            src={productImage}
            alt="Aurevian jewellery, everyday wear"
            className={styles.promiseImage}
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
}

function CareRitual() {
  return (
    <section className={styles.ritualSection} aria-label="Care ritual">
      <motion.div
        className={styles.sectionHeader}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <motion.span variants={fadeUp} className={styles.eyebrow}>
          Living With It
        </motion.span>
        <motion.hr variants={fadeUp} className={styles.hairline} />
        <motion.h2 variants={fadeUp} className={styles.sectionHeading}>
          Care, in three steps
        </motion.h2>
      </motion.div>

      <motion.div
        className={styles.ritualTrack}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <motion.span className={styles.ritualLine} variants={growLine} />
        {ritual.map(({ id, icon: Icon, order, title, desc }) => (
          <motion.div key={id} className={styles.ritualStep} variants={fadeUp}>
            <span className={styles.ritualIconWrap}>
              <Icon className={styles.ritualIcon} aria-hidden="true" />
            </span>
            <span className={styles.ritualOrder}>{order}</span>
            <h3 className={styles.ritualTitle}>{title}</h3>
            <p className={styles.ritualDesc}>{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className={styles.cta} aria-label="Shop the collection">
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

function WhyAurevian() {
  return (
    <>
        <Header /> 
      <main className={styles.page}>
        <Hero />
        <EditorialQuote />
        <MakingOf />
        <Reasons />
        <Promise />
        <CareRitual />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}

export default WhyAurevian;
