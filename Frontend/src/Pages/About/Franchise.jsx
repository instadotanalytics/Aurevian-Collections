import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence, useInView } from "framer-motion";
import toast from "react-hot-toast"; // ✅ NEW — submit feedback
import {
  FaGem,
  FaChartLine,
  FaHandshake,
  FaTruck,
  FaBullhorn,
  FaChalkboardTeacher,
  FaBoxes,
  FaStoreAlt,
  FaMobileAlt,
  FaUserTie,
  FaShieldAlt,
  FaCheckCircle,
  FaQuoteLeft,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaCamera,
  FaInstagram,
  FaFileSignature,
} from "react-icons/fa";
import { HiSparkles, HiOutlineDownload } from "react-icons/hi";
import {
  GiDiamondRing,
  GiFactory,
  GiPartyPopper,
  GiTakeMyMoney,
} from "react-icons/gi";
import {
  LuSparkles,
  LuGem,
  LuGift,
  LuShieldCheck,
  LuHeart,
  LuShoppingBag,
} from "react-icons/lu";
import styles from "./Franchise.module.css";
import franchiseHero from "../../assets/franchisehero.png";
import Header from "../../Pages/Layout/Header/Header";
import Footer from "../../Pages/Layout/Footer/Footer";

/* ---------------------------------------------------------------- */
/* Image imports                                                     */
/* ---------------------------------------------------------------- */
import bridalSetImage from "../../assets/Bridalsetimage.png";
import ringsImage from "../../assets/Ringsimage.png";
import necklaceImage from "../../assets/Necklaceimage.png";
import earingsImage from "../../assets/Earingsimage.png";
import banglesImage from "../../assets/Banglesimage.png";
import ankletsImage from "../../assets/Ankletsimage.png";

// ✅ NEW — backend base URL. Set VITE_API_URL in your .env if the API
// lives on a different origin than the frontend; otherwise this falls
// back to a same-origin relative request.
const API_BASE = import.meta.env.VITE_API_URL || "";

/* ---------------------------------------------------------------- */
/* Static data                                                       */
/* ---------------------------------------------------------------- */

const HERO_FEATURES = [
  {
    icon: <FaGem />,
    title: "Premium Brand",
    desc: "Associate with a trusted and elegant jewellery brand.",
  },
  {
    icon: <FaHandshake />,
    title: "Complete Support",
    desc: "End-to-end support in training, operations & marketing.",
  },
  {
    icon: <FaChartLine />,
    title: "Growth Opportunity",
    desc: "High margins, strong demand & scalable business model.",
  },
];

const WHY_PARTNER = [
  {
    icon: <FaGem />,
    title: "Premium Brand",
    desc: "Align with a recognised anti-tarnish jewellery,customers already trust.",
  },
  {
    icon: <HiSparkles />,
    title: "Trending Jewellery",
    desc: "A catalogue refreshed monthly to match what's actually selling now.",
  },
  {
    icon: <FaChartLine />,
    title: "High Profit Margin",
    desc: "Margins built into every price point, from studs to statement sets.",
  },
  {
    icon: <FaBullhorn />,
    title: "Marketing Support",
    desc: "Regional campaigns, launch pushes and always-on brand visibility.",
  },
  {
    icon: <FaChalkboardTeacher />,
    title: "Training",
    desc: "Sales, styling and store-operations training for you and your staff.",
  },
  {
    icon: <FaBoxes />,
    title: "Inventory Support",
    desc: "Curated stock plus a replenishment system that avoids dead stock.",
  },
  {
    icon: <FaTruck />,
    title: "Fast Delivery",
    desc: "A logistics network built to keep your counters full, not waiting.",
  },
  {
    icon: <FaMobileAlt />,
    title: "Digital Marketing",
    desc: "Social, performance and influencer support pointed at your city.",
  },
  {
    icon: <FaStoreAlt />,
    title: "Store Design Assistance",
    desc: "Layout, lighting and display guidance drawn from our flagship stores.",
  },
  {
    icon: <GiTakeMyMoney />,
    title: "POS Support",
    desc: "Billing, CRM and inventory software set up and ready on day one.",
  },
  {
    icon: <FaUserTie />,
    title: "Dedicated Relationship Manager",
    desc: "One point of contact who knows your store and answers fast.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Warranty Support",
    desc: "A one-year warranty programme handled end-to-end by our team.",
  },
];

const PLANS = [
  {
    name: "Starter",
    investment: "₹8 – 12 Lakh",
    size: "150 – 250 sq.ft.",
    roi: "18 – 22% p.a.",
    inventory: "₹4L opening stock",
    support: "Remote onboarding",
    marketing: "Local digital push",
    fee: "₹1,50,000",
    interior: "Standard kit",
    highlight: false,
  },
  {
    name: "Premium",
    investment: "₹15 – 22 Lakh",
    size: "300 – 450 sq.ft.",
    roi: "24 – 30% p.a.",
    inventory: "₹7L opening stock",
    support: "On-site launch team",
    marketing: "City-wide campaign",
    fee: "₹2,50,000",
    interior: "Signature interior",
    highlight: true,
  },
  {
    name: "Flagship",
    investment: "₹28 – 40 Lakh",
    size: "600+ sq.ft.",
    roi: "30 – 35% p.a.",
    inventory: "₹12L opening stock",
    support: "Dedicated launch squad",
    marketing: "Region-wide + influencer",
    fee: "₹4,00,000",
    interior: "Flagship interior + VM",
    highlight: false,
  },
];

const TIMELINE_STEPS = [
  { title: "Apply", desc: "Share your details through our franchise form." },
  {
    title: "Discussion",
    desc: "A call with our team to align on your city and goals.",
  },
  {
    title: "Location Approval",
    desc: "We evaluate and approve your proposed store site.",
  },
  {
    title: "Agreement",
    desc: "Sign a transparent, standardised franchise agreement.",
  },
  {
    title: "Store Setup",
    desc: "Interiors, branding and inventory move in together.",
  },
  {
    title: "Grand Opening",
    desc: "Launch day, with marketing support behind you.",
  },
];

const COLLECTIONS = [
  { title: "Bridal Sets", tag: "Statement Pieces", img: bridalSetImage },
  { title: "Rings", tag: "Everyday Elegance", img: ringsImage },
  { title: "Necklaces", tag: "Layered & Timeless", img: necklaceImage },
  { title: "Earrings", tag: "Studs to Danglers", img: earingsImage },
  { title: "Bracelets & Bangles", tag: "Stackable Shine", img: banglesImage },
  { title: "Anklets", tag: "festive favorites", img: ankletsImage },
];

const PROMISE_CARDS = [
  {
    icon: <LuSparkles />,
    title: ["Timeless", "Craftsmanship"],
    desc: ["Thoughtful designs", "made to last."],
  },
  {
    icon: <LuGem />,
    title: ["Premium", "Materials"],
    desc: ["Quality materials", "you can trust."],
  },
  {
    icon: <LuGift />,
    title: ["Signature", "Packaging"],
    desc: ["Beautifully", "presented."],
  },
  {
    icon: <LuShieldCheck />,
    title: ["1-Year", "Warranty"],
    desc: ["Shop with", "confidence."],
  },
  {
    icon: <LuHeart />,
    title: ["Designed", "For You"],
    desc: ["Jewellery for", "every occasion."],
  },
  {
    icon: <LuShoppingBag />,
    title: ["Easy", "Experience"],
    desc: ["From discovery to", "delivery."],
  },
];

const SUPPORT_GRID = [
  { icon: <FaBullhorn />, label: "Marketing Campaigns" },
  { icon: <FaInstagram />, label: "Instagram Promotions" },
  { icon: <HiSparkles />, label: "Influencer Marketing" },
  { icon: <GiPartyPopper />, label: "Store Launch Event" },
  { icon: <FaChalkboardTeacher />, label: "Employee Training" },
  { icon: <FaBoxes />, label: "Inventory Management" },
  { icon: <FaUserTie />, label: "CRM Support" },
  { icon: <FaMobileAlt />, label: "Website Orders" },
  { icon: <FaGem />, label: "Packaging" },
  { icon: <FaCamera />, label: "Photography" },
  { icon: <GiPartyPopper />, label: "Festival Promotions" },
  { icon: <FaHandshake />, label: "Customer Support" },
];

const SUCCESS_NUMBERS = [
  { value: 1000, suffix: "+", label: "Designs" },
  { value: 100, suffix: "+", label: "New Designs Every Month" },
  { value: 95, suffix: "%", label: "Customer Satisfaction" },
  { value: 24, suffix: "/7", label: "Partner Support" },
];

const TESTIMONIALS = [
  {
    name: "Rohit Malhotra",
    city: "Lucknow, UP",
    revenue: "₹6.2L / month",
    quote:
      "Aurevian's inventory system alone saved me from the dead-stock problem my last business had. Six months in, we're ahead of plan.",
  },
  {
    name: "Ananya Verma",
    city: "Indore, MP",
    revenue: "₹4.8L / month",
    quote:
      "The launch team handled everything — interiors, staff training, even our opening event. I focused on the city, they handled the brand.",
  },
  {
    name: "Karan Shah",
    city: "Surat, GJ",
    revenue: "₹8.1L / month",
    quote:
      "What sold me was the margin structure. It's the first franchise math that actually worked on paper and in the store.",
  },
];

const FAQS = [
  {
    q: "How much investment is required?",
    a: "Depending on the format you choose, investment ranges from ₹8 Lakh for a Starter counter to ₹40 Lakh for a Flagship showroom, covering fee, interiors and opening inventory.",
  },
  {
    q: "What kind of ROI can I expect?",
    a: "Partner stores typically see 18–35% annual ROI depending on format, footfall and city, with most stores reaching break-even within 12–18 months.",
  },
  {
    q: "Do you provide inventory?",
    a: "Yes. Every store opens with a curated stock package sized to its format, followed by a scheduled replenishment cycle so you're rarely out of what sells.",
  },
  {
    q: "How much space is required?",
    a: "Our formats run from 150 sq.ft. boutique counters up to 600+ sq.ft. flagship stores — we help you evaluate what fits your location.",
  },
  {
    q: "Is training provided?",
    a: "Yes, covering product knowledge, styling, billing/POS and store operations for you and your staff before launch.",
  },
  {
    q: "What marketing support is included?",
    a: "Digital campaigns, influencer collaborations, launch-event support and ongoing festival promotions, scaled to your plan.",
  },
  {
    q: "How long does the agreement run?",
    a: "Franchise agreements run for an initial 3-year term with renewal options, on terms laid out transparently before signing.",
  },
  {
    q: "What support continues after launch?",
    a: "A dedicated relationship manager, CRM and inventory tooling, and 24/7 partner support for as long as you're with us.",
  },
];

const TRUST_POINTS = [
  { icon: <FaShieldAlt />, label: "Secure Business" },
  { icon: <FaFileSignature />, label: "Transparent Agreement" },
  { icon: <FaUserTie />, label: "Dedicated Support" },
  { icon: <FaChartLine />, label: "Growing Brand" },
  { icon: <FaGem />, label: "Premium Packaging" },
  { icon: <FaShieldAlt />, label: "1 Year Warranty" },
  { icon: <FaTruck />, label: "Fast Logistics" },
];

/* ---------------------------------------------------------------- */
/* Small reusable pieces                                             */
/* ---------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const Reveal = ({ children, className, variants = fadeUp, ...rest }) => (
  <motion.div
    className={className}
    variants={variants}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.25 }}
    {...rest}
  >
    {children}
  </motion.div>
);

const Eyebrow = ({ children }) => (
  <span className={styles.eyebrow}>{children}</span>
);

const CountUp = ({ value, suffix = "", duration = 1.6 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
};

/* ---------------------------------------------------------------- */
/* Hero feature strip                                               */
/* ---------------------------------------------------------------- */

const HeroFeatureStrip = () => (
  <motion.div
    className={styles.heroFeatureStrip}
    variants={stagger}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.2 }}
  >
    {HERO_FEATURES.map((f, i) => (
      <React.Fragment key={f.title}>
        <motion.div className={styles.heroFeatureItem} variants={fadeUp}>
          <span className={styles.heroFeatureIcon}>{f.icon}</span>
          <div className={styles.heroFeatureText}>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        </motion.div>
        {i < HERO_FEATURES.length - 1 && (
          <span className={styles.heroFeatureDivider} aria-hidden="true" />
        )}
      </React.Fragment>
    ))}
  </motion.div>
);

/* ---------------------------------------------------------------- */
/* Why Partner List                                                 */
/* ---------------------------------------------------------------- */

const WhyPartnerList = () => {
  const half = Math.ceil(WHY_PARTNER.length / 2);
  const columns = [WHY_PARTNER.slice(0, half), WHY_PARTNER.slice(half)];

  return (
    <motion.div
      className={styles.whyList}
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
    >
      {columns.map((col, ci) => (
        <div className={styles.whyCol} key={ci}>
          {col.map((item, i) => {
            const idx = ci * half + i + 1;
            return (
              <motion.div
                key={item.title}
                className={styles.whyRow}
                variants={fadeUp}
              >
                <span className={styles.whyIndex}>
                  {String(idx).padStart(2, "0")}
                </span>
                <span className={styles.whyIconMark}>{item.icon}</span>
                <div className={styles.whyRowBody}>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
    </motion.div>
  );
};

/* ---------------------------------------------------------------- */
/* Aurevian Promise Grid                                            */
/* ---------------------------------------------------------------- */

const AurevianPromiseGrid = () => (
  <motion.div
    className={styles.promiseGrid}
    variants={stagger}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.1 }}
  >
    {PROMISE_CARDS.map((card) => (
      <motion.div
        key={card.title.join(" ")}
        className={styles.promiseCard}
        variants={fadeUp}
        whileHover={{ y: -8 }}
      >
        <span className={styles.promiseIcon}>{card.icon}</span>
        <h3 className={styles.promiseCardTitle}>
          {card.title.map((line, i) => (
            <React.Fragment key={line}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </h3>
        <span className={styles.promiseCardDivider} aria-hidden="true" />
        <p className={styles.promiseCardDesc}>
          {card.desc.map((line, i) => (
            <React.Fragment key={line}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </p>
      </motion.div>
    ))}
  </motion.div>
);

/* ---------------------------------------------------------------- */
/* Collection Showcase                                              */
/* ---------------------------------------------------------------- */

const CollectionShowcase = () => {
  const railRef = useRef(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = (i) => {
    const rail = railRef.current;
    const card = rail?.children[i];
    if (rail && card) {
      rail.scrollTo({
        left: card.offsetLeft - rail.offsetLeft - 8,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const cardWidth = rail.children[0]?.offsetWidth || 1;
    const gap = 24;
    const idx = Math.round(rail.scrollLeft / (cardWidth + gap));
    setActive(Math.min(COLLECTIONS.length - 1, Math.max(0, idx)));
  };

  const go = (dir) => {
    const next = Math.min(COLLECTIONS.length - 1, Math.max(0, active + dir));
    scrollToIndex(next);
  };

  return (
    <div className={styles.showcaseWrap}>
      <div
        className={styles.showcaseRail}
        ref={railRef}
        onScroll={handleScroll}
      >
        {COLLECTIONS.map((c, i) => (
          <motion.div
            key={c.title}
            className={`${styles.showcaseCard} ${c.img ? styles.showcaseCardImg : ""}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.6,
              delay: (i % 3) * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -6 }}
          >
            {c.img && (
              <img
                src={c.img}
                alt={c.title}
                className={styles.showcaseImg}
                loading="lazy"
              />
            )}
            <span className={styles.showcaseIndex}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={styles.showcaseCorner} data-corner="tl" />
            <span className={styles.showcaseCorner} data-corner="br" />
            <span className={styles.showcaseShine} />
            {!c.img && (
              <div className={styles.showcaseIconWrap}>
                <GiDiamondRing />
              </div>
            )}
            <div
              className={`${styles.showcaseCaption} ${c.img ? styles.showcaseCaptionOnImg : ""}`}
            >
              <h4>{c.title}</h4>
              <span>{c.tag}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className={styles.showcaseControls}>
        <button
          onClick={() => go(-1)}
          aria-label="Previous collection"
          disabled={active === 0}
        >
          <FaChevronLeft />
        </button>
        <div className={styles.showcaseProgress}>
          {COLLECTIONS.map((_, i) => (
            <span
              key={i}
              className={
                i === active ? styles.showcaseDotActive : styles.showcaseDot
              }
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          aria-label="Next collection"
          disabled={active === COLLECTIONS.length - 1}
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Support Flow                                                     */
/* ---------------------------------------------------------------- */

const SupportFlow = () => (
  <motion.div
    className={styles.supportFlow}
    variants={stagger}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.1 }}
  >
    {SUPPORT_GRID.map((item, i) => (
      <React.Fragment key={item.label}>
        <motion.div
          className={styles.supportFlowItem}
          variants={fadeUp}
          whileHover={{ y: -3 }}
        >
          <span className={styles.supportFlowIcon}>{item.icon}</span>
          <span>{item.label}</span>
        </motion.div>
        {i < SUPPORT_GRID.length - 1 && (
          <span className={styles.supportFlowDot} aria-hidden="true" />
        )}
      </React.Fragment>
    ))}
  </motion.div>
);

/* ---------------------------------------------------------------- */
/* Profit Calculator                                                */
/* ---------------------------------------------------------------- */

const ProfitCalculator = () => {
  const [investment, setInvestment] = useState(1500000);
  const [rent, setRent] = useState(35000);
  const [staff, setStaff] = useState(25000);
  const [expenses, setExpenses] = useState(20000);
  const [sales, setSales] = useState(700000);

  const results = useMemo(() => {
    const monthlyCosts = rent + staff + expenses;
    const grossMargin = sales * 0.35;
    const monthlyProfit = grossMargin - monthlyCosts;
    const annualProfit = monthlyProfit * 12;
    const roi = investment > 0 ? (annualProfit / investment) * 100 : 0;
    const breakEvenMonths =
      monthlyProfit > 0 ? Math.ceil(investment / monthlyProfit) : null;
    return { monthlyProfit, roi, breakEvenMonths };
  }, [investment, rent, staff, expenses, sales]);

  const fmt = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  const fields = [
    {
      label: "Investment",
      value: investment,
      set: setInvestment,
      min: 500000,
      max: 4000000,
      step: 50000,
    },
    {
      label: "Store Rent (monthly)",
      value: rent,
      set: setRent,
      min: 8000,
      max: 150000,
      step: 1000,
    },
    {
      label: "Staff Cost (monthly)",
      value: staff,
      set: setStaff,
      min: 10000,
      max: 150000,
      step: 1000,
    },
    {
      label: "Other Monthly Expenses",
      value: expenses,
      set: setExpenses,
      min: 5000,
      max: 100000,
      step: 1000,
    },
    {
      label: "Expected Monthly Sales",
      value: sales,
      set: setSales,
      min: 100000,
      max: 3000000,
      step: 10000,
    },
  ];

  const isPositive = results.monthlyProfit >= 0;

  return (
    <div className={styles.calcCard}>
      <div className={styles.calcHeader}>
        <span className={styles.calcRule} />
        <motion.div
          key={results.roi.toFixed(1)}
          className={styles.medalWrap}
          initial={{ scale: 0.94, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <span className={styles.medalCharm}>
            <GiDiamondRing />
          </span>
          <svg viewBox="0 0 160 160" className={styles.medalSvg}>
            <defs>
              <radialGradient id="medalGrad" cx="35%" cy="28%" r="78%">
                <stop offset="0%" stopColor="#fdf3d8" />
                <stop offset="55%" stopColor="#e8ce8a" />
                <stop offset="100%" stopColor="#9c7a32" />
              </radialGradient>
            </defs>
            <circle cx="80" cy="80" r="75" className={styles.medalOuterDash} />
            <circle cx="80" cy="80" r="64" className={styles.medalOuterRing} />
            <circle cx="80" cy="80" r="58" fill="url(#medalGrad)" />
          </svg>
          <div className={styles.medalCenter}>
            <span className={styles.medalRoi}>{results.roi.toFixed(1)}%</span>
            <span className={styles.medalLabel}>Annual ROI</span>
          </div>
        </motion.div>
        <span className={styles.calcRule} />
      </div>

      <p className={styles.calcInputsHead}>Adjust Your Numbers</p>
      <div className={styles.calcSlidersGrid}>
        {fields.map((f) => (
          <div className={styles.calcField} key={f.label}>
            <div className={styles.calcFieldTop}>
              <label>{f.label}</label>
              <span>{fmt(f.value)}</span>
            </div>
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={f.value}
              onChange={(e) => f.set(Number(e.target.value))}
              className={styles.calcSlider}
            />
          </div>
        ))}
      </div>

      <div className={styles.calcLedger}>
        <div className={styles.calcLedgerItem}>
          <span>Monthly Profit</span>
          <strong
            className={
              isPositive ? styles.profitPositive : styles.profitNegative
            }
          >
            {fmt(results.monthlyProfit)}
          </strong>
        </div>
        <span className={styles.calcLedgerDivider} />
        <div className={styles.calcLedgerItem}>
          <span>Break-even</span>
          <strong>
            {results.breakEvenMonths
              ? `${results.breakEvenMonths} months`
              : "—"}
          </strong>
        </div>
        <span className={styles.calcLedgerDivider} />
        <div className={styles.calcLedgerItem}>
          <span>Annual ROI</span>
          <strong>{results.roi.toFixed(1)}%</strong>
        </div>
      </div>

      <p className={styles.calcNote}>
        Estimates only, based on a 35% average category margin.
      </p>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Testimonial Carousel                                             */
/* ---------------------------------------------------------------- */

const TestimonialCarousel = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % TESTIMONIALS.length),
      4500,
    );
    return () => clearInterval(id);
  }, [paused]);

  const t = TESTIMONIALS[index];

  return (
    <div
      className={styles.testimonialWrap}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className={styles.testimonialCard}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.5 }}
        >
          <FaQuoteLeft className={styles.quoteIcon} />
          <p className={styles.testimonialQuote}>{t.quote}</p>
          <div className={styles.testimonialFooter}>
            <div className={styles.testimonialAvatar}>
              {t.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className={styles.testimonialName}>{t.name}</p>
              <p className={styles.testimonialMeta}>
                <FaMapMarkerAlt /> {t.city} · {t.revenue}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className={styles.testimonialControls}>
        <button
          onClick={() =>
            setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
          }
          aria-label="Previous testimonial"
        >
          <FaChevronLeft />
        </button>
        <div className={styles.testimonialDots}>
          {TESTIMONIALS.map((_, i) => (
            <span
              key={i}
              className={i === index ? styles.dotActive : styles.dot}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          onClick={() => setIndex((i) => (i + 1) % TESTIMONIALS.length)}
          aria-label="Next testimonial"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* FAQ Accordion                                                    */
/* ---------------------------------------------------------------- */

const FaqAccordion = () => {
  const [open, setOpen] = useState(0);
  return (
    <div className={styles.faqList}>
      {FAQS.map((item, i) => (
        <div key={item.q} className={styles.faqItem}>
          <button
            className={styles.faqQuestion}
            onClick={() => setOpen(open === i ? -1 : i)}
            aria-expanded={open === i}
          >
            <span>{item.q}</span>
            <motion.span
              animate={{ rotate: open === i ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaChevronDown />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                className={styles.faqAnswerWrap}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <p className={styles.faqAnswer}>{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Inquiry Form                                                     */
/* ---------------------------------------------------------------- */

const InquiryForm = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    budget: "",
    size: "",
    experience: "",
    message: "",
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const update = (key) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!/^[0-9]{10}$/.test(form.phone.trim()))
      next.phone = "Enter a valid 10-digit phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Enter a valid email address";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.state.trim()) next.state = "State is required";
    if (!form.budget) next.budget = "Select a budget range";
    if (!form.agree) next.agree = "Please accept the terms to continue";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ✅ UPDATED — now actually submits to the backend instead of using a
  // fake setTimeout. Stores the enquiry in MongoDB and makes it visible
  // under Super Admin → Customer Requests → Franchise Enquiries.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/franchise/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit your inquiry");
      }

      setStatus("success");
    } catch (error) {
      console.error("❌ Franchise submit error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        className={styles.formSuccess}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        >
          <FaCheckCircle className={styles.successIcon} />
        </motion.div>
        <h3>Thank you, {form.name.split(" ")[0]}!</h3>
        <p>
          Your franchise inquiry has been received. Our team will reach out
          within 48 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <form className={styles.inquiryForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.formGrid}>
        <Field label="Full Name" error={errors.name}>
          <input
            value={form.name}
            onChange={update("name")}
            placeholder="Your full name"
          />
        </Field>
        <Field label="Phone Number" error={errors.phone}>
          <input
            value={form.phone}
            onChange={update("phone")}
            placeholder="10-digit mobile number"
          />
        </Field>
        <Field label="Email Address" error={errors.email}>
          <input
            value={form.email}
            onChange={update("email")}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="City" error={errors.city}>
          <input
            value={form.city}
            onChange={update("city")}
            placeholder="Your city"
          />
        </Field>
        <Field label="State" error={errors.state}>
          <input
            value={form.state}
            onChange={update("state")}
            placeholder="Your state"
          />
        </Field>
        <Field label="Investment Budget" error={errors.budget}>
          <select value={form.budget} onChange={update("budget")}>
            <option value="">Select a range</option>
            <option>₹8L – 12L</option>
            <option>₹15L – 22L</option>
            <option>₹28L – 40L</option>
            <option>40L+</option>
          </select>
        </Field>
        <Field label="Preferred Store Size">
          <select value={form.size} onChange={update("size")}>
            <option value="">Select size</option>
            <option>150 – 250 sq.ft.</option>
            <option>300 – 450 sq.ft.</option>
            <option>600+ sq.ft.</option>
          </select>
        </Field>
        <Field label="Business Experience">
          <select value={form.experience} onChange={update("experience")}>
            <option value="">Select experience</option>
            <option>First-time business owner</option>
            <option>1–5 years running a business</option>
            <option>5+ years running a business</option>
          </select>
        </Field>
      </div>

      <Field label="Message" full>
        <textarea
          rows={4}
          value={form.message}
          onChange={update("message")}
          placeholder="Tell us a little about your plans, location, or questions..."
        />
      </Field>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={form.agree}
          onChange={update("agree")}
        />
        <span>I agree to Aurevian's Franchise Terms &amp; Conditions</span>
      </label>
      {errors.agree && <p className={styles.fieldError}>{errors.agree}</p>}

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <span className={styles.spinner} />
        ) : (
          "Become a Franchise Partner"
        )}
      </button>
    </form>
  );
};

const Field = ({ label, error, children, full }) => (
  <div
    className={`${styles.field} ${full ? styles.fieldFull : ""} ${error ? styles.fieldInvalid : ""}`}
  >
    <label>{label}</label>
    {children}
    {error && <p className={styles.fieldError}>{error}</p>}
  </div>
);

/* ---------------------------------------------------------------- */
/* Page                                                             */
/* ---------------------------------------------------------------- */

const Franchise = () => {
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 700);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
    <Header/>
      <Helmet>
        <title>Aurevian Jewellery Franchise | Become a Franchise Partner</title>
        <meta
          name="description"
          content="Start your own Aurevian Jewellery Franchise and become part of India's premium anti-tarnish jewellery brand. Low investment, high returns, complete business support."
        />
        <meta
          property="og:title"
          content="Aurevian Jewellery Franchise | Become a Franchise Partner"
        />
        <meta
          property="og:description"
          content="Start your own Aurevian Jewellery Franchise and become part of India's premium anti-tarnish jewellery brand."
        />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FranchiseOffer",
            name: "Aurevian Jewellery Franchise",
            description:
              "Franchise opportunity with India's premium anti-tarnish jewellery brand.",
          })}
        </script>
      </Helmet>

      <Header />

      <main className={styles.page}>
        {/* ---------------- HERO ---------------- */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <motion.div
              className={styles.heroLeft}
              initial="hidden"
              animate="show"
              variants={stagger}
            >
              <motion.p variants={fadeUp} className={styles.heroTopEyebrow}>
                Partner With A Premium Jewellery Brand
              </motion.p>
              <motion.div
                variants={fadeUp}
                className={styles.heroTopDivider}
                aria-hidden="true"
              >
                <span className={styles.heroTopDividerLine} />
                <span className={styles.heroTopDividerMark} />
              </motion.div>

              <motion.h1 variants={fadeUp} className={styles.heroHeading}>
                Build Your Own <span className={styles.goldText}>Aurevian</span>{" "}
                Jewellery Business
              </motion.h1>

              <motion.p variants={fadeUp} className={styles.heroSub}>
                A premium retail opportunity designed for ambitious
                entrepreneurs.
              </motion.p>

              <motion.div variants={fadeUp} className={styles.heroButtons}>
                <a href="#inquiry" className={styles.btnPrimary}>
                  <FaStoreAlt /> Explore Franchise
                </a>
                <a
                  href="/aurevian-franchise-brochure.pdf"
                  className={styles.btnSecondary}
                  download
                >
                  <HiOutlineDownload /> Download Brochure
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              className={styles.heroRight}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.heroImageFrame}>
                <img
                  src={franchiseHero}
                  alt="Aurevian Franchise"
                  className={styles.heroImage}
                />
                <span className={styles.heroImageCorner} data-corner="tl" />
                <span className={styles.heroImageCorner} data-corner="br" />
              </div>
            </motion.div>
          </div>

          <Reveal className={styles.heroFeatureStripWrap}>
            <HeroFeatureStrip />
          </Reveal>
        </section>

        {/* ---------------- WHY PARTNER ---------------- */}
        <section className={styles.section}>
          <Reveal className={styles.sectionHead}>
            <p className={styles.simpleEyebrow}>Why Aurevian</p>
            <h2>Why Partner With Aurevian</h2>
            <p>Everything you need to run a store, not just stock it.</p>
          </Reveal>

          <WhyPartnerList />
        </section>

        {/* ---------------- INVESTMENT PLANS ---------------- */}
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <Reveal className={styles.sectionHead}>
            <p className={styles.simpleEyebrow}>Investment Plans</p>
            <h2>Choose Your Format</h2>
            <p>Three formats, one profit-first franchise model.</p>
          </Reveal>

          <div className={styles.plansGrid}>
            {PLANS.map((plan, i) => (
              <Reveal
                key={plan.name}
                className={`${styles.planCard} ${plan.highlight ? styles.planHighlight : ""}`}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 40,
                    scale: plan.highlight ? 0.96 : 1,
                  },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: plan.highlight ? 1.03 : 1,
                    transition: { duration: 0.6, delay: i * 0.1 },
                  },
                }}
              >
                {plan.highlight && (
                  <span className={styles.planBadge}>Most Popular</span>
                )}
                <h3>{plan.name}</h3>
                <p className={styles.planInvestment}>{plan.investment}</p>
                <ul className={styles.planList}>
                  <li>
                    <span>Store Size</span>
                    <strong>{plan.size}</strong>
                  </li>
                  <li>
                    <span>Expected ROI</span>
                    <strong>{plan.roi}</strong>
                  </li>
                  <li>
                    <span>Inventory</span>
                    <strong>{plan.inventory}</strong>
                  </li>
                  <li>
                    <span>Support</span>
                    <strong>{plan.support}</strong>
                  </li>
                  <li>
                    <span>Marketing</span>
                    <strong>{plan.marketing}</strong>
                  </li>
                  <li>
                    <span>Franchise Fee</span>
                    <strong>{plan.fee}</strong>
                  </li>
                  <li>
                    <span>Interior Design</span>
                    <strong>{plan.interior}</strong>
                  </li>
                </ul>
                <a
                  href="#inquiry"
                  className={
                    plan.highlight ? styles.btnPrimary : styles.btnOutline
                  }
                >
                  Apply for {plan.name}
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------- HOW IT WORKS ---------------- */}
        <section className={styles.section}>
          <Reveal className={styles.sectionHead}>
            <p className={styles.simpleEyebrow}>Process</p>
            <h2>How It Works</h2>
            <p>From application to opening day, in six clear steps.</p>
          </Reveal>

          <motion.div
            className={styles.timeline}
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            <span className={styles.timelineLine} />
            {TIMELINE_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                className={styles.timelineStep}
                variants={fadeUp}
              >
                <span className={styles.timelineDot}>{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ---------------- PROFIT CALCULATOR ---------------- */}
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <Reveal className={styles.sectionHead}>
            <p className={styles.simpleEyebrow}>Plan Your Numbers</p>
            <h2>Profit Calculator</h2>
            <p>
              Move the sliders to estimate your store's monthly profit and ROI.
            </p>
          </Reveal>
          <Reveal>
            <ProfitCalculator />
          </Reveal>
        </section>

        {/* ---------------- COLLECTIONS ---------------- */}
        <section className={styles.section}>
          <Reveal className={styles.sectionHead}>
            <p className={styles.simpleEyebrow}>Our Collections</p>
            <h2>What You'll Be Selling</h2>
            <p>
              Six signature categories, refreshed every month with what's
              actually trending.
            </p>
          </Reveal>

          <CollectionShowcase />

          <div className={styles.featurePills}>
            {[
              "Anti-Tarnish",
              "Waterproof",
              "Hypoallergenic",
              "1 Year Warranty",
            ].map((f) => (
              <span key={f} className={styles.pill}>
                {f}
              </span>
            ))}
          </div>
        </section>

        {/* ---------------- THE AUREVIAN PROMISE ---------------- */}
        <section
          className={`${styles.section} ${styles.sectionAlt} ${styles.promiseSection}`}
        >
          <div className={styles.promiseBg} aria-hidden="true">
            <span
              className={`${styles.promiseBlur} ${styles.promiseBlurLeft}`}
            />
            <span
              className={`${styles.promiseBlur} ${styles.promiseBlurRight}`}
            />
          </div>

          <div className={styles.promiseInner}>
            <Reveal className={styles.promiseHead}>
              <p className={styles.promiseEyebrow}>The Aurevian Promise</p>
              <div className={styles.promiseDivider} aria-hidden="true">
                <span className={styles.promiseDividerLine} />
                <span className={styles.promiseDividerMark} />
                <span className={styles.promiseDividerLine} />
              </div>
              <h2 className={styles.promiseHeading}>
                Jewellery designed with intention.
                <br />
                Made to be cherished.
              </h2>
            </Reveal>

            <AurevianPromiseGrid />
          </div>
        </section>

        {/* ---------------- BUSINESS SUPPORT ---------------- */}
        <section className={styles.section}>
          <Reveal className={styles.sectionHead}>
            <p className={styles.simpleEyebrow}>We Provide</p>
            <h2>Complete Business Support</h2>
          </Reveal>

          <SupportFlow />
        </section>

        {/* ---------------- SUCCESS NUMBERS ---------------- */}
        <section className={styles.successRibbon}>
          <div className={styles.successInner}>
            {SUCCESS_NUMBERS.map((n, i) => (
              <React.Fragment key={n.label}>
                <div className={styles.successItem}>
                  <strong>
                    <CountUp value={n.value} suffix={n.suffix} />
                  </strong>
                  <span>{n.label}</span>
                </div>
                {i < SUCCESS_NUMBERS.length - 1 && (
                  <span className={styles.successDivider} aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* ---------------- TESTIMONIALS ---------------- */}
        <section className={styles.section}>
          <Reveal className={styles.sectionHead}>
            <p className={styles.simpleEyebrow}> Partner Stories</p>
            <h2>What Our Partners Say</h2>
          </Reveal>
          <Reveal>
            <TestimonialCarousel />
          </Reveal>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <Reveal className={styles.sectionHead}>
            <p className={styles.simpleEyebrow}>Questions</p>
            <h2>Frequently Asked Questions</h2>
          </Reveal>
          <Reveal className={styles.faqWrap}>
            <FaqAccordion />
          </Reveal>
        </section>

        {/* ---------------- INQUIRY FORM ---------------- */}
        <section className={styles.section} id="inquiry">
          <Reveal className={styles.sectionHead}>
            <p className={styles.simpleEyebrow}>Get Started</p>
            <h2>Franchise Inquiry Form</h2>
            <p>Tell us about you — we'll get back within 48 hours.</p>
          </Reveal>
          <Reveal className={styles.formCard}>
            <InquiryForm />
          </Reveal>
        </section>

        {/* ---------------- TRUST SECTION ---------------- */}
        <section className={styles.trustSection}>
          <div className={styles.trustInner}>
            {TRUST_POINTS.map((t) => (
              <div key={t.label} className={styles.trustItem}>
                <span>{t.icon}</span>
                <p>{t.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- FOOTER CTA ---------------- */}
        <section className={styles.footerCta}>
          <div className={styles.footerCtaBg} aria-hidden="true" />
          <Reveal className={styles.footerCtaInner}>
            <GiFactory className={styles.footerCtaIcon} />
            <h2>Ready to Build Your Jewellery Business?</h2>
            <p>Join Aurevian's growing franchise network today.</p>
            <a href="#inquiry" className={styles.btnPrimary}>
              Apply for Franchise
            </a>
          </Reveal>
        </section>
      </main>

      <Footer />

      {/* ---------------- STICKY CTA ---------------- */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.a
            href="#inquiry"
            className={styles.stickyDesktop}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
          >
            <FaHandshake /> Become Partner
          </motion.a>
        )}
      </AnimatePresence>
      <div className={styles.stickyMobile}>
        <a href="#inquiry">Apply Now</a>
      </div>
    </>
  );
};

export default Franchise;