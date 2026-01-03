import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  FlatList,
  Dimensions,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { coursesAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import { useTheme } from '../src/context/ThemeContext';
import { themeShadows } from '../src/utils/organicTheme';
import { getCourseImage } from '../src/utils/courseImages';
import Rating from '../src/components/Rating';
import { useCurrency } from '../src/context/CurrencyContext';

const { width } = Dimensions.get('window');

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', icon: 'time-outline' },
  { value: 'rating', label: 'Top Rated', icon: 'star' },
  { value: 'popular', label: 'Popular', icon: 'trending-up' },
];

const CATEGORIES = [
  { value: null, label: 'All', icon: 'apps' },
  { value: 'video-masterclass', label: 'Video', icon: 'play-circle' },
  { value: 'french', label: 'French', icon: 'language' },
  { value: 'grammar', label: 'Grammar', icon: 'book' },
  { value: 'conversation', label: 'Speaking', icon: 'chatbubbles' },
];

export default function CoursesScreen({ navigation, route }) {
  const { isDarkMode, organicColors: theme } = useTheme();
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || null);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const searchTimeoutRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Premium colors
  const navyColor = isDarkMode ? '#FFFFFF' : '#1E3A5F';
  const goldColor = '#C9A227';
  const surfaceColor = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const mutedColor = isDarkMode ? '#8E8E93' : '#6B7280';

  useEffect(() => {
    if (route.params?.category !== undefined) {
      setSelectedCategory(route.params.category);
    }
  }, [route.params?.category]);

  useEffect(() => {
    loadCourses();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [selectedCategory, selectedSort]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (searchQuery.length === 0 || searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => loadCourses(), 400);
    }
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  const loadCourses = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const params = {
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        sort: selectedSort,
        limit: 100,
      };
      Object.keys(params).forEach(key => params[key] == null && delete params[key]);

      const response = await coursesAPI.getAll(params);
      const allCourses = response.data.data || [];
      const featured = allCourses.filter(c => c.featured).slice(0, 4);
      const regular = allCourses.filter(c => !c.featured);
      setFeaturedCourses(featured);
      setCourses(regular);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError('Unable to load courses');
      setCourses([]);
      setFeaturedCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedCategory, selectedSort, refreshing]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourses();
  }, [loadCourses]);

  const getLevelColor = (level) => {
    switch ((level || '').toLowerCase()) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6366F1';
    }
  };

  // Premium Featured Card
  const renderFeaturedCard = ({ item: course, index }) => {
    const imageSource = course.thumbnail?.startsWith('http')
      ? { uri: course.thumbnail }
      : getCourseImage(course._id || course.id, index, course.category, course.title);

    return (
      <TouchableOpacity
        style={[styles.featuredCard, themeShadows.lg]}
        onPress={() => navigation.navigate('CourseDetail', { courseId: course._id || course.id })}
        activeOpacity={0.95}
      >
        <Image source={imageSource} style={styles.featuredImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top Badge */}
        <View style={styles.featuredTopBadge}>
          <BlurView intensity={25} tint="dark" style={styles.featuredLevelBadge}>
            <Ionicons name="star" size={12} color={goldColor} />
            <Text style={styles.featuredLevelText}>FEATURED</Text>
          </BlurView>
        </View>

        {/* Bottom Content */}
        <View style={styles.featuredBottom}>
          <Text style={styles.featuredCategory}>
            {(course.category || 'MASTERCLASS').toUpperCase()}
          </Text>
          <Text style={styles.featuredTitle} numberOfLines={2}>{course.title}</Text>
          <View style={styles.featuredMeta}>
            <View style={styles.featuredMetaItem}>
              <Ionicons name="people" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.featuredMetaText}>{course.studentsEnrolled || 0}</Text>
            </View>
            <View style={styles.featuredMetaItem}>
              <Ionicons name="star" size={14} color={goldColor} />
              <Text style={styles.featuredMetaText}>{course.rating?.average?.toFixed(1) || '4.8'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Premium Course Card
  const renderCourseCard = ({ item: course, index }) => {
    const imageSource = course.thumbnail?.startsWith('http')
      ? { uri: course.thumbnail }
      : getCourseImage(course._id || course.id, index, course.category, course.title);
    const levelColor = getLevelColor(course.level);

    return (
      <TouchableOpacity
        style={[styles.courseCard, { backgroundColor: surfaceColor, borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }, themeShadows.md]}
        onPress={() => navigation.navigate('CourseDetail', { courseId: course._id || course.id })}
        activeOpacity={0.95}
      >
        <View style={styles.courseImageContainer}>
          <Image source={imageSource} style={styles.courseImage} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFill} />
          <View style={[styles.courseLevelBadge, { backgroundColor: levelColor }]}>
            <Text style={styles.courseLevelText}>{(course.level || 'All').toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.courseContent}>
          <View style={styles.courseHeader}>
            <Text style={[styles.courseCategory, { color: goldColor }]}>
              {(course.category || 'Course').toUpperCase()}
            </Text>
            <View style={styles.courseRating}>
              <Ionicons name="star" size={12} color={goldColor} />
              <Text style={[styles.courseRatingText, { color: theme.text }]}>
                {course.rating?.average?.toFixed(1) || '4.8'}
              </Text>
            </View>
          </View>

          <Text style={[styles.courseTitle, { color: theme.text }]} numberOfLines={2}>
            {course.title}
          </Text>

          <View style={styles.courseFooter}>
            <View style={styles.courseStats}>
              <View style={styles.courseStat}>
                <Ionicons name="people-outline" size={14} color={mutedColor} />
                <Text style={[styles.courseStatText, { color: mutedColor }]}>
                  {course.studentsEnrolled || 0}
                </Text>
              </View>
              <View style={styles.courseStat}>
                <Ionicons name="time-outline" size={14} color={mutedColor} />
                <Text style={[styles.courseStatText, { color: mutedColor }]}>
                  {course.duration || 0}h
                </Text>
              </View>
            </View>
            <View style={[styles.courseAction, { backgroundColor: goldColor }]}>
              <Ionicons name="arrow-forward" size={14} color="#1E3A5F" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && courses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error && courses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ErrorMessage message={error} onRetry={loadCourses} />
      </View>
    );
  }

  const allCourses = [...featuredCourses, ...courses];
  const displayCourses = searchQuery || selectedCategory ? allCourses : courses;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Premium Header */}
      <View style={[styles.header, { backgroundColor: '#1E3A5F' }]}>
        <LinearGradient
          colors={['rgba(201, 162, 39, 0.15)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleArea}>
            <Text style={styles.headerLabel}>EXPLORE</Text>
            <Text style={styles.headerTitle}>Courses</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{allCourses.length}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={goldColor} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: surfaceColor, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }, themeShadows.sm]}>
          <Ionicons name="search" size={20} color={mutedColor} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search courses..."
            placeholderTextColor={mutedColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={mutedColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value || 'all'}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: selectedCategory === cat.value ? '#1E3A5F' : surfaceColor,
                  borderColor: selectedCategory === cat.value ? '#1E3A5F' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
                },
              ]}
              onPress={() => setSelectedCategory(cat.value)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  { color: selectedCategory === cat.value ? '#FFF' : theme.text },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Section */}
        {featuredCourses.length > 0 && !searchQuery && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured</Text>
              <Text style={[styles.sectionSubtitle, { color: mutedColor }]}>Handpicked for you</Text>
            </View>
            <FlatList
              data={featuredCourses}
              renderItem={renderFeaturedCard}
              keyExtractor={(item) => item._id || item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}
              snapToInterval={width * 0.78 + 16}
              decelerationRate="fast"
            />
          </Animated.View>
        )}

        {/* Sort & Results */}
        <View style={styles.controlsRow}>
          <Text style={[styles.resultsText, { color: mutedColor }]}>
            {displayCourses.length} courses
          </Text>
          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: surfaceColor, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
            onPress={() => setShowSortPanel(!showSortPanel)}
          >
            <Ionicons name="swap-vertical" size={16} color={mutedColor} />
            <Text style={[styles.sortButtonText, { color: theme.text }]}>
              {SORT_OPTIONS.find(s => s.value === selectedSort)?.label}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sort Panel */}
        {showSortPanel && (
          <View style={[styles.sortPanel, { backgroundColor: surfaceColor, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }, themeShadows.md]}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.sortOption, selectedSort === option.value && { backgroundColor: goldColor + '15' }]}
                onPress={() => { setSelectedSort(option.value); setShowSortPanel(false); }}
              >
                <Ionicons name={option.icon} size={18} color={selectedSort === option.value ? goldColor : mutedColor} />
                <Text style={[styles.sortOptionText, { color: selectedSort === option.value ? goldColor : theme.text }]}>
                  {option.label}
                </Text>
                {selectedSort === option.value && <Ionicons name="checkmark" size={18} color={goldColor} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Course List */}
        {displayCourses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: goldColor + '15' }]}>
              <Ionicons name="book-outline" size={48} color={goldColor} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Courses Found</Text>
            <Text style={[styles.emptyText, { color: mutedColor }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          <Animated.View style={[styles.coursesList, { opacity: fadeAnim }]}>
            {displayCourses.map((course, index) => (
              <View key={course._id || course.id || index}>
                {renderCourseCard({ item: course, index })}
              </View>
            ))}
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitleArea: {
    flex: 1,
  },
  headerLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerBadge: {
    backgroundColor: '#C9A227',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerBadgeText: {
    color: '#1E3A5F',
    fontSize: 14,
    fontWeight: '900',
  },
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  // Categories
  categoryScroll: {
    marginBottom: 24,
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Sections
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  // Featured Cards
  featuredScroll: {
    paddingRight: 20,
  },
  featuredCard: {
    width: width * 0.78,
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 16,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredTopBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  featuredLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  featuredLevelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featuredBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  featuredCategory: {
    color: '#C9A227',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  featuredTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featuredMetaText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  // Controls
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sortPanel: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 12,
  },
  sortOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  // Course Cards
  coursesList: {
    gap: 16,
  },
  courseCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  courseImageContainer: {
    height: 140,
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  courseLevelBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  courseLevelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  courseContent: {
    padding: 18,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseCategory: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  courseRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courseRatingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseStats: {
    flexDirection: 'row',
    gap: 16,
  },
  courseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  courseStatText: {
    fontSize: 13,
    fontWeight: '600',
  },
  courseAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
