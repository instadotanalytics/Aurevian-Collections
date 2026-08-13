// src/api/cartApi.js
import axiosInstance from "./axiosConfig.js";

export const getCart = async () => {
  const response = await axiosInstance.get("/cart");
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await axiosInstance.post("/cart/add", {
    productId,
    quantity,
  });
  return response.data;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await axiosInstance.patch("/cart/update", {
    productId,
    quantity,
  });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await axiosInstance.delete(`/cart/remove/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await axiosInstance.delete("/cart/clear");
  return response.data;
};

// ✅ ADDED: Missing calculateShippingRate function
export const calculateShippingRate = async (pincode, paymentMethod) => {
  const response = await axiosInstance.post("/shipping/calculate-rate", {
    pincode,
    paymentMethod,
  });
  return response.data;
};
