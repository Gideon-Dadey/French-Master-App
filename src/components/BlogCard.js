import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize } from '../utils/responsive';

/**
 * Professional Blog Card Component
 * Industry-standard design for blog posts
 * 
 * @param {object} post - Blog post data
 * @param {function} onPress - Press handler
 */
export default function BlogCard({ post, onPress }) {
  const { colors } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'written lessons':
      case 'written lesson':
        return '#1E88E5';
      case 'news':
        return '#43A047';
      default:
        return colors.primary;
    }
  };

  const category = post.category || post.type || 'Article';
  const categoryColor = getCategoryColor(category);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Blog Image */}
      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={[styles.image, { backgroundColor: colors.tertiaryBackground || colors.border }]}
          resizeMode="cover"
        />
      )}
      
      {/* Blog Content */}
      <View style={styles.content}>
        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {category.toUpperCase()}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {post.title}
        </Text>

        {/* Excerpt */}
        {post.excerpt && (
          <Text style={[styles.excerpt, { color: colors.secondaryText }]} numberOfLines={3}>
            {post.excerpt}
          </Text>
        )}

        {/* Meta Information */}
        <View style={styles.metaContainer}>
          {/* Author */}
          {post.author && (
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color={colors.secondaryText} />
              <Text style={[styles.metaText, { color: colors.secondaryText }]} numberOfLines={1}>
                {post.author}
              </Text>
            </View>
          )}

          {/* Date */}
          {post.date && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.secondaryText} />
              <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                {formatDate(post.date)}
              </Text>
            </View>
          )}

          {/* Read Time */}
          {post.readTime && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
              <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                {post.readTime}
              </Text>
            </View>
          )}
        </View>

        {/* Read More */}
        <View style={styles.readMoreContainer}>
          <Text style={[styles.readMore, { color: colors.primary }]}>Read More</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
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
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  excerpt: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 100,
  },
  metaText: {
    fontSize: fontSize.xs,
    flex: 1,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  readMore: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

