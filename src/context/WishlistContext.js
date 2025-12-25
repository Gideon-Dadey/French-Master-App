import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {

      setWishlist([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await wishlistAPI.getAll();
      setWishlist(response.data.data?.courses || response.data.data || []);
    } catch (error) {

      if (error.response?.status === 401) {
        setWishlist([]);
        return;
      }

      console.error('Failed to load wishlist:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (courseId) => {
    try {
      const response = await wishlistAPI.add(courseId);
      await loadWishlist();
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to wishlist'
      };
    }
  };

  const removeFromWishlist = async (courseId) => {
    try {
      await wishlistAPI.remove(courseId);
      await loadWishlist();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from wishlist'
      };
    }
  };

  const isInWishlist = (courseId) => {
    return wishlist.some(item =>
      (item.course?._id || item.course) === courseId || item._id === courseId
    );
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loadWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

