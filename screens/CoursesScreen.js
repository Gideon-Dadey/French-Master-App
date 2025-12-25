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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CoursesScreen({ navigation, route }) {
  const { colors, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [filters, setFilters] = useState({
    category: route.params?.category || null,
    level: null,
    language: null,
    price: null,
  });

  useEffect(() => {
    if (route.params?.category !== undefined) {
      setFilters(prev => {

        if (prev.category !== route.params.category) {
          return { ...prev, category: route.params.category };
        }
        return prev;
      });
    }
  }, [route.params?.category]);

  useEffect(() => {
    loadCourses();
  }, [filters]);

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
        limit: 100,
      };
      Object.keys(params).forEach(key =>
        params[key] === null || params[key] === undefined ? delete params[key] : {}
      );

      const response = await coursesAPI.getAll(params);
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
      setError('Failed to load courses. Please check your connection.');
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filters, refreshing]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourses();
  }, [loadCourses]);

  const clearFilters = () => {
    setFilters({ category: null, level: null, language: null, price: null });
    setSearchQuery('');
  };

  const activeFiltersCount = Object.values(filters).filter(f => f !== null).length;

  const getLevelColor = (level) => {
    const levelLower = (level || '').toLowerCase();
    switch (levelLower) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#2196F3';
    }
  };

  const renderCourseCard = ({ item: course, index }) => {
    const imageSource = course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('https'))
      ? { uri: course.thumbnail }
      : getCourseImage(course._id || course.id, index, course.category || course.language, course.title);

    const levelColor = getLevelColor(course.level);
    const isPremium = course.isPremium || course.price > 0;

    return (
      <TouchableOpacity
        style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.lg]}
        onPress={() => navigation.navigate('CourseDetail', { courseId: course._id || course.id })}
        activeOpacity={0.9}
      >

        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={index % 2 === 0
              ? ['#FFD700', '#FFA500']
              : ['#4A90E2', '#357ABD']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bannerLeft}
          >
            <View style={styles.bannerContent}>
              <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
                <Text style={styles.levelBadgeText}>{course.level || 'All'}</Text>
              </View>
              {isPremium && (
                <View style={[styles.certifiedBadge, { backgroundColor: '#FF0000' }]}>
                  <Text style={styles.certifiedText}>CERTIFIED</Text>
                </View>
              )}
              <Text style={styles.bannerTitle} numberOfLines={2}>
                {course.title}
              </Text>
              {course.shortDescription && (
                <Text style={styles.bannerSubtitle} numberOfLines={2}>
                  {course.shortDescription}
                </Text>
              )}
            </View>
          </LinearGradient>
          <View style={styles.bannerRight}>
            <Image source={imageSource} style={styles.bannerImage} resizeMode="cover" />
          </View>
        </View>

        <View style={styles.courseDetails}>
          <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
            {course.title}
          </Text>
          <Text style={[styles.courseDescription, { color: colors.secondaryText }]} numberOfLines={2}>
            {course.shortDescription || course.description || 'Learn French professionally'}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <Rating
                rating={course.rating?.average || 0}
                size={14}
                showRating={true}
              />
              <View style={styles.studentsRow}>
                <Ionicons name="people-outline" size={14} color={colors.secondaryText} />
                <Text style={[styles.studentsText, { color: colors.secondaryText }]}>
                  {course.studentsEnrolled || 0}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
            <View style={styles.durationRow}>
              <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
              <Text style={[styles.durationText, { color: colors.secondaryText }]}>
                {course.duration || '12h'}
              </Text>
              <Ionicons name="book-outline" size={14} color={colors.secondaryText} style={styles.durationIcon} />
              <Text style={[styles.lessonsText, { color: colors.secondaryText }]}>
                {course.lessonsCount || 0} lessons
              </Text>
            </View>
            <Text style={[styles.priceText, { color: premiumColors.primary.main }]}>
              {course.isFree ? 'FREE' : formatCurrency(course.price || 150, 'GHS')}
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <LinearGradient
        colors={isDarkMode
          ? ['#1a0a2e', '#16213e', '#0f3460']
          : ['#E8EAF6', '#F3E5F5', '#E1BEE7']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#424242'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>Courses</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.exploreSection}>
          <Text style={[styles.exploreTitle, { color: colors.text }]}>Explore Courses</Text>
          <Text style={[styles.exploreSubtitle, { color: colors.secondaryText }]}>
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
          </Text>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}>
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

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="filter"
              size={18}
              color={activeFiltersCount > 0 ? premiumColors.primary.main : colors.secondaryText}
            />
            <Text style={[
              styles.filterButtonText,
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
        </View>

        <Text style={[styles.resultsCount, { color: colors.secondaryText }]}>
          {courses.length} {courses.length === 1 ? 'result' : 'results'}
        </Text>

        {showFilters && (
          <View style={[styles.filtersPanel, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>

              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupLabel, { color: colors.secondaryText }]}>Category</Text>
                <View style={styles.filterChipsRow}>
                  {['french', 'english', 'exam-prep'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: filters.category === cat ? premiumColors.primary.main : colors.border,
                        }
                      ]}
                      onPress={() => setFilters({ ...filters, category: filters.category === cat ? null : cat })}
                    >
                      <Text style={[
                        styles.filterChipText,
                        { color: filters.category === cat ? '#FFFFFF' : colors.text }
                      ]}>
                        {cat === 'exam-prep' ? 'Exam Prep' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupLabel, { color: colors.secondaryText }]}>Level</Text>
                <View style={styles.filterChipsRow}>
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
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
                        {level.charAt(0).toUpperCase() + level.slice(1)}
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
          </View>
        )}

        {courses.length === 0 ? (
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
          <View style={styles.coursesList}>
            {courses.map((course, index) => (
              <View key={course._id || course.id || index}>
                {renderCourseCard({ item: course, index })}
              </View>
            ))}
          </View>
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
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  exploreSection: {
    marginBottom: spacing.lg,
  },
  exploreTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  exploreSubtitle: {
    fontSize: fontSize.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.xs,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: premiumBorderRadius.base,
    borderWidth: 1,
    gap: spacing.xs,
  },
  filterButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
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
  viewModeButtonActive: {

  },
  resultsCount: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.md,
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
  coursesList: {
    gap: spacing.md,
  },
  courseCard: {
    borderRadius: premiumBorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  bannerContainer: {
    flexDirection: 'row',
    height: 180,
  },
  bannerLeft: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  bannerContent: {
    flex: 1,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.base,
    marginBottom: spacing.xs,
  },
  levelBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  certifiedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.sm,
    marginBottom: spacing.xs,
  },
  certifiedText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs / 2,
  },
  bannerSubtitle: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.9)',
  },
  bannerRight: {
    width: 120,
    height: '100%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  courseDetails: {
    padding: spacing.md,
  },
  courseTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  courseDescription: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  metaRow: {
    marginBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  studentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  studentsText: {
    fontSize: fontSize.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  durationText: {
    fontSize: fontSize.sm,
  },
  durationIcon: {
    marginLeft: spacing.sm,
  },
  lessonsText: {
    fontSize: fontSize.sm,
  },
  priceText: {
    fontSize: fontSize.lg,
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
