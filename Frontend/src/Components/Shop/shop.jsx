import React from "react";
import styles from "./shop.module.css";
import Header from "../../Pages/Layout/Header/Header";
import Footer from "../../Pages/Layout/Footer/Footer";

const categories = [
  { name: "Rings", count: 32 },
  { name: "Necklaces", count: 28 },
  { name: "Earrings", count: 40 },
  { name: "Bracelets", count: 19 },
  { name: "Anklets", count: 11 },
  { name: "Bridal Sets", count: 8 },
];

const metals = [
  { name: "Gold Plated", count: 36 },
  { name: "Rose Gold", count: 24 },
  { name: "Silver", count: 21 },
  { name: "Oxidised", count: 14 },
];

const reviewStars = ["★★★★★", "★★★★☆", "★★★☆☆", "★★☆☆☆", "★☆☆☆☆"];

const promotions = ["New Arrivals", "Best Sellers", "On Sale"];

const availability = [
  { name: "In Stock", count: 98 },
  { name: "Out of Stock", count: 6 },
];

const products = [
  {
    id: 1,
    badge: "30% off",
    category: "Rings",
    name: "Aurevian Solitaire Band",
    priceNow: "₹2,100",
    priceOld: "₹3,000",
    rating: 4.8,
  },
  {
    id: 2,
    badge: "20% off",
    category: "Necklaces",
    name: "Layla Layered Chain",
    priceNow: "₹3,400",
    priceOld: "₹4,250",
    rating: 4.6,
  },
  {
    id: 3,
    badge: "25% off",
    category: "Earrings",
    name: "Amara Drop Studs",
    priceNow: "₹1,650",
    priceOld: "₹2,200",
    rating: 5.0,
  },
  {
    id: 4,
    badge: "40% off",
    category: "Bracelets",
    name: "Celeste Charm Bracelet",
    priceNow: "₹1,800",
    priceOld: "₹3,000",
    rating: 4.9,
  },
  {
    id: 5,
    badge: "15% off",
    category: "Rings",
    name: "Noor Stack Ring Set",
    priceNow: "₹1,275",
    priceOld: "₹1,500",
    rating: 4.7,
  },
  {
    id: 6,
    badge: "50% off",
    category: "Anklets",
    name: "Meera Beaded Anklet",
    priceNow: "₹950",
    priceOld: "₹1,900",
    rating: 4.5,
  },
  {
    id: 7,
    badge: "10% off",
    category: "Bridal Sets",
    name: "Anaya Bridal Jewel Set",
    priceNow: "₹6,300",
    priceOld: "₹7,000",
    rating: 5.0,
  },
  {
    id: 8,
    badge: "35% off",
    category: "Earrings",
    name: "Zoya Hoop Earrings",
    priceNow: "₹1,300",
    priceOld: "₹2,000",
    rating: 4.9,
  },
  {
    id: 9,
    badge: "45% off",
    category: "Necklaces",
    name: "Ishani Pendant Chain",
    priceNow: "₹2,750",
    priceOld: "₹5,000",
    rating: 4.8,
  },
];

const perks = [
  {
    icon: "📦",
    title: "Free Shipping",
    text: "Free delivery for orders above ₹2,000",
  },
  {
    icon: "💳",
    title: "Flexible Payment",
    text: "Multiple secure payment options",
  },
  { icon: "☎", title: "24×7 Support", text: "We support online all day" },
];

export default function Shop() {
  return (
    <div className={styles.page}>
      {/* ================= HEADER ================= */}
      <Header />

      {/* ================= MAIN CONTENT ================= */}
      <div className={styles.mainContent}>
        {/* ================= PAGE TITLE ================= */}
        <section className={styles.pageTitle}>
          <span className={styles.pageEyebrow}>The Collection</span>
          <h1>Shop</h1>
          <div className={styles.titleOrnament} aria-hidden="true">
            <span className={styles.ornamentLine}></span>
            <span className={styles.ornamentDiamond}></span>
            <span className={styles.ornamentLine}></span>
          </div>
          <p className={styles.pageSubtitle}>
            Handcrafted fine jewellery, curated for every occasion
          </p>
        </section>

        {/* ================= SHOP BODY ================= */}
        <div className={styles.shopWrap}>
          {/* ---------- Sidebar Filters ---------- */}
          <aside className={styles.filters}>
            <h3 className={styles.filtersHeading}>Filter Options</h3>

            <div className={styles.filterGroup}>
              <h3 className={styles.groupHeading}>By Category</h3>
              <ul>
                {categories.map((c) => (
                  <li key={c.name}>
                    {c.name} <span className={styles.count}>{c.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.groupHeading}>By Metal</h3>
              <ul>
                {metals.map((m) => (
                  <li key={m.name}>
                    {m.name} <span className={styles.count}>{m.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.groupHeading}>Price</h3>
              <div className={styles.priceSlider}>
                <div className={styles.fill}></div>
                <div className={`${styles.handle} ${styles.handleLeft}`}></div>
                <div className={`${styles.handle} ${styles.handleRight}`}></div>
              </div>
              <div className={styles.priceValues}>
                <span>₹500</span>
                <span>₹8,000</span>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.groupHeading}>Review</h3>
              <ul>
                {reviewStars.map((s, i) => (
                  <li key={i}>
                    <span className={styles.stars}>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.groupHeading}>By Promotions</h3>
              <ul>
                {promotions.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>

            <div className={styles.filterGroup}>
              <h3 className={styles.groupHeading}>Availability</h3>
              <ul>
                {availability.map((a) => (
                  <li key={a.name}>
                    {a.name} <span className={styles.count}>{a.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.promoTags}>
              <span>Price: ₹500–₹8,000 ✕</span>
              <span>Best Seller ✕</span>
              <span>In Stock ✕</span>
              <span className={styles.clear}>Clear all</span>
            </div>
          </aside>

          {/* ---------- Product Listing ---------- */}
          <main>
            <div className={styles.toolbar}>
              <span>Showing 1–{products.length} of 138 results</span>
              <select>
                <option>Default Sorting</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
                <option>Top Rated</option>
              </select>
            </div>

            <div className={styles.productGrid}>
              {products.map((p) => (
                <div className={styles.productCard} key={p.id}>
                  <div className={styles.productMedia}>
                    <span className={styles.badge}>{p.badge}</span>
                    <div className={styles.wishlistActions}>
                      <button>♡</button>
                      <button>👁</button>
                    </div>
                    <span className={styles.placeholderLabel}>
                      Product Image
                    </span>
                  </div>
                  <div className={styles.productInfo}>
                    <div className={styles.productCat}>{p.category}</div>
                    <div className={styles.productName}>{p.name}</div>
                    <div className={styles.productPrice}>
                      <span className={styles.priceNow}>{p.priceNow}</span>
                      <span className={styles.priceOld}>{p.priceOld}</span>
                    </div>
                    <span className={styles.rating}>{p.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ---------- Pagination ---------- */}
            <div className={styles.pagination}>
              <a href="#">‹</a>
              <a href="#" className={styles.active}>
                1
              </a>
              <a href="#">2</a>
              <a href="#">3</a>
              <a href="#">…</a>
              <a href="#">12</a>
              <a href="#">›</a>
            </div>
          </main>
        </div>

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
