import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { blogAPI, studyGroupsAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

export default function CommunityScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const gamificationContext = useGamification();
  const gamificationStats = gamificationContext?.stats || {};
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  const communityStats = {
    totalMembers: 12500,
    activeNow: 342,
    discussions: 4560,
    studyGroups: 156,
  };

  useEffect(() => {
    loadData();
    // Start entrance animations
    Animated.stagger(100, [
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsRes, groupsRes] = await Promise.all([
        blogAPI.getAll({ limit: 5 }).catch(() => ({ data: { data: [] } })),
        studyGroupsAPI.getAll().catch(() => ({ data: { data: [] } })),
      ]);
      setRecentPosts(postsRes.data.data || []);
      setStudyGroups(groupsRes.data.data?.slice(0, 3) || []);
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

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    Animated.spring(searchAnim, {
      toValue: showSearch ? 0 : 1,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  };

  const userName = user?.name?.split(' ')[0] || 'Learner';

  // Premium Hub Navigation Items
  const hubItems = [
    {
      id: 'study-groups',
      title: 'Study Groups',
      subtitle: 'Learn together',
      icon: 'people',
      gradient: ['#6366F1', '#8B5CF6'],
      badge: studyGroups.length > 0 ? `${studyGroups.length} active` : null,
      onPress: () => navigation.navigate('StudyGroups'),
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      subtitle: 'Top learners',
      icon: 'trophy',
      gradient: ['#F59E0B', '#EF4444'],
      badge: 'Live',
      onPress: () => navigation.navigate('Leaderboard'),
    },
    {
      id: 'discussions',
      title: 'Discussions',
      subtitle: 'Join conversations',
      icon: 'chatbubbles',
      gradient: ['#10B981', '#059669'],
      badge: recentPosts.length > 0 ? `${recentPosts.length} new` : null,
      onPress: () => navigation.navigate('BlogList'),
    },
    {
      id: 'qa-forum',
      title: 'Q&A Forum',
      subtitle: 'Get answers',
      icon: 'help-circle',
      gradient: ['#EC4899', '#F43F5E'],
      badge: null,
      onPress: () => navigation.navigate('QandAForum'),
    },
  ];

  // Quick Actions
  const quickActions = [
    { icon: 'add-circle', label: 'New Post', color: '#6366F1', onPress: () => navigation.navigate('CreatePost') },
    { icon: 'people-circle', label: 'Find Group', color: '#10B981', onPress: () => navigation.navigate('StudyGroups') },
    { icon: 'star', label: 'Achievements', color: '#F59E0B', onPress: () => navigation.navigate('Achievements') },
    { icon: 'share-social', label: 'Invite', color: '#EC4899', onPress: () => {} },
  ];

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Animated Header */}
      <Animated.View
        style={[
          styles.headerWrapper,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
          },
        ]}
      >
        <LinearGradient
          colors={isDarkMode 
            ? ['#0F0F23', '#1A1A3E', '#252560']
            : ['#F8FAFC', '#EEF2FF', '#E0E7FF']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Decorative Elements */}
          <View style={styles.headerDecor}>
            <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)' }]} />
            <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: isDarkMode ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.08)' }]} />
          </View>

          <View style={styles.headerContent}>
            {/* Top Row */}
            <View style={styles.headerTopRow}>
              <View style={styles.headerTitleSection}>
                <View style={styles.headerBadge}>
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerBadgeGradient}
                  >
                    <Ionicons name="globe" size={14} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.headerBadgeText, { color: isDarkMode ? '#A5B4FC' : '#6366F1' }]}>
                    COMMUNITY
                  </Text>
                </View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Learning Hub
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
                  Connect • Learn • Grow
                </Text>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={[styles.headerActionBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.1)' }]}
                  onPress={toggleSearch}
                >
                  <Ionicons name="search" size={22} color={isDarkMode ? '#FFFFFF' : '#6366F1'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.headerActionBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.1)' }]}
                  onPress={() => navigation.navigate('Notifications')}
                >
                  <Ionicons name="notifications" size={22} color={isDarkMode ? '#FFFFFF' : '#6366F1'} />
                  <View style={styles.notificationDot} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Live Stats Row */}
            <View style={styles.liveStatsRow}>
              <View style={[styles.liveStatCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)' }]}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={[styles.liveText, { color: '#10B981' }]}>LIVE</Text>
                </View>
                <Text style={[styles.liveStatValue, { color: colors.text }]}>{communityStats.activeNow}</Text>
                <Text style={[styles.liveStatLabel, { color: colors.secondaryText }]}>Online Now</Text>
              </View>
              <View style={[styles.liveStatCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)' }]}>
                <Ionicons name="people" size={18} color="#6366F1" />
                <Text style={[styles.liveStatValue, { color: colors.text }]}>{(communityStats.totalMembers / 1000).toFixed(1)}K</Text>
                <Text style={[styles.liveStatLabel, { color: colors.secondaryText }]}>Members</Text>
              </View>
              <View style={[styles.liveStatCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)' }]}>
                <Ionicons name="chatbubbles" size={18} color="#F59E0B" />
                <Text style={[styles.liveStatValue, { color: colors.text }]}>{(communityStats.discussions / 1000).toFixed(1)}K</Text>
                <Text style={[styles.liveStatLabel, { color: colors.secondaryText }]}>Posts</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Search Overlay */}
      {showSearch && (
        <Animated.View
          style={[
            styles.searchOverlay,
            { backgroundColor: colors.background },
            {
              opacity: searchAnim,
              transform: [{ translateY: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
            },
          ]}
        >
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.secondaryText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search community..."
              placeholderTextColor={colors.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setSearchQuery(''); toggleSearch(); }}>
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Hub Navigation Grid */}
        <Animated.View
          style={[
            styles.hubSection,
            {
              opacity: cardsAnim,
              transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore</Text>
            <View style={styles.sectionBadge}>
              <Ionicons name="sparkles" size={14} color="#F59E0B" />
            </View>
          </View>

          <View style={styles.hubGrid}>
            {hubItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.hubCard, { backgroundColor: colors.card }, premiumShadows.lg]}
                onPress={item.onPress}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.hubCardGradient}
                >
                  <Ionicons name={item.icon} size={28} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.hubCardContent}>
                  <Text style={[styles.hubCardTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.hubCardSubtitle, { color: colors.secondaryText }]}>{item.subtitle}</Text>
                </View>
                {item.badge && (
                  <View style={[styles.hubCardBadge, { backgroundColor: item.gradient[0] + '20' }]}>
                    <Text style={[styles.hubCardBadgeText, { color: item.gradient[0] }]}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} style={styles.hubCardArrow} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScroll}
          >
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={[styles.quickActionLabel, { color: colors.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Study Groups */}
        {studyGroups.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Study Groups</Text>
              <TouchableOpacity onPress={() => navigation.navigate('StudyGroups')}>
                <Text style={[styles.seeAllText, { color: '#6366F1' }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.groupsScroll}
            >
              {studyGroups.map((group, index) => (
                <StudyGroupCard
                  key={group._id || index}
                  group={group}
                  colors={colors}
                  isDarkMode={isDarkMode}
                  onPress={() => navigation.navigate('StudyGroupDetail', { groupId: group._id, initialTab: 'discussions' })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Discussions */}
        {recentPosts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Discussions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BlogList')}>
                <Text style={[styles.seeAllText, { color: '#6366F1' }]}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentPosts.slice(0, 3).map((post, index) => (
              <DiscussionCard
                key={post._id || index}
                post={post}
                colors={colors}
                isDarkMode={isDarkMode}
                onPress={() => navigation.navigate('BlogDetail', { postId: post._id })}
              />
            ))}
          </View>
        )}

        {/* Community Highlights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Highlights</Text>
          </View>
          <View style={styles.highlightsGrid}>
            <HighlightCard
              icon="flame"
              title="7-Day Streak"
              subtitle="Keep learning daily"
              gradient={['#F97316', '#EA580C']}
              colors={colors}
            />
            <HighlightCard
              icon="medal"
              title="Top Contributor"
              subtitle="Earn recognition"
              gradient={['#8B5CF6', '#7C3AED']}
              colors={colors}
            />
            <HighlightCard
              icon="gift"
              title="Weekly Challenge"
              subtitle="Win rewards"
              gradient={['#EC4899', '#DB2777']}
              colors={colors}
            />
            <HighlightCard
              icon="ribbon"
              title="Achievements"
              subtitle="Unlock badges"
              gradient={['#14B8A6', '#0D9488']}
              colors={colors}
            />
          </View>
        </View>

        {/* Join Banner */}
        <View style={styles.section}>
          <LinearGradient
            colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#EEF2FF', '#E0E7FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.joinBanner, premiumShadows.lg]}
          >
            <View style={styles.joinBannerContent}>
              <View style={styles.joinBannerIcon}>
                <Ionicons name="rocket" size={32} color="#6366F1" />
              </View>
              <View style={styles.joinBannerText}>
                <Text style={[styles.joinBannerTitle, { color: colors.text }]}>
                  Start Your Journey
                </Text>
                <Text style={[styles.joinBannerSubtitle, { color: colors.secondaryText }]}>
                  Create or join a study group today
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.joinBannerBtn}
              onPress={() => navigation.navigate('StudyGroups')}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.joinBannerBtnGradient}
              >
                <Text style={styles.joinBannerBtnText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// Study Group Card Component
function StudyGroupCard({ group, colors, isDarkMode, onPress }) {
  const memberCount = group.members?.length || 0;
  
  return (
    <TouchableOpacity
      style={[styles.groupCard, { backgroundColor: colors.card }, premiumShadows.md]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#EEF2FF', '#E0E7FF']}
        style={styles.groupCardHeader}
      >
        <View style={styles.groupCardIcon}>
          {group.image ? (
            <Image source={{ uri: group.image }} style={styles.groupCardImage} />
          ) : (
            <Ionicons name="people" size={24} color="#6366F1" />
          )}
        </View>
        <View style={styles.groupCardBadge}>
          <Ionicons name="ellipse" size={8} color="#10B981" />
          <Text style={styles.groupCardBadgeText}>Active</Text>
        </View>
      </LinearGradient>
      <View style={styles.groupCardBody}>
        <Text style={[styles.groupCardTitle, { color: colors.text }]} numberOfLines={1}>
          {group.name}
        </Text>
        <Text style={[styles.groupCardDesc, { color: colors.secondaryText }]} numberOfLines={2}>
          {group.description || 'Join this study group to learn together'}
        </Text>
        <View style={styles.groupCardFooter}>
          <View style={styles.groupCardMembers}>
            <Ionicons name="people-outline" size={14} color={colors.secondaryText} />
            <Text style={[styles.groupCardMemberText, { color: colors.secondaryText }]}>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>
          <View style={[styles.groupCardLevel, { backgroundColor: '#6366F1' + '20' }]}>
            <Text style={[styles.groupCardLevelText, { color: '#6366F1' }]}>
              {group.level || 'All Levels'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Discussion Card Component
function DiscussionCard({ post, colors, isDarkMode, onPress }) {
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
      style={[styles.discussionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.discussionHeader}>
        <View style={[styles.discussionAvatar, { backgroundColor: '#6366F1' + '20' }]}>
          <Ionicons name="person" size={18} color="#6366F1" />
        </View>
        <View style={styles.discussionMeta}>
          <Text style={[styles.discussionAuthor, { color: colors.text }]}>
            {post.author || 'Community Member'}
          </Text>
          <Text style={[styles.discussionTime, { color: colors.secondaryText }]}>
            {formatTimeAgo(post.publishedAt || post.createdAt)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
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
          <View style={styles.discussionStat}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.secondaryText} />
            <Text style={[styles.discussionStatText, { color: colors.secondaryText }]}>12</Text>
          </View>
          <View style={styles.discussionStat}>
            <Ionicons name="heart-outline" size={14} color={colors.secondaryText} />
            <Text style={[styles.discussionStatText, { color: colors.secondaryText }]}>8</Text>
          </View>
        </View>
        <View style={[styles.discussionTag, { backgroundColor: '#10B981' + '15' }]}>
          <Text style={[styles.discussionTagText, { color: '#10B981' }]}>
            {post.category?.toUpperCase() || 'DISCUSSION'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Highlight Card Component
function HighlightCard({ icon, title, subtitle, gradient, colors }) {
  return (
    <View style={[styles.highlightCard, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.highlightIcon}
      >
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </LinearGradient>
      <Text style={[styles.highlightTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.highlightSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    zIndex: 10,
  },
  header: {
    paddingTop: 55,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  decorCircle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  decorCircle2: {
    width: 150,
    height: 150,
    bottom: -30,
    left: -30,
  },
  headerContent: {
    zIndex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerTitleSection: {
    flex: 1,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  headerBadgeGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  liveStatCard: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: premiumBorderRadius.lg,
    alignItems: 'center',
    gap: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  liveStatValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  liveStatLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  searchOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
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
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  hubSection: {
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
  sectionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  hubGrid: {
    gap: spacing.sm,
  },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.xl,
    gap: spacing.md,
  },
  hubCardGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hubCardContent: {
    flex: 1,
  },
  hubCardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  hubCardSubtitle: {
    fontSize: fontSize.sm,
  },
  hubCardBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.full,
  },
  hubCardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  hubCardArrow: {
    marginLeft: spacing.xs,
  },
  quickActionsSection: {
    marginBottom: spacing.xl,
  },
  quickActionsScroll: {
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  quickActionBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginRight: spacing.sm,
    minWidth: 90,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  groupsScroll: {
    paddingRight: spacing.lg,
  },
  groupCard: {
    width: width * 0.7,
    borderRadius: premiumBorderRadius.xl,
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  groupCardHeader: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  groupCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  groupCardImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  groupCardBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.full,
  },
  groupCardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
  },
  groupCardBody: {
    padding: spacing.md,
  },
  groupCardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  groupCardDesc: {
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  groupCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupCardMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupCardMemberText: {
    fontSize: fontSize.xs,
  },
  groupCardLevel: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.base,
  },
  groupCardLevelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  discussionCard: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  discussionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discussionMeta: {
    flex: 1,
  },
  discussionAuthor: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  discussionTime: {
    fontSize: fontSize.xs,
  },
  discussionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs,
    lineHeight: 22,
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
  },
  discussionStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  discussionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discussionStatText: {
    fontSize: fontSize.xs,
  },
  discussionTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: premiumBorderRadius.base,
  },
  discussionTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  highlightCard: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    alignItems: 'center',
    ...premiumShadows.sm,
  },
  highlightIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  highlightTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  highlightSubtitle: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  joinBanner: {
    padding: spacing.lg,
    borderRadius: premiumBorderRadius.xl,
    gap: spacing.md,
  },
  joinBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  joinBannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(99,102,241,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBannerText: {
    flex: 1,
  },
  joinBannerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  joinBannerSubtitle: {
    fontSize: fontSize.sm,
  },
  joinBannerBtn: {
    borderRadius: premiumBorderRadius.lg,
    overflow: 'hidden',
  },
  joinBannerBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  joinBannerBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
