import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Animated,
  Image,
  Platform,
  TextInput,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { spacing, fontSize } from '../src/utils/responsive';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { premiumColors, premiumShadows, premiumBorderRadius } from '../src/utils/premiumDesign';
import { blogAPI } from '../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const BLOG_CATEGORIES = [
  { id: 'all', name: 'All Posts', icon: 'apps', color: '#6366F1', gradient: ['#6366F1', '#8B5CF6'] },
  { id: 'written-lessons', name: 'Lessons', icon: 'book', color: '#10B981', gradient: ['#10B981', '#059669'] },
  { id: 'news', name: 'News', icon: 'newspaper', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
  { id: 'tips', name: 'Tips & Tricks', icon: 'bulb', color: '#EC4899', gradient: ['#EC4899', '#DB2777'] },
  { id: 'grammar', name: 'Grammar', icon: 'school', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] },
  { id: 'culture', name: 'Culture', icon: 'earth', color: '#06B6D4', gradient: ['#06B6D4', '#0891B2'] },
];

const SORT_OPTIONS = [
  { id: 'recent', name: 'Recent', icon: 'time' },
  { id: 'popular', name: 'Popular', icon: 'flame' },
  { id: 'trending', name: 'Trending', icon: 'trending-up' },
];

export default function BlogListScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, avgReadTime: 5 });

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    loadSavedPosts();
    loadBlogPosts();
    loadFeaturedPosts();

    Animated.parallel([
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8, delay: 200 }),
    ]).start();

    const orbLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(orb1Anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
          Animated.timing(orb1Anim, { toValue: 0, duration: 3000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(orb2Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
          Animated.timing(orb2Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
        ]),
      ])
    );
    orbLoop.start();

    return () => orbLoop.stop();
  }, []);

  useEffect(() => {
    loadBlogPosts();
  }, [selectedCategory, selectedSort]);

  const loadSavedPosts = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedPosts');
      if (saved) setSavedPosts(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load saved posts:', e);
    }
  };

  const toggleSavePost = async (postId) => {
    try {
      let newSaved;
      if (savedPosts.includes(postId)) {
        newSaved = savedPosts.filter(id => id !== postId);
      } else {
        newSaved = [...savedPosts, postId];
      }
      setSavedPosts(newSaved);
      await AsyncStorage.setItem('savedPosts', JSON.stringify(newSaved));
    } catch (e) {
      console.error('Failed to save post:', e);
    }
  };

  const loadFeaturedPosts = async () => {
    try {
      const response = await blogAPI.getFeatured();
      if (response.data.success) {
        setFeaturedPosts(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load featured posts:', error);
    }
  };

  const loadBlogPosts = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const params = {
        page,
        limit: 10,
        sort: selectedSort,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await blogAPI.getAll(params);

      if (response.data.success) {
        const newPosts = response.data.data || [];
        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        setHasMore(newPosts.length === 10);
        setCurrentPage(page);

        setStats({
          total: response.data.pagination?.total || newPosts.length,
          thisWeek: Math.floor(newPosts.length * 0.3),
          avgReadTime: 5,
        });
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
  }, [selectedCategory, selectedSort, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeaturedPosts();
    loadBlogPosts(1, false);
  }, [loadBlogPosts]);

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

  const toggleSearch = () => {
    const toValue = showSearch ? 0 : 1;
    setShowSearch(!showSearch);
    Animated.spring(searchAnim, { toValue, useNativeDriver: false, tension: 100, friction: 10 }).start();
    if (showSearch) {
      setSearchQuery('');
    }
  };

  const handleSearch = () => {
    loadBlogPosts(1, false);
  };

  const getCategoryConfig = (categoryId) => {
    return BLOG_CATEGORIES.find(c => c.id === categoryId) || BLOG_CATEGORIES[0];
  };

  const getReadingTime = (content) => {
    if (!content) return 3;
    const words = content.split(' ').length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading && posts.length === 0) {
    return <LoadingSpinner message="Loading Lessons & News..." />;
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const searchBarWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [44, width - 40],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={[
        styles.floatingNavBar,
        {
          backgroundColor: isDarkMode ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
          opacity: headerOpacity,
          borderBottomColor: isDarkMode ? '#1F2937' : '#E5E7EB',
        }
      ]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBackBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text }]}>Lessons & News</Text>
        <TouchableOpacity onPress={toggleSearch} style={styles.navSearchBtn}>
          <Ionicons name="search" size={22} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >

        <LinearGradient
          colors={isDarkMode ? ['#1E1B4B', '#312E81', '#3730A3'] : ['#4F46E5', '#6366F1', '#818CF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >

          <Animated.View style={[
            styles.floatingOrb,
            styles.orb1,
            {
              transform: [
                { translateY: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -15] }) },
                { scale: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) },
              ],
            },
          ]} />
          <Animated.View style={[
            styles.floatingOrb,
            styles.orb2,
            {
              transform: [
                { translateY: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) },
                { scale: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] }) },
              ],
            },
          ]} />
          <View style={[styles.floatingOrb, styles.orb3]} />

          <Animated.View style={[
            styles.headerContent,
            {
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Home</Text>
            </TouchableOpacity>

            <View style={styles.headerBadge}>
              <Ionicons name="library" size={12} color="#FFFFFF" />
              <Text style={styles.headerBadgeText}>LEARNING HUB</Text>
            </View>

            <Text style={styles.headerTitle}>Lessons & News</Text>
            <Text style={styles.headerSubtitle}>
              Master French with curated lessons, tips, and cultural insights
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Articles</Text>
              </View>
              <View style={[styles.statCard, styles.statCardMiddle]}>
                <View style={styles.statLive}>
                  <View style={styles.liveDot} />
                  <Text style={styles.statLiveText}>NEW</Text>
                </View>
                <Text style={styles.statValue}>{stats.thisWeek}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.avgReadTime}m</Text>
                <Text style={styles.statLabel}>Avg Read</Text>
              </View>
            </View>

            <Animated.View style={[
              styles.searchContainer,
              {
                width: searchBarWidth,
                backgroundColor: showSearch ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)',
              },
            ]}>
              <TouchableOpacity onPress={toggleSearch} style={styles.searchIconBtn}>
                <Ionicons name={showSearch ? "close" : "search"} size={20} color="#FFFFFF" />
              </TouchableOpacity>
              {showSearch && (
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search articles..."
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  autoFocus
                />
              )}
            </Animated.View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {BLOG_CATEGORIES.map((cat, index) => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: isActive ? cat.color : isDarkMode ? '#1F2937' : '#F3F4F6',
                      borderColor: isActive ? cat.color : isDarkMode ? '#374151' : '#E5E7EB',
                    },
                    isActive && premiumShadows.sm,
                  ]}
                  onPress={() => handleCategoryPress(cat.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={cat.icon}
                    size={16}
                    color={isActive ? '#FFFFFF' : cat.color}
                  />
                  <Text style={[
                    styles.categoryPillText,
                    { color: isActive ? '#FFFFFF' : colors.text },
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.sortSection}>
          <Text style={[styles.sortLabel, { color: colors.secondaryText }]}>Sort by:</Text>
          <View style={styles.sortOptions}>
            {SORT_OPTIONS.map((option) => {
              const isActive = selectedSort === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.sortChip,
                    {
                      backgroundColor: isActive
                        ? isDarkMode ? '#6366F1' : '#EEF2FF'
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedSort(option.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={option.icon}
                    size={14}
                    color={isActive ? (isDarkMode ? '#FFFFFF' : '#6366F1') : colors.secondaryText}
                  />
                  <Text style={[
                    styles.sortChipText,
                    { color: isActive ? (isDarkMode ? '#FFFFFF' : '#6366F1') : colors.secondaryText },
                  ]}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {featuredPosts.length > 0 && selectedCategory === 'all' && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#F59E0B20' }]}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Stories</Text>
              </View>
              <View style={[styles.countBadge, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
                <Text style={[styles.countBadgeText, { color: colors.secondaryText }]}>
                  {featuredPosts.length} highlights
                </Text>
              </View>
            </View>
            <FlatList
              horizontal
              data={featuredPosts}
              renderItem={({ item, index }) => (
                <FeaturedCard
                  item={item}
                  index={index}
                  onPress={() => navigation.navigate('BlogDetail', { postId: item._id || item.id, post: item })}
                  onSave={() => toggleSavePost(item._id || item.id)}
                  isSaved={savedPosts.includes(item._id || item.id)}
                  colors={colors}
                  isDarkMode={isDarkMode}
                  getReadingTime={getReadingTime}
                />
              )}
              keyExtractor={(item) => item._id || item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
              snapToInterval={width * 0.85 + 16}
              decelerationRate="fast"
            />
          </View>
        )}

        <View style={styles.articlesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: getCategoryConfig(selectedCategory).color + '20' }]}>
                <Ionicons name={getCategoryConfig(selectedCategory).icon} size={16} color={getCategoryConfig(selectedCategory).color} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedCategory === 'all' ? 'Latest Articles' : getCategoryConfig(selectedCategory).name}
              </Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
              <Text style={[styles.countBadgeText, { color: colors.secondaryText }]}>
                {posts.length} articles
              </Text>
            </View>
          </View>

          {error && posts.length === 0 ? (
            <View style={styles.errorState}>
              <LinearGradient
                colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#FEF2F2', '#FEE2E2']}
                style={styles.errorCard}
              >
                <View style={styles.errorIconContainer}>
                  <Ionicons name="cloud-offline" size={48} color="#EF4444" />
                </View>
                <Text style={[styles.errorTitle, { color: colors.text }]}>Connection Error</Text>
                <Text style={[styles.errorMessage, { color: colors.secondaryText }]}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => loadBlogPosts(1, false)}
                >
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.retryButtonGradient}
                  >
                    <Ionicons name="refresh" size={18} color="#FFFFFF" />
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : posts.length > 0 ? (
            <View style={styles.articlesList}>
              {posts.map((post, index) => (
                <Animated.View
                  key={post._id || post.id || index}
                  style={{
                    opacity: cardsAnim,
                    transform: [{
                      translateY: cardsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30 * (index % 5), 0]
                      })
                    }],
                  }}
                >
                  <ArticleCard
                    post={post}
                    index={index}
                    onPress={() => navigation.navigate('BlogDetail', { postId: post._id || post.id, post })}
                    onSave={() => toggleSavePost(post._id || post.id)}
                    isSaved={savedPosts.includes(post._id || post.id)}
                    colors={colors}
                    isDarkMode={isDarkMode}
                    getCategoryConfig={getCategoryConfig}
                    getReadingTime={getReadingTime}
                    formatDate={formatDate}
                  />
                </Animated.View>
              ))}

              {hasMore && !loadingMore && (
                <TouchableOpacity
                  style={[styles.loadMoreBtn, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}
                  onPress={handleLoadMore}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle" size={20} color="#6366F1" />
                  <Text style={[styles.loadMoreText, { color: '#6366F1' }]}>Load More Articles</Text>
                </TouchableOpacity>
              )}

              {loadingMore && (
                <View style={styles.loadingMore}>
                  <ActivityIndicator color="#6366F1" size="small" />
                  <Text style={[styles.loadingMoreText, { color: colors.secondaryText }]}>Loading...</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#EEF2FF', '#E0E7FF']}
                style={styles.emptyCard}
              >
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="document-text-outline" size={56} color="#6366F1" />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Articles Found</Text>
                <Text style={[styles.emptyMessage, { color: colors.secondaryText }]}>
                  {searchQuery
                    ? `No results for "${searchQuery}". Try different keywords.`
                    : "We're preparing fresh content. Check back soon!"
                  }
                </Text>
                {searchQuery && (
                  <TouchableOpacity
                    style={styles.clearSearchBtn}
                    onPress={() => { setSearchQuery(''); loadBlogPosts(1, false); }}
                  >
                    <Text style={styles.clearSearchText}>Clear Search</Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </View>
  );
}

const FeaturedCard = ({ item, index, onPress, onSave, isSaved, colors, isDarkMode, getReadingTime }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[styles.featuredCardContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.featuredCard, premiumShadows.lg]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Image
          source={item.image ? { uri: item.image } : require('../assets/logo.png')}
          style={styles.featuredImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
          style={styles.featuredOverlay}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={onSave}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[styles.saveButtonInner, isSaved && styles.saveButtonActive]}>
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={18}
              color={isSaved ? "#6366F1" : "#FFFFFF"}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.featuredContent}>

          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={10} color="#FFFFFF" />
            <Text style={styles.featuredBadgeText}>FEATURED</Text>
          </View>

          <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>

          <View style={styles.featuredMeta}>
            <View style={styles.featuredAuthor}>
              <View style={styles.authorAvatar}>
                <Ionicons name="person" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.authorName} numberOfLines={1}>
                {item.author?.name || "L'Alliance"}
              </Text>
            </View>
            <View style={styles.readTimeTag}>
              <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.readTimeText}>{getReadingTime(item.content)} min read</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ArticleCard = ({ post, index, onPress, onSave, isSaved, colors, isDarkMode, getCategoryConfig, getReadingTime, formatDate }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const categoryConfig = getCategoryConfig(post.category);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[styles.articleCardContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.articleCard,
          {
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            borderColor: isDarkMode ? '#374151' : '#E5E7EB',
          },
          premiumShadows.md,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >

        <View style={[styles.articleAccent, { backgroundColor: categoryConfig.color }]} />

        <View style={styles.articleImageContainer}>
          <Image
            source={post.image ? { uri: post.image } : require('../assets/logo.png')}
            style={styles.articleImage}
          />

          <View style={styles.readingTimeBadge}>
            <Ionicons name="time" size={10} color="#FFFFFF" />
            <Text style={styles.readingTimeText}>{getReadingTime(post.content)}m</Text>
          </View>
        </View>

        <View style={styles.articleContent}>

          <View style={[styles.categoryBadge, { backgroundColor: categoryConfig.color + '15' }]}>
            <Ionicons name={categoryConfig.icon} size={10} color={categoryConfig.color} />
            <Text style={[styles.categoryBadgeText, { color: categoryConfig.color }]}>
              {categoryConfig.name}
            </Text>
          </View>

          <Text style={[styles.articleTitle, { color: colors.text }]} numberOfLines={2}>
            {post.title}
          </Text>

          {post.excerpt && (
            <Text style={[styles.articleExcerpt, { color: colors.secondaryText }]} numberOfLines={2}>
              {post.excerpt}
            </Text>
          )}

          <View style={styles.articleFooter}>
            <View style={styles.articleAuthor}>
              <View style={[styles.articleAuthorAvatar, { backgroundColor: categoryConfig.color }]}>
                <Text style={styles.articleAuthorInitial}>
                  {(post.author?.name || 'F')[0].toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={[styles.articleAuthorName, { color: colors.text }]} numberOfLines={1}>
                  {post.author?.name || "L'Alliance"}
                </Text>
                <Text style={[styles.articleDate, { color: colors.secondaryText }]}>
                  {formatDate(post.createdAt)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.articleSaveBtn,
                { backgroundColor: isSaved ? '#6366F120' : isDarkMode ? '#374151' : '#F3F4F6' },
              ]}
              onPress={onSave}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={16}
                color={isSaved ? "#6366F1" : colors.secondaryText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  navBackBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  navSearchBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.3,
  },
  orb1: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255,255,255,0.15)',
    top: -30,
    right: -40,
  },
  orb2: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    bottom: 20,
    left: -30,
  },
  orb3: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: '50%',
    right: 60,
  },
  headerContent: {
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 17,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 12,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statCardMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statLiveText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  searchContainer: {
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  searchIconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#FFFFFF',
    fontSize: 16,
    paddingRight: 16,
  },
  categorySection: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sortSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  featuredSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  featuredList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredCardContainer: {
    width: width * 0.85,
  },
  featuredCard: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  saveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  saveButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 10,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
    maxWidth: 120,
  },
  readTimeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  readTimeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  articlesSection: {
    paddingTop: 8,
  },
  articlesList: {
    paddingHorizontal: 20,
  },
  articleCardContainer: {
    marginBottom: 16,
  },
  articleCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  articleAccent: {
    width: 4,
  },
  articleImageContainer: {
    width: 100,
    height: 120,
    position: 'relative',
  },
  articleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  readingTimeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  readingTimeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  articleContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 6,
  },
  articleExcerpt: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  articleAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  articleAuthorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleAuthorInitial: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  articleAuthorName: {
    fontSize: 12,
    fontWeight: '600',
  },
  articleDate: {
    fontSize: 10,
    marginTop: 1,
  },
  articleSaveBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: '600',
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorState: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  errorCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99,102,241,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  clearSearchBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderRadius: 10,
  },
  clearSearchText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
});
