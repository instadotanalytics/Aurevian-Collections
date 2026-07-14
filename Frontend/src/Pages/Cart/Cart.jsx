// Cart.jsx
import React, { useState, useMemo } from 'react';
import styles from './Cart.module.css';
import Header from '../Layout/Header/Header';
import Footer from '../Layout/Footer/Footer';

// Icons (using simple SVG paths - replace with your preferred icon library)
const CartIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MinusIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const JewelIcon = () => (
  <svg viewBox="0 0 80 80" width="48" height="48" fill="none" stroke="#D4AF37" strokeWidth="1.5">
    <path d="M40 5 L60 25 L40 45 L20 25 L40 5Z" />
    <path d="M40 45 L60 65 L40 75 L20 65 L40 45Z" />
    <path d="M20 25 L40 45 L20 65 L5 45 L20 25Z" />
    <path d="M60 25 L40 45 L60 65 L75 45 L60 25Z" />
    <circle cx="40" cy="45" r="3" fill="#D4AF37" stroke="none" />
  </svg>
);

const SecureIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="#D4AF37" strokeWidth="1.5" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const CertificateIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="#D4AF37" strokeWidth="1.5" fill="none">
    <circle cx="12" cy="8" r="4" />
    <path d="M5.5 16.5L8 14" />
    <path d="M16.5 16.5L14 14" />
    <path d="M12 12v4" />
    <path d="M8 18h8" />
  </svg>
);

const ReturnIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="#D4AF37" strokeWidth="1.5" fill="none">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
  </svg>
);

const EmptyCartIllustration = () => (
  <div className={styles.emptyIllustration}>
    <div className={styles.emptyIconWrapper}>
      <JewelIcon />
    </div>
  </div>
);

// Main Cart Component
const Cart = () => {
  // Mock data - replace with your actual data/state
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Diamond Halo Ring',
      variant: '18K White Gold',
      size: 'Size 6',
      price: 4999,
      oldPrice: 5999,
      quantity: 1,
      available: true,
      image: '/api/placeholder/120/120',
    },
    {
      id: 2,
      name: 'Emerald Drop Earrings',
      variant: '14K Yellow Gold',
      size: 'One Size',
      price: 3299,
      oldPrice: 3799,
      quantity: 2,
      available: true,
      image: '/api/placeholder/120/120',
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
      image: '/api/placeholder/120/120',
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
      <div className={styles.cartPage}>
        <div className={styles.emptyCartContainer}>
          <EmptyCartIllustration />
          <h2 className={styles.emptyTitle}>Your Shopping Bag is Empty</h2>
          <p className={styles.emptyDescription}>
            Discover our curated collection of fine jewellery
          </p>
          <button className={styles.exploreButton}>
            Explore Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <Header/>
    <div className={styles.cartPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>✦ Luxury Shopping</span>
          <h1 className={styles.heroTitle}>Your Shopping Bag</h1>
          <p className={styles.heroDescription}>
            Review your carefully selected jewellery pieces before checkout.
          </p>
        </div>
      </section>

      {/* Cart Content */}
      <div className={styles.cartContainer}>
        {/* Cart Items */}
        <div className={styles.cartItemsSection}>
          {cartItems.map((item) => (
            <div key={item.id} className={styles.cartCard}>
              <div className={styles.cardContent}>
                {/* Image */}
                <div className={styles.imageWrapper}>
                  <div className={styles.imagePlaceholder}>
                    <JewelIcon />
                  </div>
                </div>

                {/* Product Info */}
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{item.name}</h3>
                  <p className={styles.productVariant}>{item.variant}</p>
                  <p className={styles.productSize}>{item.size}</p>
                  <div className={styles.availability}>
                    {item.available ? (
                      <span className={styles.inStock}>✓ In Stock</span>
                    ) : (
                      <span className={styles.outOfStock}>• Out of Stock</span>
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
                    <MinusIcon />
                  </button>
                  <span className={styles.quantityValue}>{item.quantity}</span>
                  <button
                    className={styles.quantityButton}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <PlusIcon />
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
                  <CloseIcon /> Remove
                </button>
              </div>
            </div>
          ))}

          {/* Continue Shopping */}
          <button className={styles.continueShopping}>
            <ArrowLeftIcon /> Continue Shopping
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
                <SecureIcon />
                <h4>Secure Checkout</h4>
                <p>256-bit encrypted</p>
              </div>
              <div className={styles.trustCard}>
                <CertificateIcon />
                <h4>Certified Jewellery</h4>
                <p>100% authentic</p>
              </div>
              <div className={styles.trustCard}>
                <ReturnIcon />
                <h4>Easy Returns</h4>
                <p>30-day policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Cart;