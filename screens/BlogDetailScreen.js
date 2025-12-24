import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Share,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import { blogAPI } from '../src/services/api';

const { width, height } = Dimensions.get('window');

export default function BlogDetailScreen({ route, navigation }) {
  const { postId, post: initialPost } = route.params;
  const { colors, isDarkMode } = useTheme();
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!initialPost) {
      loadPost();
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogAPI.getById(postId);
      if (response.data?.data) {
        setPost(response.data.data);
      } else {
        setError('Blog post not found.');
      }
    } catch (error) {
      console.error('Failed to load blog post:', error);
      setError('Failed to load blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category) => {
    const c = (category || '').toLowerCase();
    if (c.includes('lesson')) return '#3B82F6';
    if (c.includes('news')) return '#10B981';
    if (c.includes('tips')) return '#F59E0B';
    return '#8B5CF6';
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${post.title}\n${post.url || ''}`,
        title: post.title,
      });
    } catch (error) {}
  };

  const handleOpenInBrowser = () => {
    if (post.url) {
      Linking.openURL(post.url);
    }
  };

  const estimateReadTime = (content) => {
    if (!content) return '3 min read';
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading article..." />;
  }

  if (error || !post) {
    return <ErrorMessage message={error || 'Article not found'} onRetry={loadPost} />;
  }

  const hasImage = post.image || post.thumbnail;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Image */}
      <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
        {hasImage ? (
          <Image source={{ uri: post.image || post.thumbnail }} style={styles.headerImage} />
        ) : (
          <LinearGradient colors={['#3B82F6', '#2563EB', '#1D4ED8']} style={styles.headerImage} />
        )}
        <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.8)']} style={styles.headerOverlay} />

        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={handleOpenInBrowser}>
              <Ionicons name="open-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category & Title */}
        <View style={styles.headerInfo}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(post.category) }]}>
            <Text style={styles.categoryText}>{post.category || 'Article'}</Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={3}>{post.title}</Text>
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Meta Info Card */}
        <View style={[styles.metaCard, { backgroundColor: colors.card }]}>
          <View style={styles.metaRow}>
            {post.author && (
              <View style={styles.authorInfo}>
                <View style={[styles.authorAvatar, { backgroundColor: '#3B82F6' }]}>
                  <Text style={styles.authorInitial}>{post.author?.name?.charAt(0) || 'A'}</Text>
                </View>
                <View>
                  <Text style={[styles.authorName, { color: colors.text }]}>
                    {post.author?.name || 'Author'}
                  </Text>
                  <Text style={[styles.authorRole, { color: colors.secondaryText }]}>Writer</Text>
                </View>
              </View>
            )}
            <View style={styles.metaStats}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={colors.secondaryText} />
                <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                  {formatDate(post.publishedAt || post.createdAt)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={colors.secondaryText} />
                <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                  {estimateReadTime(post.content || post.excerpt)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Article Content */}
        <View style={[styles.articleCard, { backgroundColor: colors.card }]}>
          {post.excerpt && (
            <Text style={[styles.excerpt, { color: colors.text }]}>{post.excerpt}</Text>
          )}
          
          {post.content ? (
            <Text style={[styles.articleContent, { color: colors.text }]}>{post.content}</Text>
          ) : (
            <View style={styles.readMoreSection}>
              <Text style={[styles.readMoreText, { color: colors.secondaryText }]}>
                This article is available on the web. Tap below to read the full content.
              </Text>
              <TouchableOpacity style={styles.readMoreBtn} onPress={handleOpenInBrowser}>
                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.readMoreGradient}>
                  <Ionicons name="globe-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.readMoreBtnText}>Read Full Article</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <View style={[styles.tagsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.tagsTitle, { color: colors.text }]}>Tags</Text>
            <View style={styles.tagsRow}>
              {post.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={[styles.actionsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.actionsTitle, { color: colors.text }]}>Enjoyed this article?</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
              <Ionicons name="heart-outline" size={22} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: colors.text }]}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={22} color="#3B82F6" />
              <Text style={[styles.actionBtnText, { color: colors.text }]}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
              <Ionicons name="bookmark-outline" size={22} color="#F59E0B" />
              <Text style={[styles.actionBtnText, { color: colors.text }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: height * 0.38,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerActions: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  headerInfo: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  metaCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  authorRole: {
    fontSize: 12,
  },
  metaStats: {
    alignItems: 'flex-end',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  articleCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  excerpt: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 28,
  },
  readMoreSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  readMoreText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  readMoreBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  readMoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 10,
  },
  readMoreBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tagsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
