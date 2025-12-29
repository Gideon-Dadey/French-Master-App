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
  Modal,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { coursesAPI, paymentsAPI } from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import { getCourseImage } from '../src/utils/courseImages';
import { getThemeColors, themeShadows } from '../src/utils/organicTheme';

const { width, height } = Dimensions.get('window');

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const { isAuthenticated, user, loadUser } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);
  const [enrolledSuccessfully, setEnrolledSuccessfully] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

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
      await loadUser(); // Refresh user state

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
        setCourse(updatedCourse.data.data); // Update to reflect unenrolled status
      }
      Alert.alert("Success", "You have successfully unenrolled from the course.");
    } catch (error) {
      Alert.alert('Error', 'Failed to unenroll. Please try again.');
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

  const imageSource = course.thumbnail?.startsWith('http')
    ? { uri: course.thumbnail }
    : getCourseImage(course._id, 0, course.category, course.title);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [height * 0.45, height * 0.3],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Hero Image / Animated Header */}
      <Animated.View style={[styles.hero, { height: headerHeight }]}>
        <Animated.Image
          source={imageSource}
          style={[styles.heroImage, { transform: [{ scale: imageScale }] }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.heroOverlay}
        />



        {/* Hero Content */}
        <View style={styles.heroContent}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Text style={styles.badgeText}>{(course.category || 'Course').toUpperCase()}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.badgeText}>{course.level || 'All Levels'}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle} numberOfLines={2}>{course.title}</Text>
          <View style={styles.heroMeta}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.heroMetaText}>{course.rating?.average?.toFixed(1) || '4.8'}</Text>
            <Text style={[styles.heroMetaText, { opacity: 0.7 }]}>•</Text>
            <Text style={styles.heroMetaText}>{totalLessons} Lessons</Text>
            <Text style={[styles.heroMetaText, { opacity: 0.7 }]}>•</Text>
            <Text style={styles.heroMetaText}>{formatDuration(totalDuration)}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Header Nav - Fixed Position */}
      <View style={[styles.headerNav, { paddingTop: Platform.OS === 'ios' ? 50 : 30 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        {isEnrolled && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleUnenrollConfirm}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content Scroll */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={[styles.contentCard, { backgroundColor: theme.background }]}>

          {/* Instructor Row */}
          {course.instructor && (
            <View style={[styles.instructorRow, { borderBottomColor: theme.border }]}>
              <Image
                source={course.instructor.avatar ? { uri: course.instructor.avatar } : require('../assets/logo.jpeg')}
                style={styles.instructorAvatar}
              />
              <View>
                <Text style={[styles.instructorLabel, { color: theme.textSecondary }]}>Instructor</Text>
                <Text style={[styles.instructorName, { color: theme.text }]}>{course.instructor.name || 'L\'Alliance Team'}</Text>
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
            <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
              {course.description || 'Join this course to master French efficiently.'}
            </Text>
          </View>

          {/* Curriculum */}
          <View style={styles.section}>
            <View style={styles.curriculumHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Curriculum</Text>
              <Text style={[styles.lessonCount, { color: theme.textSecondary }]}>{totalLessons} videos</Text>
            </View>

            {course.lessons?.map((lesson, index) => {
              const isLocked = !isEnrolled && index !== 0;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.lessonItem, { borderBottomColor: theme.border }]}
                  onPress={() => {
                    if (!isLocked) {
                      navigation.navigate('Lesson', { courseId: course._id, lessonId: lesson._id });
                    } else {
                      handlePurchase();
                    }
                  }}
                >
                  <View style={[styles.lessonIndex, { backgroundColor: theme.surfaceAlt }]}>
                    <Text style={[styles.lessonIndexText, { color: theme.textSecondary }]}>{index + 1}</Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonTitle, { color: isLocked ? theme.textSecondary : theme.text }]}>{lesson.title}</Text>
                    <Text style={[styles.lessonDuration, { color: theme.textMuted }]}>{formatDuration(lesson.duration)}</Text>
                  </View>
                  <Ionicons
                    name={isLocked ? "lock-closed" : "play-circle"}
                    size={24}
                    color={isLocked ? theme.textMuted : theme.primary}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Sticky Action Bar */}
      <View style={[styles.actionBar, { backgroundColor: theme.surface, borderTopColor: theme.border }, themeShadows.lg]}>
        <View>
          <Text style={[styles.actionPrice, { color: theme.text }]}>Free</Text>
          <Text style={[styles.actionSub, { color: theme.textSecondary }]}>Lifetime access</Text>
        </View>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: isEnrolled ? theme.success : theme.primary }]}
          onPress={isEnrolled ? () => navigation.navigate('Lesson', {
            courseId: course._id,
            lessonId: course.lessons?.[0]?._id
          }) : handlePurchase}
        >
          <Text style={styles.actionBtnText}>
            {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={enrolledSuccessfully} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.successCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="checkmark-circle" size={50} color={theme.success} />
            <Text style={[styles.successTitle, { color: theme.text }]}>Enrolled!</Text>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroMetaText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingTop: height * 0.4, // Push content down to reveal hero initially
  },
  contentCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
    minHeight: height * 0.7,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  instructorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  instructorLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  curriculumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  lessonCount: {
    fontSize: 14,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  lessonIndex: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonIndexText: {
    fontWeight: '700',
    fontSize: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  lessonDuration: {
    fontSize: 12,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    zIndex: 100,
  },
  actionPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  actionSub: {
    fontSize: 12,
  },
  actionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    gap: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
});
