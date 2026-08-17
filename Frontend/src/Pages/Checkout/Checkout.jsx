// src/Pages/Checkout/Checkout.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiLock,
  FiTruck,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";
import styles from "./Checkout.module.css";
import * as orderApi from "../../api/orderApi.js";
import * as cartApi from "../../api/cartApi.js";

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

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

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
  const [paying, setPaying] = useState(false);
  const [shippingQuote, setShippingQuote] = useState(initialShippingQuote);

  const requestIdRef = useRef(0);
  const debounceTimerRef = useRef(null);

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
          "prepaid",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.pincode]);

  if (items.length === 0) return null;

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const quoteIsCurrent =
    shippingQuote.status === "success" &&
    shippingQuote.quotedPincode === address.pincode;
  const shippingFee = quoteIsCurrent ? shippingQuote.fee : 0;
  const totalAmount = itemsTotal + shippingFee;

  const canPay = quoteIsCurrent && !paying;

  const handleChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
              ? "Free"
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

  const handlePay = async (e) => {
    e.preventDefault();

    const { fullName, phone, addressLine1, city, state, pincode } = address;
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      toast.error("Please fill in all required address fields");
      return;
    }
    if (!isValidPincode(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    if (!quoteIsCurrent) {
      toast.error("Please wait for shipping to be calculated for this pincode");
      return;
    }

    setPaying(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));
      const createRes = await orderApi.createRazorpayOrder(orderItems, address);

      if (!createRes.success) {
        toast.error(createRes.message || "Failed to create order");
        setPaying(false);
        return;
      }

      const { orderId, razorpayOrderId, amount, currency, mock, orderNumber } =
        createRes.data;

      if (mock) {
        // Backend running without real Razorpay keys — auto-verify
        const verifyRes = await orderApi.verifyRazorpayPayment({
          orderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `mock_pay_${Date.now()}`,
          razorpay_signature: "mock_signature",
        });
        setPaying(false);
        if (verifyRes.success) {
          toast.success("Order placed successfully (test mode)");
          // ✅ FIXED: used to be navigate("/orders") — dumped the customer
          // on a generic list with no confirmation of what just happened.
          navigate(`/order-success/${orderId}`);
        } else {
          toast.error(verifyRes.message || "Payment verification failed");
        }
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Check your connection.");
        setPaying(false);
        return;
      }

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
        theme: { color: "#111111" },
        handler: async (response) => {
          try {
            const verifyRes = await orderApi.verifyRazorpayPayment({
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.success) {
              toast.success("Payment successful! Order placed.");
              // ✅ FIXED: same change as above
              navigate(`/order-success/${orderId}`);
            } else {
              toast.error(verifyRes.message || "Payment verification failed");
            }
          } catch (err) {
            toast.error("Payment verification failed");
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setPaying(false);
      });
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      setPaying(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.checkoutPage}>
        <h1 className={styles.pageTitle}>Checkout</h1>

        <div className={styles.checkoutGrid}>
          <form className={styles.addressForm} onSubmit={handlePay}>
            <h3>
              <FiTruck /> Shipping Address
            </h3>

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

            <button type="submit" className={styles.payBtn} disabled={!canPay}>
              <FiLock />{" "}
              {paying
                ? "Processing..."
                : !isValidPincode(address.pincode)
                  ? "Enter pincode to continue"
                  : !quoteIsCurrent
                    ? "Calculating shipping..."
                    : `Pay ₹${totalAmount.toLocaleString("en-IN")} with Razorpay`}
            </button>
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
