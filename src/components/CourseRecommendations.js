import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import CourseCard from './CourseCard';
import { spacing, fontSize } from '../utils/responsive';
import { coursesAPI } from '../services/api';

const { width } = Dimensions.get('window');

export default function CourseRecommendations({ userId, enrolledCourses = [], onCoursePress }) {
  const { colors } = useTheme();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [enrolledCourses]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      // Get all courses
      const response = await coursesAPI.getAll();
      const allCourses = response.data.data || [];
      
      // Simple recommendation algorithm:
      // 1. Filter out already enrolled courses
      // 2. Prioritize courses in same category/level as enrolled
      // 3. Sort by rating and popularity
      const enrolledIds = enrolledCourses.map(c => c._id || c.course?._id);
      const available = allCourses.filter(c => !enrolledIds.includes(c._id));
      
      // Get categories and levels from enrolled courses
      const enrolledCategories = enrolledCourses
        .map(c => c.course?.category || c.category)
        .filter(Boolean);
      const enrolledLevels = enrolledCourses
        .map(c => c.course?.level || c.level)
        .filter(Boolean);
      
      // Score and sort recommendations
      const scored = available.map(course => {
        let score = course.rating?.average || 0;
        score += (course.studentsEnrolled || 0) / 1000; // Popularity boost
        
        // Boost if matches user's interests
        if (enrolledCategories.includes(course.category)) score += 2;
        if (enrolledLevels.includes(course.level)) score += 1.5;
        
        return { course, score };
      });
      
      scored.sort((a, b) => b.score - a.score);
      setRecommendations(scored.slice(0, 6).map(s => s.course));
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Recommended for You</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Loading...</Text>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={24} color={colors.primary} />
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Recommended for You</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Based on your learning journey
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={width * 0.85 + spacing.md}
        snapToAlignment="start"
      >
        {recommendations.map((course, index) => (
          <View key={course._id} style={styles.cardWrapper}>
            <CourseCard
              course={course}
              onPress={() => onCoursePress?.(course)}
              style={styles.card}
              index={index}
            />
            {index === 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Ionicons name="star" size={12} color="#fff" />
                <Text style={styles.badgeText}>Top Pick</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingRight: spacing.xl,
  },
  cardWrapper: {
    width: width * 0.85,
    marginRight: spacing.md,
    position: 'relative',
  },
  card: {
    width: '100%',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
    gap: spacing.xs,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});

