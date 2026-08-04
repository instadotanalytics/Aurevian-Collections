
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./ProductDetail.module.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import solitaireBand from "../../../assets/solitaire-band.jpg";
import layeredChain from "../../../assets/layered-chain.jpg";
import dropStuds from "../../../assets/drop-studs.jpg";
import charmBracelet from "../../../assets/charm-bracelet.jpg";
import stackRingSet from "../../../assets/stack-ring-set.jpg";
import beadedAnklet from "../../../assets/beaded-anklet.jpg";
import bridalJewelSet from "../../../assets/bridal-jewel-set.jpg";
import hoopEarrings from "../../../assets/hoop-earrings.jpg";
import pendantChain from "../../../assets/pendant-chain.jpg";
import twistBand from "../../../assets/twist-band.jpg";
import multipleChainBracelets from "../../../assets/multiple-chain-braclets.jpg";
import pearlStuds from "../../../assets/pearl-studs.jpg";

import {
  FiHeart,
  FiStar,
  FiMinus,
  FiPlus,
  FiTruck,
  FiRefreshCw,
  FiShield,
  FiShoppingBag,
  FiCheck,
  FiChevronRight,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

/* ============================================================
   PRODUCT CATALOG
   In a real app this would come from an API / shared data
   module keyed by id. Kept local here so this page works
   standalone, matching the products used on the Shop page.
   ============================================================ */
const catalog = [
  {
    id: 1,
    badge: "30% off",
    category: "Rings",
    name: "Aurevian Solitaire Band",
    priceNow: 2100,
    priceOld: 3000,
    image: solitaireBand,
    rating: 4.6,
    reviewCount: 128,
    sku: "AUR-RG-001",
    metal: "18K Gold Plated Brass",
    stone: "Cubic Zirconia",
    description:
      "A single brilliant-cut stone set on a slim polished band. Understated enough for daily wear, striking enough to be the only ring you need.",
    details: [
      "18K gold plating over brass base",
      "Hand-set cubic zirconia centre stone",
      "Tarnish resistant, water safe",
      "Comes in a signature Aurevian gift box",
    ],
  },
  {
    id: 2,
    badge: "20% off",
    category: "Necklaces",
    name: "Layla Layered Chain",
    priceNow: 3400,
    priceOld: 4250,
    image: layeredChain,
    rating: 4.8,
    reviewCount: 96,
    sku: "AUR-NK-002",
    metal: "Gold Plated Brass",
    stone: "—",
    description:
      "Three fine chains layered to fall at different lengths, designed to be worn together or apart depending on the day.",
    details: [
      "Three-layer chain design",
      "Adjustable extension clasp",
      "Lightweight, comfortable for all-day wear",
      "Comes in a signature Aurevian gift box",
    ],
  },
  {
    id: 3,
    badge: "25% off",
    category: "Earrings",
    name: "Amara Drop Studs",
    priceNow: 1650,
    priceOld: 2200,
    image: dropStuds,
    rating: 4.5,
    reviewCount: 74,
    sku: "AUR-ER-003",
    metal: "Rose Gold Plated Brass",
    stone: "Cubic Zirconia",
    description:
      "A soft drop silhouette that catches light with every movement. Secure butterfly backing for comfortable all-day wear.",
    details: [
      "Rose gold plated finish",
      "Hypoallergenic butterfly backing",
      "Lightweight drop design",
      "Comes in a signature Aurevian gift box",
    ],
  },
  {
    id: 4,
    badge: "40% off",
    category: "Bracelets",
    name: "Celeste Charm Bracelet",
    priceNow: 1800,
    priceOld: 3000,
    image: charmBracelet,
    rating: 4.4,
    reviewCount: 51,
    sku: "AUR-BR-004",
    metal: "Gold Plated Brass",
    stone: "—",
    description:
      "A delicate chain bracelet finished with a cluster of charms that move and catch light with the wrist.",
    details: [
      "Adjustable chain, fits most wrists",
      "Lobster clasp closure",
      "Tarnish resistant plating",
      "Comes in a signature Aurevian gift box",
    ],
  },
  {
    id: 5,
    badge: "15% off",
    category: "Rings",
    name: "Noor Stack Ring Set",
    priceNow: 1275,
    priceOld: 1500,
    image: stackRingSet,
    rating: 4.7,
    reviewCount: 63,
    sku: "AUR-RG-005",
    metal: "Gold Plated Brass",
    stone: "—",
    description:
      "Three slim bands designed to be stacked, mixed, and worn in whatever order feels right that day.",
    details: [
      "Set of three stackable bands",
      "Mix-and-match textures",
      "Tarnish resistant plating",
      "Comes in a signature Aurevian gift box",
    ],
  },
  {
    id: 6,
    badge: "50% off",
    category: "Anklets",
    name: "Meera Beaded Anklet",
    priceNow: 950,
    priceOld: 1900,
    image: beadedAnklet,
    rating: 4.3,
    reviewCount: 39,
    sku: "AUR-AK-006",
    metal: "Gold Plated Brass",
    stone: "Glass Beads",
    description:
      "Fine beadwork on a delicate gold chain, light enough to forget you're wearing it.",
    details: [
      "Hand-strung glass beads",
      "Adjustable extension chain",
      "Water resistant plating",
      "Comes in a signature Aurevian gift box",
    ],
  },
  {
    id: 7,
    badge: "10% off",
    category: "Bridal Sets",
    name: "Anaya Bridal Jewel Set",
    priceNow: 6300,
    priceOld: 7000,
    image: bridalJewelSet,
    rating: 4.9,
    reviewCount: 41,
    sku: "AUR-BS-007",
    metal: "22K Gold Plated Brass",
    stone: "Cubic Zirconia, Pearl Accents",
    description:
      "A complete bridal set, necklace, earrings, and maang tikka, designed as one cohesive statement for the big day.",
    details: [
      "Necklace, earrings and maang tikka included",
      "22K gold plated finish",
      "Adjustable dori closure",
      "Presented in a premium bridal gift box",
    ],
  },
  {
    id: 8,
    badge: "35% off",
    category: "Earrings",
    name: "Zoya Hoop Earrings",
    priceNow: 1300,
    priceOld: 2000,
    image: hoopEarrings,
    rating: 4.6,
    reviewCount: 88,
    sku: "AUR-ER-008",
    metal: "Gold Plated Brass",
    stone: "—",
    description:
      "Classic medium hoops with a polished finish, the kind of earrings you reach for on repeat.",
    details: [
      "Medium 3cm hoop diameter",
      "Secure hinge closure",
      "Lightweight for all-day wear",
      "Comes in a signature Aurevian gift box",
    ],
  },
  {
    id: 9,
    badge: "45% off",
    category: "Necklaces",
    name: "Ishani Pendant Chain",
    priceNow: 2750,
    priceOld: 5000,
    image: pendantChain,
    rating: 4.7,
    reviewCount: 102,
    sku: "AUR-NK-009",
    metal: "Gold Plated Brass",
    stone: "Cubic Zirconia",
    description:
      "A single teardrop pendant on a fine chain, designed to sit just below the collarbone.",
    details: [
      "18-inch chain with 2-inch extender",
      "Hand-set centre stone",
      "Tarnish resistant plating",
      "Comes in a signature Aurevian gift box",
    ],
  },
  {
    id: 10,
    badge: "20% off",
    category: "Rings",
    name: "Kavya Twist Band",
    priceNow: 2400,
    priceOld: 3000,
    image: twistBand,
    rating: 4.5,
    reviewCount: 47,
    sku: "AUR-RG-010",
    metal: "Gold Plated Brass",
    stone: "—",
    description:
      "A sculptural twist silhouette that wraps the finger, polished to a soft high shine.",
    details: [
      "Sculptural twist design",
      "High polish finish",
      "Tarnish resistant plating",
      "Comes in a signature Aurevian gift box",
    ],
  },
  {
    id: 11,
    badge: "30% off",
    category: "Bracelets",
    name: "Riya Chain Bracelet",
    priceNow: 1950,
    priceOld: 2800,
    image: multipleChainBracelets,
    rating: 4.4,
    reviewCount: 33,
    sku: "AUR-BR-011",
    metal: "Gold Plated Brass",
    stone: "—",
    description:
      "Multiple fine chains bundled into one bracelet for a layered look without the effort.",
    details: [
      "Multi-chain bundled design",
      "Adjustable clasp",
      "Tarnish resistant plating",
      "Comes in a signature Aurevian gift box",
    ],
  },
  {
    id: 12,
    badge: "25% off",
    category: "Earrings",
    name: "Sana Pearl Studs",
    priceNow: 1450,
    priceOld: 1950,
    image: pearlStuds,
    rating: 4.8,
    reviewCount: 115,
    sku: "AUR-ER-012",
    metal: "Gold Plated Brass",
    stone: "Freshwater Pearl",
    description:
      "A single freshwater pearl set in a delicate gold surround, timeless enough for every occasion.",
    details: [
      "Genuine freshwater pearl",
      "Hypoallergenic push backing",
      "Lightweight stud design",
      "Comes in a signature Aurevian gift box",
    ],
  },
];

const perks = [
  {
    icon: <FiTruck />,
    title: "Free Shipping",
    text: "On all orders above ₹2,000",
  },
  {
    icon: <FiRefreshCw />,
    title: "Easy Returns",
    text: "15-day hassle-free exchange",
  },
  {
    icon: <FiShield />,
    title: "Certified Quality",
    text: "Tarnish resistant, skin safe",
  },
];

/* ============================================================
   SAMPLE REVIEWS
   Demo reviews reused across products. Swap for real,
   product-specific review data from your API when ready.
   ============================================================ */
const sampleReviews = [
  {
    id: 1,
    name: "Ananya R.",
    initials: "AR",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Exceeded expectations. The finish looks far more premium than the price suggests, and it hasn't tarnished after daily wear.",
  },
  {
    id: 2,
    name: "Kabir M.",
    initials: "KM",
    rating: 4,
    date: "1 month ago",
    comment:
      "Really happy with this purchase. Packaging was lovely too, made it feel like a proper gift straight out of the box.",
  },
  {
    id: 3,
    name: "Simran K.",
    initials: "SK",
    rating: 5,
    date: "1 month ago",
    comment:
      "Exactly as pictured, comfortable to wear all day and the gold tone hasn't faded even a bit.",
  },
  {
    id: 4,
    name: "Rohan D.",
    initials: "RD",
    rating: 4,
    date: "2 months ago",
    comment:
      "Good quality for the price. Delivery was quick and the piece feels sturdier than I expected.",
  },
];

/* Rating breakdown used for the summary bars. Demo percentages;
   swap for real aggregated review data when available. */
const ratingBreakdown = [
  { stars: 5, pct: 68 },
  { stars: 4, pct: 21 },
  { stars: 3, pct: 7 },
  { stars: 2, pct: 3 },
  { stars: 1, pct: 1 },
];

export default function ProductDetail() {
  const { id } = useParams();
  const product =
    catalog.find((p) => String(p.id) === String(id)) || catalog[0];

  const related = catalog
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const gallery = [product.image, product.image, product.image];

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () => setQuantity((q) => Math.min(10, q + 1));

  const discountPct = Math.round(
    ((product.priceOld - product.priceNow) / product.priceOld) * 100
  );

  const renderStars = (value) =>
    Array.from({ length: 5 }).map((_, i) => (
      <FiStar
        key={i}
        className={
          i < Math.round(value) ? styles.starFilled : styles.starEmpty
        }
      />
    ));

  return (
    <div className={styles.page}>
      {/* ================= HEADER ================= */}
      <Header />

      <div className={styles.mainContent}>
        {/* ================= BREADCRUMB ================= */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <FiChevronRight className={styles.crumbSep} />
          <Link to="/shop">Shop</Link>
          <FiChevronRight className={styles.crumbSep} />
          <span className={styles.crumbCurrent}>{product.category}</span>
        </nav>

        {/* ================= PRODUCT MAIN ================= */}
        <section className={styles.productMain}>
          {/* ---------- Gallery ---------- */}
          <div className={styles.gallery}>
            <div className={styles.thumbColumn}>
              {gallery.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  className={`${styles.thumbBtn} ${
                    activeImage === i ? styles.thumbBtnActive : ""
                  }`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>

            <div className={styles.mainImageWrap}>
              <span className={styles.badge}>{product.badge}</span>
              <button
                type="button"
                className={`${styles.wishlistBtn} ${
                  wishlisted ? styles.wishlistBtnActive : ""
                }`}
                onClick={() => setWishlisted((w) => !w)}
                aria-label={
                  wishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                {wishlisted ? <FaHeart /> : <FiHeart />}
              </button>
              <img
                src={gallery[activeImage]}
                alt={product.name}
                className={styles.mainImage}
              />
            </div>
          </div>

          {/* ---------- Info ---------- */}
          <div className={styles.info}>
            <span className={styles.categoryTag}>{product.category}</span>
            <h1 className={styles.productTitle}>{product.name}</h1>

            <div className={styles.ratingRow}>
              <div className={styles.stars}>{renderStars(product.rating)}</div>
              <span className={styles.ratingValue}>{product.rating}</span>
              <span className={styles.reviewCount}>
                ({product.reviewCount} reviews)
              </span>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.priceNow}>
                ₹{product.priceNow.toLocaleString("en-IN")}
              </span>
              <span className={styles.priceOld}>
                ₹{product.priceOld.toLocaleString("en-IN")}
              </span>
              <span className={styles.discountPill}>{discountPct}% off</span>
            </div>

            <p className={styles.shortDesc}>{product.description}</p>

            {/* ---------- Quantity + Add to cart ---------- */}
            <div className={styles.actionsRow}>
              <div className={styles.qtyStepper}>
                <button
                  type="button"
                  onClick={decreaseQty}
                  aria-label="Decrease quantity"
                >
                  <FiMinus />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={increaseQty}
                  aria-label="Increase quantity"
                >
                  <FiPlus />
                </button>
              </div>

              <button
                type="button"
                className={`${styles.addToCartBtn} ${
                  added ? styles.addToCartBtnActive : ""
                }`}
                onClick={() => setAdded(true)}
                disabled={added}
              >
                {added ? (
                  <>
                    <FiCheck /> Added to Cart
                  </>
                ) : (
                  <>
                    <FiShoppingBag /> Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* ---------- Meta ---------- */}
            <div className={styles.metaList}>
              <div className={styles.metaRow}>
                <span>SKU</span>
                <span>{product.sku}</span>
              </div>
              <div className={styles.metaRow}>
                <span>Metal</span>
                <span>{product.metal}</span>
              </div>
              <div className={styles.metaRow}>
                <span>Stone</span>
                <span>{product.stone}</span>
              </div>
            </div>

            {/* ---------- Perks ---------- */}
            <div className={styles.perksInline}>
              {perks.map((perk) => (
                <div className={styles.perkInline} key={perk.title}>
                  <span className={styles.perkInlineIcon}>{perk.icon}</span>
                  <div>
                    <div className={styles.perkInlineTitle}>
                      {perk.title}
                    </div>
                    <div className={styles.perkInlineText}>{perk.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TABS ================= */}
        <section className={styles.tabsSection}>
          <div className={styles.tabsHeader}>
            <button
              type="button"
              className={`${styles.tabBtn} ${
                activeTab === "description" ? styles.tabBtnActive : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${
                activeTab === "details" ? styles.tabBtnActive : ""
              }`}
              onClick={() => setActiveTab("details")}
            >
              Details &amp; Care
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${
                activeTab === "shipping" ? styles.tabBtnActive : ""
              }`}
              onClick={() => setActiveTab("shipping")}
            >
              Shipping &amp; Returns
            </button>
          </div>

          <div className={styles.tabsBody}>
            {activeTab === "description" && <p>{product.description}</p>}

            {activeTab === "details" && (
              <ul className={styles.detailsList}>
                {product.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}

            {activeTab === "shipping" && (
              <ul className={styles.detailsList}>
                <li>Free shipping on all orders above ₹2,000</li>
                <li>Standard delivery in 4–6 business days</li>
                <li>15-day easy exchange on unworn, tagged items</li>
                <li>Return shipping is free for defective items</li>
              </ul>
            )}
          </div>
        </section>

        {/* ================= REVIEWS ================= */}
        <section className={styles.reviewsSection}>
          <h2 className={styles.reviewsHeading}>Customer Reviews</h2>

          <div className={styles.reviewsSummary}>
            <div className={styles.reviewsScoreBlock}>
              <div className={styles.reviewsScore}>{product.rating}</div>
              <div className={styles.stars}>{renderStars(product.rating)}</div>
              <div className={styles.reviewsScoreCount}>
                Based on {product.reviewCount} reviews
              </div>
            </div>

            <div className={styles.reviewsBreakdown}>
              {ratingBreakdown.map((row) => (
                <div className={styles.breakdownRow} key={row.stars}>
                  <span className={styles.breakdownLabel}>
                    {row.stars} <FiStar />
                  </span>
                  <div className={styles.breakdownBarTrack}>
                    <div
                      className={styles.breakdownBarFill}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className={styles.breakdownPct}>{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.reviewsList}>
            {sampleReviews.map((r) => (
              <div className={styles.reviewCard} key={r.id}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewAvatar}>{r.initials}</span>
                  <div className={styles.reviewHeaderText}>
                    <div className={styles.reviewName}>{r.name}</div>
                    <div className={styles.stars}>{renderStars(r.rating)}</div>
                  </div>
                  <span className={styles.reviewDate}>{r.date}</span>
                </div>
                <p className={styles.reviewText}>{r.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= RELATED PRODUCTS ================= */}
        {related.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedHeading}>You May Also Like</h2>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <Link
                  to={`/product/${p.id}`}
                  className={styles.relatedCard}
                  key={p.id}
                >
                  <div className={styles.relatedMedia}>
                    <span className={styles.relatedBadge}>{p.badge}</span>
                    <img src={p.image} alt={p.name} />
                  </div>
                  <div className={styles.relatedInfo}>
                    <div className={styles.relatedName}>{p.name}</div>
                    <div className={styles.relatedPrice}>
                      <span className={styles.priceNow}>
                        ₹{p.priceNow.toLocaleString("en-IN")}
                      </span>
                      <span className={styles.priceOld}>
                        ₹{p.priceOld.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

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