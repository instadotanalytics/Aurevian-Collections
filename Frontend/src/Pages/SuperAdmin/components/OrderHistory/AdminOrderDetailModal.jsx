// src/Pages/SuperAdmin/components/OrderHistory/AdminOrderDetailModal.jsx
import React, { useEffect, useState } from "react";
import { FaRupeeSign } from "react-icons/fa";
import {
  FiX,
  FiUser,
  FiMapPin,
  FiPackage,
  FiCreditCard,
  FiTruck,
} from "react-icons/fi";
import styles from "./OrderHistory.module.css";
import AdminOrderTimeline from "./AdminOrderTimeline.jsx";
import * as orderApi from "../../../../api/orderApi.js";

const AdminOrderDetailModal = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    orderApi
      .getOrderHistoryDetail(orderId)
      .then((res) => {
        if (!cancelled && res.success) setOrder(res.data);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose}>
          <FiX size={20} />
        </button>

        {loading && <p className={styles.loadingText}>Loading order...</p>}

        {!loading && order && (
          <>
            <div className={styles.detailHeader}>
              <h2>#{order.orderNumber}</h2>
              <span className={styles.detailDate}>
                {new Date(order.createdAt).toLocaleString("en-IN")}
              </span>
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailMain}>
                <section className={styles.detailCard}>
                  <h3>
                    <FiUser /> Customer
                  </h3>
                  <div className={styles.kvRow}>
                    <span>Name</span>
                    <span>{order.customerName || "—"}</span>
                  </div>
                  <div className={styles.kvRow}>
                    <span>Email</span>
                    <span>{order.customerEmail || "—"}</span>
                  </div>
                  <div className={styles.kvRow}>
                    <span>Phone</span>
                    <span>{order.customerPhone || "—"}</span>
                  </div>
                </section>

                <section className={styles.detailCard}>
                  <h3>
                    <FiMapPin /> Shipping Address
                  </h3>
                  {order.shippingAddress ? (
                    <p className={styles.addressText}>
                      {order.shippingAddress.fullName}
                      <br />
                      {order.shippingAddress.addressLine1}
                      {order.shippingAddress.addressLine2
                        ? `, ${order.shippingAddress.addressLine2}`
                        : ""}
                      <br />
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.pincode}
                      <br />
                      {order.shippingAddress.country || "India"}
                      <br />
                      Phone: {order.shippingAddress.phone}
                    </p>
                  ) : (
                    <p className={styles.emptyNote}>
                      No shipping address on record.
                    </p>
                  )}
                </section>

                <section className={styles.detailCard}>
                  <h3>
                    <FiPackage /> Products
                  </h3>
                  {order.items.map((item, idx) => (
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
                  <div className={styles.kvRow}>
                    <span>Seller</span>
                    <span>
                      {order.seller?.storeInfo?.storeName ||
                        order.seller?.fullName ||
                        "—"}
                    </span>
                  </div>
                </section>

                <section className={styles.detailCard}>
                  <h3>
                    <FiCreditCard /> Payment
                  </h3>
                  <div className={styles.kvRow}>
                    <span>Method</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className={styles.kvRow}>
                    <span>Status</span>
                    <span>{order.paymentStatus}</span>
                  </div>
                  {order.razorpay?.orderId && (
                    <div className={styles.kvRow}>
                      <span>Razorpay Order ID</span>
                      <span className={styles.mono}>
                        {order.razorpay.orderId}
                      </span>
                    </div>
                  )}
                  {order.razorpay?.paymentId && (
                    <div className={styles.kvRow}>
                      <span>Razorpay Payment ID</span>
                      <span className={styles.mono}>
                        {order.razorpay.paymentId}
                      </span>
                    </div>
                  )}
                  {order.placedAt && (
                    <div className={styles.kvRow}>
                      <span>Payment Date</span>
                      <span>
                        {new Date(order.placedAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className={styles.kvRow}>
                    <span>Items Total</span>
                    <span>
                      <FaRupeeSign size={11} />
                      {order.itemsTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className={styles.kvRow}>
                    <span>Shipping Fee</span>
                    <span>
                      <FaRupeeSign size={11} />
                      {order.shippingFee.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className={styles.kvRowTotal}>
                    <span>Total</span>
                    <span>
                      <FaRupeeSign size={13} />
                      {order.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </section>

                <section className={styles.detailCard}>
                  <h3>
                    <FiTruck /> Shiprocket
                  </h3>
                  {order.shipping?.provider && (
                    <div className={styles.kvRow}>
                      <span>Provider</span>
                      <span>{order.shipping.provider}</span>
                    </div>
                  )}
                  {order.shipping?.shiprocketOrderId ? (
                    <>
                      <div className={styles.kvRow}>
                        <span>Shiprocket Order ID</span>
                        <span className={styles.mono}>
                          {order.shipping.shiprocketOrderId}
                        </span>
                      </div>
                      {order.shipping.shipmentId && (
                        <div className={styles.kvRow}>
                          <span>Shipment ID</span>
                          <span className={styles.mono}>
                            {order.shipping.shipmentId}
                          </span>
                        </div>
                      )}
                      {order.shipping.awbCode && (
                        <div className={styles.kvRow}>
                          <span>AWB</span>
                          <span className={styles.mono}>
                            {order.shipping.awbCode}
                          </span>
                        </div>
                      )}
                      {order.shipping.courierName && (
                        <div className={styles.kvRow}>
                          <span>Courier</span>
                          <span>{order.shipping.courierName}</span>
                        </div>
                      )}
                      {order.shipping.status && (
                        <div className={styles.kvRow}>
                          <span>Shipment Status</span>
                          <span>{order.shipping.status}</span>
                        </div>
                      )}
                      {order.shipping.trackingUrl && (
                        <div className={styles.kvRow}>
                          <span>Tracking</span>
                          <a
                            href={order.shipping.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Track shipment →
                          </a>
                        </div>
                      )}
                      {order.shipping.pickupScheduledAt && (
                        <div className={styles.kvRow}>
                          <span>Pickup Scheduled</span>
                          <span>
                            {new Date(
                              order.shipping.pickupScheduledAt,
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                      {order.shipping.lastError && (
                        <div className={styles.kvRow}>
                          <span>Last Error</span>
                          <span className={styles.errorText}>
                            {order.shipping.lastError}
                          </span>
                        </div>
                      )}
                      {order.shipping.lastSyncedAt && (
                        <div className={styles.kvRow}>
                          <span>Last Synced</span>
                          <span>
                            {new Date(
                              order.shipping.lastSyncedAt,
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className={styles.emptyNote}>
                      No Shiprocket order created yet.
                    </p>
                  )}
                </section>
              </div>

              <div className={styles.detailSide}>
                <section className={styles.detailCard}>
                  <h3>Order Status</h3>
                  <div className={styles.kvRow}>
                    <span>Order Number</span>
                    <span className={styles.mono}>{order.orderNumber}</span>
                  </div>
                  <div className={styles.kvRow}>
                    <span>Order Status</span>
                    <span>{order.orderStatus}</span>
                  </div>
                  <div className={styles.kvRow}>
                    <span>Fulfillment Status</span>
                    <span>{order.fulfillmentStatus}</span>
                  </div>
                  <div className={styles.kvRow}>
                    <span>Created</span>
                    <span>
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className={styles.kvRow}>
                    <span>Updated</span>
                    <span>
                      {new Date(order.updatedAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                </section>

                <section className={styles.detailCard}>
                  <h3>Timeline</h3>
                  <AdminOrderTimeline order={order} />
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrderDetailModal;
