/**
 * User Dashboard
 * For authenticated customers - shows orders, wishlist, profile
 */

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { 
  FiUser, 
  FiShoppingBag, 
  FiHeart, 
  FiSettings,
  FiClock,
  FiPackage,
  FiTruck,
  FiDollarSign,
  FiArrowRight,
  FiCalendar,
  FiMapPin,
  FiMail,
  FiPhone,
  FiEdit2
} from "react-icons/fi";
import { fetchCurrentUser } from "../redux/slices/authSlice.js";

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  // Mock data - Replace with real API data
  const stats = [
    { icon: FiShoppingBag, label: "Total Orders", value: "12", change: "+2 this month" },
    { icon: FiHeart, label: "Wishlist", value: "8", change: "4 new items" },
    { icon: FiClock, label: "Pending Orders", value: "3", change: "2 in transit" },
    { icon: FiDollarSign, label: "Total Spent", value: "CHF 2,450", change: "This month: CHF 450" },
  ];

  const recentOrders = [
    { id: "#ORD-001", date: "2024-01-15", items: 3, total: "CHF 450", status: "Delivered" },
    { id: "#ORD-002", date: "2024-01-12", items: 2, total: "CHF 280", status: "Processing" },
    { id: "#ORD-003", date: "2024-01-10", items: 1, total: "CHF 120", status: "Shipped" },
  ];

  const quickActions = [
    { icon: FiShoppingBag, label: "Shop Now", path: "/shop" },
    { icon: FiHeart, label: "Wishlist", path: "/wishlist" },
    { icon: FiPackage, label: "My Orders", path: "/orders" },
    { icon: FiUser, label: "Profile", path: "/profile" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="User" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold">{user?.firstName?.[0] || "U"}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome, {user?.firstName || "User"}! 👋</h1>
                <p className="text-blue-100">{user?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                  {user?.isVerified ? "✅ Verified" : "⏳ Pending"}
                </span>
              </div>
            </div>
            <Link to="/profile" className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:shadow-lg transition">
              <FiEdit2 className="inline mr-2" /> Edit Profile
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <stat.icon className="text-2xl text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xs text-green-500">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.path} className="bg-white p-4 rounded-xl shadow-sm text-center hover:shadow-md transition">
              <action.icon className="text-2xl text-blue-500 mx-auto mb-2" />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm">Date</th>
                  <th className="px-6 py-3 text-left text-sm">Items</th>
                  <th className="px-6 py-3 text-left text-sm">Total</th>
                  <th className="px-6 py-3 text-left text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-6 py-4 text-sm font-medium">{order.id}</td>
                    <td className="px-6 py-4 text-sm">{order.date}</td>
                    <td className="px-6 py-4 text-sm">{order.items} items</td>
                    <td className="px-6 py-4 text-sm font-medium">{order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "Delivered" ? "bg-green-100 text-green-700" :
                        order.status === "Processing" ? "bg-blue-100 text-blue-700" :
                        "bg-purple-100 text-purple-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;