import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { discussionsAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';

const { width } = Dimensions.get('window');

export default function DiscussionsScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSort, setSelectedSort] = useState('recent');

  const categories = [
    { id: null, name: 'All', icon: 'grid-outline', color: premiumColors.primary.main },
    { id: 'general', name: 'General', icon: 'chatbubbles-outline', color: premiumColors.primary.main },
    { id: 'grammar', name: 'Grammar', icon: 'school-outline', color: premiumColors.accent.emerald },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'book-outline', color: premiumColors.accent.gold },
    { id: 'pronunciation', name: 'Pronunciation', icon: 'mic-outline', color: premiumColors.accent.rose },
    { id: 'culture', name: 'Culture', icon: 'globe-outline', color: premiumColors.accent.sky },
    { id: 'tips', name: 'Tips', icon: 'bulb-outline', color: premiumColors.accent.gold },
    { id: 'resources', name: 'Resources', icon: 'folder-outline', color: premiumColors.primary.main },
  ];

  const sortOptions = [
    { id: 'recent', name: 'Recent', icon: 'time-outline' },
    { id: 'popular', name: 'Popular', icon: 'flame-outline' },
    { id: 'trending', name: 'Trending', icon: 'trending-up-outline' },
    { id: 'most-replied', name: 'Most Replied', icon: 'chatbubbles-outline' },
  ];

  useEffect(() => {
    loadDiscussions();
  }, [selectedCategory, selectedSort]);

  const loadDiscussions = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      
      const params = {
        category: selectedCategory || undefined,
        sort: selectedSort,
        search: searchQuery || undefined,
        limit: 20,
        page: 1,
      };

      Object.keys(params).forEach(key => 
        params[key] === null || params[key] === undefined ? delete params[key] : {}
      );

      const response = await discussionsAPI.getAll(params);
      setDiscussions(response.data.data || []);
    } catch (error) {
      console.error('Failed to load discussions:', error);
      setError('Failed to load discussions. Please check your connection.');
      setDiscussions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedSort, searchQuery, refreshing]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDiscussions();
  }, [loadDiscussions]);

  const handleCreateDiscussion = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to start a discussion', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }
    navigation.navigate('CreateDiscussion');
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <LinearGradient
        colors={isDarkMode 
          ? ['#1a0a2e', '#16213e', '#0f3460']
          : ['#E8EAF6', '#F3E5F5', '#E1BEE7']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#424242'} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.title, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
                Discussions
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Join the conversation
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleCreateDiscussion}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)' }]}>
            <Ionicons name="search" size={20} color={isDarkMode ? '#FFFFFF' : '#424242'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: isDarkMode ? '#FFFFFF' : '#000' }]}
              placeholder="Search discussions..."
              placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.6)' : '#9E9E9E'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={loadDiscussions}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); loadDiscussions(); }}>
                <Ionicons name="close-circle" size={20} color={isDarkMode ? '#FFFFFF' : '#424242'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Categories Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id || 'all'}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === category.id
                  ? category.color
                  : colors.card,
                borderColor: selectedCategory === category.id
                  ? category.color
                  : colors.border,
              },
              premiumShadows.sm,
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={category.icon}
              size={16}
              color={selectedCategory === category.id ? '#FFFFFF' : colors.text}
            />
            <Text
              style={[
                styles.categoryText,
                {
                  color: selectedCategory === category.id ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortContainer}
        contentContainerStyle={styles.sortContent}
      >
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortChip,
              {
                backgroundColor: selectedSort === option.id
                  ? premiumColors.primary.main
                  : colors.card,
                borderColor: selectedSort === option.id
                  ? premiumColors.primary.main
                  : colors.border,
              },
            ]}
            onPress={() => setSelectedSort(option.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={option.icon}
              size={14}
              color={selectedSort === option.id ? '#FFFFFF' : colors.text}
            />
            <Text
              style={[
                styles.sortText,
                {
                  color: selectedSort === option.id ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {error && !loading ? (
        <ErrorMessage message={error} onRetry={loadDiscussions} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        >
          {discussions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No discussions yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                Be the first to start a discussion!
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: premiumColors.primary.main }]}
                onPress={handleCreateDiscussion}
              >
                <Text style={styles.emptyButtonText}>Start Discussion</Text>
              </TouchableOpacity>
            </View>
          ) : (
            discussions.map((discussion) => (
              <DiscussionCard
                key={discussion._id}
                discussion={discussion}
                colors={colors}
                onPress={() => navigation.navigate('DiscussionDetail', { discussionId: discussion._id })}
                formatTimeAgo={formatTimeAgo}
              />
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

function DiscussionCard({ discussion, colors, onPress, formatTimeAgo }) {
  const author = typeof discussion.author === 'object' ? discussion.author : null;
  const replyCount = discussion.replies?.length || 0;
  const likeCount = discussion.likes?.length || 0;
  const categoryColors = {
    general: premiumColors.primary.main,
    grammar: premiumColors.accent.emerald,
    vocabulary: premiumColors.accent.gold,
    pronunciation: premiumColors.accent.rose,
    culture: premiumColors.accent.sky,
    tips: premiumColors.accent.gold,
    resources: premiumColors.primary.main,
  };

  return (
    <TouchableOpacity
      style={[styles.discussionCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {discussion.isPinned && (
        <View style={styles.pinnedBadge}>
          <Ionicons name="pin" size={14} color={premiumColors.accent.gold} />
          <Text style={[styles.pinnedText, { color: premiumColors.accent.gold }]}>Pinned</Text>
        </View>
      )}
      <View style={styles.discussionHeader}>
        <View style={styles.discussionLeft}>
          <View style={[styles.categoryBadge, { backgroundColor: (categoryColors[discussion.category] || premiumColors.primary.main) + '20' }]}>
            <Text style={[styles.categoryBadgeText, { color: categoryColors[discussion.category] || premiumColors.primary.main }]}>
              {discussion.category?.toUpperCase() || 'GENERAL'}
            </Text>
          </View>
          <Text style={[styles.discussionTitle, { color: colors.text }]} numberOfLines={2}>
            {discussion.title}
          </Text>
          <Text style={[styles.discussionExcerpt, { color: colors.secondaryText }]} numberOfLines={2}>
            {discussion.content}
          </Text>
        </View>
      </View>
      <View style={styles.discussionFooter}>
        <View style={styles.footerLeft}>
          <View style={[styles.avatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
            <Ionicons name="person" size={16} color={premiumColors.primary.main} />
          </View>
          <Text style={[styles.authorName, { color: colors.text }]}>
            {author?.name || 'Anonymous'}
          </Text>
          <Text style={[styles.discussionTime, { color: colors.secondaryText }]}>
            {formatTimeAgo(discussion.createdAt)}
          </Text>
        </View>
        <View style={styles.footerRight}>
          <View style={styles.footerItem}>
            <Ionicons name="heart-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              {likeCount}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              {replyCount}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="eye-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              {discussion.views || 0}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...premiumShadows.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.lg,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.xs,
  },
  categoriesContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  sortContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sortContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
    gap: spacing.xs / 2,
  },
  sortText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    ...premiumShadows.md,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  discussionCard: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: premiumBorderRadius.base,
    backgroundColor: premiumColors.accent.gold + '20',
    marginBottom: spacing.sm,
    gap: spacing.xs / 2,
  },
  pinnedText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  discussionHeader: {
    marginBottom: spacing.sm,
  },
  discussionLeft: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  discussionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  discussionExcerpt: {
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  discussionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  discussionTime: {
    fontSize: fontSize.xs,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  footerText: {
    fontSize: fontSize.xs,
  },
});

