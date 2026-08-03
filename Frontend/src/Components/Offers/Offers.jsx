// src/Components/Offers/Offers.jsx

import React, { useRef, useEffect, useState } from "react";
import { 
  FiTruck, 
  FiAward, 
  FiGift, 
  FiStar, 
  FiHeart, 
  FiShoppingBag,
  FiTrendingUp,
  FiShield,
  FiSun,
  FiMoon,
  FiZap,
  FiFilter
} from "react-icons/fi";
import styles from "./Offers.module.css";

/* ----------------------------------------------------------------
   Data — All offers, deals, and promotional content
------------------------------------------------------------------- */

const HERO_OFFERS = [
  {
    id: "hero-1",
    title: "Elegance In Every Detail",
    subtitle: "Perfect For Every Occasion",
    description:
      "Discover our curated collection of timeless jewelry, crafted with precision and passion.",
    cta: "Explore Collection",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1600&auto=format&fit=crop",
    tag: "Limited Edition",
  },
  {
    id: "hero-2",
    title: "Beautiful In Every Detail",
    subtitle: "Exquisite Craftsmanship",
    description:
      "Each piece tells a story of elegance and artistry, designed to be cherished forever.",
    cta: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1600&auto=format&fit=crop",
    tag: "New Collection",
  },
  {
    id: "hero-3",
    title: "Radiant Refinement",
    subtitle: "Timeless Elegance",
    description:
      "Experience the perfect blend of luxury and sophistication with our exclusive collection.",
    cta: "Discover More",
    image:
      "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?q=80&w=1600&auto=format&fit=crop",
    tag: "Best Sellers",
  },
];

const STATS = [
  {
    value: "230K",
    label: "Happy Clients",
    icon: <FiHeart />,
    description: "Trusted by thousands worldwide",
  },
  {
    value: "Free Shipping",
    label: "On Orders Above ₹999",
    icon: <FiTruck />,
    description: "Delivered with care and elegance",
  },
  {
    value: "Exclusive Design",
    label: "Bespoke Creations",
    icon: <FiAward />,
    description: "Designed uniquely for you",
  },
  {
    value: "Highest Quality",
    label: "Premium Materials",
    icon: <FiShield />,
    description: "Certified and hallmarked",
  },
];

const QUALITY_FEATURES = [
  {
    icon: <FiAward />,
    title: "Premium Quality",
    description: "Crafted with care and the finest materials, piece by piece.",
  },
  {
    icon: <FiSun />,
    title: "Lightweight & Comfortable",
    description: "Designed for all-day wear without any discomfort.",
  },
  {
    icon: <FiGift />,
    title: "Perfect Gift Choice",
    description: "Beautifully packaged and ready for any occasion.",
  },
];

const ALL_PRODUCTS = [
  {
    id: 1,
    name: "Gold Earring",
    price: 2400,
    rating: 5,
    category: "Earrings",
    tag: "Best Seller",
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Diamond Ring",
    price: 3200,
    rating: 5,
    category: "Rings",
    tag: "New",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Gold Necklace",
    price: 4500,
    rating: 5,
    category: "Necklaces",
    tag: "Trending",
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Pearl Bracelet",
    price: 1800,
    rating: 4,
    category: "Bracelets",
    tag: "Sale",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Rose Gold Studs",
    price: 2800,
    rating: 5,
    category: "Earrings",
    tag: "New",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Platinum Band",
    price: 5600,
    rating: 5,
    category: "Rings",
    tag: "Best Seller",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "Silver Chain",
    price: 3200,
    rating: 4,
    category: "Necklaces",
    tag: "Sale",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 8,
    name: "Beaded Bracelet",
    price: 1500,
    rating: 4,
    category: "Bracelets",
    tag: "Trending",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400&auto=format&fit=crop",
  },
];

const CATEGORIES = [
  { name: "Rings", icon: <FiZap /> },
  { name: "Earrings", icon: <FiMoon /> },
  { name: "Necklaces", icon: <FiTrendingUp /> },
  { name: "Bracelets", icon: <FiSun /> },
];

const OFFER_ITEMS = [
  {
    title: "Summer Sale",
    description: "Get up to 40% off on selected collection",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=400&auto=format&fit=crop",
    cta: "Shop Sale",
  },
  {
    title: "Bridal Collection",
    description: "Exclusive designs for your special day",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop",
    cta: "Explore",
  },
  {
    title: "Gift Sets",
    description: "Curated gift sets for every occasion",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop",
    cta: "Shop Gifts",
  },
  {
    title: "Custom Designs",
    description: "Create your own unique piece",
    image: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?q=80&w=400&auto=format&fit=crop",
    cta: "Start Now",
  },
];

/* ----------------------------------------------------------------
   Persistent Reveal-on-scroll with Blur Effect
------------------------------------------------------------------- */
function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px", ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return [ref, visible];
}

function Reveal({ as: Tag = "div", className = "", delay = 0, children, stagger = false, ...rest }) {
  const [ref, visible] = useReveal();
  const staggerClass = stagger ? styles.revealStagger : "";

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${visible ? styles.revealVisible : ""} ${staggerClass} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default function Offers() {
  const heroRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 6000]);
  const [sortBy, setSortBy] = useState("latest");

  // Auto-scroll for hero offers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_OFFERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll hero to current slide
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const slideWidth = hero.offsetWidth;
    hero.scrollTo({ left: slideWidth * currentSlide, behavior: "smooth" });
  }, [currentSlide]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_OFFERS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_OFFERS.length);
  };

  // Filter products
  const filteredProducts = ALL_PRODUCTS
    .filter(p => selectedCategory === "All" || p.category === selectedCategory)
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return a.id - b.id;
    });

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 6000]);
    setSortBy("latest");
  };

  return (
    <section className={styles.offers} aria-label="Aurevian Offers & Promotions">
      {/* ---------------- Hero Offers - Full Width ---------------- */}
      <div className={styles.heroOffers}>
        <div className={styles.heroTrack} ref={heroRef}>
          {HERO_OFFERS.map((slide, index) => (
            <div key={slide.id} className={styles.heroSlide}>
              <img src={slide.image} alt={slide.title} loading={index === 0 ? "eager" : "lazy"} />
              <div className={styles.heroOverlay}>
                <div className={styles.heroContent}>
                  <span className={styles.heroTag}>{slide.tag}</span>
                  <h1 className={styles.heroTitle}>{slide.title}</h1>
                  <p className={styles.heroSubtitle}>{slide.subtitle}</p>
                  <p className={styles.heroDescription}>{slide.description}</p>
                  <button className={styles.heroBtn}>{slide.cta} →</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.heroNav}>
          <button className={styles.heroNavBtn} onClick={prevSlide}>←</button>
          <div className={styles.heroDots}>
            {HERO_OFFERS.map((_, index) => (
              <button
                key={index}
                className={`${styles.heroDot} ${index === currentSlide ? styles.heroDotActive : ""}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
          <button className={styles.heroNavBtn} onClick={nextSlide}>→</button>
        </div>
      </div>

      <div className={styles.container}>
        {/* ---------------- Stats Section ---------------- */}
        <div className={styles.statsSection}>
          {STATS.map((stat, i) => (
            <Reveal as="div" key={i} delay={i * 100} className={styles.statItem}>
              <span className={styles.statIcon}>{stat.icon}</span>
              <h3 className={styles.statValue}>{stat.value}</h3>
              <p className={styles.statLabel}>{stat.label}</p>
              <span className={styles.statDescription}>{stat.description}</span>
            </Reveal>
          ))}
        </div>

        {/* ---------------- Quality Features Section ---------------- */}
        <Reveal as="div" className={styles.qualitySection} delay={100}>
          <div className={styles.qualityGrid}>
            {QUALITY_FEATURES.map((feature, i) => (
              <div key={i} className={styles.qualityCard}>
                <div className={styles.qualityIconWrap}>{feature.icon}</div>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ---------------- The Art Of Radiant Refinement ---------------- */}
        <Reveal as="div" className={styles.radiantSection} delay={100}>
          <div className={styles.radiantContent}>
            <span className={styles.radiantTag}>ELEGANCE</span>
            <h2 className={styles.radiantTitle}>The Art Of Radiant Refinement</h2>
            <p className={styles.radiantDescription}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className={styles.radiantSubtext}>
              Lorem ipsum dolor sit amet, consectetur adipiscing
            </p>
          </div>
          <div className={styles.radiantImage}>
            <img
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop"
              alt="Radiant Refinement"
              loading="lazy"
            />
          </div>
        </Reveal>

        {/* ---------------- Products Section with Filter ---------------- */}
        <Reveal as="div" className={styles.productsSection} delay={100}>
          <div className={styles.productsHeader}>
            <h3 className={styles.sectionTitle}>Our Products</h3>
            <p className={styles.sectionSubtitle}>
              Premium jewelry crafted for elegance and sophistication.
            </p>
          </div>

          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <div className={styles.filterLeft}>
              <span className={styles.filterLabel}><FiFilter /> Filter</span>
              <div className={styles.categoryFilters}>
                <button 
                  className={`${styles.categoryFilterBtn} ${selectedCategory === "All" ? styles.activeFilter : ""}`}
                  onClick={() => setSelectedCategory("All")}
                >
                  All
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    className={`${styles.categoryFilterBtn} ${selectedCategory === cat.name ? styles.activeFilter : ""}`}
                    onClick={() => setSelectedCategory(cat.name)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.filterRight}>
              <select 
                className={styles.sortSelect} 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Sort by latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <button className={styles.clearFilterBtn} onClick={clearFilters}>
                Clear All
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productImageWrap}>
                  <img src={product.image} alt={product.name} loading="lazy" />
                  {product.tag && <span className={styles.productTag}>{product.tag}</span>}
                </div>
                <div className={styles.productInfo}>
                  <h4>{product.name}</h4>
                  <div className={styles.productRating}>
                    <span className={styles.stars}>{renderStars(product.rating)}</span>
                  </div>
                  <span className={styles.productPrice}>₹{product.price.toLocaleString()}</span>
                  <button className={styles.productBtn}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ---------------- Choose The Type Section ---------------- */}
        <Reveal as="div" className={styles.chooseTypeSection} delay={100}>
          <div className={styles.chooseTypeContent}>
            <h3 className={styles.chooseTypeTitle}>Choose The Type</h3>
            <p className={styles.chooseTypeDescription}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
              ullamcorper mattis, pulvinar leo.
            </p>
          </div>
          <div className={styles.chooseTypeGrid}>
            {CATEGORIES.map((category, i) => (
              <Reveal as="div" key={i} delay={i * 80} className={styles.chooseTypeItem}>
                <div className={styles.chooseTypeCard}>
                  <div className={styles.chooseTypeIcon}>{category.icon}</div>
                  <span className={styles.chooseTypeName}>{category.name}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* ---------------- Offer Items ---------------- */}
        <Reveal as="div" className={styles.offerItemsSection} delay={100} stagger>
          {OFFER_ITEMS.map((item, i) => (
            <div key={i} className={styles.offerItem}>
              <img src={item.image} alt={item.title} loading="lazy" />
              <div className={styles.offerContent}>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <button className={styles.offerBtn}>{item.cta} →</button>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}