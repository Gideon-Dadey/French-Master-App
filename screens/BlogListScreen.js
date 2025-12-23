import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { spacing, fontSize } from '../src/utils/responsive';
import BlogCard from '../src/components/BlogCard';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import Heading from '../src/components/Heading';
import Chip from '../src/components/Chip';
import { blogAPI } from '../src/services/api';

const BLOG_CATEGORIES = [
  { id: 'all', name: 'All Posts', icon: 'grid-outline' },
  { id: 'written-lessons', name: 'Written Lessons', icon: 'book-outline' },
  { id: 'news', name: 'News', icon: 'newspaper-outline' },
];

export default function BlogListScreen({ navigation }) {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadBlogPosts();
  }, [selectedCategory]);

  const loadBlogPosts = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const params = {
        page,
        limit: 20,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
      };

      const response = await blogAPI.getAll(params);

      if (response.data.success) {
        const newPosts = response.data.data || [];
        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        setHasMore(newPosts.length === 20);
        setCurrentPage(page);
      } else {
        throw new Error('Failed to load blog posts');
      }
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError('Failed to load blog posts. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBlogPosts(1, false);
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setHasMore(true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadBlogPosts(currentPage + 1, true);
    }
  };

  const renderBlogCard = ({ item }) => (
    <BlogCard
      post={item}
      onPress={() => navigation.navigate('BlogDetail', { postId: item._id || item.id, post: item })}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>French Lessons & News</Text>
        </View>
        <LoadingSpinner message="Loading blog posts..." />
      </View>
    );
  }

  if (error && posts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>French Lessons & News</Text>
        </View>
        <ErrorMessage message={error} onRetry={() => loadBlogPosts(1, false)} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>French Lessons & News</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Category Filters */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {BLOG_CATEGORIES.map((category) => (
              <Chip
                key={category.id}
                title={category.name}
                variant={selectedCategory === category.id ? 'primary' : 'default'}
                leading={<Ionicons name={category.icon} size={16} />}
                onPress={() => handleCategoryPress(category.id)}
                style={{ marginRight: 10 }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Blog Posts List */}
        <View style={styles.postsContainer}>
          {posts.length > 0 ? (
            <>
              {posts.map((post, index) => (
                <BlogCard
                  key={post._id || post.id || index}
                  post={post}
                  onPress={() => navigation.navigate('BlogDetail', { postId: post._id || post.id, post })}
                />
              ))}
              {loadingMore && (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}
              {hasMore && !loadingMore && (
                <TouchableOpacity
                  style={[styles.loadMoreButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={handleLoadMore}
                >
                  <Text style={[styles.loadMoreText, { color: colors.primary }]}>Load More Posts</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No blog posts found
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                Check back later for new content
              </Text>
            </View>
          )}
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  categoriesSection: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  categoriesContainer: {
    gap: spacing.sm,
  },
  postsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  loadMoreButton: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  loadMoreText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});

