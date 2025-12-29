import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getCourseImage } from '../utils/courseImages';
import { getCourseThumbnail } from '../utils/courseThumbnailMap';
import { spacing, fontSize, normalize } from '../utils/responsive';
import Spacer from './Spacer';
import Rating from './Rating';

export default function HorizontalCourseCard({ course, onPress, index = 0 }) {
  const { isDarkMode, organicColors: theme } = useTheme();

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
        return theme.success;
      case 'intermediate':
        return theme.warning || '#FF9800';
      case 'advanced':
        return theme.error;
      default:
        return theme.primary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Image
        source={imageSource}
        style={[
          styles.cover,
          { backgroundColor: theme.borderLight || theme.border },
        ]}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        {course.category && (
          <>
            <Text
              style={[
                styles.category,
                { color: theme.primary },
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
            { color: theme.text },
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
              <Text style={[styles.footerText, { color: theme.textSecondary, marginLeft: 4 }]}>
                ({course.rating?.count || course.meta?.enrolledCount})
              </Text>
            )}
          </View>
          {course.level && (
            <View style={styles.footerItem}>
              <Ionicons
                name="trending-up-outline"
                size={16}
                color={theme.textSecondary}
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

const calculateCardWidth = () => {
  const { width: currentWidth } = Dimensions.get('window');
  const isTabletDevice = currentWidth >= 768;
  const isSmallDeviceCheck = currentWidth < 375;

  if (isTabletDevice) {
    return currentWidth * 0.45;
  }
  if (isSmallDeviceCheck) {
    return currentWidth - spacing.lg * 2 - spacing.md;
  }
  return currentWidth * 0.85;
};

const CARD_WIDTH = calculateCardWidth();
const CARD_PADDING = spacing.md;
const IMAGE_WIDTH = normalize(100);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: CARD_PADDING,
    borderRadius: normalize(12),
    borderWidth: StyleSheet.hairlineWidth,
    width: CARD_WIDTH,
    marginRight: spacing.md,
    minHeight: normalize(120),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cover: {
    aspectRatio: 4 / 3,
    borderRadius: normalize(8),
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH * 0.75,
    flexShrink: 0,
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
    minWidth: 0,
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
    flexWrap: 'wrap',
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

