import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize } from '../utils/responsive';
import { premiumShadows, premiumBorderRadius } from '../utils/premiumDesign';

const { width } = Dimensions.get('window');

export default function BlogCard({ post, onPress, layout = 'vertical' }) {
  const { colors, isDarkMode } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getCategoryColor = (category) => {
    const c = (category || '').toLowerCase();
    if (c.includes('lesson')) return '#3b82f6';
    if (c.includes('news')) return '#10b981';
    if (c.includes('tip')) return '#f59e0b';
    return '#8b5cf6';
  };

  const category = post.category || post.type || 'Article';
  const categoryColor = getCategoryColor(category);

  if (layout === 'horizontal') {
    return (
      <TouchableOpacity
        style={[
          styles.horizontalCard,
          { backgroundColor: isDarkMode ? '#1c1c1e' : '#ffffff' },
          premiumShadows.sm
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image
          source={post.image ? { uri: post.image } : require('../../assets/logo.jpeg')}
          style={styles.horizontalImage}
        />
        <View style={styles.horizontalContent}>
          <View style={[styles.miniBadge, { backgroundColor: categoryColor + '15' }]}>
            <Text style={[styles.miniBadgeText, { color: categoryColor }]}>{category.toUpperCase()}</Text>
          </View>
          <Text style={[styles.horizontalTitle, { color: colors.text }]} numberOfLines={2}>
            {post.title}
          </Text>
          <View style={styles.horizontalMeta}>
            <Text style={[styles.metaSmall, { color: colors.secondaryText }]}>{formatDate(post.date || post.createdAt)}</Text>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <Text style={[styles.metaSmall, { color: colors.secondaryText }]}>{post.readTime || '3 min'}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#3f3f46' : '#d1d1d6'} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: isDarkMode ? '#1c1c1e' : '#ffffff' },
        premiumShadows.md
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={post.image ? { uri: post.image } : require('../../assets/logo.jpeg')}
          style={styles.image}
        />
        <View style={[styles.floatingBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.floatingBadgeText}>{category.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {post.title}
        </Text>

        <Text style={[styles.excerpt, { color: colors.secondaryText }]} numberOfLines={2}>
          {post.excerpt || 'Discover the latest insights and mastery tips for your French language journey.'}
        </Text>

        <View style={styles.footer}>
          <View style={styles.authorSection}>
            <View style={[styles.authorAvatar, { backgroundColor: categoryColor + '20' }]}>
              <Text style={[styles.authorInitial, { color: categoryColor }]}>
                {post.author?.charAt(0) || 'F'}
              </Text>
            </View>
            <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
              {post.author || 'French Master'}
            </Text>
          </View>

          <View style={styles.metaInfo}>
            <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
            <Text style={[styles.metaText, { color: colors.secondaryText }]}>
              {post.readTime || '3 min'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  floatingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  floatingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInitial: {
    fontSize: 10,
    fontWeight: '800',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },

  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  horizontalImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  horizontalContent: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 4,
  },
  miniBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  horizontalTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  horizontalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaSmall: {
    fontSize: 11,
    fontWeight: '500',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});

