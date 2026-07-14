// Cart.jsx
import React, { useState, useMemo } from 'react';
import styles from './Cart.module.css';
import Header from '../Layout/Header/Header';
import Footer from '../Layout/Footer/Footer';
import { 
  FiShoppingBag, 
  FiX, 
  FiMinus, 
  FiPlus, 
  FiArrowLeft,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiHeart,
  FiStar,
  FiAward
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

// Main Cart Component
const Cart = () => {
  // Mock data - replace with your actual data/state
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
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Existing calculations - DO NOT MODIFY
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const discount = useMemo(() => {
    return promoApplied ? subtotal * 0.1 : 0;
  }, [subtotal, promoApplied]);

  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal - discount + shipping;

  // Existing functions - DO NOT MODIFY
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

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'AUREVIAN10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  const handleCheckout = () => {
    // Existing checkout logic
    alert('Proceeding to checkout...');
  };

  // If cart is empty
  if (cartItems.length === 0) {
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
            <button className={styles.exploreButton}>
              Explore Collection
            </button>
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
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>
              <FiHeart /> Luxury Shopping
            </span>
            <h1 className={styles.heroTitle}>Your Shopping Bag</h1>
            <p className={styles.heroDescription}>
              Review your carefully selected jewellery pieces before checkout.
            </p>
          </div>
        </section>

        {/* Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{cartItems.length}</span>
            <span className={styles.statLabel}>Items</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>${subtotal.toFixed(0)}</span>
            <span className={styles.statLabel}>Subtotal</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {shipping === 0 ? '✓' : `$${shipping}`}
            </span>
            <span className={styles.statLabel}>Shipping</span>
          </div>
        </div>

        {/* Cart Content */}
        <div className={styles.cartContainer}>
          {/* Cart Items */}
          <div className={styles.cartItemsSection}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartCard}>
                <div className={styles.cardContent}>
                  {/* Image */}
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

                  {/* Product Info */}
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{item.name}</h3>
                    <p className={styles.productVariant}>{item.variant}</p>
                    <p className={styles.productSize}>{item.size}</p>
                    <div className={styles.availability}>
                      {item.available ? (
                        <span className={styles.inStock}>In Stock</span>
                      ) : (
                        <span className={styles.outOfStock}>Out of Stock</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
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

                  {/* Price */}
                  <div className={styles.priceSection}>
                    <div className={styles.priceWrapper}>
                      <span className={styles.currentPrice}>${item.price}</span>
                      {item.oldPrice && (
                        <>
                          <span className={styles.oldPrice}>${item.oldPrice}</span>
                          <span className={styles.savings}>
                            Save {Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    className={styles.removeButton}
                    onClick={() => removeItem(item.id)}
                  >
                    <FiX /> Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <button className={styles.continueShopping}>
              <FiArrowLeft /> Continue Shopping
            </button>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Discount</span>
                  <span className={styles.discountAmount}>-${discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>

              {/* Promo Code */}
              <div className={styles.promoSection}>
                <div className={styles.promoInputWrapper}>
                  <input
                    type="text"
                    className={styles.promoInput}
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button
                    className={styles.promoButton}
                    onClick={applyPromo}
                  >
                    Apply
                  </button>
                </div>
                {promoError && <span className={styles.promoError}>{promoError}</span>}
                {promoApplied && <span className={styles.promoSuccess}>✓ Promo applied!</span>}
              </div>

              <div className={styles.divider} />

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalAmount}>${total.toFixed(2)}</span>
              </div>

              <button className={styles.checkoutButton} onClick={handleCheckout}>
                Proceed to Checkout
              </button>

              {/* Trust Section */}
              <div className={styles.trustSection}>
                <div className={styles.trustCard}>
                  <FiTruck />
                  <h4>Free Shipping</h4>
                  <p>On orders over $500</p>
                </div>
                <div className={styles.trustCard}>
                  <FiShield />
                  <h4>Secure Payment</h4>
                  <p>256-bit encryption</p>
                </div>
                <div className={styles.trustCard}>
                  <FiRefreshCw />
                  <h4>Easy Returns</h4>
                  <p>30-day policy</p>
                </div>
              </div>

              {/* Loyalty Badge */}
              <div className={styles.loyaltyBadge}>
                <FiAward />
                <span>Earn rewards on every purchase</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;