// src/api/orderApi.js
import axiosInstance from "./axiosConfig.js";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

const sellerAuthHeader = () => {
  const token = localStorage.getItem("sellerAccessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createRazorpayOrder = async (items, shippingAddress) => {
  const response = await axiosInstance.post("/orders/razorpay/create", {
    items,
    shippingAddress,
  });
  return response.data;
};

export const verifyRazorpayPayment = async (payload) => {
  const response = await axiosInstance.post("/orders/razorpay/verify", payload);
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
// Use plain axios + sellerAccessToken (NOT the customer axiosInstance,
// which sends the customer token and triggers /api/auth/refresh).
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
