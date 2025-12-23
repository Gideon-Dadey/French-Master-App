import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { premiumColors, premiumSpacing, premiumBorderRadius } from '../utils/premiumDesign';

export default function PremiumBadge({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
}) {
  const variantStyles = {
    primary: {
      backgroundColor: premiumColors.primary.main,
      color: '#FFFFFF',
    },
    success: {
      backgroundColor: premiumColors.success,
      color: '#FFFFFF',
    },
    warning: {
      backgroundColor: premiumColors.warning,
      color: '#FFFFFF',
    },
    danger: {
      backgroundColor: premiumColors.error,
      color: '#FFFFFF',
    },
    info: {
      backgroundColor: premiumColors.info,
      color: '#FFFFFF',
    },
    gold: {
      backgroundColor: premiumColors.accent.gold,
      color: '#FFFFFF',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: premiumColors.primary.main,
      color: premiumColors.primary.main,
    },
  };

  const sizeStyles = {
    sm: {
      paddingVertical: premiumSpacing.xs,
      paddingHorizontal: premiumSpacing.sm,
      fontSize: 11,
      iconSize: 12,
    },
    md: {
      paddingVertical: premiumSpacing.xs,
      paddingHorizontal: premiumSpacing.md,
      fontSize: 12,
      iconSize: 14,
    },
    lg: {
      paddingVertical: premiumSpacing.sm,
      paddingHorizontal: premiumSpacing.base,
      fontSize: 14,
      iconSize: 16,
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <View
      style={[
        styles.badge,
        currentVariant,
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderRadius: premiumBorderRadius.full,
        },
      ]}
    >
      {icon && iconPosition === 'left' && (
        <Ionicons
          name={icon}
          size={currentSize.iconSize}
          color={currentVariant.color}
          style={styles.iconLeft}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            fontSize: currentSize.fontSize,
            color: currentVariant.color,
            fontWeight: '600',
          },
        ]}
      >
        {label || ''}
      </Text>
      {icon && iconPosition === 'right' && (
        <Ionicons
          name={icon}
          size={currentSize.iconSize}
          color={currentVariant.color}
          style={styles.iconRight}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: premiumSpacing.xs,
  },
  iconRight: {
    marginLeft: premiumSpacing.xs,
  },
});

