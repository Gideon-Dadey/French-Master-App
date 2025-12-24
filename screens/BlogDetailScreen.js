import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Removed WebView import - using Linking instead for better compatibility
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import { blogAPI } from '../src/services/api';

export default function BlogDetailScreen({ route, navigation }) {
  const { postId, post: initialPost } = route.params;
  const { colors } = useTheme();
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState(null);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    if (!initialPost) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogAPI.getById(postId);
      if (response.data && response.data.data) {
        setPost(response.data.data);
      } else {
        setError('Blog post not found.');
      }
    } catch (error) {
      console.error('Failed to load blog post:', error);
      if (error.response?.status === 404) {
        setError('Blog post not found.');
      } else if (error.response?.status === 500) {
        setError('Server error. The blog post may not exist.');
      } else {
        setError('Failed to load blog post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this article: ${post.title}\n${post.url || ''}`,
        title: post.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleOpenInBrowser = () => {
    if (post.url) {
      Linking.openURL(post.url);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner message="Loading article..." />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorMessage message={error || 'Post not found'} onRetry={loadPost} />
      </View>
    );
  }

  const category = post.category || post.type || 'Article';
  const categoryColor = getCategoryColor(category);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image */}
        {post.image && (
          <Image
            source={{ uri: post.image }}
            style={styles.headerImage}
            resizeMode="cover"
          />
        )}

        {/* Content */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {category.toUpperCase()}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {post.title}
          </Text>

          {/* Meta Information */}
          <View style={[styles.metaContainer, { borderBottomColor: colors.border }]}>
            {post.author && (
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={16} color={colors.secondaryText} />
                <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                  {post.author}
                </Text>
              </View>
            )}
            {post.date && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={colors.secondaryText} />
                <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                  {formatDate(post.date)}
                </Text>
              </View>
            )}
            {post.readTime && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={colors.secondaryText} />
                <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                  {post.readTime}
                </Text>
              </View>
            )}
          </View>

          {/* Content */}
          {post.content ? (
            <View style={styles.contentContainer}>
              <Text style={[styles.contentText, { color: colors.text }]}>
                {post.content || post.excerpt || post.description}
              </Text>
            </View>
          ) : post.excerpt ? (
            <Text style={[styles.contentText, { color: colors.text }]}>
              {post.excerpt}
            </Text>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {post.url && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={handleOpenInBrowser}
              >
                <Ionicons name="open-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Read Full Article</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton, { borderColor: colors.border }]}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={20} color={colors.primary} />
              <Text style={[styles.shareButtonText, { color: colors.primary }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E0E0E0',
  },
  content: {
    padding: spacing.lg,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
    lineHeight: 36,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingBottom: spacing.md,
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: fontSize.sm,
  },
  contentContainer: {
    marginBottom: spacing.lg,
  },
  contentText: {
    fontSize: fontSize.md,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  shareButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

