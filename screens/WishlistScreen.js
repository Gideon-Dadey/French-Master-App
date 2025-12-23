import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../src/context/WishlistContext';
import { useAuth } from '../src/context/AuthContext';
import CourseCard from '../src/components/CourseCard';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { spacing, fontSize } from '../src/utils/responsive';

export default function WishlistScreen({ navigation }) {
  const { wishlist, loading, removeFromWishlist, loadWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWishlist();
    setRefreshing(false);
  };

  const handleRemove = async (courseId) => {
    await removeFromWishlist(courseId);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Your Wishlist</Text>
          <Text style={styles.emptyText}>
            Sign in to save courses you love
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading && !refreshing) {
    return <LoadingSpinner message="Loading your wishlist..." />;
  }

  const courses = wishlist.map(item => item.course || item).filter(Boolean);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Text style={styles.headerSubtitle}>
          {courses.length} {courses.length === 1 ? 'course' : 'courses'} saved
        </Text>
      </View>

      {courses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptyText}>
            Start adding courses you're interested in
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Courses')}
          >
            <Text style={styles.browseButtonText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.coursesList}>
          {courses.map((course, index) => (
            <View key={course._id || course.id} style={styles.courseWrapper}>
              <CourseCard
                course={course}
                index={index}
                onPress={() => navigation.navigate('CourseDetail', { courseId: course._id || course.id })}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(course._id || course.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="heart" size={20} color="#E53935" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#212121',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: '#757575',
  },
  coursesList: {
    padding: spacing.lg,
  },
  courseWrapper: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    color: '#424242',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loginButton: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  browseButton: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

