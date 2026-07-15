import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SuperAdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.superAdmin);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/super-admin/login" replace />;
  }

  // Check if user is super admin
  if (user?.role !== "super_admin" && !user?.isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default SuperAdminRoute;