import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { themeShadows } from '../src/utils/organicTheme';
import { useAuth } from '../src/context/AuthContext';
import AchievementBadge from '../src/components/AchievementBadge';
import { spacing, fontSize } from '../src/utils/responsive';

const ALL_ACHIEVEMENTS = [
  'first_course',
  'week_streak',
  'month_streak',
  'course_complete',
  'perfect_quiz',
  'social_butterfly',
];

export default function AchievementsScreen({ navigation }) {
  const { organicColors: theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [achievements, setAchievements] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {

    setAchievements({
      first_course: true,
      week_streak: true,
      course_complete: true,
      month_streak: false,
      perfect_quiz: false,
      social_butterfly: false,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAchievements().finally(() => setRefreshing(false));
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={80} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Unlock Your Achievements
          </Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Log in to track your learning achievements and unlock badges!
          </Text>
        </View>
      </View>
    );
  }

  const unlockedCount = Object.values(achievements).filter(Boolean).length;
  const totalCount = ALL_ACHIEVEMENTS.length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
        <View style={styles.headerContent}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="trophy" size={32} color={theme.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Achievements</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {unlockedCount} of {totalCount} unlocked
            </Text>
          </View>
        </View>

        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(unlockedCount / totalCount) * 100}%`,
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.grid}>
        {ALL_ACHIEVEMENTS.map((achievementId) => (
          <AchievementBadge
            key={achievementId}
            achievementId={achievementId}
            unlocked={achievements[achievementId] || false}
            onPress={() => { }}
          />
        ))}
      </View>

      <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.statsTitle, { color: theme.text }]}>Your Progress</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="checkmark-circle" size={24} color={theme.success || theme.primary} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{unlockedCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Unlocked</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="lock-closed" size={24} color={theme.textSecondary} />
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {totalCount - unlockedCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Locked</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="trophy" size={24} color={theme.secondary} />
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {Math.round((unlockedCount / totalCount) * 100)}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Complete</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
  },
  progressBar: {
    height: 8,
    borderRadius: spacing.xl,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  statsContainer: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: fontSize.sm,
  },
});

