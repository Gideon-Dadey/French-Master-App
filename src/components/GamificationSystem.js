import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PremiumBadge from './PremiumBadge';
import { premiumColors, premiumSpacing, premiumBorderRadius, premiumTypography } from '../utils/premiumDesign';

/**
 * Gamification System Component
 * Tracks and displays user achievements, XP, streaks, and levels
 */
export default function GamificationSystem({ userStats, onAchievementUnlocked }) {
  const [animatedXP, setAnimatedXP] = useState(userStats?.xp || 0);
  const xpAnimation = React.useRef(new Animated.Value(userStats?.xp || 0)).current;

  useEffect(() => {
    if (userStats?.xp !== undefined) {
      Animated.spring(xpAnimation, {
        toValue: userStats.xp,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [userStats?.xp]);

  const currentLevel = calculateLevel(userStats?.xp || 0);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpProgress = ((animatedXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return (
    <View style={styles.container}>
      {/* Level and XP Display */}
      <View style={styles.levelContainer}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.levelBadge}
        >
          <Text style={styles.levelNumber}>{currentLevel}</Text>
          <Text style={styles.levelLabel}>LEVEL</Text>
        </LinearGradient>

        <View style={styles.xpContainer}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>Experience Points</Text>
            <Text style={styles.xpValue}>{Math.floor(animatedXP)} XP</Text>
          </View>
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBarBackground}>
              <Animated.View
                style={[
                  styles.xpBarFill,
                  {
                    width: xpAnimation.interpolate({
                      inputRange: [xpForCurrentLevel, xpForNextLevel],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.xpBarGradient}
                />
              </Animated.View>
            </View>
            <Text style={styles.xpNextLevel}>
              {xpForNextLevel - Math.floor(animatedXP)} XP to Level {currentLevel + 1}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatItem
          icon="flame"
          label="Streak"
          value={`${userStats?.streak || 0} days`}
          color={premiumColors.accent.gold}
        />
        <StatItem
          icon="trophy"
          label="Achievements"
          value={`${userStats?.achievements?.length || 0}`}
          color={premiumColors.accent.gold}
        />
        <StatItem
          icon="star"
          label="Points"
          value={`${userStats?.points || 0}`}
          color={premiumColors.accent.sky}
        />
        <StatItem
          icon="medal"
          label="Rank"
          value={getRank(currentLevel)}
          color={premiumColors.primary.main}
        />
      </View>

      {/* Recent Achievements */}
      {userStats?.recentAchievements && userStats.recentAchievements.length > 0 && (
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementsList}>
            {userStats.recentAchievements.slice(0, 3).map((achievement, index) => (
              <AchievementBadge key={index} achievement={achievement} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function StatItem({ icon, label, value, color }) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AchievementBadge({ achievement }) {
  return (
    <View style={styles.achievementBadge}>
      <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
        <Ionicons name={achievement.icon} size={20} color={achievement.color} />
      </View>
      <Text style={styles.achievementName}>{achievement.name}</Text>
    </View>
  );
}

// Helper functions
function calculateLevel(xp) {
  // Exponential leveling: level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function getXPForLevel(level) {
  // XP needed = 100 * (level - 1)^2
  return 100 * Math.pow(level - 1, 2);
}

function getRank(level) {
  const ranks = ['Beginner', 'Learner', 'Intermediate', 'Advanced', 'Expert', 'Master'];
  const rankIndex = Math.min(Math.floor(level / 10), ranks.length - 1);
  return ranks[rankIndex];
}

const styles = StyleSheet.create({
  container: {
    padding: premiumSpacing.base,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: premiumSpacing.lg,
    gap: premiumSpacing.base,
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: premiumTypography.sizes['3xl'],
    fontWeight: premiumTypography.weights.bold,
    color: '#FFFFFF',
  },
  levelLabel: {
    fontSize: premiumTypography.sizes.xs,
    fontWeight: premiumTypography.weights.semibold,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  xpContainer: {
    flex: 1,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: premiumSpacing.xs,
  },
  xpLabel: {
    fontSize: premiumTypography.sizes.sm,
    fontWeight: premiumTypography.weights.medium,
    color: premiumColors.neutral[600],
  },
  xpValue: {
    fontSize: premiumTypography.sizes.base,
    fontWeight: premiumTypography.weights.bold,
    color: premiumColors.primary.main,
  },
  xpBarContainer: {
    gap: premiumSpacing.xs,
  },
  xpBarBackground: {
    height: 8,
    backgroundColor: premiumColors.neutral[200],
    borderRadius: premiumBorderRadius.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: premiumBorderRadius.full,
    overflow: 'hidden',
  },
  xpBarGradient: {
    width: '100%',
    height: '100%',
  },
  xpNextLevel: {
    fontSize: premiumTypography.sizes.xs,
    color: premiumColors.neutral[500],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: premiumSpacing.base,
    marginBottom: premiumSpacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: premiumSpacing.base,
    backgroundColor: premiumColors.neutral[50],
    borderRadius: premiumBorderRadius.lg,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: premiumSpacing.sm,
  },
  statValue: {
    fontSize: premiumTypography.sizes.lg,
    fontWeight: premiumTypography.weights.bold,
    color: premiumColors.neutral[900],
    marginBottom: premiumSpacing.xs,
  },
  statLabel: {
    fontSize: premiumTypography.sizes.xs,
    color: premiumColors.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  achievementsContainer: {
    marginTop: premiumSpacing.base,
  },
  sectionTitle: {
    fontSize: premiumTypography.sizes.base,
    fontWeight: premiumTypography.weights.semibold,
    color: premiumColors.neutral[900],
    marginBottom: premiumSpacing.md,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: premiumSpacing.sm,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: premiumSpacing.sm,
    backgroundColor: premiumColors.neutral[50],
    borderRadius: premiumBorderRadius.md,
    gap: premiumSpacing.sm,
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementName: {
    fontSize: premiumTypography.sizes.sm,
    fontWeight: premiumTypography.weights.medium,
    color: premiumColors.neutral[700],
  },
});

