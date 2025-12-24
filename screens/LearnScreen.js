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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { coursesAPI, progressAPI } from '../src/services/api';
import { getCourseImage } from '../src/utils/courseImages';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

export default function LearnScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const gamificationContext = useGamification();
  const gamificationStats = gamificationContext?.stats || {};
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [learningStats, setLearningStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [continueLearning, setContinueLearning] = useState(null);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const categories = [
    { id: null, name: 'All', icon: 'apps', color: '#6366F1' },
    { id: 'french', name: 'French', icon: 'flag', color: '#EF4444' },
    { id: 'grammar', name: 'Grammar', icon: 'school', color: '#10B981' },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'book', color: '#F59E0B' },
    { id: 'conversation', name: 'Speaking', icon: 'chatbubbles', color: '#EC4899' },
  ];

  // Learning paths
  const learningPaths = [
    {
      id: 'beginner',
      title: 'Beginner Path',
      subtitle: 'Start from zero',
      icon: 'rocket',
      gradient: ['#10B981', '#059669'],
      courses: 12,
      hours: 24,
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      subtitle: 'Level up skills',
      icon: 'trending-up',
      gradient: ['#F59E0B', '#D97706'],
      courses: 15,
      hours: 36,
    },
    {
      id: 'advanced',
      title: 'Advanced',
      subtitle: 'Master French',
      icon: 'diamond',
      gradient: ['#8B5CF6', '#7C3AED'],
      courses: 10,
      hours: 48,
    },
  ];

  useEffect(() => {
    loadData();
    // Entrance animations
    Animated.stagger(100, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const params = selectedCategory ? { category: selectedCategory } : {};
      const [featuredResponse, coursesResponse, progressResponse] = await Promise.all([
        coursesAPI.getFeatured().catch(() => ({ data: { data: [] } })),
        coursesAPI.getAll({ ...params, limit: 20 }).catch(() => ({ data: { data: [] } })),
        isAuthenticated ? progressAPI.getDashboard().catch(() => null) : Promise.resolve(null),
      ]);

      setFeaturedCourses(featuredResponse.data.data || []);
      setAllCourses(coursesResponse.data.data || []);

      // Set continue learning course
      if (featuredCourses.length > 0) {
        setContinueLearning({
          ...featuredCourses[0],
          progress: 65,
          currentLesson: 'Lesson 8: Past Tense',
          totalLessons: 12,
          completedLessons: 8,
        });
      }

      if (progressResponse?.data?.data) {
        const dashboardData = progressResponse.data.data;
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
            ? ['#0F172A', '#1E3A5F', '#1E40AF']
            : ['#DBEAFE', '#BFDBFE', '#93C5FD']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Decorative Elements */}
          <View style={styles.headerDecor}>
            <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.2)' }]} />
            <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)' }]} />
          </View>

          <View style={styles.headerContent}>
            {/* Top Row */}
            <View style={styles.headerTopRow}>
              <View style={styles.headerTitleSection}>
                <View style={styles.headerBadge}>
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerBadgeGradient}
                  >
                    <Ionicons name="book" size={14} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.headerBadgeText, { color: isDarkMode ? '#93C5FD' : '#1D4ED8' }]}>
                    LEARN
                  </Text>
                </View>
                <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#1E3A8A' }]}>
                  Bonjour, {userName}! 👋
                </Text>
                <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#94A3B8' : '#3B82F6' }]}>
                  Continue your French journey
                </Text>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={[styles.headerActionBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(59,130,246,0.1)' }]}
                  onPress={toggleSearch}
                >
                  <Ionicons name="search" size={22} color={isDarkMode ? '#FFFFFF' : '#3B82F6'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.headerActionBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(59,130,246,0.1)' }]}
                  onPress={() => navigation.navigate('Profile')}
                >
                  {user?.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
                  ) : (
                    <Ionicons name="person" size={22} color={isDarkMode ? '#FFFFFF' : '#3B82F6'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Level Progress */}
            {learningStats && (
              <View style={[styles.levelCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)' }]}>
                <View style={styles.levelInfo}>
                  <View style={styles.levelBadgeContainer}>
                    <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.levelBadge}>
                      <Text style={styles.levelNumber}>{learningStats.level}</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.levelDetails}>
                    <Text style={[styles.levelTitle, { color: colors.text }]}>Level {learningStats.level}</Text>
                    <Text style={[styles.levelXP, { color: colors.secondaryText }]}>{learningStats.xp} XP</Text>
                  </View>
                </View>
                <View style={styles.levelProgressContainer}>
                  <View style={[styles.levelProgressTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
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
                        colors={['#3B82F6', '#2563EB']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.levelProgressGradient}
                      />
                    </Animated.View>
                  </View>
                  <Text style={[styles.levelProgressText, { color: colors.secondaryText }]}>650 XP to Level {learningStats.level + 1}</Text>
                </View>
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={16} color="#F97316" />
                  <Text style={[styles.streakText, { color: '#F97316' }]}>{learningStats.streak} day streak</Text>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Search Overlay */}
      {showSearch && (
        <Animated.View
          style={[
            styles.searchOverlay,
            { backgroundColor: colors.background },
            {
              opacity: searchAnim,
              transform: [{ translateY: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
            },
          ]}
        >
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.secondaryText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search courses, lessons..."
              placeholderTextColor={colors.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setSearchQuery(''); toggleSearch(); }}>
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Continue Learning Card */}
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Continue Learning</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyCourses')}>
                <Text style={[styles.seeAllText, { color: '#3B82F6' }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.continueCard, { backgroundColor: colors.card }, premiumShadows.lg]}
              onPress={() => navigation.navigate('CourseDetail', { courseId: continueLearning._id })}
              activeOpacity={0.9}
            >
              <Image
                source={getCourseImage(continueLearning._id, 0, continueLearning.category, continueLearning.title)}
                style={styles.continueImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.continueOverlay}
              />
              <View style={styles.continueContent}>
                <View style={styles.continueBadge}>
                  <Ionicons name="play-circle" size={14} color="#FFFFFF" />
                  <Text style={styles.continueBadgeText}>IN PROGRESS</Text>
                </View>
                <Text style={styles.continueTitle}>{continueLearning.title}</Text>
                <Text style={styles.continueLesson}>{continueLearning.currentLesson}</Text>
                <View style={styles.continueProgress}>
                  <View style={styles.continueProgressTrack}>
                    <View style={[styles.continueProgressFill, { width: `${continueLearning.progress}%` }]} />
                  </View>
                  <Text style={styles.continueProgressText}>
                    {continueLearning.completedLessons}/{continueLearning.totalLessons} lessons
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.playButtonGradient}>
                  <Ionicons name="play" size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Quick Stats */}
        {learningStats && (
          <View style={styles.section}>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <View style={[styles.statIcon, { backgroundColor: '#3B82F6' + '15' }]}>
                  <Ionicons name="book" size={20} color="#3B82F6" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{learningStats.totalLessons}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Lessons</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <View style={[styles.statIcon, { backgroundColor: '#10B981' + '15' }]}>
                  <Ionicons name="time" size={20} color="#10B981" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{learningStats.studyTime}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Study Time</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <View style={[styles.statIcon, { backgroundColor: '#F59E0B' + '15' }]}>
                  <Ionicons name="library" size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{learningStats.coursesEnrolled}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Courses</Text>
              </View>
            </View>
          </View>
        )}

        {/* Learning Paths */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Learning Paths</Text>
            <View style={styles.sectionBadge}>
              <Ionicons name="map" size={14} color="#3B82F6" />
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pathsScroll}
          >
            {learningPaths.map((path) => (
              <TouchableOpacity
                key={path.id}
                style={[styles.pathCard, { backgroundColor: colors.card }, premiumShadows.md]}
                onPress={() => navigation.navigate('Courses', { level: path.id })}
                activeOpacity={0.85}
              >
                <LinearGradient colors={path.gradient} style={styles.pathGradient}>
                  <Ionicons name={path.icon} size={28} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.pathTitle, { color: colors.text }]}>{path.title}</Text>
                <Text style={[styles.pathSubtitle, { color: colors.secondaryText }]}>{path.subtitle}</Text>
                <View style={styles.pathMeta}>
                  <View style={styles.pathMetaItem}>
                    <Ionicons name="book-outline" size={12} color={path.gradient[0]} />
                    <Text style={[styles.pathMetaText, { color: path.gradient[0] }]}>{path.courses} courses</Text>
                  </View>
                  <View style={styles.pathMetaItem}>
                    <Ionicons name="time-outline" size={12} color={colors.secondaryText} />
                    <Text style={[styles.pathMetaText, { color: colors.secondaryText }]}>{path.hours}h</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse by Category</Text>
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
                    backgroundColor: selectedCategory === category.id ? category.color : colors.card,
                    borderColor: selectedCategory === category.id ? category.color : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={selectedCategory === category.id ? '#FFFFFF' : category.color}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: selectedCategory === category.id ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Courses */}
        {featuredCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Courses</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
                <Text style={[styles.seeAllText, { color: '#3B82F6' }]}>See All</Text>
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
                  colors={colors}
                  isDarkMode={isDarkMode}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {searchQuery ? 'Search Results' : 'Explore Courses'}
            </Text>
            <Text style={[styles.courseCount, { color: colors.secondaryText }]}>
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
                  colors={colors}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Courses Found</Text>
              <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
          
          {filteredCourses.length > 6 && (
            <TouchableOpacity
              style={[styles.viewAllBtn, { borderColor: '#3B82F6' }]}
              onPress={() => navigation.navigate('Courses')}
            >
              <Text style={[styles.viewAllBtnText, { color: '#3B82F6' }]}>View All Courses</Text>
              <Ionicons name="arrow-forward" size={18} color="#3B82F6" />
            </TouchableOpacity>
          )}
        </View>

        {/* Daily Goal Banner */}
        <View style={styles.section}>
          <LinearGradient
            colors={isDarkMode ? ['#1E3A5F', '#1E40AF'] : ['#DBEAFE', '#BFDBFE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.goalBanner, premiumShadows.lg]}
          >
            <View style={styles.goalContent}>
              <View style={styles.goalIcon}>
                <Ionicons name="trophy" size={32} color="#3B82F6" />
              </View>
              <View style={styles.goalText}>
                <Text style={[styles.goalTitle, { color: isDarkMode ? '#FFFFFF' : '#1E3A8A' }]}>
                  Complete Your Daily Goal
                </Text>
                <Text style={[styles.goalSubtitle, { color: isDarkMode ? '#94A3B8' : '#3B82F6' }]}>
                  Just 2 more lessons to reach your target!
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.goalBtn}
              onPress={() => navigation.navigate('Courses')}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.goalBtnGradient}
              >
                <Text style={styles.goalBtnText}>Start Learning</Text>
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

// Featured Course Card Component
function FeaturedCourseCard({ course, index, colors, isDarkMode, onPress }) {
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
      style={[styles.featuredCard, premiumShadows.md]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={imageSource} style={styles.featuredImage} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.featuredOverlay} />
      <View style={styles.featuredContent}>
        {course.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="diamond" size={10} color="#FFFFFF" />
            <Text style={styles.premiumBadgeText}>PRO</Text>
          </View>
        )}
        <Text style={styles.featuredCategory}>{(course.category || 'FRENCH').toUpperCase()}</Text>
        <Text style={styles.featuredTitle} numberOfLines={2}>{course.title}</Text>
        <View style={styles.featuredMeta}>
          <View style={styles.featuredRating}>
            <Ionicons name="star" size={12} color="#FCD34D" />
            <Text style={styles.featuredRatingText}>{course.rating?.average?.toFixed(1) || '4.5'}</Text>
          </View>
          <View style={[styles.featuredLevel, { backgroundColor: getLevelColor(course.level) }]}>
            <Text style={styles.featuredLevelText}>{course.level || 'All'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
      style={[styles.courseCard, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={imageSource} style={styles.courseImage} />
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
    marginBottom: spacing.md,
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
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
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
    overflow: 'hidden',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  levelCard: {
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  levelXP: {
    fontSize: 11,
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
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(249,115,22,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.full,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  continueSection: {
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
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  courseCount: {
    fontSize: fontSize.sm,
  },
  continueCard: {
    borderRadius: premiumBorderRadius.xl,
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
  continueTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  continueLesson: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.sm,
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
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  continueProgressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  playButton: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
  playButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    alignItems: 'center',
    ...premiumShadows.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  pathsScroll: {
    gap: spacing.sm,
  },
  pathCard: {
    width: 140,
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    alignItems: 'center',
  },
  pathGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pathTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  pathSubtitle: {
    fontSize: 11,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  pathMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pathMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  pathMetaText: {
    fontSize: 10,
    fontWeight: '500',
  },
  categoriesScroll: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  categoryPillText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  coursesScroll: {
    gap: spacing.md,
  },
  featuredCard: {
    width: 280,
    height: 180,
    borderRadius: premiumBorderRadius.xl,
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
    padding: spacing.md,
  },
  premiumBadge: {
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
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuredCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredRatingText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuredLevel: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
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
    gap: spacing.sm,
  },
  courseCard: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    borderRadius: premiumBorderRadius.lg,
    overflow: 'hidden',
    ...premiumShadows.sm,
  },
  courseImage: {
    width: '100%',
    height: 100,
  },
  courseContent: {
    padding: spacing.sm,
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
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1.5,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  viewAllBtnText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    fontSize: fontSize.sm,
  },
  goalBanner: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(59,130,246,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: fontSize.sm,
  },
  goalBtn: {
    borderRadius: premiumBorderRadius.lg,
    overflow: 'hidden',
  },
  goalBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  goalBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
