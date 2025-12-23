import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { coursesAPI, blogAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { getCourseImage } from '../src/utils/courseImages';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';

const { width } = Dimensions.get('window');

export default function LearnerHomeScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topCourses, setTopCourses] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories] = useState([
    'French',
    'English',
    'Grammar',
    'Vocabulary',
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      const [coursesResponse, postsResponse] = await Promise.all([
        coursesAPI.getFeatured().catch(() => ({ data: { data: [] } })),
        blogAPI.getAll({ limit: 5 }).catch(() => ({ data: { data: [] } })),
      ]);

      setTopCourses(coursesResponse.data.data || []);
      setRecentPosts(postsResponse.data.data || []);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return 'Recently';
  };

  const getLevelColor = (level) => {
    const levelLower = (level || '').toLowerCase();
    switch (levelLower) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const formatStudentCount = (count) => {
    if (!count) return '0';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const renderCourseCard = (course, index) => {
    const imageSource = course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('https'))
      ? { uri: course.thumbnail }
      : getCourseImage(course._id || course.id, index);

    const isBestseller = course.studentsEnrolled > 1000;
    const isNew = course.publishedAt && new Date(course.publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const isPremium = course.isPremium || course.price > 0;
    const levelColor = getLevelColor(course.level);
    const instructorName = course.instructor?.name || 'Expert Instructor';
    const hasDiscount = course.originalPrice && course.originalPrice > course.price;
    const discountPercent = hasDiscount 
      ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
      : 0;

    return (
      <TouchableOpacity
        key={course._id || course.id}
        style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}
        onPress={() => navigation.navigate('CourseDetail', { courseId: course._id || course.id })}
        activeOpacity={0.9}
      >
        <View style={styles.courseImageContainer}>
          <Image
            source={imageSource}
            style={styles.courseImage}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />

          {/* Play Button Overlay */}
          {course.previewVideo && (
            <View style={styles.playButtonOverlay}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={24} color="#FFFFFF" />
              </View>
            </View>
          )}

          {/* Top Badges */}
          <View style={styles.topBadges}>
            {isBestseller && (
              <View style={[styles.badge, styles.bestsellerBadge]}>
                <Ionicons name="trophy" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>Bestseller</Text>
              </View>
            )}
            {isNew && !isBestseller && (
              <View style={[styles.badge, styles.newBadge]}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            )}
            {isPremium && (
              <View style={[styles.badge, styles.premiumBadge]}>
                <Ionicons name="diamond" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>Premium</Text>
              </View>
            )}
            {hasDiscount && (
              <View style={[styles.badge, styles.discountBadge]}>
                <Text style={styles.badgeText}>-{discountPercent}%</Text>
              </View>
            )}
          </View>

          {/* Level Badge */}
          <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
            <Text style={styles.levelText}>{course.level || 'Advanced'}</Text>
          </View>
        </View>

        <View style={styles.courseContent}>
          <Text style={[styles.courseCategory, { color: colors.primary }]}>
            {course.category?.toUpperCase() || 'FRENCH'}
          </Text>
          
          <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
            {course.title || 'Backend development with NestJS'}
          </Text>

          {/* Instructor Row */}
          <View style={styles.instructorRow}>
            <View style={[styles.instructorAvatar, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person" size={12} color={colors.primary} />
            </View>
            <Text style={[styles.instructorName, { color: colors.secondaryText }]} numberOfLines={1}>
              {instructorName}
            </Text>
          </View>

          {/* Meta Row */}
          <View style={styles.courseMeta}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFB703" />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {course.rating?.average?.toFixed(1) || '4.5'}
              </Text>
              {course.rating?.count > 0 && (
                <Text style={[styles.ratingCount, { color: colors.secondaryText }]}>
                  ({course.rating.count})
                </Text>
              )}
            </View>
            
            {course.studentsEnrolled > 0 && (
              <View style={styles.studentsRow}>
                <Ionicons name="people" size={14} color={colors.secondaryText} />
                <Text style={[styles.studentsText, { color: colors.secondaryText }]}>
                  {formatStudentCount(course.studentsEnrolled)}
                </Text>
              </View>
            )}
          </View>

          {/* Price Row */}
          <View style={styles.priceRow}>
            {course.price === 0 || course.price === null ? (
              <View style={styles.freeBadge}>
                <Text style={[styles.freeText, { color: premiumColors.success }]}>FREE</Text>
              </View>
            ) : (
              <>
                {hasDiscount && (
                  <Text style={[styles.originalPrice, { color: colors.secondaryText }]}>
                    ${course.originalPrice}
                  </Text>
                )}
                <Text style={[styles.price, { color: colors.primary }]}>
                  ${course.price}
                </Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPostCard = (post, index) => {
    // Create a blackboard-like thumbnail for posts
    const postImage = post.thumbnail && (post.thumbnail.startsWith('http') || post.thumbnail.startsWith('https'))
      ? { uri: post.thumbnail }
      : require('../assets/about.jpeg'); // Fallback image

    return (
      <TouchableOpacity
        key={post._id || post.id || index}
        style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('BlogDetail', { postId: post._id || post.id })}
        activeOpacity={0.8}
      >
        <Image
          source={postImage}
          style={styles.postImage}
          resizeMode="cover"
        />
        <View style={styles.postContent}>
          <Text style={[styles.postTitle, { color: colors.text }]} numberOfLines={2}>
            {post.title || 'Mathematical equation with LaTeX expression'}
          </Text>
          <Text style={[styles.postReadTime, { color: colors.secondaryText }]}>
            {post.readTime || '1'} min read
          </Text>
          <View style={styles.postMeta}>
            <View style={styles.postMetaItem}>
              <Ionicons name="calendar-outline" size={12} color={colors.secondaryText} />
              <Text style={[styles.postMetaText, { color: colors.secondaryText }]}>
                {formatTimeAgo(post.createdAt)}
              </Text>
            </View>
            <View style={styles.postMetaItem}>
              <Ionicons name="eye-outline" size={12} color={colors.secondaryText} />
              <Text style={[styles.postMetaText, { color: colors.secondaryText }]}>
                {post.views || '19'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  // Theme-aware gradient colors
  const headerGradientColors = isDarkMode
    ? ['#1a0a2e', '#16213e', '#0f3460'] // Dark purple-blue gradient
    : ['#E8EAF6', '#F3E5F5', '#E1BEE7']; // Light purple gradient

  const appNameColor = isDarkMode ? '#BB86FC' : '#9C27B0'; // Purple that works in both themes

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={headerGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={[styles.appName, { color: appNameColor }]}>FRENCH MASTER GH</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={isDarkMode ? '#FFFFFF' : '#424242'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={toggleTheme}
            >
              <Ionicons 
                name={isDarkMode ? 'sunny-outline' : 'moon-outline'} 
                size={24} 
                color={isDarkMode ? '#FFFFFF' : '#424242'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={[styles.searchHeading, { color: colors.text }]}>
            What do you want to learn?
          </Text>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Browse courses..."
              placeholderTextColor={colors.secondaryText}
              onFocus={() => navigation.navigate('Courses')}
            />
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
              <Text style={[styles.seeAllText, { color: '#2196F3' }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.categoryTag, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('Courses', { category: category.toLowerCase() })}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryText, { color: colors.text }]}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Top Courses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top courses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
              <Text style={[styles.seeAllText, { color: '#2196F3' }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coursesContainer}
          >
            {topCourses.length > 0 ? (
              topCourses.map((course, index) => renderCourseCard(course, index))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="book-outline" size={48} color={colors.secondaryText} />
                <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
                  No courses available
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Recent Posts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent posts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BlogList')}>
              <Text style={[styles.seeAllText, { color: '#2196F3' }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.postsContainer}
          >
            {recentPosts.length > 0 ? (
              recentPosts.map((post, index) => renderPostCard(post, index))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={colors.secondaryText} />
                <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
                  No posts available
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Bottom spacing */}
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerIcon: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  searchHeading: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
    gap: spacing.sm,
  },
  categoryTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  coursesContainer: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
  },
  courseCard: {
    width: 300,
    borderRadius: premiumBorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  courseImageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  courseImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...premiumShadows.lg,
  },
  topBadges: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    zIndex: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs / 2,
    ...premiumShadows.sm,
  },
  bestsellerBadge: {
    backgroundColor: '#F59E0B',
  },
  newBadge: {
    backgroundColor: '#4CAF50',
  },
  premiumBadge: {
    backgroundColor: premiumColors.primary.main,
  },
  discountBadge: {
    backgroundColor: '#E53935',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  levelBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.base,
    ...premiumShadows.sm,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
  courseContent: {
    padding: spacing.md,
  },
  courseCategory: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  courseTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
    lineHeight: 22,
    minHeight: 44,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  instructorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructorName: {
    fontSize: fontSize.xs,
    flex: 1,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  ratingCount: {
    fontSize: fontSize.xs,
    marginLeft: 2,
  },
  studentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  studentsText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  freeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.base,
    backgroundColor: premiumColors.success + '20',
  },
  freeText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  originalPrice: {
    fontSize: fontSize.sm,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  postsContainer: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
  },
  postCard: {
    width: 280,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  postImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#1a1a1a',
  },
  postContent: {
    padding: spacing.md,
  },
  postTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
    lineHeight: 20,
    minHeight: 40,
  },
  postReadTime: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  postMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  postMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  postMetaText: {
    fontSize: fontSize.xs,
  },
  emptyState: {
    width: width - spacing.lg * 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
});
