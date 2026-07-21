// src/Pages/Profile/tabs/WishlistTab.jsx

import React, { useState, useEffect } from 'react';
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from '../Profile.module.css';

const WishlistTab = ({ user }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/users/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWishlist(data.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`/api/users/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Removed from wishlist');
        setWishlist(wishlist.filter(item => item._id !== productId));
      }
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  if (loading) {
    return <div className={styles.loadingSpinner}></div>;
  }

  if (wishlist.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FiHeart size={48} />
        <h3>Wishlist is Empty</h3>
        <p>Start adding items you love to your wishlist!</p>
        <button className={styles.shopNowBtn}>Browse Products</button>
      </div>
    );
  }

  return (
    <div className={styles.wishlistTab}>
      <div className={styles.wishlistGrid}>
        {wishlist.map((item) => (
          <div key={item._id} className={styles.wishlistCard}>
            <div className={styles.wishlistImage}>
              <img src={item.images?.[0]} alt={item.name} />
              <button 
                className={styles.wishlistRemove}
                onClick={() => removeFromWishlist(item._id)}
              >
                <FiTrash2 size={16} />
              </button>
            </div>
            <div className={styles.wishlistInfo}>
              <h4>{item.name}</h4>
              <p className={styles.wishlistPrice}>${item.price}</p>
              <button className={styles.addToCartBtn}>
                <FiShoppingBag size={16} />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistTab;