import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize } from '../utils/responsive';

export default function LearningStreak({ currentStreak = 0, longestStreak = 0, onPress }) {
  const { colors } = useTheme();
  const [animatedStreak] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.spring(animatedStreak, {
      toValue: currentStreak,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [currentStreak]);

  const streakWidth = animatedStreak.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const getStreakMessage = () => {
    if (currentStreak === 0) return "Start your learning streak today!";
    if (currentStreak < 7) return "Keep it up! You're building momentum!";
    if (currentStreak < 30) return "Amazing! You're on fire! 🔥";
    return "Incredible! You're a learning champion! 🏆";
  };

  const getStreakColor = () => {
    if (currentStreak >= 30) return ['#FFD700', '#FFA500'];
    if (currentStreak >= 7) return ['#FF6B6B', '#FF8E53'];
    return ['#4ECDC4', '#44A08D'];
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getStreakColor()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.streakIcon}>
          <Ionicons name="flame" size={32} color="#fff" />
        </View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
        {currentStreak > 0 && (
          <View style={styles.badge}>
            <Ionicons name="trophy" size={16} color="#FFD700" />
            <Text style={styles.badgeText}>Best: {longestStreak}</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.content}>
        <Text style={[styles.message, { color: colors.text }]}>
          {getStreakMessage()}
        </Text>
        
        <View style={[styles.progressContainer, { backgroundColor: colors.secondaryBackground }]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: streakWidth,
                backgroundColor: currentStreak >= 7 ? '#FF6B6B' : '#4ECDC4',
              },
            ]}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="calendar-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.statText, { color: colors.secondaryText }]}>
              {currentStreak} days active
            </Text>
          </View>
          {currentStreak > 0 && (
            <View style={styles.stat}>
              <Ionicons name="trending-up-outline" size={16} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.primary }]}>
                {currentStreak >= longestStreak ? 'New record!' : `${longestStreak - currentStreak} to beat record`}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: fontSize.heading,
    fontWeight: '800',
    color: '#fff',
    lineHeight: fontSize.heading,
  },
  streakLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
    gap: spacing.xs,
  },
  badgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
  },
  message: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  progressContainer: {
    height: 8,
    borderRadius: spacing.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});

