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
  const { colors } = useTheme();

  const { color, backgroundColor } = useMemo(() => {
    if (variant === 'primary') {
      return {
        color: '#FFFFFF',
        backgroundColor: colors.primary,
      };
    }
    return {
      color: colors.text,
      backgroundColor: colors.tertiaryBackground || colors.border,
    };
  }, [variant, colors]);

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

