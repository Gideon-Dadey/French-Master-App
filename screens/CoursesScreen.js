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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { coursesAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import CourseCard from '../src/components/CourseCard';
import SearchAutocomplete from '../src/components/SearchAutocomplete';
import { CourseCardSkeleton } from '../src/components/SkeletonLoader';
import { spacing, fontSize, normalize } from '../src/utils/responsive';
import { useResponsive } from '../src/hooks/useResponsive';
import { useTheme } from '../src/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CoursesScreen({ navigation }) {
  const responsive = useResponsive();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [filters, setFilters] = useState({
    category: null,
    level: null,
    language: null,
    price: null, // 'free' or 'paid'
  });

  useEffect(() => {
    loadCourses();
  }, [filters]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Only search if query is empty or has at least 2 characters
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // Convert price filter to isFree parameter
        isFree: filters.price === 'free' ? 'true' : filters.price === 'paid' ? 'false' : undefined,
      };
      // Remove null/undefined values
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

  const handleSearch = useCallback(() => {
    loadCourses();
  }, [loadCourses]);

  const clearFilters = () => {
    setFilters({ category: null, level: null, language: null, price: null });
    setSearchQuery('');
  };

  const activeFiltersCount = Object.values(filters).filter(f => f !== null).length;

  const renderCourseCard = ({ item: course, index }) => (
    <CourseCard
      course={course}
      index={index}
      onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
      style={viewMode === 'grid' && responsive.isTablet ? styles.gridCard : null}
    />
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </View>
  );

  if (loading && courses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Courses</Text>
        </View>
        {renderSkeleton()}
      </View>
    );
  }

  if (error && courses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Courses</Text>
        </View>
        <ErrorMessage message={error} onRetry={loadCourses} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Explore Courses</Text>
        <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
          {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
        </Text>
      </View>

      {/* Search Bar - Professional Design */}
      <View style={[styles.searchSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.tertiaryBackground || colors.border }]}>
          <Ionicons name="search" size={22} color={colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search courses, topics, instructors..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => { 
                setSearchQuery('');
                if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                loadCourses();
              }}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>

        {/* View Mode Toggle & Filter Button */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.tertiaryBackground || colors.border }]}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="filter" 
              size={20} 
              color={activeFiltersCount > 0 ? colors.primary : colors.secondaryText} 
            />
            <Text style={[
              styles.filterButtonText,
              { color: activeFiltersCount > 0 ? colors.primary : colors.secondaryText }
            ]}>
              Filters
            </Text>
            {activeFiltersCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={[styles.viewModeToggle, { backgroundColor: colors.tertiaryBackground || colors.border }]}>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'list' && [styles.viewModeButtonActive, { backgroundColor: colors.card }]]}
              onPress={() => setViewMode('list')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="list" 
                size={20} 
                color={viewMode === 'list' ? colors.primary : colors.secondaryText} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeButton, viewMode === 'grid' && [styles.viewModeButtonActive, { backgroundColor: colors.card }]]}
              onPress={() => setViewMode('grid')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="grid" 
                size={20} 
                color={viewMode === 'grid' ? colors.primary : colors.secondaryText} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <View style={[styles.filtersPanel, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {/* Category Filters */}
            <View style={styles.filterGroup}>
              <Text style={[styles.filterGroupLabel, { color: colors.secondaryText }]}>Category</Text>
              <View style={styles.filterChipsRow}>
                {['french', 'english', 'exam-prep'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterChip,
                      { 
                        backgroundColor: filters.category === cat ? colors.primary : (colors.tertiaryBackground || colors.border),
                        borderColor: filters.category === cat ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => setFilters({ 
                      ...filters, 
                      category: filters.category === cat ? null : cat 
                    })}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterChipText,
                      { color: filters.category === cat ? '#fff' : colors.text }
                    ]}>
                      {cat === 'exam-prep' ? 'Exam Prep' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Level Filters */}
            <View style={styles.filterGroup}>
              <Text style={[styles.filterGroupLabel, { color: colors.secondaryText }]}>Level</Text>
              <View style={styles.filterChipsRow}>
                {['beginner', 'intermediate', 'advanced', 'all-levels'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.filterChip,
                      { 
                        backgroundColor: filters.level === level ? colors.primary : (colors.tertiaryBackground || colors.border),
                        borderColor: filters.level === level ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => setFilters({ 
                      ...filters, 
                      level: filters.level === level ? null : level 
                    })}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterChipText,
                      { color: filters.level === level ? '#fff' : colors.text }
                    ]}>
                      {level === 'all-levels' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Language Filter */}
            <View style={styles.filterGroup}>
              <Text style={[styles.filterGroupLabel, { color: colors.secondaryText }]}>Language</Text>
              <View style={styles.filterChipsRow}>
                {['french', 'english'].map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.filterChip,
                      { 
                        backgroundColor: filters.language === lang ? colors.primary : (colors.tertiaryBackground || colors.border),
                        borderColor: filters.language === lang ? colors.primary : colors.border,
                      }
                    ]}
                    onPress={() => setFilters({ 
                      ...filters, 
                      language: filters.language === lang ? null : lang 
                    })}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterChipText,
                      { color: filters.language === lang ? '#fff' : colors.text }
                    ]}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Filter */}
            <View style={styles.filterGroup}>
              <Text style={[styles.filterGroupLabel, { color: colors.secondaryText }]}>Price</Text>
              <View style={styles.filterChipsRow}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    { 
                      backgroundColor: filters.price === 'free' ? colors.primary : (colors.tertiaryBackground || colors.border),
                      borderColor: filters.price === 'free' ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setFilters({ 
                    ...filters, 
                    price: filters.price === 'free' ? null : 'free' 
                  })}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="gift-outline" 
                    size={16} 
                    color={filters.price === 'free' ? '#fff' : colors.secondaryText} 
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[
                    styles.filterChipText,
                    { color: filters.price === 'free' ? '#fff' : colors.text }
                  ]}>
                    Free
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    { 
                      backgroundColor: filters.price === 'paid' ? colors.primary : (colors.tertiaryBackground || colors.border),
                      borderColor: filters.price === 'paid' ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setFilters({ 
                    ...filters, 
                    price: filters.price === 'paid' ? null : 'paid' 
                  })}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="card-outline" 
                    size={16} 
                    color={filters.price === 'paid' ? '#fff' : colors.secondaryText} 
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[
                    styles.filterChipText,
                    { color: filters.price === 'paid' ? '#fff' : colors.text }
                  ]}>
                    Paid
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <TouchableOpacity 
                style={[styles.clearAllButton, { backgroundColor: colors.error + '20', borderColor: colors.error + '40' }]}
                onPress={clearFilters}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={18} color={colors.error} />
                <Text style={[styles.clearAllText, { color: colors.error }]}>Clear All</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {/* Courses List/Grid */}
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
              style={[styles.clearSearchButton, { backgroundColor: colors.primary }]}
              onPress={clearFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.clearSearchButtonText}>Clear Search & Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item._id}
          numColumns={viewMode === 'grid' && responsive.isTablet ? 2 : 1}
          contentContainerStyle={[
            styles.coursesList,
            viewMode === 'grid' && responsive.isTablet && styles.gridList
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsCount, { color: colors.secondaryText }]}>
                {courses.length} {courses.length === 1 ? 'result' : 'results'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    fontWeight: '400',
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: normalize(48),
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    gap: spacing.xs,
  },
  filterButtonText: {
    fontSize: fontSize.md,
    fontWeight: '500',
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
    fontWeight: '600',
  },
  viewModeToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    padding: spacing.sm,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filtersPanel: {
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
    maxHeight: 200,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  filterGroup: {
    marginRight: spacing.xl,
  },
  filterGroupLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
  },
  clearAllText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  coursesList: {
    padding: spacing.lg,
  },
  gridList: {
    paddingHorizontal: spacing.md,
  },
  gridCard: {
    flex: 1,
    margin: spacing.sm,
    maxWidth: (SCREEN_WIDTH - spacing.lg * 3) / 2,
  },
  resultsHeader: {
    marginBottom: spacing.md,
  },
  resultsCount: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  skeletonContainer: {
    padding: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  clearSearchButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
