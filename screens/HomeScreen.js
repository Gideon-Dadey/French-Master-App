import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { coursesAPI } from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import { spacing, fontSize, screenWidth } from '../src/utils/responsive';
import { useTheme } from '../src/context/ThemeContext';
import { getCourseImage } from '../src/utils/courseImages';
import { formatCurrency } from '../src/utils/helpers';
import { premiumColors, premiumShadows, premiumBorderRadius } from '../src/utils/premiumDesign';

export default function HomeScreen({ navigation }) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({
    french: 0,
    english: 0,
    'exam-prep': 0,
  });

  useEffect(() => {
    loadCourses();
    loadCategoryCounts();
  }, []);

  const loadCourses = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      
      const response = await coursesAPI.getFeatured();
      setFeaturedCourses(response.data.data || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        setError('Backend not connected. Start backend server to see real data.');
        setFeaturedCourses([]);
      } else {
        setError('Failed to load courses. Please check your connection.');
        setFeaturedCourses([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCategoryCounts = async () => {
    try {
      const categories = ['french', 'english', 'exam-prep'];
      const counts = {};
      
      for (const category of categories) {
        try {
          const response = await coursesAPI.getAll({ category, limit: 1 });
          counts[category] = response.data.total || 0;
        } catch (err) {
          counts[category] = 0;
        }
      }
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Failed to load category counts:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCourses();
    loadCategoryCounts();
  };

  const renderServiceCard = (title, description, icon, gradientColors, category, courseCount, onPress) => {
    return (
      <TouchableOpacity
        style={styles.serviceCardContainer}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.serviceCard, premiumShadows.lg]}
        >
          {/* Course Count Badge */}
          <View style={styles.courseCountBadge}>
            <Text style={styles.courseCountText}>{courseCount}+</Text>
            <Text style={styles.courseCountLabel}>Courses</Text>
          </View>

          {/* Icon Container */}
          <View style={styles.serviceIconWrapper}>
            <View style={styles.serviceIconContainer}>
              <Ionicons name={icon} size={36} color="#FFFFFF" />
            </View>
        </View>

          {/* Content */}
          <View style={styles.serviceCardContent}>
            <Text style={styles.serviceTitle}>{title}</Text>
            <Text style={styles.serviceDescription}>
          {description}
        </Text>
            
            {/* Explore Button */}
            <View style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Explore</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderCourseCard = (course, index) => {
    const imageSource = course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('https'))
      ? { uri: course.thumbnail }
      : getCourseImage(course._id || course.id, index, course.category || course.language, course.title);

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
            {course.category?.toUpperCase() || 'FRENCH'}
          </Text>
          <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
            {course.title}
          </Text>
          <View style={styles.courseMeta}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFB703" />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {course.rating?.average?.toFixed(1) || '4.5'}
              </Text>
            </View>
            <Text style={[styles.coursePrice, { color: colors.primary }]}>
              {course.price === 0 || course.price === null ? 'Free' : formatCurrency(course.price, 'GHS')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading courses..." />;
  }

  if (error && featuredCourses.length === 0) {
    return <ErrorMessage message={error} onRetry={loadCourses} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.appName, { color: colors.text }]}>French Master GH</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIcon}
              onPress={toggleTheme}
            >
              <Ionicons 
                name={isDarkMode ? 'sunny-outline' : 'moon-outline'} 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Category Section */}
        <View style={styles.serviceSection}>
          <View style={styles.sectionHeaderTop}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Explore Categories
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
                Choose your learning path
              </Text>
            </View>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.serviceCardsContainer}
            style={styles.serviceCardsScrollView}
          >
            {renderServiceCard(
              'Learn French',
              'Master the beautiful French language with comprehensive courses from beginner to advanced levels',
              'language',
              isDarkMode 
                ? ['#2563EB', '#1E40AF', '#1E3A8A']
                : ['#3B82F6', '#2563EB', '#1D4ED8'],
              'french',
              categoryCounts.french,
              () => navigation.navigate('Courses', { category: 'french' })
            )}
            {renderServiceCard(
              'Learn English',
              'Enhance your English proficiency with professional courses designed for all skill levels',
              'book',
              isDarkMode
                ? ['#7C3AED', '#6D28D9', '#5B21B6']
                : ['#8B5CF6', '#7C3AED', '#6D28D9'],
              'english',
              categoryCounts.english,
              () => navigation.navigate('Courses', { category: 'english' })
            )}
            {renderServiceCard(
              'Study in France',
              'Prepare for studying abroad with specialized exam preparation courses and certification',
              'school',
              isDarkMode
                ? ['#DC2626', '#B91C1C', '#991B1B']
                : ['#EF4444', '#DC2626', '#B91C1C'],
              'exam-prep',
              categoryCounts['exam-prep'],
              () => navigation.navigate('Courses', { category: 'exam-prep' })
            )}
          </ScrollView>
        </View>

        {/* Featured Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Courses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.coursesContainer}
          >
            {featuredCourses.length > 0 ? (
              featuredCourses.map((course, index) => renderCourseCard(course, index))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="book-outline" size={48} color={colors.secondaryText} />
                <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
                  No featured courses available
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Login Prompt for Guests */}
        {!isAuthenticated && (
          <View style={[styles.loginPrompt, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={32} color={colors.primary} />
            <Text style={[styles.loginPromptTitle, { color: colors.text }]}>
              Sign in to access all features
            </Text>
            <Text style={[styles.loginPromptText, { color: colors.secondaryText }]}>
              Track your progress, save courses, and unlock premium content
            </Text>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
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
  serviceSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    marginTop: spacing.md,
  },
  sectionHeaderTop: {
    marginBottom: spacing.lg,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    fontWeight: '400',
  },
  serviceCardsScrollView: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
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
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  serviceCardsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingRight: spacing.lg,
  },
  serviceCardContainer: {
    width: 280,
    marginRight: spacing.xs,
  },
  serviceCard: {
    borderRadius: premiumBorderRadius['2xl'],
    padding: spacing.xl,
    minHeight: 220,
    overflow: 'hidden',
    position: 'relative',
  },
  courseCountBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    borderRadius: premiumBorderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    ...premiumShadows.sm,
  },
  courseCountText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '800',
    lineHeight: 20,
  },
  courseCountLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: fontSize.xs - 1,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serviceIconWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  serviceIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...premiumShadows.md,
  },
  serviceCardContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  serviceDescription: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: spacing.xs,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -40,
    right: -40,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -20,
    left: -20,
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
  },
  courseContent: {
    padding: spacing.md,
  },
  courseCategory: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  courseTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
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
  coursePrice: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  emptyState: {
    width: screenWidth - spacing.lg * 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
  loginPrompt: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  loginPromptTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  loginPromptText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  loginButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    minWidth: 120,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
    textAlign: 'center',
  },
});
