import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Animated,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { discussionsAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
  { id: null, name: 'All', icon: 'apps', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
  { id: 'general', name: 'General', icon: 'chatbubbles', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] },
  { id: 'grammar', name: 'Grammar', icon: 'school', color: '#10B981', gradient: ['#10B981', '#059669'] },
  { id: 'vocabulary', name: 'Vocabulary', icon: 'book', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
  { id: 'pronunciation', name: 'Pronunciation', icon: 'mic', color: '#EC4899', gradient: ['#EC4899', '#DB2777'] },
  { id: 'culture', name: 'Culture', icon: 'earth', color: '#06B6D4', gradient: ['#06B6D4', '#0891B2'] },
  { id: 'tips', name: 'Tips & Tricks', icon: 'bulb', color: '#EAB308', gradient: ['#EAB308', '#CA8A04'] },
  { id: 'resources', name: 'Resources', icon: 'folder-open', color: '#14B8A6', gradient: ['#14B8A6', '#0D9488'] },
];

const SORT_OPTIONS = [
  { id: 'recent', name: 'Recent', icon: 'time' },
  { id: 'popular', name: 'Popular', icon: 'flame' },
  { id: 'trending', name: 'Trending', icon: 'trending-up' },
  { id: 'most-replied', name: 'Active', icon: 'chatbubbles' },
];

export default function DiscussionsScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode, organicColors: theme } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSort, setSelectedSort] = useState('recent');
  const [showSearch, setShowSearch] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, replies: 0 });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([]).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Derived colors for category mapping if needed, or keeping static CATEGORIES if they are content-specific
  // For now, we keep CATEGORIES static as they are distinct labels, but we ensure the rest of the UI uses theme.

  useEffect(() => {
    loadDiscussions();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

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
      const data = response.data.data || [];
      setDiscussions(data);

      const totalReplies = data.reduce((sum, d) => sum + (d.replies?.length || 0), 0);
      const activeToday = data.filter(d => {
        const date = new Date(d.createdAt);
        const today = new Date();
        return date.toDateString() === today.toDateString();
      }).length;
      setStats({ total: data.length, active: activeToday, replies: totalReplies });

      data.forEach((_, index) => {
        if (!cardAnims[index]) {
          cardAnims[index] = new Animated.Value(0);
        }
      });

      Animated.stagger(60,
        data.map((_, index) =>
          Animated.spring(cardAnims[index] || new Animated.Value(0), {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ).start();

    } catch (error) {
      console.error('Failed to load discussions:', error);
      setError('Failed to load discussions');
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
      Alert.alert(
        'Sign In Required',
        'Please sign in to start a discussion',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Auth') },
        ]
      );
      return;
    }
    navigation.navigate('CreateDiscussion');
  };

  const toggleSearch = () => {
    const toValue = showSearch ? 0 : 1;
    Animated.spring(searchAnim, {
      toValue,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
    setShowSearch(!showSearch);
    if (showSearch && searchQuery) {
      setSearchQuery('');
      loadDiscussions();
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w`;
    return `${Math.floor(diffInDays / 30)}mo`;
  };

  const getCategoryInfo = (categoryId) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[1];
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <LinearGradient colors={[theme.primary, theme.primaryLight || theme.primary]} style={styles.loadingHeader}>
          <Text style={styles.loadingText}>Loading Discussions...</Text>
        </LinearGradient>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <LinearGradient
        colors={[theme.primary, theme.primaryLight || theme.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />
        <View style={styles.headerDecor3} />

        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={26} color={theme.textOnPrimary} />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.headerTitleWrap,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Text style={[styles.headerTitle, { color: theme.textOnPrimary }]}>Discussions</Text>
            <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
              Connect with fellow learners
            </Text>
          </Animated.View>

          <TouchableOpacity
            style={styles.searchBtn}
            onPress={toggleSearch}
          >
            <Ionicons name={showSearch ? 'close' : 'search'} size={24} color={theme.textOnPrimary} />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.searchBarContainer,
            {
              height: searchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 56],
              }),
              opacity: searchAnim,
              marginTop: searchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 16],
              }),
            }
          ]}
        >
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search discussions..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={loadDiscussions}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.statsRow,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
              style={styles.statCardGradient}
            >
              <Ionicons name="chatbubbles" size={22} color="#FFFFFF" />
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Topics</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
              style={styles.statCardGradient}
            >
              <Ionicons name="flash" size={22} color={theme.warning} />
              <Text style={styles.statValue}>{stats.active}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
              style={styles.statCardGradient}
            >
              <Ionicons name="chatbox" size={22} color={theme.success} />
              <Text style={styles.statValue}>{stats.replies}</Text>
              <Text style={styles.statLabel}>Replies</Text>
            </LinearGradient>
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id || 'all'}
                style={[
                  styles.categoryChip,
                  isActive && { backgroundColor: category.color },
                  !isActive && { backgroundColor: theme.surface }
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={isActive ? '#FFFFFF' : category.color}
                />
                <Text style={[
                  styles.categoryChipText,
                  { color: isActive ? '#FFFFFF' : theme.text }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.sortSection, { backgroundColor: theme.background }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortScroll}
        >
          {SORT_OPTIONS.map((option) => {
            const isActive = selectedSort === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortChip,
                  { backgroundColor: isActive ? theme.primary : 'transparent' }
                ]}
                onPress={() => setSelectedSort(option.id)}
              >
                <Ionicons
                  name={option.icon}
                  size={14}
                  color={isActive ? '#FFFFFF' : theme.textSecondary}
                />
                <Text style={[
                  styles.sortChipText,
                  { color: isActive ? '#FFFFFF' : theme.textSecondary }
                ]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {discussions.length === 0 ? (
          <EmptyState onCreateDiscussion={handleCreateDiscussion} theme={theme} isDarkMode={isDarkMode} />
        ) : (
          discussions.map((discussion, index) => (
            <Animated.View
              key={discussion._id}
              style={{
                opacity: cardAnims[index] || 1,
                transform: [{
                  translateY: (cardAnims[index] || new Animated.Value(1)).interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  })
                }]
              }}
            >
              <DiscussionCard
                discussion={discussion}
                theme={theme}
                isDarkMode={isDarkMode}
                onPress={() => navigation.navigate('DiscussionDetail', { discussionId: discussion._id })}
                formatTimeAgo={formatTimeAgo}
                getCategoryInfo={getCategoryInfo}
              />
            </Animated.View>
          ))
        )}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity
          style={[styles.fab, { shadowColor: theme.secondary }]}
          onPress={handleCreateDiscussion}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[theme.secondary, theme.secondaryLight || theme.secondary]}
            style={styles.fabGradient}
          >
            <Ionicons name="create" size={26} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function EmptyState({ onCreateDiscussion, theme, isDarkMode }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.surface }]}>
        <Ionicons name="chatbubbles-outline" size={60} color={theme.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Start the Conversation</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        No discussions yet in this category.{'\n'}Share your thoughts with the community!
      </Text>
      <TouchableOpacity style={[styles.emptyBtn, { shadowColor: theme.primary }]} onPress={onCreateDiscussion}>
        <LinearGradient
          colors={[theme.primary, theme.primaryLight || theme.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.emptyBtnGradient}
        >
          <Ionicons name="add-circle" size={22} color="#FFFFFF" />
          <Text style={styles.emptyBtnText}>Start Discussion</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function DiscussionCard({ discussion, theme, isDarkMode, onPress, formatTimeAgo, getCategoryInfo }) {
  const author = typeof discussion.author === 'object' ? discussion.author : null;
  const replyCount = discussion.replies?.length || 0;
  const likeCount = discussion.likes?.length || 0;
  const categoryInfo = getCategoryInfo(discussion.category);
  const isHot = likeCount >= 5 || replyCount >= 10;

  return (
    <TouchableOpacity
      style={[
        styles.discussionCard,
        {
          backgroundColor: theme.surface,
          borderLeftColor: categoryInfo.color,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >

      {(discussion.isPinned || isHot) && (
        <View style={styles.badgesRow}>
          {discussion.isPinned && (
            <View style={[styles.pinnedBadge, { backgroundColor: theme.warning + '15' }]}>
              <Ionicons name="pin" size={12} color={theme.warning} />
              <Text style={[styles.badgeText, { color: theme.warning }]}>Pinned</Text>
            </View>
          )}
          {isHot && (
            <View style={[styles.hotBadge, { backgroundColor: theme.error + '15' }]}>
              <Ionicons name="flame" size={12} color={theme.error} />
              <Text style={[styles.badgeText, { color: theme.error }]}>Hot</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '15' }]}>
          <Ionicons name={categoryInfo.icon} size={12} color={categoryInfo.color} />
          <Text style={[styles.categoryBadgeText, { color: categoryInfo.color }]}>
            {categoryInfo.name}
          </Text>
        </View>
        <Text style={[styles.timeAgo, { color: theme.textSecondary }]}>
          {formatTimeAgo(discussion.createdAt)}
        </Text>
      </View>

      <Text style={[styles.discussionTitle, { color: theme.text }]} numberOfLines={2}>
        {discussion.title}
      </Text>
      <Text style={[styles.discussionExcerpt, { color: theme.textSecondary }]} numberOfLines={2}>
        {discussion.content?.replace(/<[^>]*>/g, '').substring(0, 150)}
      </Text>

      {discussion.tags?.length > 0 && (
        <View style={styles.tagsRow}>
          {discussion.tags.slice(0, 3).map((tag, idx) => (
            <View
              key={idx}
              style={[styles.tag, { backgroundColor: theme.background }]}
            >
              <Text style={[styles.tagText, { color: theme.textSecondary }]}>#{tag}</Text>
            </View>
          ))}
          {discussion.tags.length > 3 && (
            <Text style={[styles.moreTags, { color: theme.textSecondary }]}>
              +{discussion.tags.length - 3}
            </Text>
          )}
        </View>
      )}

      <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
        <View style={styles.footerLeft}>
          <View style={[styles.authorAvatar, { backgroundColor: categoryInfo.color + '25' }]}>
            <Text style={[styles.authorInitial, { color: categoryInfo.color }]}>
              {(author?.name || 'A')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: theme.text }]} numberOfLines={1}>
              {author?.name || 'Anonymous'}
            </Text>
            {author?.role === 'instructor' && (
              <View style={[styles.instructorBadge, { backgroundColor: theme.secondary + '20' }]}>
                <Ionicons name="shield-checkmark" size={10} color={theme.secondary} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.footerRight}>
          <View style={styles.footerStat}>
            <Ionicons
              name={likeCount > 0 ? 'heart' : 'heart-outline'}
              size={16}
              color={likeCount > 0 ? theme.error : theme.textSecondary}
            />
            <Text style={[
              styles.footerStatText,
              { color: likeCount > 0 ? theme.error : theme.textSecondary }
            ]}>
              {likeCount}
            </Text>
          </View>
          <View style={styles.footerStat}>
            <Ionicons
              name="chatbubble"
              size={15}
              color={replyCount > 0 ? theme.primary : theme.textSecondary}
            />
            <Text style={[
              styles.footerStatText,
              { color: replyCount > 0 ? theme.primary : theme.textSecondary }
            ]}>
              {replyCount}
            </Text>
          </View>
          <View style={styles.footerStat}>
            <Ionicons name="eye-outline" size={15} color={theme.textSecondary} />
            <Text style={[styles.footerStatText, { color: theme.textSecondary }]}>
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
  loadingHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerDecor3: {
    position: 'absolute',
    top: 70,
    left: 120,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    overflow: 'hidden',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardGradient: {
    alignItems: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  categoriesSection: {
    paddingVertical: 14,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 7,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sortSection: {
    paddingVertical: 10,
  },
  sortScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    marginRight: 8,
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  emptyBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  emptyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 10,
  },
  emptyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  discussionCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  hotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeAgo: {
    fontSize: 12,
    fontWeight: '500',
  },
  discussionTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  discussionExcerpt: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  authorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    fontSize: 15,
    fontWeight: '700',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  instructorBadge: {
    backgroundColor: '#8B5CF620',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  footerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerStatText: {
    fontSize: 13,
    fontWeight: '600',
  },

  fabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 90,
    right: 20,
  },
  fab: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
  },
  fabGradient: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
