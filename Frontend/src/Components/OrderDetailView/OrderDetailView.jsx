// src/Components/OrderDetailView/OrderDetailView.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaRupeeSign } from "react-icons/fa";
import {
  FiCheck,
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiCopy,
  FiClock,
  FiShoppingBag,
  FiArrowRight,
} from "react-icons/fi";
import OrderStatusTimeline from "../OrderStatusTimeline/OrderStatusTimeline";
import styles from "./OrderDetailView.module.css";

const PAYMENT_METHOD_LABEL = {
  razorpay: "Prepaid (Razorpay)",
  cod: "Cash on Delivery",
};

const PAYMENT_STATUS_LABEL = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
};

const CopyField = ({ value, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard not available
    }
  };

  return (
    <button
      type="button"
      className={styles.copyField}
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
    >
      <span className={styles.mono}>{value}</span>
      <FiCopy className={copied ? styles.copyIconOk : styles.copyIcon} />
      <span className={styles.copyFlag} data-visible={copied}>
        Copied
      </span>
    </button>
  );
};

const OrderDetailView = ({ order, justPlaced = false }) => {
  if (!order) return null;

  const {
    orderNumber,
    createdAt,
    items,
    shippingAddress,
    itemsTotal,
    shippingFee,
    totalAmount,
    paymentMethod,
    paymentStatus,
    razorpay,
    orderStatus,
    shipping,
  } = order;

  const totalUnits = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className={styles.page}>
      {justPlaced && (
        <div className={styles.successHeader}>
          <div className={styles.sealWrap}>
            <div className={styles.seal}>
              <span className={styles.sealMonogram}>A</span>
              <FiCheck className={styles.sealCheck} />
            </div>
            <div className={styles.sealRibbonL} />
            <div className={styles.sealRibbonR} />
          </div>
          <span className={styles.eyebrow}>Certificate of Purchase</span>
          <h1 className={styles.successTitle}>Your Order is Sealed</h1>
          <p className={styles.successSub}>
            Thank you for choosing Aurevian. A confirmation has been sent to
            your email, and every piece is now being prepared with care.
          </p>
        </div>
      )}

      <div className={styles.orderIdRow}>
        <div className={styles.orderIdMain}>
          <span className={styles.orderIdLabel}>Order No.</span>
          <span className={styles.orderId}>{orderNumber}</span>
        </div>
        <span className={styles.orderIdDivider} />
        <span className={styles.orderDate}>
          Placed{" "}
          {new Date(createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <div className={styles.stack}>
        {/* PRODUCTS — full width */}
        <section className={styles.card}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.cardTitle}>
              <FiShoppingBag /> The Pieces
            </h3>
            <span className={styles.itemCountPill}>
              {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
              {totalUnits} {totalUnits === 1 ? "unit" : "units"}
            </span>
          </div>
          <div className={styles.productList}>
            {items.map((item, idx) => {
              const unitPrice = item.quantity
                ? item.subtotal / item.quantity
                : item.subtotal;
              return (
                <div className={styles.productRow} key={idx}>
                  <div className={styles.productImgWrap}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.productImg}
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.productInfo}>
                    <span className={styles.productName}>{item.name}</span>
                    <div className={styles.productMeta}>
                      <span className={styles.qtyPill}>
                        Qty {item.quantity}
                      </span>
                      <span className={styles.unitPrice}>
                        <FaRupeeSign size={10} />
                        {unitPrice.toLocaleString("en-IN")} each
                      </span>
                    </div>
                  </div>
                  <div className={styles.productPriceCol}>
                    <span className={styles.priceLabel}>Subtotal</span>
                    <span className={styles.productPrice}>
                      <FaRupeeSign size={12} />
                      {item.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ADDRESS + PAYMENT — paired row */}
        <div className={styles.splitRow}>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiMapPin /> Delivery Address
            </h3>
            <div className={styles.addressBox}>
              <p className={styles.addressText}>
                <span className={styles.addressName}>
                  {shippingAddress.fullName}
                </span>
                <br />
                {shippingAddress.addressLine1}
                {shippingAddress.addressLine2
                  ? `, ${shippingAddress.addressLine2}`
                  : ""}
                <br />
                {shippingAddress.city}, {shippingAddress.state}{" "}
                {shippingAddress.pincode}
                <br />
                {shippingAddress.country || "India"}
              </p>
              <div className={styles.addressPhoneRow}>
                <span className={styles.addressPhoneLabel}>Phone</span>
                <span className={styles.addressPhone}>
                  {shippingAddress.phone}
                </span>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiCreditCard /> Payment
            </h3>
            <div className={styles.kvGrid}>
              <div className={styles.kvRow}>
                <span className={styles.kvLabel}>Payment Method</span>
                <span className={styles.kvValue}>
                  {PAYMENT_METHOD_LABEL[paymentMethod] || paymentMethod}
                </span>
              </div>
              <div className={styles.kvRow}>
                <span className={styles.kvLabel}>Payment Status</span>
                <span
                  className={`${styles.paymentBadge} ${
                    styles[paymentStatus] || ""
                  }`}
                >
                  {PAYMENT_STATUS_LABEL[paymentStatus] || paymentStatus}
                </span>
              </div>
              {razorpay?.paymentId && (
                <div className={styles.kvRow}>
                  <span className={styles.kvLabel}>Transaction ID</span>
                  <CopyField
                    value={razorpay.paymentId}
                    label="transaction ID"
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ORDER SUMMARY — full width */}
        <section className={`${styles.card} ${styles.summaryCard}`}>
          <h3 className={styles.cardTitle}>
            <FiPackage /> Order Summary
          </h3>
          <div className={styles.kvGrid}>
            <div className={styles.kvRow}>
              <span className={styles.kvLabel}>Items ({totalUnits})</span>
              <span className={styles.kvValue}>
                <FaRupeeSign size={11} />
                {itemsTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className={styles.kvRow}>
              <span className={styles.kvLabel}>Shipping</span>
              <span className={styles.kvValue}>
                {shippingFee === 0 ? (
                  <span className={styles.freeTag}>Complimentary</span>
                ) : (
                  <>
                    <FaRupeeSign size={11} />
                    {shippingFee.toLocaleString("en-IN")}
                  </>
                )}
              </span>
            </div>
          </div>
          <div className={styles.totalRow}>
            <span>Total Paid</span>
            <span>
              <FaRupeeSign size={16} />
              {totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
        </section>

        {/* SHIPPING / TRACKING — full width, bottom of page */}
        <section className={`${styles.card} ${styles.shippingCard}`}>
          <div className={styles.shippingTop}>
            <div className={styles.shippingHeader}>
              <div className={styles.shippingIconWrap}>
                <FiTruck />
              </div>
              <div>
                <h3 className={styles.shippingTitle}>Shipping</h3>
                <span className={styles.shippingSubtitle}>
                  {shipping?.awbCode ? "In progress" : "Preparing your order"}
                </span>
              </div>
            </div>

            {(shipping?.courierName || shipping?.awbCode) && (
              <div className={styles.shippingStats}>
                {shipping?.courierName && (
                  <div className={styles.shippingStat}>
                    <span className={styles.shippingStatLabel}>Courier</span>
                    <span className={styles.shippingStatValue}>
                      {shipping.courierName}
                    </span>
                  </div>
                )}
                {shipping?.awbCode && (
                  <div className={styles.shippingStat}>
                    <span className={styles.shippingStatLabel}>AWB Number</span>
                    <CopyField value={shipping.awbCode} label="AWB number" />
                  </div>
                )}
              </div>
            )}

            {!shipping?.awbCode && (
              <div className={styles.pendingNote}>
                <FiClock className={styles.pendingIcon} />
                <span>
                  Courier assignment is in progress. This updates automatically
                  once your shipment is picked up.
                </span>
              </div>
            )}
          </div>

          <div className={styles.timelineWrap}>
            <OrderStatusTimeline order={order} />
          </div>
        </section>

        <Link to="/orders" className={styles.allOrdersLink}>
          View all my orders <FiArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailView;
