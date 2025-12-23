import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import PremiumCard from './PremiumCard';
import PremiumBadge from './PremiumBadge';
import { premiumSpacing, premiumTypography, premiumColors } from '../utils/premiumDesign';
import { getCourseThumbnail } from '../utils/courseThumbnailMap';
import { getCourseImage } from '../utils/courseImages';

export default function RecommendedCourses({ courses, title = 'Recommended for You', onCoursePress, colors }) {
  const { colors: themeColors } = useTheme();
  const finalColors = colors || themeColors;

  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: finalColors.text }]}>{title}</Text>
        <TouchableOpacity onPress={() => onCoursePress && onCoursePress('seeAll')}>
          <Text style={[styles.seeAll, { color: finalColors.primary }]}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {courses.map((course, index) => (
          <TouchableOpacity
            key={course._id || course.id || index}
            style={[styles.courseCard, { backgroundColor: finalColors.card }]}
            onPress={() => onCoursePress && onCoursePress(course)}
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
                  return getCourseImage(course._id || course.id, index);
                })()
              }
              style={styles.thumbnail}
            />
            <View style={styles.courseContent}>
              <View style={styles.badges}>
                {course.isFree && (
                  <PremiumBadge label="Free" variant="success" size="sm" />
                )}
                {course.level && (
                  <PremiumBadge label={course.level} variant="outline" size="sm" />
                )}
              </View>
              <Text style={[styles.courseTitle, { color: finalColors.text }]} numberOfLines={2}>
                {course.title}
              </Text>
              <View style={styles.meta}>
                <View style={styles.rating}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: finalColors.secondaryText }]}>
                    {course.rating?.average?.toFixed(1) || '4.5'}
                  </Text>
                </View>
                <Text style={[styles.students, { color: finalColors.secondaryText }]}>
                  {course.studentsEnrolled || 0} students
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: premiumSpacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: premiumSpacing.md,
    paddingHorizontal: premiumSpacing.lg,
  },
  title: {
    fontSize: premiumTypography.sizes.xl,
    fontWeight: premiumTypography.weights.bold,
  },
  seeAll: {
    fontSize: premiumTypography.sizes.sm,
    fontWeight: premiumTypography.weights.semibold,
  },
  scrollContent: {
    paddingHorizontal: premiumSpacing.lg,
    gap: premiumSpacing.base,
  },
  courseCard: {
    width: 280,
    borderRadius: premiumSpacing.md,
    overflow: 'hidden',
    marginRight: premiumSpacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  thumbnail: {
    width: '100%',
    height: 160,
    backgroundColor: premiumColors.neutral[200],
  },
  courseContent: {
    padding: premiumSpacing.base,
  },
  badges: {
    flexDirection: 'row',
    gap: premiumSpacing.xs,
    marginBottom: premiumSpacing.sm,
  },
  courseTitle: {
    fontSize: premiumTypography.sizes.base,
    fontWeight: premiumTypography.weights.semibold,
    marginBottom: premiumSpacing.sm,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: premiumTypography.sizes.sm,
    fontWeight: premiumTypography.weights.medium,
  },
  students: {
    fontSize: premiumTypography.sizes.xs,
  },
});

