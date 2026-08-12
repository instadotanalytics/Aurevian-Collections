// src/Pages/Seller/SellerDashboard/components/Orders.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaRupeeSign } from "react-icons/fa";
import { FiTruck } from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./Orders.module.css";
import {
  fetchSellerOrders,
  updateSellerOrder,
} from "../../../../redux/slices/orderSlice";

const STATUS_OPTIONS = [
  "placed",
  "processing",
  "ready_to_ship",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const Orders = () => {
  const dispatch = useDispatch();
  const { sellerOrders, isLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchSellerOrders());
  }, [dispatch]);

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updateSellerOrder({ id, status })).unwrap();
      toast.success("Order status updated");
    } catch (err) {
      toast.error(err || "Failed to update status");
    }
  };

  return (
    <div className={styles.ordersWrap}>
      <h2 className={styles.title}>Orders</h2>

      {isLoading && <p className={styles.loadingText}>Loading orders...</p>}

      {!isLoading && sellerOrders.length === 0 && (
        <p className={styles.emptyText}>No orders yet.</p>
      )}

      <div className={styles.table}>
        {sellerOrders.map((order) => (
          <div className={styles.orderRow} key={order._id}>
            <div className={styles.orderMain}>
              <div>
                <p className={styles.orderNumber}>#{order.orderNumber}</p>
                <p className={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className={styles.customerInfo}>
                <p className={styles.customerName}>
                  {order.customer?.fullName}
                </p>
                <p className={styles.customerPhone}>{order.customer?.phone}</p>
                <p className={styles.customerAddress}>
                  {order.customer?.addressLine1}, {order.customer?.city},{" "}
                  {order.customer?.state} - {order.customer?.pincode}
                </p>
              </div>
            </div>

            <div className={styles.items}>
              {order.items.map((item, idx) => (
                <div className={styles.itemRow} key={idx}>
                  <img src={item.image} alt={item.name} />
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemQty}>x{item.quantity}</span>
                  <span className={styles.itemPrice}>
                    <FaRupeeSign size={11} />
                    {item.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* ✅ NEW: shipping info — this data was already coming back
                from GET /api/orders/seller/all (order.shipping in the
                controller response), it just wasn't rendered anywhere. */}
            {order.shipping &&
              (order.shipping.courierName ||
                order.shipping.awbCode ||
                order.shipping.status) && (
                <div className={styles.shippingInfo}>
                  <FiTruck size={13} />
                  <span>
                    {order.shipping.courierName || "Courier not yet assigned"}
                    {order.shipping.awbCode
                      ? ` · AWB ${order.shipping.awbCode}`
                      : ""}
                    {order.shipping.status ? ` · ${order.shipping.status}` : ""}
                  </span>
                </div>
              )}

            <div className={styles.orderFooter}>
              <span className={styles.subtotal}>
                Your Earnings: <FaRupeeSign size={12} />
                {order.sellerSubtotal.toLocaleString("en-IN")}
              </span>
              <span
                className={`${styles.payStatus} ${styles[order.paymentStatus]}`}
              >
                {order.paymentStatus}
              </span>
              <select
                className={styles.statusSelect}
                value={order.orderStatus}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
