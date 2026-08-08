// src/Pages/Layout/ProductDetail/ProductDetail.jsx

import React, { useEffect, useState } from "react";
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
  FiZap,
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

export default function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { currentProduct, currentProductLoading, currentProductError } =
    useSelector((state) => state.storefrontProduct);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

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
    setActiveImageIndex(0);
    setQuantity(1);
    setAddedToCart(false);
  }, [currentProduct]);

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

  const allImages = [
    ...(product.thumbnail?.url
      ? [{ url: product.thumbnail.url, altText: product.thumbnail.altText }]
      : []),
    ...(product.images || []),
  ];
  const activeImage = allImages[activeImageIndex] || allImages[0];

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
    (i) => (i.product?._id || i.product) === product._id,
  );

  const specs = [
    { label: "Material", value: product.specifications?.material },
    { label: "Plating", value: product.specifications?.plating },
    { label: "Stone Type", value: product.specifications?.stoneType },
    { label: "Stone Color", value: product.specifications?.stoneColor },
    { label: "Finish", value: product.specifications?.finish },
    {
      label: "Weight",
      value:
        product.specifications?.weight?.value &&
        `${product.specifications.weight.value} ${product.specifications.weight.unit || ""}`,
    },
    { label: "Size", value: product.specifications?.size },
    { label: "Occasion", value: product.specifications?.occasion },
    { label: "Style", value: product.specifications?.style },
    { label: "Gender", value: product.specifications?.gender },
  ].filter((s) => s.value && s.value !== "None");

  const decreaseQty = () => setQuantity((q) => Math.max(minQty, q - 1));
  const increaseQty = () =>
    setQuantity((q) => Math.min(maxQty, stockQty, q + 1));

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
      await dispatch(
        addItemToCart({ productId: product._id, quantity }),
      ).unwrap();
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
            image: activeImage?.url,
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

  const prevImage = () =>
    setActiveImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const nextImage = () =>
    setActiveImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
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
          <span className={styles.breadcrumbCurrent}>
            {product.productName}
          </span>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.gallery}>
            <div className={styles.mainImageWrap}>
              {hasDiscount && (
                <span className={styles.discountBadge}>{discountPct}% OFF</span>
              )}
              <button
                type="button"
                className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistBtnActive : ""}`}
                onClick={handleToggleWishlist}
                aria-label="Toggle wishlist"
              >
                {isWishlisted ? <FaHeart /> : <FiHeart />}
              </button>

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

              <img
                src={activeImage?.url}
                alt={activeImage?.altText || product.productName}
                className={styles.mainImage}
              />
            </div>

            {allImages.length > 1 && (
              <div className={styles.thumbRow}>
                {allImages.map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`${styles.thumbBtn} ${idx === activeImageIndex ? styles.thumbBtnActive : ""}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img
                      src={img.url}
                      alt={`${product.productName} ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.info}>
            {product.brand && (
              <span className={styles.brand}>{product.brand}</span>
            )}
            <h1 className={styles.productName}>{product.productName}</h1>

            <div className={styles.priceRow}>
              <span className={styles.currentPrice}>
                ₹{displayPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className={styles.originalPrice}>
                    ₹{originalPrice.toLocaleString()}
                  </span>
                  <span className={styles.discountPill}>
                    Save {discountPct}%
                  </span>
                </>
              )}
            </div>

            <p className={styles.stockStatus}>
              {inStock ? (
                <span className={styles.inStock}>
                  <FiCheck /> In Stock{" "}
                  {stockQty > 0 && stockQty <= 10 && `(only ${stockQty} left)`}
                </span>
              ) : (
                <span className={styles.outOfStock}>Out of Stock</span>
              )}
            </p>

            {product.shortDescription && (
              <p className={styles.shortDescription}>
                {product.shortDescription}
              </p>
            )}

            {specs.length > 0 && (
              <div className={styles.chipRow}>
                {specs.slice(0, 5).map((s) => (
                  <span key={s.label} className={styles.chip}>
                    {s.value}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.purchaseRow}>
              <div className={styles.qtySelector}>
                <button
                  type="button"
                  onClick={decreaseQty}
                  disabled={quantity <= minQty}
                  aria-label="Decrease quantity"
                >
                  <FiMinus />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={increaseQty}
                  disabled={quantity >= Math.min(maxQty, stockQty)}
                  aria-label="Increase quantity"
                >
                  <FiPlus />
                </button>
              </div>

              <button
                type="button"
                className={`${styles.addToCartBtn} ${addedToCart ? styles.addToCartBtnActive : ""}`}
                onClick={handleAddToCart}
                disabled={!inStock || cartLoading}
              >
                {addedToCart ? (
                  <>
                    <FiCheck /> Added to Cart
                  </>
                ) : (
                  <>
                    <FiShoppingBag />{" "}
                    {inStock
                      ? cartLoading
                        ? "Adding..."
                        : "Add to Cart"
                      : "Out of Stock"}
                  </>
                )}
              </button>

              <button
                type="button"
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                disabled={!inStock}
              >
                <FiZap /> Buy Now
              </button>
            </div>

            <div className={styles.perksRow}>
              <div className={styles.perkItem}>
                <FiTruck />
                <span>
                  {product.shipping?.freeShipping
                    ? "Free Shipping"
                    : "Shipping calculated at checkout"}
                </span>
              </div>
              {product.returnPolicy?.returnAvailable && (
                <div className={styles.perkItem}>
                  <FiRefreshCw />
                  <span>{product.returnPolicy.returnDays}-day returns</span>
                </div>
              )}
              {product.returnPolicy?.warrantyAvailable && (
                <div className={styles.perkItem}>
                  <FiShield />
                  <span>{product.returnPolicy.warrantyDuration} warranty</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          {product.fullDescription && (
            <div className={styles.detailsCard}>
              <h3>Description</h3>
              <p className={styles.fullDescription}>
                {product.fullDescription}
              </p>
            </div>
          )}

          {specs.length > 0 && (
            <div className={styles.detailsCard}>
              <h3>Specifications</h3>
              <table className={styles.specsTable}>
                <tbody>
                  {specs.map((s) => (
                    <tr key={s.label}>
                      <td>{s.label}</td>
                      <td>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
