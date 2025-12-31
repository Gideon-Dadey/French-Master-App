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
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { blogAPI, studyGroupsAPI } from '../src/services/api';
import { getThemeColors, themeShadows, themeRadius } from '../src/utils/organicTheme';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

const BackgroundBlur = ({ style, color, size = 300 }) => (
  <View style={[style, {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    opacity: 0.05,
    transform: [{ scale: 1.5 }],
  }]} />
);

export default function CommunityScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode, organicColors: theme } = useTheme();
  const gamification = useGamification();
  const gamificationStats = gamification?.stats || {};

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([...Array(10)].map(() => new Animated.Value(0))).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  const hubItems = [
    { id: 'leaderboard', title: 'Leaderboard', subtitle: 'Top learners', icon: 'trophy-outline', color: theme.primary, action: () => navigation.navigate('Leaderboard') },
    { id: 'groups', title: 'Groups', subtitle: 'Learn together', icon: 'people-outline', color: theme.secondary, action: () => navigation.navigate('StudyGroups') },
    { id: 'discussions', title: 'Forums', subtitle: 'Join the talk', icon: 'chatbubbles-outline', color: theme.success, action: () => navigation.navigate('Discussions') },
    { id: 'qa', title: 'Q&A', subtitle: 'Get answers', icon: 'help-circle-outline', color: theme.accent, action: () => navigation.navigate('QandAForum') },
  ];

  useEffect(() => {
    loadData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.stagger(80, cardAnims.map(anim =>
      Animated.spring(anim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true })
    )).start();
  };

  const loadData = async () => {
    try {
      if (!refreshing) setLoading(true);
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

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <BackgroundBlur style={{ top: -100, right: -50 }} color={theme.info} size={400} />
      <BackgroundBlur style={{ bottom: 100, left: -100 }} color={theme.success} size={350} />

      {/* Floating Navigation Bar */}
      <Animated.View
        style={[
          styles.floatingNavBar,
          {
            backgroundColor: theme.surface + 'F8',
            opacity: headerOpacity,
            borderBottomColor: theme.border,
          }
        ]}
      >
        <View style={styles.navBarContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: theme.text }]}>Learning Hub</Text>
          <TouchableOpacity onPress={toggleSearch}>
            <Ionicons name="search" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroBadge, { color: theme.info }]}>COMMUNITY</Text>
              <Text style={[styles.heroTitle, { color: theme.text }]}>Learning Hub</Text>
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>Connect and grow with fellow learners</Text>
            </View>
            <TouchableOpacity
              style={[styles.searchToggle, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}
              onPress={toggleSearch}
            >
              <Ionicons name="search" size={20} color={theme.info} />
            </TouchableOpacity>
          </View>

          {showSearch && (
            <Animated.View style={[
              styles.searchBar,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                opacity: searchAnim,
                transform: [{ scale: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }]
              }
            ]}>
              <Ionicons name="search-outline" size={20} color={theme.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search community..."
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* Live Stats */}
        <Animated.View style={[styles.statsRow, { opacity: cardAnims[0], transform: [{ translateY: cardAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
            <View style={styles.liveIndicator}>
              <View style={[styles.liveDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.liveText, { color: theme.success }]}>342 ONLINE</Text>
            </View>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Now</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
            <Text style={[styles.statValue, { color: theme.text }]}>12.5K</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Hub Members</Text>
          </View>
        </Animated.View>

        {/* Hub Navigation Grid */}
        <Animated.View style={[styles.section, { opacity: cardAnims[1], transform: [{ translateY: cardAnims[1].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleAccent, { backgroundColor: theme.info }]} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Explore Hub</Text>
          </View>
          <View style={styles.hubGrid}>
            {hubItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.hubCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}
                onPress={item.action}
              >
                <View style={[styles.hubIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={[styles.hubTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.hubSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
                <View style={styles.hubArrow}>
                  <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Study Groups Preview */}
        <Animated.View style={[styles.section, { opacity: cardAnims[2], transform: [{ translateY: cardAnims[2].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.titleAccent, { backgroundColor: theme.secondary }]} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Study Groups</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('StudyGroups')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.groupsScroll}
          >
            {studyGroups.map((group, idx) => (
              <PremiumGroupCard key={idx} group={group} theme={theme} navigation={navigation} />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Community Highlights */}
        <Animated.View style={[styles.section, { opacity: cardAnims[3], transform: [{ translateY: cardAnims[3].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleAccent, { backgroundColor: theme.success }]} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Social Records</Text>
          </View>
          <View style={styles.highlightsGrid}>
            <View style={[styles.highlightItem, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
              <View style={[styles.highlightIcon, { backgroundColor: theme.secondary + '15' }]}>
                <Ionicons name="flame" size={20} color={theme.secondary} />
              </View>
              <View>
                <Text style={[styles.highlightVal, { color: theme.text }]}>{gamificationStats.streak || 0} Days</Text>
                <Text style={[styles.highlightLab, { color: theme.textSecondary }]}>Social Streak</Text>
              </View>
            </View>
            <View style={[styles.highlightItem, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
              <View style={[styles.highlightIcon, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="trophy" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.highlightVal, { color: theme.text }]}>#{gamificationStats.rank || '50+'}</Text>
                <Text style={[styles.highlightLab, { color: theme.textSecondary }]}>Global Rank</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Join Banner */}
        <Animated.View style={[styles.section, { opacity: cardAnims[4], transform: [{ translateY: cardAnims[4].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <TouchableOpacity
            style={[styles.banner, themeShadows.lg]}
            onPress={() => navigation.navigate('StudyGroups')}
          >
            <LinearGradient
              colors={[theme.info, theme.info + 'E6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerGradient}
            >
              <View style={styles.bannerContent}>
                <View style={styles.bannerIconWrap}>
                  <Ionicons name="rocket" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.bannerTextWrap}>
                  <Text style={styles.bannerTitle}>Start a Movement</Text>
                  <Text style={styles.bannerSubtitle}>Create your own study group now</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
}

function PremiumGroupCard({ group, theme, navigation }) {
  return (
    <TouchableOpacity
      style={[styles.groupCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}
      onPress={() => navigation.navigate('StudyGroupDetail', { groupId: group._id })}
    >
      <View style={styles.groupHeader}>
        <View style={[styles.groupType, { backgroundColor: theme.secondary + '15' }]}>
          <Text style={[styles.groupTypeText, { color: theme.secondary }]}>ACTIVE</Text>
        </View>
        <View style={styles.groupMembers}>
          <Ionicons name="people" size={14} color={theme.textMuted} />
          <Text style={[styles.memberCount, { color: theme.textSecondary }]}>{group.members?.length || 0}</Text>
        </View>
      </View>
      <Text style={[styles.groupTitle, { color: theme.text }]} numberOfLines={1}>{group.name}</Text>
      <Text style={[styles.groupDesc, { color: theme.textSecondary }]} numberOfLines={2}>{group.description}</Text>

      <View style={[styles.groupFooter, { borderTopColor: theme.border }]}>
        <View style={styles.levelBadge}>
          <Text style={[styles.levelText, { color: theme.primary }]}>{group.level || 'All'}</Text>
        </View>
        <TouchableOpacity style={[styles.joinBtn, { backgroundColor: theme.primary }]}>
          <Text style={[styles.joinText, { color: theme.textOnPrimary || '#FFFFFF' }]}>Enter</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

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
    borderBottomWidth: 1,
  },
  navBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 50,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 22,
  },
  hero: {
    marginTop: 20,
    marginBottom: 24,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  searchToggle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  titleAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hubCard: {
    width: (width - 56) / 2,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    position: 'relative',
  },
  hubIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  hubTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  hubSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  hubArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  groupsScroll: {
    paddingRight: 22,
    gap: 16,
  },
  groupCard: {
    width: width * 0.65,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupType: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  groupTypeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  groupMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  groupDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
    height: 36,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  levelBadge: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  joinBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  joinText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  highlightsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  highlightItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  highlightLab: {
    fontSize: 11,
    fontWeight: '600',
  },
  banner: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bannerIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
  },
});
