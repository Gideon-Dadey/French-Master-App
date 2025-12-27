import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { coursesAPI, paymentsAPI, reviewsAPI } from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import CertificateView from '../src/components/CertificateView';
import { formatCurrency } from '../src/utils/helpers';
import { spacing, fontSize } from '../src/utils/responsive';
import { getCourseImage } from '../src/utils/courseImages';
import Rating from '../src/components/Rating';
import { useCurrency } from '../src/context/CurrencyContext';
import { getThemeColors, themeShadows, themeRadius } from '../src/utils/organicTheme';

const { width, height } = Dimensions.get('window');

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const { isAuthenticated, user } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const { formatPrice } = useCurrency();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStickyCard, setShowStickyCard] = useState(false);
  const [instructorCourseCount, setInstructorCourseCount] = useState(0);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCourse();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [courseId]);

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      setShowStickyCard(value > 400);
    });
    return () => scrollY.removeListener(listener);
  }, []);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.getById(courseId);
      
      if (response.data.data) {
        setCourse(response.data.data);
        await Promise.all([
          loadReviews(),
          loadInstructorCourseCount(response.data.data.instructor?._id || response.data.data.instructor)
        ]);
      } else {
        setError('Course not found');
      }
    } catch (error) {
      console.error('Failed to load course:', error);
      const errorMessage = error.message || 'Failed to load course';
      
      if (errorMessage.includes('Network') || errorMessage.includes('network')) {
        setError('Connection Error - Please check your internet and try again.');
      } else if (error.status === 404) {
        setError('Course not found');
      } else {
        setError(errorMessage || 'Failed to load course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadInstructorCourseCount = async (instructorId) => {
    if (!instructorId) {
      setInstructorCourseCount(0);
      return;
    }
    
    try {
      // Get instructor ID (handle both object and string formats)
      const id = instructorId._id || instructorId;
      if (!id) {
        setInstructorCourseCount(0);
        return;
      }

      // Fetch all courses (with a reasonable limit) and count instructor's courses
      // Note: This is a workaround since backend doesn't support instructor filter
      // Ideally, backend should support ?instructor=id query parameter
      const allCoursesResponse = await coursesAPI.getAll({ limit: 1000 });
      const allCourses = allCoursesResponse.data.data || [];
      
      // Count courses by this instructor
      const instructorCourses = allCourses.filter(c => {
        const courseInstructorId = c.instructor?._id || c.instructor;
        return courseInstructorId && (
          courseInstructorId.toString() === id.toString() ||
          courseInstructorId === id
        );
      });
      
      setInstructorCourseCount(instructorCourses.length || 0);
    } catch (error) {
      console.warn('Failed to load instructor course count:', error);
      setInstructorCourseCount(0);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewsAPI.getByCourse(courseId);
      setReviews(response.data.data || []);
    } catch (error) {
      console.warn('Failed to load reviews:', error);
      setReviews([]);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to enroll in this course', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
      ]);
      return;
    }

    if (course.isFree || course.price === 0) {
      try {
        setPurchasing(true);
        await paymentsAPI.confirm({
          courseId,
          type: 'course',
          amount: 0,
          paymentMethod: 'free',
          transactionId: `FREE-${Date.now()}`,
        });
        Alert.alert('Success', 'You have been enrolled in this course!');
        navigation.goBack();
      } catch (error) {
        Alert.alert('Error', error.response?.data?.message || 'Enrollment failed');
      } finally {
        setPurchasing(false);
      }
      return;
    }

    navigation.navigate('CoursePayment', {
      course: {
        id: course._id || courseId,
        title: course.title,
        price: course.price,
        originalPrice: course.originalPrice,
        currency: course.currency || 'GHS',
        thumbnail: course.thumbnail,
        isFree: course.isFree,
      },
      courseId: course._id || courseId,
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading course..." />;
  }

  if (error || !course) {
    return <ErrorMessage message={error || 'Course not found'} onRetry={loadCourse} />;
  }

  const isEnrolled = course.isEnrolled || user?.enrolledCourses?.includes(course._id);
  const totalLessons = course.lessons?.length || 0;
  const totalDuration = course.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0;
  const imageSource = course.thumbnail?.startsWith('http') 
    ? { uri: course.thumbnail } 
    : getCourseImage(course._id, 0, course.category, course.title);

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              transform: [{ scale: imageScale }],
            },
          ]}
        >
          <Image source={imageSource} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={[theme.primary + 'E6', theme.primary + 'B3', 'transparent']}
            style={styles.heroGradient}
          />
        </Animated.View>

        {/* Main Content */}
        <View style={[styles.contentWrapper, { backgroundColor: theme.background }]}>
          {/* Course Title & Meta */}
          <Animated.View style={[styles.titleSection, { opacity: fadeAnim }]}>
            <View style={styles.badgeRow}>
              <View style={[styles.categoryBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.categoryBadgeText}>
                  {(course.category || 'COURSE').toUpperCase()}
                </Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.levelBadgeText, { color: theme.primary }]}>
                  {course.level || 'All Levels'}
                </Text>
              </View>
              {course.featured && (
                <View style={[styles.featuredBadge, { backgroundColor: theme.secondary + '20' }]}>
                  <Ionicons name="star" size={14} color={theme.secondary} />
                  <Text style={[styles.featuredText, { color: theme.secondary }]}>Featured</Text>
                </View>
              )}
            </View>

            <Text style={[styles.courseTitle, { color: theme.text }]}>{course.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Rating rating={course.rating?.average || 0} size={16} showRating={true} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  ({course.rating?.count || 0})
                </Text>
              </View>
              <View style={[styles.metaDivider, { backgroundColor: theme.border }]} />
              <View style={styles.metaItem}>
                <Ionicons name="people" size={16} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {course.studentsEnrolled || 0} students
                </Text>
              </View>
              <View style={[styles.metaDivider, { backgroundColor: theme.border }]} />
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {formatDuration(totalDuration)}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Quick Stats */}
          <Animated.View
            style={[styles.statsCard, { backgroundColor: theme.surface }, themeShadows.md, { opacity: fadeAnim }]}
          >
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name="book" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>{totalLessons}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Lessons</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name="time" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatDuration(totalDuration)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Duration</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name="language" size={20} color={theme.primary} />
                </View>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {course.language?.toUpperCase() || 'EN'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Language</Text>
              </View>
              {course.certificate?.enabled && (
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: theme.primary + '15' }]}>
                    <Ionicons name="ribbon" size={20} color={theme.primary} />
                  </View>
                  <Text style={[styles.statValue, { color: theme.text }]}>Yes</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Certificate</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Enrollment Card */}
          <Animated.View
            style={[
              styles.enrollmentCard,
              { backgroundColor: theme.surface },
              themeShadows.lg,
              { opacity: fadeAnim },
            ]}
          >
            <View style={styles.priceSection}>
              {(course.isFree || course.price === 0) ? (
                <View>
                  <Text style={[styles.priceText, { color: theme.primary }]}>FREE</Text>
                  <Text style={[styles.priceSubtext, { color: theme.textSecondary }]}>
                    Lifetime access
                  </Text>
                </View>
              ) : (
                <View>
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceText, { color: theme.text }]}>
                      {formatPrice ? formatPrice(course.price) : formatCurrency(course.price, 'GHS')}
                    </Text>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <Text style={[styles.originalPrice, { color: theme.textMuted }]}>
                        {formatPrice ? formatPrice(course.originalPrice) : formatCurrency(course.originalPrice, 'GHS')}
                      </Text>
                    )}
                  </View>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <Text style={[styles.discountText, { color: theme.primary }]}>
                      {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                    </Text>
                  )}
                </View>
              )}
            </View>

            {isEnrolled ? (
              <TouchableOpacity
                style={styles.enrollButton}
                onPress={() => navigation.navigate('Lesson', { 
                  courseId: course._id, 
                  lessonId: course.lessons?.[0]?._id 
                })}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[theme.primary, theme.primaryLight || theme.primary]}
                  style={styles.enrollButtonGradient}
                >
                  <Ionicons name="play-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.enrollButtonText}>Continue Learning</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.enrollButton}
                onPress={handlePurchase}
                disabled={purchasing}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[theme.primary, theme.primaryLight || theme.primary]}
                  style={styles.enrollButtonGradient}
                >
                  {purchasing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name={(course.isFree || course.price === 0) ? 'school' : 'cart'} size={22} color="#FFFFFF" />
                      <Text style={styles.enrollButtonText}>
                        {(course.isFree || course.price === 0) ? 'Enroll Free' : 'Enroll Now'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}

            {!isEnrolled && (
              <View style={styles.trustBadges}>
                <View style={[styles.trustBadge, { backgroundColor: theme.primary + '10' }]}>
                  <Ionicons name="shield-checkmark" size={16} color={theme.primary} />
                  <Text style={[styles.trustBadgeText, { color: theme.text }]}>
                    30-Day Guarantee
                  </Text>
                </View>
                <View style={[styles.trustBadge, { backgroundColor: theme.primary + '10' }]}>
                  <Ionicons name="infinite" size={16} color={theme.primary} />
                  <Text style={[styles.trustBadgeText, { color: theme.text }]}>
                    Lifetime Access
                  </Text>
                </View>
              </View>
            )}
          </Animated.View>

          {/* Tabs Navigation */}
          <View style={[styles.tabsContainer, { backgroundColor: theme.surface }, themeShadows.sm]}>
            {[
              { id: 'overview', label: 'Overview', icon: 'information-circle-outline' },
              { id: 'curriculum', label: 'Curriculum', icon: 'book-outline' },
              { id: 'reviews', label: 'Reviews', icon: 'star-outline' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && [styles.activeTab, { backgroundColor: theme.primary + '15' }],
                ]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon}
                  size={18}
                  color={activeTab === tab.id ? theme.primary : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === tab.id ? theme.primary : theme.textSecondary },
                  ]}
                >
                  {tab.label}
                </Text>
                {activeTab === tab.id && (
                  <View style={[styles.tabIndicator, { backgroundColor: theme.primary }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
              {/* Description */}
              <View style={[styles.section, { backgroundColor: theme.surface }, themeShadows.sm]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>About This Course</Text>
                <Text style={[styles.description, { color: theme.textSecondary }]}>
                  {course.description || 'No description available.'}
                </Text>
              </View>

              {/* What You'll Learn */}
              {course.whatYouWillLearn?.length > 0 && (
                <View style={[styles.section, { backgroundColor: theme.surface }, themeShadows.sm]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '15' }]}>
                      <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      What You'll Learn
                    </Text>
                  </View>
                  <View style={styles.learnList}>
                    {course.whatYouWillLearn.map((item, index) => (
                      <View key={index} style={styles.learnItem}>
                        <View style={[styles.learnIcon, { backgroundColor: theme.primary + '15' }]}>
                          <Ionicons name="checkmark" size={16} color={theme.primary} />
                        </View>
                        <Text style={[styles.learnText, { color: theme.text }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Requirements */}
              <View style={[styles.section, { backgroundColor: theme.surface }, themeShadows.sm]}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '15' }]}>
                    <Ionicons name="list" size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Requirements</Text>
                </View>
                <View style={styles.requirementsList}>
                  {(course.requirements || [
                    'No prior knowledge needed',
                    'A device with internet connection',
                    'Willingness to learn and practice',
                  ]).map((req, index) => (
                    <View key={index} style={styles.requirementItem}>
                      <View style={[styles.requirementDot, { backgroundColor: theme.primary }]} />
                      <Text style={[styles.requirementText, { color: theme.text }]}>{req}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Course Includes */}
              <View style={[styles.section, { backgroundColor: theme.surface }, themeShadows.sm]}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '15' }]}>
                    <Ionicons name="gift" size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    This Course Includes
                  </Text>
                </View>
                <View style={styles.includesList}>
                  {[
                    { icon: 'play-circle', label: `${totalLessons} video lessons` },
                    { icon: 'time-outline', label: `${formatDuration(totalDuration)} of content` },
                    { icon: 'ribbon-outline', label: 'Certificate of completion' },
                    { icon: 'infinite-outline', label: 'Full lifetime access' },
                    { icon: 'phone-portrait-outline', label: 'Access on mobile & desktop' },
                    { icon: 'cloud-download-outline', label: 'Downloadable resources' },
                  ].map((item, index, array) => (
                    <View
                      key={index}
                      style={[
                        styles.includeRow,
                        index < array.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                      ]}
                    >
                      <View style={[styles.includeIcon, { backgroundColor: theme.primary + '15' }]}>
                        <Ionicons name={item.icon} size={20} color={theme.primary} />
                      </View>
                      <Text style={[styles.includeLabel, { color: theme.text }]}>{item.label}</Text>
                      <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                    </View>
                  ))}
                </View>
              </View>

              {/* Instructor */}
              {course.instructor && (
                <View style={[styles.section, { backgroundColor: theme.surface }, themeShadows.sm]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '15' }]}>
                      <Ionicons name="person" size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Instructor</Text>
                  </View>
                  <View style={[styles.instructorCard, { backgroundColor: theme.background }]}>
                    <View style={styles.instructorAvatar}>
                      {course.instructor.avatar ? (
                        <Image source={{ uri: course.instructor.avatar }} style={styles.avatarImage} />
                      ) : (
                        <LinearGradient
                          colors={[theme.primary, theme.primaryLight || theme.primary]}
                          style={styles.avatarPlaceholder}
                        >
                          <Text style={styles.avatarText}>
                            {course.instructor.name?.charAt(0) || 'T'}
                          </Text>
                        </LinearGradient>
                      )}
                    </View>
                    <View style={styles.instructorInfo}>
                      <Text style={[styles.instructorName, { color: theme.text }]}>
                        {course.instructor.name}
                      </Text>
                      <Text style={[styles.instructorTitle, { color: theme.textSecondary }]}>
                        {course.instructor.title || 'Professional Instructor'}
                      </Text>
                      <View style={styles.instructorStats}>
                        <View style={styles.instructorStat}>
                          <Ionicons name="star" size={14} color={theme.secondary} />
                          <Text style={[styles.instructorStatText, { color: theme.textSecondary }]}>
                            4.8 Rating
                          </Text>
                        </View>
                        <View style={styles.instructorStat}>
                          <Ionicons name="people" size={14} color={theme.textSecondary} />
                          <Text style={[styles.instructorStatText, { color: theme.textSecondary }]}>
                            10K+ Students
                          </Text>
                        </View>
                        <View style={styles.instructorStat}>
                          <Ionicons name="book" size={14} color={theme.textSecondary} />
                          <Text style={[styles.instructorStatText, { color: theme.textSecondary }]}>
                            {instructorCourseCount || 0} {instructorCourseCount === 1 ? 'Course' : 'Courses'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>
          )}

          {activeTab === 'curriculum' && (
            <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
              <View style={[styles.section, { backgroundColor: theme.surface }, themeShadows.sm]}>
                <View style={styles.curriculumHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Course Curriculum</Text>
                  <Text style={[styles.lessonCount, { color: theme.textSecondary }]}>
                    {totalLessons} lessons • {formatDuration(totalDuration)} total
                  </Text>
                </View>
                {course.lessons?.length > 0 ? (
                  <View style={styles.lessonsContainer}>
                    {course.lessons.map((lesson, index) => (
                      <TouchableOpacity
                        key={lesson._id || index}
                        style={[
                          styles.lessonCard,
                          { borderBottomColor: theme.border },
                          (isEnrolled || index === 0) && styles.lessonCardActive,
                        ]}
                        onPress={() => {
                          if (isEnrolled || index === 0) {
                            navigation.navigate('Lesson', {
                              courseId: course._id,
                              lessonId: lesson._id,
                            });
                          } else {
                            Alert.alert('Lesson Locked', 'Enroll in this course to unlock all lessons.', [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Enroll Now', onPress: handlePurchase },
                            ]);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.lessonLeft}>
                          <View
                            style={[
                              styles.lessonNumber,
                              {
                                backgroundColor:
                                  isEnrolled || index === 0 ? theme.primary : theme.border,
                              },
                            ]}
                          >
                            {index === 0 && !isEnrolled ? (
                              <Ionicons name="play" size={14} color="#FFFFFF" />
                            ) : (
                              <Text
                                style={[
                                  styles.lessonNumberText,
                                  {
                                    color: isEnrolled || index === 0 ? '#FFFFFF' : theme.textSecondary,
                                  },
                                ]}
                              >
                                {index + 1}
                              </Text>
                            )}
                          </View>
                          <View style={styles.lessonInfo}>
                            <View style={styles.lessonTitleRow}>
                              <Text style={[styles.lessonTitle, { color: theme.text }]} numberOfLines={1}>
                                {lesson.title}
                              </Text>
                              {index === 0 && !isEnrolled && (
                                <View style={[styles.freeBadge, { backgroundColor: theme.primary }]}>
                                  <Text style={styles.freeBadgeText}>FREE</Text>
                                </View>
                              )}
                            </View>
                            <View style={styles.lessonMeta}>
                              <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
                              <Text style={[styles.lessonDuration, { color: theme.textSecondary }]}>
                                {formatDuration(lesson.duration || 0)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        {isEnrolled ? (
                          <Ionicons name="play-circle" size={28} color={theme.primary} />
                        ) : index === 0 ? (
                          <Ionicons name="play-circle" size={28} color={theme.primary} />
                        ) : (
                          <Ionicons name="lock-closed" size={20} color={theme.textSecondary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={48} color={theme.textMuted} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                      No lessons available
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          {activeTab === 'reviews' && (
            <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
              <View style={[styles.section, { backgroundColor: theme.surface }, themeShadows.sm]}>
                <View style={styles.reviewsHeader}>
                  <View>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Student Reviews</Text>
                    <Text style={[styles.reviewsSubtitle, { color: theme.textSecondary }]}>
                      What students are saying
                    </Text>
                  </View>
                  <View style={styles.ratingOverview}>
                    <View style={[styles.ratingCircle, { backgroundColor: theme.primary + '15' }]}>
                      <Text style={[styles.ratingBig, { color: theme.text }]}>
                        {course.rating?.average?.toFixed(1) || '4.5'}
                      </Text>
                    </View>
                    <View style={styles.ratingDetails}>
                      <Rating rating={course.rating?.average || 0} size={16} showRating={false} />
                      <Text style={[styles.ratingCount, { color: theme.textSecondary }]}>
                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                      </Text>
                    </View>
                  </View>
                </View>
                {reviews.length > 0 ? (
                  <View style={styles.reviewsList}>
                    {reviews.slice(0, 10).map((review, index) => (
                      <View
                        key={review._id || index}
                        style={[styles.reviewCard, { borderBottomColor: theme.border }]}
                      >
                        <View style={styles.reviewHeader}>
                          <View style={styles.reviewerInfo}>
                            <View
                              style={[styles.reviewerAvatar, { backgroundColor: theme.primary }]}
                            >
                              <Text style={styles.reviewerInitial}>
                                {review.user?.name?.charAt(0) || 'U'}
                              </Text>
                            </View>
                            <View style={styles.reviewerDetails}>
                              <Text style={[styles.reviewerName, { color: theme.text }]}>
                                {review.user?.name || 'Anonymous'}
                              </Text>
                              <View style={styles.reviewStars}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Ionicons
                                    key={star}
                                    name={star <= review.rating ? 'star' : 'star-outline'}
                                    size={14}
                                    color={theme.secondary}
                                  />
                                ))}
                              </View>
                            </View>
                          </View>
                          <Text style={[styles.reviewDate, { color: theme.textSecondary }]}>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text style={[styles.reviewText, { color: theme.textSecondary }]}>
                          {review.comment}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="chatbubbles-outline" size={48} color={theme.textMuted} />
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                      No reviews yet
                    </Text>
                    <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                      Be the first to review this course!
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Sticky Enrollment Card */}
      {showStickyCard && (
        <Animated.View
          style={[
            styles.stickyCard,
            { backgroundColor: theme.surface, borderTopColor: theme.border },
            themeShadows.xl,
          ]}
        >
          <View style={styles.stickyContent}>
            <Image source={imageSource} style={styles.stickyImage} />
            <View style={styles.stickyInfo}>
              <Text style={[styles.stickyTitle, { color: theme.text }]} numberOfLines={1}>
                {course.title}
              </Text>
              <Text style={[styles.stickyPrice, { color: theme.primary }]}>
                {(course.isFree || course.price === 0)
                  ? 'Free'
                  : formatPrice
                  ? formatPrice(course.price)
                  : formatCurrency(course.price, 'GHS')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.stickyButton}
              onPress={
                isEnrolled
                  ? () =>
                      navigation.navigate('Lesson', {
                        courseId: course._id,
                        lessonId: course.lessons?.[0]?._id,
                      })
                  : handlePurchase
              }
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.primary, theme.primaryLight || theme.primary]}
                style={styles.stickyButtonGradient}
              >
                <Text style={styles.stickyButtonText}>
                  {isEnrolled
                    ? 'Continue'
                    : (course.isFree || course.price === 0)
                    ? 'Enroll Free'
                    : 'Enroll Now'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {showCertificate && (
        <CertificateView
          visible={showCertificate}
          onClose={() => setShowCertificate(false)}
          course={course}
          user={user}
        />
      )}
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
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    height: height * 0.45,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentWrapper: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '700',
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 12,
  },
  statsCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  enrollmentCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  priceSection: {
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceText: {
    fontSize: 32,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 20,
    textDecorationLine: 'line-through',
  },
  priceSubtext: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  discountText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  enrollButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  enrollButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trustBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  trustBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  trustBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 4,
    left: '20%',
    right: '20%',
    height: 3,
    borderRadius: 2,
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  section: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  learnList: {
    gap: 12,
  },
  learnItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  learnIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  learnText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  includesList: {
    gap: 0,
  },
  includeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  includeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  includeLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  instructorAvatar: {
    marginRight: 16,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  instructorTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  instructorStats: {
    flexDirection: 'row',
    gap: 16,
  },
  instructorStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  instructorStatText: {
    fontSize: 12,
  },
  curriculumHeader: {
    marginBottom: 20,
  },
  lessonCount: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  lessonsContainer: {
    gap: 0,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  lessonCardActive: {},
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 16,
    fontWeight: '700',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  freeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  freeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonDuration: {
    fontSize: 12,
  },
  reviewsHeader: {
    marginBottom: 20,
  },
  reviewsSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  ratingCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBig: {
    fontSize: 28,
    fontWeight: '800',
  },
  ratingDetails: {
    flex: 1,
  },
  ratingCount: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  reviewsList: {
    gap: 0,
  },
  reviewCard: {
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  stickyCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  stickyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stickyImage: {
    width: 60,
    height: 40,
    borderRadius: 12,
  },
  stickyInfo: {
    flex: 1,
  },
  stickyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  stickyPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  stickyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  stickyButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  stickyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
