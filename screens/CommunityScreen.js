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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { blogAPI, studyGroupsAPI } from '../src/services/api';
import { getThemeColors, themeShadows, themeRadius } from '../src/utils/organicTheme';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

export default function CommunityScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const gamificationContext = useGamification();
  const gamificationStats = gamificationContext?.stats || {};
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  const hubItems = [
    {
      id: 'study-groups',
      title: 'Study Groups',
      subtitle: 'Learn together',
      icon: 'people',
      gradient: [theme.primary, theme.primaryLight || theme.primary],
      badge: studyGroups.length > 0 ? `${studyGroups.length} active` : null,
      onPress: () => navigation.navigate('StudyGroups'),
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      subtitle: 'Top learners',
      icon: 'trophy',
      gradient: [theme.secondary, theme.secondaryLight || theme.secondary],
      badge: 'Live',
      onPress: () => navigation.navigate('Leaderboard'),
    },
    {
      id: 'discussions',
      title: 'Discussions',
      subtitle: 'Join conversations',
      icon: 'chatbubbles',
      gradient: [theme.success, theme.success + 'CC'],
      badge: recentPosts.length > 0 ? `${recentPosts.length} new` : null,
      onPress: () => navigation.navigate('Discussions'),
    },
    {
      id: 'qa-forum',
      title: 'Q&A Forum',
      subtitle: 'Get answers',
      icon: 'help-circle',
      gradient: [theme.accent, theme.accent + 'CC'],
      badge: null,
      onPress: () => navigation.navigate('QandAForum'),
    },
  ];

  const quickActions = [
    { icon: 'add-circle', label: 'New Post', color: theme.primary, onPress: () => navigation.navigate('CreatePost') },
    { icon: 'people-circle', label: 'Find Group', color: theme.success, onPress: () => navigation.navigate('StudyGroups') },
    { icon: 'star', label: 'Achievements', color: theme.secondary, onPress: () => navigation.navigate('Achievements') },
    { icon: 'share-social', label: 'Invite', color: theme.accent, onPress: () => {} },
  ];

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

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
          colors={theme.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerDecor}>
            <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
            <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerTitleSection}>
                <Text style={[styles.headerBadgeText, { color: theme.secondary }]}>COMMUNITY</Text>
                <Text style={styles.headerTitle}>Learning Hub</Text>
                <Text style={styles.headerSubtitle}>Connect • Learn • Grow</Text>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={[styles.headerActionBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                  onPress={toggleSearch}
                >
                  <Ionicons name="search" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.headerActionBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                  onPress={() => navigation.navigate('Notifications')}
                >
                  <Ionicons name="notifications" size={22} color="#FFFFFF" />
                  <View style={[styles.notificationDot, { backgroundColor: theme.error }]} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.liveStatsRow}>
              <View style={[styles.liveStatCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={styles.liveIndicator}>
                  <View style={[styles.liveDot, { backgroundColor: theme.success }]} />
                  <Text style={[styles.liveText, { color: theme.success }]}>LIVE</Text>
                </View>
                <Text style={styles.liveStatValue}>{communityStats.activeNow}</Text>
                <Text style={styles.liveStatLabel}>Online Now</Text>
              </View>
              <View style={[styles.liveStatCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Ionicons name="people" size={18} color="#FFFFFF" />
                <Text style={styles.liveStatValue}>{(communityStats.totalMembers / 1000).toFixed(1)}K</Text>
                <Text style={styles.liveStatLabel}>Members</Text>
              </View>
              <View style={[styles.liveStatCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Ionicons name="chatbubbles" size={18} color="#FFFFFF" />
                <Text style={styles.liveStatValue}>{(communityStats.discussions / 1000).toFixed(1)}K</Text>
                <Text style={styles.liveStatLabel}>Posts</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {showSearch && (
        <Animated.View
          style={[
            styles.searchOverlay,
            { backgroundColor: theme.background },
            {
              opacity: searchAnim,
              transform: [{ translateY: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
            },
          ]}
        >
          <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search community..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setSearchQuery(''); toggleSearch(); }}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        showsVerticalScrollIndicator={false}
      >

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
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Explore</Text>
          </View>

          <View style={styles.hubGrid}>
            {hubItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.hubCard, { backgroundColor: theme.surface }, themeShadows.lg]}
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
                  <Text style={[styles.hubCardTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.hubCardSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
                </View>
                {item.badge && (
                  <View style={[styles.hubCardBadge, { backgroundColor: item.gradient[0] + '20' }]}>
                    <Text style={[styles.hubCardBadgeText, { color: item.gradient[0] }]}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} style={styles.hubCardArrow} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScroll}
          >
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={[styles.quickActionLabel, { color: theme.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {studyGroups.length > 0 && (
          <View style={styles.studyGroupsSection}>
            <LinearGradient
              colors={isDarkMode ? [theme.surface, theme.background] : [theme.surfaceAlt, theme.background]}
              style={styles.studyGroupsContainer}
            >
              <View style={styles.studyGroupsHeader}>
                <View style={styles.studyGroupsTitleRow}>
                  <View>
                    <Text style={[styles.studyGroupsTitle, { color: theme.text }]}>Active Study Groups</Text>
                    <Text style={[styles.studyGroupsSubtitle, { color: theme.textSecondary }]}>
                      {studyGroups.length} groups learning now
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.seeAllBtn, { backgroundColor: theme.primary + '15' }]}
                  onPress={() => navigation.navigate('StudyGroups')}
                >
                  <Text style={[styles.seeAllBtnText, { color: theme.primary }]}>See All</Text>
                  <Ionicons name="arrow-forward" size={14} color={theme.primary} />
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
                    theme={theme}
                    isDarkMode={isDarkMode}
                    onPress={() => navigation.navigate('StudyGroupDetail', { groupId: group._id, initialTab: 'discussions' })}
                    index={index}
                  />
                ))}
              </ScrollView>
            </LinearGradient>
          </View>
        )}

        <View style={styles.highlightsSection}>
          <View style={styles.highlightsSectionHeader}>
            <View style={styles.highlightsTitleRow}>
              <View>
                <Text style={[styles.highlightsSectionTitle, { color: theme.text }]}>
                  Community Highlights
                </Text>
                <Text style={[styles.highlightsSectionSubtitle, { color: theme.textSecondary }]}>
                  Track your progress & achievements
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.highlightsGrid}>
            <HighlightCard
              icon="flame"
              title="Daily Streak"
              value={gamificationStats.streak || 0}
              suffix="days"
              subtitle="Keep the fire burning!"
              gradient={[theme.secondary, theme.secondaryLight || theme.secondary]}
              theme={theme}
              isDarkMode={isDarkMode}
              onPress={() => navigation.navigate('Practice')}
              progress={Math.min((gamificationStats.streak || 0) / 30, 1)}
              target="30 day goal"
            />
            <HighlightCard
              icon="trophy"
              title="Leaderboard"
              value="#"
              suffix={gamificationStats.rank || '50+'}
              subtitle="Climb the ranks!"
              gradient={[theme.primary, theme.primaryLight || theme.primary]}
              theme={theme}
              isDarkMode={isDarkMode}
              onPress={() => navigation.navigate('Leaderboard')}
              badge="View Rankings"
            />
            <HighlightCard
              icon="star"
              title="Total XP"
              value={gamificationStats.xp >= 1000 ? `${(gamificationStats.xp / 1000).toFixed(1)}K` : (gamificationStats.xp || 0)}
              suffix="XP"
              subtitle="Experience earned"
              gradient={[theme.info, theme.info + 'CC']}
              theme={theme}
              isDarkMode={isDarkMode}
              onPress={() => navigation.navigate('Profile')}
              progress={((gamificationStats.xp || 0) % 1000) / 1000}
              target="Next level"
            />
            <HighlightCard
              icon="ribbon"
              title="Achievements"
              value={gamificationStats.achievements?.length || 0}
              suffix="badges"
              subtitle="Unlock them all!"
              gradient={[theme.success, theme.success + 'CC']}
              theme={theme}
              isDarkMode={isDarkMode}
              onPress={() => navigation.navigate('Achievements')}
              badge="View All"
            />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.joinBanner, themeShadows.lg]}
            onPress={() => navigation.navigate('StudyGroups')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryLight || theme.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.joinBannerGradient}
            >
              <View style={styles.joinBannerContent}>
                <View style={styles.joinBannerIcon}>
                  <Ionicons name="rocket" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.joinBannerText}>
                  <Text style={styles.joinBannerTitle}>Start Your Journey</Text>
                  <Text style={styles.joinBannerSubtitle}>Create or join a study group today</Text>
                </View>
              </View>
              <View style={styles.joinBannerArrow}>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function StudyGroupCard({ group, theme, isDarkMode, onPress, index }) {
  const memberCount = group.members?.length || 0;
  const maxMembers = group.maxMembers || 20;
  const fillPercentage = Math.min((memberCount / maxMembers) * 100, 100);

  const levelConfig = {
    beginner: { color: theme.success, icon: 'leaf', gradient: [theme.success, theme.success + 'CC'] },
    intermediate: { color: theme.secondary, icon: 'flame', gradient: [theme.secondary, theme.secondaryLight || theme.secondary] },
    advanced: { color: theme.error, icon: 'diamond', gradient: [theme.error, theme.error + 'CC'] },
    all: { color: theme.primary, icon: 'apps', gradient: [theme.primary, theme.primaryLight || theme.primary] },
  };

  const level = group.level?.toLowerCase() || 'all';
  const levelStyle = levelConfig[level] || levelConfig.all;

  const cardGradients = [
    [theme.primary, theme.primaryLight || theme.primary],
    [theme.secondary, theme.secondaryLight || theme.secondary],
    [theme.accent, theme.accent + 'CC'],
    [theme.info, theme.info + 'CC'],
  ];
  const cardGradient = cardGradients[index % cardGradients.length];

  return (
    <TouchableOpacity
      style={[styles.groupCard, { backgroundColor: theme.surface }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.groupCardBanner}
      >
        <View style={[styles.groupCardDecor, styles.groupCardDecor1]} />
        <View style={[styles.groupCardDecor, styles.groupCardDecor2]} />

        <View style={[styles.groupCardLiveBadge, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <View style={[styles.groupCardLiveDot, { backgroundColor: theme.success }]} />
          <Text style={[styles.groupCardLiveText, { color: theme.success }]}>LIVE</Text>
        </View>

        <View style={[styles.groupCardIconContainer, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          {group.image ? (
            <Image source={{ uri: group.image }} style={styles.groupCardImage} />
          ) : (
            <Ionicons name="people" size={28} color={cardGradient[0]} />
          )}
        </View>

        <View style={[styles.groupCardLevelBadge, { backgroundColor: levelStyle.color }]}>
          <Ionicons name={levelStyle.icon} size={10} color="#FFFFFF" />
          <Text style={styles.groupCardLevelText}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
        </View>
      </LinearGradient>

      <View style={styles.groupCardBody}>
        <Text style={[styles.groupCardTitle, { color: theme.text }]} numberOfLines={1}>
          {group.name}
        </Text>
        <Text style={[styles.groupCardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
          {group.description || 'Join this study group to learn French together!'}
        </Text>

        <View style={styles.groupCardProgress}>
          <View style={styles.groupCardProgressHeader}>
            <View style={styles.groupCardMembersRow}>
              <View style={styles.groupCardAvatars}>
                {(group.members?.slice(0, 3) || []).map((member, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.groupCardAvatar,
                      {
                        marginLeft: idx > 0 ? -8 : 0,
                        backgroundColor: cardGradient[0] + '30',
                        borderColor: theme.surface,
                        zIndex: 3 - idx
                      }
                    ]}
                  >
                    <Text style={[styles.groupCardAvatarText, { color: cardGradient[0] }]}>
                      {member.user?.name?.charAt(0) || 'U'}
                    </Text>
                  </View>
                ))}
                {memberCount > 3 && (
                  <View style={[styles.groupCardAvatar, styles.groupCardAvatarMore, { marginLeft: -8, backgroundColor: theme.primary }]}>
                    <Text style={styles.groupCardAvatarMoreText}>+{memberCount - 3}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.groupCardMemberCount, { color: theme.textSecondary }]}>
                {memberCount}/{maxMembers}
              </Text>
            </View>
          </View>

          <View style={[styles.groupCardProgressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.groupCardProgressFill,
                {
                  width: `${fillPercentage}%`,
                  backgroundColor: fillPercentage > 80 ? theme.error : cardGradient[0]
                }
              ]}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.groupCardJoinBtn} onPress={onPress}>
          <LinearGradient
            colors={cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.groupCardJoinGradient}
          >
            <Text style={styles.groupCardJoinText}>Enter Group</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function HighlightCard({ icon, title, value, suffix, subtitle, gradient, theme, isDarkMode, onPress, progress, target, badge }) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.highlightCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.highlightAccent, { backgroundColor: gradient[0] + '10' }]} />

        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.highlightIconContainer}
        >
          <Ionicons name={icon} size={22} color="#FFFFFF" />
        </LinearGradient>

        <View style={styles.highlightValueRow}>
          <Text style={[styles.highlightValue, { color: gradient[0] }]}>
            {value}
          </Text>
          {suffix && (
            <Text style={[styles.highlightSuffix, { color: theme.textSecondary }]}>
              {suffix}
            </Text>
          )}
        </View>

        <Text style={[styles.highlightTitle, { color: theme.text }]}>{title}</Text>

        {progress !== undefined && (
          <View style={styles.highlightProgressContainer}>
            <View style={[styles.highlightProgressBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.highlightProgressFill,
                  { width: `${progress * 100}%`, backgroundColor: gradient[0] }
                ]}
              />
            </View>
            <Text style={[styles.highlightProgressText, { color: theme.textSecondary }]}>
              {target}
            </Text>
          </View>
        )}

        {badge && (
          <View style={[styles.highlightBadge, { backgroundColor: gradient[0] + '15' }]}>
            <Text style={[styles.highlightBadgeText, { color: gradient[0] }]}>{badge}</Text>
            <Ionicons name="chevron-forward" size={12} color={gradient[0]} />
          </View>
        )}

        <Text style={[styles.highlightSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>

        <View style={[styles.highlightArrow, { backgroundColor: gradient[0] + '15' }]}>
          <Ionicons name="arrow-forward" size={14} color={gradient[0]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
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
    marginBottom: 18,
  },
  headerTitleSection: {
    flex: 1,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
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
  },
  liveStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  liveStatCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
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
  },
  liveText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  liveStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  liveStatLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  searchOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  hubSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hubGrid: {
    gap: 10,
  },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    gap: 14,
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
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  hubCardSubtitle: {
    fontSize: 13,
  },
  hubCardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hubCardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  hubCardArrow: {
    marginLeft: 4,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsScroll: {
    paddingTop: 10,
    gap: 10,
  },
  quickActionBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 10,
    minWidth: 90,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  studyGroupsSection: {
    marginBottom: 24,
    marginHorizontal: -20,
  },
  studyGroupsContainer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  studyGroupsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  studyGroupsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studyGroupsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  studyGroupsSubtitle: {
    fontSize: 12,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  seeAllBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  groupsScroll: {
    paddingRight: 20,
  },
  groupCard: {
    width: width * 0.72,
    borderRadius: 20,
    marginRight: 14,
    overflow: 'hidden',
    ...themeShadows.lg,
  },
  groupCardBanner: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  groupCardDecor: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  groupCardDecor1: {
    width: 100,
    height: 100,
    top: -30,
    right: -20,
  },
  groupCardDecor2: {
    width: 60,
    height: 60,
    bottom: -20,
    left: 20,
  },
  groupCardLiveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  groupCardLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  groupCardLiveText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  groupCardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  groupCardImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  groupCardLevelBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  groupCardLevelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  groupCardBody: {
    padding: 16,
  },
  groupCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  groupCardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
    opacity: 0.8,
  },
  groupCardProgress: {
    marginBottom: 14,
  },
  groupCardProgressHeader: {
    marginBottom: 8,
  },
  groupCardMembersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupCardAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupCardAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupCardAvatarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  groupCardAvatarMore: {
    borderColor: '#FFFFFF',
  },
  groupCardAvatarMoreText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  groupCardMemberCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  groupCardProgressBar: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  groupCardProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  groupCardJoinBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  groupCardJoinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  groupCardJoinText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  highlightsSection: {
    marginBottom: 24,
  },
  highlightsSectionHeader: {
    marginBottom: 18,
  },
  highlightsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  highlightsSectionSubtitle: {
    fontSize: 12,
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  highlightCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    ...themeShadows.sm,
  },
  highlightAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    transform: [{ translateX: 30 }, { translateY: -30 }],
  },
  highlightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -1,
  },
  highlightSuffix: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  highlightProgressContainer: {
    marginBottom: 8,
  },
  highlightProgressBar: {
    height: 5,
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  highlightProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  highlightProgressText: {
    fontSize: 10,
    fontWeight: '600',
  },
  highlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 8,
    gap: 4,
  },
  highlightBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  highlightSubtitle: {
    fontSize: 11,
    lineHeight: 15,
  },
  highlightArrow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBanner: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  joinBannerGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  joinBannerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBannerText: {
    flex: 1,
  },
  joinBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  joinBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  joinBannerArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
