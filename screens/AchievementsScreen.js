import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { useGamification } from '../src/context/GamificationContext';
import { themeShadows } from '../src/utils/organicTheme';

const { width } = Dimensions.get('window');

// Achievement definitions with real progression tracking
const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'book-open-variant',
    iconType: 'MaterialCommunityIcons',
    color: '#6366F1',
    xpReward: 50,
    requirement: { type: 'lessons', count: 1 },
  },
  {
    id: 'week_streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'fire',
    iconType: 'MaterialCommunityIcons',
    color: '#F59E0B',
    xpReward: 100,
    requirement: { type: 'streak', count: 7 },
  },
  {
    id: 'month_streak',
    name: 'Dedicated Learner',
    description: 'Maintain a 30-day streak',
    icon: 'trophy',
    iconType: 'Ionicons',
    color: '#10B981',
    xpReward: 500,
    requirement: { type: 'streak', count: 30 },
  },
  {
    id: 'vocabulary_master',
    name: 'Vocabulary Master',
    description: 'Learn 100 new words',
    icon: 'translate',
    iconType: 'MaterialCommunityIcons',
    color: '#8B5CF6',
    xpReward: 200,
    requirement: { type: 'words', count: 100 },
  },
  {
    id: 'perfect_score',
    name: 'Perfectionist',
    description: 'Get 100% on any quiz',
    icon: 'star',
    iconType: 'Ionicons',
    color: '#EC4899',
    xpReward: 75,
    requirement: { type: 'perfect_quizzes', count: 1 },
  },
  {
    id: 'course_complete',
    name: 'Course Champion',
    description: 'Complete an entire course',
    icon: 'school',
    iconType: 'Ionicons',
    color: '#14B8A6',
    xpReward: 300,
    requirement: { type: 'courses', count: 1 },
  },
  {
    id: 'xp_collector',
    name: 'XP Collector',
    description: 'Earn 1,000 XP total',
    icon: 'lightning-bolt',
    iconType: 'MaterialCommunityIcons',
    color: '#F97316',
    xpReward: 150,
    requirement: { type: 'xp', count: 1000 },
  },
  {
    id: 'level_up',
    name: 'Rising Star',
    description: 'Reach Level 5',
    icon: 'trending-up',
    iconType: 'Ionicons',
    color: '#06B6D4',
    xpReward: 250,
    requirement: { type: 'level', count: 5 },
  },
];

function AchievementCard({ achievement, unlocked, progress, theme, isDarkMode }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const IconComponent = achievement.iconType === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;

  const progressPercent = Math.min((progress / achievement.requirement.count) * 100, 100);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
    >
      <Animated.View
        style={[
          styles.achievementCard,
          {
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            borderColor: unlocked ? achievement.color + '40' : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
            transform: [{ scale: scaleAnim }],
          },
          themeShadows.sm,
        ]}
      >
        {/* Badge Icon */}
        <View
          style={[
            styles.badgeContainer,
            {
              backgroundColor: unlocked ? achievement.color + '15' : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
            },
          ]}
        >
          <IconComponent
            name={achievement.icon}
            size={28}
            color={unlocked ? achievement.color : (isDarkMode ? '#555' : '#CCC')}
          />
          {unlocked && (
            <View style={[styles.checkBadge, { backgroundColor: theme.success }]}>
              <Ionicons name="checkmark" size={10} color="#FFF" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.achievementContent}>
          <Text
            style={[
              styles.achievementName,
              { color: unlocked ? theme.text : theme.textSecondary },
            ]}
          >
            {achievement.name}
          </Text>
          <Text style={[styles.achievementDesc, { color: theme.textSecondary }]} numberOfLines={1}>
            {achievement.description}
          </Text>

          {/* Progress Bar */}
          {!unlocked && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progressPercent}%`, backgroundColor: achievement.color },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                {progress}/{achievement.requirement.count}
              </Text>
            </View>
          )}
        </View>

        {/* XP Reward */}
        <View style={[styles.xpBadge, { backgroundColor: unlocked ? theme.success + '15' : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') }]}>
          <Text style={[styles.xpText, { color: unlocked ? theme.success : theme.textSecondary }]}>
            +{achievement.xpReward} XP
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function AchievementsScreen({ navigation }) {
  const { isDarkMode, organicColors: theme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { stats, loading: gamificationLoading } = useGamification();
  const [refreshing, setRefreshing] = useState(false);

  // Calculate real progress based on gamification stats
  const getProgress = (requirement) => {
    switch (requirement.type) {
      case 'streak':
        return stats.streak || user?.streak?.current || 0;
      case 'xp':
        return stats.xp || 0;
      case 'level':
        return stats.level || 1;
      case 'lessons':
        return user?.completedLessons?.length || 0;
      case 'courses':
        return user?.completedCourses?.length || 0;
      case 'words':
        return user?.learnedWords || 0;
      case 'perfect_quizzes':
        return user?.perfectQuizzes || 0;
      default:
        return 0;
    }
  };

  const isUnlocked = (requirement) => {
    return getProgress(requirement) >= requirement.count;
  };

  const unlockedCount = ACHIEVEMENT_DEFINITIONS.filter(a => isUnlocked(a.requirement)).length;
  const totalXPEarned = ACHIEVEMENT_DEFINITIONS.filter(a => isUnlocked(a.requirement)).reduce((sum, a) => sum + a.xpReward, 0);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="trophy" size={48} color={theme.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Track Your Achievements
          </Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Sign in to unlock achievements and track your learning progress
          </Text>
          <TouchableOpacity
            style={[styles.signInBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Stats Card */}
        <View style={[styles.heroCard, { backgroundColor: '#1E3A5F' }, themeShadows.lg]}>
          <LinearGradient
            colors={['rgba(201, 162, 39, 0.2)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroTop}>
            <View style={styles.heroTitleArea}>
              <Text style={styles.heroLabel}>YOUR PROGRESS</Text>
              <Text style={styles.heroTitle}>Achievements</Text>
            </View>
            <View style={styles.heroLevelBadge}>
              <Text style={styles.heroLevelText}>LVL {stats.level || 1}</Text>
            </View>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{unlockedCount}</Text>
              <Text style={styles.heroStatLabel}>Unlocked</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{ACHIEVEMENT_DEFINITIONS.length - unlockedCount}</Text>
              <Text style={styles.heroStatLabel}>Remaining</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{totalXPEarned}</Text>
              <Text style={styles.heroStatLabel}>XP Earned</Text>
            </View>
          </View>

          {/* Overall Progress */}
          <View style={styles.heroProgressArea}>
            <View style={styles.heroProgressHeader}>
              <Text style={styles.heroProgressLabel}>Overall Completion</Text>
              <Text style={styles.heroProgressPercent}>
                {Math.round((unlockedCount / ACHIEVEMENT_DEFINITIONS.length) * 100)}%
              </Text>
            </View>
            <View style={styles.heroProgressTrack}>
              <View
                style={[
                  styles.heroProgressFill,
                  { width: `${(unlockedCount / ACHIEVEMENT_DEFINITIONS.length) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Live Stats Bar */}
        <View style={styles.liveStatsBar}>
          <View style={[styles.liveStat, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF', borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }, themeShadows.sm]}>
            <Ionicons name="flame" size={20} color="#F59E0B" />
            <Text style={[styles.liveStatValue, { color: theme.text }]}>{stats.streak || 0}</Text>
            <Text style={[styles.liveStatLabel, { color: theme.textSecondary }]}>Streak</Text>
          </View>
          <View style={[styles.liveStat, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF', borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }, themeShadows.sm]}>
            <Ionicons name="flash" size={20} color="#6366F1" />
            <Text style={[styles.liveStatValue, { color: theme.text }]}>{stats.xp || 0}</Text>
            <Text style={[styles.liveStatLabel, { color: theme.textSecondary }]}>Total XP</Text>
          </View>
          <View style={[styles.liveStat, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF', borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }, themeShadows.sm]}>
            <MaterialCommunityIcons name="medal" size={20} color="#10B981" />
            <Text style={[styles.liveStatValue, { color: theme.text }]}>{stats.points || 0}</Text>
            <Text style={[styles.liveStatLabel, { color: theme.textSecondary }]}>Points</Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>All Achievements</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            {unlockedCount} of {ACHIEVEMENT_DEFINITIONS.length} completed
          </Text>
        </View>

        {/* Achievement Cards */}
        <View style={styles.achievementsList}>
          {ACHIEVEMENT_DEFINITIONS.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              unlocked={isUnlocked(achievement.requirement)}
              progress={getProgress(achievement.requirement)}
              theme={theme}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingHorizontal: 20,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  signInBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  signInBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Hero Card
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heroTitleArea: {},
  heroLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  heroLevelBadge: {
    backgroundColor: '#C9A227',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heroLevelText: {
    color: '#1E3A5F',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  heroStat: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  heroStatDivider: {
    width: 1,
    height: 40,
  },
  heroProgressArea: {},
  heroProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroProgressLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  heroProgressPercent: {
    color: '#C9A227',
    fontSize: 13,
    fontWeight: '800',
  },
  heroProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#C9A227',
    borderRadius: 3,
  },
  // Live Stats Bar
  liveStatsBar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  liveStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  liveStatValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 8,
  },
  liveStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  // Section Header
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Achievement Cards
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  badgeContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 13,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  xpBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
