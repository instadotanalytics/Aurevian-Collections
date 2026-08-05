// src/Components/Offers/Offers.jsx - Complete file

import React, { useRef, useEffect, useState } from "react";
import { 
  FiHeart, 
  FiTrendingUp,
  FiGift, 
  FiSun,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
  FiCheck,
  FiFilter
} from "react-icons/fi";
import { LuSlidersHorizontal } from "react-icons/lu";
import styles from "./Offers.module.css";
import craftImage1 from "../../assets/offersimg.png";
import Footer from "../../Pages/Layout/Footer/Footer.jsx";


/* ----------------------------------------------------------------
   Data — All offers, deals, and promotional content
------------------------------------------------------------------- */

const ALL_PRODUCTS = [
  {
    id: 1,
    name: "Aurevian Solitaire Band",
    price: 2100,
    originalPrice: 3000,
    discount: "30%",
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
    discount: "20%",
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
    discount: "25%",
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
    discount: "40%",
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
    discount: "15%",
    rating: 4,
    reviews: 38,
    category: "Rings",
    image: "https://i.pinimg.com/736x/32/04/d0/3204d0a5df05d1cdfd1d767cd1d8eccf.jpg",
  },
  {
    id: 6,
    name: "Meera Beaded Anklet",
    price: 950,
    originalPrice: 1900,
    discount: "50%",
    rating: 4,
    reviews: 29,
    category: "Anklets",
    image: "https://i.pinimg.com/736x/35/5b/ed/355bed878a4c3da996b6244f83c339e1.jpg",
  },
  {
    id: 7,
    name: "Anaya Bridal Jewel Set",
    price: 6300,
    originalPrice: 7000,
    discount: "10%",
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
    discount: "35%",
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
    discount: "45%",
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
    discount: "20%",
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
    discount: "30%",
    rating: 4,
    reviews: 28,
    category: "Bracelets",
    image: "https://i.pinimg.com/736x/d5/bc/09/d5bc09370b18e1da5b1cc5741913d92b.jpg",
  },
  {
    id: 12,
    name: "Sana Pearl Studs",
    price: 1450,
    originalPrice: 1950,
    discount: "25%",
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
    discount: "30%",
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
    discount: "20%",
    rating: 5,
    reviews: 31,
    category: "Necklaces",
    image: "https://i.pinimg.com/736x/7b/d6/1e/7bd61ebc3c39eaec926fbbd58e31e7f6.jpg",
  },
  {
    id: 15,
    name: "Rani Bridal Set",
    price: 8500,
    originalPrice: 10000,
    discount: "15%",
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
    discount: "28%",
    rating: 4,
    reviews: 27,
    category: "Rings",
    image: "https://i.pinimg.com/1200x/b6/78/8d/b6788de8aa0e4715a06b7de1faee565f.jpg",
  },
  {
    id: 17,
    name: "Rose Gold Chain",
    price: 2999,
    originalPrice: 3999,
    discount: "25%",
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
    discount: "28%",
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
    discount: "25%",
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
    discount: "23%",
    rating: 4,
    reviews: 19,
    category: "Bracelets",
    image: "https://i.pinimg.com/1200x/fe/9d/25/fe9d2554a3d7d4d53c68cb15feed779d.jpg",
  },
  {
    id: 21,
    name: "Diamond Pendant Necklace",
    price: 5499,
    originalPrice: 6999,
    discount: "21%",
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
    discount: "22%",
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
    discount: "25%",
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
    discount: "23%",
    rating: 5,
    reviews: 38,
    category: "Rings",
    image: "https://i.pinimg.com/1200x/86/a7/6c/86a76cfadc6db57100dcd27746cfc836.jpg",
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

// Filter categories matching Collections page
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 7000]);
  const [currentPage, setCurrentPage] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const itemsPerPage = 9;

  // Filter products
  const filteredProducts = ALL_PRODUCTS
    .filter(p => {
      if (selectedCategory === "All") return true;
      return p.category === selectedCategory;
    })
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Scroll to offers section function
  const scrollToOffers = () => {
    const offersSection = document.getElementById("offers-section");
    if (offersSection) {
      const rect = offersSection.getBoundingClientRect();
      const top = rect.top + window.pageYOffset;
      window.scrollTo({ top: top - 120, behavior: "smooth" });
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      setTimeout(scrollToOffers, 100);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setTimeout(scrollToOffers, 100);
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

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedMaterial("All");
    setSelectedSize("All");
    setPriceRange([0, 7000]);
    setCurrentPage(0);
  };

  const openFilters = () => {
    setFiltersOpen(true);
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${window.scrollY}px`;
  };

  const closeFilters = () => {
    const scrollY = document.body.style.top;
    setFiltersOpen(false);
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    document.body.style.top = "";
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }
  };

  return (
    <>
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

          {/* ---------------- Mobile Filter Toggle Button ---------------- */}
          <button
            type="button"
            className={styles.filterToggle}
            onClick={openFilters}
            aria-expanded={filtersOpen}
          >
            <span className={styles.filterToggleText}>Filter Options</span>
            <span className={styles.filterToggleIcon}>
              <LuSlidersHorizontal />
            </span>
          </button>

          {/* ---------------- Shop Layout - Filter Sidebar + Products ---------------- */}
          <div className={styles.shopLayout}>
            {/* Desktop Filter Sidebar */}
            <aside className={styles.filterSidebar}>
              <h3 className={styles.filterTitle}>Filter</h3>

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Category</span>
                {FILTER_CATEGORIES.map(cat => (
                  <label key={cat} className={styles.filterOption}>
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat} 
                      onChange={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(0);
                        setTimeout(scrollToOffers, 100);
                      }} 
                    />
                    {cat}
                  </label>
                ))}
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Material</span>
                {FILTER_MATERIALS.map(mat => (
                  <label key={mat} className={styles.filterOption}>
                    <input 
                      type="radio" 
                      name="material" 
                      checked={selectedMaterial === mat} 
                      onChange={() => setSelectedMaterial(mat)} 
                    />
                    {mat}
                  </label>
                ))}
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Size</span>
                {FILTER_SIZES.map(size => (
                  <label key={size} className={styles.filterOption}>
                    <input 
                      type="radio" 
                      name="size" 
                      checked={selectedSize === size} 
                      onChange={() => setSelectedSize(size)} 
                    />
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
            </aside>

            {/* Products */}
            <div className={styles.productsWrapper}>
              <div className={styles.productsHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className={styles.productsCount}>Showing {filteredProducts.length} products</span>
                </div>
              </div>

              <div className={styles.productsGrid}>
                {currentProducts.map((product, i) => {
                  const isInCart = cartItems.includes(product.id);
                  const isInWishlist = wishlist.includes(product.id);
                  return (
                    <Reveal as="div" key={product.id} delay={i * 50} className={styles.productCard}>
                      <div className={styles.productImageWrap}>
                        <img className={styles.productImage} src={product.image} alt={product.name} loading="lazy" />
                        <span className={styles.productDiscount}>{product.discount} OFF</span>
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
            </div>
          </div>
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

      {/* ---------------- Mobile Bottom Sheet Filter ---------------- */}
      {filtersOpen && (
        <div
          className={styles.filterOverlay}
          onClick={closeFilters}
        />
      )}
      
      <div
        className={`${styles.mobileFilterSheet} ${
          filtersOpen ? styles.mobileFilterSheetOpen : ""
        }`}
      >
        <div className={styles.mobileFilterSheetHeader}>
          <h3 className={styles.mobileFilterTitle}>Filter Options</h3>
          <button
            type="button"
            className={styles.mobileFilterClose}
            onClick={closeFilters}
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>

        <div className={styles.mobileFilterInner}>
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Category</span>
            {FILTER_CATEGORIES.map(cat => (
              <label key={cat} className={styles.mobileFilterOption}>
                <input 
                  type="radio" 
                  name="mobile_category" 
                  checked={selectedCategory === cat} 
                  onChange={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(0);
                  }} 
                />
                {cat}
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Material</span>
            {FILTER_MATERIALS.map(mat => (
              <label key={mat} className={styles.mobileFilterOption}>
                <input 
                  type="radio" 
                  name="mobile_material" 
                  checked={selectedMaterial === mat} 
                  onChange={() => setSelectedMaterial(mat)} 
                />
                {mat}
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Size</span>
            {FILTER_SIZES.map(size => (
              <label key={size} className={styles.mobileFilterOption}>
                <input 
                  type="radio" 
                  name="mobile_size" 
                  checked={selectedSize === size} 
                  onChange={() => setSelectedSize(size)} 
                />
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

          <button 
            className={styles.mobileFilterApply} 
            onClick={() => {
              closeFilters();
              setTimeout(scrollToOffers, 100);
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </section>
    <Footer/>
    </>
  );
}