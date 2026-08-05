// src/Components/Collections/Collections.jsx

import { useRef, useEffect, useState } from "react";
import { FiFilter, FiHeart, FiShoppingBag, FiCheck } from "react-icons/fi";
import styles from "./Collections.module.css";
import Footer from "../../Pages/Layout/Footer/Footer.jsx";


/* ----------------------------------------------------------------
   Data — Product catalogue with categories and pricing
------------------------------------------------------------------- */

const HERO_SLIDES = [
  {
    id: "hero-1",
    title: "Elegant Jewelry Collection",
    subtitle: "Handcrafted pieces for every occasion",
    img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1600&auto=format&fit=crop",
    tag: "New Collection",
  },
  {
    id: "hero-2",
    title: "The Royal Collection",
    subtitle: "Inspired by timeless elegance",
    img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1600&auto=format&fit=crop",
    tag: "Featured",
  },
  {
    id: "hero-3",
    title: "Timeless Elegance",
    subtitle: "Designed to shine, made to last",
    img: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?q=80&w=1600&auto=format&fit=crop",
    tag: "Best Seller",
  },
  {
    id: "hero-4",
    title: "The Pearl Collection",
    subtitle: "Timeless beauty, modern grace",
    img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1600&auto=format&fit=crop",
    tag: "New Arrival",
  },
  {
    id: "hero-5",
    title: "Bridal Elegance",
    subtitle: "Celebrate your special day",
    img: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1600&auto=format&fit=crop",
    tag: "Bridal",
  },
  {
    id: "hero-6",
    title: "Diamond Collection",
    subtitle: "Where brilliance meets artistry",
    img: "https://images.unsplash.com/photo-1747933509433-c58152c10ee7?q=80&w=1600&auto=format&fit=crop",
    tag: "Luxury",
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
  { 
    id: 1, 
    name: "Aurevian Solitaire Band", 
    category: "Rings", 
    price: 2100, 
    originalPrice: 3000, 
    discount: "30%", 
    img: "https://i.pinimg.com/736x/bb/59/89/bb5989b8383d9956c459faeab8dd5edf.jpg" 
  },
  { 
    id: 2, 
    name: "Layla Layered Chain", 
    category: "Necklaces", 
    price: 3400, 
    originalPrice: 4250, 
    discount: "20%", 
    img: "https://i.pinimg.com/736x/86/2b/25/862b25ffaf81d8c3a7d0b0274fcaeece.jpg" 
  },
  { 
    id: 3, 
    name: "Amara Drop Studs", 
    category: "Earrings", 
    price: 1650, 
    originalPrice: 2200, 
    discount: "25%", 
    img: "https://i.pinimg.com/1200x/f3/5c/80/f35c80532087c3a4e690f7e9b8146e9a.jpg" 
  },
  { 
    id: 4, 
    name: "Celeste Charm Bracelet", 
    category: "Bracelets", 
    price: 1800, 
    originalPrice: 3000, 
    discount: "40%", 
    img: "https://i.pinimg.com/1200x/2b/ce/a6/2bcea6d47021448f056e0cfe7606baae.jpg" 
  },
  { 
    id: 5, 
    name: "Noor Stack Ring Set", 
    category: "Rings", 
    price: 1275, 
    originalPrice: 1500, 
    discount: "15%", 
    img: "https://i.pinimg.com/736x/8d/fc/3c/8dfc3cd744a87cb0ff13d52d72f6ee08.jpg" 
  },
  { 
    id: 6, 
    name: "Meera Beaded Anklet", 
    category: "Anklets", 
    price: 950, 
    originalPrice: 1900, 
    discount: "50%", 
    img: "https://i.pinimg.com/736x/b8/fd/47/b8fd47162d9d490d27f9563c523b73ca.jpg" 
  },
  { 
    id: 7, 
    name: "Anaya Bridal Jewel Set", 
    category: "Bridal Sets", 
    price: 6300, 
    originalPrice: 7000, 
    discount: "10%", 
    img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=400&auto=format&fit=crop" 
  },
  { 
    id: 8, 
    name: "Zoya Hoop Earrings", 
    category: "Earrings", 
    price: 1300, 
    originalPrice: 2000, 
    discount: "35%", 
    img: "https://i.pinimg.com/736x/5e/0a/29/5e0a29671a01bc79bb5a1c439e63bf38.jpg" 
  },
  { 
    id: 9, 
    name: "Ishani Pendant Chain", 
    category: "Necklaces", 
    price: 2750, 
    originalPrice: 5000, 
    discount: "45%", 
    img: "https://i.pinimg.com/736x/66/97/aa/6697aacda36f5c702cce6d1b50f9f4c7.jpg" 
  },
  { 
    id: 10, 
    name: "Kavya Twist Band", 
    category: "Rings", 
    price: 2400, 
    originalPrice: 3000, 
    discount: "20%", 
    img: "https://i.pinimg.com/736x/c4/e5/69/c4e569f088566e1b37b4e5f6b3764673.jpg" 
  },
  { 
    id: 11, 
    name: "Riya Chain Bracelet", 
    category: "Bracelets", 
    price: 1950, 
    originalPrice: 2800, 
    discount: "30%", 
    img: "https://i.pinimg.com/736x/8c/2a/7c/8c2a7ce81b26d48d7a45faddb59fdaf3.jpg" 
  },
  { 
    id: 12, 
    name: "Sana Pearl Studs", 
    category: "Earrings", 
    price: 1450, 
    originalPrice: 1950, 
    discount: "25%", 
    img: "https://i.pinimg.com/1200x/a1/2d/4d/a12d4d62a21c55337fdc9db2fecb8ebf.jpg" 
  },
  { 
    id: 13, 
    name: "Tara Gold Hoops", 
    category: "Earrings", 
    price: 2200, 
    originalPrice: 3200, 
    discount: "30%", 
    img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop" 
  },
  { 
    id: 14, 
    name: "Mira Chain Necklace", 
    category: "Necklaces", 
    price: 3800, 
    originalPrice: 4800, 
    discount: "20%", 
    img: "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=400&auto=format&fit=crop" 
  },
  { 
    id: 15, 
    name: "Rani Bridal Set", 
    category: "Bridal Sets", 
    price: 8500, 
    originalPrice: 10000, 
    discount: "15%", 
    img: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?q=80&w=400&auto=format&fit=crop" 
  },
  { 
    id: 16, 
    name: "Kiran Stack Rings", 
    category: "Rings", 
    price: 1800, 
    originalPrice: 2500, 
    discount: "28%", 
    img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop" 
  },
];

const CATEGORIES = [
  { name: "Rings", img: "https://i.pinimg.com/736x/a6/82/3e/a6823e9da82914a4d82fc1523be67066.jpg" },
  { name: "Earrings", img: "https://i.pinimg.com/1200x/5e/76/04/5e76043e18239aa182fc3797456aecce.jpg" },
  { name: "Necklaces", img: "https://i.pinimg.com/736x/fe/9d/31/fe9d315a52ea2714c6205aa391e0580b.jpg" },
  { name: "Bracelets", img: "https://i.pinimg.com/736x/7e/91/71/7e9171bc17659925b95b79e6305418af.jpg" },
  { name: "Sets", img: "https://i.pinimg.com/736x/ea/d9/6e/ead96ee4a4e61acb305e11c6526ab172.jpg" },
];

const CLOSING_IMAGES = [
  "https://i.pinimg.com/736x/ea/96/8a/ea968ae6b41e6fd20cb2a1dac33c87ac.jpg",
  "https://i.pinimg.com/736x/ec/40/8f/ec408f13dd8ed46477aed4d7454c7fd9.jpg",
  "https://i.pinimg.com/1200x/b4/7e/e8/b47ee8ae94d4253ef2da698538ac5c81.jpg",
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

  // Cart and Wishlist states
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Mobile filter sheet state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Auto-scroll for hero gallery
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Scroll hero to current slide
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const slideWidth = hero.offsetWidth;
    hero.scrollTo({ left: slideWidth * currentSlide, behavior: "smooth" });
  }, [currentSlide]);

  // Filter products with correct category mapping
  const filteredProducts = PRODUCTS_DATA
    .filter(p => {
      if (selectedCategory === "All") return true;
      return p.category === selectedCategory;
    })
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

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedMaterial("All");
    setSelectedSize("All");
    setPriceRange([0, 7000]);
    setCurrentPage(1);
  };

  const openMobileFilter = () => {
    setIsMobileFilterOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeMobileFilter = () => {
    setIsMobileFilterOpen(false);
    document.body.style.overflow = "";
  };

  // Cart and Wishlist handlers
  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = (productId) => {
    setCartItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Scroll to filter section
  const scrollToFilter = () => {
    const newCollection = document.querySelector(`.${styles.newCollectionSection}`);
    
    if (newCollection) {
      const newCollectionRect = newCollection.getBoundingClientRect();
      const newCollectionBottom = newCollectionRect.bottom + window.pageYOffset;
      
      window.scrollTo({
        top: newCollectionBottom - 60,
        behavior: "smooth"
      });
    } else {
      const filterSection = document.getElementById("filter-section");
      if (filterSection) {
        const rect = filterSection.getBoundingClientRect();
        const absoluteTop = rect.top + window.pageYOffset;
        window.scrollTo({
          top: absoluteTop - 40,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <>
    <section className={styles.collections} aria-label="Aurevian Collections">
      {/* ---------------- Hero Gallery - 90vh ---------------- */}
      <div className={styles.heroGallery}>
        <div className={styles.heroTrack} ref={heroRef}>
          {HERO_SLIDES.map((slide, index) => (
            <div key={slide.id} className={styles.heroSlide} onClick={scrollToFilter}>
              <img src={slide.img} alt={slide.title} loading={index === 0 ? "eager" : "lazy"} />
              <div className={styles.heroOverlay}>
                <div className={styles.heroOverlayContent}>
                  <span className={styles.heroTag}>{slide.tag}</span>
                  <h1 className={styles.heroTitle}>{slide.title}</h1>
                  <p className={styles.heroSubtitle}>{slide.subtitle}</p>
                  <button className={styles.heroBtn} onClick={(e) => { e.stopPropagation(); scrollToFilter(); }}>
                    Shop Now <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation - Arrows on far left/right, dots at bottom center */}
        <div className={styles.heroNavArrows}>
          <button className={styles.heroNavBtn} onClick={prevSlide} aria-label="Previous slide">‹</button>
          <button className={styles.heroNavBtn} onClick={nextSlide} aria-label="Next slide">›</button>
        </div>
        <div className={styles.heroDots}>
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              className={`${styles.heroDot} ${index === currentSlide ? styles.heroDotActive : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className={styles.container}>
        {/* ---------------- New Collection ---------------- */}
        <Reveal as="section" className={styles.newCollectionSection} delay={100}>
          <div className={styles.newCollectionContent}>
            <span className={styles.newCollectionEyebrow}>New ✦ Collection</span>
            <h2 className={styles.newCollectionTitle}>Timeless Elegance</h2>
            <p className={styles.newCollectionDesc}>
              Each piece is crafted with precision and passion to reflect your unique style.
            </p>
          </div>
        </Reveal>

        {/* ---------------- Shop Layout - Filter + Products ---------------- */}
        <div id="filter-section" className={styles.shopLayout}>
          {/* Desktop Filter Sidebar */}
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
                style={{ "--_progress": `${(priceRange[1] / 7000) * 100}%` }}
              />
              <div className={styles.filterPriceRange}>
                <span>₹0</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>

            <button className={styles.filterClearBtn} onClick={clearAllFilters}>
              Clear All Filters
            </button>

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

          {/* Products */}
          <div className={styles.productsWrapper}>
            <div className={styles.productsHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className={styles.productsCount}>Showing {filteredProducts.length} products</span>
                <button className={styles.filterTrigger} onClick={openMobileFilter}>
                  <FiFilter size={16} /> Filter
                </button>
              </div>
              <select className={styles.sortSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">Sort by latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className={styles.productsGrid}>
              {paginatedProducts.map(product => {
                const isInCart = cartItems.includes(product.id);
                const isInWishlist = wishlist.includes(product.id);
                return (
                  <Reveal as="div" key={product.id} delay={50} className={styles.productCard}>
                    <div className={styles.productImageWrap}>
                      <img className={styles.productImage} src={product.img} alt={product.name} loading="lazy" />
                      {/* Discount badge - top left */}
                      <span className={styles.productDiscount}>{product.discount} OFF</span>
                      {/* Category overlay on image - bottom left */}
                      <span className={styles.productCategoryOverlay}>{product.category}</span>
                      <div className={styles.wishlistActions}>
                        <button
                          type="button"
                          className={`${styles.wishlistBtn} ${isInWishlist ? styles.wishlistBtnActive : ''}`}
                          onClick={() => toggleWishlist(product.id)}
                          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          {isInWishlist ? <FiHeart fill="currentColor" /> : <FiHeart />}
                        </button>
                      </div>
                    </div>
                    <div className={styles.productBody}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <div className={styles.productPriceRow}>
                        <span className={styles.productCurrentPrice}>₹{product.price.toLocaleString()}</span>
                        <span className={styles.productOriginalPrice}>₹{product.originalPrice.toLocaleString()}</span>
                      </div>
                      <button
                        type="button"
                        className={`${styles.productAddBtn} ${isInCart ? styles.productAddBtnActive : ''}`}
                        onClick={() => handleAddToCart(product.id)}
                        disabled={isInCart}
                      >
                        {isInCart ? (
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
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---------------- From: Blush Set ---------------- */}
        <div className={styles.featureSection}>
          <Reveal as="div" className={styles.featureImageWrap} delay={0}>
            <img
              className={styles.featureImage}
              src="https://i.pinimg.com/736x/07/ac/c1/07acc1c388356058bb35ea2b1bb7e8c9.jpg"
              alt="Model wearing the Blossom Set jewelry"
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

            <button type="button" className={styles.ctaBtn} onClick={scrollToFilter}>
              Explore the Set <span>→</span>
            </button>
          </Reveal>
        </div>
      </div>

      {/* ---------------- Explore More - Larger Circles ---------------- */}
      <Reveal as="div" className={styles.exploreSection} delay={100}>
        <div className={styles.container}>
          <div className={styles.exploreInner}>
            <div className={styles.exploreHeading}>
              <h3>Explore More</h3>
              <p>Find your perfect match.</p>
            </div>
            <div className={styles.exploreList}>
              {CATEGORIES.map((cat) => (
                <div className={styles.exploreItem} key={cat.name} onClick={scrollToFilter}>
                  <span className={styles.exploreThumb}>
                    <img src={cat.img} alt="" loading="lazy" />
                  </span>
                  <span className={styles.exploreLabel}>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ---------------- Shine in your own way - At the End ---------------- */}
      <div className={styles.container}>
        <div className={styles.closingSection}>
          <Reveal as="div" className={styles.closingContent} delay={100}>
            <h3 className={styles.closingTitle}>Shine in <em>your</em><br />own way!</h3>
            <p className={styles.closingBody}>Jewelry that speaks your style.</p>
            <button type="button" className={styles.ctaBtn} onClick={scrollToFilter}>
              Explore the Collection <span>→</span>
            </button>
          </Reveal>

          <div className={styles.closingGallery}>
            {CLOSING_IMAGES.map((src, i) => (
              <Reveal as="span" key={src} delay={i * 150 + 100} className={styles.closingImgWrap} onClick={scrollToFilter}>
                <img src={src} alt="" loading="lazy" />
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- Mobile Filter Bottom Sheet ---------------- */}
      <div 
        className={`${styles.mobileFilterOverlay} ${isMobileFilterOpen ? styles.mobileFilterOverlayActive : ""}`}
        onClick={closeMobileFilter}
      />
      
      <div className={`${styles.mobileFilterSheet} ${isMobileFilterOpen ? styles.mobileFilterSheetActive : ""}`}>
        <div className={styles.mobileFilterHandle} />
        
        <div className={styles.mobileFilterHeader}>
          <h3 className={styles.mobileFilterTitle}>Filter</h3>
          <button className={styles.mobileFilterClose} onClick={closeMobileFilter}>✕</button>
        </div>

        <div className={styles.mobileFilterGroup}>
          <span className={styles.mobileFilterGroupLabel}>Category</span>
          {FILTER_CATEGORIES.map(cat => (
            <label key={cat} className={styles.mobileFilterOption}>
              <input type="checkbox" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} />
              {cat}
            </label>
          ))}
        </div>

        <div className={styles.mobileFilterGroup}>
          <span className={styles.mobileFilterGroupLabel}>Material</span>
          {FILTER_MATERIALS.map(mat => (
            <label key={mat} className={styles.mobileFilterOption}>
              <input type="checkbox" checked={selectedMaterial === mat} onChange={() => setSelectedMaterial(mat)} />
              {mat}
            </label>
          ))}
        </div>

        <div className={styles.mobileFilterGroup}>
          <span className={styles.mobileFilterGroupLabel}>Size</span>
          {FILTER_SIZES.map(size => (
            <label key={size} className={styles.mobileFilterOption}>
              <input type="checkbox" checked={selectedSize === size} onChange={() => setSelectedSize(size)} />
              {size}
            </label>
          ))}
        </div>

        <button className={styles.mobileFilterApply} onClick={closeMobileFilter}>
          Apply Filters
        </button>
      </div>
    </section>
    <Footer/>
    </>
  );
}