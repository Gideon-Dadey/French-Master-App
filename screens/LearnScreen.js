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
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { coursesAPI, progressAPI } from '../src/services/api';
import { getCourseImage } from '../src/utils/courseImages';
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

export default function LearnScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode, organicColors: theme } = useTheme();
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
  const [totalCoursesCount, setTotalCoursesCount] = useState(0);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([...Array(10)].map(() => new Animated.Value(0))).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  const categories = [
    { id: null, name: 'All', icon: 'apps-outline' },
    { id: 'video-masterclass', name: 'Masterclasses', icon: 'play-circle-outline' },
    { id: 'french', name: 'French', icon: 'flag-outline' },
    { id: 'grammar', name: 'Grammar', icon: 'school-outline' },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'book-outline' },
    { id: 'conversation', name: 'Speaking', icon: 'chatbubbles-outline' },
  ];

  useEffect(() => {
    loadData();
    startAnimations();
  }, [selectedCategory]);

  const startAnimations = () => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.stagger(80, cardAnims.map(anim =>
      Animated.spring(anim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true })
    )).start();
  };

  const loadData = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      const params = selectedCategory ? { category: selectedCategory } : {};

      const results = await Promise.allSettled([
        coursesAPI.getFeatured(),
        coursesAPI.getAll({ ...params, limit: 20 }),
        selectedCategory
          ? coursesAPI.getAll({ category: selectedCategory, limit: 1 })
          : coursesAPI.getAll({ limit: 1 }),
        isAuthenticated ? progressAPI.getDashboard() : Promise.resolve(null),
      ]);

      if (results[0].status === 'fulfilled') {
        setFeaturedCourses(results[0].value?.data?.data || []);
      }

      if (results[1].status === 'fulfilled') {
        setAllCourses(results[1].value?.data?.data || []);
      } else {
        setError('Failed to load courses. Please check your connection.');
      }

      if (results[2].status === 'fulfilled') {
        setTotalCoursesCount(results[2].value?.data?.total || 0);
      }

      if (results[3].status === 'fulfilled' && results[3].value?.data?.data) {
        const dashboardData = results[3].value.data.data;
        setLearningStats({
          totalLessons: dashboardData.totalLessonsCompleted || 0,
          studyTime: formatStudyTime(dashboardData.totalTimeSpent || 0),
          coursesEnrolled: dashboardData.totalCoursesEnrolled || 0,
          streak: gamificationStats?.streak || 0,
          xp: gamificationStats?.xp || 0,
          level: gamificationStats?.level || 1,
        });
      } else {
        // Mock stats for display if no data
        setLearningStats({
          totalLessons: 12,
          studyTime: '2h 15m',
          coursesEnrolled: 3,
          streak: gamificationStats?.streak || 0,
          xp: gamificationStats?.xp || 0,
          level: gamificationStats?.level || 1,
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

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const getLevelColor = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'beginner') return theme.success;
    if (l === 'intermediate') return theme.secondary;
    if (l === 'advanced') return theme.primary;
    return theme.accent;
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <BackgroundBlur style={{ top: -100, right: -50 }} color={theme.primary} size={400} />
      <BackgroundBlur style={{ bottom: 100, left: -100 }} color={theme.secondary} size={350} />

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
          <Text style={[styles.navTitle, { color: theme.text }]}>Explore Courses</Text>
          <TouchableOpacity onPress={toggleSearch}>
            <Ionicons name="search" size={22} color={theme.text} />
          </TouchableOpacity>
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
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroBadge, { color: theme.primary }]}>DISCOVER</Text>
              <Text style={[styles.heroTitle, { color: theme.text }]}>Master French</Text>
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>Find the perfect course for your level</Text>
            </View>
            <TouchableOpacity
              style={[styles.searchToggle, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}
              onPress={toggleSearch}
            >
              <Ionicons name="search" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {showSearch && (
            <Animated.View style={[
              styles.searchBar,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                opacity: searchAnim,
                transform: [{ scale: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }]
              }
            ]}>
              <Ionicons name="search-outline" size={20} color={theme.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search courses..."
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </Animated.View>

        {/* Categories */}
        <Animated.View style={{ opacity: cardAnims[0], transform: [{ translateY: cardAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((cat, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategory === cat.id ? theme.primary : theme.surface,
                    borderColor: selectedCategory === cat.id ? theme.primary : theme.border,
                  },
                  themeShadows.sm
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon}
                  size={18}
                  color={selectedCategory === cat.id ? '#FFFFFF' : theme.textSecondary}
                />
                <Text style={[
                  styles.categoryText,
                  { color: selectedCategory === cat.id ? '#FFFFFF' : theme.text }
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Featured Section */}
        {!selectedCategory && featuredCourses.length > 0 && (
          <Animated.View style={[styles.section, { opacity: cardAnims[1], transform: [{ translateY: cardAnims[1].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.titleAccent, { backgroundColor: theme.primary }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Learning</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
            >
              {featuredCourses.map((course, idx) => (
                <PremiumCourseCard
                  key={course._id || idx}
                  course={course}
                  theme={theme}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                  isFeatured
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Course List */}
        <Animated.View style={[styles.section, { opacity: cardAnims[2], transform: [{ translateY: cardAnims[2].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.titleAccent, { backgroundColor: theme.secondary }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.name}` : 'All Courses'}
              </Text>
            </View>
            <Text style={[styles.resultsCount, { color: theme.textMuted }]}>
              {filteredCourses.length} {filteredCourses.length === 1 ? 'result' : 'results'}
            </Text>
          </View>

          <View style={styles.coursesGrid}>
            {filteredCourses.map((course, idx) => (
              <PremiumCourseCard
                key={course._id || idx}
                course={course}
                theme={theme}
                index={idx}
                onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
              />
            ))}
          </View>

          {filteredCourses.length === 0 && (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconBg, { backgroundColor: theme.primary + '10' }]}>
                <Ionicons name="search-outline" size={40} color={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No courses found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Try adjusting your search or filters</Text>
            </View>
          )}
        </Animated.View>

        {/* Stats Summary */}
        <Animated.View style={[styles.section, { opacity: cardAnims[3], transform: [{ translateY: cardAnims[3].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <View style={[styles.statsBanner, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.md]}>
            <LinearGradient
              colors={[theme.primary + '10', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: theme.text }]}>{learningStats?.totalLessons || '0'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: theme.text }]}>{learningStats?.level || '1'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Current Level</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: theme.text }]}>{learningStats?.streak || '0'}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
}

function PremiumCourseCard({ course, theme, onPress, isFeatured = false, index = 0 }) {
  const isVideoMasterclass = course.category === 'video-masterclass';

  // Robust image source determination
  const imageSource = (course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('https')))
    ? { uri: course.thumbnail }
    : getCourseImage(course._id, index, course.category, course.title);

  return (
    <TouchableOpacity
      style={[
        isFeatured ? styles.featuredCard : styles.gridCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
        themeShadows.sm
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={isFeatured ? styles.featuredImageContainer : styles.gridImageContainer}>
        <Image
          source={imageSource}
          style={styles.courseImg}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.cardLevel, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <Text style={styles.cardLevelText}>{course.level || 'Beginner'}</Text>
        </View>

        {isVideoMasterclass && (
          <View style={styles.videoBadge}>
            <Ionicons name="play" size={12} color="#FFFFFF" />
            <Text style={styles.videoBadgeText}>VIDEO</Text>
          </View>
        )}
      </View>

      <View style={styles.cardInfo}>
        <Text style={[styles.cardCategory, { color: theme.primary }]}>
          {(course.category || 'French').toUpperCase()}
        </Text>
        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
          {course.title}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
              {course.rating?.average?.toFixed(1) || '4.8'}
            </Text>
          </View>
          <Text style={[styles.priceTag, { color: theme.text }]}>
            {course.price === 0 ? 'FREE' : `GHS ${course.price}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  searchToggle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  categoriesScroll: {
    paddingRight: 22,
    paddingBottom: 4,
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  featuredScroll: {
    paddingRight: 22,
    gap: 16,
  },
  featuredCard: {
    width: width * 0.72,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  featuredImageContainer: {
    height: 160,
  },
  gridCard: {
    width: (width - 60) / 2,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gridImageContainer: {
    height: 120,
  },
  courseImg: {
    width: '100%',
    height: '100%',
  },
  cardLevel: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardLevelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cardInfo: {
    padding: 14,
  },
  cardCategory: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    height: 40,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 10,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priceTag: {
    fontSize: 12,
    fontWeight: '800',
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 22,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    opacity: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
});
