import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
  Modal,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { coursesAPI, paymentsAPI } from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import CertificateView from '../src/components/CertificateView';
import { getCourseImage } from '../src/utils/courseImages';
import { getThemeColors, themeShadows } from '../src/utils/organicTheme';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = width * 0.56; // 16:9 aspect ratio

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const { isAuthenticated, user, loadUser } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);

  // L'Alliance Theme Colors - derived from Organic Theme
  const bgColor = theme.background;
  const cardColor = theme.surface;
  const textColor = theme.text;
  const subTextColor = theme.textSecondary;
  const accentColor = theme.primary;
  const goldColor = theme.secondary;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);
  const [enrolledSuccessfully, setEnrolledSuccessfully] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Calculate Progress
  const enrollment = user?.enrolledCourses?.find(ec => (ec.course?._id || ec.course) === (courseId));
  const progressPercent = enrollment?.progress || 0;
  const isCompleted = progressPercent === 100;

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesAPI.getById(courseId);
      if (response.data.data) {
        setCourse(response.data.data);
      } else {
        setError('Course not found');
      }
    } catch (error) {
      setError('Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to enroll.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
      ]);
      return;
    }

    try {
      setPurchasing(true);
      await paymentsAPI.enrollFree({ courseId });
      setEnrolledSuccessfully(true);
      await loadUser();

      const updatedCourse = await coursesAPI.getById(courseId);
      if (updatedCourse?.data?.data) {
        setCourse(updatedCourse.data.data);
      }

      setTimeout(() => {
        setEnrolledSuccessfully(false);
      }, 2500);

    } catch (error) {
      Alert.alert('Enrollment Failed', 'Please try again later.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleUnenrollConfirm = () => {
    Alert.alert(
      'Leave Course',
      'Are you sure you want to unenroll? You can always enroll again later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unenroll',
          style: 'destructive',
          onPress: handleUnenroll
        }
      ]
    );
  };

  const handleUnenroll = async () => {
    try {
      setLoading(true);
      await paymentsAPI.unenroll({ courseId });
      await loadUser();
      const updatedCourse = await coursesAPI.getById(courseId);
      if (updatedCourse?.data?.data) {
        setCourse(updatedCourse.data.data);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to unenroll.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) return <LoadingSpinner />;
  if (error || !course) return <ErrorMessage message={error || 'Course not found'} onRetry={loadCourse} />;

  const isEnrolled = course.isEnrolled || user?.enrolledCourses?.some(ec => (ec.course?._id || ec.course) === (course._id || courseId));
  const totalLessons = course.lessons?.length || 0;
  const totalDuration = course.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0;

  const imageSource = course.thumbnail && course.thumbnail.startsWith('http')
    ? { uri: course.thumbnail }
    : getCourseImage(course._id, 0, course.category, course.title);

  const startActionLabel = isEnrolled ? 'Continue Learning' : 'Enroll Now — Free';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1c1d1f" />

      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="share-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          {isEnrolled && (
            <TouchableOpacity style={styles.headerIconBtn} onPress={handleUnenrollConfirm}>
              <Ionicons name="ellipsis-vertical" size={22} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Video Preview Section - Udemy Style */}
        <View style={styles.videoContainer}>
          <ImageBackground
            source={imageSource}
            style={styles.videoThumbnail}
            imageStyle={styles.videoImage}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
              style={styles.videoOverlay}
            >
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => {
                  if (isEnrolled && course.lessons?.[0]) {
                    navigation.navigate('Lesson', { courseId, lessonId: course.lessons[0]._id });
                  } else {
                    handlePurchase();
                  }
                }}
              >
                <View style={styles.playButtonInner}>
                  <Ionicons name="play" size={32} color="#FFF" style={{ marginLeft: 4 }} />
                </View>
              </TouchableOpacity>
              <Text style={styles.previewText}>Preview this course</Text>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Course Info Section */}
        <View style={styles.courseInfo}>
          {/* Title */}
          <Text style={styles.courseTitle}>{course.title}</Text>

          {/* Short Description */}
          <Text style={styles.courseSubtitle} numberOfLines={2}>
            {course.description?.substring(0, 100) || 'Master the fundamentals and advance your skills'}
          </Text>

          {/* Rating and Stats */}
          <View style={styles.statsRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{course.rating?.average?.toFixed(1) || '4.5'}</Text>
            </View>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(course.rating?.average || 4.5) ? 'star' : 'star-outline'}
                  size={14}
                  color="#f3ca8c"
                />
              ))}
            </View>
            <Text style={styles.statsText}>({course.rating?.count || '128'} ratings)</Text>
            <Text style={styles.statsText}>• {course.enrolledCount || '1,234'} students</Text>
          </View>

          {/* Instructor */}
          <View style={styles.instructorRow}>
            <Text style={styles.instructorLabel}>Created by </Text>
            <Text style={styles.instructorName}>{course.instructor?.name || 'French Master'}</Text>
          </View>

          {/* Meta Info */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="alert-circle-outline" size={16} color={subTextColor} />
              <Text style={styles.metaText}>Last updated 12/2024</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="globe-outline" size={16} color={subTextColor} />
              <Text style={styles.metaText}>English / French</Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.enrollButton, isEnrolled && styles.enrolledButton]}
            onPress={isEnrolled ? () => navigation.navigate('Lesson', { courseId, lessonId: course.lessons?.[0]?._id }) : handlePurchase}
          >
            <Text style={styles.enrollButtonText}>{startActionLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* What You'll Learn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What you'll learn</Text>
          <View style={styles.learnCard}>
            {(course.objectives || [
              'Understand core concepts thoroughly',
              'Apply knowledge in practical scenarios',
              'Build confidence in the subject',
              'Master advanced techniques'
            ]).slice(0, 4).map((item, index) => (
              <View key={index} style={styles.learnItem}>
                <Ionicons name="checkmark" size={18} color={goldColor} />
                <Text style={styles.learnText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Course Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course content</Text>
          <Text style={styles.contentSummary}>
            {totalLessons} lessons • {formatDuration(totalDuration)} total length
          </Text>

          <View style={styles.lessonsCard}>
            {course.lessons?.map((lesson, index) => {
              const isLocked = !isEnrolled && index !== 0;

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!isLocked) navigation.navigate('Lesson', { courseId, lessonId: lesson._id });
                    else handlePurchase();
                  }}
                  style={[
                    styles.lessonItem,
                    index !== (course.lessons?.length || 0) - 1 && styles.lessonBorder
                  ]}
                >
                  <View style={styles.lessonLeft}>
                    {isLocked ? (
                      <View style={styles.lessonIconLocked}>
                        <Ionicons name="lock-closed" size={16} color="#6a6f73" />
                      </View>
                    ) : (
                      <View style={styles.lessonIconPlay}>
                        <Ionicons name="play-circle" size={24} color={goldColor} />
                      </View>
                    )}
                    <View style={styles.lessonInfo}>
                      <Text style={[styles.lessonTitle, isLocked && styles.lessonTitleLocked]} numberOfLines={2}>
                        {lesson.title}
                      </Text>
                      <Text style={styles.lessonDuration}>{formatDuration(lesson.duration)}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6a6f73" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {course.description || 'No description available.'}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar - Fixed */}
      <View style={styles.bottomBar}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>{isEnrolled ? (isCompleted ? 'Finished' : 'Progress') : 'Price'}</Text>
          <Text style={styles.priceValue}>{isEnrolled ? (isCompleted ? '✓ Completed' : `${progressPercent}%`) : 'Free'}</Text>
        </View>

        {isCompleted ? (
          <TouchableOpacity
            style={[styles.bottomButton, { backgroundColor: goldColor }]}
            onPress={() => setShowCertificate(true)}
          >
            <Ionicons name="ribbon-outline" size={20} color="#1A2332" />
            <Text style={styles.bottomButtonText}>View Certificate</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.bottomButton, isEnrolled && styles.bottomButtonEnrolled]}
            onPress={isEnrolled ? () => navigation.navigate('Lesson', { courseId, lessonId: course.lessons?.[0]?._id }) : handlePurchase}
          >
            <Text style={styles.bottomButtonText}>
              {isEnrolled ? 'Continue Course' : 'Enroll Now'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Success Modal */}
      <Modal visible={enrolledSuccessfully} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color={goldColor} />
            </View>
            <Text style={styles.successTitle}>You're In!</Text>
            <Text style={styles.successSub}>Start learning now.</Text>
          </View>
        </View>
      </Modal>

      {/* Certificate Modal */}
      <Modal visible={showCertificate} transparent animationType="slide">
        <View style={styles.certificateOverlay}>
          <CertificateView
            course={course}
            userName={user?.name || 'Student'}
            completionDate={enrollment?.completedAt || new Date()}
            onClose={() => setShowCertificate(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#0D1B2A',
    zIndex: 100,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },

  // Video Preview
  videoContainer: {
    width: '100%',
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoImage: {
    resizeMode: 'cover',
  },
  videoOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  playButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Course Info
  courseInfo: {
    padding: 16,
    backgroundColor: '#1c1d1f',
  },
  courseTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 8,
  },
  courseSubtitle: {
    color: '#d1d7dc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  ratingBadge: {
    backgroundColor: '#eceb98',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  ratingText: {
    color: '#3d3c0a',
    fontSize: 12,
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    marginRight: 6,
  },
  statsText: {
    color: '#a1a1a1',
    fontSize: 12,
    marginRight: 4,
  },
  instructorRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  instructorLabel: {
    color: '#a1a1a1',
    fontSize: 13,
  },
  instructorName: {
    color: '#C9A227',
    fontSize: 13,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#a1a1a1',
    fontSize: 12,
  },

  // CTA
  ctaSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#0D1B2A',
  },
  enrollButton: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  enrolledButton: {
    backgroundColor: '#2E7D5A',
  },
  enrollButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Sections
  section: {
    padding: 16,
    backgroundColor: '#0D1B2A',
    borderTopWidth: 1,
    borderTopColor: '#1B2838',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },

  // What You'll Learn
  learnCard: {
    backgroundColor: '#1B2838',
    borderRadius: 12,
    padding: 16,
  },
  learnItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  learnText: {
    color: '#d1d7dc',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },

  // Course Content
  contentSummary: {
    color: '#a1a1a1',
    fontSize: 13,
    marginBottom: 12,
  },
  lessonsCard: {
    backgroundColor: '#1B2838',
    borderRadius: 12,
    overflow: 'hidden',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  lessonBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#2D3E50',
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  lessonIconPlay: {
    marginRight: 12,
  },
  lessonIconLocked: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 20,
  },
  lessonTitleLocked: {
    color: '#6a6f73',
  },
  lessonDuration: {
    color: '#a1a1a1',
    fontSize: 12,
  },

  // Description
  descriptionText: {
    color: '#d1d7dc',
    fontSize: 14,
    lineHeight: 22,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B2838',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#2D3E50',
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    color: '#a1a1a1',
    fontSize: 12,
  },
  priceValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  bottomButton: {
    backgroundColor: '#C9A227',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bottomButtonEnrolled: {
    backgroundColor: '#2E7D5A',
  },
  bottomButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    backgroundColor: '#1B2838',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    width: width * 0.8,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    color: '#F0EBE3',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  successSub: {
    color: '#A8B4C4',
    fontSize: 16,
  },
  certificateOverlay: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
});
