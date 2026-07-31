// src/Components/Collections/Collections.jsx

import { useRef, useEffect, useState, useCallback } from "react";
import styles from "./Collections.module.css";

/* ----------------------------------------------------------------
   Data — Product catalogue with categories and pricing
------------------------------------------------------------------- */

const HERO_SLIDES = [
  {
    id: "hero-1",
    title: "Elegant Jewelry Collection",
    subtitle: "Handcrafted pieces for every occasion",
    img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=1600&auto=format&fit=crop",
    tag: "New Collection",
  },
  {
    id: "hero-2",
    title: "The Royal Collection",
    subtitle: "Inspired by timeless elegance",
    img: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=1600&auto=format&fit=crop",
    tag: "Featured",
  },
  {
    id: "hero-3",
    title: "Timeless Elegance",
    subtitle: "Designed to shine, made to last",
    img: "https://images.unsplash.com/photo-1630019925534-3d20bf3f7c2f?q=80&w=1600&auto=format&fit=crop",
    tag: "Best Seller",
  },
];

const FEATURES = [
  {
    title: "Premium Quality",
    body: "Crafted with care and the finest materials, piece by piece.",
  },
  {
    title: "Elegant & Versatile",
    body: "Perfect for every occasion, from quiet mornings to golden evenings.",
  },
  {
    title: "Made For You",
    body: "Timeless designs that celebrate your individuality.",
  },
];

const PRODUCTS_DATA = [
  { id: 1, name: "Aurevian Solitaire Band", category: "Rings", price: 2100, originalPrice: 3000, discount: "30%", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop" },
  { id: 2, name: "Layla Layered Chain", category: "Necklaces", price: 3400, originalPrice: 4250, discount: "20%", img: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&auto=format&fit=crop" },
  { id: 3, name: "Amara Drop Studs", category: "Earrings", price: 1650, originalPrice: 2200, discount: "25%", img: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=400&auto=format&fit=crop" },
  { id: 4, name: "Celeste Charm Bracelet", category: "Bracelets", price: 1800, originalPrice: 3000, discount: "40%", img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop" },
  { id: 5, name: "Noor Stack Ring Set", category: "Rings", price: 1275, originalPrice: 1500, discount: "15%", img: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=400&auto=format&fit=crop" },
  { id: 6, name: "Meera Beaded Anklet", category: "Anklets", price: 950, originalPrice: 1900, discount: "50%", img: "https://images.unsplash.com/photo-1630019925534-3d20bf3f7c2f?q=80&w=400&auto=format&fit=crop" },
  { id: 7, name: "Anaya Bridal Jewel Set", category: "Bridal Sets", price: 6300, originalPrice: 7000, discount: "10%", img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=400&auto=format&fit=crop" },
  { id: 8, name: "Zoya Hoop Earrings", category: "Earrings", price: 1300, originalPrice: 2000, discount: "35%", img: "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=400&auto=format&fit=crop" },
  { id: 9, name: "Ishani Pendant Chain", category: "Necklaces", price: 2750, originalPrice: 5000, discount: "45%", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop" },
  { id: 10, name: "Kavya Twist Band", category: "Rings", price: 2400, originalPrice: 3000, discount: "20%", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop" },
  { id: 11, name: "Riya Chain Bracelet", category: "Bracelets", price: 1950, originalPrice: 2800, discount: "30%", img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop" },
  { id: 12, name: "Sana Pearl Studs", category: "Earrings", price: 1450, originalPrice: 1950, discount: "25%", img: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=400&auto=format&fit=crop" },
];

const CATEGORIES = [
  { name: "Rings", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=300&auto=format&fit=crop" },
  { name: "Earrings", img: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=300&auto=format&fit=crop" },
  { name: "Necklaces", img: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=300&auto=format&fit=crop" },
  { name: "Bracelets", img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=300&auto=format&fit=crop" },
  { name: "Sets", img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=300&auto=format&fit=crop" },
];

const CLOSING_IMAGES = [
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=500&auto=format&fit=crop",
];

const FILTER_CATEGORIES = ["All", "Rings", "Earrings", "Necklaces", "Bracelets", "Anklets", "Bridal Sets"];
const FILTER_MATERIALS = ["All", "Gold", "Silver", "Rose Gold", "Platinum"];
const FILTER_SIZES = ["All", "Small", "Medium", "Large"];

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
          // Don't unobserve - this keeps animation triggering on each scroll
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -120px 0px", ...options }
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

export default function Collections() {
  const heroRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 7000]);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Auto-scroll for hero gallery
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Scroll hero to current slide
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const slideWidth = hero.offsetWidth;
    hero.scrollTo({ left: slideWidth * currentSlide, behavior: "smooth" });
  }, [currentSlide]);

  // Filter products
  const filteredProducts = PRODUCTS_DATA
    .filter(p => selectedCategory === "All" || p.category === selectedCategory)
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return a.id - b.id;
    });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  // Pagination helpers
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedMaterial("All");
    setSelectedSize("All");
    setPriceRange([0, 7000]);
    setCurrentPage(1);
  };

  return (
    <section className={styles.collections} aria-label="Aurevian Collections">
      {/* ---------------- Hero Gallery ---------------- */}
      <div className={styles.heroGallery}>
        <div className={styles.heroTrack} ref={heroRef}>
          {HERO_SLIDES.map((slide, index) => (
            <div key={slide.id} className={styles.heroSlide}>
              <img src={slide.img} alt={slide.title} loading={index === 0 ? "eager" : "lazy"} />
              <div className={styles.heroOverlay}>
                <div className={styles.heroOverlayContent}>
                  <span className={styles.heroTag}>{slide.tag}</span>
                  <h1 className={styles.heroTitle}>{slide.title}</h1>
                  <p className={styles.heroSubtitle}>{slide.subtitle}</p>
                  <button className={styles.heroBtn}>Shop Now →</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className={`${styles.heroNav} ${styles.heroNavPrev}`} onClick={prevSlide}>←</button>
        <button className={`${styles.heroNav} ${styles.heroNavNext}`} onClick={nextSlide}>→</button>

        <div className={styles.heroDots}>
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              className={`${styles.heroDot} ${index === currentSlide ? styles.heroDotActive : ""}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      <div className={styles.container}>
        {/* ---------------- New Collection - Full 80-90vh ---------------- */}
        <Reveal as="section" className={styles.newCollectionSection} delay={100}>
          <div className={styles.newCollectionContent}>
            <span className={styles.newCollectionEyebrow}>New ✦ Collection</span>
            <h2 className={styles.newCollectionTitle}>Timeless Elegance</h2>
            <p className={styles.newCollectionDesc}>
              Each piece is crafted with precision and passion to reflect your unique style.
            </p>
            <button className={styles.newCollectionBtn}>
              Explore Collection <span>→</span>
            </button>
          </div>
        </Reveal>

        {/* ---------------- Featured Set - Vintage Camera Style ---------------- */}
        <div className={styles.featureSection}>
          <Reveal as="div" className={styles.featureImageWrap} delay={0}>
            <img
              className={styles.featureImage}
              src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=800&auto=format&fit=crop"
              alt="The Blossom Set"
              loading="lazy"
            />
          </Reveal>

          <Reveal as="div" className={styles.featureContent} delay={150}>
            <span className={styles.pill}>From: Blush Set</span>
            <h3 className={styles.featureTitle}>Introducing The Blossom Set</h3>
            <p className={styles.featureBody}>
              Inspired by nature's delicate beauty, the Blossom Set brings a touch of freshness and femininity to your everyday look.
            </p>

            <ul className={styles.featureList}>
              {FEATURES.map((f, i) => (
                <li className={styles.featureItem} key={f.title}>
                  <span className={styles.featureDot} aria-hidden="true">✦</span>
                  <div>
                    <p className={styles.featureItemTitle}>{f.title}</p>
                    <p className={styles.featureItemBody}>{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <button type="button" className={styles.ctaBtn}>
              Explore the Set <span aria-hidden="true">→</span>
            </button>
          </Reveal>
        </div>

        {/* ---------------- Shop Layout ---------------- */}
        <div className={styles.shopLayout}>
          <Reveal as="aside" className={styles.filterSidebar} delay={100}>
            <h3 className={styles.filterTitle}>Filter</h3>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Category</span>
              {FILTER_CATEGORIES.map(cat => (
                <label key={cat} className={styles.filterOption}>
                  <input type="radio" name="category" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} />
                  {cat}
                </label>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Material</span>
              {FILTER_MATERIALS.map(mat => (
                <label key={mat} className={styles.filterOption}>
                  <input type="radio" name="material" checked={selectedMaterial === mat} onChange={() => setSelectedMaterial(mat)} />
                  {mat}
                </label>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Size</span>
              {FILTER_SIZES.map(size => (
                <label key={size} className={styles.filterOption}>
                  <input type="radio" name="size" checked={selectedSize === size} onChange={() => setSelectedSize(size)} />
                  {size}
                </label>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Price Range</span>
              <input
                type="range"
                min="0"
                max="7000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className={styles.filterPriceInput}
              />
              <div className={styles.filterPriceRange}>
                <span>₹0</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>

            <button className={styles.filterClearBtn} onClick={clearAllFilters}>
              Clear All Filters
            </button>

            {/* Extra filter options for height */}
            <div className={styles.filterExtra}>
              <label className={styles.filterOption}>
                <input type="checkbox" /> In Stock Only
              </label>
              <label className={styles.filterOption}>
                <input type="checkbox" /> On Sale
              </label>
              <label className={styles.filterOption}>
                <input type="checkbox" /> New Arrivals
              </label>
            </div>
          </Reveal>

          <div className={styles.productsWrapper}>
            <div className={styles.productsHeader}>
              <span className={styles.productsCount}>Showing {filteredProducts.length} products</span>
              <select className={styles.sortSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">Sort by latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className={styles.productsGrid}>
              {paginatedProducts.map(product => (
                <Reveal as="div" key={product.id} delay={50} className={styles.productCard}>
                  <div className={styles.productImageWrap}>
                    <img className={styles.productImage} src={product.img} alt={product.name} loading="lazy" />
                    <span className={styles.productDiscount}>{product.discount} OFF</span>
                  </div>
                  <div className={styles.productBody}>
                    <span className={styles.productCategory}>{product.category}</span>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.productPriceRow}>
                      <span className={styles.productCurrentPrice}>₹{product.price.toLocaleString()}</span>
                      <span className={styles.productOriginalPrice}>₹{product.originalPrice.toLocaleString()}</span>
                    </div>
                    <button className={styles.productAddBtn}>Add to Cart</button>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button 
                  className={styles.paginationBtn} 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className={styles.paginationEllipsis}>…</span>
                  ) : (
                    <button
                      key={page}
                      className={`${styles.paginationBtn} ${currentPage === page ? styles.paginationBtnActive : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                ))}
                <button 
                  className={styles.paginationBtn} 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Explore More ---------------- */}
      <Reveal as="div" className={styles.exploreSection} delay={100}>
        <div className={styles.container}>
          <div className={styles.exploreInner}>
            <div className={styles.exploreHeading}>
              <h3>Explore More</h3>
              <p>Find your perfect match.</p>
            </div>
            <div className={styles.exploreList}>
              {CATEGORIES.map((cat) => (
                <a href={`#${cat.name.toLowerCase()}`} className={styles.exploreItem} key={cat.name}>
                  <span className={styles.exploreThumb}>
                    <img src={cat.img} alt="" loading="lazy" />
                  </span>
                  <span className={styles.exploreLabel}>{cat.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ---------------- Closing CTA ---------------- */}
      <div className={styles.container}>
        <div className={styles.closingSection}>
          <Reveal as="div" className={styles.closingContent} delay={100}>
            <h3 className={styles.closingTitle}>Shine in <em>your</em><br />own way!</h3>
            <p className={styles.closingBody}>Jewelry that speaks your style.</p>
            <button type="button" className={styles.ctaBtn}>Shop the Collection <span>→</span></button>
          </Reveal>

          <div className={styles.closingGallery}>
            {CLOSING_IMAGES.map((src, i) => (
              <Reveal as="span" key={src} delay={i * 150 + 100} className={styles.closingImgWrap}>
                <img src={src} alt="" loading="lazy" />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}