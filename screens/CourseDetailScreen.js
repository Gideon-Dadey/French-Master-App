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
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';

const { width, height } = Dimensions.get('window');

const IncludeRow = ({ icon, label, colors, isDarkMode, isLast }) => (
  <View style={[
    includeRowStyles.row,
    !isLast && { borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#2c2c2e' : '#f0f0f5' }
  ]}>
    <View style={[includeRowStyles.iconWrapper, { backgroundColor: isDarkMode ? '#2c2c2e' : '#f0f9ff' }]}>
      <Ionicons name={icon} size={20} color="#0ea5e9" />
    </View>
    <Text style={[includeRowStyles.label, { color: colors.text }]}>{label}</Text>
    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
  </View>
);

const includeRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const { isAuthenticated, user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const { formatPrice } = useCurrency();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [expandedLessons, setExpandedLessons] = useState({});
  const [showStickyCard, setShowStickyCard] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCourse();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [courseId]);

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      setShowStickyCard(value > 300);
    });
    return () => scrollY.removeListener(listener);
  }, []);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.getById(courseId);
      setCourse(response.data.data);
      await loadReviews();
    } catch (error) {
      console.error('Failed to load course:', error);
      setError('Failed to load course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewsAPI.getByCourse(courseId);
      setReviews(response.data.data || []);
    } catch (error) {
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

    if (course.isFree) {
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

  const getLevelColor = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'beginner') return '#10B981';
    if (l === 'intermediate') return '#F59E0B';
    if (l === 'advanced') return '#EF4444';
    return '#3B82F6';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} min`;
  };

  const toggleLesson = (index) => {
    setExpandedLessons((prev) => ({ ...prev, [index]: !prev[index] }));
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
  const imageSource = course.thumbnail?.startsWith('http') ? { uri: course.thumbnail } : getCourseImage(course._id, 0, course.category, course.title);

  const tabs = [
    { id: 'about', label: 'Overview', icon: 'information-circle-outline' },
    { id: 'curriculum', label: 'Curriculum', icon: 'book-outline' },
    { id: 'reviews', label: 'Reviews', icon: 'star-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        {/* Hero Section */}
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
          <Image source={imageSource} style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.7)', 'rgba(37, 99, 235, 0.5)', 'transparent']}
            style={styles.heroGradient}
          />

          <View style={styles.heroContent}>
            <View style={styles.heroBadges}>
              <View style={[styles.levelBadge, { backgroundColor: getLevelColor(course.level) }]}>
                <Text style={styles.levelText}>{course.level || 'All Levels'}</Text>
              </View>
              {course.featured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.featuredText}>Featured</Text>
                </View>
              )}
            </View>

            <Text style={styles.heroTitle} numberOfLines={3}>{course.title}</Text>

            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <Rating rating={course.rating?.average || 0} size={16} showRating={true} />
                <Text style={styles.heroMetaText}>({course.rating?.count || 0})</Text>
              </View>
              <View style={styles.heroMetaDivider} />
              <View style={styles.heroMetaItem}>
                <Ionicons name="people" size={16} color="#FFFFFF" />
                <Text style={styles.heroMetaText}>{course.enrolledCount || 0} students</Text>
              </View>
              <View style={styles.heroMetaDivider} />
              <View style={styles.heroMetaItem}>
                <Ionicons name="time" size={16} color="#FFFFFF" />
                <Text style={styles.heroMetaText}>{formatDuration(totalDuration)}</Text>
              </View>
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Ionicons name="book" size={18} color="#FFFFFF" />
                <Text style={styles.heroStatText}>{totalLessons} Lessons</Text>
              </View>
              <View style={styles.heroStatItem}>
                <Ionicons name="language" size={18} color="#FFFFFF" />
                <Text style={styles.heroStatText}>{course.language?.toUpperCase() || 'EN'}</Text>
              </View>
              {course.certificate?.enabled && (
                <View style={styles.heroStatItem}>
                  <Ionicons name="ribbon" size={18} color="#FFFFFF" />
                  <Text style={styles.heroStatText}>Certificate</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Price & Enrollment Card */}
        <Animated.View style={[styles.enrollmentCard, { backgroundColor: colors.card, opacity: fadeAnim }, premiumShadows.xl]}>
          <View style={styles.enrollmentHeader}>
            <View style={styles.priceSection}>
              {course.isFree ? (
                <View>
                  <Text style={[styles.priceText, { color: '#10B981' }]}>Free</Text>
                  <Text style={[styles.priceSubtext, { color: colors.secondaryText }]}>Lifetime access</Text>
                </View>
              ) : (
                <View>
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceText, { color: colors.text }]}>
                      {formatPrice ? formatPrice(course.price) : formatCurrency(course.price, 'GHS')}
                    </Text>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <Text style={styles.originalPrice}>
                        {formatPrice ? formatPrice(course.originalPrice) : formatCurrency(course.originalPrice, 'GHS')}
                      </Text>
                    )}
                  </View>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <Text style={[styles.discountText, { color: '#10B981' }]}>
                      {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                    </Text>
                  )}
                </View>
              )}
            </View>

            {isEnrolled ? (
              <TouchableOpacity
                style={styles.enrollButton}
                onPress={() => navigation.navigate('Lesson', { courseId: course._id, lessonId: course.lessons?.[0]?._id })}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#10B981', '#059669']} style={styles.enrollButtonGradient}>
                  <Ionicons name="play-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.enrollButtonText}>Continue Learning</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.enrollButton}
                onPress={handlePurchase}
                disabled={purchasing}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.enrollButtonGradient}>
                  {purchasing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name={course.isFree ? 'school' : 'cart'} size={20} color="#FFFFFF" />
                      <Text style={styles.enrollButtonText}>{course.isFree ? 'Enroll Free' : 'Enroll Now'}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {!isEnrolled && (
            <View style={styles.trustBadges}>
              <View style={[styles.trustBadge, { backgroundColor: isDarkMode ? '#1c1c1e' : '#f0fdf4' }]}>
                <Ionicons name="shield-checkmark" size={16} color="#22c55e" />
                <Text style={[styles.trustBadgeText, { color: isDarkMode ? '#86efac' : '#166534' }]}>
                  30-Day Guarantee
                </Text>
              </View>
              <View style={[styles.trustBadge, { backgroundColor: isDarkMode ? '#1c1c1e' : '#eff6ff' }]}>
                <Ionicons name="medal" size={16} color="#3b82f6" />
                <Text style={[styles.trustBadgeText, { color: isDarkMode ? '#93c5fd' : '#1e40af' }]}>
                  Verified Course
                </Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Tabs Navigation */}
        <View style={[styles.tabsContainer, { backgroundColor: colors.card }, premiumShadows.md]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && [styles.activeTab, { backgroundColor: premiumColors.primary.main + '15' }]
              ]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={activeTab === tab.id ? premiumColors.primary.main : colors.secondaryText}
              />
              <Text style={[
                styles.tabText,
                { color: activeTab === tab.id ? premiumColors.primary.main : colors.secondaryText }
              ]}>
                {tab.label}
              </Text>
              {activeTab === tab.id && (
                <View style={[styles.tabIndicator, { backgroundColor: premiumColors.primary.main }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {/* About Section */}
            <View style={[styles.section, { backgroundColor: colors.card }, premiumShadows.sm]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>About This Course</Text>
              <Text style={[styles.description, { color: colors.secondaryText }]}>
                {course.description || 'No description available.'}
              </Text>
            </View>

            {/* What You'll Learn */}
            {course.whatYoullLearn?.length > 0 && (
              <View style={[styles.section, { backgroundColor: colors.card }, premiumShadows.sm]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-circle" size={24} color={premiumColors.primary.main} />
                  <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: spacing.sm }]}>
                    What You'll Learn
                  </Text>
                </View>
                <View style={styles.learnGrid}>
                  {course.whatYoullLearn.map((item, index) => (
                    <View key={index} style={styles.learnItem}>
                      <View style={styles.learnIcon}>
                        <Ionicons name="checkmark" size={16} color="#10B981" />
                      </View>
                      <Text style={[styles.learnText, { color: colors.text }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Requirements */}
            <View style={[styles.section, { backgroundColor: colors.card }, premiumShadows.sm]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={24} color={premiumColors.primary.main} />
                <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: spacing.sm }]}>
                  Requirements
                </Text>
              </View>
              <View style={styles.requirementsList}>
                {(course.requirements || [
                  'No prior knowledge needed',
                  'A device with internet connection',
                  'Willingness to learn and practice',
                ]).map((req, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <Ionicons name="ellipse" size={8} color={premiumColors.primary.main} />
                    <Text style={[styles.requirementText, { color: colors.text }]}>{req}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Course Includes */}
            <View style={[styles.section, { backgroundColor: colors.card }, premiumShadows.sm]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="gift" size={24} color={premiumColors.primary.main} />
                <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: spacing.sm }]}>
                  This Course Includes
                </Text>
              </View>
              <View style={styles.includesList}>
                <IncludeRow
                  icon="play-circle"
                  label={`${totalLessons} video lessons`}
                  colors={colors}
                  isDarkMode={isDarkMode}
                />
                <IncludeRow
                  icon="time-outline"
                  label={`${formatDuration(totalDuration)} of content`}
                  colors={colors}
                  isDarkMode={isDarkMode}
                />
                <IncludeRow
                  icon="ribbon-outline"
                  label="Certificate of completion"
                  colors={colors}
                  isDarkMode={isDarkMode}
                />
                <IncludeRow
                  icon="infinite-outline"
                  label="Full lifetime access"
                  colors={colors}
                  isDarkMode={isDarkMode}
                />
                <IncludeRow
                  icon="phone-portrait-outline"
                  label="Access on mobile & desktop"
                  colors={colors}
                  isDarkMode={isDarkMode}
                />
                <IncludeRow
                  icon="cloud-download-outline"
                  label="Downloadable resources"
                  colors={colors}
                  isDarkMode={isDarkMode}
                  isLast
                />
              </View>
            </View>

            {/* Instructor */}
            {course.instructor && (
              <View style={[styles.section, { backgroundColor: colors.card }, premiumShadows.sm]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person" size={24} color={premiumColors.primary.main} />
                  <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: spacing.sm }]}>
                    Your Instructor
                  </Text>
                </View>
                <View style={[styles.instructorCard, { backgroundColor: isDarkMode ? '#1c1c1e' : '#f8fafc' }]}>
                  <View style={styles.instructorAvatar}>
                    {course.instructor.avatar ? (
                      <Image source={{ uri: course.instructor.avatar }} style={styles.avatarImage} />
                    ) : (
                      <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{course.instructor.name?.charAt(0) || 'T'}</Text>
                      </LinearGradient>
                    )}
                  </View>
                  <View style={styles.instructorInfo}>
                    <Text style={[styles.instructorName, { color: colors.text }]}>{course.instructor.name}</Text>
                    <Text style={[styles.instructorTitle, { color: colors.secondaryText }]}>
                      {course.instructor.title || 'Professional Instructor'}
                    </Text>
                    <View style={styles.instructorStats}>
                      <View style={styles.instructorStat}>
                        <Ionicons name="star" size={14} color="#FCD34D" />
                        <Text style={[styles.instructorStatText, { color: colors.secondaryText }]}>4.8 Rating</Text>
                      </View>
                      <View style={styles.instructorStat}>
                        <Ionicons name="people" size={14} color={colors.secondaryText} />
                        <Text style={[styles.instructorStatText, { color: colors.secondaryText }]}>10K+ Students</Text>
                      </View>
                      <View style={styles.instructorStat}>
                        <Ionicons name="book" size={14} color={colors.secondaryText} />
                        <Text style={[styles.instructorStatText, { color: colors.secondaryText }]}>15 Courses</Text>
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
            <View style={[styles.section, { backgroundColor: colors.card }, premiumShadows.sm]}>
              <View style={styles.curriculumHeader}>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Course Curriculum</Text>
                  <Text style={[styles.lessonCount, { color: colors.secondaryText }]}>
                    {totalLessons} lessons • {formatDuration(totalDuration)} total
                  </Text>
                </View>
              </View>
              {course.lessons?.length > 0 ? (
                <View style={styles.lessonsContainer}>
                  {course.lessons.map((lesson, index) => (
                    <TouchableOpacity
                      key={lesson._id || index}
                      style={[
                        styles.lessonCard,
                        { borderBottomColor: colors.border },
                        (isEnrolled || index === 0) && styles.lessonCardActive
                      ]}
                      onPress={() => {
                        if (isEnrolled || index === 0) {
                          navigation.navigate('Lesson', { courseId: course._id, lessonId: lesson._id });
                        } else {
                          Alert.alert(
                            'Lesson Locked',
                            'Enroll in this course to unlock all lessons.',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Enroll Now', onPress: handlePurchase }
                            ]
                          );
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.lessonLeft}>
                        <View style={[
                          styles.lessonNumber,
                          { backgroundColor: (isEnrolled || index === 0) ? premiumColors.primary.main : colors.border }
                        ]}>
                          {index === 0 && !isEnrolled ? (
                            <Ionicons name="play" size={14} color="#FFFFFF" />
                          ) : (
                            <Text style={[
                              styles.lessonNumberText,
                              { color: (isEnrolled || index === 0) ? '#FFFFFF' : colors.secondaryText }
                            ]}>
                              {index + 1}
                            </Text>
                          )}
                        </View>
                        <View style={styles.lessonInfo}>
                          <View style={styles.lessonTitleRow}>
                            <Text style={[styles.lessonTitle, { color: colors.text }]} numberOfLines={1}>
                              {lesson.title}
                            </Text>
                            {index === 0 && !isEnrolled && (
                              <View style={styles.freeBadge}>
                                <Text style={styles.freeBadgeText}>FREE</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.lessonMeta}>
                            <Ionicons name="time-outline" size={12} color={colors.secondaryText} />
                            <Text style={[styles.lessonDuration, { color: colors.secondaryText }]}>
                              {formatDuration(lesson.duration || 0)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {isEnrolled ? (
                        <Ionicons name="play-circle" size={28} color={premiumColors.primary.main} />
                      ) : index === 0 ? (
                        <Ionicons name="play-circle" size={28} color="#10b981" />
                      ) : (
                        <Ionicons name="lock-closed" size={20} color={colors.secondaryText} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color={colors.secondaryText} />
                  <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No lessons available</Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {activeTab === 'reviews' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            <View style={[styles.section, { backgroundColor: colors.card }, premiumShadows.sm]}>
              <View style={styles.reviewsHeader}>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Student Reviews</Text>
                  <Text style={[styles.reviewsSubtitle, { color: colors.secondaryText }]}>
                    What students are saying
                  </Text>
                </View>
                <View style={styles.ratingOverview}>
                  <View style={styles.ratingCircle}>
                    <Text style={[styles.ratingBig, { color: colors.text }]}>
                      {course.rating?.average?.toFixed(1) || '4.5'}
                    </Text>
                  </View>
                  <View style={styles.ratingDetails}>
                    <Rating rating={course.rating?.average || 0} size={16} showRating={false} />
                    <Text style={[styles.ratingCount, { color: colors.secondaryText }]}>
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </Text>
                  </View>
                </View>
              </View>
              {reviews.length > 0 ? (
                <View style={styles.reviewsList}>
                  {reviews.slice(0, 10).map((review, index) => (
                    <View key={review._id || index} style={[styles.reviewCard, { borderBottomColor: colors.border }]}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewerInfo}>
                          <View style={[styles.reviewerAvatar, { backgroundColor: premiumColors.primary.main }]}>
                            <Text style={styles.reviewerInitial}>{review.user?.name?.charAt(0) || 'U'}</Text>
                          </View>
                          <View style={styles.reviewerDetails}>
                            <Text style={[styles.reviewerName, { color: colors.text }]}>
                              {review.user?.name || 'Anonymous'}
                            </Text>
                            <View style={styles.reviewStars}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                  key={star}
                                  name={star <= review.rating ? 'star' : 'star-outline'}
                                  size={14}
                                  color="#FCD34D"
                                />
                              ))}
                            </View>
                          </View>
                        </View>
                        <Text style={[styles.reviewDate, { color: colors.secondaryText }]}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={[styles.reviewText, { color: colors.secondaryText }]}>{review.comment}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={48} color={colors.secondaryText} />
                  <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No reviews yet</Text>
                  <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                    Be the first to review this course!
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Sticky Enrollment Card */}
      {showStickyCard && (
        <Animated.View style={[styles.stickyCard, { backgroundColor: colors.card }, premiumShadows.xl]}>
          <View style={styles.stickyContent}>
            <Image source={imageSource} style={styles.stickyImage} />
            <View style={styles.stickyInfo}>
              <Text style={[styles.stickyTitle, { color: colors.text }]} numberOfLines={1}>
                {course.title}
              </Text>
              <Text style={[styles.stickyPrice, { color: premiumColors.primary.main }]}>
                {course.isFree ? 'Free' : formatPrice ? formatPrice(course.price) : formatCurrency(course.price, 'GHS')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.stickyButton}
              onPress={isEnrolled ? () => navigation.navigate('Lesson', { courseId: course._id, lessonId: course.lessons?.[0]?._id }) : handlePurchase}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isEnrolled ? ['#10B981', '#059669'] : ['#3B82F6', '#2563EB']}
                style={styles.stickyButtonGradient}
              >
                <Text style={styles.stickyButtonText}>
                  {isEnrolled ? 'Continue' : course.isFree ? 'Enroll Free' : 'Enroll Now'}
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
    paddingBottom: spacing.xxxl,
  },
  heroSection: {
    height: height * 0.4,
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
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  levelBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.full,
  },
  levelText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.full,
    gap: spacing.xs / 2,
  },
  featuredText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroMetaText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  heroMetaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: spacing.sm,
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs,
  },
  heroStatText: {
    fontSize: fontSize.xs,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  enrollmentCard: {
    marginHorizontal: spacing.lg,
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    marginTop: -spacing.xl,
    marginBottom: spacing.lg,
  },
  enrollmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  priceSection: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceText: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: fontSize.lg,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  priceSubtext: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  discountText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  enrollButton: {
    borderRadius: premiumBorderRadius.lg,
    overflow: 'hidden',
  },
  enrollButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  enrollButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trustBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  trustBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs,
  },
  trustBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs,
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: spacing.xs,
    left: '20%',
    right: '20%',
    height: 3,
    borderRadius: 2,
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  description: {
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  learnGrid: {
    gap: spacing.md,
  },
  learnItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  learnIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  learnText: {
    flex: 1,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  requirementsList: {
    gap: spacing.md,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requirementText: {
    flex: 1,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  includesList: {
    gap: 0,
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
  },
  instructorAvatar: {
    marginRight: spacing.md,
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
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  instructorTitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  instructorStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  instructorStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  instructorStatText: {
    fontSize: fontSize.xs,
  },
  curriculumHeader: {
    marginBottom: spacing.lg,
  },
  lessonCount: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  lessonsContainer: {
    gap: 0,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  lessonCardActive: {
    backgroundColor: 'transparent',
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: premiumBorderRadius.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  lessonNumberText: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  lessonTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    flex: 1,
  },
  freeBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.sm,
  },
  freeBadgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  lessonDuration: {
    fontSize: fontSize.xs,
  },
  reviewsHeader: {
    marginBottom: spacing.lg,
  },
  reviewsSubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  ratingCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: premiumColors.primary.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBig: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  ratingDetails: {
    flex: 1,
  },
  ratingCount: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  reviewsList: {
    gap: 0,
  },
  reviewCard: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
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
    marginRight: spacing.md,
  },
  reviewerInitial: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: fontSize.xs,
  },
  reviewText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    marginTop: spacing.md,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  stickyCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  stickyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stickyImage: {
    width: 60,
    height: 40,
    borderRadius: premiumBorderRadius.base,
  },
  stickyInfo: {
    flex: 1,
  },
  stickyTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  stickyPrice: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  stickyButton: {
    borderRadius: premiumBorderRadius.lg,
    overflow: 'hidden',
  },
  stickyButtonGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  stickyButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
