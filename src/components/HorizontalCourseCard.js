import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getCourseImage } from '../utils/courseImages';
import { getCourseThumbnail } from '../utils/courseThumbnailMap';
import { spacing, fontSize, normalize } from '../utils/responsive';
import Spacer from './Spacer';
import Rating from './Rating';

/**
 * Horizontal course card component
 * Adapted from HEYY TopCourseItem design
 *
 * @param {object} course - Course data
 * @param {function} onPress - Press handler
 * @param {number} index - Index for image selection
 */
export default function HorizontalCourseCard({ course, onPress, index = 0 }) {
  const { colors } = useTheme();

  // Try to get thumbnail from mapping, fallback to getCourseImage, or use URL
  let imageSource;
  if (course.thumbnail) {
    if (course.thumbnail.startsWith('http://') || course.thumbnail.startsWith('https://')) {
      imageSource = { uri: course.thumbnail };
    } else {
      const mappedImage = getCourseThumbnail(course.thumbnail);
      imageSource = mappedImage || getCourseImage(course._id || course.id, index, course.category || course.language, course.title);
    }
  } else {
    imageSource = getCourseImage(course._id || course.id, index, course.category || course.language, course.title);
  }

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return colors.primary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Image
        source={imageSource}
        style={[
          styles.cover,
          { backgroundColor: colors.tertiaryBackground || colors.border },
        ]}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        {course.category && (
          <>
            <Text
              style={[
                styles.category,
                { color: colors.primary },
              ]}
            >
              {course.category.name || course.category}
            </Text>
            <Spacer orientation="vertical" spacing={4} />
          </>
        )}
        <Text
          numberOfLines={2}
          style={[
            styles.title,
            { color: colors.text },
          ]}
        >
          {course.title}
        </Text>

        <Spacer orientation="vertical" spacing={16} />

        <View style={{ flex: 1 }} />

        <View style={styles.footerContainer}>
          <View style={styles.footerItem}>
            <Rating 
              rating={course.rating?.average || course.meta?.rating || 0}
              size={14}
            />
            {(course.rating?.count || course.meta?.enrolledCount) && (
              <Text style={[styles.footerText, { color: colors.secondaryText, marginLeft: 4 }]}>
                ({course.rating?.count || course.meta?.enrolledCount})
              </Text>
            )}
          </View>
          {course.level && (
            <View style={styles.footerItem}>
              <Ionicons
                name="trending-up-outline"
                size={16}
                color={colors.secondaryText}
              />
              <Text style={[styles.footerText, { color: getLevelColor(course.level) }]}>
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Calculate card width responsively (calculated at module load)
const calculateCardWidth = () => {
  const { width: currentWidth } = Dimensions.get('window');
  const isTabletDevice = currentWidth >= 768;
  const isSmallDeviceCheck = currentWidth < 375;
  
  if (isTabletDevice) {
    return currentWidth * 0.45; // Tablet: ~45% of screen
  }
  if (isSmallDeviceCheck) {
    return currentWidth - spacing.lg * 2 - spacing.md; // Small: screen - padding - margin
  }
  return currentWidth * 0.85; // Mobile: 85% of screen width
};

const CARD_WIDTH = calculateCardWidth();
const CARD_PADDING = spacing.md;
const IMAGE_WIDTH = normalize(100); // Responsive image width

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: CARD_PADDING,
    borderRadius: normalize(12),
    borderWidth: StyleSheet.hairlineWidth,
    width: CARD_WIDTH,
    marginRight: spacing.md,
    minHeight: normalize(120), // Minimum height for consistency
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  cover: {
    aspectRatio: 4 / 3,
    borderRadius: normalize(8),
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH * 0.75, // Maintain aspect ratio
    flexShrink: 0, // Prevent image from shrinking
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
    minWidth: 0, // Allow text to shrink properly
  },
  category: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    lineHeight: normalize(20),
    letterSpacing: -0.2,
  },
  footerContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    flexWrap: 'wrap', // Allow wrapping on very small screens
  },
  footerItem: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});

