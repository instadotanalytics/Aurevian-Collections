// src/Pages/Cart/Cart.jsx
import React, { useState, useMemo } from 'react';
import { Link } from "react-router-dom";
import styles from './Cart.module.css';
import Header from '../Layout/Header/Header';
import Footer from '../Layout/Footer/Footer';
import {
  FiShoppingBag,
  FiX,
  FiMinus,
  FiPlus,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiHeart,
  FiAward,
  FiChevronRight,
  FiHome
} from 'react-icons/fi';
import { FaRupeeSign, FaGem } from 'react-icons/fa';
import logo from "../../assets/Aurevianlogo.png";

// Main Cart Component
const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Aurelia Diamond Halo Ring',
      variant: '18K White Gold',
      size: 'Size 6',
      price: 4999,
      oldPrice: 5999,
      quantity: 1,
      available: true,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80&auto=format&fit=crop',
    },
    {
      id: 2,
      name: 'Celeste Emerald Drop Earrings',
      variant: '14K Yellow Gold',
      size: 'One Size',
      price: 3299,
      oldPrice: 3799,
      quantity: 2,
      available: true,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80&auto=format&fit=crop',
    },
    {
      id: 3,
      name: 'Sapphire Tennis Bracelet',
      variant: 'Platinum',
      size: '7.5 inches',
      price: 8999,
      oldPrice: null,
      quantity: 1,
      available: false,
      image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80&auto=format&fit=crop',
    },
    {
      id: 4,
      name: 'Pearl Stud Earrings',
      variant: '18K Gold Plated',
      size: 'One Size',
      price: 1299,
      oldPrice: 1599,
      quantity: 1,
      available: true,
      image: 'https://images.unsplash.com/photo-1591369822096-ffd1406f2e9a?w=600&q=80&auto=format&fit=crop',
    },
  ]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const shipping = subtotal > 5000 ? 0 : 49;
  const total = subtotal + shipping;

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    alert('Proceeding to checkout...');
  };

  return (
    <>
      <Header />
      <div className={styles.cartPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>
              <FiHeart className={styles.heroBadgeIcon} /> Your Curated Collection
            </span>
            <h1 className={styles.heroTitle}>Shopping Bag</h1>
            <p className={styles.heroDescription}>
              Timeless elegance, crafted for you. Review your precious pieces.
            </p>
          </div>
        </section>

        {/* If cart is empty - Show empty state inside the page */}
        {cartItems.length === 0 ? (
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
        ) : (
          <>
            {/* Stats Bar */}
            <div className={styles.statsBar}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{cartItems.length}</span>
                <span className={styles.statLabel}>Items</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  <FaRupeeSign className={styles.rupeeIcon} />
                  {subtotal.toLocaleString('en-IN')}
                </span>
                <span className={styles.statLabel}>Subtotal</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {shipping === 0 ? '✓ Free' : `₹${shipping}`}
                </span>
                <span className={styles.statLabel}>Shipping</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  <FaRupeeSign className={styles.rupeeIcon} />
                  {total.toLocaleString('en-IN')}
                </span>
                <span className={styles.statLabel}>Total</span>
              </div>
            </div>

            {/* Cart Content */}
            <div className={styles.cartContainer}>
              {/* Cart Items */}
              <div className={styles.cartItemsSection}>
                {/* Table Header - Desktop only */}
                <div className={styles.tableHeader}>
                  <div className={styles.thProduct}>Product</div>
                  <div className={styles.thPrice}>Price</div>
                  <div className={styles.thQuantity}>Quantity</div>
                  <div className={styles.thSubtotal}>Subtotal</div>
                  <div className={styles.thAction}></div>
                </div>

                {cartItems.map((item) => (
                  <div key={item.id} className={styles.cartCard}>
                    <div className={styles.cardContent}>
                      {/* Desktop View */}
                      <div className={styles.desktopView}>
                        <div className={styles.productCell}>
                          <div className={styles.imageWrapper}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className={styles.productImage}
                              loading="lazy"
                            />
                            {!item.available && (
                              <div className={styles.outOfStockOverlay}>
                                <span>Out of Stock</span>
                              </div>
                            )}
                          </div>
                          <div className={styles.productInfo}>
                            <h3 className={styles.productName}>{item.name}</h3>
                            <p className={styles.productVariant}>{item.variant}</p>
                            <p className={styles.productSize}>{item.size}</p>
                            <div className={styles.availability}>
                              {item.available ? (
                                <span className={styles.inStock}>✓ In Stock</span>
                              ) : (
                                <span className={styles.outOfStock}>✕ Out of Stock</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={styles.priceCell}>
                          <div className={styles.priceWrapper}>
                            <span className={styles.currentPrice}>
                              <FaRupeeSign className={styles.rupeeIconSmall} />
                              {item.price.toLocaleString('en-IN')}
                            </span>
                            {item.oldPrice && (
                              <>
                                <span className={styles.oldPrice}>
                                  <FaRupeeSign className={styles.rupeeIconSmall} />
                                  {item.oldPrice.toLocaleString('en-IN')}
                                </span>
                                <span className={styles.savings}>
                                  Save {Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className={styles.quantityCell}>
                          <div className={styles.quantityControls}>
                            <button
                              className={styles.quantityButton}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <FiMinus />
                            </button>
                            <span className={styles.quantityValue}>{item.quantity}</span>
                            <button
                              className={styles.quantityButton}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <FiPlus />
                            </button>
                          </div>
                        </div>

                        <div className={styles.subtotalCell}>
                          <span className={styles.subtotalPrice}>
                            <FaRupeeSign className={styles.rupeeIconSmall} />
                            {(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className={styles.actionCell}>
                          <button
                            className={styles.removeButton}
                            onClick={() => removeItem(item.id)}
                          >
                            <FiX />
                          </button>
                        </div>
                      </div>

                      {/* Mobile View */}
                      <div className={styles.mobileView}>
                        <div className={styles.mobileTopRow}>
                          <div className={styles.productCell}>
                            <div className={styles.imageWrapper}>
                              <img
                                src={item.image}
                                alt={item.name}
                                className={styles.productImage}
                                loading="lazy"
                              />
                              {!item.available && (
                                <div className={styles.outOfStockOverlay}>
                                  <span>Out of Stock</span>
                                </div>
                              )}
                            </div>
                            <div className={styles.productInfo}>
                              <h3 className={styles.productName}>{item.name}</h3>
                              <p className={styles.productVariant}>{item.variant}</p>
                              <p className={styles.productSize}>{item.size}</p>
                              <div className={styles.availability}>
                                {item.available ? (
                                  <span className={styles.inStock}>✓ In Stock</span>
                                ) : (
                                  <span className={styles.outOfStock}>✕ Out of Stock</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            className={styles.removeButtonMobile}
                            onClick={() => removeItem(item.id)}
                          >
                            <FiX />
                          </button>
                        </div>

                        <div className={styles.mobileBottomRow}>
                          <div className={styles.mobilePriceRow}>
                            <div className={styles.priceCell}>
                              <div className={styles.priceWrapper}>
                                <span className={styles.currentPrice}>
                                  <FaRupeeSign className={styles.rupeeIconSmall} />
                                  {item.price.toLocaleString('en-IN')}
                                </span>
                                {item.oldPrice && (
                                  <span className={styles.oldPrice}>
                                    <FaRupeeSign className={styles.rupeeIconSmall} />
                                    {item.oldPrice.toLocaleString('en-IN')}
                                  </span>
                                )}
                                {item.oldPrice && (
                                  <span className={styles.savings}>
                                    Save {Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={styles.mobileQuantityRow}>
                            <div className={styles.quantityCell}>
                              <div className={styles.quantityControls}>
                                <button
                                  className={styles.quantityButton}
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <FiMinus />
                                </button>
                                <span className={styles.quantityValue}>{item.quantity}</span>
                                <button
                                  className={styles.quantityButton}
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <FiPlus />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className={styles.mobileSubtotalRow}>
                            <span className={styles.subtotalLabel}>Subtotal:</span>
                            <span className={styles.subtotalPrice}>
                              <FaRupeeSign className={styles.rupeeIconSmall} />
                              {(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className={styles.orderSummary}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <FaGem className={styles.summaryIcon} />
                    <h3 className={styles.summaryTitle}>Order Summary</h3>
                  </div>

                  <div className={styles.summaryRow}>
                    <span>Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</span>
                    <span>
                      <FaRupeeSign className={styles.rupeeIconSmall} />
                      {subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className={styles.summaryRow}>
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>

                  <div className={styles.divider} />

                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Total</span>
                    <span className={styles.totalAmount}>
                      <FaRupeeSign className={styles.rupeeIconLarge} />
                      {total.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button className={styles.checkoutButton} onClick={handleCheckout}>
                    Proceed to Checkout
                  </button>

                  <div className={styles.trustSection}>
                    <div className={styles.trustCard}>
                      <FiTruck className={styles.trustIcon} />
                      <div className={styles.trustInfo}>
                        <h4>Free Shipping</h4>
                        <p>Free shipping for order above ₹5000</p>
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

            {/* Why Aurevian Section */}
            <section className={styles.whyAurevian}>
              <div className={styles.whyContent}>
                <div className={styles.whyLeft}>
                  <span className={styles.whyBadge}>✦ Aurevian Promise</span>
                  <h2 className={styles.whyTitle}>Gold-Plated Confidence,<br />Worn Every Day</h2>
                  <p className={styles.whyDesc}>
                    Aurevian designs jewellery for the days that don't wait for an occasion.
                    Every piece is crafted to be lived in, loved, and worn with confidence.
                  </p>
                  <p className={styles.whyDesc}>
                    Timeless Craftsmanship - Designed to last a lifetime<br />
                    Everyday Luxury - Fine jewellery for real life<br />
                    Confidence Guaranteed - Wear it, love it, live in it
                  </p>
                </div>
                <div className={styles.whyRight}>
                  <div className={styles.whyImage}>
                    <img src={logo} alt="Aurevian Logo" className={styles.whyImageLogo} />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Cart;