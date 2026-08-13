// src/Components/OrderDetailView/OrderDetailView.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaRupeeSign } from "react-icons/fa";
import {
  FiCheckCircle,
  FiPackage,
  FiMapPin,
  FiCreditCard,
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

// order comes straight from GET /api/orders/:id — matches the Order model
// exactly, no reshaping needed since the backend already returns everything.
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

  return (
    <div className={styles.page}>
      {justPlaced && (
        <div className={styles.successHeader}>
          <FiCheckCircle className={styles.successIcon} />
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
            <h3 className={styles.cardTitle}>
              <FiPackage /> Products
            </h3>
            {items.map((item, idx) => (
              <div className={styles.productRow} key={idx}>
                <img src={item.image} alt={item.name} />
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{item.name}</span>
                  <span className={styles.productQty}>
                    Qty: {item.quantity}
                  </span>
                </div>
                <span className={styles.productPrice}>
                  <FaRupeeSign size={11} />
                  {item.subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </section>

          {/* DELIVERY ADDRESS */}
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiMapPin /> Delivery Address
            </h3>
            <p className={styles.addressText}>
              {shippingAddress.fullName}
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
              <br />
              Phone: {shippingAddress.phone}
            </p>
          </section>

          {/* PAYMENT */}
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiCreditCard /> Payment
            </h3>
            <div className={styles.kvRow}>
              <span>Payment Method</span>
              <span>
                {PAYMENT_METHOD_LABEL[paymentMethod] || paymentMethod}
              </span>
            </div>
            <div className={styles.kvRow}>
              <span>Payment Status</span>
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
                <span>Transaction ID</span>
                <span className={styles.mono}>{razorpay.paymentId}</span>
              </div>
            )}
          </section>

          {/* ORDER SUMMARY */}
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Order Summary</h3>
            <div className={styles.kvRow}>
              <span>Items</span>
              <span>
                <FaRupeeSign size={11} />
                {itemsTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className={styles.kvRow}>
              <span>Shipping</span>
              <span>
                {shippingFee === 0 ? (
                  "Free"
                ) : (
                  <>
                    <FaRupeeSign size={11} />
                    {shippingFee.toLocaleString("en-IN")}
                  </>
                )}
              </span>
            </div>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span>
                <FaRupeeSign size={13} />
                {totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </section>
        </div>

        <div className={styles.sideCol}>
          {/* SHIPPING / TRACKING */}
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Shipping</h3>

            {shipping?.courierName && (
              <div className={styles.kvRow}>
                <span>Courier</span>
                <span>{shipping.courierName}</span>
              </div>
            )}
            {shipping?.awbCode && (
              <div className={styles.kvRow}>
                <span>AWB</span>
                <span className={styles.mono}>{shipping.awbCode}</span>
              </div>
            )}
            {!shipping?.awbCode && (
              <p className={styles.pendingNote}>
                Courier assignment is in progress. This section updates
                automatically once your shipment is picked up.
              </p>
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
