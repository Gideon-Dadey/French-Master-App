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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { coursesAPI, paymentsAPI, reviewsAPI } from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import WishlistButton from '../src/components/WishlistButton';
import CertificateView from '../src/components/CertificateView';
import { formatCurrency } from '../src/utils/helpers';
import { spacing, fontSize } from '../src/utils/responsive';

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

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
      // Handle free enrollment
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

      // Navigate to payment screen or process payment
      Alert.alert('Success', 'Redirecting to payment...');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Payment failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading course details..." />;
  }

  if (error || !course) {
    return <ErrorMessage message={error || 'Course not found'} onRetry={loadCourse} />;
  }

  return (
    <>
    <ScrollView style={styles.container}>
      {course.previewVideo && (
        <VideoPlayer
          source={{ uri: course.previewVideo }}
          thumbnail={course.thumbnail}
          style={styles.videoPlayer}
        />
      )}

      <View style={styles.content}>
        {/* Header with Wishlist Button */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
          <WishlistButton courseId={course._id} style={styles.wishlistButton} />
        </View>
        
        <View style={styles.meta}>
          <View style={styles.rating}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {course.rating?.average?.toFixed(1) || '0.0'} ({course.rating?.count || 0})
            </Text>
          </View>
          <Text style={styles.students}>
            {course.studentsEnrolled || 0} students
          </Text>
        </View>

        <View style={styles.priceContainer}>
          {course.originalPrice && course.originalPrice > course.price && (
            <Text style={styles.originalPrice}>
              {formatCurrency(course.originalPrice, 'GHS')}
            </Text>
          )}
          <Text style={styles.price}>
            {course.isFree ? 'FREE' : formatCurrency(course.price, 'GHS')}
          </Text>
        </View>

        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{course.level}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{course.category}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{course.duration}h</Text>
          </View>
        </View>

        <Text style={styles.description}>{course.description}</Text>

        {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What you'll learn</Text>
            {course.whatYouWillLearn.map((item, index) => (
              <View key={index} style={styles.learnItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.learnText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {course.requirements && course.requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            {course.requirements.map((item, index) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="ellipse" size={8} color="#757575" style={styles.bullet} />
                <Text style={styles.requirementText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {course.lessons && course.lessons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Course Content</Text>
            <Text style={styles.contentSubtitle}>
              {course.totalLessons || course.lessons.length} sections • {course.duration || 0} total hours
            </Text>
            <View style={styles.curriculum}>
              {course.lessons.slice(0, 5).map((lesson, index) => (
                <View key={lesson._id || index} style={styles.lessonItem}>
                  <Ionicons name="play-circle-outline" size={20} color="#757575" />
                  <Text style={styles.lessonTitle} numberOfLines={1}>
                    {lesson.title || `Lesson ${index + 1}`}
                  </Text>
                  {lesson.videoDuration && (
                    <Text style={styles.lessonDuration}>{lesson.videoDuration}</Text>
                  )}
                </View>
              ))}
              {course.lessons.length > 5 && (
                <TouchableOpacity style={styles.viewMoreButton}>
                  <Text style={styles.viewMoreText}>
                    View all {course.lessons.length} lessons
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#1E88E5" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructor</Text>
          <TouchableOpacity 
            style={styles.instructorCard}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: course.instructor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor?.name || 'Instructor')}&background=1E88E5&color=fff&size=100` }}
              style={styles.instructorAvatar}
            />
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorName}>{course.instructor?.name || 'Expert Instructor'}</Text>
              {course.instructor?.bio && (
                <Text style={styles.instructorBio} numberOfLines={2}>
                  {course.instructor.bio}
                </Text>
              )}
              <View style={styles.instructorStats}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.statText}>4.8 Instructor Rating</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={14} color="#757575" />
                  <Text style={styles.statText}>{course.studentsEnrolled || 0} Students</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {reviews.length > 0 ? (
            reviews.slice(0, 3).map((review) => (
              <View key={review._id} style={styles.review}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>{review.user?.name || 'Anonymous'}</Text>
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
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>No reviews yet</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.purchaseButton, purchasing && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.purchaseButtonText}>
                {course.isFree ? 'Enroll for Free' : `Enroll Now - ${formatCurrency(course.price, 'GHS')}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: 220,
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#212121',
    lineHeight: 32,
  },
  wishlistButton: {
    marginTop: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 15,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  students: {
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#1E88E5',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  learnItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  learnText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  instructorCard: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    gap: spacing.md,
  },
  instructorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0E0E0',
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#212121',
    marginBottom: spacing.xs,
  },
  instructorBio: {
    fontSize: fontSize.sm,
    color: '#757575',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  instructorStats: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: fontSize.sm,
    color: '#757575',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  bullet: {
    marginTop: 6,
  },
  requirementText: {
    flex: 1,
    fontSize: fontSize.md,
    color: '#666',
    lineHeight: 22,
  },
  contentSubtitle: {
    fontSize: fontSize.sm,
    color: '#757575',
    marginBottom: spacing.md,
  },
  curriculum: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: spacing.sm,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  lessonTitle: {
    flex: 1,
    fontSize: fontSize.md,
    color: '#424242',
  },
  lessonDuration: {
    fontSize: fontSize.sm,
    color: '#757575',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.xs,
  },
  viewMoreText: {
    fontSize: fontSize.md,
    color: '#1E88E5',
    fontWeight: '600',
  },
  review: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  noReviews: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  purchaseButton: {
    backgroundColor: '#1E88E5',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

