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

const { width, height } = Dimensions.get('window');

export default function PracticeScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
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
  
  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Practice categories with premium design
  const practiceCategories = [
    {
      id: 'flashcards',
      title: 'Flashcards',
      subtitle: 'Spaced repetition learning',
      icon: 'albums',
      gradient: ['#6366F1', '#8B5CF6'],
      exercises: 42,
      progress: 68,
      onPress: () => navigation.navigate('Flashcards'),
    },
    {
      id: 'quiz',
      title: 'Quick Quiz',
      subtitle: 'Test your knowledge',
      icon: 'checkmark-done-circle',
      gradient: ['#10B981', '#059669'],
      exercises: 15,
      progress: 45,
      onPress: () => navigation.navigate('FreeQuiz'),
    },
    {
      id: 'speaking',
      title: 'Speaking',
      subtitle: 'AI pronunciation coach',
      icon: 'mic',
      gradient: ['#EC4899', '#F43F5E'],
      exercises: 8,
      progress: 30,
      onPress: () => navigation.navigate('SpeakingPractice'),
    },
    {
      id: 'listening',
      title: 'Listening',
      subtitle: 'Audio comprehension',
      icon: 'headset',
      gradient: ['#06B6D4', '#0891B2'],
      exercises: 12,
      progress: 55,
      onPress: () => navigation.navigate('ListeningPractice'),
    },
    {
      id: 'writing',
      title: 'Writing',
      subtitle: 'Composition practice',
      icon: 'create',
      gradient: ['#F59E0B', '#D97706'],
      exercises: 6,
      progress: 20,
      onPress: () => navigation.navigate('WritingPractice'),
    },
    {
      id: 'grammar',
      title: 'Grammar',
      subtitle: 'Rules & exercises',
      icon: 'school',
      gradient: ['#8B5CF6', '#7C3AED'],
      exercises: 20,
      progress: 72,
      onPress: () => navigation.navigate('GrammarDrills'),
    },
  ];

  // Quick practice sessions
  const quickSessions = [
    { id: '5min', title: '5 Min', subtitle: 'Quick review', icon: 'flash', color: '#6366F1' },
    { id: '10min', title: '10 Min', subtitle: 'Focus session', icon: 'time', color: '#10B981' },
    { id: '15min', title: '15 Min', subtitle: 'Deep practice', icon: 'fitness', color: '#F59E0B' },
    { id: 'custom', title: 'Custom', subtitle: 'Your pace', icon: 'settings', color: '#EC4899' },
  ];

  useEffect(() => {
    loadData();
    // Entrance animations
    Animated.stagger(100, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start();

    // Pulse animation for streak
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Animated Header */}
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
          colors={isDarkMode 
            ? ['#0F172A', '#1E1B4B', '#312E81']
            : ['#FEF3C7', '#FDE68A', '#FCD34D']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Decorative Elements */}
          <View style={styles.headerDecor}>
            <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: isDarkMode ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.2)' }]} />
            <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: isDarkMode ? 'rgba(139,92,246,0.1)' : 'rgba(251,191,36,0.15)' }]} />
          </View>

          <View style={styles.headerContent}>
            {/* Top Row */}
            <View style={styles.headerTopRow}>
              <View style={styles.headerTitleSection}>
                <View style={styles.headerBadge}>
                  <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerBadgeGradient}
                  >
                    <Ionicons name="fitness" size={14} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.headerBadgeText, { color: isDarkMode ? '#FCD34D' : '#B45309' }]}>
                    PRACTICE
                  </Text>
                </View>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>
                  Training Center
                </Text>
                <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>
                  Master French with daily practice
                </Text>
              </View>

              {/* Streak Badge */}
              {practiceStats && (
                <Animated.View style={[styles.streakContainer, { transform: [{ scale: pulseAnim }] }]}>
                  <LinearGradient
                    colors={['#F97316', '#EA580C']}
                    style={styles.streakBadge}
                  >
                    <Ionicons name="flame" size={20} color="#FFFFFF" />
                    <Text style={styles.streakNumber}>{practiceStats.practiceStreak}</Text>
                    <Text style={styles.streakLabel}>Day Streak</Text>
                  </LinearGradient>
                </Animated.View>
              )}
            </View>

            {/* Stats Pills */}
            <View style={styles.statsPillsRow}>
              <View style={[styles.statPill, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)' }]}>
                <Ionicons name="book" size={16} color="#6366F1" />
                <Text style={[styles.statPillValue, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>
                  {practiceStats?.wordsLearned || 0}
                </Text>
                <Text style={[styles.statPillLabel, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>Words</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)' }]}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={[styles.statPillValue, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>
                  {practiceStats?.accuracy || 0}%
                </Text>
                <Text style={[styles.statPillLabel, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>Accuracy</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)' }]}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={[styles.statPillValue, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>
                  {practiceStats?.xpEarned || 0}
                </Text>
                <Text style={[styles.statPillLabel, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>XP</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Challenge Card */}
        <Animated.View
          style={[
            styles.challengeSection,
            {
              opacity: cardsAnim,
              transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}
        >
          <LinearGradient
            colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#EEF2FF', '#E0E7FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.dailyChallengeCard, premiumShadows.lg]}
          >
            <View style={styles.challengeHeader}>
              <View style={styles.challengeIconContainer}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.challengeIcon}>
                  <Ionicons name="trophy" size={24} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeLabel, { color: isDarkMode ? '#FCD34D' : '#B45309' }]}>
                  DAILY CHALLENGE
                </Text>
                <Text style={[styles.challengeTitle, { color: colors.text }]}>
                  Complete 5 Practice Sessions
                </Text>
              </View>
              <View style={styles.challengeReward}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={[styles.challengeXP, { color: '#F59E0B' }]}>+100 XP</Text>
              </View>
            </View>
            <View style={styles.challengeProgress}>
              <View style={[styles.progressTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: '60%' }]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.secondaryText }]}>3 of 5 completed</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Sessions</Text>
            <View style={styles.sectionBadge}>
              <Ionicons name="flash" size={14} color="#F59E0B" />
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickSessionsScroll}
          >
            {quickSessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={[styles.quickSessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('Flashcards', { duration: session.id })}
                activeOpacity={0.85}
              >
                <View style={[styles.quickSessionIcon, { backgroundColor: session.color + '15' }]}>
                  <Ionicons name={session.icon} size={24} color={session.color} />
                </View>
                <Text style={[styles.quickSessionTitle, { color: colors.text }]}>{session.title}</Text>
                <Text style={[styles.quickSessionSubtitle, { color: colors.secondaryText }]}>{session.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Interactive Flashcard Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Word of the Day</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Flashcards')}>
              <Text style={[styles.seeAllText, { color: '#6366F1' }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.flashcardPreview, { backgroundColor: colors.card }, premiumShadows.lg]}
            onPress={handleFlashcardFlip}
            activeOpacity={0.95}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.flashcardGradient}
            >
              <View style={styles.flashcardMasteryBadge}>
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
              <TouchableOpacity style={[styles.flashcardBtn, { backgroundColor: '#EF4444' + '15' }]}>
                <Ionicons name="close" size={20} color="#EF4444" />
                <Text style={[styles.flashcardBtnText, { color: '#EF4444' }]}>Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.flashcardBtn, { backgroundColor: '#F59E0B' + '15' }]}>
                <Ionicons name="time" size={20} color="#F59E0B" />
                <Text style={[styles.flashcardBtnText, { color: '#F59E0B' }]}>Hard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.flashcardBtn, { backgroundColor: '#10B981' + '15' }]}>
                <Ionicons name="checkmark" size={20} color="#10B981" />
                <Text style={[styles.flashcardBtnText, { color: '#10B981' }]}>Good</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.flashcardBtn, { backgroundColor: '#6366F1' + '15' }]}>
                <Ionicons name="flash" size={20} color="#6366F1" />
                <Text style={[styles.flashcardBtnText, { color: '#6366F1' }]}>Easy</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Practice Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Practice Modes</Text>
          </View>
          <View style={styles.categoriesGrid}>
            {practiceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: colors.card }, premiumShadows.md]}
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
                  <Text style={[styles.categoryTitle, { color: colors.text }]}>{category.title}</Text>
                  <Text style={[styles.categorySubtitle, { color: colors.secondaryText }]}>{category.subtitle}</Text>
                  <View style={styles.categoryMeta}>
                    <View style={styles.categoryExercises}>
                      <Ionicons name="play-circle" size={12} color={category.gradient[0]} />
                      <Text style={[styles.categoryExercisesText, { color: category.gradient[0] }]}>
                        {category.exercises} exercises
                      </Text>
                    </View>
                    <View style={[styles.categoryProgress, { backgroundColor: colors.border }]}>
                      <View 
                        style={[
                          styles.categoryProgressFill, 
                          { width: `${category.progress}%`, backgroundColor: category.gradient[0] }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Achievements Section */}
        {isAuthenticated && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Achievements</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <Text style={[styles.seeAllText, { color: '#6366F1' }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsScroll}
            >
              <AchievementCard
                icon="trophy"
                title="Practice Master"
                subtitle="50 sessions done"
                gradient={['#F59E0B', '#D97706']}
                colors={colors}
              />
              <AchievementCard
                icon="flame"
                title="Streak Keeper"
                subtitle="7 day streak"
                gradient={['#EF4444', '#DC2626']}
                colors={colors}
              />
              <AchievementCard
                icon="star"
                title="Vocabulary Pro"
                subtitle="200+ words"
                gradient={['#6366F1', '#8B5CF6']}
                colors={colors}
              />
              <AchievementCard
                icon="medal"
                title="Perfect Score"
                subtitle="100% accuracy"
                gradient={['#10B981', '#059669']}
                colors={colors}
              />
            </ScrollView>
          </View>
        )}

        {/* Motivation Banner */}
        <View style={styles.section}>
          <LinearGradient
            colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#FEF3C7', '#FDE68A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.motivationBanner, premiumShadows.lg]}
          >
            <View style={styles.motivationContent}>
              <View style={styles.motivationIcon}>
                <Ionicons name="rocket" size={32} color="#F59E0B" />
              </View>
              <View style={styles.motivationText}>
                <Text style={[styles.motivationTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>
                  Keep Up the Great Work!
                </Text>
                <Text style={[styles.motivationSubtitle, { color: isDarkMode ? '#94A3B8' : '#6B7280' }]}>
                  You're making amazing progress. Just 2 more sessions to reach your daily goal!
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.motivationBtn}
              onPress={() => navigation.navigate('Flashcards')}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.motivationBtnGradient}
              >
                <Text style={styles.motivationBtnText}>Continue Practice</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// Achievement Card Component
function AchievementCard({ icon, title, subtitle, gradient, colors }) {
  return (
    <View style={[styles.achievementCard, { backgroundColor: colors.card }]}>
      <LinearGradient colors={gradient} style={styles.achievementIcon}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </LinearGradient>
      <Text style={[styles.achievementTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.achievementSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
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
    paddingTop: 55,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
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
    marginBottom: spacing.lg,
  },
  headerTitleSection: {
    flex: 1,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  headerBadgeGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  streakContainer: {
    marginLeft: spacing.md,
  },
  streakBadge: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.lg,
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
    gap: spacing.sm,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: premiumBorderRadius.lg,
    gap: 6,
  },
  statPillValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  statPillLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  challengeSection: {
    marginBottom: spacing.xl,
  },
  dailyChallengeCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  challengeIconContainer: {
    marginRight: spacing.md,
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
    marginBottom: 4,
  },
  challengeTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: premiumBorderRadius.full,
  },
  challengeXP: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  challengeProgress: {
    gap: spacing.xs,
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
    fontSize: fontSize.xs,
    fontWeight: '500',
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
  sectionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  quickSessionsScroll: {
    gap: spacing.sm,
  },
  quickSessionCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    minWidth: 100,
  },
  quickSessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickSessionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  quickSessionSubtitle: {
    fontSize: 10,
    fontWeight: '500',
  },
  flashcardPreview: {
    borderRadius: premiumBorderRadius.xl,
    overflow: 'hidden',
  },
  flashcardGradient: {
    padding: spacing.xl,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashcardMasteryBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.full,
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
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  flashcardTranslation: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  flashcardExample: {
    fontSize: fontSize.sm,
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
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  flashcardActions: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  flashcardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.lg,
    gap: 4,
  },
  flashcardBtnText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  categoriesGrid: {
    gap: spacing.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.xl,
    gap: spacing.md,
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
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryExercises: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    gap: spacing.sm,
  },
  achievementCard: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    width: 120,
    ...premiumShadows.sm,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  achievementTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  achievementSubtitle: {
    fontSize: 10,
    textAlign: 'center',
  },
  motivationBanner: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  motivationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  motivationIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(245,158,11,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationText: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  motivationSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  motivationBtn: {
    borderRadius: premiumBorderRadius.lg,
    overflow: 'hidden',
  },
  motivationBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  motivationBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
