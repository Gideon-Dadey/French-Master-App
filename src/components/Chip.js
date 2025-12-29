import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Chip({
  title,
  variant = 'default',
  leading,
  trailing,
  onPress,
  style
}) {
  const { organicColors: theme } = useTheme();

  const { color, backgroundColor } = useMemo(() => {
    if (variant === 'primary') {
      return {
        color: theme.surface,
        backgroundColor: theme.primary,
      };
    }
    return {
      color: theme.text,
      backgroundColor: theme.borderLight || theme.border,
    };
  }, [variant, theme]);

  const ChipContent = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor,
        },
        style,
      ]}
    >
      {leading && <View style={styles.leading}>{leading}</View>}
      <Text
        style={[
          styles.title,
          { color: color },
        ]}
      >
        {title}
      </Text>
      {trailing && <View style={styles.trailing}>{trailing}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
      >
        {ChipContent}
      </TouchableOpacity>
    );
  }

  return ChipContent;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 36,
    borderRadius: 18,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  leading: {
    marginRight: -4,
  },
  trailing: {
    marginLeft: -4,
  },
});

