import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function SkeletonLoader({ width, height, style, borderRadius = 8 }) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width || '100%',
          height: height || 20,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CourseCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <SkeletonLoader width="100%" height={180} borderRadius={12} />
      <View style={styles.cardContent}>
        <SkeletonLoader width="80%" height={20} style={styles.titleSkeleton} />
        <SkeletonLoader width="60%" height={16} style={styles.subtitleSkeleton} />
        <View style={styles.metaRow}>
          <SkeletonLoader width={60} height={16} />
          <SkeletonLoader width={80} height={16} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  cardSkeleton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 12,
  },
  titleSkeleton: {
    marginBottom: 8,
  },
  subtitleSkeleton: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
});

