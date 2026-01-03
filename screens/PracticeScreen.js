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
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { progressAPI } from '../src/services/api';
import { getThemeColors, themeShadows, themeRadius } from '../src/utils/organicTheme';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

const BackgroundBlur = ({ style, color, size = 300 }) => (
  <View style={[style, {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    opacity: 0.05,
    transform: [{ scale: 1.5 }],
  }]} />
);

export default function PracticeScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode, organicColors: theme } = useTheme();
  const gamification = useGamification();
  const gamificationStats = gamification?.stats || {};

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [practiceStats, setPracticeStats] = useState(null);
  const DAILY_FOCUS_LIST = [
    { word: 'Bonjour', translation: 'Hello / Good morning', example: 'Bonjour, comment allez-vous?', mastery: 85 },
    { word: 'Merci beaucoup', translation: 'Thank you very much', example: 'Merci beaucoup pour votre aide.', mastery: 72 },
    { word: 'De rien', translation: 'You are welcome', example: 'C\'est un plaisir, de rien.', mastery: 64 },
    { word: 'S\'il vous plaît', translation: 'Please (formal)', example: 'Un café, s\'il vous plaît.', mastery: 91 },
    { word: 'Enchanté(e)', translation: 'Nice to meet you', example: 'Enchanté de faire votre connaissance.', mastery: 58 },
    { word: 'Bonne journée', translation: 'Have a good day', example: 'Merci, bonne journée à vous aussi!', mastery: 77 },
    { word: 'Comment ça va?', translation: 'How is it going?', example: 'Salut ! Comment ça va aujourd\'hui ?', mastery: 88 },
    { word: 'D\'accord', translation: 'Okay / Agreed', example: 'Je suis d\'accord avec toi.', mastery: 95 },
    { word: 'Excusez-moi', translation: 'Excuse me', example: 'Excusez-moi, où est la gare?', mastery: 82 },
    { word: 'À bientôt', translation: 'See you soon', example: 'Au revoir et à bientôt !', mastery: 70 },
  ];

  const getDailyFocus = () => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    // Simple hash to get a consistent index for the day
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash += dateString.charCodeAt(i);
    }
    const index = hash % DAILY_FOCUS_LIST.length;
    return DAILY_FOCUS_LIST[index];
  };

  const [currentFlashcard, setCurrentFlashcard] = useState(getDailyFocus());
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([...Array(10)].map(() => new Animated.Value(0))).current;
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const practiceCategories = [
    {
      id: 'flashcards',
      title: 'Flashcards',
      subtitle: 'Spaced repetition',
      icon: 'albums-outline',
      color: theme.primary,
      onPress: () => navigation.navigate('Flashcards'),
    },
    {
      id: 'quiz',
      title: 'Quick Quiz',
      subtitle: 'Knowledge check',
      icon: 'checkmark-done-outline',
      color: theme.success,
      onPress: () => navigation.navigate('FreeQuiz'),
    },
    {
      id: 'speaking',
      title: 'Speaking',
      subtitle: 'Voice coach',
      icon: 'mic-outline',
      color: theme.secondary,
      onPress: () => navigation.navigate('SpeakingPractice'),
    },
    {
      id: 'listening',
      title: 'Listening',
      subtitle: 'Comprehension',
      icon: 'headset-outline',
      color: theme.accent,
      onPress: () => navigation.navigate('ListeningPractice'),
    },
    {
      id: 'writing',
      title: 'Writing',
      subtitle: 'Expression',
      icon: 'create-outline',
      color: theme.secondary,
      onPress: () => navigation.navigate('WritingPractice'),
    },
    {
      id: 'grammar',
      title: 'Grammar',
      subtitle: 'Rule Master',
      icon: 'school-outline',
      color: theme.primary,
      onPress: () => navigation.navigate('GrammarDrills'),
    },
  ];

  useEffect(() => {
    loadData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.stagger(80, cardAnims.map(anim =>
      Animated.spring(anim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true })
    )).start();
  };

  const loadData = async () => {
    try {
      if (!refreshing) setLoading(true);
      if (isAuthenticated) {
        const progressResponse = await progressAPI.getDashboard().catch(() => null);
        if (progressResponse?.data?.data) {
          const dashboardData = progressResponse.data.data;
          setPracticeStats({
            wordsLearned: 245,
            streak: gamificationStats?.streak || 0,
            accuracy: 87,
            totalPractice: dashboardData.totalLessonsCompleted || 0,
            timeSpent: formatStudyTime(dashboardData.totalTimeSpent || 0),
            xpEarned: gamificationStats?.xp || 0,
          });
        } else {
          setPracticeStats({
            wordsLearned: 124,
            streak: gamificationStats?.streak || 0,
            accuracy: 82,
            totalPractice: 12,
            timeSpent: '2h 15m',
            xpEarned: gamificationStats?.xp || 0,
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

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <BackgroundBlur style={{ top: -100, left: -50 }} color={theme.secondary} size={400} />
      <BackgroundBlur style={{ bottom: 100, right: -100 }} color={theme.primary} size={350} />

      {/* Floating Navigation Bar */}
      <Animated.View
        style={[
          styles.floatingNavBar,
          {
            backgroundColor: theme.surface + 'F8',
            opacity: headerOpacity,
            borderBottomColor: theme.border,
          }
        ]}
      >
        <View style={styles.navBarContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: theme.text }]}>Training Center</Text>
          <View style={{ width: 24 }} />
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim }]}>
          <Text style={[styles.heroBadge, { color: theme.secondary }]}>PRACTICE</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Training Center</Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>Sharpen your skills with daily drills</Text>
        </Animated.View>

        {/* Stats Summary */}
        <Animated.View style={[styles.statsRow, { opacity: cardAnims[0], transform: [{ translateY: cardAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
            <Text style={[styles.statValue, { color: theme.text }]}>{practiceStats?.wordsLearned || '0'}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Words Learned</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
            <Text style={[styles.statValue, { color: theme.text }]}>{practiceStats?.accuracy || '0'}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Avg Accuracy</Text>
          </View>
        </Animated.View>

        {/* Daily Challenge */}
        <Animated.View style={[styles.section, { opacity: cardAnims[1], transform: [{ translateY: cardAnims[1].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <View style={[styles.challengeCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.md]}>
            <LinearGradient
              colors={[theme.secondary + '10', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.challengeHeader}>
              <View style={[styles.challengeIcon, { backgroundColor: theme.secondary + '15' }]}>
                <Ionicons name="flag" size={22} color={theme.secondary} />
              </View>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeBadge, { color: theme.secondary }]}>DAILY CHALLENGE</Text>
                <Text style={[styles.challengeTitle, { color: theme.text }]}>Complete 5 Drills Today</Text>
              </View>
              <View style={[styles.rewardBadge, { backgroundColor: theme.secondary + '15' }]}>
                <Text style={[styles.rewardText, { color: theme.secondary }]}>+100 XP</Text>
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
              <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>3 of 5 completed</Text>
            </View>
          </View>
        </Animated.View>

        {/* Training Modes Grid */}
        <Animated.View style={[styles.section, { opacity: cardAnims[2], transform: [{ translateY: cardAnims[2].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleAccent, { backgroundColor: theme.primary }]} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Training Modes</Text>
          </View>
          <View style={styles.modesGrid}>
            {practiceCategories.map((mode, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.modeCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}
                onPress={mode.onPress}
              >
                <View style={[styles.modeIcon, { backgroundColor: mode.color + '15' }]}>
                  <Ionicons name={mode.icon} size={24} color={mode.color} />
                </View>
                <Text style={[styles.modeTitle, { color: theme.text }]}>{mode.title}</Text>
                <Text style={[styles.modeSubtitle, { color: theme.textSecondary }]}>{mode.subtitle}</Text>
                <View style={styles.modeArrow}>
                  <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Word of the Day / Flashcard Preview */}
        <Animated.View style={[styles.section, { opacity: cardAnims[3], transform: [{ translateY: cardAnims[3].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleAccent, { backgroundColor: theme.accent }]} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Focus</Text>
          </View>
          <TouchableOpacity
            style={[styles.flashcardContainer, themeShadows.lg]}
            onPress={handleFlashcardFlip}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryLight || theme.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.flashcardGradient}
            >
              <View style={styles.flashcardHeader}>
                <View style={styles.flashcardBadge}>
                  <Ionicons name="star" size={12} color="#FFFFFF" />
                  <Text style={styles.flashcardBadgeText}>{currentFlashcard.mastery}% Mastered</Text>
                </View>
              </View>

              <Animated.View style={[styles.cardSide, { transform: [{ rotateY: frontInterpolate }] }]}>
                <Text style={styles.wordText}>{currentFlashcard.word}</Text>
                <View style={styles.hintWrap}>
                  <Ionicons name="repeat" size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.hintText}>Tap to reveal translation</Text>
                </View>
              </Animated.View>

              <Animated.View style={[styles.cardSide, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
                <Text style={styles.translationText}>{currentFlashcard.translation}</Text>
                <Text style={styles.exampleText}>"{currentFlashcard.example}"</Text>
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Achievement Highlight */}
        <Animated.View style={[styles.section, { opacity: cardAnims[4], transform: [{ translateY: cardAnims[4].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <TouchableOpacity
            style={[styles.banner, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.md]}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient
              colors={[theme.success + '10', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.bannerContent}>
              <View style={[styles.bannerIcon, { backgroundColor: theme.success + '15' }]}>
                <Ionicons name="trophy" size={24} color={theme.success} />
              </View>
              <View style={styles.bannerInfo}>
                <Text style={[styles.bannerTitle, { color: theme.text }]}>Practice Master</Text>
                <Text style={[styles.bannerSubtitle, { color: theme.textSecondary }]}>You've completed 50 practice sessions!</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    zIndex: 100,
    borderBottomWidth: 1,
  },
  navBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 50,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 22,
  },
  hero: {
    marginTop: 20,
    marginBottom: 24,
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  titleAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  challengeCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  challengeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  rewardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '800',
  },
  challengeProgress: {
    gap: 8,
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
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  modeCard: {
    width: (width - 56) / 2,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    position: 'relative',
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  modeSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginBottom: 8,
  },
  modeArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  flashcardContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    height: 220,
  },
  flashcardGradient: {
    flex: 1,
    padding: 24,
  },
  flashcardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  flashcardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  flashcardBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cardSide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
  },
  wordText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  hintWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  translationText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  exampleText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  banner: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bannerIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
});
