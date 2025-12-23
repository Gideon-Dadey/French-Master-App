import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Spacer component for consistent spacing
 * Adapted from HEYY app
 * 
 * @param {string} orientation - 'vertical' or 'horizontal'
 * @param {number} spacing - Size of the spacer in pixels
 */
export default function Spacer({ orientation = 'vertical', spacing = 8 }) {
  if (orientation === 'vertical') {
    return <View style={[styles.vertical, { height: spacing }]} />;
  }
  return <View style={[styles.horizontal, { width: spacing }]} />;
}

const styles = StyleSheet.create({
  vertical: {
    width: '100%',
  },
  horizontal: {
    height: '100%',
  },
});

