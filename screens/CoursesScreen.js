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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { coursesAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import { spacing, fontSize, normalize } from '../src/utils/responsive';
import { useTheme } from '../src/context/ThemeContext';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import { getCourseImage } from '../src/utils/courseImages';
import { formatCurrency } from '../src/utils/helpers';
import Rating from '../src/components/Rating';
import { useCurrency } from '../src/context/CurrencyContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', icon: 'time-outline' },
  { value: 'rating', label: 'Highest Rated', icon: 'star' },
  { value: 'popular', label: 'Most Popular', icon: 'trending-up' },
  { value: 'price-low', label: 'Price: Low to High', icon: 'arrow-up' },
  { value: 'price-high', label: 'Price: High to Low', icon: 'arrow-down' },
];

const CATEGORIES = [
  { value: null, label: 'All Courses', icon: 'apps' },
  { value: 'french', label: 'French', icon: 'language' },
  { value: 'english', label: 'English', icon: 'school' },
  { value: 'exam-prep', label: 'Exam Prep', icon: 'document-text' },
  { value: 'business', label: 'Business', icon: 'briefcase' },
  { value: 'conversation', label: 'Conversation', icon: 'chatbubbles' },
  { value: 'grammar', label: 'Grammar', icon: 'book' },
];

export default function CoursesScreen({ navigation, route }) {
  const { colors, isDarkMode } = useTheme();
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedSort, setSelectedSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || null);
  const searchTimeoutRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [filters, setFilters] = useState({
    category: route.params?.category || null,
    level: null,
    language: null,
    price: null,
    minRating: null,
  });

  useEffect(() => {
    if (route.params?.category !== undefined) {
      setFilters(prev => {
        if (prev.category !== route.params.category) {
          return { ...prev, category: route.params.category };
        }
        return prev;
      });
      setSelectedCategory(route.params.category);
    }
  }, [route.params?.category]);

  useEffect(() => {
    loadCourses();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [filters, selectedSort]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length === 0 || searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        loadCourses();
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const loadCourses = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const params = {
        search: searchQuery || undefined,
        category: filters.category || undefined,
        level: filters.level || undefined,
        language: filters.language || undefined,
        isFree: filters.price === 'free' ? 'true' : filters.price === 'paid' ? 'false' : undefined,
        sort: selectedSort,
        limit: 100,
      };
      Object.keys(params).forEach(key =>
        params[key] === null || params[key] === undefined ? delete params[key] : {}
      );

      const response = await coursesAPI.getAll(params);
      const allCourses = response.data.data || [];
      
      // Separate featured courses
      const featured = allCourses.filter(c => c.featured).slice(0, 3);
      const regular = allCourses.filter(c => !c.featured);
      
      setFeaturedCourses(featured);
      setCourses(regular);
    } catch (error) {
      console.error('Failed to load courses:', error);
      setError('Failed to load courses. Please check your connection.');
      setCourses([]);
      setFeaturedCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filters, selectedSort, refreshing]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourses();
  }, [loadCourses]);

  const clearFilters = () => {
    setFilters({ category: null, level: null, language: null, price: null, minRating: null });
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const activeFiltersCount = Object.values(filters).filter(f => f !== null).length;

  const getLevelColor = (level) => {
    const levelLower = (level || '').toLowerCase();
    switch (levelLower) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#3B82F6';
    }
  };

  const renderFeaturedCourse = ({ item: course, index }) => {
    const imageSource = course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('https'))
      ? { uri: course.thumbnail }
      : getCourseImage(course._id || course.id, index, course.category || course.language, course.title);

    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => navigation.navigate('CourseDetail', { courseId: course._id || course.id })}
        activeOpacity={0.9}
      >
        <Image source={imageSource} style={styles.featuredImage} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>
          <Text style={styles.featuredTitle} numberOfLines={2}>{course.title}</Text>
          <View style={styles.featuredMeta}>
            <Rating rating={course.rating?.average || 0} size={14} showRating={true} />
            <Text style={styles.featuredStudents}>{course.studentsEnrolled || 0} students</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderListCourseCard = ({ item: course, index }) => {
    const imageSource = course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('https'))
      ? { uri: course.thumbnail }
      : getCourseImage(course._id || course.id, index, course.category || course.language, course.title);

    const levelColor = getLevelColor(course.level);

    return (
      <TouchableOpacity
        style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.lg]}
        onPress={() => navigation.navigate('CourseDetail', { courseId: course._id || course.id })}
        activeOpacity={0.9}
      >
        <View style={styles.listCardContent}>
          <Image source={imageSource} style={styles.listCardImage} resizeMode="cover" />
          <View style={styles.listCardInfo}>
            <View style={styles.listCardHeader}>
              <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
                <Text style={styles.levelBadgeText}>{course.level || 'All'}</Text>
              </View>
              {course.featured && (
                <View style={styles.featuredTag}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                </View>
              )}
            </View>
            <Text style={[styles.listCardTitle, { color: colors.text }]} numberOfLines={2}>
              {course.title}
            </Text>
            <Text style={[styles.listCardDescription, { color: colors.secondaryText }]} numberOfLines={2}>
              {course.shortDescription || course.description || 'Learn professionally'}
            </Text>
            <View style={styles.listCardMeta}>
              <Rating rating={course.rating?.average || 0} size={14} showRating={true} />
              <View style={styles.listCardMetaItem}>
                <Ionicons name="people-outline" size={14} color={colors.secondaryText} />
                <Text style={[styles.listCardMetaText, { color: colors.secondaryText }]}>
                  {course.studentsEnrolled || 0}
                </Text>
              </View>
              <View style={styles.listCardMetaItem}>
                <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
                <Text style={[styles.listCardMetaText, { color: colors.secondaryText }]}>
                  {course.duration || 0}h
                </Text>
              </View>
            </View>
            <View style={[styles.listCardFooter, { borderTopColor: colors.border }]}>
              <View style={styles.listCardLessons}>
                <Ionicons name="book-outline" size={14} color={colors.secondaryText} />
                <Text style={[styles.listCardMetaText, { color: colors.secondaryText }]}>
                  {course.totalLessons || 0} lessons
                </Text>
              </View>
              <Text style={[styles.listCardPrice, { color: premiumColors.primary.main }]}>
                {course.isFree ? 'FREE' : formatPrice ? formatPrice(course.price) : formatCurrency(course.price || 150, 'GHS')}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGridCourseCard = ({ item: course, index }) => {
    const imageSource = course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('https'))
      ? { uri: course.thumbnail }
      : getCourseImage(course._id || course.id, index, course.category || course.language, course.title);

    const levelColor = getLevelColor(course.level);

    return (
      <TouchableOpacity
        style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}
        onPress={() => navigation.navigate('CourseDetail', { courseId: course._id || course.id })}
        activeOpacity={0.9}
      >
        <View style={styles.gridCardImageContainer}>
          <Image source={imageSource} style={styles.gridCardImage} resizeMode="cover" />
          <View style={styles.gridCardOverlay}>
            <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
              <Text style={styles.levelBadgeText}>{course.level || 'All'}</Text>
            </View>
            {course.featured && (
              <View style={styles.featuredTag}>
                <Ionicons name="star" size={12} color="#FFD700" />
              </View>
            )}
          </View>
        </View>
        <View style={styles.gridCardContent}>
          <Text style={[styles.gridCardTitle, { color: colors.text }]} numberOfLines={2}>
            {course.title}
          </Text>
          <Text style={[styles.gridCardDescription, { color: colors.secondaryText }]} numberOfLines={2}>
            {course.shortDescription || course.description || 'Learn professionally'}
          </Text>
          <View style={styles.gridCardMeta}>
            <Rating rating={course.rating?.average || 0} size={12} showRating={true} />
            <View style={styles.gridCardMetaItem}>
              <Ionicons name="people-outline" size={12} color={colors.secondaryText} />
              <Text style={[styles.gridCardMetaText, { color: colors.secondaryText }]}>
                {course.studentsEnrolled || 0}
              </Text>
            </View>
          </View>
          <View style={[styles.gridCardFooter, { borderTopColor: colors.border }]}>
            <View style={styles.gridCardInfo}>
              <Ionicons name="time-outline" size={12} color={colors.secondaryText} />
              <Text style={[styles.gridCardMetaText, { color: colors.secondaryText }]}>
                {course.duration || 0}h
              </Text>
            </View>
            <Text style={[styles.gridCardPrice, { color: premiumColors.primary.main }]}>
              {course.isFree ? 'FREE' : formatPrice ? formatPrice(course.price) : formatCurrency(course.price || 150, 'GHS')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && courses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error && courses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorMessage message={error} onRetry={loadCourses} />
      </View>
    );
  }

  const allCourses = [...featuredCourses, ...courses];
  const displayCourses = searchQuery || activeFiltersCount > 0 ? allCourses : courses;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDarkMode
          ? ['#1a0a2e', '#16213e', '#0f3460']
          : ['#667eea', '#764ba2', '#f093fb']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Explore Courses</Text>
            <Text style={styles.headerSubtitle}>
              {displayCourses.length} {displayCourses.length === 1 ? 'course' : 'courses'} available
            </Text>
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
        {/* Search Bar */}
        <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search courses, topics, instructors..."
              placeholderTextColor={colors.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Category Tabs */}
        <Animated.View style={[styles.categoryContainer, { opacity: fadeAnim }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value || 'all'}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategory === cat.value
                      ? premiumColors.primary.main
                      : colors.card,
                    borderColor: selectedCategory === cat.value
                      ? premiumColors.primary.main
                      : colors.border,
                  },
                  premiumShadows.sm
                ]}
                onPress={() => {
                  setSelectedCategory(cat.value);
                  setFilters({ ...filters, category: cat.value });
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={selectedCategory === cat.value ? '#FFFFFF' : colors.secondaryText}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: selectedCategory === cat.value ? '#FFFFFF' : colors.text }
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Featured Courses */}
        {featuredCourses.length > 0 && !searchQuery && activeFiltersCount === 0 && (
          <Animated.View style={[styles.featuredSection, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Courses</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
                  Handpicked courses for you
                </Text>
              </View>
            </View>
            <FlatList
              data={featuredCourses}
              renderItem={renderFeaturedCourse}
              keyExtractor={(item) => item._id || item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </Animated.View>
        )}

        {/* Controls Row */}
        <Animated.View style={[styles.controlsRow, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="filter"
              size={18}
              color={activeFiltersCount > 0 ? premiumColors.primary.main : colors.secondaryText}
            />
            <Text style={[
              styles.controlButtonText,
              { color: activeFiltersCount > 0 ? premiumColors.primary.main : colors.secondaryText }
            ]}>
              Filters
            </Text>
            {activeFiltersCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: premiumColors.primary.main }]}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}
            onPress={() => setShowSort(!showSort)}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-vertical" size={18} color={colors.secondaryText} />
            <Text style={[styles.controlButtonText, { color: colors.secondaryText }]}>
              {SORT_OPTIONS.find(s => s.value === selectedSort)?.label || 'Sort'}
            </Text>
          </TouchableOpacity>

          <View style={[styles.viewModeToggle, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'list' && [styles.viewModeButtonActive, { backgroundColor: premiumColors.primary.main }]
              ]}
              onPress={() => setViewMode('list')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="list"
                size={18}
                color={viewMode === 'list' ? '#FFFFFF' : colors.secondaryText}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'grid' && [styles.viewModeButtonActive, { backgroundColor: premiumColors.primary.main }]
              ]}
              onPress={() => setViewMode('grid')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="grid"
                size={18}
                color={viewMode === 'grid' ? '#FFFFFF' : colors.secondaryText}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Sort Options */}
        {showSort && (
          <Animated.View style={[styles.sortPanel, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  selectedSort === option.value && { backgroundColor: premiumColors.primary.main + '20' }
                ]}
                onPress={() => {
                  setSelectedSort(option.value);
                  setShowSort(false);
                }}
              >
                <Ionicons
                  name={option.icon}
                  size={18}
                  color={selectedSort === option.value ? premiumColors.primary.main : colors.secondaryText}
                />
                <Text style={[
                  styles.sortOptionText,
                  {
                    color: selectedSort === option.value ? premiumColors.primary.main : colors.text,
                    fontWeight: selectedSort === option.value ? '700' : '500'
                  }
                ]}>
                  {option.label}
                </Text>
                {selectedSort === option.value && (
                  <Ionicons name="checkmark" size={18} color={premiumColors.primary.main} />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <Animated.View style={[styles.filtersPanel, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupLabel, { color: colors.secondaryText }]}>Level</Text>
                <View style={styles.filterChipsRow}>
                  {['beginner', 'intermediate', 'advanced', 'all-levels'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: filters.level === level ? premiumColors.primary.main : colors.border,
                        }
                      ]}
                      onPress={() => setFilters({ ...filters, level: filters.level === level ? null : level })}
                    >
                      <Text style={[
                        styles.filterChipText,
                        { color: filters.level === level ? '#FFFFFF' : colors.text }
                      ]}>
                        {level === 'all-levels' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupLabel, { color: colors.secondaryText }]}>Language</Text>
                <View style={styles.filterChipsRow}>
                  {['french', 'english'].map((lang) => (
                    <TouchableOpacity
                      key={lang}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: filters.language === lang ? premiumColors.primary.main : colors.border,
                        }
                      ]}
                      onPress={() => setFilters({ ...filters, language: filters.language === lang ? null : lang })}
                    >
                      <Text style={[
                        styles.filterChipText,
                        { color: filters.language === lang ? '#FFFFFF' : colors.text }
                      ]}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupLabel, { color: colors.secondaryText }]}>Price</Text>
                <View style={styles.filterChipsRow}>
                  {['free', 'paid'].map((price) => (
                    <TouchableOpacity
                      key={price}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: filters.price === price ? premiumColors.primary.main : colors.border,
                        }
                      ]}
                      onPress={() => setFilters({ ...filters, price: filters.price === price ? null : price })}
                    >
                      <Text style={[
                        styles.filterChipText,
                        { color: filters.price === price ? '#FFFFFF' : colors.text }
                      ]}>
                        {price.charAt(0).toUpperCase() + price.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {activeFiltersCount > 0 && (
                <TouchableOpacity
                  style={[styles.clearAllButton, { backgroundColor: premiumColors.error + '20' }]}
                  onPress={clearFilters}
                >
                  <Ionicons name="close-circle" size={18} color={premiumColors.error} />
                  <Text style={[styles.clearAllText, { color: premiumColors.error }]}>Clear All</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </Animated.View>
        )}

        {/* Results Count */}
        <Text style={[styles.resultsCount, { color: colors.secondaryText }]}>
          {displayCourses.length} {displayCourses.length === 1 ? 'result' : 'results'} found
        </Text>

        {/* Courses List/Grid */}
        {displayCourses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={80} color={colors.secondaryText} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Courses Found</Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your search or filters'
                : 'No courses available at the moment'}
            </Text>
            {(searchQuery || activeFiltersCount > 0) && (
              <TouchableOpacity
                style={[styles.clearSearchButton, { backgroundColor: premiumColors.primary.main }, premiumShadows.md]}
                onPress={clearFilters}
              >
                <Text style={styles.clearSearchButtonText}>Clear Search & Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {viewMode === 'list' ? (
              <FlatList
                key="list-view"
                data={displayCourses}
                renderItem={renderListCourseCard}
                keyExtractor={(item) => item._id || item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
              />
            ) : (
              <FlatList
                key="grid-view"
                data={displayCourses}
                renderItem={renderGridCourseCard}
                keyExtractor={(item) => item._id || item.id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.gridRow}
                ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
              />
            )}
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
  header: {
    paddingTop: 50,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs / 2,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.xl,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.xs,
  },
  categoryContainer: {
    marginBottom: spacing.lg,
  },
  categoryScroll: {
    paddingRight: spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  categoryChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  featuredSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
  },
  featuredList: {
    paddingRight: spacing.lg,
  },
  featuredCard: {
    width: SCREEN_WIDTH * 0.75,
    height: 200,
    borderRadius: premiumBorderRadius.xl,
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    padding: spacing.md,
    justifyContent: 'flex-end',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.base,
    marginBottom: spacing.sm,
    gap: spacing.xs / 2,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  featuredTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featuredStudents: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.sm,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: premiumBorderRadius.base,
    borderWidth: 1,
    gap: spacing.xs,
    flex: 1,
  },
  controlButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  filterBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  viewModeToggle: {
    flexDirection: 'row',
    borderRadius: premiumBorderRadius.base,
    borderWidth: 1,
    padding: 2,
  },
  viewModeButton: {
    padding: spacing.sm,
    borderRadius: premiumBorderRadius.sm,
  },
  viewModeButtonActive: {},
  sortPanel: {
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.sm,
  },
  sortOptionText: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  filtersPanel: {
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  filtersContent: {
    gap: spacing.md,
  },
  filterGroup: {
    marginRight: spacing.lg,
  },
  filterGroupLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.full,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.full,
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  clearAllText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  listCard: {
    borderRadius: premiumBorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listCardContent: {
    flexDirection: 'row',
  },
  listCardImage: {
    width: 140,
    height: 140,
  },
  listCardInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.base,
  },
  levelBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  featuredTag: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    padding: 4,
    borderRadius: premiumBorderRadius.sm,
  },
  listCardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  listCardDescription: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  listCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  listCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  listCardMetaText: {
    fontSize: fontSize.sm,
  },
  listCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  listCardLessons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  listCardPrice: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridCard: {
    width: CARD_WIDTH,
    borderRadius: premiumBorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  gridCardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  gridCardImage: {
    width: '100%',
    height: '100%',
  },
  gridCardOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gridCardContent: {
    padding: spacing.md,
  },
  gridCardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  gridCardDescription: {
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  gridCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  gridCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  gridCardMetaText: {
    fontSize: fontSize.xs,
  },
  gridCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  gridCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  gridCardPrice: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  clearSearchButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: premiumBorderRadius.lg,
  },
  clearSearchButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
