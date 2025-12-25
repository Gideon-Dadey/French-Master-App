import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

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

