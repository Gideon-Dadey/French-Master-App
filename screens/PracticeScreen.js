import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { progressAPI } from '../src/services/api';
import { getThemeColors, themeShadows, themeRadius } from '../src/utils/organicTheme';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

export default function PracticeScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const gamificationContext = useGamification();
  const gamificationStats = gamificationContext?.stats || {};
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [practiceStats, setPracticeStats] = useState(null);
  const [currentFlashcard, setCurrentFlashcard] = useState({
    word: 'Bonjour',
    translation: 'Hello / Good morning',
    example: 'Bonjour, comment allez-vous?',
    mastery: 85,
  });
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const practiceCategories = [
    {
      id: 'flashcards',
      title: 'Flashcards',
      subtitle: 'Spaced repetition learning',
      icon: 'albums',
      gradient: [theme.primary, theme.primaryLight || theme.primary],
      exercises: 42,
      progress: 68,
      onPress: () => navigation.navigate('Flashcards'),
    },
    {
      id: 'quiz',
      title: 'Quick Quiz',
      subtitle: 'Test your knowledge',
      icon: 'checkmark-done-circle',
      gradient: [theme.success, theme.success + 'CC'],
      exercises: 15,
      progress: 45,
      onPress: () => navigation.navigate('FreeQuiz'),
    },
    {
      id: 'speaking',
      title: 'Speaking',
      subtitle: 'AI pronunciation coach',
      icon: 'mic',
      gradient: [theme.accent, theme.accent + 'CC'],
      exercises: 8,
      progress: 30,
      onPress: () => navigation.navigate('SpeakingPractice'),
    },
    {
      id: 'listening',
      title: 'Listening',
      subtitle: 'Audio comprehension',
      icon: 'headset',
      gradient: [theme.info, theme.info + 'CC'],
      exercises: 12,
      progress: 55,
      onPress: () => navigation.navigate('ListeningPractice'),
    },
    {
      id: 'writing',
      title: 'Writing',
      subtitle: 'Composition practice',
      icon: 'create',
      gradient: [theme.secondary, theme.secondaryLight || theme.secondary],
      exercises: 6,
      progress: 20,
      onPress: () => navigation.navigate('WritingPractice'),
    },
    {
      id: 'grammar',
      title: 'Grammar',
      subtitle: 'Rules & exercises',
      icon: 'school',
      gradient: [theme.primary, theme.primaryLight || theme.primary],
      exercises: 20,
      progress: 72,
      onPress: () => navigation.navigate('GrammarDrills'),
    },
  ];

  const wordOfTheDayCard = {
    id: 'wordofday',
    title: 'Word of the Day',
    subtitle: 'Expand your vocabulary daily',
    icon: 'sunny',
    gradient: [theme.secondary, theme.secondaryLight || theme.secondary],
    onPress: () => navigation.navigate('WordOfTheDay'),
  };

  const quickSessions = [
    { id: '5min', title: '5 Min', subtitle: 'Quick review', icon: 'flash', color: theme.primary },
    { id: '10min', title: '10 Min', subtitle: 'Focus session', icon: 'time', color: theme.success },
    { id: '15min', title: '15 Min', subtitle: 'Deep practice', icon: 'fitness', color: theme.secondary },
    { id: 'custom', title: 'Custom', subtitle: 'Your pace', icon: 'settings', color: theme.accent },
  ];

  useEffect(() => {
    loadData();

    Animated.stagger(100, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
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
            practiceStreak: gamificationStats?.streak || 7,
            accuracy: 87,
            totalPractice: dashboardData.totalLessonsCompleted || 156,
            timeSpent: formatStudyTime(dashboardData.totalTimeSpent || 3600),
            xpEarned: gamificationStats?.xp || 2450,
          });
        } else {
          setPracticeStats({
            wordsLearned: 245,
            practiceStreak: 7,
            accuracy: 87,
            totalPractice: 156,
            timeSpent: '12h 30m',
            xpEarned: 2450,
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
    if (hours > 0) return `${hours}h ${minutes}m`;
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

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      <Animated.View
        style={[
          styles.headerWrapper,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
          },
        ]}
      >
        <LinearGradient
          colors={theme.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerDecor}>
            <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
            <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerTitleSection}>
                <Text style={[styles.headerBadgeText, { color: theme.secondary }]}>PRACTICE</Text>
                <Text style={styles.headerTitle}>Training Center</Text>
                <Text style={styles.headerSubtitle}>Master French with daily practice</Text>
              </View>

              {practiceStats && (
                <Animated.View style={[styles.streakContainer, { transform: [{ scale: pulseAnim }] }]}>
                  <LinearGradient
                    colors={[theme.secondary, theme.secondaryLight || theme.secondary]}
                    style={styles.streakBadge}
                  >
                    <Ionicons name="flame" size={18} color="#FFFFFF" />
                    <Text style={styles.streakNumber}>{practiceStats.practiceStreak}</Text>
                    <Text style={styles.streakLabel}>Day Streak</Text>
                  </LinearGradient>
                </Animated.View>
              )}
            </View>

            <View style={styles.statsPillsRow}>
              <View style={[styles.statPill, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Ionicons name="book-outline" size={16} color="#FFFFFF" />
                <Text style={styles.statPillValue}>{practiceStats?.wordsLearned || 0}</Text>
                <Text style={styles.statPillLabel}>Words</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                <Text style={styles.statPillValue}>{practiceStats?.accuracy || 0}%</Text>
                <Text style={styles.statPillLabel}>Accuracy</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Ionicons name="star-outline" size={16} color="#FFFFFF" />
                <Text style={styles.statPillValue}>{practiceStats?.xpEarned || 0}</Text>
                <Text style={styles.statPillLabel}>XP</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        showsVerticalScrollIndicator={false}
      >

        <Animated.View
          style={[
            styles.challengeSection,
            {
              opacity: cardsAnim,
              transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}
        >
          <View style={[styles.dailyChallengeCard, { backgroundColor: theme.surface }, themeShadows.lg]}>
            <View style={styles.challengeHeader}>
              <View style={[styles.challengeIcon, { backgroundColor: theme.secondary + '20' }]}>
                <Ionicons name="flag" size={24} color={theme.secondary} />
              </View>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeLabel, { color: theme.secondary }]}>DAILY CHALLENGE</Text>
                <Text style={[styles.challengeTitle, { color: theme.text }]}>Complete 5 Practice Sessions</Text>
              </View>
              <View style={[styles.challengeReward, { backgroundColor: theme.secondary + '15' }]}>
                <Text style={[styles.challengeXP, { color: theme.secondary }]}>+100 XP</Text>
              </View>
            </View>
            <View style={styles.challengeProgress}>
              <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
                <LinearGradient
                  colors={[theme.secondary, theme.secondaryLight || theme.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: '60%' }]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>3 of 5 completed</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Sessions</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickSessionsScroll}
          >
            {quickSessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={[styles.quickSessionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => navigation.navigate('Flashcards', { duration: session.id })}
                activeOpacity={0.85}
              >
                <View style={[styles.quickSessionIcon, { backgroundColor: session.color + '15' }]}>
                  <Ionicons name={session.icon} size={20} color={session.color} />
                </View>
                <Text style={[styles.quickSessionTitle, { color: theme.text }]}>{session.title}</Text>
                <Text style={[styles.quickSessionSubtitle, { color: theme.textSecondary }]}>{session.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Word of the Day</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Flashcards')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.flashcardPreview, { backgroundColor: theme.surface }, themeShadows.lg]}
            onPress={handleFlashcardFlip}
            activeOpacity={0.95}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryLight || theme.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.flashcardGradient}
            >
              <View style={[styles.flashcardMasteryBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="star" size={12} color="#FFFFFF" />
                <Text style={styles.flashcardMasteryText}>{currentFlashcard.mastery}% Mastered</Text>
              </View>

              <Animated.View style={[styles.flashcardFront, { transform: [{ rotateY: frontInterpolate }] }]}>
                <Text style={styles.flashcardWord}>{currentFlashcard.word}</Text>
                <View style={styles.flashcardHint}>
                  <Ionicons name="repeat" size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.flashcardHintText}>Tap to reveal</Text>
                </View>
              </Animated.View>

              <Animated.View style={[styles.flashcardBack, { transform: [{ rotateY: backInterpolate }] }]}>
                <Text style={styles.flashcardTranslation}>{currentFlashcard.translation}</Text>
                <Text style={styles.flashcardExample}>"{currentFlashcard.example}"</Text>
              </Animated.View>
            </LinearGradient>

            <View style={styles.flashcardActions}>
              <TouchableOpacity style={[styles.flashcardBtn, { backgroundColor: theme.error + '15' }]}>
                <Ionicons name="close" size={20} color={theme.error} />
                <Text style={[styles.flashcardBtnText, { color: theme.error }]}>Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.flashcardBtn, { backgroundColor: theme.secondary + '15' }]}>
                <Ionicons name="time" size={20} color={theme.secondary} />
                <Text style={[styles.flashcardBtnText, { color: theme.secondary }]}>Hard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.flashcardBtn, { backgroundColor: theme.success + '15' }]}>
                <Ionicons name="checkmark" size={20} color={theme.success} />
                <Text style={[styles.flashcardBtnText, { color: theme.success }]}>Good</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.flashcardBtn, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="flash" size={20} color={theme.primary} />
                <Text style={[styles.flashcardBtnText, { color: theme.primary }]}>Easy</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.wordOfDayCard, themeShadows.lg]}
          onPress={wordOfTheDayCard.onPress}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[theme.secondary, theme.secondaryLight || theme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wordOfDayGradient}
          >
            <View style={styles.wordOfDayDecor1} />
            <View style={styles.wordOfDayDecor2} />
            <View style={styles.wordOfDayContent}>
              <View style={styles.wordOfDayLeft}>
                <View style={styles.wordOfDayIconWrap}>
                  <Ionicons name="sunny" size={28} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.wordOfDayTitle}>Word of the Day</Text>
                  <Text style={styles.wordOfDaySubtitle}>Learn a new word daily</Text>
                </View>
              </View>
              <View style={styles.wordOfDayArrow}>
                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Practice Modes</Text>
          </View>
          <View style={styles.categoriesGrid}>
            {practiceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: theme.surface }, themeShadows.md]}
                onPress={category.onPress}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={category.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.categoryIcon}
                >
                  <Ionicons name={category.icon} size={26} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.categoryContent}>
                  <Text style={[styles.categoryTitle, { color: theme.text }]}>{category.title}</Text>
                  <Text style={[styles.categorySubtitle, { color: theme.textSecondary }]}>{category.subtitle}</Text>
                  <View style={styles.categoryMeta}>
                    <Text style={[styles.categoryExercisesText, { color: category.gradient[0] }]}>
                      {category.exercises} exercises
                    </Text>
                    <View style={[styles.categoryProgress, { backgroundColor: theme.border }]}>
                      <View
                        style={[
                          styles.categoryProgressFill,
                          { width: `${category.progress}%`, backgroundColor: category.gradient[0] }
                        ]}
                      />
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isAuthenticated && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Achievements</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsScroll}
            >
              <AchievementCard
                title="Practice Master"
                subtitle="50 sessions done"
                icon="medal"
                gradient={[theme.secondary, theme.secondaryLight || theme.secondary]}
                theme={theme}
              />
              <AchievementCard
                title="Streak Keeper"
                subtitle="7 day streak"
                icon="flame"
                gradient={[theme.error, theme.error + 'CC']}
                theme={theme}
              />
              <AchievementCard
                title="Vocabulary Pro"
                subtitle="200+ words"
                icon="library"
                gradient={[theme.primary, theme.primaryLight || theme.primary]}
                theme={theme}
              />
              <AchievementCard
                title="Perfect Score"
                subtitle="100% accuracy"
                icon="trophy"
                gradient={[theme.success, theme.success + 'CC']}
                theme={theme}
              />
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.motivationBanner, themeShadows.lg]}
            onPress={() => navigation.navigate('Flashcards')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryLight || theme.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.motivationBannerGradient}
            >
              <View style={styles.motivationContent}>
                <View style={styles.motivationIcon}>
                  <Ionicons name="rocket" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.motivationText}>
                  <Text style={styles.motivationTitle}>Keep Up the Great Work!</Text>
                  <Text style={styles.motivationSubtitle}>
                    You're making amazing progress. Just 2 more sessions to reach your daily goal!
                  </Text>
                </View>
              </View>
              <View style={styles.motivationArrow}>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function AchievementCard({ title, subtitle, icon, gradient, theme }) {
  return (
    <View style={[styles.achievementCard, { backgroundColor: theme.surface }, themeShadows.sm]}>
      <LinearGradient colors={gradient} style={styles.achievementIcon}>
        <Ionicons name={icon} size={22} color="#FFFFFF" />
      </LinearGradient>
      <Text style={[styles.achievementTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.achievementSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    zIndex: 10,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  decorCircle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  decorCircle2: {
    width: 150,
    height: 150,
    bottom: -30,
    left: -30,
  },
  headerContent: {
    zIndex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  headerTitleSection: {
    flex: 1,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  streakContainer: {
    marginLeft: 12,
  },
  streakBadge: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    minWidth: 70,
  },
  streakNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  streakLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsPillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 6,
  },
  statPillValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statPillLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  challengeSection: {
    marginBottom: 24,
  },
  dailyChallengeCard: {
    borderRadius: 18,
    padding: 18,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  challengeReward: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  challengeXP: {
    fontSize: 13,
    fontWeight: '700',
  },
  challengeProgress: {
    gap: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickSessionsScroll: {
    gap: 10,
  },
  quickSessionCard: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 100,
  },
  quickSessionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickSessionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  quickSessionSubtitle: {
    fontSize: 10,
    fontWeight: '500',
  },
  flashcardPreview: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  flashcardGradient: {
    padding: 28,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashcardMasteryBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flashcardMasteryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  flashcardFront: {
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  flashcardBack: {
    position: 'absolute',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  flashcardWord: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  flashcardTranslation: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  flashcardExample: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  flashcardHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flashcardHintText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  flashcardActions: {
    flexDirection: 'row',
    padding: 14,
    gap: 8,
  },
  flashcardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  flashcardBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoriesGrid: {
    gap: 10,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    gap: 14,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryExercisesText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryProgress: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  achievementsScroll: {
    gap: 12,
  },
  achievementCard: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    width: 120,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  achievementSubtitle: {
    fontSize: 10,
    textAlign: 'center',
  },
  motivationBanner: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  motivationBannerGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  motivationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  motivationIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationText: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  motivationSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  motivationArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordOfDayCard: {
    marginBottom: 24,
    borderRadius: 18,
    overflow: 'hidden',
  },
  wordOfDayGradient: {
    padding: 18,
    overflow: 'hidden',
  },
  wordOfDayDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  wordOfDayDecor2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  wordOfDayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordOfDayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  wordOfDayIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordOfDayTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  wordOfDaySubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  wordOfDayArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
