
// src/Components/OrderDetailView/OrderDetailView.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaRupeeSign } from "react-icons/fa";
import {
  FiCheckCircle,
  FiPackage,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiCopy,
  FiCheck,
  FiClock,
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
      {copied ? (
        <FiCheck className={styles.copyIconOk} />
      ) : (
        <FiCopy className={styles.copyIcon} />
      )}
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
          <div className={styles.seal}>
            <FiCheckCircle />
          </div>
          <span className={styles.eyebrow}>Confirmation</span>
          <h1 className={styles.successTitle}>Order Placed!</h1>
          <p className={styles.successSub}>
            Thank you for your purchase. A confirmation has been sent to your
            email.
          </p>
        </div>
      )}

      <div className={styles.orderIdRow}>
        <span className={styles.orderIdLabel}>Order ID</span>
        <span className={styles.orderId}>#{orderNumber}</span>
        <span className={styles.orderDate}>
          {new Date(createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          {/* PRODUCTS */}
          <section className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <h3 className={styles.cardTitle}>
                <FiPackage /> Products
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
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.productImg}
                      loading="lazy"
                    />
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

          {/* DELIVERY ADDRESS */}
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

          {/* PAYMENT */}
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

          {/* ORDER SUMMARY */}
          <section className={`${styles.card} ${styles.summaryCard}`}>
            <h3 className={styles.cardTitle}>Order Summary</h3>
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
                    <span className={styles.freeTag}>Free</span>
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
              <span>Total</span>
              <span>
                <FaRupeeSign size={14} />
                {totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </section>
        </div>

        <div className={styles.sideCol}>
          {/* SHIPPING / TRACKING — fills full column height */}
          <section className={`${styles.card} ${styles.shippingCard}`}>
            <div className={styles.shippingHeader}>
              <div className={styles.shippingIconWrap}>
                <FiTruck />
              </div>
              <div>
                <h3 className={styles.shippingTitle}>Shipping</h3>
                <span className={styles.shippingSubtitle}>
                  {shipping?.awbCode
                    ? "In progress"
                    : "Preparing your order"}
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
                  Courier assignment is in progress. This section updates
                  automatically once your shipment is picked up.
                </span>
              </div>
            )}

            <div className={styles.timelineWrap}>
              <OrderStatusTimeline order={order} />
            </div>
          </section>

          <Link to="/orders" className={styles.allOrdersLink}>
            View all my orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailView;