// src/api/wishlistApi.js
import axiosInstance from "./axiosConfig.js";

export const getWishlist = async () => {
  const response = await axiosInstance.get("/wishlist");
  return response.data;
};

export const toggleWishlist = async (productId) => {
  const response = await axiosInstance.post("/wishlist/toggle", { productId });
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await axiosInstance.delete(`/wishlist/remove/${productId}`);
  return response.data;
};
