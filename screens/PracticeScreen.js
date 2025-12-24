import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { progressAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width } = Dimensions.get('window');

export default function PracticeScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const { stats: gamificationStats } = useGamification();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [practiceStats, setPracticeStats] = useState(null);
  const [currentFlashcard, setCurrentFlashcard] = useState({
    word: 'un cahier',
    translation: 'a notebook',
    example: 'J\'ai besoin d\'un cahier pour écrire mes notes.',
    mastery: 75,
  });
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const flipAnimation = useState(new Animated.Value(0))[0];

  const practiceModes = [
    {
      id: 'flashcards',
      title: 'Flashcards',
      subtitle: 'Spaced repetition',
      icon: 'albums',
      color: premiumColors.primary.main,
      description: 'Review vocabulary with intelligent spaced repetition',
      count: 42,
    },
    {
      id: 'quiz',
      title: 'Quick Quiz',
      subtitle: 'Test knowledge',
      icon: 'checkmark-circle',
      color: premiumColors.accent.emerald,
      description: 'Test your understanding with interactive quizzes',
      count: 15,
    },
    {
      id: 'speaking',
      title: 'Speaking Practice',
      subtitle: 'Pronunciation',
      icon: 'mic',
      color: premiumColors.accent.rose,
      description: 'Practice pronunciation with AI feedback',
      count: 8,
    },
    {
      id: 'listening',
      title: 'Listening',
      subtitle: 'Comprehension',
      icon: 'headset',
      color: premiumColors.accent.sky,
      description: 'Improve listening skills with audio exercises',
      count: 12,
    },
    {
      id: 'writing',
      title: 'Writing',
      subtitle: 'Composition',
      icon: 'create',
      color: premiumColors.accent.gold,
      description: 'Practice writing with guided exercises',
      count: 6,
    },
    {
      id: 'grammar',
      title: 'Grammar Drills',
      subtitle: 'Rules & exercises',
      icon: 'school',
      color: premiumColors.info,
      description: 'Master French grammar with targeted practice',
      count: 20,
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        const progressResponse = await progressAPI.getDashboard().catch(() => null);
        if (progressResponse?.data?.data) {
          const dashboardData = progressResponse.data.data;
          setPracticeStats({
            wordsLearned: 245,
            practiceStreak: gamificationStats?.streak || 0,
            accuracy: 87,
            totalPractice: dashboardData.totalLessonsCompleted || 0,
            timeSpent: formatStudyTime(dashboardData.totalTimeSpent || 0),
          });
        }
      }
    } catch (error) {
      console.error('Failed to load practice data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatStudyTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleFlashcardFlip = () => {
    setFlashcardFlipped(!flashcardFlipped);
    Animated.spring(flipAnimation, {
      toValue: flashcardFlipped ? 0 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const userName = user?.name?.split(' ')[0] || 'Learner';

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <LinearGradient
        colors={isDarkMode 
          ? ['#1a0a2e', '#16213e', '#0f3460']
          : ['#E8EAF6', '#F3E5F5', '#E1BEE7']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
                Practice & Master
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Improve your skills with interactive exercises
              </Text>
            </View>
            {isAuthenticated && practiceStats && (
              <View style={[styles.streakBadge, { backgroundColor: '#FFD700' }]}>
                <Ionicons name="flame" size={16} color="#000" />
                <Text style={styles.streakText}>{practiceStats.practiceStreak} day</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Practice Statistics */}
        {isAuthenticated && practiceStats && (
          <View style={styles.statsSection}>
            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.lg]}>
              <Text style={[styles.statsTitle, { color: colors.text }]}>Your Progress</Text>
              <View style={styles.statsGrid}>
                <StatItem
                  icon="book"
                  value={practiceStats.wordsLearned}
                  label="Words Learned"
                  color={premiumColors.primary.main}
                  colors={colors}
                />
                <StatItem
                  icon="checkmark-circle"
                  value={`${practiceStats.accuracy}%`}
                  label="Accuracy"
                  color={premiumColors.accent.emerald}
                  colors={colors}
                />
                <StatItem
                  icon="time"
                  value={practiceStats.timeSpent}
                  label="Practice Time"
                  color={premiumColors.accent.gold}
                  colors={colors}
                />
                <StatItem
                  icon="trophy"
                  value={practiceStats.totalPractice}
                  label="Sessions"
                  color={premiumColors.accent.rose}
                  colors={colors}
                />
              </View>
            </View>
          </View>
        )}

        {/* Interactive Flashcard */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Flashcard</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: premiumColors.primary.main }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.flashcardContainer, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.lg]}
            onPress={handleFlashcardFlip}
            activeOpacity={0.9}
          >
            <Animated.View
              style={[
                styles.flashcard,
                {
                  transform: [{ rotateY: frontInterpolate }],
                },
              ]}
            >
              <View style={styles.flashcardContent}>
                <View style={[styles.masteryBadge, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
                  <Text style={[styles.masteryText, { color: premiumColors.accent.emerald }]}>
                    {currentFlashcard.mastery}% Mastery
                  </Text>
                </View>
                <Text style={[styles.flashcardWord, { color: colors.text }]}>
                  {currentFlashcard.word}
                </Text>
                <View style={styles.flipHint}>
                  <Ionicons name="repeat" size={16} color={colors.secondaryText} />
                  <Text style={[styles.flipHintText, { color: colors.secondaryText }]}>
                    Tap to flip
                  </Text>
                </View>
              </View>
            </Animated.View>
            <Animated.View
              style={[
                styles.flashcard,
                styles.flashcardBack,
                {
                  transform: [{ rotateY: backInterpolate }],
                },
              ]}
            >
              <View style={styles.flashcardContent}>
                <Text style={[styles.flashcardTranslation, { color: colors.text }]}>
                  {currentFlashcard.translation}
                </Text>
                <Text style={[styles.flashcardExample, { color: colors.secondaryText }]}>
                  {currentFlashcard.example}
                </Text>
                <View style={styles.flipHint}>
                  <Ionicons name="repeat" size={16} color={colors.secondaryText} />
                  <Text style={[styles.flipHintText, { color: colors.secondaryText }]}>
                    Tap to flip back
                  </Text>
                </View>
              </View>
            </Animated.View>
            <View style={styles.flashcardActions}>
              <TouchableOpacity
                style={[styles.flashcardButton, styles.knownButton, { backgroundColor: premiumColors.accent.emerald }]}
                onPress={() => {}}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.flashcardButtonText}>Known</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.flashcardButton, styles.againButton, { backgroundColor: premiumColors.primary.main }]}
                onPress={() => {}}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.flashcardButtonText}>Again</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Practice Modes Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Practice Modes</Text>
          <View style={styles.practiceModesGrid}>
            {practiceModes.map((mode) => (
              <PracticeModeCard
                key={mode.id}
                mode={mode}
                colors={colors}
                onPress={() => {
                  // Navigate to specific practice mode
                  if (mode.id === 'quiz') {
                    navigation.navigate('FreeQuiz');
                  } else if (mode.id === 'grammar') {
                    navigation.navigate('GrammarDrills');
                  } else if (mode.id === 'flashcards') {
                    navigation.navigate('Flashcards');
                  } else if (mode.id === 'speaking') {
                    navigation.navigate('SpeakingPractice');
                  } else if (mode.id === 'listening') {
                    navigation.navigate('ListeningPractice');
                  } else if (mode.id === 'writing') {
                    navigation.navigate('WritingPractice');
                  } else {
                    navigation.navigate('Courses');
                  }
                }}
              />
            ))}
          </View>
        </View>

        {/* Daily Challenge */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Challenge</Text>
          <View style={[styles.challengeCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <LinearGradient
              colors={[premiumColors.accent.gold, premiumColors.accent.gold + 'DD']}
              style={styles.challengeGradient}
            >
              <Ionicons name="trophy" size={32} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.challengeContent}>
              <Text style={[styles.challengeTitle, { color: colors.text }]}>
                Complete 5 Practice Sessions
              </Text>
              <Text style={[styles.challengeDescription, { color: colors.secondaryText }]}>
                Practice flashcards, quizzes, and speaking exercises to earn bonus XP
              </Text>
              <View style={styles.challengeProgress}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { width: '60%', backgroundColor: premiumColors.accent.gold }]} />
                </View>
                <Text style={[styles.progressText, { color: colors.secondaryText }]}>3/5 completed</Text>
              </View>
              <TouchableOpacity
                style={[styles.challengeButton, { backgroundColor: premiumColors.accent.gold }]}
                onPress={() => navigation.navigate('Courses')}
              >
                <Text style={styles.challengeButtonText}>Start Practice</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Practice Sessions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Practice</Text>
          <View style={styles.quickPracticeGrid}>
            <QuickPracticeCard
              title="5-Min Review"
              subtitle="Quick vocabulary review"
              icon="flash"
              color={premiumColors.primary.main}
              colors={colors}
              count={25}
              onPress={() => navigation.navigate('Flashcards', { quickMode: '5min' })}
            />
            <QuickPracticeCard
              title="Grammar Focus"
              subtitle="Targeted grammar practice"
              icon="school"
              color={premiumColors.accent.emerald}
              colors={colors}
              count={15}
              onPress={() => navigation.navigate('GrammarDrills', { quickMode: true })}
            />
            <QuickPracticeCard
              title="Pronunciation"
              subtitle="Speaking exercises"
              icon="mic"
              color={premiumColors.accent.rose}
              colors={colors}
              count={10}
              onPress={() => navigation.navigate('SpeakingPractice', { quickMode: true })}
            />
            <QuickPracticeCard
              title="Quick Quiz"
              subtitle="Fast knowledge test"
              icon="checkmark-circle"
              color={premiumColors.accent.sky}
              colors={colors}
              count={12}
              onPress={() => navigation.navigate('FreeQuiz', { quickMode: true })}
            />
          </View>
        </View>

        {/* Recent Achievements */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Achievements</Text>
            <View style={styles.achievementsContainer}>
              <AchievementBadge
                icon="trophy"
                title="Practice Master"
                subtitle="Completed 50 sessions"
                color={premiumColors.accent.gold}
                colors={colors}
              />
              <AchievementBadge
                icon="flame"
                title="Streak Keeper"
                subtitle="7 day practice streak"
                color={premiumColors.error}
                colors={colors}
              />
              <AchievementBadge
                icon="star"
                title="Vocabulary Expert"
                subtitle="Learned 200+ words"
                color={premiumColors.primary.main}
                colors={colors}
              />
            </View>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function StatItem({ icon, value, label, color, colors }) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
    </View>
  );
}

function PracticeModeCard({ mode, colors, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.practiceModeCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[mode.color, mode.color + 'DD']}
        style={styles.modeGradient}
      >
        <Ionicons name={mode.icon} size={28} color="#FFFFFF" />
      </LinearGradient>
      <View style={styles.modeContent}>
        <Text style={[styles.modeTitle, { color: colors.text }]}>{mode.title}</Text>
        <Text style={[styles.modeSubtitle, { color: colors.secondaryText }]}>{mode.subtitle}</Text>
        <View style={styles.modeFooter}>
          <Ionicons name="play-circle" size={14} color={mode.color} />
          <Text style={[styles.modeCount, { color: mode.color }]}>{mode.count} exercises</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function QuickPracticeCard({ title, subtitle, icon, color, colors, count, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.quickPracticeCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[color, color + 'DD']}
        style={styles.quickPracticeGradient}
      >
        <Ionicons name={icon} size={28} color="#FFFFFF" />
      </LinearGradient>
      <View style={styles.quickPracticeContent}>
        <Text style={[styles.quickPracticeTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.quickPracticeSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
        <View style={styles.quickPracticeFooter}>
          <Ionicons name="play-circle" size={14} color={color} />
          <Text style={[styles.quickPracticeCount, { color: color }]}>{count} exercises</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function AchievementBadge({ icon, title, subtitle, color, colors }) {
  return (
    <View style={[styles.achievementBadge, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}>
      <View style={[styles.achievementIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.achievementTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.achievementSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs / 2,
  },
  streakText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  statsCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  statsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: spacing.md,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  flashcardContainer: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    minHeight: 280,
    justifyContent: 'center',
  },
  flashcard: {
    width: '100%',
    height: 200,
    backfaceVisibility: 'hidden',
  },
  flashcardBack: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
  },
  flashcardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  masteryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.base,
    marginBottom: spacing.md,
  },
  masteryText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  flashcardWord: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  flashcardTranslation: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  flashcardExample: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    marginTop: spacing.sm,
  },
  flipHintText: {
    fontSize: fontSize.xs,
  },
  flashcardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  flashcardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    gap: spacing.xs,
  },
  knownButton: {},
  againButton: {},
  flashcardButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  practiceModesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  practiceModeCard: {
    width: '48%',
    borderRadius: premiumBorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  modeGradient: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeContent: {
    padding: spacing.md,
  },
  modeTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  modeSubtitle: {
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  modeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  modeCount: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  challengeCard: {
    flexDirection: 'row',
    borderRadius: premiumBorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  challengeGradient: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeContent: {
    flex: 1,
    padding: spacing.md,
  },
  challengeTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  challengeDescription: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  challengeProgress: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  challengeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    alignSelf: 'flex-start',
  },
  challengeButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickPracticeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  quickPracticeCard: {
    width: '48%',
    borderRadius: premiumBorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  quickPracticeGradient: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickPracticeContent: {
    padding: spacing.md,
  },
  quickPracticeTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  quickPracticeSubtitle: {
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  quickPracticeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  quickPracticeCount: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  achievementBadge: {
    width: '48%',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  achievementTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  achievementSubtitle: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
