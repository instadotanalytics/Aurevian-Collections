// src/Pages/Checkout/Checkout.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  FiLock,
  FiTruck,
  FiLoader,
  FiAlertCircle,
  FiCreditCard,
  FiPackage,
  FiCheck,
  FiZap,
  FiMapPin,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";
import styles from "./Checkout.module.css";
import pmStyles from "./PaymentMethod.module.css";
import * as orderApi from "../../api/orderApi.js";
import * as cartApi from "../../api/cartApi.js";
import * as paymentSettingsApi from "../../api/paymentSettingsApi.js";
import { fetchProfile } from "../../redux/slices/profileSlice.js";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const isValidPincode = (value) => /^\d{6}$/.test(String(value || "").trim());

const PINCODE_DEBOUNCE_MS = 500;

const initialShippingQuote = {
  status: "idle",
  fee: 0,
  courierName: null,
  estimatedDeliveryDays: null,
  quotedPincode: null,
  message: null,
};

// Generates a per-checkout-attempt idempotency key. One value is used for
// every create/retry within this mount of the page, so double-clicks and
// network retries always resolve to the same backend order.
const generateClientRequestId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `crid_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
};

// ✅ NEW — maps a saved profile address (Backend/models/User.js addressSchema
// shape: recipientName/phone/house/apartment/street/landmark/area/city/
// state/country/pincode) onto the shippingAddress shape this page/Order
// schema already uses (fullName/phone/addressLine1/addressLine2/city/
// state/pincode). Pure/local — never sent anywhere on its own.
const mapSavedAddressToShipping = (addr) => ({
  fullName: addr.recipientName || "",
  phone: addr.phone || "",
  addressLine1: [addr.house, addr.apartment].filter(Boolean).join(", "),
  addressLine2: [addr.street, addr.landmark, addr.area]
    .filter(Boolean)
    .join(", "),
  city: addr.city || "",
  state: addr.state || "",
  pincode: addr.pincode || "",
});

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // ✅ NEW — same persisted addresses the Profile → Address tab reads/writes
  // (state.profile.addresses), so Profile, Overview, and Checkout are all
  // looking at one source of truth instead of three separate ones.
  const savedAddresses = useSelector((state) => state.profile.addresses) || [];
  const profileState = useSelector((state) => state.profile.profile);

  const items = location.state?.items || [];

  const [address, setAddress] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  // ✅ NEW — which saved address (if any) is currently selected. Null means
  // the person is entering an address manually / hasn't picked one yet.
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const autoSelectedRef = useRef(false);

  // "online" | "cod"
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // idle | creating | awaiting_payment | verifying | failed | cancelled | placing_cod
  const [paymentState, setPaymentState] = useState("idle");
  const [paymentStateMessage, setPaymentStateMessage] = useState(null);

  const [shippingQuote, setShippingQuote] = useState(initialShippingQuote);

  const requestIdRef = useRef(0);
  const debounceTimerRef = useRef(null);
  // Hard lock against double-submits — separate from React state because
  // state updates are async and a second click can land before re-render.
  const submitLockRef = useRef(false);
  // Stable for the lifetime of this checkout attempt so retries after a
  // failed/cancelled payment reuse the same order instead of creating a
  // new one.
  const clientRequestIdRef = useRef(generateClientRequestId());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  // ✅ NEW — always refresh saved addresses on mount so edits/deletes made
  // in Profile → Address are reflected here even if this page was already
  // loaded, or if the person navigates straight to /checkout without
  // visiting Profile first in this session.
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ✅ NEW — auto-select the default saved address (or the only one, if
  // there's exactly one) the first time addresses become available. Only
  // runs once per mount so it never fights with a manual selection or
  // overwrites in-progress manual edits.
  useEffect(() => {
    if (autoSelectedRef.current) return;
    if (!savedAddresses.length) return;

    autoSelectedRef.current = true;
    const preferred =
      savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
    setSelectedAddressId(preferred._id);
    setAddress((prev) => ({
      ...prev,
      ...mapSavedAddressToShipping(preferred),
    }));
  }, [savedAddresses]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setAddress((prev) => ({ ...prev, ...mapSavedAddressToShipping(addr) }));
  };

  // ✅ Fetch COD availability — backend is the single source of truth.
  // COD is never shown just because we assume it's available.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await paymentSettingsApi.getPaymentSettings();
        if (cancelled) return;
        if (res.success) {
          setPaymentSettings(res.data);
          // If COD isn't available, make sure "online" stays selected.
          if (!res.data.codEnabled) setPaymentMethod("online");
        }
      } catch (error) {
        // If settings can't be fetched, fail safe: don't offer COD.
        if (!cancelled)
          setPaymentSettings({ codEnabled: false, onlinePaymentEnabled: true });
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;

    if (!isValidPincode(address.pincode)) {
      setShippingQuote(initialShippingQuote);
      return;
    }

    setShippingQuote((prev) => ({
      ...initialShippingQuote,
      status: "checking",
    }));

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await cartApi.calculateShippingRate(
          address.pincode,
          paymentMethod === "cod" ? "cod" : "prepaid",
        );

        if (requestIdRef.current !== thisRequestId) return;

        if (res.success && res.serviceable) {
          setShippingQuote({
            status: "success",
            fee: res.data.shippingFee,
            courierName: res.data.courierName,
            estimatedDeliveryDays: res.data.estimatedDeliveryDays,
            quotedPincode: address.pincode,
            message: null,
          });
        } else {
          setShippingQuote({
            ...initialShippingQuote,
            status: "unavailable",
            message:
              res.message ||
              "Sorry, delivery is currently unavailable for this pincode.",
          });
        }
      } catch (error) {
        if (requestIdRef.current !== thisRequestId) return;
        setShippingQuote({
          ...initialShippingQuote,
          status: "error",
          message:
            error.response?.data?.message ||
            "Unable to calculate shipping right now. Please try again.",
        });
      }
    }, PINCODE_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
    // Re-quote when payment method changes too (COD/prepaid rates can differ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.pincode, paymentMethod]);

  if (items.length === 0) return null;

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const quoteIsCurrent =
    shippingQuote.status === "success" &&
    shippingQuote.quotedPincode === address.pincode;
  const shippingFee = quoteIsCurrent ? shippingQuote.fee : 0;
  const totalAmount = itemsTotal + shippingFee;

  const isProcessing = [
    "creating",
    "awaiting_payment",
    "verifying",
    "placing_cod",
  ].includes(paymentState);

  const codAvailable = !!paymentSettings?.codEnabled;
  const codWithinRange = useMemo(() => {
    if (!paymentSettings) return true;
    const { codMinOrderAmount = 0, codMaxOrderAmount = 0 } = paymentSettings;
    if (codMinOrderAmount > 0 && totalAmount < codMinOrderAmount) return false;
    if (codMaxOrderAmount > 0 && totalAmount > codMaxOrderAmount) return false;
    return true;
  }, [paymentSettings, totalAmount]);

  const canPay =
    quoteIsCurrent &&
    !isProcessing &&
    (paymentMethod === "cod" ? codAvailable && codWithinRange : true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Manually editing any address field means the person has deviated
    // from the saved address they picked (or is entering a fresh one) —
    // stop treating a saved-address card as "selected" so the UI doesn't
    // show it highlighted while the fields no longer match it.
    setSelectedAddressId(null);
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const renderShippingLine = () => {
    switch (shippingQuote.status) {
      case "idle":
        return (
          <span className={styles.shippingHint}>
            Enter your delivery pincode to calculate shipping
          </span>
        );
      case "checking":
        return (
          <span className={styles.shippingChecking}>
            <FiLoader className={styles.spinIcon} /> Calculating shipping...
          </span>
        );
      case "success":
        if (!quoteIsCurrent) {
          return (
            <span className={styles.shippingChecking}>
              <FiLoader className={styles.spinIcon} /> Calculating shipping...
            </span>
          );
        }
        return (
          <span>
            {shippingFee === 0
              ? "Complimentary"
              : `₹${shippingFee.toLocaleString("en-IN")}`}
          </span>
        );
      case "unavailable":
        return (
          <span className={styles.shippingError}>
            <FiAlertCircle /> {shippingQuote.message}
          </span>
        );
      case "error":
        return (
          <span className={styles.shippingError}>
            <FiAlertCircle /> {shippingQuote.message}
          </span>
        );
      default:
        return null;
    }
  };

  const validateAddressFields = () => {
    const { fullName, phone, addressLine1, city, state, pincode } = address;
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      toast.error("Please fill in all required address fields");
      return false;
    }
    if (!isValidPincode(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }
    if (!quoteIsCurrent) {
      toast.error("Please wait for shipping to be calculated for this pincode");
      return false;
    }
    return true;
  };

  // ============================================
  // CASH ON DELIVERY FLOW
  // No gateway redirect. Backend re-validates everything (cart, prices,
  // stock, shipping, COD availability) — the frontend total is never
  // trusted for the actual charge.
  // ============================================
  const handlePlaceCODOrder = async () => {
    if (submitLockRef.current) return;
    if (!validateAddressFields()) return;
    if (!codAvailable) {
      toast.error("Cash on Delivery is currently unavailable");
      return;
    }
    if (!codWithinRange) {
      toast.error("This order amount isn't eligible for Cash on Delivery");
      return;
    }

    submitLockRef.current = true;
    setPaymentState("placing_cod");
    setPaymentStateMessage(null);

    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));
      const res = await orderApi.createCODOrder(
        orderItems,
        address,
        clientRequestIdRef.current,
      );

      if (!res.success) {
        setPaymentState("failed");
        setPaymentStateMessage(res.message || "Failed to place order");
        toast.error(res.message || "Failed to place order");
        submitLockRef.current = false;
        return;
      }

      // COD order creation IS the success condition — cart has already
      // been cleared server-side at this point.
      toast.success("Order placed successfully — pay on delivery");
      navigate(`/order-success/${res.data._id || res.data.orderId}`);
    } catch (error) {
      setPaymentState("failed");
      const msg = error.response?.data?.message || "Something went wrong";
      setPaymentStateMessage(msg);
      toast.error(msg);
      submitLockRef.current = false;
    }
  };

  // ============================================
  // ONLINE PAYMENT (RAZORPAY) FLOW
  // Cart is only cleared after server-side signature verification
  // succeeds — never on gateway "success" alone, and never on close/
  // cancel/failure.
  // ============================================
  const handlePlaceOnlineOrder = async (e) => {
    e?.preventDefault?.();
    if (submitLockRef.current) return;
    if (!validateAddressFields()) return;

    submitLockRef.current = true;
    setPaymentState("creating");
    setPaymentStateMessage(null);

    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));
      const createRes = await orderApi.createRazorpayOrder(
        orderItems,
        address,
        clientRequestIdRef.current,
      );

      if (!createRes.success) {
        setPaymentState("failed");
        setPaymentStateMessage(createRes.message || "Failed to create order");
        toast.error(createRes.message || "Failed to create order");
        submitLockRef.current = false;
        return;
      }

      const { orderId, razorpayOrderId, amount, currency, mock, orderNumber } =
        createRes.data;

      if (mock) {
        setPaymentState("verifying");
        const verifyRes = await orderApi.verifyRazorpayPayment({
          orderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `mock_pay_${Date.now()}`,
          razorpay_signature: "mock_signature",
        });
        submitLockRef.current = false;
        if (verifyRes.success) {
          setPaymentState("idle");
          toast.success("Order placed successfully (test mode)");
          navigate(`/order-success/${orderId}`);
        } else {
          setPaymentState("failed");
          setPaymentStateMessage(
            verifyRes.message || "Payment verification failed",
          );
          toast.error(verifyRes.message || "Payment verification failed");
        }
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentState("failed");
        setPaymentStateMessage(
          "Failed to load payment gateway. Check your connection.",
        );
        toast.error("Failed to load payment gateway. Check your connection.");
        submitLockRef.current = false;
        return;
      }

      setPaymentState("awaiting_payment");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "Aurevian Collections",
        description: `Order ${orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: address.fullName,
          contact: address.phone,
          email: user?.email || "",
        },
        theme: { color: "#1c1815" },
        handler: async (response) => {
          setPaymentState("verifying");
          try {
            const verifyRes = await orderApi.verifyRazorpayPayment({
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.success) {
              setPaymentState("idle");
              toast.success("Payment successful! Order placed.");
              navigate(`/order-success/${orderId}`);
            } else {
              setPaymentState("failed");
              setPaymentStateMessage(
                verifyRes.message || "Payment verification failed",
              );
              toast.error(verifyRes.message || "Payment verification failed");
            }
          } catch (err) {
            setPaymentState("failed");
            setPaymentStateMessage("Payment verification failed");
            toast.error("Payment verification failed");
          } finally {
            submitLockRef.current = false;
          }
        },
        modal: {
          // Customer closed the window without paying — the order stays
          // pending server-side (never marked paid), cart stays intact,
          // and the customer can retry with the same order (same
          // clientRequestId -> same razorpayOrderId is reused on retry).
          ondismiss: () => {
            setPaymentState("cancelled");
            setPaymentStateMessage(
              "Payment window closed. You can try again — your cart is safe.",
            );
            submitLockRef.current = false;
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setPaymentState("failed");
        setPaymentStateMessage(
          "Payment failed. You can retry — your cart is safe.",
        );
        toast.error("Payment failed. Please try again.");
        submitLockRef.current = false;
      });
      rzp.open();
    } catch (error) {
      setPaymentState("failed");
      const msg = error.response?.data?.message || "Something went wrong";
      setPaymentStateMessage(msg);
      toast.error(msg);
      submitLockRef.current = false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === "cod") {
      handlePlaceCODOrder();
    } else {
      handlePlaceOnlineOrder(e);
    }
  };

  const getButtonLabel = () => {
    if (!isValidPincode(address.pincode)) return "Enter Pincode to Continue";
    if (!quoteIsCurrent) return "Calculating Shipping...";
    if (paymentMethod === "cod") {
      if (!codAvailable) return "COD Unavailable";
      if (!codWithinRange) return "Amount Not Eligible for COD";
      if (paymentState === "placing_cod") return "Placing Order...";
      return `Place Order — Pay ₹${totalAmount.toLocaleString("en-IN")} on Delivery`;
    }
    if (paymentState === "creating") return "Preparing Payment...";
    if (paymentState === "awaiting_payment") return "Waiting for Payment...";
    if (paymentState === "verifying") return "Verifying Payment...";
    return `Pay ₹${totalAmount.toLocaleString("en-IN")} with Razorpay`;
  };

  return (
    <>
      <Header />
      <div className={styles.checkoutPage}>
        <div className={styles.eyebrow}>Secure Checkout</div>
        <h1 className={styles.pageTitle}>Complete Your Order</h1>
        <p className={styles.pageSubtitle}>
          Every piece is inspected, packaged, and insured before it leaves our
          atelier.
        </p>

        <div className={styles.checkoutGrid}>
          <form className={styles.addressForm} onSubmit={handleSubmit}>
            <h3>
              <FiTruck /> Shipping Address
            </h3>

            {/* ============================================
                SAVED ADDRESSES — ✅ NEW
                Same persisted addresses as Profile → Address / Overview.
                Selecting one fills the fields below; the person can still
                edit those fields afterward, and whatever is in `address`
                at submit time is what's sent to the order API.
                ============================================ */}
            {savedAddresses.length > 0 && (
              <div className={styles.savedAddressSection}>
                <p className={styles.savedAddressHeading}>
                  <FiMapPin size={14} /> Use a saved address
                </p>
                <div className={styles.savedAddressList}>
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`${styles.savedAddressCard} ${
                        selectedAddressId === addr._id
                          ? styles.savedAddressCardActive
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === addr._id}
                        onChange={() => handleSelectSavedAddress(addr)}
                      />
                      <span className={styles.savedAddressBody}>
                        <span className={styles.savedAddressTop}>
                          <strong>{addr.recipientName}</strong>
                          {addr.isDefault && (
                            <span className={styles.savedAddressDefaultBadge}>
                              Default
                            </span>
                          )}
                        </span>
                        <span className={styles.savedAddressText}>
                          {addr.house}
                          {addr.apartment ? `, ${addr.apartment}` : ""}
                          {addr.street ? `, ${addr.street}` : ""}
                          {addr.area ? `, ${addr.area}` : ""}, {addr.city},{" "}
                          {addr.state} - {addr.pincode}
                        </span>
                        <span className={styles.savedAddressPhone}>
                          {addr.phone}
                        </span>
                      </span>
                      {selectedAddressId === addr._id && (
                        <FiCheck
                          size={14}
                          className={styles.savedAddressCheck}
                        />
                      )}
                    </label>
                  ))}
                </div>
                <p className={styles.savedAddressHint}>
                  Selecting a saved address fills in the fields below — you can
                  still edit them before placing your order.
                </p>
              </div>
            )}

            <div className={styles.formRow}>
              <input
                name="fullName"
                placeholder="Full Name *"
                value={address.fullName}
                onChange={handleChange}
                required
              />
              <input
                name="phone"
                placeholder="Phone Number *"
                value={address.phone}
                onChange={handleChange}
                required
              />
            </div>

            <input
              name="addressLine1"
              placeholder="Address Line 1 *"
              value={address.addressLine1}
              onChange={handleChange}
              required
            />
            <input
              name="addressLine2"
              placeholder="Address Line 2 (optional)"
              value={address.addressLine2}
              onChange={handleChange}
            />

            <div className={styles.formRow}>
              <input
                name="city"
                placeholder="City *"
                value={address.city}
                onChange={handleChange}
                required
              />
              <input
                name="state"
                placeholder="State *"
                value={address.state}
                onChange={handleChange}
                required
              />
              <input
                name="pincode"
                placeholder="Pincode *"
                value={address.pincode}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={6}
                required
              />
            </div>

            {shippingQuote.status === "success" && quoteIsCurrent && (
              <p className={styles.courierNote}>
                Ships via {shippingQuote.courierName}
                {shippingQuote.estimatedDeliveryDays
                  ? ` · ${shippingQuote.estimatedDeliveryDays} delivery`
                  : ""}
              </p>
            )}

            {/* ============================================
                PAYMENT METHOD SECTION — UPDATED
                ============================================ */}
            <div className={pmStyles.section}>
              <h3 className={pmStyles.sectionTitle}>
                <FiCreditCard /> Payment Method
              </h3>

              {settingsLoading ? (
                <p className={pmStyles.settingsLoading}>
                  <FiLoader className={styles.spinIcon} /> Loading payment
                  options...
                </p>
              ) : (
                <div className={pmStyles.optionsGrid}>
                  <label
                    className={`${pmStyles.option} ${
                      paymentMethod === "online" ? pmStyles.optionActive : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className={pmStyles.optionRadio}
                    />
                    <span className={pmStyles.optionIconWrap}>
                      <FiZap size={16} />
                    </span>
                    <span className={pmStyles.optionBody}>
                      <span className={pmStyles.optionLabel}>
                        Pay Now (Online)
                      </span>
                      <span className={pmStyles.optionSub}>
                        Cards, UPI, netbanking via Razorpay
                      </span>
                    </span>
                    {paymentMethod === "online" && (
                      <span className={pmStyles.optionCheck}>
                        <FiCheck size={12} />
                      </span>
                    )}
                  </label>

                  {/* COD is only ever rendered when the backend says it's
                      enabled — never shown greyed-out or disabled. */}
                  {codAvailable && (
                    <label
                      className={`${pmStyles.option} ${
                        paymentMethod === "cod" ? pmStyles.optionActive : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className={pmStyles.optionRadio}
                      />
                      <span className={pmStyles.optionIconWrap}>
                        <FiPackage size={16} />
                      </span>
                      <span className={pmStyles.optionBody}>
                        <span className={pmStyles.optionLabel}>
                          Cash on Delivery
                        </span>
                        <span className={pmStyles.optionSub}>
                          Pay in cash when your order arrives
                        </span>
                      </span>
                      {paymentMethod === "cod" && (
                        <span className={pmStyles.optionCheck}>
                          <FiCheck size={12} />
                        </span>
                      )}
                    </label>
                  )}
                </div>
              )}

              {paymentMethod === "cod" && codAvailable && !codWithinRange && (
                <div className={pmStyles.codNote}>
                  <FiAlertCircle />
                  {paymentSettings.codMinOrderAmount > 0 &&
                  totalAmount < paymentSettings.codMinOrderAmount
                    ? `Cash on Delivery is only available for orders above ₹${paymentSettings.codMinOrderAmount.toLocaleString("en-IN")}`
                    : `Cash on Delivery is only available for orders up to ₹${paymentSettings.codMaxOrderAmount.toLocaleString("en-IN")}`}
                </div>
              )}

              {paymentMethod === "cod" && codAvailable && codWithinRange && (
                <div className={pmStyles.codNote}>
                  <FiPackage />
                  You'll pay ₹{totalAmount.toLocaleString("en-IN")} in cash to
                  the delivery agent when your order arrives. No payment is
                  required now.
                </div>
              )}

              {paymentState === "failed" && paymentStateMessage && (
                <div
                  className={`${pmStyles.paymentStateBanner} ${pmStyles.stateFailed}`}
                >
                  <FiAlertCircle /> {paymentStateMessage}
                </div>
              )}
              {paymentState === "cancelled" && paymentStateMessage && (
                <div
                  className={`${pmStyles.paymentStateBanner} ${pmStyles.stateCancelled}`}
                >
                  <FiAlertCircle /> {paymentStateMessage}
                </div>
              )}
              {paymentState === "verifying" && (
                <div
                  className={`${pmStyles.paymentStateBanner} ${pmStyles.stateVerifying}`}
                >
                  <FiLoader className={styles.spinIcon} /> Verifying your
                  payment — please don't close this page.
                </div>
              )}
            </div>

            <button type="submit" className={styles.payBtn} disabled={!canPay}>
              <FiLock /> {getButtonLabel()}
            </button>

            <div className={styles.secureNote}>
              <FiLock size={11} />{" "}
              {paymentMethod === "cod"
                ? "No online payment required for Cash on Delivery"
                : "256-bit encrypted payment"}
            </div>
          </form>

          <div className={styles.orderSummary}>
            <h3>Order Summary</h3>
            {items.map((item) => (
              <div className={styles.summaryItem} key={item.productId}>
                <img src={item.image} alt={item.name} />
                <div>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemQty}>Qty: {item.quantity}</p>
                </div>
                <span>
                  <FaRupeeSign size={12} />
                  {(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>
                <FaRupeeSign size={12} />
                {itemsTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              {renderShippingLine()}
            </div>
            <div className={styles.summaryRow}>
              <span>Payment Method</span>
              <span>
                {paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : "Online (Razorpay)"}
              </span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>
                <FaRupeeSign size={14} />
                {totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
