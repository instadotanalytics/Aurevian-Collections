// src/api/orderApi.js
import axiosInstance from "./axiosConfig.js";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections-ng4w.onrender.com/api";

const sellerAuthHeader = () => {
  const token = localStorage.getItem("sellerAccessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const adminAuthHeader = () => {
  const token =
    localStorage.getItem("superAdminToken") ||
    localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createRazorpayOrder = async (
  items,
  shippingAddress,
  clientRequestId,
) => {
  const response = await axiosInstance.post("/orders/razorpay/create", {
    items,
    shippingAddress,
    clientRequestId,
  });
  return response.data;
};

export const verifyRazorpayPayment = async (payload) => {
  const response = await axiosInstance.post("/orders/razorpay/verify", payload);
  return response.data;
};

// ✅ NEW — Cash on Delivery order creation.
export const createCODOrder = async (
  items,
  shippingAddress,
  clientRequestId,
) => {
  const response = await axiosInstance.post("/orders/cod/create", {
    items,
    shippingAddress,
    clientRequestId,
  });
  return response.data;
};

export const getMyOrders = async () => {
  const response = await axiosInstance.get("/orders/my");
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await axiosInstance.get(`/orders/${id}`);
  return response.data;
};

// ============================================
// SELLER-AUTHENTICATED ENDPOINTS
// ============================================
export const getSellerOrders = async () => {
  const response = await axios.get(`${API_URL}/orders/seller/all`, {
    headers: sellerAuthHeader(),
  });
  return response.data;
};

export const updateSellerOrderStatus = async (id, status) => {
  const response = await axios.patch(
    `${API_URL}/orders/seller/${id}/status`,
    { status },
    { headers: sellerAuthHeader() },
  );
  return response.data;
};

export const sellerConfirmOrder = async (orderId) => {
  const response = await axios.post(
    `${API_URL}/orders/${orderId}/seller-confirm`,
    {},
    { headers: sellerAuthHeader() },
  );
  return response.data;
};

export const sellerRejectOrder = async (orderId, reason) => {
  const response = await axios.post(
    `${API_URL}/orders/${orderId}/seller-reject`,
    { reason },
    { headers: sellerAuthHeader() },
  );
  return response.data;
};

// ============================================
// SUPER ADMIN-AUTHENTICATED ENDPOINTS
// ============================================
export const getAdminOrders = async (fulfillmentStatus) => {
  const response = await axios.get(`${API_URL}/orders/admin/all`, {
    params: fulfillmentStatus ? { fulfillmentStatus } : {},
    headers: adminAuthHeader(),
  });
  return response.data;
};

export const adminApproveOrder = async (orderId) => {
  const response = await axios.post(
    `${API_URL}/orders/${orderId}/admin-approve`,
    {},
    { headers: adminAuthHeader() },
  );
  return response.data;
};

export const adminRejectOrder = async (orderId, reason) => {
  const response = await axios.post(
    `${API_URL}/orders/${orderId}/admin-reject`,
    { reason },
    { headers: adminAuthHeader() },
  );
  return response.data;
};

export const getOrderHistory = async (params = {}) => {
  const response = await axios.get(`${API_URL}/orders/admin/history`, {
    params,
    headers: adminAuthHeader(),
  });
  return response.data;
};

export const getOrderHistoryDetail = async (orderId) => {
  const response = await axios.get(
    `${API_URL}/orders/admin/history/${orderId}`,
    { headers: adminAuthHeader() },
  );
  return response.data;
};

// ✅ NEW — Retry Shiprocket synchronization for an order
export const retryOrderShiprocketSync = async (orderId) => {
  const response = await axios.post(
    `${API_URL}/orders/${orderId}/retry-shiprocket-sync`,
    {},
    { headers: adminAuthHeader() },
  );
  return response.data;
};
