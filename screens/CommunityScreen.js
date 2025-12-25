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

  const userName = user?.name?.split(' ')[0] || 'Learner';

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
      onPress: () => navigation.navigate('Discussions'),
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

          <View style={styles.headerDecor}>
            <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)' }]} />
            <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: isDarkMode ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.08)' }]} />
          </View>

          <View style={styles.headerContent}>

            <View style={styles.headerTopRow}>
              <View style={styles.headerTitleSection}>
                <View style={styles.headerBadge}>
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

        {studyGroups.length > 0 && (
          <View style={styles.studyGroupsSection}>
            <LinearGradient
              colors={isDarkMode ? ['#1A1040', '#0F172A'] : ['#F5F3FF', '#EDE9FE']}
              style={styles.studyGroupsContainer}
            >
              <View style={styles.studyGroupsHeader}>
                <View style={styles.studyGroupsTitleRow}>
                  <View>
                    <Text style={[styles.studyGroupsTitle, { color: colors.text }]}>Active Study Groups</Text>
                    <Text style={[styles.studyGroupsSubtitle, { color: colors.secondaryText }]}>
                      {studyGroups.length} groups learning now
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.seeAllBtn, { backgroundColor: '#8B5CF6' + '15' }]}
                  onPress={() => navigation.navigate('StudyGroups')}
                >
                  <Text style={[styles.seeAllBtnText, { color: '#8B5CF6' }]}>See All</Text>
                  <Ionicons name="arrow-forward" size={14} color="#8B5CF6" />
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
                <Text style={[styles.highlightsSectionTitle, { color: colors.text }]}>
                  Community Highlights
                </Text>
                <Text style={[styles.highlightsSectionSubtitle, { color: colors.secondaryText }]}>
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
              gradient={['#F97316', '#EA580C']}
              colors={colors}
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
              gradient={['#8B5CF6', '#7C3AED']}
              colors={colors}
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
              gradient={['#3B82F6', '#2563EB']}
              colors={colors}
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
              gradient={['#10B981', '#059669']}
              colors={colors}
              isDarkMode={isDarkMode}
              onPress={() => navigation.navigate('Achievements')}
              badge="View All"
            />
          </View>
        </View>

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

function StudyGroupCard({ group, colors, isDarkMode, onPress, index }) {
  const memberCount = group.members?.length || 0;
  const maxMembers = group.maxMembers || 20;
  const fillPercentage = Math.min((memberCount / maxMembers) * 100, 100);

  const levelConfig = {
    beginner: { color: '#10B981', icon: 'leaf', gradient: ['#10B981', '#059669'] },
    intermediate: { color: '#F59E0B', icon: 'flame', gradient: ['#F59E0B', '#D97706'] },
    advanced: { color: '#EF4444', icon: 'diamond', gradient: ['#EF4444', '#DC2626'] },
    all: { color: '#8B5CF6', icon: 'apps', gradient: ['#8B5CF6', '#7C3AED'] },
  };

  const level = group.level?.toLowerCase() || 'all';
  const levelStyle = levelConfig[level] || levelConfig.all;

  const cardGradients = [
    ['#6366F1', '#4F46E5'],
    ['#8B5CF6', '#7C3AED'],
    ['#EC4899', '#DB2777'],
    ['#3B82F6', '#2563EB'],
  ];
  const cardGradient = cardGradients[index % cardGradients.length];

  return (
    <TouchableOpacity
      style={[styles.groupCard, { backgroundColor: isDarkMode ? '#1E1B4B' : '#FFFFFF' }]}
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

        <View style={styles.groupCardLiveBadge}>
          <View style={styles.groupCardLiveDot} />
          <Text style={styles.groupCardLiveText}>LIVE</Text>
        </View>

        <View style={styles.groupCardIconContainer}>
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
        <Text style={[styles.groupCardTitle, { color: colors.text }]} numberOfLines={1}>
          {group.name}
        </Text>
        <Text style={[styles.groupCardDesc, { color: colors.secondaryText }]} numberOfLines={2}>
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
                        borderColor: isDarkMode ? '#1E1B4B' : '#FFFFFF',
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
                  <View style={[styles.groupCardAvatar, styles.groupCardAvatarMore, { marginLeft: -8 }]}>
                    <Text style={styles.groupCardAvatarMoreText}>+{memberCount - 3}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.groupCardMemberCount, { color: colors.secondaryText }]}>
                {memberCount}/{maxMembers}
              </Text>
            </View>
          </View>

          <View style={[styles.groupCardProgressBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
            <View
              style={[
                styles.groupCardProgressFill,
                {
                  width: `${fillPercentage}%`,
                  backgroundColor: fillPercentage > 80 ? '#EF4444' : cardGradient[0]
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

function HighlightCard({ icon, title, value, suffix, subtitle, gradient, colors, isDarkMode, onPress, progress, target, badge }) {
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
            backgroundColor: isDarkMode ? '#1E1B4B' : '#FFFFFF',
            borderColor: isDarkMode ? '#312E81' : '#F3F4F6',
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
            <Text style={[styles.highlightSuffix, { color: colors.secondaryText }]}>
              {suffix}
            </Text>
          )}
        </View>

        <Text style={[styles.highlightTitle, { color: colors.text }]}>{title}</Text>

        {progress !== undefined && (
          <View style={styles.highlightProgressContainer}>
            <View style={[styles.highlightProgressBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
              <View
                style={[
                  styles.highlightProgressFill,
                  { width: `${progress * 100}%`, backgroundColor: gradient[0] }
                ]}
              />
            </View>
            <Text style={[styles.highlightProgressText, { color: colors.secondaryText }]}>
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

        <Text style={[styles.highlightSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>

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

  studyGroupsSection: {
    marginBottom: spacing.xl,
    marginHorizontal: -spacing.lg,
  },
  studyGroupsContainer: {
    paddingVertical: 24,
    paddingHorizontal: spacing.lg,
    borderRadius: 0,
  },
  studyGroupsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  studyGroupsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studyGroupsIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studyGroupsTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
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
    paddingRight: spacing.lg,
  },

  groupCard: {
    width: width * 0.75,
    borderRadius: 24,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
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
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  groupCardLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  groupCardLiveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  groupCardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.95)',
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
    borderRadius: 20,
  },
  groupCardLevelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  groupCardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
  },
  groupCardBody: {
    padding: 16,
  },
  groupCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  groupCardDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
    opacity: 0.8,
  },
  groupCardProgress: {
    marginBottom: 16,
  },
  groupCardProgressHeader: {
    marginBottom: 10,
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
    backgroundColor: '#6366F1',
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
    height: 6,
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

  highlightsSection: {
    marginBottom: spacing.xl,
  },
  highlightsSectionHeader: {
    marginBottom: 20,
  },
  highlightsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightsIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightsSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
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
    width: (width - spacing.lg * 2 - 12) / 2,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  highlightValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 28,
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
    height: 6,
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
