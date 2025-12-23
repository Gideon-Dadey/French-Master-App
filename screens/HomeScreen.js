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
import { Ionicons } from '@expo/vector-icons';
import { coursesAPI } from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import { spacing, fontSize, screenWidth } from '../src/utils/responsive';
import { useTheme } from '../src/context/ThemeContext';
import { getCourseImage } from '../src/utils/courseImages';

export default function HomeScreen({ navigation }) {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourses();
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

  const onRefresh = () => {
    setRefreshing(true);
    loadCourses();
  };

  const renderServiceCard = (title, description, icon, color, onPress) => {
    return (
      <TouchableOpacity
        style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.serviceIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={32} color={color} />
        </View>
        <Text style={[styles.serviceTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.serviceDescription, { color: colors.secondaryText }]}>
          {description}
        </Text>
      </TouchableOpacity>
    );
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
              {course.price === 0 || course.price === null ? 'Free' : `$${course.price}`}
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
        {/* Service Cards */}
        <View style={styles.serviceSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What would you like to learn?</Text>
          <View style={styles.serviceCardsContainer}>
            {renderServiceCard(
              'Learn French',
              'Master the beautiful French language',
              'language',
              '#1E88E5',
              () => navigation.navigate('Courses', { category: 'french' })
            )}
            {renderServiceCard(
              'Learn English',
              'Improve your English skills',
              'book',
              '#6A1B9A',
              () => navigation.navigate('Courses', { category: 'english' })
            )}
            {renderServiceCard(
              'Study in France',
              'Prepare for studying abroad',
              'school',
              '#FF6B6B',
              () => navigation.navigate('Courses', { category: 'exam-prep' })
            )}
          </View>
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
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  serviceCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 140,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  serviceTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 18,
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
