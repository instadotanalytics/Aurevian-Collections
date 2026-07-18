// src/contexts/SellerAuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SellerAuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useSellerAuth = () => {
  const context = useContext(SellerAuthContext);
  if (!context) {
    throw new Error('useSellerAuth must be used within SellerAuthProvider');
  }
  return context;
};

export const SellerAuthProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load seller from localStorage on mount
  useEffect(() => {
    const loadSeller = async () => {
      try {
        const token = localStorage.getItem('sellerAccessToken');
        if (token) {
          const response = await axios.get(`${API_URL}/seller/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            setSeller(response.data.data);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error loading seller:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('sellerAccessToken');
          localStorage.removeItem('sellerRefreshToken');
        }
      } finally {
        setLoading(false);
      }
    };
    loadSeller();
  }, []);

  // Register Seller
  const register = async (sellerData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/seller/register`, sellerData);
      if (response.data.success) {
        const { data } = response.data;
        // Store email and phone for OTP verification
        localStorage.setItem('sellerEmail', sellerData.email);
        localStorage.setItem('sellerPhone', sellerData.phone);
        setSeller(data);
        setIsAuthenticated(false);
        toast.success('Registration successful! Please verify your email and phone.');
        return { success: true, data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Verify Email OTP
  const verifyEmailOTP = async (email, otp) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/seller/verify-email`, { email, otp });
      if (response.data.success) {
        toast.success('Email verified successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Verify Phone OTP
  const verifyPhoneOTP = async (phone, otp) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/seller/verify-phone`, { phone, otp });
      if (response.data.success) {
        toast.success('Phone verified successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async (contact, type) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/seller/resend-otp`, { contact, type });
      if (response.data.success) {
        toast.success(`OTP sent to ${type} successfully!`);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Login Seller
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/seller/login`, { email, password });
      if (response.data.success) {
        const { data, tokens } = response.data;
        localStorage.setItem('sellerAccessToken', tokens.accessToken);
        localStorage.setItem('sellerRefreshToken', tokens.refreshToken);
        setSeller(data);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return { success: true, data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      const status = error.response?.data?.status;
      setError(message);
      toast.error(message);
      return { success: false, error: message, status };
    } finally {
      setLoading(false);
    }
  };

  // Logout Seller
  const logout = async () => {
    try {
      const token = localStorage.getItem('sellerAccessToken');
      if (token) {
        await axios.post(`${API_URL}/seller/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('sellerAccessToken');
      localStorage.removeItem('sellerRefreshToken');
      setSeller(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    seller,
    isAuthenticated,
    loading,
    error,
    register,
    verifyEmailOTP,
    verifyPhoneOTP,
    resendOTP,
    login,
    logout,
  };

  return (
    <SellerAuthContext.Provider value={value}>
      {children}
    </SellerAuthContext.Provider>
  );
};

export default SellerAuthContext;