import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { premiumShadows, premiumBorderRadius, premiumSpacing } from '../utils/premiumDesign';

export default function PremiumCard({
  children,
  variant = 'default',
  gradient,
  onPress,
  style,
  disabled = false,
}) {
  const { colors } = useTheme();
  const cardStyle = [
    styles.card,
    { backgroundColor: colors.card, borderColor: colors.border },
    variant === 'gradient' && styles.gradientCard,
    style,
  ];

  const content = (
    <>
      {variant === 'gradient' && gradient ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, styles.gradientCard]}
        >
          {children}
        </LinearGradient>
      ) : (
        <View style={cardStyle}>{children}</View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={styles.container}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    // marginBottom removed - should be controlled by parent
  },
  card: {
    borderRadius: premiumBorderRadius.xl,
    padding: premiumSpacing.lg,
    borderWidth: 1,
    ...premiumShadows.md,
  },
  gradientCard: {
    overflow: 'hidden',
  },
});

