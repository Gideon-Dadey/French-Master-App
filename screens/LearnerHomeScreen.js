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

  const renderCourseCard = (course, index) => {
    const imageSource = course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('https'))
      ? { uri: course.thumbnail }
      : getCourseImage(course._id || course.id, index);

    return (
      <TouchableOpacity
        key={course._id || course.id}
        style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('CourseDetail', { courseId: course._id || course.id })}
        activeOpacity={0.8}
      >
        <Image
          source={imageSource}
          style={styles.courseImage}
          resizeMode="cover"
        />
        <View style={styles.courseContent}>
          <Text style={[styles.courseCategory, { color: colors.primary }]}>
            {course.category || 'Development'}
          </Text>
          <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
            {course.title || 'Backend development with NestJS'}
          </Text>
          <View style={styles.courseMeta}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFB703" />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {course.rating?.average?.toFixed(1) || '4.5'}
              </Text>
            </View>
            <View style={styles.difficultyRow}>
              <Ionicons name="bar-chart-outline" size={14} color={colors.secondaryText} />
              <Text style={[styles.difficultyText, { color: colors.secondaryText }]}>
                {course.level || 'Advanced'}
              </Text>
            </View>
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
    width: 280,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  courseImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#1a1a1a',
  },
  courseContent: {
    padding: spacing.md,
  },
  courseCategory: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  courseTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
    lineHeight: 20,
    minHeight: 40,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  difficultyText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    textTransform: 'capitalize',
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
