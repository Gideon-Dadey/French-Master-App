import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { premiumColors, premiumSpacing, premiumBorderRadius } from '../utils/premiumDesign';

export default function PremiumProgressBar({
  progress = 0,
  height = 8,
  showLabel = true,
  label,
  variant = 'primary',
  animated = true,
}) {
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.spring(animatedWidth, {
        toValue: progress,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      animatedWidth.setValue(progress);
    }
  }, [progress, animated]);

  const gradientColors = {
    primary: ['#6366F1', '#8B5CF6'],
    success: ['#10B981', '#059669'],
    warning: ['#F59E0B', '#D97706'],
    danger: ['#EF4444', '#DC2626'],
  };

  const colors = gradientColors[variant] || gradientColors.primary;

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label || `${Math.round(progress)}%`}</Text>
          {progress < 100 && <Text style={styles.percentage}>{Math.round(progress)}%</Text>}
        </View>
      )}
      <View style={[styles.progressContainer, { height }]}>
        <View style={[styles.progressTrack, { height }]} />
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: widthInterpolated,
              height,
            },
          ]}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { height }]}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: premiumSpacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: premiumColors.neutral[700],
  },
  percentage: {
    fontSize: 12,
    fontWeight: '500',
    color: premiumColors.neutral[500],
  },
  progressContainer: {
    width: '100%',
    backgroundColor: premiumColors.neutral[200],
    borderRadius: premiumBorderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  progressTrack: {
    position: 'absolute',
    width: '100%',
    backgroundColor: premiumColors.neutral[200],
    borderRadius: premiumBorderRadius.full,
  },
  progressFill: {
    borderRadius: premiumBorderRadius.full,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
});

