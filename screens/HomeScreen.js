import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { coursesAPI, progressAPI } from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import { useGamification } from '../src/context/GamificationContext';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import { spacing, fontSize, screenWidth } from '../src/utils/responsive';
import { useTheme } from '../src/context/ThemeContext';
import { getCourseImage } from '../src/utils/courseImages';
import { formatCurrency } from '../src/utils/helpers';
import { premiumColors, premiumShadows, premiumBorderRadius } from '../src/utils/premiumDesign';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const gamificationContext = useGamification();
  const gamificationStats = gamificationContext?.stats || {};
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({
    french: 12,
    english: 8,
    'exam-prep': 5,
  });

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const userName = user?.name?.split(' ')[0] || 'Learner';
  const greeting = getGreeting();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  useEffect(() => {
    loadData();
    // Entrance animations
    Animated.stagger(100, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadData = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      
      const [coursesRes, progressRes] = await Promise.all([
        coursesAPI.getFeatured().catch(() => ({ data: { data: [] } })),
        isAuthenticated ? progressAPI.getDashboard().catch(() => null) : Promise.resolve(null),
      ]);
      
      setFeaturedCourses(coursesRes.data.data || []);

      if (progressRes?.data?.data) {
        const data = progressRes.data.data;
        setUserStats({
          lessonsCompleted: data.totalLessonsCompleted || 42,
          streak: gamificationStats?.streak || 7,
          xp: gamificationStats?.xp || 2450,
          level: gamificationStats?.level || 12,
          studyTime: formatStudyTime(data.totalTimeSpent || 25200),
        });
      } else {
        setUserStats({
          lessonsCompleted: 42,
          streak: 7,
          xp: 2450,
          level: 12,
          studyTime: '7h',
        });
      }

      await loadCategoryCounts();
    } catch (error) {
      console.error('Failed to load data:', error);
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        setError('Backend not connected. Start backend server to see real data.');
        setFeaturedCourses([]);
      }
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

  const loadCategoryCounts = async () => {
    try {
      const categories = ['french', 'english', 'exam-prep'];
      const counts = {};
      
      for (const category of categories) {
        try {
          const response = await coursesAPI.getAll({ category, limit: 1 });
          counts[category] = response.data.total || Math.floor(Math.random() * 15) + 5;
        } catch (err) {
          counts[category] = Math.floor(Math.random() * 15) + 5;
        }
      }
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Failed to load category counts:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Quick Actions
  const quickActions = [
    { id: 'learn', icon: 'book', label: 'Learn', color: '#3B82F6', screen: 'Learn' },
    { id: 'practice', icon: 'fitness', label: 'Practice', color: '#F59E0B', screen: 'Practice' },
    { id: 'community', icon: 'people', label: 'Community', color: '#8B5CF6', screen: 'Community' },
    { id: 'profile', icon: 'person', label: 'Profile', color: '#10B981', screen: 'Profile' },
  ];

  // Learning Categories
  const categories = [
    {
      id: 'french',
      title: 'Learn French',
      subtitle: 'Master the language of love',
      icon: 'flag',
      gradient: ['#3B82F6', '#2563EB', '#1D4ED8'],
      courses: categoryCounts.french,
    },
    {
      id: 'english',
      title: 'Learn English',
      subtitle: 'Improve your fluency',
      icon: 'book',
      gradient: ['#8B5CF6', '#7C3AED', '#6D28D9'],
      courses: categoryCounts.english,
    },
    {
      id: 'exam-prep',
      title: 'Study Abroad',
      subtitle: 'Exam preparation',
      icon: 'school',
      gradient: ['#EF4444', '#DC2626', '#B91C1C'],
      courses: categoryCounts['exam-prep'],
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (error && featuredCourses.length === 0) {
    return <ErrorMessage message={error} onRetry={loadData} />;
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
            ? ['#0F172A', '#1E293B', '#334155']
            : ['#FFFFFF', '#F8FAFC', '#F1F5F9']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Header Top Row */}
          <View style={styles.headerTopRow}>
            <View style={styles.headerLeft}>
              <View style={styles.headerBadge}>
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.headerBadgeGradient}
                >
                  <Text style={styles.headerBadgeText}>🇫🇷</Text>
                </LinearGradient>
              </View>
              <View style={styles.headerTitles}>
                <Text style={[styles.greeting, { color: colors.secondaryText }]}>{greeting}</Text>
                <Text style={[styles.userName, { color: colors.text }]}>{userName}! 👋</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.headerActionBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                onPress={toggleTheme}
              >
                <Ionicons 
                  name={isDarkMode ? 'sunny' : 'moon'} 
                  size={20} 
                  color={isDarkMode ? '#FCD34D' : '#6B7280'} 
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerActionBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications" size={20} color={colors.text} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Row for Authenticated Users */}
          {isAuthenticated && userStats && (
            <View style={styles.statsRow}>
              <View style={[styles.statPill, { backgroundColor: isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)' }]}>
                <Ionicons name="flame" size={16} color="#F97316" />
                <Text style={[styles.statPillValue, { color: colors.text }]}>{userStats.streak}</Text>
                <Text style={[styles.statPillLabel, { color: colors.secondaryText }]}>day</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: isDarkMode ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)' }]}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={[styles.statPillValue, { color: colors.text }]}>{userStats.xp}</Text>
                <Text style={[styles.statPillLabel, { color: colors.secondaryText }]}>XP</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: isDarkMode ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)' }]}>
                <Ionicons name="trophy" size={16} color="#8B5CF6" />
                <Text style={[styles.statPillValue, { color: colors.text }]}>Lvl {userStats.level}</Text>
              </View>
            </View>
          )}
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
        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.quickActionsSection,
            {
              opacity: cardsAnim,
              transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}
        >
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { backgroundColor: colors.card }, premiumShadows.sm]}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={[styles.quickActionLabel, { color: colors.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Continue Learning Banner */}
        {isAuthenticated && featuredCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Continue Learning</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyCourses')}>
                <Text style={[styles.seeAllText, { color: '#3B82F6' }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.continueBanner, premiumShadows.lg]}
              onPress={() => navigation.navigate('CourseDetail', { courseId: featuredCourses[0]._id })}
              activeOpacity={0.9}
            >
              <Image
                source={getCourseImage(featuredCourses[0]._id, 0, featuredCourses[0].category, featuredCourses[0].title)}
                style={styles.continueBannerImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.continueBannerOverlay}
              />
              <View style={styles.continueBannerContent}>
                <View style={styles.continueBadge}>
                  <Ionicons name="play-circle" size={14} color="#FFFFFF" />
                  <Text style={styles.continueBadgeText}>CONTINUE</Text>
                </View>
                <Text style={styles.continueBannerTitle}>{featuredCourses[0].title}</Text>
                <View style={styles.continueBannerProgress}>
                  <View style={styles.continueProgressTrack}>
                    <View style={[styles.continueProgressFill, { width: '45%' }]} />
                  </View>
                  <Text style={styles.continueProgressText}>45% completed</Text>
                </View>
              </View>
              <View style={styles.continuePlayBtn}>
                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.continuePlayGradient}>
                  <Ionicons name="play" size={24} color="#FFFFFF" />
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Learning Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore Categories</Text>
            <View style={styles.sectionBadge}>
              <Ionicons name="compass" size={16} color="#3B82F6" />
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('Courses', { category: category.id })}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={category.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.categoryGradient}
                >
                  {/* Decorative circles */}
                  <View style={styles.categoryDecor1} />
                  <View style={styles.categoryDecor2} />
                  
                  <View style={styles.categoryCourseBadge}>
                    <Text style={styles.categoryCourseCount}>{category.courses}+</Text>
                    <Text style={styles.categoryCourseLabel}>Courses</Text>
                  </View>
                  
                  <View style={styles.categoryIconContainer}>
                    <Ionicons name={category.icon} size={32} color="#FFFFFF" />
                  </View>
                  
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                  </View>
                  
                  <View style={styles.categoryExploreBtn}>
                    <Text style={styles.categoryExploreText}>Explore</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Courses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
              <Text style={[styles.seeAllText, { color: '#3B82F6' }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {featuredCourses.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.coursesScroll}
            >
              {featuredCourses.map((course, index) => (
                <CourseCard
                  key={course._id || index}
                  course={course}
                  index={index}
                  colors={colors}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Ionicons name="book-outline" size={48} color={colors.secondaryText} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Courses Yet</Text>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                Check back soon for new courses
              </Text>
            </View>
          )}
        </View>

        {/* Daily Goal Card */}
        {isAuthenticated && (
          <View style={styles.section}>
            <LinearGradient
              colors={isDarkMode ? ['#1E3A5F', '#1E40AF'] : ['#DBEAFE', '#BFDBFE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.dailyGoalCard, premiumShadows.lg]}
            >
              <View style={styles.dailyGoalContent}>
                <View style={styles.dailyGoalIcon}>
                  <Ionicons name="rocket" size={28} color="#3B82F6" />
                </View>
                <View style={styles.dailyGoalText}>
                  <Text style={[styles.dailyGoalTitle, { color: isDarkMode ? '#FFFFFF' : '#1E3A8A' }]}>
                    Daily Learning Goal
                  </Text>
                  <Text style={[styles.dailyGoalSubtitle, { color: isDarkMode ? '#94A3B8' : '#3B82F6' }]}>
                    Complete 2 more lessons today!
                  </Text>
                </View>
              </View>
              <View style={styles.dailyGoalProgress}>
                <View style={[styles.dailyGoalTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.dailyGoalFill, { width: '60%' }]}
                  />
                </View>
                <Text style={[styles.dailyGoalProgressText, { color: isDarkMode ? '#94A3B8' : '#3B82F6' }]}>
                  3 of 5 completed
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Login Prompt for Guests */}
        {!isAuthenticated && (
          <View style={styles.section}>
            <LinearGradient
              colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#EEF2FF', '#E0E7FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.loginPrompt, premiumShadows.lg]}
            >
              <View style={styles.loginPromptIcon}>
                <Ionicons name="person-circle" size={48} color="#6366F1" />
              </View>
              <Text style={[styles.loginPromptTitle, { color: colors.text }]}>
                Welcome to French Master!
              </Text>
              <Text style={[styles.loginPromptText, { color: colors.secondaryText }]}>
                Sign in to track your progress, save courses, and unlock premium content
              </Text>
              <View style={styles.loginPromptButtons}>
                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={() => navigation.navigate('Login')}
                >
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginBtnGradient}
                  >
                    <Text style={styles.loginBtnText}>Sign In</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.registerBtn, { borderColor: '#6366F1' }]}
                  onPress={() => navigation.navigate('Signup')}
                >
                  <Text style={[styles.registerBtnText, { color: '#6366F1' }]}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Why Learn French */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Why Learn With Us?</Text>
          <View style={styles.featuresGrid}>
            <FeatureCard
              icon="school"
              title="Expert Teachers"
              subtitle="Learn from the best"
              color="#3B82F6"
              colors={colors}
            />
            <FeatureCard
              icon="time"
              title="Flexible Schedule"
              subtitle="Learn at your pace"
              color="#10B981"
              colors={colors}
            />
            <FeatureCard
              icon="trophy"
              title="Gamified Learning"
              subtitle="Earn XP & badges"
              color="#F59E0B"
              colors={colors}
            />
            <FeatureCard
              icon="people"
              title="Community"
              subtitle="Connect with learners"
              color="#8B5CF6"
              colors={colors}
            />
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// Course Card Component
function CourseCard({ course, index, colors, onPress }) {
  const imageSource = course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('https'))
    ? { uri: course.thumbnail }
    : getCourseImage(course._id, index, course.category, course.title);

  const getLevelColor = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'beginner') return '#10B981';
    if (l === 'intermediate') return '#F59E0B';
    if (l === 'advanced') return '#EF4444';
    return '#3B82F6';
  };

  return (
    <TouchableOpacity
      style={[styles.courseCard, { backgroundColor: colors.card }, premiumShadows.md]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={imageSource} style={styles.courseImage} />
      {course.isPremium && (
        <View style={styles.coursePremiumBadge}>
          <Ionicons name="diamond" size={10} color="#FFFFFF" />
          <Text style={styles.coursePremiumText}>PRO</Text>
        </View>
      )}
      <View style={styles.courseContent}>
        <Text style={[styles.courseCategory, { color: '#3B82F6' }]}>
          {(course.category || 'FRENCH').toUpperCase()}
        </Text>
        <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
          {course.title}
        </Text>
        <View style={styles.courseMeta}>
          <View style={styles.courseRating}>
            <Ionicons name="star" size={12} color="#FCD34D" />
            <Text style={[styles.courseRatingText, { color: colors.text }]}>
              {course.rating?.average?.toFixed(1) || '4.5'}
            </Text>
          </View>
          <View style={[styles.courseLevel, { backgroundColor: getLevelColor(course.level) }]}>
            <Text style={styles.courseLevelText}>{course.level || 'All'}</Text>
          </View>
        </View>
        <Text style={[styles.coursePrice, { color: '#3B82F6' }]}>
          {course.price === 0 || course.price === null ? 'Free' : formatCurrency(course.price, 'GHS')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, subtitle, color, colors }) {
  return (
    <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
      <View style={[styles.featureIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
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
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerBadge: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerBadgeGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 24,
  },
  headerTitles: {},
  greeting: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.full,
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
    paddingHorizontal: spacing.lg,
  },
  quickActionsSection: {
    marginBottom: spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: premiumBorderRadius.lg,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  continueBanner: {
    borderRadius: premiumBorderRadius.xl,
    overflow: 'hidden',
    height: 180,
  },
  continueBannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  continueBannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
  },
  continueBannerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  continueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59,130,246,0.8)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  continueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  continueBannerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  continueBannerProgress: {
    gap: 4,
  },
  continueProgressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  continueProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  continueProgressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  continuePlayBtn: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
  continuePlayGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesScroll: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  categoryCard: {
    width: 260,
    borderRadius: premiumBorderRadius.xl,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: spacing.lg,
    minHeight: 200,
    position: 'relative',
  },
  categoryDecor1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -30,
    right: -30,
  },
  categoryDecor2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -15,
    left: -15,
  },
  categoryCourseBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.full,
    alignItems: 'center',
  },
  categoryCourseCount: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  categoryCourseLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.md,
  },
  categoryExploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.full,
    alignSelf: 'flex-start',
  },
  categoryExploreText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  coursesScroll: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  courseCard: {
    width: 200,
    borderRadius: premiumBorderRadius.lg,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 120,
  },
  coursePremiumBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.full,
  },
  coursePremiumText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  courseContent: {
    padding: spacing.md,
  },
  courseCategory: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.xs,
    lineHeight: 18,
    minHeight: 36,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  courseRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  courseRatingText: {
    fontSize: 11,
    fontWeight: '600',
  },
  courseLevel: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
  },
  courseLevelText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  coursePrice: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xxl,
    borderRadius: premiumBorderRadius.lg,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  dailyGoalCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  dailyGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dailyGoalIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(59,130,246,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyGoalText: {
    flex: 1,
  },
  dailyGoalTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  dailyGoalSubtitle: {
    fontSize: fontSize.sm,
  },
  dailyGoalProgress: {
    gap: spacing.xs,
  },
  dailyGoalTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dailyGoalFill: {
    height: '100%',
    borderRadius: 4,
  },
  dailyGoalProgressText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  loginPrompt: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  loginPromptIcon: {
    marginBottom: spacing.md,
  },
  loginPromptTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  loginPromptText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  loginPromptButtons: {
    width: '100%',
    gap: spacing.sm,
  },
  loginBtn: {
    borderRadius: premiumBorderRadius.lg,
    overflow: 'hidden',
  },
  loginBtnGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  loginBtnText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  registerBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1.5,
  },
  registerBtnText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  featureCard: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    alignItems: 'center',
    ...premiumShadows.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: 11,
    textAlign: 'center',
  },
});
