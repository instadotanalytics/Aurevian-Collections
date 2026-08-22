// src/Pages/Cart/Cart.jsx

import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import styles from "./Cart.module.css";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";
import {
  FiShoppingBag,
  FiX,
  FiMinus,
  FiPlus,
  FiTruck,
  FiShield,
  FiRefreshCw,
} from "react-icons/fi";
import { FaRupeeSign, FaGem } from "react-icons/fa";
import logo from "../../assets/newlogo1.png";

import {
  fetchCart,
  updateItemQuantity,
  removeItemFromCart,
} from "../../redux/slices/cartSlice";

// Cart items store the product's slug at add-to-cart time (see
// cartController's getProductSnapshot). If an item predates that field
// (added before this change), we fall back to the productId — ProductDetail
// will resolve it to its existing, already-handled "Product not found"
// state rather than breaking navigation. Nothing here ever falls back to "/".
const productUrl = (item) => `/product/${item.slug || item.product}`;

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartItems, isLoading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const total = subtotal;

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateItemQuantity({ productId, quantity: newQuantity }));
  };

  const removeItem = (productId) => {
    dispatch(removeItemFromCart(productId));
    toast.success("Item removed from cart");
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    if (cartItems.length === 0) return;

    navigate("/checkout", {
      state: {
        items: cartItems.map((item) => ({
          productId: item.product,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className={styles.cartPage}>
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIconWrapper}>
              <FiShoppingBag className={styles.emptyIcon} />
            </div>
            <h2 className={styles.emptyTitle}>Please Login to View Your Bag</h2>
            <p className={styles.emptyDescription}>
              Sign in to see items you've added to your cart
            </p>
            <Link to="/login" className={styles.exploreButton}>
              Login
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isLoading && cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className={styles.cartPage}>
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIconWrapper}>
              <FiShoppingBag className={styles.emptyIcon} />
            </div>
            <h2 className={styles.emptyTitle}>Your Shopping Bag is Empty</h2>
            <p className={styles.emptyDescription}>
              Discover our curated collection of fine jewellery
            </p>
            <Link to="/" className={styles.exploreButton}>
              Explore Collection
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.cartPage}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>My Cart</h1>
            <p className={styles.heroDescription}>
              Timeless elegance, crafted for you. Review your precious pieces.
            </p>
          </div>
        </section>

        <div className={styles.cartContainer}>
          <div className={styles.cartItemsSection}>
            {cartItems.map((item) => (
              <div key={item.product} className={styles.cartCard}>
                <div className={styles.cardContent}>
                  {/* ---------- DESKTOP VIEW ---------- */}
                  <div className={styles.desktopView}>
                    {/* Clickable region: image + name + description + stock.
                        Quantity/price/remove live in sibling cells outside
                        this Link, so they keep their own click behavior. */}
                    <Link to={productUrl(item)} className={styles.productCell}>
                      <div className={styles.imageWrapper}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.productImage}
                          loading="lazy"
                        />
                      </div>
                      <div className={styles.productInfo}>
                        <h3 className={styles.productName}>{item.name}</h3>
                        {item.shortDescription && (
                          <p className={styles.productDescription}>
                            {item.shortDescription}
                          </p>
                        )}
                        <div className={styles.availability}>
                          <span className={styles.inStock}>✓ In Stock</span>
                        </div>
                      </div>
                    </Link>

                    <div className={styles.priceCell}>
                      <div className={styles.priceWrapper}>
                        <span className={styles.currentPrice}>
                          <FaRupeeSign className={styles.rupeeIconSmall} />
                          {item.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className={styles.quantityCell}>
                      <div className={styles.quantityControls}>
                        <button
                          className={styles.quantityButton}
                          onClick={() =>
                            updateQuantity(item.product, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus />
                        </button>
                        <span className={styles.quantityValue}>
                          {item.quantity}
                        </span>
                        <button
                          className={styles.quantityButton}
                          onClick={() =>
                            updateQuantity(item.product, item.quantity + 1)
                          }
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>

                    <div className={styles.subtotalCell}>
                      <span className={styles.subtotalPrice}>
                        <FaRupeeSign className={styles.rupeeIconSmall} />
                        {(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className={styles.actionCell}>
                      <button
                        className={styles.removeButton}
                        onClick={() => removeItem(item.product)}
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>

                  {/* ---------- MOBILE VIEW — compact: image | title / price / qty ---------- */}
                  <div className={styles.mobileView}>
                    <div className={styles.mobileCard}>
                      <Link
                        to={productUrl(item)}
                        className={styles.mobileImageWrap}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.productImage}
                          loading="lazy"
                        />
                      </Link>

                      <div className={styles.mobileInfo}>
                        <div className={styles.mobileInfoHead}>
                          <Link
                            to={productUrl(item)}
                            className={styles.productName}
                          >
                            {item.name}
                          </Link>
                          <button
                            className={styles.removeButtonMobile}
                            onClick={() => removeItem(item.product)}
                            aria-label="Remove item"
                          >
                            <FiX />
                          </button>
                        </div>

                        {item.shortDescription && (
                          <Link
                            to={productUrl(item)}
                            className={styles.productDescriptionMobile}
                          >
                            {item.shortDescription}
                          </Link>
                        )}

                        <div className={styles.mobileStockQtyRow}>
                          <span className={styles.inStock}>✓ In Stock</span>

                          <div className={styles.quantityControls}>
                            <button
                              className={styles.quantityButton}
                              onClick={() =>
                                updateQuantity(item.product, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <FiMinus />
                            </button>
                            <span className={styles.quantityValue}>
                              {item.quantity}
                            </span>
                            <button
                              className={styles.quantityButton}
                              onClick={() =>
                                updateQuantity(item.product, item.quantity + 1)
                              }
                            >
                              <FiPlus />
                            </button>
                          </div>
                        </div>

                        <div className={styles.mobilePriceRow}>
                          <span className={styles.currentPrice}>
                            <FaRupeeSign className={styles.rupeeIconSmall} />
                            {item.price.toLocaleString("en-IN")}
                          </span>

                          <span className={styles.mobileSubtotalInline}>
                            <span className={styles.subtotalLabel}>
                              Subtotal:
                            </span>
                            <span className={styles.subtotalPrice}>
                              <FaRupeeSign className={styles.rupeeIconSmall} />
                              {(item.price * item.quantity).toLocaleString(
                                "en-IN",
                              )}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <FaGem className={styles.summaryIcon} />
                <h3 className={styles.summaryTitle}>Order Summary</h3>
              </div>

              <div className={styles.summaryRow}>
                <span>
                  Items (
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                </span>
                <span>
                  <FaRupeeSign className={styles.rupeeIconSmall} />
                  {subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={styles.shippingAtCheckout}>
                  Calculated at checkout
                </span>
              </div>

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalAmount}>
                  <FaRupeeSign className={styles.rupeeIconLarge} />
                  {total.toLocaleString("en-IN")}
                </span>
              </div>
              <p className={styles.totalCaveat}>
                Shipping added at checkout based on your delivery location
              </p>

              <button
                className={styles.checkoutButton}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>

              <div className={styles.trustSection}>
                <div className={styles.trustCard}>
                  <FiTruck className={styles.trustIcon} />
                  <div className={styles.trustInfo}>
                    <h4>Reliable Delivery</h4>
                    <p>Shipping calculated for your exact location</p>
                  </div>
                </div>
                <div className={styles.trustCard}>
                  <FiShield className={styles.trustIcon} />
                  <div className={styles.trustInfo}>
                    <h4>Flexible Payment</h4>
                    <p>Multiple secure payment options</p>
                  </div>
                </div>
                <div className={styles.trustCard}>
                  <FiRefreshCw className={styles.trustIcon} />
                  <div className={styles.trustInfo}>
                    <h4>24x7 Support</h4>
                    <p>We support online all days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className={styles.whyAurevian}>
          <div className={styles.whyContent}>
            <div className={styles.whyLeft}>
              <span className={styles.whyBadge}>✦ Aurevian Promise</span>
              <h2 className={styles.whyTitle}>
                Gold-Plated Confidence,
                <br />
                Worn Every Day
              </h2>
              <p className={styles.whyDesc}>
                Aurevian designs jewellery for the days that don't wait for an
                occasion. Every piece is crafted to be lived in, loved, and worn
                with confidence.
              </p>
            </div>
           
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
