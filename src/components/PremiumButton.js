import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  premiumColors,
  premiumSpacing,
  premiumBorderRadius,
  premiumShadows,
  premiumTypography,
  buttonVariants,
} from '../utils/premiumDesign';

export default function PremiumButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  gradient,
  style,
  textStyle,
  ...props
}) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: {
      paddingVertical: premiumSpacing.sm,
      paddingHorizontal: premiumSpacing.base,
      fontSize: premiumTypography.sizes.sm,
    },
    md: {
      paddingVertical: premiumSpacing.md,
      paddingHorizontal: premiumSpacing.xl,
      fontSize: premiumTypography.sizes.base,
    },
    lg: {
      paddingVertical: premiumSpacing.lg,
      paddingHorizontal: premiumSpacing['2xl'],
      fontSize: premiumTypography.sizes.lg,
    },
  };

  const variantStyles = buttonVariants[variant] || buttonVariants.primary;

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'gradient' ? '#FFFFFF' : premiumColors.primary.main}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={sizeStyles[size].fontSize + 4}
              color={
                variant === 'primary' || variant === 'gradient'
                  ? '#FFFFFF'
                  : premiumColors.primary.main
              }
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeStyles[size].fontSize,
                fontWeight: premiumTypography.weights.semibold,
                color:
                  variant === 'primary' || variant === 'gradient'
                    ? '#FFFFFF'
                    : variant === 'outline'
                    ? premiumColors.primary.main
                    : premiumColors.neutral[900],
              },
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={sizeStyles[size].fontSize + 4}
              color={
                variant === 'primary' || variant === 'gradient'
                  ? '#FFFFFF'
                  : premiumColors.primary.main
              }
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </>
  );

  const buttonStyle = [
    styles.button,
    variantStyles,
    sizeStyles[size],
    isDisabled && styles.disabled,
    style,
  ];

  if (variant === 'gradient' || gradient) {
    const gradientColors = gradient || ['#6366F1', '#8B5CF6'];
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={isDisabled ? [premiumColors.neutral[400], premiumColors.neutral[500]] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[buttonStyle, styles.gradientButton]}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        buttonStyle,
        (variant === 'primary' || variant === 'secondary') && premiumShadows.md,
      ]}
      {...props}
    >
      {buttonContent}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: premiumBorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  gradientButton: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: premiumSpacing.sm,
  },
  iconRight: {
    marginLeft: premiumSpacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

