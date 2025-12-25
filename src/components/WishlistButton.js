import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { spacing } from '../utils/responsive';

export default function WishlistButton({ courseId, style }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const inWishlist = isInWishlist(courseId);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      return;
    }

    if (inWishlist) {
      await removeFromWishlist(courseId);
    } else {
      await addToWishlist(courseId);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.button, style, inWishlist && styles.buttonActive]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      <Ionicons
        name={inWishlist ? 'heart' : 'heart-outline'}
        size={24}
        color={inWishlist ? '#E53935' : '#757575'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonActive: {
    backgroundColor: '#FFEBEE',
  },
});

