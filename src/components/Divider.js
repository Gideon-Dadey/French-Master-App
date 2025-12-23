import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Divider component
 * Adapted from HEYY app
 * 
 * @param {string} orientation - 'vertical' or 'horizontal'
 * @param {number} stroke - Thickness of the divider (default: 1)
 */
export default function Divider({ orientation = 'horizontal', stroke = 1 }) {
  const { colors } = useTheme();

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.vertical,
          {
            width: stroke,
            backgroundColor: colors.border,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          height: stroke,
          backgroundColor: colors.border,
        },
      ]}
    />
  );
}

/**
 * List divider component with default styling
 */
export function ListDivider() {
  return <Divider orientation="horizontal" stroke={0.8} />;
}

const styles = StyleSheet.create({
  vertical: {
    alignSelf: 'stretch',
  },
  horizontal: {
    alignSelf: 'stretch',
  },
});

