// src/Components/common/SellerRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SellerRoute = ({ children }) => {
  const { isAuthenticated, isLoading, seller } = useSelector((state) => state.seller);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/seller/login" replace />;
  }

  // Check seller status
  if (seller?.status === 'pending') {
    return <Navigate to="/seller/verify-otp" replace />;
  }

  if (seller?.status === 'rejected') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-6 text-center">
        <div className="max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Account Rejected</h1>
          <p className="text-gray-600 mb-6">
            {seller.statusReason || 'Your seller account has been rejected. Please contact support for more information.'}
          </p>
          <button
            onClick={() => window.location.href = '/seller/login'}
            className="px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (seller?.status === 'suspended') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-6 text-center">
        <div className="max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-yellow-600 mb-4">Account Suspended</h1>
          <p className="text-gray-600 mb-6">
            {seller.suspendedReason || 'Your seller account has been suspended. Please contact support for more information.'}
          </p>
          <button
            onClick={() => window.location.href = '/seller/login'}
            className="px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Only approved sellers can access
  if (seller?.status !== 'approved') {
    return <Navigate to="/seller/login" replace />;
  }

  return children;
};

export default SellerRoute;