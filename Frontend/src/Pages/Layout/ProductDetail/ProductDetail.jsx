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

// ─── Image Gallery with Zoom ───
const ImageGallery = ({ images, productName, isWishlisted, onToggleWishlist }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const imageRef = useRef(null);

  const allImages = images.length > 0 ? images : [{ url: "/placeholder-image.png", altText: productName }];

  const prevImage = () => {
    setActiveIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
    setOffsetX(0);
  };
  const nextImage = () => {
    setActiveIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));
    setOffsetX(0);
  };

  // ── Touch Drag for Slider ──
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setIsZooming(false);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    setOffsetX(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (Math.abs(offsetX) > 50) {
      if (offsetX > 0) nextImage();
      else prevImage();
    }
    setOffsetX(0);
    setIsZooming(false);
  };

  // ── Mouse Zoom ──
  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => {
    setIsZooming(false);
    setIsDragging(false);
  };

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

  return (
    <div className={styles.gallery}>
      <div
        className={`${styles.mainImageWrap} ${isZooming ? styles.zooming : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={styles.imageSlider}
          style={{
            transform: `translateX(${-activeIndex * 100}%)`,
            transition: isDragging ? 'none' : 'transform 0.4s ease',
          }}
        >
          {allImages.map((img, idx) => (
            <div key={idx} className={styles.slideImage}>
              <img
                ref={idx === activeIndex ? imageRef : null}
                src={img.url}
                alt={img.altText || productName}
                className={styles.mainImage}
                style={
                  isZooming && idx === activeIndex
                    ? {
                        transform: "scale(2)",
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : {}
                }
              />
            </div>
          ))}
        </div>

        {/* Wishlist Button - Top Right Corner */}
        <button
          type="button"
          className={`${styles.wishlistIconBtn} ${isWishlisted ? styles.wishlistIconBtnActive : ""}`}
          onClick={onToggleWishlist}
          aria-label="Toggle wishlist"
        >
          {isWishlisted ? <FaHeart /> : <FiHeart />}
        </button>

        {isZooming && (
          <div
            className={styles.zoomLens}
            style={{
              left: `${zoomPosition.x - 7}%`,
              top: `${zoomPosition.y - 7}%`,
            }}
          />
        )}

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
            <div className={styles.imageCounter}>
              {activeIndex + 1} / {allImages.length}
            </div>
          </>
        )}

        <button
          type="button"
          className={styles.zoomIndicator}
          aria-label="Zoom in"
          onClick={() => setIsZooming(!isZooming)}
        >
          <FiZoomIn />
        </button>
      </div>

      {allImages.length > 1 && (
        <div className={styles.thumbRow}>
          {allImages.map((img, idx) => (
            <button
              type="button"
              key={idx}
              className={`${styles.thumbBtn} ${idx === activeIndex ? styles.thumbBtnActive : ""}`}
              onClick={() => {
                setActiveIndex(idx);
                setOffsetX(0);
              }}
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

  // ── All Specs from Backend ──
  const allSpecs = [
    { label: "Karatage", value: product.specifications?.karatage },
    { label: "Metal", value: product.specifications?.material },
    { label: "Material Colour", value: product.specifications?.materialColor },
    { label: "Gross Weight", value: product.specifications?.weight?.value ? `${product.specifications.weight.value}g` : null },
    { label: "Stone Clarity", value: product.specifications?.stoneClarity },
    { label: "Stone Color", value: product.specifications?.stoneColor },
    { label: "Carat Weight", value: product.specifications?.stoneCarat },
    { label: "Stone Cut", value: product.specifications?.stoneCut },
    { label: "Size", value: product.specifications?.size },
    { label: "Occasion", value: product.specifications?.occasion },
    { label: "Style", value: product.specifications?.style },
    { label: "Gender", value: product.specifications?.gender },
  ].filter((s) => s.value && s.value !== "None" && s.value !== "");

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

        {/* Main Grid - Transparent Background */}
        <div className={styles.mainGrid}>
          <ImageGallery 
            images={allImages} 
            productName={product.productName}
            isWishlisted={isWishlisted}
            onToggleWishlist={handleToggleWishlist}
          />

          <div className={styles.info}>
            <h1 className={styles.productName}>{product.productName}</h1>

            {/* Description - Now above price */}
            {product.shortDescription && (
              <p className={styles.shortDescription}>{product.shortDescription}</p>
            )}

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

            {/* Specifications - Now directly below perks to fill the space */}
            {allSpecs.length > 0 && (
              <div className={styles.specsCompact}>
                <h3 className={styles.specsCompactTitle}>Specifications</h3>
                <div className={styles.specsCompactGrid}>
                  {allSpecs.map((spec) => (
                    <div key={spec.label} className={styles.specCompactItem}>
                      <span className={styles.specCompactLabel}>{spec.label}</span>
                      <span className={styles.specCompactValue}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Description if available */}
        {product.fullDescription && (
          <div className={styles.descriptionSection}>
            <p className={styles.fullDescription}>{product.fullDescription}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}