// frontend/src/redux/services/profileService.js

import axios from "../../api/axiosConfig";

const API = "/user-profile";

// Profile
const getProfile = () => axios.get(`${API}/me`);
const updateProfile = (data) => axios.put(`${API}`, data);

// Avatar
const uploadAvatar = (formData) =>
  axios.post(`${API}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
const deleteAvatar = () => axios.delete(`${API}/avatar`);

// Addresses
const addAddress = (data) => axios.post(`${API}/addresses`, data);
const updateAddress = (addressId, data) =>
  axios.put(`${API}/addresses/${addressId}`, data);
const deleteAddress = (addressId) =>
  axios.delete(`${API}/addresses/${addressId}`);

// Orders and Wishlist
const getOrders = () => axios.get(`${API}/orders`);
const getWishlist = () => axios.get(`${API}/wishlist`);
const removeWishlist = (productId) =>
  axios.delete(`${API}/wishlist/${productId}`);

// Preferences
const updatePreferences = (data) => axios.put(`${API}/preferences`, data);

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  addAddress,
  updateAddress,
  deleteAddress,
  getOrders,
  getWishlist,
  removeWishlist,
  updatePreferences,
};
