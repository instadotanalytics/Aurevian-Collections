// src/Pages/Seller/SellerPayment/SellerPayment.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCreditCard,
  FiSmartphone,
  FiLock,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiShield,
} from "react-icons/fi";
import styles from "./SellerPayment.module.css";
import {
  fetchPlans,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  loadRazorpayScript,
  resetPaymentState,
} from "../../../redux/slices/sellerSubscriptionSlice";

const SellerPayment = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { seller } = useSelector((state) => state.seller);
  const {
    plans,
    order,
    orderStatus,
    paymentStatus,
    paymentResult,
    paymentError,
  } = useSelector((state) => state.sellerSubscription);

  const [method, setMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");

  const plan = plans.find((p) => p.id === planId) || order?.plan;

  useEffect(() => {
    dispatch(resetPaymentState());
    if (plans.length === 0) {
      dispatch(fetchPlans());
    }
    dispatch(createSubscriptionOrder({ planId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const handlePayNow = async () => {
    if (!order) return;

    // Basic dummy validation so it feels real
    if (method === "card") {
      if (
        cardNumber.replace(/\s/g, "").length < 12 ||
        !cardExpiry ||
        cardCvv.length < 3 ||
        !cardName
      ) {
        return;
      }
    } else if (method === "upi" && !upiId.includes("@")) {
      return;
    }

    // MOCK MODE — backend has no Razorpay keys configured, auto-approves
    if (order.isMockPayment) {
      dispatch(
        verifySubscriptionPayment({
          subscriptionId: order.subscriptionId,
          razorpayOrderId: order.orderId,
        }),
      );
      return;
    }

    // REAL RAZORPAY MODE
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) return;

    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Aurevian Collections",
      description: `${order.plan.name} Seller Plan`,
      order_id: order.orderId,
      prefill: {
        name: seller?.fullName || cardName,
        email: seller?.email,
        contact: seller?.phone,
      },
      theme: { color: "#6366f1" },
      handler: (response) => {
        dispatch(
          verifySubscriptionPayment({
            subscriptionId: order.subscriptionId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        );
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const formatCardNumber = (value) =>
    value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  // ============================================
  // SUCCESS SCREEN
  // ============================================
  if (paymentStatus === "success") {
    return (
      <div className={styles.paymentPage}>
        <div className={styles.statusCard}>
          <div className={styles.successIconWrap}>
            <FiCheckCircle className={styles.successIcon} />
          </div>
          <h2 className={styles.statusTitle}>Payment Successful!</h2>
          <p className={styles.statusText}>
            You've been upgraded to the{" "}
            <strong>{paymentResult?.plan?.name}</strong> plan.
          </p>
          {paymentResult?.endDate && (
            <p className={styles.statusSub}>
              Valid until {new Date(paymentResult.endDate).toLocaleDateString()}
            </p>
          )}
          <button
            className={styles.primaryBtn}
            onClick={() => navigate("/seller/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // FAILED SCREEN
  // ============================================
  if (paymentStatus === "failed") {
    return (
      <div className={styles.paymentPage}>
        <div className={styles.statusCard}>
          <div className={styles.failIconWrap}>
            <FiXCircle className={styles.failIcon} />
          </div>
          <h2 className={styles.statusTitle}>Payment Failed</h2>
          <p className={styles.statusText}>
            {paymentError ||
              "Something went wrong while processing your payment."}
          </p>
          <div className={styles.statusActions}>
            <button
              className={styles.secondaryBtn}
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
            <button
              className={styles.primaryBtn}
              onClick={() => dispatch(createSubscriptionOrder({ planId }))}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ORDER CREATE ERROR
  // ============================================
  if (orderStatus === "error") {
    return (
      <div className={styles.paymentPage}>
        <div className={styles.statusCard}>
          <div className={styles.failIconWrap}>
            <FiXCircle className={styles.failIcon} />
          </div>
          <h2 className={styles.statusTitle}>Couldn't Start Payment</h2>
          <p className={styles.statusText}>{paymentError}</p>
          <button className={styles.secondaryBtn} onClick={() => navigate(-1)}>
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // LOADING (order being created)
  // ============================================
  if (orderStatus === "creating" || !order || !plan) {
    return (
      <div className={styles.paymentPage}>
        <div className={styles.loadingCard}>
          <FiLoader className={styles.spinner} />
          <p>Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN CHECKOUT VIEW
  // ============================================
  const isProcessing = paymentStatus === "processing";

  return (
    <div className={styles.paymentPage}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back to plans
        </button>
        <div className={styles.secureTag}>
          <FiShield /> Secure Checkout
        </div>
      </div>

      <div className={styles.checkoutGrid}>
        {/* LEFT: Order Summary */}
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Order Summary</span>

          <div className={styles.planRow}>
            <div className={styles.planIconBox}>{plan.icon}</div>
            <div>
              <h3 className={styles.planTitle}>{plan.name} Plan</h3>
              <p className={styles.planSubtitle}>Monthly subscription</p>
            </div>
          </div>

          <ul className={styles.summaryFeatures}>
            {plan.features?.slice(0, 6).map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>

          <div className={styles.priceBreakdown}>
            <div className={styles.priceRow}>
              <span>Plan price</span>
              <span>{plan.priceDisplay}</span>
            </div>
            <div className={styles.priceRow}>
              <span>Taxes &amp; fees</span>
              <span>Included</span>
            </div>
            <div className={`${styles.priceRow} ${styles.totalRow}`}>
              <span>Total due today</span>
              <span>{plan.priceDisplay}</span>
            </div>
          </div>

          {order.isMockPayment && (
            <div className={styles.mockBadge}>
              Test Mode — no real payment will be charged
            </div>
          )}
        </div>

        {/* RIGHT: Payment Form */}
        <div className={styles.paymentCard}>
          <span className={styles.summaryLabel}>Payment Method</span>

          <div className={styles.methodTabs}>
            <button
              className={`${styles.methodTab} ${
                method === "card" ? styles.methodActive : ""
              }`}
              onClick={() => setMethod("card")}
              type="button"
            >
              <FiCreditCard /> Card
            </button>
            <button
              className={`${styles.methodTab} ${
                method === "upi" ? styles.methodActive : ""
              }`}
              onClick={() => setMethod("upi")}
              type="button"
            >
              <FiSmartphone /> UPI
            </button>
          </div>

          {method === "card" ? (
            <div className={styles.formFields}>
              <label className={styles.fieldLabel}>Card Number</label>
              <input
                className={styles.input}
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
                maxLength={19}
              />

              <label className={styles.fieldLabel}>Cardholder Name</label>
              <input
                className={styles.input}
                placeholder="Name on card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />

              <div className={styles.fieldRow}>
                <div className={styles.fieldCol}>
                  <label className={styles.fieldLabel}>Expiry</label>
                  <input
                    className={styles.input}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) =>
                      setCardExpiry(formatExpiry(e.target.value))
                    }
                    maxLength={5}
                  />
                </div>
                <div className={styles.fieldCol}>
                  <label className={styles.fieldLabel}>CVV</label>
                  <input
                    className={styles.input}
                    placeholder="123"
                    type="password"
                    value={cardCvv}
                    onChange={(e) =>
                      setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.formFields}>
              <label className={styles.fieldLabel}>UPI ID</label>
              <input
                className={styles.input}
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
          )}

          <button
            className={styles.payBtn}
            onClick={handlePayNow}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <FiLoader className={styles.btnSpinner} /> Processing...
              </>
            ) : (
              <>
                <FiLock /> Pay {plan.priceDisplay}
              </>
            )}
          </button>

          <p className={styles.secureNote}>
            <FiLock /> Payments are encrypted and securely processed
            {order.isMockPayment ? " (Test Mode)" : " by Razorpay"}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerPayment;
