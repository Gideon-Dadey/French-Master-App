import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { coursesAPI, progressAPI } from '../src/services/api';
import { getCourseImage } from '../src/utils/courseImages';
import { getThemeColors, themeShadows, themeRadius } from '../src/utils/organicTheme';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

export default function LearnScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const gamificationContext = useGamification();
  const gamificationStats = gamificationContext?.stats || {};
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [learningStats, setLearningStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [continueLearning, setContinueLearning] = useState(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const categories = [
    { id: null, name: 'All', icon: 'apps', color: theme.primary },
    { id: 'french', name: 'French', icon: 'flag', color: theme.primary },
    { id: 'grammar', name: 'Grammar', icon: 'school', color: theme.primary },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'book', color: theme.primary },
    { id: 'conversation', name: 'Speaking', icon: 'chatbubbles', color: theme.primary },
  ];

  useEffect(() => {
    loadData();

    Animated.stagger(100, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = selectedCategory ? { category: selectedCategory } : {};
      
      const results = await Promise.allSettled([
        coursesAPI.getFeatured(),
        coursesAPI.getAll({ ...params, limit: 20 }),
        isAuthenticated ? progressAPI.getDashboard() : Promise.resolve(null),
      ]);

      if (results[0].status === 'fulfilled') {
        setFeaturedCourses(results[0].value?.data?.data || []);
      } else {
        setFeaturedCourses([]);
      }

      if (results[1].status === 'fulfilled') {
        setAllCourses(results[1].value?.data?.data || []);
      } else {
        setAllCourses([]);
        setError('Failed to load courses. Please check your connection and refresh.');
      }

      const courses = results[0].status === 'fulfilled' ? (results[0].value?.data?.data || []) : [];
      if (courses.length > 0) {
        setContinueLearning({
          ...courses[0],
          progress: 65,
          currentLesson: 'Lesson 8: Past Tense',
          totalLessons: 12,
          completedLessons: 8,
        });
      }

      if (results[2].status === 'fulfilled' && results[2].value?.data?.data) {
        const dashboardData = results[2].value.data.data;
        setLearningStats({
          totalLessons: dashboardData.totalLessonsCompleted || 156,
          studyTime: formatStudyTime(dashboardData.totalTimeSpent || 45000),
          coursesEnrolled: dashboardData.totalCoursesEnrolled || 8,
          streak: gamificationStats?.streak || 7,
          xp: gamificationStats?.xp || 2450,
          level: gamificationStats?.level || 12,
        });
      } else {
        setLearningStats({
          totalLessons: 156,
          studyTime: '12h 30m',
          coursesEnrolled: 8,
          streak: 7,
          xp: 2450,
          level: 12,
        });
      }
    } catch (error) {
      console.error('Failed to load learn data:', error);
      setError('Connection error. Please check your internet and refresh.');
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

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    Animated.spring(searchAnim, {
      toValue: showSearch ? 0 : 1,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  };

  const filteredCourses = searchQuery
    ? allCourses.filter(course =>
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCourses;

  const userName = user?.name?.split(' ')[0] || 'Learner';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Bonjour'; // Morning (5 AM - 11:59 AM)
    } else if (hour >= 12 && hour < 18) {
      return 'Bon après-midi'; // Afternoon (12 PM - 5:59 PM)
    } else {
      return 'Bonsoir'; // Evening (6 PM - 4:59 AM)
    }
  };

  const getLevelColor = (level) => {
    // All levels use primary color for consistency
    return theme.primary;
  };

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
                <Text style={[styles.headerBadgeText, { color: theme.primary }]}>LEARN</Text>
                <Text style={styles.headerTitle}>{getGreeting()}, {userName}! 👋</Text>
                <Text style={styles.headerSubtitle}>Continue your French journey</Text>
              </View>

              <TouchableOpacity
                style={[styles.headerActionBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                onPress={toggleSearch}
              >
                <Ionicons name="search" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {learningStats && (
              <View style={[styles.levelCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={styles.levelInfo}>
                  <View style={styles.levelBadgeContainer}>
                    <LinearGradient colors={[theme.primary, theme.primaryLight || theme.primary]} style={styles.levelBadge}>
                      <Text style={styles.levelNumber}>{learningStats.level}</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.levelDetails}>
                    <Text style={styles.levelTitle}>Level {learningStats.level}</Text>
                    <Text style={styles.levelXP}>{learningStats.xp} XP</Text>
                  </View>
                </View>
                <View style={styles.levelProgressContainer}>
                  <View style={[styles.levelProgressTrack, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Animated.View
                      style={[
                        styles.levelProgressFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '65%'],
                          }),
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={[theme.primary, theme.primaryLight || theme.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.levelProgressGradient}
                      />
                    </Animated.View>
                  </View>
                  <Text style={styles.levelProgressText}>650 XP to Level {learningStats.level + 1}</Text>
                </View>
                <View style={[styles.streakBadge, { backgroundColor: theme.primary + '30' }]}>
                  <Ionicons name="flame" size={14} color={theme.primary} />
                  <Text style={[styles.streakText, { color: theme.primary }]}>{learningStats.streak} day streak</Text>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>

      {showSearch && (
        <Animated.View
          style={[
            styles.searchOverlay,
            { backgroundColor: theme.background },
            {
              opacity: searchAnim,
              transform: [{ translateY: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
            },
          ]}
        >
          <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search courses, lessons..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setSearchQuery(''); toggleSearch(); }}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        showsVerticalScrollIndicator={false}
      >

        {continueLearning && (
          <Animated.View
            style={[
              styles.continueSection,
              {
                opacity: cardsAnim,
                transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Continue Learning</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyCourses')}>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.continueCard, { backgroundColor: theme.surface }, themeShadows.lg]}
              onPress={() => navigation.navigate('CourseDetail', { courseId: continueLearning._id })}
              activeOpacity={0.9}
            >
              <Image
                source={getCourseImage(continueLearning._id, 0, continueLearning.category, continueLearning.title)}
                style={styles.continueImage}
              />
              <LinearGradient
                colors={['transparent', theme.primary + '90', theme.primary + 'E6']}
                style={styles.continueOverlay}
              />
              <View style={styles.continueContent}>
                <View style={[styles.continueBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.continueBadgeText}>IN PROGRESS</Text>
                </View>
                <Text style={styles.continueTitle}>{continueLearning.title}</Text>
                <Text style={styles.continueLesson}>{continueLearning.currentLesson}</Text>
                <View style={styles.continueProgress}>
                  <View style={styles.continueProgressTrack}>
                    <LinearGradient
                      colors={[theme.primary, theme.primaryLight || theme.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.continueProgressFill, { width: `${continueLearning.progress}%` }]}
                    />
                  </View>
                  <Text style={styles.continueProgressText}>
                    {continueLearning.completedLessons}/{continueLearning.totalLessons} lessons
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <LinearGradient colors={[theme.primary, theme.primaryLight || theme.primary]} style={styles.playButtonGradient}>
                  <Ionicons name="play" size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        )}

        {learningStats && (
          <View style={styles.section}>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.surface }, themeShadows.sm]}>
                <View style={[styles.statIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name="book" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>{learningStats.totalLessons}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Lessons</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.surface }, themeShadows.sm]}>
                <View style={[styles.statIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name="time" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>{learningStats.studyTime}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Study Time</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.surface }, themeShadows.sm]}>
                <View style={[styles.statIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name="school" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>{learningStats.coursesEnrolled}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Courses</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Browse by Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: selectedCategory === category.id ? theme.primary : theme.surface,
                    borderColor: selectedCategory === category.id ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: selectedCategory === category.id ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {featuredCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Courses</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.coursesScroll}
            >
              {featuredCourses.slice(0, 5).map((course, index) => (
                <FeaturedCourseCard
                  key={course._id || index}
                  course={course}
                  index={index}
                  theme={theme}
                  getLevelColor={getLevelColor}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {searchQuery ? 'Search Results' : 'Explore Courses'}
            </Text>
            <Text style={[styles.courseCount, { color: theme.textSecondary }]}>
              {filteredCourses.length} courses
            </Text>
          </View>
          {filteredCourses.length > 0 ? (
            <View style={styles.coursesGrid}>
              {filteredCourses.slice(0, 6).map((course, index) => (
                <CourseCard
                  key={course._id || index}
                  course={course}
                  index={index}
                  theme={theme}
                  getLevelColor={getLevelColor}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No Courses Found</Text>
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}

          {filteredCourses.length > 6 && (
            <TouchableOpacity
              style={[styles.viewAllBtn, { borderColor: theme.primary }]}
              onPress={() => navigation.navigate('Courses')}
            >
              <Text style={[styles.viewAllBtnText, { color: theme.primary }]}>View All Courses</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.goalBanner, themeShadows.lg]}
            onPress={() => navigation.navigate('Courses')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryLight || theme.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.goalBannerGradient}
            >
              <View style={styles.goalContent}>
                <View style={styles.goalIcon}>
                  <Ionicons name="trophy-outline" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.goalText}>
                  <Text style={styles.goalTitle}>Complete Your Daily Goal</Text>
                  <Text style={styles.goalSubtitle}>Just 2 more lessons to reach your target!</Text>
                </View>
              </View>
              <View style={styles.goalArrow}>
                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function FeaturedCourseCard({ course, index, theme, getLevelColor, onPress }) {
  const imageSource = course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('https'))
    ? { uri: course.thumbnail }
    : getCourseImage(course._id, index, course.category, course.title);

  return (
    <TouchableOpacity
      style={[styles.featuredCard, themeShadows.md]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={imageSource} style={styles.featuredImage} />
      <LinearGradient colors={['transparent', theme.primary + 'E6']} style={styles.featuredOverlay} />
      <View style={styles.featuredContent}>
        <Text style={styles.featuredCategory}>{(course.category || 'FRENCH').toUpperCase()}</Text>
        <Text style={styles.featuredTitle} numberOfLines={2}>{course.title}</Text>
        <View style={styles.featuredMeta}>
          <Text style={styles.featuredRatingText}>★ {course.rating?.average?.toFixed(1) || '4.5'}</Text>
          <View style={[styles.featuredLevel, { backgroundColor: getLevelColor(course.level) }]}>
            <Text style={styles.featuredLevelText}>{course.level || 'All'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CourseCard({ course, index, theme, getLevelColor, onPress }) {
  const imageSource = course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('https'))
    ? { uri: course.thumbnail }
    : getCourseImage(course._id, index, course.category, course.title);

  return (
    <TouchableOpacity
      style={[styles.courseCard, { backgroundColor: theme.surface }, themeShadows.sm]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={imageSource} style={styles.courseImage} />
      <View style={styles.courseContent}>
        <Text style={[styles.courseCategory, { color: theme.primary }]}>
          {(course.category || 'FRENCH').toUpperCase()}
        </Text>
        <Text style={[styles.courseTitle, { color: theme.text }]} numberOfLines={2}>
          {course.title}
        </Text>
        <View style={styles.courseMeta}>
          <Text style={[styles.courseRatingText, { color: theme.primary }]}>
            ★ {course.rating?.average?.toFixed(1) || '4.5'}
          </Text>
          <View style={[styles.courseLevel, { backgroundColor: getLevelColor(course.level) }]}>
            <Text style={styles.courseLevelText}>{course.level || 'All'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
    marginBottom: 16,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelBadgeContainer: {},
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  levelDetails: {},
  levelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  levelXP: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  levelProgressContainer: {
    flex: 1,
    minWidth: 120,
  },
  levelProgressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  levelProgressGradient: {
    flex: 1,
  },
  levelProgressText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  continueSection: {
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
  courseCount: {
    fontSize: 14,
  },
  continueCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
  },
  continueImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  continueOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  continueContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
  },
  continueBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  continueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  continueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  continueLesson: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  continueProgress: {
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
    borderRadius: 2,
  },
  continueProgressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  playButton: {
    position: 'absolute',
    right: 18,
    bottom: 18,
  },
  playButtonGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  categoriesScroll: {
    gap: 10,
    paddingTop: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  coursesScroll: {
    gap: 14,
  },
  featuredCard: {
    width: 260,
    height: 170,
    borderRadius: 18,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
  },
  featuredCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuredLevel: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featuredLevelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  courseCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 100,
  },
  courseContent: {
    padding: 12,
  },
  courseCategory: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 17,
    height: 34,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseRatingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  courseLevel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  courseLevelText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  viewAllBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 14,
  },
  viewAllBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
  },
  goalBanner: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  goalBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  goalIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  goalSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  goalArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
