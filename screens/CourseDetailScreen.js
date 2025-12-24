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
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { coursesAPI, paymentsAPI, reviewsAPI } from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import VideoPlayer from '../components/VideoPlayer';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import WishlistButton from '../src/components/WishlistButton';
import CertificateView from '../src/components/CertificateView';
import { formatCurrency } from '../src/utils/helpers';
import { spacing, fontSize } from '../src/utils/responsive';
import { getCourseImage } from '../src/utils/courseImages';
import Rating from '../src/components/Rating';
import { useCurrency } from '../src/context/CurrencyContext';

const { width, height } = Dimensions.get('window');

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

  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCourse();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [courseId]);

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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this course: ${course.title}`,
        title: course.title,
      });
    } catch (error) {}
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Image */}
      <Animated.View style={[styles.headerImage, { opacity: fadeAnim }]}>
        <Image source={imageSource} style={styles.coverImage} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.imageOverlay} />

        {/* Back & Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <WishlistButton courseId={course._id} size={22} color="#FFFFFF" style={styles.headerBtn} />
          </View>
        </View>

        {/* Course Info Overlay */}
        <View style={styles.headerInfo}>
          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(course.level) }]}>
            <Text style={styles.levelText}>{course.level || 'All Levels'}</Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={2}>{course.title}</Text>
          <View style={styles.headerMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color="#FCD34D" />
              <Text style={styles.metaText}>{course.rating?.average?.toFixed(1) || '4.5'}</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Ionicons name="people" size={16} color="#FFFFFF" />
              <Text style={styles.metaText}>{course.enrolledCount || 0} students</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color="#FFFFFF" />
              <Text style={styles.metaText}>{formatDuration(totalDuration)}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Price & Enroll Card */}
        <View style={[styles.priceCard, { backgroundColor: colors.card }]}>
          <View style={styles.priceRow}>
            <View>
              {course.isFree ? (
                <Text style={[styles.priceText, { color: '#10B981' }]}>Free</Text>
              ) : (
                <View style={styles.priceColumn}>
                  <Text style={[styles.priceText, { color: colors.text }]}>
                    {formatPrice ? formatPrice(course.price) : formatCurrency(course.price, 'GHS')}
                  </Text>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <Text style={styles.originalPrice}>
                      {formatPrice ? formatPrice(course.originalPrice) : formatCurrency(course.originalPrice, 'GHS')}
                    </Text>
                  )}
                </View>
              )}
            </View>
            {isEnrolled ? (
              <TouchableOpacity
                style={styles.continueBtn}
                onPress={() => navigation.navigate('Lesson', { courseId: course._id, lessonId: course.lessons?.[0]?._id })}
              >
                <LinearGradient colors={['#10B981', '#059669']} style={styles.enrollGradient}>
                  <Ionicons name="play" size={18} color="#FFFFFF" />
                  <Text style={styles.enrollText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.enrollBtn} onPress={handlePurchase} disabled={purchasing}>
                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.enrollGradient}>
                  {purchasing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name={course.isFree ? 'school' : 'cart'} size={18} color="#FFFFFF" />
                      <Text style={styles.enrollText}>{course.isFree ? 'Enroll Free' : 'Enroll Now'}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: colors.card }]}>
          {['about', 'curriculum', 'reviews'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? '#3B82F6' : colors.secondaryText }]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {/* Description */}
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>About This Course</Text>
              <Text style={[styles.description, { color: colors.secondaryText }]}>
                {course.description || 'No description available.'}
              </Text>
            </View>

            {/* What You'll Learn */}
            {course.whatYoullLearn?.length > 0 && (
              <View style={[styles.section, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>What You'll Learn</Text>
                {course.whatYoullLearn.map((item, index) => (
                  <View key={index} style={styles.learnItem}>
                    <View style={styles.learnIcon}>
                      <Ionicons name="checkmark" size={16} color="#10B981" />
                    </View>
                    <Text style={[styles.learnText, { color: colors.text }]}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Course Stats */}
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Course Includes</Text>
              <View style={styles.statsGrid}>
                <StatItem icon="play-circle" label="Lessons" value={totalLessons} colors={colors} />
                <StatItem icon="time" label="Duration" value={formatDuration(totalDuration)} colors={colors} />
                <StatItem icon="ribbon" label="Certificate" value="Yes" colors={colors} />
                <StatItem icon="infinite" label="Access" value="Lifetime" colors={colors} />
              </View>
            </View>

            {/* Instructor */}
            {course.instructor && (
              <View style={[styles.section, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Instructor</Text>
                <View style={styles.instructorRow}>
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
                      {course.instructor.title || 'French Instructor'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {activeTab === 'curriculum' && (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <View style={styles.curriculumHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Course Curriculum</Text>
                <Text style={[styles.lessonCount, { color: colors.secondaryText }]}>
                  {totalLessons} lessons • {formatDuration(totalDuration)}
                </Text>
              </View>
              {course.lessons?.length > 0 ? (
                course.lessons.map((lesson, index) => (
                  <TouchableOpacity
                    key={lesson._id || index}
                    style={[styles.lessonCard, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      if (isEnrolled) {
                        navigation.navigate('Lesson', { courseId: course._id, lessonId: lesson._id });
                      } else {
                        toggleLesson(index);
                      }
                    }}
                  >
                    <View style={styles.lessonLeft}>
                      <View style={[styles.lessonNumber, { backgroundColor: isEnrolled ? '#3B82F6' : colors.border }]}>
                        <Text style={[styles.lessonNumberText, { color: isEnrolled ? '#FFFFFF' : colors.secondaryText }]}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text style={[styles.lessonTitle, { color: colors.text }]}>{lesson.title}</Text>
                        <View style={styles.lessonMeta}>
                          <Ionicons name="time-outline" size={12} color={colors.secondaryText} />
                          <Text style={[styles.lessonDuration, { color: colors.secondaryText }]}>
                            {formatDuration(lesson.duration || 0)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {isEnrolled ? (
                      <Ionicons name="play-circle" size={28} color="#3B82F6" />
                    ) : (
                      <Ionicons name="lock-closed" size={20} color={colors.secondaryText} />
                    )}
                  </TouchableOpacity>
                ))
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
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <View style={styles.reviewsHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Student Reviews</Text>
                <View style={styles.ratingOverview}>
                  <Ionicons name="star" size={24} color="#FCD34D" />
                  <Text style={[styles.ratingBig, { color: colors.text }]}>
                    {course.rating?.average?.toFixed(1) || '4.5'}
                  </Text>
                  <Text style={[styles.ratingCount, { color: colors.secondaryText }]}>
                    ({reviews.length} reviews)
                  </Text>
                </View>
              </View>
              {reviews.length > 0 ? (
                reviews.slice(0, 5).map((review, index) => (
                  <View key={review._id || index} style={[styles.reviewCard, { borderBottomColor: colors.border }]}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewerInfo}>
                        <View style={[styles.reviewerAvatar, { backgroundColor: '#3B82F6' }]}>
                          <Text style={styles.reviewerInitial}>{review.user?.name?.charAt(0) || 'U'}</Text>
                        </View>
                        <View>
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
                    </View>
                    <Text style={[styles.reviewText, { color: colors.secondaryText }]}>{review.comment}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubbles-outline" size={48} color={colors.secondaryText} />
                  <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No reviews yet</Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Certificate Modal */}
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

function StatItem({ icon, label, value, colors }) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: '#3B82F6' + '15' }]}>
        <Ionicons name={icon} size={20} color="#3B82F6" />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    height: height * 0.35,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  headerActions: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  headerInfo: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 10,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  priceCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceColumn: {},
  priceText: {
    fontSize: 28,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 16,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  enrollBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  continueBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  enrollGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  enrollText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#3B82F6' + '15',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  section: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  learnItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  learnIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  learnText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    width: (width - 72) / 2,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorAvatar: {
    marginRight: 14,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructorInfo: {},
  instructorName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  instructorTitle: {
    fontSize: 13,
  },
  curriculumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lessonCount: {
    fontSize: 13,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonNumber: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBig: {
    fontSize: 20,
    fontWeight: '800',
  },
  ratingCount: {
    fontSize: 13,
  },
  reviewCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  reviewHeader: {
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});
