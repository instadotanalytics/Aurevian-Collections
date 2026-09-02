// src/api/returnApi.js
import axiosInstance from "./axiosConfig.js";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections-ng4w.onrender.com/api";

const sellerAuthHeader = () => {
  const token = localStorage.getItem("sellerAccessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================
// CUSTOMER-AUTHENTICATED ENDPOINTS
// ============================================
export const getOrderReturnEligibility = async (orderId) => {
  const response = await axiosInstance.get(`/returns/order/${orderId}`);
  return response.data;
};

export const createReturnRequest = async (formData) => {
  const response = await axiosInstance.post("/returns", formData);
  return response.data;
};

export const getMyReturnRequests = async () => {
  const response = await axiosInstance.get("/returns/my");
  return response.data;
};

export const cancelReturnRequest = async (id) => {
  const response = await axiosInstance.post(`/returns/${id}/cancel`);
  return response.data;
};

// ============================================
// SELLER-AUTHENTICATED ENDPOINTS
// ============================================
export const getSellerReturnRequests = async () => {
  const response = await axios.get(`${API_URL}/returns/seller/all`, {
    headers: sellerAuthHeader(),
  });
  return response.data;
};

export const sellerApproveReturn = async (id) => {
  const response = await axios.post(
    `${API_URL}/returns/${id}/seller-approve`,
    {},
    { headers: sellerAuthHeader() },
  );
  return response.data;
};

export const sellerRejectReturn = async (id, reason) => {
  const response = await axios.post(
    `${API_URL}/returns/${id}/seller-reject`,
    { reason },
    { headers: sellerAuthHeader() },
  );
  return response.data;
};

export const retryReturnShiprocketSync = async (id) => {
  const response = await axios.post(
    `${API_URL}/returns/${id}/retry-shiprocket-sync`,
    {},
    { headers: sellerAuthHeader() },
  );
  return response.data;
};

export const updateReturnStatus = async (id, status) => {
  const response = await axios.patch(
    `${API_URL}/returns/${id}/status`,
    { status },
    { headers: sellerAuthHeader() },
  );
  return response.data;
};
