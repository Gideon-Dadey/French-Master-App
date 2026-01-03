import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usersAPI, progressAPI } from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { getCourseImage } from '../src/utils/courseImages';
import { getCourseThumbnail } from '../src/utils/courseThumbnailMap';

export default function MyCoursesScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const { organicColors: theme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    await Promise.all([loadCourses(), loadStats()]);
  };

  const loadCourses = async () => {
    try {
      const response = await usersAPI.getMyCourses();
      setCourses(response.data.data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await progressAPI.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getProgressPercentage = (enrollment) => {
    return enrollment.progress || 0;
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="lock-closed-outline" size={60} color={theme.textSecondary} />
        <Text style={[styles.message, { color: theme.text }]}>Log in to see your courses</Text>
        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.loginBtnText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>My Learning</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {courses.length} Courses in progress
          </Text>
        </View>

        {stats && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.totalCourses || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Courses</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.completedCourses || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.totalLessonsCompleted || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Lessons</Text>
            </View>
          </View>
        )}

        <View style={styles.coursesContainer}>
          {courses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No courses enrolled yet</Text>
              <TouchableOpacity
                style={[styles.browseButton, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('Learn')}
              >
                <Text style={styles.browseButtonText}>Browse Courses</Text>
              </TouchableOpacity>
            </View>
          ) : (
            courses.map((enrollment, index) => {
              const course = enrollment.course;
              if (!course) return null;

              const progress = getProgressPercentage(enrollment);

              return (
                <TouchableOpacity
                  key={enrollment._id || index}
                  style={[styles.courseCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                >
                  <Image
                    source={
                      (() => {
                        if (course.thumbnail && (course.thumbnail.startsWith('http://') || course.thumbnail.startsWith('https://'))) {
                          return { uri: course.thumbnail };
                        } else if (course.thumbnail) {
                          const mappedImage = getCourseThumbnail(course.thumbnail);
                          if (mappedImage) return mappedImage;
                        }
                        return getCourseImage(course._id || course.id, index, course.category || course.language, course.title);
                      })()
                    }
                    style={[styles.thumbnail, { backgroundColor: theme.borderLight || theme.border }]}
                  />
                  <View style={styles.courseInfo}>
                    <Text style={[styles.courseTitle, { color: theme.text }]} numberOfLines={2}>
                      {course.title}
                    </Text>
                    <Text style={[styles.courseInstructor, { color: theme.textSecondary }]}>
                      {course.instructor?.name || 'French Master'}
                    </Text>

                    <View style={styles.progressArea}>
                      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progress}%`, backgroundColor: theme.primary }
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                        {Math.round(progress)}% complete
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
  },
  coursesContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  courseCard: {
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 180,
  },
  courseInfo: {
    padding: 15,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
  },
  continueButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 20,
  },
  browseButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

