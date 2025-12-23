import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize } from '../utils/responsive';

const ACHIEVEMENTS = {
  first_course: {
    icon: 'trophy',
    title: 'First Steps',
    description: 'Enrolled in your first course',
    color: ['#FFD700', '#FFA500'],
  },
  week_streak: {
    icon: 'flame',
    title: 'Week Warrior',
    description: '7-day learning streak',
    color: ['#FF6B6B', '#FF8E53'],
  },
  month_streak: {
    icon: 'flame',
    title: 'Monthly Master',
    description: '30-day learning streak',
    color: ['#FFD700', '#FFA500'],
  },
  course_complete: {
    icon: 'checkmark-circle',
    title: 'Course Conqueror',
    description: 'Completed your first course',
    color: ['#4ECDC4', '#44A08D'],
  },
  perfect_quiz: {
    icon: 'star',
    title: 'Perfect Score',
    description: 'Got 100% on a quiz',
    color: ['#9B59B6', '#8E44AD'],
  },
  social_butterfly: {
    icon: 'people',
    title: 'Social Learner',
    description: 'Posted 10 comments',
    color: ['#3498DB', '#2980B9'],
  },
};

export default function AchievementBadge({ achievementId, unlocked = false, onPress }) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(unlocked ? 1 : 0.8)).current;
  const opacityAnim = useRef(new Animated.Value(unlocked ? 1 : 0.5)).current;

  const achievement = ACHIEVEMENTS[achievementId] || ACHIEVEMENTS.first_course;

  useEffect(() => {
    if (unlocked) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [unlocked]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.badge,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {unlocked ? (
          <LinearGradient
            colors={achievement.color}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Ionicons name={achievement.icon} size={32} color="#fff" />
          </LinearGradient>
        ) : (
          <View style={[styles.locked, { backgroundColor: colors.secondaryBackground }]}>
            <Ionicons name="lock-closed" size={24} color={colors.secondaryText} />
          </View>
        )}
      </Animated.View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {achievement.title}
      </Text>
      <Text style={[styles.description, { color: colors.secondaryText }]} numberOfLines={2}>
        {achievement.description}
      </Text>
      {unlocked && (
        <View style={[styles.unlockedBadge, { backgroundColor: achievement.color[0] }]}>
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    alignItems: 'center',
    margin: spacing.sm,
    position: 'relative',
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locked: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

