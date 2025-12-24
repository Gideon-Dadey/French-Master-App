import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { blogAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width } = Dimensions.get('window');

export default function CommunityScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const { stats: gamificationStats } = useGamification();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { id: null, name: 'All Topics', icon: 'grid-outline', color: premiumColors.primary.main },
    { id: 'grammar', name: 'Grammar', icon: 'school-outline', color: premiumColors.accent.emerald },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'book-outline', color: premiumColors.accent.gold },
    { id: 'pronunciation', name: 'Pronunciation', icon: 'mic-outline', color: premiumColors.accent.rose },
    { id: 'culture', name: 'Culture', icon: 'globe-outline', color: premiumColors.accent.sky },
  ];

  const trendingTopics = [
    { 
      _id: 1, 
      id: 1,
      title: 'Best way to learn French verbs?', 
      replies: 24, 
      views: 156, 
      author: 'Sarah M.',
      excerpt: 'Looking for effective methods to master French verb conjugations...',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      category: 'grammar',
      likes: 15,
    },
    { 
      _id: 2, 
      id: 2,
      title: 'French pronunciation tips', 
      replies: 18, 
      views: 203, 
      author: 'Jean P.',
      excerpt: 'Share your best techniques for improving French pronunciation...',
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      category: 'pronunciation',
      likes: 22,
    },
    { 
      _id: 3, 
      id: 3,
      title: 'Study group for A2 level', 
      replies: 12, 
      views: 89, 
      author: 'Marie L.',
      excerpt: 'Forming a study group for A2 level French learners...',
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      category: 'vocabulary',
      likes: 8,
    },
  ];

  const communityStats = {
    totalMembers: 1250,
    activeToday: 342,
    discussions: 456,
    helpfulAnswers: 1234,
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getAll({ limit: 5 }).catch(() => ({ data: { data: [] } }));
      setRecentPosts(response.data.data || []);
    } catch (error) {
      console.error('Failed to load community data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
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
    return 'Recently';
  };

  const userName = user?.name?.split(' ')[0] || 'Learner';

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
            <View>
              <Text style={[styles.greeting, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
                Community Hub
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Connect, learn, and grow together
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={() => {}}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
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
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={isDarkMode ? '#FFFFFF' : '#424242'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Community Stats */}
        <View style={styles.statsSection}>
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.lg]}>
            <View style={styles.statsGrid}>
              <StatItem
                icon="people"
                value={communityStats.totalMembers}
                label="Members"
                color={premiumColors.primary.main}
                colors={colors}
              />
              <StatItem
                icon="flash"
                value={communityStats.activeToday}
                label="Active Today"
                color={premiumColors.accent.emerald}
                colors={colors}
              />
              <StatItem
                icon="chatbubbles"
                value={communityStats.discussions}
                label="Discussions"
                color={premiumColors.accent.gold}
                colors={colors}
              />
              <StatItem
                icon="checkmark-circle"
                value={communityStats.helpfulAnswers}
                label="Answers"
                color={premiumColors.accent.rose}
                colors={colors}
              />
            </View>
          </View>
        </View>

        {/* Categories Filter */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse Topics</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BrowseTopics')}>
              <Text style={[styles.seeAllText, { color: premiumColors.primary.main }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
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
                  size={18}
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
        </View>

        {/* Trending Topics */}
        {trendingTopics.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Now</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Discussions', { sort: 'trending' })}>
                <Text style={[styles.seeAllText, { color: premiumColors.primary.main }]}>See All</Text>
              </TouchableOpacity>
            </View>
            {trendingTopics.slice(0, 3).map((topic, index) => (
              <DiscussionCard
                key={topic._id || topic.id || index}
                post={topic}
                colors={colors}
                onPress={() => navigation.navigate('BlogDetail', { postId: topic._id || topic.id })}
              />
            ))}
          </View>
        )}

        {/* Recent Discussions */}
        {recentPosts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Discussions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BlogList')}>
                <Text style={[styles.seeAllText, { color: premiumColors.primary.main }]}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentPosts.slice(0, 3).map((post, index) => (
              <DiscussionCard
                key={post._id || post.id || index}
                post={post}
                colors={colors}
                onPress={() => navigation.navigate('BlogDetail', { postId: post._id || post.id })}
              />
            ))}
          </View>
        )}

        {/* Community Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Features</Text>
          <View style={styles.featuresGrid}>
            <FeatureCard
              icon="trophy"
              title="Leaderboard"
              subtitle="Top learners"
              color={premiumColors.accent.gold}
              colors={colors}
              onPress={() => navigation.navigate('Leaderboard')}
            />
            <FeatureCard
              icon="people-circle"
              title="Study Groups"
              subtitle="Join groups"
              color={premiumColors.primary.main}
              colors={colors}
              onPress={() => navigation.navigate('StudyGroups')}
            />
            <FeatureCard
              icon="chatbubbles"
              title="Q&A Forum"
              subtitle="Ask questions"
              color={premiumColors.accent.emerald}
              colors={colors}
              onPress={() => navigation.navigate('QandAForum')}
            />
            <FeatureCard
              icon="share-social"
              title="Share Progress"
              subtitle="Show achievements"
              color={premiumColors.accent.rose}
              colors={colors}
              onPress={() => navigation.navigate('ShareProgress')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}
              onPress={() => navigation.navigate('Discussions')}
            >
              <LinearGradient
                colors={[premiumColors.primary.main, premiumColors.primary.light]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="create" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Start Discussion</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}
              onPress={() => navigation.navigate('QandAForum')}
            >
              <LinearGradient
                colors={[premiumColors.accent.emerald, premiumColors.accent.emerald + 'DD']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="help-circle" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Ask Question</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function StatItem({ icon, value, label, color, colors }) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
    </View>
  );
}

function TopicCard({ topic, colors, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.topicCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.topicContent}>
        <Text style={[styles.topicTitle, { color: colors.text }]} numberOfLines={2}>
          {topic.title}
        </Text>
        <View style={styles.topicMeta}>
          <View style={styles.topicMetaItem}>
            <Ionicons name="person" size={12} color={colors.secondaryText} />
            <Text style={[styles.topicMetaText, { color: colors.secondaryText }]}>
              {topic.author}
            </Text>
          </View>
          <View style={styles.topicMetaItem}>
            <Ionicons name="chatbubble" size={12} color={colors.secondaryText} />
            <Text style={[styles.topicMetaText, { color: colors.secondaryText }]}>
              {topic.replies}
            </Text>
          </View>
          <View style={styles.topicMetaItem}>
            <Ionicons name="eye" size={12} color={colors.secondaryText} />
            <Text style={[styles.topicMetaText, { color: colors.secondaryText }]}>
              {topic.views}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
    </TouchableOpacity>
  );
}

function DiscussionCard({ post, colors, onPress }) {
  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return 'Recently';
  };

  return (
    <TouchableOpacity
      style={[styles.discussionCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.discussionHeader}>
        <View style={[styles.avatarContainer, { backgroundColor: premiumColors.primary.main + '20' }]}>
          <Ionicons name="person" size={20} color={premiumColors.primary.main} />
        </View>
        <View style={styles.discussionAuthor}>
          <Text style={[styles.authorName, { color: colors.text }]}>
            {post.author || 'Community Member'}
          </Text>
          <Text style={[styles.postTime, { color: colors.secondaryText }]}>
            {formatTimeAgo(post.publishedAt || post.createdAt)}
          </Text>
        </View>
      </View>
      <Text style={[styles.discussionTitle, { color: colors.text }]} numberOfLines={2}>
        {post.title}
      </Text>
      {post.excerpt && (
        <Text style={[styles.discussionExcerpt, { color: colors.secondaryText }]} numberOfLines={2}>
          {post.excerpt}
        </Text>
      )}
      <View style={styles.discussionFooter}>
        <View style={styles.discussionStats}>
          <View style={styles.statBadge}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.secondaryText} />
            <Text style={[styles.statBadgeText, { color: colors.secondaryText }]}>12</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="heart-outline" size={14} color={colors.secondaryText} />
            <Text style={[styles.statBadgeText, { color: colors.secondaryText }]}>8</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="eye-outline" size={14} color={colors.secondaryText} />
            <Text style={[styles.statBadgeText, { color: colors.secondaryText }]}>
              {post.views || '0'}
            </Text>
          </View>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: premiumColors.primary.main + '20' }]}>
          <Text style={[styles.categoryBadgeText, { color: premiumColors.primary.main }]}>
            {post.category?.toUpperCase() || 'DISCUSSION'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FeatureCard({ icon, title, subtitle, color, colors, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[color, color + 'DD']}
        style={styles.featureGradient}
      >
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </LinearGradient>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
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
  greeting: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  statsCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: spacing.md,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingRight: spacing.md,
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
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  topicMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  topicMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  topicMetaText: {
    fontSize: fontSize.xs,
  },
  discussionCard: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discussionAuthor: {
    flex: 1,
  },
  authorName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  postTime: {
    fontSize: fontSize.xs,
  },
  discussionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  discussionExcerpt: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  discussionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discussionStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  statBadgeText: {
    fontSize: fontSize.xs,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
  },
  categoryBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  featureCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  featureGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  featureSubtitle: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  quickActionGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
});
