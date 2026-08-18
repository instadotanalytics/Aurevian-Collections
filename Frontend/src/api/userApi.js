// src/api/userApi.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Update the logged-in user's profile (name, email, phone).
 */
export const updateProfile = async (data) => {
  const res = await axios.put(`${API_BASE}/users/me`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

/**
 * Change the logged-in user's password.
 */
export const changePassword = async ({ currentPassword, newPassword }) => {
  const res = await axios.put(
    `${API_BASE}/users/me/password`,
    { currentPassword, newPassword },
    { headers: authHeaders() },
  );
  return res.data;
};

/**
 * Update communication preferences (order updates, restock alerts, marketing).
 */
export const updatePreferences = async (preferences) => {
  const res = await axios.put(
    `${API_BASE}/users/me/preferences`,
    preferences,
    { headers: authHeaders() },
  );
  return res.data;
};

/**
 * Permanently delete the logged-in user's account.
 */
export const deleteAccount = async () => {
  const res = await axios.delete(`${API_BASE}/users/me`, {
    headers: authHeaders(),
  });
  return res.data;
};