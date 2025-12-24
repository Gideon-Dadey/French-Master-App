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
  const { colors } = useTheme();
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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {stats && (
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalCourses}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Courses</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.completedCourses}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Completed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalLessonsCompleted}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Lessons</Text>
          </View>
        </View>
      )}

      <View style={styles.coursesContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>My Courses</Text>
        {!isAuthenticated ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="lock-closed-outline" size={64} color={colors.secondaryText} />
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>Please login to view your courses</Text>
            <TouchableOpacity
              style={[styles.browseButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            >
              <Text style={styles.browseButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        ) : courses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={colors.secondaryText} />
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No courses enrolled yet</Text>
            <TouchableOpacity
              style={[styles.browseButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Courses')}
            >
              <Text style={styles.browseButtonText}>Browse Courses</Text>
            </TouchableOpacity>
          </View>
        ) : (
          courses.map((enrollment) => {
            const course = enrollment.course;
            const progress = getProgressPercentage(enrollment);
            
            return (
              <TouchableOpacity
                key={enrollment._id}
                style={[styles.courseCard, { backgroundColor: colors.card }]}
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
                      return getCourseImage(course._id || course.id, courses.indexOf(enrollment), course.category || course.language, course.title);
                    })()
                  }
                  style={[styles.thumbnail, { backgroundColor: colors.tertiaryBackground || colors.border }]}
                />
                <View style={styles.courseInfo}>
                  <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
                    {course.title}
                  </Text>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${progress}%`, backgroundColor: colors.primary },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: colors.secondaryText }]}>{progress}%</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      // Navigate to course lessons
                      navigation.navigate('CourseDetail', { courseId: course._id });
                    }}
                  >
                    <Text style={styles.continueButtonText}>
                      {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
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
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

