// src/api/paymentSettingsApi.js
import axiosInstance from "./axiosConfig.js";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections-ng4w.onrender.com/api";

const adminAuthHeader = () => {
  const token =
    localStorage.getItem("superAdminToken") ||
    localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Public — used by the storefront checkout page to decide whether to show COD.
export const getPaymentSettings = async () => {
  const response = await axiosInstance.get("/payment-settings");
  return response.data;
};

// Admin only.
export const updatePaymentSettings = async (payload) => {
  const response = await axios.patch(`${API_URL}/payment-settings`, payload, {
    headers: adminAuthHeader(),
  });
  return response.data;
};
