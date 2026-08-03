// src/Components/Offers/Offers.jsx

import React, { useRef, useEffect, useState } from "react";
import { 
  FiTruck, 
  FiAward, 
  FiGift, 
  FiHeart, 
  FiTrendingUp,
  FiShield,
  FiSun,
  FiMoon,
  FiZap,
  FiFilter,
  FiStar,
  FiClock,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";
import styles from "./Offers.module.css";
import craftImage1 from "../../assets/offersimg.png";

/* ----------------------------------------------------------------
   Data — All offers, deals, and promotional content
------------------------------------------------------------------- */

const ALL_PRODUCTS = [
  {
    id: 1,
    name: "Aurevian Solitaire Band",
    price: 2100,
    originalPrice: 3000,
    discount: "30% OFF",
    rating: 5,
    reviews: 128,
    category: "Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Layla Layered Chain",
    price: 3400,
    originalPrice: 4250,
    discount: "20% OFF",
    rating: 5,
    reviews: 95,
    category: "Necklaces",
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Amara Drop Studs",
    price: 1650,
    originalPrice: 2200,
    discount: "25% OFF",
    rating: 5,
    reviews: 76,
    category: "Earrings",
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Celeste Charm Bracelet",
    price: 1800,
    originalPrice: 3000,
    discount: "40% OFF",
    rating: 5,
    reviews: 54,
    category: "Bracelets",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Noor Stack Ring Set",
    price: 1275,
    originalPrice: 1500,
    discount: "15% OFF",
    rating: 4,
    reviews: 38,
    category: "Rings",
    image: "https://images.unsplash.com/photo-1602171984530-1b4b045b9cc1?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Meera Beaded Anklet",
    price: 950,
    originalPrice: 1900,
    discount: "50% OFF",
    rating: 4,
    reviews: 29,
    category: "Anklets",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "Anaya Bridal Jewel Set",
    price: 6300,
    originalPrice: 7000,
    discount: "10% OFF",
    rating: 5,
    reviews: 52,
    category: "Bridal Sets",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 8,
    name: "Zoya Hoop Earrings",
    price: 1300,
    originalPrice: 2000,
    discount: "35% OFF",
    rating: 5,
    reviews: 41,
    category: "Earrings",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 9,
    name: "Ishani Pendant Chain",
    price: 2750,
    originalPrice: 5000,
    discount: "45% OFF",
    rating: 5,
    reviews: 47,
    category: "Necklaces",
    image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 10,
    name: "Kavya Twist Band",
    price: 2400,
    originalPrice: 3000,
    discount: "20% OFF",
    rating: 4,
    reviews: 33,
    category: "Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 11,
    name: "Riya Chain Bracelet",
    price: 1950,
    originalPrice: 2800,
    discount: "30% OFF",
    rating: 4,
    reviews: 28,
    category: "Bracelets",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 12,
    name: "Sana Pearl Studs",
    price: 1450,
    originalPrice: 1950,
    discount: "25% OFF",
    rating: 4,
    reviews: 22,
    category: "Earrings",
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 13,
    name: "Tara Gold Hoops",
    price: 2200,
    originalPrice: 3200,
    discount: "30% OFF",
    rating: 5,
    reviews: 35,
    category: "Earrings",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 14,
    name: "Mira Chain Necklace",
    price: 3800,
    originalPrice: 4800,
    discount: "20% OFF",
    rating: 5,
    reviews: 31,
    category: "Necklaces",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 15,
    name: "Rani Bridal Set",
    price: 8500,
    originalPrice: 10000,
    discount: "15% OFF",
    rating: 5,
    reviews: 45,
    category: "Bridal Sets",
    image: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 16,
    name: "Kiran Stack Rings",
    price: 1800,
    originalPrice: 2500,
    discount: "28% OFF",
    rating: 4,
    reviews: 27,
    category: "Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 17,
    name: "Rose Gold Chain",
    price: 2999,
    originalPrice: 3999,
    discount: "25% OFF",
    rating: 4,
    reviews: 28,
    category: "Necklaces",
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 18,
    name: "Platinum Wedding Band",
    price: 4999,
    originalPrice: 6999,
    discount: "28% OFF",
    rating: 5,
    reviews: 35,
    category: "Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 19,
    name: "Silver Hoop Earrings",
    price: 1499,
    originalPrice: 1999,
    discount: "25% OFF",
    rating: 4,
    reviews: 22,
    category: "Earrings",
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 20,
    name: "Leather Wrap Bracelet",
    price: 1299,
    originalPrice: 1699,
    discount: "23% OFF",
    rating: 4,
    reviews: 19,
    category: "Bracelets",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 21,
    name: "Diamond Pendant Necklace",
    price: 5499,
    originalPrice: 6999,
    discount: "21% OFF",
    rating: 5,
    reviews: 42,
    category: "Necklaces",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 22,
    name: "Gold Cuff Bracelet",
    price: 2799,
    originalPrice: 3599,
    discount: "22% OFF",
    rating: 4,
    reviews: 24,
    category: "Bracelets",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 23,
    name: "Emerald Stud Earrings",
    price: 2399,
    originalPrice: 3199,
    discount: "25% OFF",
    rating: 5,
    reviews: 30,
    category: "Earrings",
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 24,
    name: "Sapphire Ring Set",
    price: 4599,
    originalPrice: 5999,
    discount: "23% OFF",
    rating: 5,
    reviews: 38,
    category: "Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop",
  },
];

const BOTTOM_FEATURES = [
  {
    icon: <FiHeart />,
    title: "Curated with Love",
    description: "Every piece is carefully selected for you",
  },
  {
    icon: <FiTrendingUp />,
    title: "Timeless Elegance",
    description: "Designed to add beauty to every moment",
  },
  {
    icon: <FiGift />,
    title: "Premium Packaging",
    description: "Luxury unboxing experience",
  },
  {
    icon: <FiSun />,
    title: "Trusted by Thousands",
    description: "Join our community of happy customers",
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
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px", ...options }
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
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const itemsPerPage = 8;

  const filteredProducts = ALL_PRODUCTS.filter(p => 
    selectedFilter === "all" || p.category.toLowerCase() === selectedFilter
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

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

  const scrollToOffers = () => {
    const offersSection = document.getElementById("offers-section");
    if (offersSection) {
      const rect = offersSection.getBoundingClientRect();
      const top = rect.top + window.pageYOffset;
      window.scrollTo({ top: top - 120, behavior: "smooth" });
    }
  };

  return (
    <section className={styles.offers} aria-label="Aurevian Exclusive Offers">
      {/* ---------------- Hero Banner with Background Image ---------------- */}
      <div 
        className={styles.heroBanner}
        style={{ backgroundImage: `url(${craftImage1})` }}
      >
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <span className={styles.heroTag}>EXCLUSIVE OFFERS</span>
            <h1 className={styles.heroTitle}>
              Premium Choices,<br />
              <span>Just For You</span>
            </h1>
            <p className={styles.heroDescription}>
              Explore handpicked luxury pieces at special prices for a limited time.
            </p>
            <button className={styles.heroBtn} onClick={scrollToOffers}>SHOP OFFERS →</button>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* ---------------- Limited Time Offers ---------------- */}
        <Reveal as="div" className={styles.offersSection} delay={100}>
          <div id="offers-section" className={styles.sectionHeader}>
            <span className={styles.sectionTag}>LIMITED TIME OFFERS</span>
            <h2 className={styles.sectionTitle}>Our Premium Picks</h2>
          </div>

          {/* Filter */}
          <div className={styles.filterBar}>
            <button 
              className={`${styles.filterBtn} ${selectedFilter === "all" ? styles.activeFilter : ""}`}
              onClick={() => { setSelectedFilter("all"); setCurrentPage(0); }}
            >
              All
            </button>
            <button 
              className={`${styles.filterBtn} ${selectedFilter === "rings" ? styles.activeFilter : ""}`}
              onClick={() => { setSelectedFilter("rings"); setCurrentPage(0); }}
            >
              Rings
            </button>
            <button 
              className={`${styles.filterBtn} ${selectedFilter === "necklaces" ? styles.activeFilter : ""}`}
              onClick={() => { setSelectedFilter("necklaces"); setCurrentPage(0); }}
            >
              Necklaces
            </button>
            <button 
              className={`${styles.filterBtn} ${selectedFilter === "earrings" ? styles.activeFilter : ""}`}
              onClick={() => { setSelectedFilter("earrings"); setCurrentPage(0); }}
            >
              Earrings
            </button>
            <button 
              className={`${styles.filterBtn} ${selectedFilter === "bracelets" ? styles.activeFilter : ""}`}
              onClick={() => { setSelectedFilter("bracelets"); setCurrentPage(0); }}
            >
              Bracelets
            </button>
            <button 
              className={`${styles.filterBtn} ${selectedFilter === "watches" ? styles.activeFilter : ""}`}
              onClick={() => { setSelectedFilter("watches"); setCurrentPage(0); }}
            >
              Watches
            </button>
            <button 
              className={`${styles.filterBtn} ${selectedFilter === "anklets" ? styles.activeFilter : ""}`}
              onClick={() => { setSelectedFilter("anklets"); setCurrentPage(0); }}
            >
              Anklets
            </button>
          </div>

          {/* Product Grid */}
          <div className={styles.productsGrid}>
            {currentProducts.map((product, i) => {
              const isInCart = cartItems.includes(product.id);
              return (
                <Reveal as="div" key={product.id} delay={i * 60} className={styles.productCard}>
                  <div className={styles.productImageWrap}>
                    <img src={product.image} alt={product.name} loading="lazy" />
                    <span className={styles.discountBadge}>{product.discount}</span>
                    <button 
                      className={`${styles.wishlistBtn} ${wishlist.includes(product.id) ? styles.wishlistActive : ''}`}
                      onClick={() => toggleWishlist(product.id)}
                      aria-label="Add to wishlist"
                    >
                      <FiHeart />
                    </button>
                  </div>
                  <div className={styles.productInfo}>
                    <span className={styles.productCategory}>{product.category}</span>
                    <h4>{product.name}</h4>
                    <div className={styles.productMeta}>
                      <span className={styles.productPrice}>₹{product.price.toLocaleString()}</span>
                      <span className={styles.productOriginalPrice}>₹{product.originalPrice.toLocaleString()}</span>
                    </div>
                    <button 
                      className={`${styles.productBtn} ${isInCart ? styles.productBtnAdded : ''}`}
                      onClick={() => handleAddToCart(product.id)}
                    >
                      {isInCart ? (
                        <>
                          <span className={styles.productBtnIcon}>✓</span> ADDED TO CART
                        </>
                      ) : (
                        'ADD TO CART'
                      )}
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Pagination - Next/Prev Buttons */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                className={`${styles.paginationBtn} ${currentPage === 0 ? styles.paginationDisabled : ''}`}
                onClick={prevPage}
                disabled={currentPage === 0}
              >
                <FiChevronLeft /> Prev
              </button>
              <span className={styles.paginationInfo}>
                Page {currentPage + 1} of {totalPages}
              </span>
              <button 
                className={`${styles.paginationBtn} ${currentPage === totalPages - 1 ? styles.paginationDisabled : ''}`}
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </Reveal>

        {/* ---------------- Exclusive Premium Offer Banner ---------------- */}
        <Reveal as="div" className={styles.premiumBanner} delay={100}>
          <div className={styles.premiumBannerContent}>
            <span className={styles.premiumTag}>EXCLUSIVE PREMIUM OFFER!</span>
            <h2>Get up to 30% OFF on selected premium products.</h2>
            <p>Limited time only. Don't miss out!</p>
            <button className={styles.premiumBtn} onClick={scrollToOffers}>EXPLORE OFFERS →</button>
          </div>
          <div className={styles.premiumBadge}>
            <span className={styles.premiumBadgeText}>UP TO</span>
            <span className={styles.premiumBadgeNumber}>30%</span>
            <span className={styles.premiumBadgeText}>OFF</span>
            <button className={styles.premiumBadgeBtn} onClick={scrollToOffers}>EXPLORE OFFERS</button>
          </div>
        </Reveal>

        {/* ---------------- Bottom Features ---------------- */}
        <Reveal as="div" className={styles.bottomFeatures} delay={100} stagger>
          {BOTTOM_FEATURES.map((feature, i) => (
            <div key={i} className={styles.bottomFeature}>
              <span className={styles.bottomFeatureIcon}>{feature.icon}</span>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}