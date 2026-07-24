// src/Pages/Checkout/Checkout.jsx (partial)
import ReferralCodeInput from "../../UserDashboard/Referral/ReferralCodeInput";
import { useState } from "react";

const Checkout = () => {
  const [cartTotal, setCartTotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Calculate cart total (your existing logic)
  useEffect(() => {
    // Calculate total
    const total = calculateCartTotal();
    setCartTotal(total);
  }, [cartItems]);

  const handleDiscountApplied = (amount) => {
    setDiscountAmount(amount);
  };

  return (
    <div className="checkoutContainer">
      {/* Order Summary */}
      <div className="orderSummary">
        <h3>Order Summary</h3>
        <div className="summaryRow">
          <span>Subtotal</span>
          <span>₹{cartTotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="summaryRow discount">
            <span>Discount</span>
            <span>-₹{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="summaryRow total">
          <span>Total</span>
          <span>₹{(cartTotal - discountAmount).toFixed(2)}</span>
        </div>
      </div>

      {/* Referral Code Input */}
      <ReferralCodeInput
        cartTotal={cartTotal}
        onDiscountApplied={handleDiscountApplied}
      />
    </div>
  );
};