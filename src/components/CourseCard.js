import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/helpers';
import { spacing, fontSize, courseCardWidth, isTablet } from '../utils/responsive';
import { getCourseImage } from '../utils/courseImages';
import { getCourseThumbnail } from '../utils/courseThumbnailMap';
import { useTheme } from '../context/ThemeContext';
import Rating from './Rating';

export default function CourseCard({ course, onPress, style, isHorizontal = false, index = 0 }) {
  const { colors } = useTheme();
  
  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  // Try to get thumbnail from mapping, fallback to getCourseImage, or use URL
  let imageSource;
  if (course.thumbnail) {
    if (course.thumbnail.startsWith('http://') || course.thumbnail.startsWith('https://')) {
      imageSource = { uri: course.thumbnail };
    } else {
      const mappedImage = getCourseThumbnail(course.thumbnail);
      imageSource = mappedImage || getCourseImage(course._id || course.id, index);
    }
  } else {
    imageSource = getCourseImage(course._id || course.id, index);
  }

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        { backgroundColor: colors.card }, 
        isHorizontal && { width: courseCardWidth },
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={imageSource}
          style={[
            styles.thumbnail,
            { backgroundColor: colors.tertiaryBackground || colors.border },
            isHorizontal && styles.horizontalThumbnail
          ]}
          resizeMode="cover"
        />
        <View style={styles.thumbnailOverlay}>
          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(course.level) }]}>
            <Text style={styles.levelText}>{course.level}</Text>
          </View>
          {course.isFree && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {course.title}
        </Text>
        
        <Text style={[styles.description, { color: colors.secondaryText }]} numberOfLines={2}>
          {course.shortDescription || course.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.rating}>
            <Rating 
              rating={course.rating?.average || 0} 
              size={14}
              showRating={true}
            />
            {course.rating?.count > 0 && (
              <Text style={[styles.ratingCount, { color: colors.secondaryText, marginLeft: 4 }]}>
                ({course.rating.count})
              </Text>
            )}
          </View>
          <View style={styles.studentsContainer}>
            <Ionicons name="people-outline" size={14} color={colors.secondaryText} />
            <Text style={[styles.students, { color: colors.secondaryText }]}>{course.studentsEnrolled || 0}</Text>
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.courseInfo}>
            <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
            <Text style={[styles.courseInfoText, { color: colors.secondaryText }]}>{course.duration || 0}h</Text>
            <Ionicons name="book-outline" size={14} color={colors.secondaryText} style={{ marginLeft: spacing.sm }} />
            <Text style={[styles.courseInfoText, { color: colors.secondaryText }]}>{course.totalLessons || 0} lessons</Text>
          </View>
          <Text style={[
            styles.price, 
            { color: colors.text },
            course.isFree && styles.freePrice
          ]}>
            {course.isFree ? 'FREE' : formatCurrency(course.price, course.currency)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
  },
  thumbnail: {
    width: '100%',
    height: isTablet ? 200 : 180,
  },
  horizontalThumbnail: {
    height: 160,
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
  freeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  freeBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  description: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: fontSize.xs,
  },
  studentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  students: {
    fontSize: fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  courseInfoText: {
    fontSize: fontSize.sm,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  freePrice: {
    color: '#4CAF50',
  },
});
