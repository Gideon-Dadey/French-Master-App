import React from 'react';
import { View, StyleSheet } from 'react-native';

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

