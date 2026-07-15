/**
 * Navbar Wrapper Component
 * Wraps the Header with necessary props from Redux
 */

import React from "react";
import { useSelector } from "react-redux";
import Header from "./Header.jsx";

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // You can get cart and wishlist counts from your cart/wishlist slices
  const cartCount = 0; // Replace with actual cart count
  const wishlistCount = 0; // Replace with actual wishlist count

  return (
    <Header
      user={user}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      logoHref="/"
    />
  );
};

export default Navbar;