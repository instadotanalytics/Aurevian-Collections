// src/Pages/Layout/ProductDetail/ProductDetail.jsx

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiHeart,
  FiShoppingBag,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiMinus,
  FiPlus,
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiZoomIn,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import styles from "./ProductDetail.module.css";

import {
  fetchProductBySlug,
  clearCurrentProduct,
} from "../../../redux/slices/storefrontProductSlice";
import { addItemToCart } from "../../../redux/slices/cartSlice";
import {
  toggleWishlistItem,
  fetchWishlist,
} from "../../../redux/slices/wishlistSlice";

// ─── Helper: Price Breakdown Accordion ───
const PriceBreakdown = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);
  const originalPrice = product.pricing?.originalPrice || 0;
  const salePrice = product.pricing?.salePrice;
  const hasDiscount = salePrice && salePrice < originalPrice;
  const displayPrice = salePrice || originalPrice;
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

  // Static breakdown data (replace with real data from API if available)
  const breakdownItems = [
    { label: "18KT Yellow Gold", rate: "₹11712.27/g", weight: "1.652g", discount: "-", value: "₹19346.33" },
    { label: "Stone", rate: "-", weight: "0.096 ct / 0.019 g", discount: "-", value: "₹13728.00" },
    { label: "Making Charges", rate: "-", weight: "-", discount: "-", value: "₹8776.00" },
    { label: "Sub Total", rate: "-", weight: "1.671g Gross Wt.", discount: "-", value: `₹${originalPrice.toLocaleString()}` },
  ];

  const discountAmount = hasDiscount ? originalPrice - salePrice : 0;
  const subtotalAfterDiscount = hasDiscount ? salePrice : originalPrice;
  const gstAmount = Math.round(subtotalAfterDiscount * 0.03); // Assumed 3% GST

  return (
    <div className={styles.priceBreakdown}>
      <button
        className={styles.breakdownToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>Product Details & Price Breakup</span>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {isOpen && (
        <div className={styles.breakdownContent}>
          <div className={styles.breakdownTableWrap}>
            <table className={styles.breakdownTable}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Rate</th>
                  <th>Weight (g)</th>
                  <th>Discount (%)</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {breakdownItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.label}</td>
                    <td>{item.rate}</td>
                    <td>{item.weight}</td>
                    <td>{item.discount}</td>
                    <td>{item.value}</td>
                  </tr>
                ))}
                {hasDiscount && (
                  <tr className={styles.discountRow}>
                    <td colSpan="3">Discount</td>
                    <td>{discountPct}%</td>
                    <td>-₹{discountAmount.toLocaleString()}</td>
                  </tr>
                )}
                <tr className={styles.subtotalRow}>
                  <td colSpan="3">Subtotal after Discount</td>
                  <td>-</td>
                  <td>₹{subtotalAfterDiscount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan="3">GST</td>
                  <td>-</td>
                  <td>₹{gstAmount.toLocaleString()}</td>
                </tr>
                <tr className={styles.grandTotalRow}>
                  <td colSpan="3">Grand Total</td>
                  <td>-</td>
                  <td>₹{(subtotalAfterDiscount + gstAmount).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.skuId}>
            <span>SKU ID:</span> {product._id || "501145FAARAC023IA001506"}
          </div>

          <div className={styles.cleaningNote}>
            Enjoy sparkling jewellery! We provide free jewellery cleaning services!
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Helper: Image Gallery with Zoom ───
const ImageGallery = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const allImages = images.length > 0 ? images : [{ url: "/placeholder-image.png", altText: productName }];
  const activeImage = allImages[activeIndex];

  // ── Zoom on hover/drag ──
  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => setIsZooming(false);

  const handleMouseMove = (e) => {
    if (!isZooming || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({
      x: Math.min(Math.max(x, 0), 100),
      y: Math.min(Math.max(y, 0), 100),
    });
  };

  // ── Touch drag for zoom on mobile ──
  const handleTouchMove = (e) => {
    if (!isZooming || !imageRef.current || !e.touches.length) return;
    const rect = imageRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({
      x: Math.min(Math.max(x, 0), 100),
      y: Math.min(Math.max(y, 0), 100),
    });
  };

  const handleTouchStart = () => setIsZooming(true);
  const handleTouchEnd = () => setIsZooming(false);

  const prevImage = () => setActiveIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const nextImage = () => setActiveIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));

  return (
    <div className={styles.gallery} ref={containerRef}>
      <div
        className={`${styles.mainImageWrap} ${isZooming ? styles.zooming : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imageRef}
          src={activeImage.url}
          alt={activeImage.altText || productName}
          className={styles.mainImage}
          style={
            isZooming
              ? {
                  transform: "scale(2)",
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }
              : {}
          }
        />

        {/* Zoom Lens Effect */}
        {isZooming && (
          <div
            className={styles.zoomLens}
            style={{
              left: `${zoomPosition.x - 7}%`,
              top: `${zoomPosition.y - 7}%`,
            }}
          />
        )}

        {/* Navigation Buttons */}
        {allImages.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.imageNavBtn} ${styles.imageNavPrev}`}
              onClick={prevImage}
              aria-label="Previous image"
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              className={`${styles.imageNavBtn} ${styles.imageNavNext}`}
              onClick={nextImage}
              aria-label="Next image"
            >
              <FiChevronRight />
            </button>
          </>
        )}

        <button
          type="button"
          className={styles.zoomIndicator}
          aria-label="Zoom in"
        >
          <FiZoomIn />
        </button>
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className={styles.thumbRow}>
          {allImages.map((img, idx) => (
            <button
              type="button"
              key={idx}
              className={`${styles.thumbBtn} ${idx === activeIndex ? styles.thumbBtnActive : ""}`}
              onClick={() => setActiveIndex(idx)}
            >
              <img src={img.url} alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───
export default function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { currentProduct, currentProductLoading, currentProductError } =
    useSelector((state) => state.storefrontProduct);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // ── Fetch product data ──
  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (currentProduct?.productName) {
      document.title = `${currentProduct.seo?.title || currentProduct.productName} | Aurevian Collections`;
    }
    setQuantity(1);
    setAddedToCart(false);
  }, [currentProduct]);

  // ── Loading State ──
  if (currentProductLoading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Loading product...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Error State ──
  if (currentProductError || !currentProduct) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.notFoundWrap}>
          <h2>Product not found</h2>
          <p>
            {currentProductError ||
              "This product may have been removed or is no longer available."}
          </p>
          <button
            className={styles.backHomeBtn}
            onClick={() => navigate("/shop")}
          >
            <FiArrowLeft /> Back to Shop
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const product = currentProduct;

  // ── Product Data ──
  const allImages = [
    ...(product.thumbnail?.url ? [{ url: product.thumbnail.url, altText: product.thumbnail.altText }] : []),
    ...(product.images || []),
  ];

  const originalPrice = product.pricing?.originalPrice || 0;
  const salePrice = product.pricing?.salePrice;
  const hasDiscount = salePrice && salePrice < originalPrice;
  const displayPrice = salePrice || originalPrice;
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

  const inStock = product.inventory?.availability === "In Stock";
  const stockQty = product.inventory?.stockQuantity || 0;
  const minQty = product.inventory?.minOrderQty || 1;
  const maxQty = product.inventory?.maxOrderQty || stockQty || 99;

  const isWishlisted = wishlistItems.some(
    (i) => (i.product?._id || i.product) === product._id
  );

  // ── Specs for Metal & Diamond Details ──
  const metalSpecs = [
    { label: "Karatage", value: product.specifications?.karatage || "18K" },
    { label: "Metal", value: product.specifications?.material || "Gold" },
    { label: "Material Colour", value: product.specifications?.materialColor || "Yellow" },
    { label: "Gross Weight", value: product.specifications?.weight?.value ? `${product.specifications.weight.value}g` : "1.671g" },
  ].filter(s => s.value && s.value !== "None");

  const diamondSpecs = [
    { label: "Clarity", value: product.specifications?.stoneClarity || "VS" },
    { label: "Color", value: product.specifications?.stoneColor || "G-H" },
    { label: "Carat Weight", value: product.specifications?.stoneCarat || "0.096 ct" },
    { label: "Cut", value: product.specifications?.stoneCut || "Brilliant" },
  ].filter(s => s.value && s.value !== "None");

  // ── Handlers ──
  const decreaseQty = () => setQuantity((q) => Math.max(minQty, q - 1));
  const increaseQty = () => setQuantity((q) => Math.min(maxQty, stockQty, q + 1));

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: location.pathname } });
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!inStock) return;
    if (!requireAuth()) return;
    try {
      setCartLoading(true);
      await dispatch(addItemToCart({ productId: product._id, quantity })).unwrap();
      toast.success("Added to cart");
      setAddedToCart(true);
    } catch (err) {
      toast.error(err || "Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    if (!requireAuth()) return;
    navigate("/checkout", {
      state: {
        items: [
          {
            productId: product._id,
            name: product.productName,
            image: allImages[0]?.url,
            price: displayPrice,
            quantity,
          },
        ],
      },
    });
  };

  const handleToggleWishlist = async () => {
    if (!requireAuth()) return;
    try {
      await dispatch(toggleWishlistItem(product._id)).unwrap();
    } catch (err) {
      toast.error(err || "Failed to update wishlist");
    }
  };

  // ── Render ──
  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          {product.category?.categoryData?.label && (
            <>
              <span>/</span>
              <span>{product.category.categoryData.label}</span>
            </>
          )}
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>{product.productName}</span>
        </div>

        {/* Main Grid */}
        <div className={styles.mainGrid}>
          <ImageGallery images={allImages} productName={product.productName} />

          <div className={styles.info}>
            <h1 className={styles.productName}>{product.productName}</h1>

            <div className={styles.priceRow}>
              <span className={styles.currentPrice}>₹{displayPrice.toLocaleString()}</span>
              {hasDiscount && (
                <>
                  <span className={styles.originalPrice}>₹{originalPrice.toLocaleString()}</span>
                  <span className={styles.discountPill}>Save {discountPct}%</span>
                </>
              )}
            </div>

            <p className={styles.stockStatus}>
              {inStock ? (
                <span className={styles.inStock}>
                  <FiCheck /> In Stock {stockQty > 0 && stockQty <= 10 && `(only ${stockQty} left)`}
                </span>
              ) : (
                <span className={styles.outOfStock}>Out of Stock</span>
              )}
            </p>

            <div className={styles.purchaseRow}>
              <div className={styles.qtySelector}>
                <button type="button" onClick={decreaseQty} disabled={quantity <= minQty}>
                  <FiMinus />
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={increaseQty} disabled={quantity >= Math.min(maxQty, stockQty)}>
                  <FiPlus />
                </button>
              </div>

              <button
                type="button"
                className={`${styles.addToCartBtn} ${addedToCart ? styles.addToCartBtnActive : ""}`}
                onClick={handleAddToCart}
                disabled={!inStock || cartLoading}
              >
                {addedToCart ? <><FiCheck /> Added</> : <><FiShoppingBag /> Add to Cart</>}
              </button>

              <button type="button" className={styles.buyNowBtn} onClick={handleBuyNow} disabled={!inStock}>
                <FiShoppingBag /> Buy Now
              </button>
            </div>

            {/* Perks */}
            <div className={styles.perksRow}>
              <div className={styles.perkItem}>
                <FiTruck /> <span>Free Shipping</span>
              </div>
              <div className={styles.perkItem}>
                <FiRefreshCw /> <span>15-day returns</span>
              </div>
              <div className={styles.perkItem}>
                <FiShield /> <span>1-year warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid (Metal & Diamond Details) */}
        <div className={styles.detailsGrid}>
          {metalSpecs.length > 0 && (
            <div className={styles.detailsCard}>
              <h3>Metal Details</h3>
              <dl className={styles.specsList}>
                {metalSpecs.map((spec) => (
                  <div key={spec.label} className={styles.specItem}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {diamondSpecs.length > 0 && (
            <div className={styles.detailsCard}>
              <h3>Diamond Details</h3>
              <dl className={styles.specsList}>
                {diamondSpecs.map((spec) => (
                  <div key={spec.label} className={styles.specItem}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Price Breakdown Accordion */}
        <PriceBreakdown product={product} />
      </div>

      <Footer />
    </div>
  );
}