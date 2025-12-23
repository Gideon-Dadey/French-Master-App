import React, { useState, useEffect } from 'react';
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
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import { getCourseImage } from '../src/utils/courseImages';
import Rating from '../src/components/Rating';

const { width } = Dimensions.get('window');

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const { isAuthenticated, user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    curriculum: false,
    reviews: false,
  });

  useEffect(() => {
    loadCourse();
    loadReviews();
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
      console.error('Failed to load reviews:', error);
      setReviews([]);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to enroll in this course',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) }
        ]
      );
      return;
    }

    if (course.isFree) {
      try {
        setPurchasing(true);
        const response = await paymentsAPI.confirm({
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

    setPurchasing(true);
    try {
      const response = await paymentsAPI.createIntent({
        courseId,
        paymentMethod: 'stripe'
      });
      Alert.alert('Success', 'Redirecting to payment...');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Payment failed');
    } finally {
      setPurchasing(false);
    }
  };

  const getLevelColor = (level) => {
    const levelLower = (level || '').toLowerCase();
    switch (levelLower) {
      case 'beginner': return premiumColors.accent.emerald;
      case 'intermediate': return premiumColors.accent.gold;
      case 'advanced': return premiumColors.error;
      default: return premiumColors.primary.main;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading course details..." />;
  }

  if (error || !course) {
    return <ErrorMessage message={error || 'Course not found'} onRetry={loadCourse} />;
  }

  const imageSource = course.thumbnail && (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('https'))
    ? { uri: course.thumbnail }
    : getCourseImage(course._id || course.id, 0);

  const levelColor = getLevelColor(course.level);
  const hasDiscount = course.originalPrice && course.originalPrice > course.price;
  const discountPercent = hasDiscount 
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;
  
  // Use theme primary color for consistency
  const primaryColor = colors.primary;

  return (
    <>
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Video/Image Header */}
        {course.previewVideo ? (
          <VideoPlayer
            source={{ uri: course.previewVideo }}
            thumbnail={course.thumbnail}
            style={styles.videoPlayer}
          />
        ) : (
          <View style={styles.imageHeader}>
            <Image source={imageSource} style={styles.headerImage} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            />
            <View style={styles.headerBadges}>
              {hasDiscount && (
                <View style={[styles.discountBadge, { backgroundColor: premiumColors.error }]}>
                  <Text style={styles.discountText}>-{discountPercent}%</Text>
                </View>
              )}
              {course.isFree && (
                <View style={[styles.freeBadge, { backgroundColor: premiumColors.accent.emerald }]}>
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.content}>
          {/* Premium Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>
                {course.title}
              </Text>
              <WishlistButton courseId={course._id} style={styles.wishlistButton} />
            </View>

            {/* Premium Meta Info */}
            <View style={styles.metaRow}>
              <View style={styles.ratingContainer}>
                <Rating 
                  rating={course.rating?.average || 0} 
                  size={18}
                  showRating={true}
                />
                <Text style={[styles.ratingCount, { color: colors.secondaryText }]}>
                  ({course.rating?.count || 0} reviews)
                </Text>
              </View>
              <View style={styles.studentsContainer}>
                <Ionicons name="people" size={16} color={colors.secondaryText} />
                <Text style={[styles.studentsText, { color: colors.secondaryText }]}>
                  {course.studentsEnrolled || 0} students
                </Text>
              </View>
            </View>

            {/* Premium Price Section */}
            <View style={[styles.priceSection, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
              <View style={styles.priceRow}>
                {hasDiscount && (
                  <View style={styles.originalPriceContainer}>
                    <Text style={[styles.originalPrice, { color: colors.secondaryText }]}>
                      {formatCurrency(course.originalPrice, 'GHS')}
                    </Text>
                  </View>
                )}
                <Text style={[styles.price, { color: primaryColor }]}>
                  {course.isFree ? 'FREE' : formatCurrency(course.price, 'GHS')}
                </Text>
                {hasDiscount && (
                  <View style={[styles.discountTag, { backgroundColor: premiumColors.error + '20' }]}>
                    <Text style={[styles.discountTagText, { color: premiumColors.error }]}>
                      Save {discountPercent}%
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Premium Badges */}
            <View style={styles.badgesRow}>
              <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
                <Ionicons name="star" size={14} color="#FFFFFF" />
                <Text style={styles.levelBadgeText}>{course.level || 'All Levels'}</Text>
              </View>
              <View style={[styles.categoryBadge, { backgroundColor: primaryColor + '20' }]}>
                <Text style={[styles.categoryBadgeText, { color: primaryColor }]}>
                  {course.category?.toUpperCase() || 'COURSE'}
                </Text>
              </View>
              <View style={[styles.durationBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
                <Text style={[styles.durationBadgeText, { color: colors.secondaryText }]}>
                  {course.duration || 0}h
                </Text>
              </View>
              <View style={[styles.lessonsBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="book-outline" size={14} color={colors.secondaryText} />
                <Text style={[styles.lessonsBadgeText, { color: colors.secondaryText }]}>
                  {course.totalLessons || course.lessons?.length || 0} lessons
                </Text>
              </View>
            </View>
          </View>

          {/* Enhanced Description Section */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={24} color={primaryColor} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>About This Course</Text>
            </View>
            <Text style={[styles.description, { color: colors.text }]}>
              {course.description || course.shortDescription || 'No description available.'}
            </Text>
            {course.shortDescription && course.description && course.shortDescription !== course.description && (
              <Text style={[styles.extendedDescription, { color: colors.secondaryText }]}>
                {course.description}
              </Text>
            )}
          </View>

          {/* What You'll Learn - Premium */}
          {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={24} color={premiumColors.accent.emerald} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>What You'll Learn</Text>
              </View>
              <View style={styles.learnGrid}>
                {course.whatYouWillLearn.map((item, index) => (
                  <View key={index} style={styles.learnItem}>
                    <View style={[styles.checkIcon, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
                      <Ionicons name="checkmark" size={16} color={premiumColors.accent.emerald} />
                    </View>
                    <Text style={[styles.learnText, { color: colors.text }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Course Highlights */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash" size={24} color={premiumColors.accent.gold} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Course Highlights</Text>
            </View>
            <View style={styles.highlightsGrid}>
              <HighlightItem
                icon="videocam"
                title="Video Lessons"
                value={`${course.totalLessons || course.lessons?.length || 0}+`}
                color={premiumColors.primary.main}
                colors={colors}
              />
              <HighlightItem
                icon="time"
                title="Duration"
                value={`${course.duration || 0} hours`}
                color={premiumColors.accent.sky}
                colors={colors}
              />
              <HighlightItem
                icon="trophy"
                title="Certificate"
                value={course.certificate?.enabled ? 'Included' : 'Not included'}
                color={premiumColors.accent.gold}
                colors={colors}
              />
              <HighlightItem
                icon="infinite"
                title="Lifetime Access"
                value="Yes"
                color={premiumColors.accent.emerald}
                colors={colors}
              />
            </View>
          </View>

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={24} color={premiumColors.accent.rose} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Requirements</Text>
              </View>
              {course.requirements.map((item, index) => (
                <View key={index} style={styles.requirementItem}>
                  <View style={[styles.requirementBullet, { backgroundColor: premiumColors.accent.rose + '20' }]}>
                    <Ionicons name="ellipse" size={8} color={premiumColors.accent.rose} />
                  </View>
                  <Text style={[styles.requirementText, { color: colors.text }]}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Course Curriculum */}
          {course.lessons && course.lessons.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="library" size={24} color={primaryColor} />
                <View style={styles.sectionHeaderText}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Course Curriculum</Text>
                  <Text style={[styles.contentSubtitle, { color: colors.secondaryText }]}>
                    {course.totalLessons || course.lessons.length} sections • {course.duration || 0} total hours
                  </Text>
                </View>
              </View>
              <View style={styles.curriculum}>
                {course.lessons.slice(0, expandedSections.curriculum ? course.lessons.length : 5).map((lesson, index) => (
                  <View key={lesson._id || index} style={[styles.lessonItem, { borderBottomColor: colors.border }]}>
                    <View style={[styles.lessonNumber, { backgroundColor: primaryColor + '20' }]}>
                      <Text style={[styles.lessonNumberText, { color: primaryColor }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.lessonContent}>
                      <Text style={[styles.lessonTitle, { color: colors.text }]} numberOfLines={2}>
                        {lesson.title || `Lesson ${index + 1}`}
                      </Text>
                      {lesson.videoDuration && (
                        <Text style={[styles.lessonDuration, { color: colors.secondaryText }]}>
                          {formatDuration(lesson.videoDuration)}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="play-circle-outline" size={24} color={colors.secondaryText} />
                  </View>
                ))}
                {course.lessons.length > 5 && (
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => setExpandedSections({ ...expandedSections, curriculum: !expandedSections.curriculum })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.expandButtonText, { color: primaryColor }]}>
                      {expandedSections.curriculum 
                        ? 'Show Less' 
                        : `View all ${course.lessons.length} lessons`}
                    </Text>
                    <Ionicons 
                      name={expandedSections.curriculum ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={primaryColor} 
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Premium Instructor Section */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle" size={24} color={premiumColors.accent.gold} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Instructor</Text>
            </View>
            <View style={[styles.instructorCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Image
                source={{ uri: course.instructor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor?.name || 'Instructor')}&background=9C27B0&color=fff&size=200` }}
                style={styles.instructorAvatar}
              />
              <View style={styles.instructorInfo}>
                <Text style={[styles.instructorName, { color: colors.text }]}>
                  {course.instructor?.name || 'Expert Instructor'}
                </Text>
                {course.instructor?.bio && (
                  <Text style={[styles.instructorBio, { color: colors.secondaryText }]} numberOfLines={3}>
                    {course.instructor.bio}
                  </Text>
                )}
                <View style={styles.instructorStats}>
                  <View style={[styles.instructorStatItem, { backgroundColor: premiumColors.accent.gold + '20' }]}>
                    <Ionicons name="star" size={14} color={premiumColors.accent.gold} />
                    <Text style={[styles.instructorStatText, { color: colors.text }]}>4.8 Rating</Text>
                  </View>
                  <View style={[styles.instructorStatItem, { backgroundColor: primaryColor + '20' }]}>
                    <Ionicons name="people" size={14} color={primaryColor} />
                    <Text style={[styles.instructorStatText, { color: colors.text }]}>
                      {course.studentsEnrolled || 0} Students
                    </Text>
                  </View>
                  <View style={[styles.instructorStatItem, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
                    <Ionicons name="book" size={14} color={premiumColors.accent.emerald} />
                    <Text style={[styles.instructorStatText, { color: colors.text }]}>10+ Courses</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Premium Reviews Section */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={24} color={premiumColors.accent.gold} />
              <View style={styles.sectionHeaderText}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Student Reviews</Text>
                <Text style={[styles.reviewsCount, { color: colors.secondaryText }]}>
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </Text>
              </View>
            </View>
            {reviews.length > 0 ? (
              <>
                {reviews.slice(0, expandedSections.reviews ? reviews.length : 3).map((review) => (
                  <ReviewCard key={review._id} review={review} colors={colors} />
                ))}
                {reviews.length > 3 && (
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => setExpandedSections({ ...expandedSections, reviews: !expandedSections.reviews })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.expandButtonText, { color: primaryColor }]}>
                      {expandedSections.reviews ? 'Show Less' : `View all ${reviews.length} reviews`}
                    </Text>
                    <Ionicons 
                      name={expandedSections.reviews ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={primaryColor} 
                    />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.noReviewsContainer}>
                <Ionicons name="star-outline" size={48} color={colors.secondaryText} />
                <Text style={[styles.noReviews, { color: colors.secondaryText }]}>
                  No reviews yet. Be the first to review this course!
                </Text>
              </View>
            )}
          </View>

          {/* Premium Enrollment Button */}
          <TouchableOpacity
            style={[styles.purchaseButton, purchasing && styles.purchaseButtonDisabled, premiumShadows.lg]}
            onPress={handlePurchase}
            disabled={purchasing}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={course.isFree 
                ? [premiumColors.accent.emerald, premiumColors.accent.emerald + 'DD']
                : [primaryColor, colors.primaryHover || primaryColor + 'DD']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.purchaseButtonGradient}
            >
              {purchasing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name={course.isFree ? 'lock-open' : 'card'} size={24} color="#FFFFFF" />
                  <Text style={styles.purchaseButtonText}>
                    {course.isFree 
                      ? 'Enroll for Free' 
                      : `Enroll Now - ${formatCurrency(course.price, 'GHS')}`}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Certificate Modal */}
      {showCertificate && course && (
        <CertificateView
          course={course}
          userName={user?.name || 'Student'}
          completionDate={new Date()}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </>
  );
}

function HighlightItem({ icon, title, value, color, colors }) {
  return (
    <View style={[styles.highlightItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.highlightIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.highlightTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.highlightValue, { color: color }]}>{value}</Text>
    </View>
  );
}

function ReviewCard({ review, colors }) {
  return (
    <View style={[styles.reviewCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAuthor}>
          <View style={[styles.reviewAvatar, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.reviewName, { color: colors.text }]}>
              {review.user?.name || 'Anonymous'}
            </Text>
            <View style={styles.reviewRating}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < review.rating ? 'star' : 'star-outline'}
                  size={14}
                  color="#FFD700"
                />
              ))}
            </View>
          </View>
        </View>
        <Text style={[styles.reviewDate, { color: colors.secondaryText }]}>
          {new Date(review.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {review.comment && (
        <Text style={[styles.reviewComment, { color: colors.text }]}>
          {review.comment}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoPlayer: {
    width: '100%',
    height: 220,
  },
  imageHeader: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  headerBadges: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  discountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  freeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
  },
  freeBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
  },
  headerSection: {
    marginBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  wishlistButton: {
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingCount: {
    fontSize: fontSize.sm,
  },
  studentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  studentsText: {
    fontSize: fontSize.sm,
  },
  priceSection: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  originalPriceContainer: {
    marginRight: spacing.xs,
  },
  originalPrice: {
    fontSize: fontSize.lg,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  price: {
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  discountTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: premiumBorderRadius.base,
  },
  discountTagText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.full,
    gap: spacing.xs / 2,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.full,
  },
  categoryBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.full,
    borderWidth: 1,
    gap: spacing.xs / 2,
  },
  durationBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  lessonsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.full,
    borderWidth: 1,
    gap: spacing.xs / 2,
  },
  lessonsBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  section: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: fontSize.md,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  extendedDescription: {
    fontSize: fontSize.md,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  learnGrid: {
    gap: spacing.md,
  },
  learnItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  learnText: {
    flex: 1,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  highlightItem: {
    width: '48%',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  highlightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  highlightTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  highlightValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  requirementBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  requirementText: {
    flex: 1,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  contentSubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs / 2,
  },
  curriculum: {
    marginTop: spacing.md,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumberText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  lessonDuration: {
    fontSize: fontSize.sm,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  expandButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  instructorCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  instructorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  instructorBio: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  instructorStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  instructorStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs / 2,
  },
  instructorStatText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  reviewsCount: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs / 2,
  },
  reviewCard: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  reviewAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: fontSize.xs,
  },
  reviewComment: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noReviews: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  purchaseButton: {
    borderRadius: premiumBorderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    height: 64,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: spacing.sm,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
