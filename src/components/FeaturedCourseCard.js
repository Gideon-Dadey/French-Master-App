import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/helpers';
import { spacing, fontSize } from '../utils/responsive';
import { getCourseImage } from '../utils/courseImages';
import { getCourseThumbnail } from '../utils/courseThumbnailMap';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';

export default function FeaturedCourseCard({ course, onPress, index = 0 }) {
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

  // Determine if course is bestseller (high enrollment) or new (recently published)
  const isBestseller = course.studentsEnrolled > 1000;
  const isNew = course.publishedAt && new Date(course.publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const hasDiscount = course.originalPrice && course.originalPrice > course.price;
  const discountPercent = hasDiscount 
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  // Format student count
  const formatStudentCount = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  // Get instructor name
  const instructorName = course.instructor?.name || 'Expert Instructor';
  const instructorAvatar = course.instructor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=1E88E5&color=fff&size=100`;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Thumbnail with Play Button Overlay */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={imageSource}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        
        {/* Play Button Overlay (if preview video exists) */}
        {course.previewVideo && (
          <View style={styles.playButtonOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={24} color="#FFFFFF" />
            </View>
          </View>
        )}

        {/* Top Badges */}
        <View style={styles.topBadges}>
          {isBestseller && (
            <View style={styles.bestsellerBadge}>
              <Ionicons name="trophy" size={12} color="#FFFFFF" />
              <Text style={styles.bestsellerText}>Bestseller</Text>
            </View>
          )}
          {isNew && !isBestseller && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}
        </View>

        {/* Level Badge */}
        <View style={[styles.levelBadge, { backgroundColor: getLevelColor(course.level) }]}>
          <Text style={styles.levelText}>{course.level}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>

        {/* Instructor Info */}
        <View style={styles.instructorRow}>
          <Image
            source={{ uri: instructorAvatar }}
            style={styles.instructorAvatar}
          />
          <Text style={styles.instructorName} numberOfLines={1}>
            {instructorName}
          </Text>
        </View>

        {/* Rating and Students */}
        <View style={styles.metaRow}>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(course.rating?.average || 0) ? 'star' : 'star-outline'}
                  size={12}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {course.rating?.average?.toFixed(1) || '0.0'}
            </Text>
            {course.rating?.count > 0 && (
              <Text style={styles.ratingCount}>({course.rating.count.toLocaleString()})</Text>
            )}
          </View>
          <View style={styles.studentsContainer}>
            <Ionicons name="people" size={14} color="#757575" />
            <Text style={styles.students}>{formatStudentCount(course.studentsEnrolled || 0)}</Text>
          </View>
        </View>

        {/* Course Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="#757575" />
            <Text style={styles.detailText}>{course.duration || 0}h total</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="videocam-outline" size={14} color="#757575" />
            <Text style={styles.detailText}>{course.totalLessons || 0} lectures</Text>
          </View>
          {course.certificate?.enabled && (
            <View style={styles.detailItem}>
              <Ionicons name="ribbon-outline" size={14} color="#4CAF50" />
              <Text style={[styles.detailText, styles.certificateText]}>Certificate</Text>
            </View>
          )}
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          {hasDiscount && (
            <Text style={styles.originalPrice}>
              {formatPrice(course.originalPrice, course.currency || 'GHS')}
            </Text>
          )}
          <View style={styles.priceRow}>
            <Text style={[styles.price, course.isFree && styles.freePrice]}>
              {course.isFree ? 'FREE' : formatPrice(course.price, course.currency || 'GHS')}
            </Text>
            {!course.isFree && hasDiscount && (
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>Save {discountPercent}%</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(30, 136, 229, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  topBadges: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  bestsellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bestsellerText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  newBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  discountBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  levelBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
    lineHeight: 22,
    minHeight: 44,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  instructorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  instructorName: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  ratingCount: {
    fontSize: fontSize.xs,
    marginLeft: 2,
  },
  studentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  students: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: fontSize.xs,
  },
  certificateText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  originalPrice: {
    fontSize: fontSize.sm,
    textDecorationLine: 'line-through',
    marginRight: spacing.xs,
  },
  price: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  freePrice: {
    color: '#4CAF50',
  },
  priceBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceBadgeText: {
    fontSize: fontSize.xs,
    color: '#4CAF50',
    fontWeight: '700',
  },
});

