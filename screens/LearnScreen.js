import React, { useState, useEffect } from 'react';
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

const { width } = Dimensions.get('window');

export default function LearnScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const { stats: gamificationStats } = useGamification();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [learningStats, setLearningStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { id: null, name: 'All', icon: 'grid-outline' },
    { id: 'french', name: 'French', icon: 'language-outline' },
    { id: 'english', name: 'English', icon: 'book-outline' },
    { id: 'grammar', name: 'Grammar', icon: 'school-outline' },
    { id: 'conversation', name: 'Conversation', icon: 'chatbubbles-outline' },
  ];

  const levels = [
    { id: 'beginner', name: 'Beginner', color: '#4CAF50' },
    { id: 'intermediate', name: 'Intermediate', color: '#FF9800' },
    { id: 'advanced', name: 'Advanced', color: '#F44336' },
  ];

  useEffect(() => {
    loadData();
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

      if (progressResponse?.data?.data) {
        const dashboardData = progressResponse.data.data;
        setLearningStats({
          totalLessons: dashboardData.totalLessonsCompleted || 0,
          studyTime: formatStudyTime(dashboardData.totalTimeSpent || 0),
          coursesEnrolled: dashboardData.totalCoursesEnrolled || 0,
          streak: gamificationStats?.streak || 0,
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
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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
      {/* Premium Header */}
      <LinearGradient
        colors={isDarkMode 
          ? ['#1a0a2e', '#16213e', '#0f3460']
          : ['#E8EAF6', '#F3E5F5', '#E1BEE7']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
                Bonjour, {userName}
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Continue your learning journey
              </Text>
            </View>
            {isAuthenticated && learningStats && (
              <View style={[styles.streakBadge, { backgroundColor: isDarkMode ? '#FFD700' : '#FFD700' }]}>
                <Ionicons name="flame" size={16} color="#000" />
                <Text style={styles.streakText}>{learningStats.streak} day streak</Text>
              </View>
            )}
          </View>

          {/* Search Bar */}
          <View style={[styles.searchBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)' }]}>
            <Ionicons name="search" size={20} color={isDarkMode ? '#FFFFFF' : '#424242'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: isDarkMode ? '#FFFFFF' : '#000' }]}
              placeholder="Search courses, lessons..."
              placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.6)' : '#9E9E9E'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={isDarkMode ? '#FFFFFF' : '#424242'} />
              </TouchableOpacity>
            )}
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
        {/* Learning Stats */}
        {isAuthenticated && learningStats && (
          <View style={styles.statsSection}>
            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
              <View style={styles.statsGrid}>
                <StatItem
                  icon="book"
                  value={learningStats.totalLessons}
                  label="Lessons"
                  color={premiumColors.primary.main}
                  colors={colors}
                />
                <StatItem
                  icon="time"
                  value={learningStats.studyTime}
                  label="Study Time"
                  color={premiumColors.accent.emerald}
                  colors={colors}
                />
                <StatItem
                  icon="library"
                  value={learningStats.coursesEnrolled}
                  label="Courses"
                  color={premiumColors.accent.gold}
                  colors={colors}
                />
                <StatItem
                  icon="flame"
                  value={learningStats.streak}
                  label="Day Streak"
                  color={premiumColors.error}
                  colors={colors}
                />
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              icon="play-circle"
              title="Continue Learning"
              subtitle="Resume your last lesson"
              color={premiumColors.primary.main}
              onPress={() => navigation.navigate('MyCourses')}
              colors={colors}
            />
            <QuickActionCard
              icon="trophy"
              title="Achievements"
              subtitle="View your badges"
              color={premiumColors.accent.gold}
              onPress={() => navigation.navigate('Achievements')}
              colors={colors}
            />
            <QuickActionCard
              icon="flash"
              title="Practice"
              subtitle="Quick exercises"
              color={premiumColors.accent.emerald}
              onPress={() => navigation.navigate('Practice')}
              colors={colors}
            />
            <QuickActionCard
              icon="library"
              title="My Courses"
              subtitle="View all courses"
              color={premiumColors.accent.rose}
              onPress={() => navigation.navigate('MyCourses')}
              colors={colors}
            />
          </View>
        </View>

        {/* Categories Filter */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse by Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategory === category.id
                      ? premiumColors.primary.main
                      : colors.card,
                    borderColor: selectedCategory === category.id
                      ? premiumColors.primary.main
                      : colors.border,
                  },
                  premiumShadows.sm,
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={category.icon}
                  size={18}
                  color={selectedCategory === category.id ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: selectedCategory === category.id ? '#FFFFFF' : colors.text,
                    },
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
                <Text style={[styles.seeAllText, { color: premiumColors.primary.main }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.coursesContainer}
            >
              {featuredCourses.map((course, index) => renderCourseCard(course, index, colors, navigation))}
            </ScrollView>
          </View>
        )}

        {/* All Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {searchQuery ? 'Search Results' : 'All Courses'}
            </Text>
            <Text style={[styles.courseCount, { color: colors.secondaryText }]}>
              {filteredCourses.length} courses
            </Text>
          </View>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => renderCourseCard(course, index, colors, navigation, true))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
                {searchQuery ? 'No courses found' : 'No courses available'}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function StatItem({ icon, value, label, color, colors }) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
    </View>
  );
}

function QuickActionCard({ icon, title, subtitle, color, onPress, colors }) {
  return (
    <TouchableOpacity
      style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[color, color + 'DD']}
        style={styles.quickActionGradient}
      >
        <Ionicons name={icon} size={28} color="#FFFFFF" />
      </LinearGradient>
      <Text style={[styles.quickActionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.quickActionSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const renderCourseCard = (course, index, colors, navigation, isVertical = false) => {
  const imageSource = course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('https'))
    ? { uri: course.thumbnail }
    : getCourseImage(course._id || course.id, index, course.category || course.language, course.title);

  const getLevelColor = (level) => {
    const levelLower = (level || '').toLowerCase();
    switch (levelLower) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#2196F3';
    }
  };

  const levelColor = getLevelColor(course.level);
  const isPremium = course.isPremium || course.price > 0;

  if (isVertical) {
    return (
      <TouchableOpacity
        key={course._id || course.id}
        style={[styles.verticalCourseCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}
        onPress={() => navigation.navigate('CourseDetail', { courseId: course._id || course.id })}
        activeOpacity={0.9}
      >
        <Image source={imageSource} style={styles.verticalCourseImage} resizeMode="cover" />
        <View style={styles.verticalCourseContent}>
          <View style={styles.courseHeader}>
            <Text style={[styles.courseCategory, { color: premiumColors.primary.main }]}>
              {course.category?.toUpperCase() || 'FRENCH'}
            </Text>
            {isPremium && (
              <View style={[styles.premiumBadge, { backgroundColor: premiumColors.primary.main }]}>
                <Ionicons name="diamond" size={12} color="#FFFFFF" />
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            )}
          </View>
          <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
            {course.title}
          </Text>
          <View style={styles.courseFooter}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFB703" />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {course.rating?.average?.toFixed(1) || '4.5'}
              </Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
              <Text style={styles.levelText}>{course.level || 'All'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      key={course._id || course.id}
      style={[styles.horizontalCourseCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}
      onPress={() => navigation.navigate('CourseDetail', { courseId: course._id || course.id })}
      activeOpacity={0.9}
    >
      <Image source={imageSource} style={styles.horizontalCourseImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.imageOverlay}
      />
      <View style={styles.horizontalCourseContent}>
        <View style={styles.courseHeader}>
          <Text style={[styles.courseCategory, { color: '#FFFFFF' }]}>
            {course.category?.toUpperCase() || 'FRENCH'}
          </Text>
          {isPremium && (
            <View style={[styles.premiumBadge, { backgroundColor: premiumColors.primary.main }]}>
              <Ionicons name="diamond" size={12} color="#FFFFFF" />
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          )}
        </View>
        <Text style={[styles.courseTitle, { color: '#FFFFFF' }]} numberOfLines={2}>
          {course.title}
        </Text>
        <View style={styles.courseFooter}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFB703" />
            <Text style={[styles.ratingText, { color: '#FFFFFF' }]}>
              {course.rating?.average?.toFixed(1) || '4.5'}
            </Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
            <Text style={styles.levelText}>{course.level || 'All'}</Text>
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
  header: {
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs / 2,
  },
  streakText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#000',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.lg,
    marginTop: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
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
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  statsCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  section: {
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
  seeAllText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  courseCount: {
    fontSize: fontSize.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  quickActionCard: {
    width: '47%',
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingRight: spacing.md,
    gap: spacing.sm,
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
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  coursesContainer: {
    paddingRight: spacing.md,
  },
  horizontalCourseCard: {
    width: 300,
    height: 200,
    borderRadius: premiumBorderRadius.xl,
    overflow: 'hidden',
    marginRight: spacing.md,
    borderWidth: 1,
  },
  horizontalCourseImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  horizontalCourseContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  verticalCourseCard: {
    borderRadius: premiumBorderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  verticalCourseImage: {
    width: '100%',
    height: 180,
  },
  verticalCourseContent: {
    padding: spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  courseCategory: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs / 2,
  },
  premiumBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  courseTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
  },
  levelText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
});
