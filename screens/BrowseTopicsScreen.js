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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { topicsAPI, discussionsAPI, questionsAPI, blogAPI, coursesAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';

const { width } = Dimensions.get('window');

export default function BrowseTopicsScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicContent, setTopicContent] = useState([]);
  const [contentType, setContentType] = useState('all');

  const contentTypes = [
    { id: 'all', name: 'All', icon: 'grid-outline' },
    { id: 'discussions', name: 'Discussions', icon: 'chatbubbles-outline' },
    { id: 'questions', name: 'Questions', icon: 'help-circle-outline' },
    { id: 'blogs', name: 'Articles', icon: 'newspaper-outline' },
    { id: 'courses', name: 'Courses', icon: 'book-outline' },
  ];

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      loadTopicContent();
    }
  }, [selectedTopic, contentType]);

  const loadTopics = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const response = await topicsAPI.getAll();
      setTopics(response.data.data || []);
    } catch (error) {
      console.error('Failed to load topics:', error);
      setError('Failed to load topics. Please check your connection.');
      setTopics([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  const loadTopicContent = async () => {
    try {
      setLoading(true);
      const response = await topicsAPI.getById(selectedTopic.id, {
        type: contentType,
        limit: 20,
        page: 1,
      });
      setTopicContent(response.data.data || []);
    } catch (error) {
      console.error('Failed to load topic content:', error);
      setTopicContent([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTopics();
  }, [loadTopics]);

  const handleTopicPress = (topic) => {
    setSelectedTopic(topic);
    setContentType('all');
  };

  const handleContentPress = (item) => {
    if (item.type === 'discussion') {
      navigation.navigate('DiscussionDetail', { discussionId: item.data._id });
    } else if (item.type === 'question') {
      navigation.navigate('QuestionDetail', { questionId: item.data._id });
    } else if (item.type === 'blog') {
      navigation.navigate('BlogDetail', { postId: item.data._id });
    } else if (item.type === 'course') {
      navigation.navigate('CourseDetail', { courseId: item.data._id });
    }
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

  if (loading && !refreshing && !selectedTopic) {
    return <LoadingSpinner />;
  }

  // Show topic detail view
  if (selectedTopic) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
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
              <TouchableOpacity onPress={() => setSelectedTopic(null)}>
                <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#424242'} />
              </TouchableOpacity>
              <View style={styles.topicHeaderInfo}>
                <View style={[styles.topicIconLarge, { backgroundColor: selectedTopic.color + '20' }]}>
                  <Ionicons name={selectedTopic.icon} size={32} color={selectedTopic.color} />
                </View>
                <View>
                  <Text style={[styles.topicTitle, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
                    {selectedTopic.name}
                  </Text>
                  <Text style={[styles.topicSubtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                    {selectedTopic.counts?.total || 0} items
                  </Text>
                </View>
              </View>
              <View style={{ width: 24 }} />
            </View>
          </View>
        </LinearGradient>

        {/* Content Type Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.contentTypesContainer}
          contentContainerStyle={styles.contentTypesContent}
        >
          {contentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.contentTypeChip,
                {
                  backgroundColor: contentType === type.id
                    ? premiumColors.primary.main
                    : colors.card,
                  borderColor: contentType === type.id
                    ? premiumColors.primary.main
                    : colors.border,
                },
              ]}
              onPress={() => setContentType(type.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={type.icon}
                size={16}
                color={contentType === type.id ? '#FFFFFF' : colors.text}
              />
              <Text
                style={[
                  styles.contentTypeText,
                  {
                    color: contentType === type.id ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadTopicContent} tintColor={colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        >
          {topicContent.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No content in this topic yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                Be the first to contribute!
              </Text>
            </View>
          ) : (
            topicContent.map((item, index) => (
              <TopicContentCard
                key={item.data._id || index}
                item={item}
                colors={colors}
                onPress={() => handleContentPress(item)}
                formatTimeAgo={formatTimeAgo}
              />
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  // Show topics list view
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
                Browse Topics
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Explore by category
              </Text>
            </View>
            <View style={{ width: 24 }} />
          </View>

          {/* Search Bar */}
          <View style={[styles.searchBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)' }]}>
            <Ionicons name="search" size={20} color={isDarkMode ? '#FFFFFF' : '#424242'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: isDarkMode ? '#FFFFFF' : '#000' }]}
              placeholder="Search topics..."
              placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.6)' : '#9E9E9E'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={isDarkMode ? '#FFFFFF' : '#424242'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      {error && !loading ? (
        <ErrorMessage message={error} onRetry={loadTopics} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        >
          {topics.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="grid-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No topics found
              </Text>
            </View>
          ) : (
            <>
              {/* Trending Topics */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Topics</Text>
                <View style={styles.trendingContainer}>
                  {topics.slice(0, 3).map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      colors={colors}
                      onPress={() => handleTopicPress(topic)}
                      isTrending
                    />
                  ))}
                </View>
              </View>

              {/* All Topics */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>All Topics</Text>
                <View style={styles.topicsGrid}>
                  {topics.map((topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      colors={colors}
                      onPress={() => handleTopicPress(topic)}
                    />
                  ))}
                </View>
              </View>
            </>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

function TopicCard({ topic, colors, onPress, isTrending = false }) {
  const counts = topic.counts || {};

  return (
    <TouchableOpacity
      style={[
        styles.topicCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        isTrending && styles.trendingCard,
        premiumShadows.md,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.topicIcon, { backgroundColor: topic.color + '20' }]}>
        <Ionicons name={topic.icon} size={isTrending ? 32 : 24} color={topic.color} />
      </View>
      <Text style={[styles.topicName, { color: colors.text }]}>{topic.name}</Text>
      <View style={styles.topicStats}>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble" size={12} color={colors.secondaryText} />
          <Text style={[styles.statText, { color: colors.secondaryText }]}>
            {counts.discussions || 0}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="help-circle" size={12} color={colors.secondaryText} />
          <Text style={[styles.statText, { color: colors.secondaryText }]}>
            {counts.questions || 0}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="book" size={12} color={colors.secondaryText} />
          <Text style={[styles.statText, { color: colors.secondaryText }]}>
            {counts.courses || 0}
          </Text>
        </View>
      </View>
      <Text style={[styles.topicTotal, { color: topic.color }]}>
        {counts.total || 0} total
      </Text>
    </TouchableOpacity>
  );
}

function TopicContentCard({ item, colors, onPress, formatTimeAgo }) {
  const { type, data } = item;
  const author = typeof data.author === 'object' ? data.author : data.instructor || null;

  const getTypeIcon = () => {
    switch (type) {
      case 'discussion':
        return 'chatbubbles';
      case 'question':
        return 'help-circle';
      case 'blog':
        return 'newspaper';
      case 'course':
        return 'book';
      default:
        return 'document';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'discussion':
        return premiumColors.primary.main;
      case 'question':
        return premiumColors.accent.emerald;
      case 'blog':
        return premiumColors.accent.gold;
      case 'course':
        return premiumColors.accent.sky;
      default:
        return premiumColors.primary.main;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.contentCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.contentHeader}>
        <View style={[styles.contentTypeIcon, { backgroundColor: getTypeColor() + '20' }]}>
          <Ionicons name={getTypeIcon()} size={20} color={getTypeColor()} />
        </View>
        <View style={styles.contentInfo}>
          <Text style={[styles.contentTitle, { color: colors.text }]} numberOfLines={2}>
            {data.title}
          </Text>
          <View style={styles.contentMeta}>
            <View style={[styles.avatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
              <Ionicons name="person" size={14} color={premiumColors.primary.main} />
            </View>
            <Text style={[styles.contentAuthor, { color: colors.secondaryText }]}>
              {author?.name || 'Anonymous'}
            </Text>
            <Text style={[styles.contentTime, { color: colors.secondaryText }]}>
              • {formatTimeAgo(data.createdAt)}
            </Text>
          </View>
        </View>
      </View>
      {(data.content || data.description || data.excerpt) && (
        <Text style={[styles.contentExcerpt, { color: colors.secondaryText }]} numberOfLines={2}>
          {data.content || data.description || data.excerpt}
        </Text>
      )}
      <View style={styles.contentFooter}>
        {data.views !== undefined && (
          <View style={styles.footerItem}>
            <Ionicons name="eye-outline" size={14} color={colors.secondaryText} />
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              {data.views || 0}
            </Text>
          </View>
        )}
        {data.likes !== undefined && (
          <View style={styles.footerItem}>
            <Ionicons name="heart-outline" size={14} color={colors.secondaryText} />
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              {data.likes?.length || 0}
            </Text>
          </View>
        )}
        {data.replies !== undefined && (
          <View style={styles.footerItem}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.secondaryText} />
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              {data.replies?.length || 0}
            </Text>
          </View>
        )}
        {data.price !== undefined && (
          <Text style={[styles.footerText, { color: premiumColors.primary.main }]}>
            {data.isFree ? 'Free' : `GHS ${data.price}`}
          </Text>
        )}
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
  topicHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  topicIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  topicSubtitle: {
    fontSize: fontSize.sm,
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
  contentTypesContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  contentTypesContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  contentTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  contentTypeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  trendingContainer: {
    gap: spacing.md,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  topicCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  trendingCard: {
    width: '100%',
  },
  topicIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  topicName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  topicStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  statText: {
    fontSize: fontSize.xs,
  },
  topicTotal: {
    fontSize: fontSize.sm,
    fontWeight: '700',
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
  },
  contentCard: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  contentHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  contentTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentAuthor: {
    fontSize: fontSize.xs,
  },
  contentTime: {
    fontSize: fontSize.xs,
  },
  contentExcerpt: {
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
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

