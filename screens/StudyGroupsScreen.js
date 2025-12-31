import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Dimensions,
  Modal,
  Alert,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { studyGroupsAPI } from '../src/services/api';
import { getThemeColors, themeShadows } from '../src/utils/organicTheme';
import LoadingSpinner from '../src/components/LoadingSpinner';
import PremiumErrorState from '../src/components/PremiumErrorState';
import { offlineService } from '../src/services/offlineService';

const { width, height } = Dimensions.get('window');

export default function StudyGroupsScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studyGroups, setStudyGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedFocus, setSelectedFocus] = useState('all');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;
  const fabPulse = useRef(new Animated.Value(1)).current;

  const stats = {
    totalGroups: studyGroups.length,
    activeNow: Math.floor(studyGroups.length * 0.6) || 12,
    totalMembers: studyGroups.reduce((acc, g) => acc + (g.members?.length || 0), 0) || 156,
  };

  const filters = [
    { id: 'all', name: 'All Groups', icon: 'apps', color: theme.primary },
    { id: 'myGroups', name: 'My Groups', icon: 'person', color: theme.accent },
    { id: 'beginner', name: 'Beginner', icon: 'leaf', color: theme.success },
    { id: 'intermediate', name: 'Intermediate', icon: 'flame', color: theme.secondary },
    { id: 'advanced', name: 'Advanced', icon: 'diamond', color: theme.error },
  ];

  const focusAreas = [
    { id: 'all', name: 'All Topics', icon: 'grid', color: theme.primary },
    { id: 'grammar', name: 'Grammar', icon: 'book', color: theme.info },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'library', color: theme.success },
    { id: 'conversation', name: 'Speaking', icon: 'chatbubbles', color: theme.secondary },
    { id: 'pronunciation', name: 'Pronunciation', icon: 'mic', color: theme.accent },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(cardsAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8, delay: 200 }),
      Animated.spring(fabAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 8, delay: 400 }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(fabPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

  useEffect(() => {
    loadStudyGroups();
  }, [selectedFilter, selectedFocus, user?._id]);

  useFocusEffect(
    useCallback(() => {
      loadStudyGroups();
    }, [user?._id])
  );

  const loadStudyGroups = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      const cachedGroups = await offlineService.getFromCache(`study_groups_${selectedFilter}_${selectedFocus}`);
      if (cachedGroups?.data) setStudyGroups(cachedGroups.data);

      const params = {
        search: searchQuery || undefined,
        myGroups: selectedFilter === 'myGroups' ? 'true' : undefined,
        level: selectedFilter !== 'all' && selectedFilter !== 'myGroups' ? selectedFilter : undefined,
        focus: selectedFocus !== 'all' ? selectedFocus : undefined,
        status: 'active',
      };

      Object.keys(params).forEach(key =>
        params[key] === null || params[key] === undefined ? delete params[key] : {}
      );

      const response = await studyGroupsAPI.getAll(params);
      const groupsData = response.data.data || [];
      setStudyGroups(groupsData);

      await offlineService.saveToCache(`study_groups_${selectedFilter}_${selectedFocus}`, groupsData);

    } catch (err) {
      console.error('Failed to load study groups:', err);
      const errorMessage = err.message || 'Failed to load study groups';

      if (studyGroups.length === 0) {
        if (errorMessage.includes('Network') || errorMessage.includes('network')) {
          setError('Connection Lost - Please check your internet connection');
        } else if (errorMessage.includes('401')) {
          setError('Authentication Error - Please log in again');
        } else {
          setError(errorMessage);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedFilter, selectedFocus, refreshing]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStudyGroups();
  }, [loadStudyGroups]);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    Animated.spring(searchAnim, {
      toValue: showSearch ? 0 : 1,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  };

  const handleJoinGroup = async (groupId, isPrivate = false) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to join study groups');
      navigation.navigate('Auth');
      return;
    }

    if (isPrivate) {
      setSelectedGroupId(groupId);
      setShowJoinModal(true);
      return;
    }

    try {
      await studyGroupsAPI.join(groupId);
      Alert.alert('🎉 Welcome!', 'You have successfully joined the study group!');
      loadStudyGroups();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to join study group');
    }
  };

  const handleJoinWithCode = async () => {
    if (!joinInviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    try {
      await studyGroupsAPI.join(selectedGroupId, joinInviteCode);
      Alert.alert('🎉 Welcome!', 'You have successfully joined the study group!');
      setShowJoinModal(false);
      setJoinInviteCode('');
      setSelectedGroupId(null);
      loadStudyGroups();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid invite code');
    }
  };

  const handleCreateGroup = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to create study groups', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }
    navigation.navigate('CreateStudyGroup');
  };

  const isMember = (group) => {
    if (!user || !group) return false;

    const userId = user._id
      ? (typeof user._id === 'object' ? String(user._id) : String(user._id))
      : (user.id ? String(user.id) : null);

    if (!userId) return false;

    let creatorId = null;
    if (group.creator) {
      if (typeof group.creator === 'object' && group.creator !== null) {
        creatorId = group.creator._id
          ? String(group.creator._id)
          : (group.creator.id ? String(group.creator.id) : String(group.creator));
      } else {
        creatorId = String(group.creator);
      }
    }

    if (creatorId && creatorId === userId) {
      return true;
    }

    const inMembers = group.members?.some(member => {
      if (!member || !member.user) return false;

      let memberId = null;
      if (typeof member.user === 'object' && member.user !== null) {
        memberId = member.user._id
          ? String(member.user._id)
          : (member.user.id ? String(member.user.id) : String(member.user));
      } else {
        memberId = String(member.user);
      }

      return memberId === userId;
    });

    return inMembers || false;
  };

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
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
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
            <View style={[styles.decorOrb, styles.decorOrb1, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
            <View style={[styles.decorOrb, styles.decorOrb2, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerTitleSection}>
                <Text style={[styles.headerBadgeText, { color: theme.secondary }]}>STUDY GROUPS</Text>
                <Text style={styles.headerTitle}>Learn Together</Text>
                <Text style={styles.headerSubtitle}>Grow together, succeed together</Text>
              </View>

              <TouchableOpacity
                style={[styles.headerActionBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                onPress={toggleSearch}
              >
                <Ionicons name="search" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={[styles.statIconContainer, { backgroundColor: theme.primary + '30' }]}>
                  <Ionicons name="people" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{stats.totalGroups || 24}</Text>
                <Text style={styles.statLabel}>Groups</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={styles.liveIndicator}>
                  <View style={[styles.liveDot, { backgroundColor: theme.success }]} />
                  <Text style={[styles.liveText, { color: theme.success }]}>LIVE</Text>
                </View>
                <Text style={styles.statValue}>{stats.activeNow}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={[styles.statIconContainer, { backgroundColor: theme.secondary + '30' }]}>
                  <Ionicons name="person" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{stats.totalMembers}</Text>
                <Text style={styles.statLabel}>Members</Text>
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
              placeholder="Search study groups..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={loadStudyGroups}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setSearchQuery(''); toggleSearch(); loadStudyGroups(); }}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {filters.map((filter) => {
            const isActive = selectedFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? theme.primary : theme.surface,
                    borderColor: isActive ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={isActive ? '#FFFFFF' : theme.primary}
                />
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.focusSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.focusScrollContent}
        >
          {focusAreas.map((focus) => {
            const isActive = selectedFocus === focus.id;
            return (
              <TouchableOpacity
                key={focus.id}
                style={[
                  styles.focusChip,
                  {
                    backgroundColor: isActive ? theme.primary + '15' : 'transparent',
                    borderColor: isActive ? theme.primary : 'transparent',
                  },
                ]}
                onPress={() => setSelectedFocus(focus.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.focusText,
                    { color: isActive ? theme.primary : theme.textSecondary },
                  ]}
                >
                  {focus.name}
                </Text>
                {isActive && <View style={[styles.focusIndicator, { backgroundColor: theme.secondary }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {error && studyGroups.length === 0 ? (
        <PremiumErrorState
          title="Groups Unavailable"
          message="We couldn't load the study groups. Check your connection or try again."
          onRetry={loadStudyGroups}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          showsVerticalScrollIndicator={false}
        >
          {studyGroups.length === 0 ? (
            <Animated.View
              style={[
                styles.emptyContainer,
                {
                  opacity: cardsAnim,
                  transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                }
              ]}
            >
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="people" size={48} color={theme.primary} />
              </View>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No study groups found
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                {selectedFilter === 'myGroups'
                  ? 'You haven\'t joined any groups yet.\nExplore and find your study buddies!'
                  : 'Be the first to create a study group\nand start learning together!'}
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleCreateGroup}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[theme.primary, theme.primaryLight || theme.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyButtonGradient}
                >
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.emptyButtonText}>Create Study Group</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <>
              <View style={styles.resultsHeader}>
                <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
                  {studyGroups.length} {studyGroups.length === 1 ? 'group' : 'groups'} found
                </Text>
              </View>

              {studyGroups.map((group, index) => (
                <Animated.View
                  key={group._id}
                  style={{
                    opacity: cardsAnim,
                    transform: [
                      {
                        translateY: cardsAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50 + index * 20, 0]
                        })
                      }
                    ],
                  }}
                >
                  <StudyGroupCard
                    group={group}
                    theme={theme}
                    isDarkMode={isDarkMode}
                    isMember={isMember(group)}
                    onPress={() => navigation.navigate('StudyGroupDetail', { groupId: group._id, initialTab: 'discussions' })}
                    onJoin={() => handleJoinGroup(group._id, group.isPrivate)}
                    index={index}
                  />
                </Animated.View>
              ))}
            </>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      <Animated.View
        style={[
          styles.fabContainer,
          {
            opacity: fabAnim,
            transform: [
              { scale: Animated.multiply(fabAnim, fabPulse) },
              { translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateGroup}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[theme.secondary, theme.secondaryLight || theme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={showJoinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <LinearGradient
              colors={theme.heroGradient}
              style={styles.modalHeader}
            >
              <View style={[styles.modalIconContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Ionicons name="lock-closed" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>Private Group</Text>
              <Text style={styles.modalSubtitle}>Enter the invite code to join</Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              <View style={[styles.codeInputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.codeInput, { color: theme.text }]}
                  placeholder="• • • • • •"
                  placeholderTextColor={theme.textMuted}
                  value={joinInviteCode}
                  onChangeText={setJoinInviteCode}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={styles.modalJoinBtn}
                onPress={handleJoinWithCode}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[theme.primary, theme.primaryLight || theme.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalJoinGradient}
                >
                  <Text style={styles.modalJoinText}>Join Group</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowJoinModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StudyGroupCard({ group, theme, isDarkMode, isMember, onPress, onJoin, index }) {
  const memberCount = group.members?.length || 0;
  const maxMembers = group.maxMembers || 20;
  const fillPercentage = (memberCount / maxMembers) * 100;

  const levelConfig = {
    beginner: { color: theme.success, icon: 'leaf', label: 'Beginner' },
    intermediate: { color: theme.secondary, icon: 'flame', label: 'Intermediate' },
    advanced: { color: theme.error, icon: 'diamond', label: 'Advanced' },
    all: { color: theme.primary, icon: 'apps', label: 'All Levels' },
  };

  const level = group.level?.toLowerCase() || 'all';
  const levelStyle = levelConfig[level] || levelConfig.all;

  return (
    <TouchableOpacity
      style={[
        styles.groupCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[levelStyle.color, levelStyle.color + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.cardAccent}
      />

      <View style={styles.cardHeader}>
        <View style={styles.cardBadges}>
          <View style={[styles.levelBadge, { backgroundColor: levelStyle.color + '15' }]}>
            <Ionicons name={levelStyle.icon} size={12} color={levelStyle.color} />
            <Text style={[styles.levelBadgeText, { color: levelStyle.color }]}>
              {levelStyle.label}
            </Text>
          </View>

          {group.isPrivate && (
            <View style={[styles.privateBadge, { backgroundColor: theme.background }]}>
              <Ionicons name="lock-closed" size={12} color={theme.textSecondary} />
            </View>
          )}
        </View>

        {isMember ? (
          <View style={styles.memberBadge}>
            <Ionicons name="checkmark-circle" size={16} color={theme.success} />
            <Text style={[styles.memberBadgeText, { color: theme.success }]}>Member</Text>
          </View>
        ) : (
          <View style={styles.activeBadge}>
            <View style={[styles.activeIndicator, { backgroundColor: theme.success }]} />
            <Text style={[styles.activeText, { color: theme.success }]}>Active</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.groupName, { color: theme.text }]} numberOfLines={1}>
          {group.name}
        </Text>
        <Text style={[styles.groupDesc, { color: theme.textSecondary }]} numberOfLines={2}>
          {group.description || 'Join this study group to learn French together with fellow learners!'}
        </Text>
      </View>

      <View style={styles.progressSection}>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${fillPercentage}%`,
                backgroundColor: fillPercentage > 80 ? theme.error : fillPercentage > 50 ? theme.secondary : theme.success,
              }
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          {memberCount}/{maxMembers} members
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.avatarsSection}>
          <View style={styles.avatarsStack}>
            {(group.members?.slice(0, 4) || []).map((member, idx) => (
              <Image
                key={idx}
                source={{ uri: member.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user?.name || 'U')}&background=random` }}
                style={[
                  styles.memberAvatar,
                  { marginLeft: idx > 0 ? -12 : 0, zIndex: 4 - idx, borderColor: theme.surface }
                ]}
              />
            ))}
            {memberCount > 4 && (
              <View style={[styles.moreAvatar, { marginLeft: -12, backgroundColor: theme.primary }]}>
                <Text style={styles.moreAvatarText}>+{memberCount - 4}</Text>
              </View>
            )}
          </View>
        </View>

        {isMember ? (
          <TouchableOpacity
            style={styles.enterBtn}
            onPress={onPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryLight || theme.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <Text style={[styles.actionText, { color: theme.textOnPrimary || '#FFFFFF' }]}>Enter</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.textOnPrimary || "#FFFFFF"} />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.joinBtn}
            onPress={(e) => { e.stopPropagation(); onJoin(); }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[theme.secondary, theme.secondaryLight || theme.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <Text style={styles.actionText}>Join</Text>
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
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
  decorOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  decorOrb1: {
    width: 180,
    height: 180,
    top: -40,
    right: -40,
  },
  decorOrb2: {
    width: 120,
    height: 120,
    bottom: 20,
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
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
    gap: 4,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  searchOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 100,
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
    paddingVertical: 0,
  },
  filtersSection: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  filtersScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  focusSection: {
    paddingBottom: 8,
  },
  focusScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  focusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    position: 'relative',
  },
  focusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  focusIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '30%',
    right: '30%',
    height: 3,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  resultsHeader: {
    marginBottom: 14,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyButton: {
    borderRadius: 14,
    overflow: 'hidden',
    ...themeShadows.md,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  groupCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    ...themeShadows.sm,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  cardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  privateBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  groupDesc: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.8,
  },
  progressSection: {
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  progressBar: {
    height: 5,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  avatarsSection: {
    flex: 1,
  },
  avatarsStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
  },
  moreAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  enterBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  joinBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 100,
  },
  fab: {
    borderRadius: 28,
    overflow: 'hidden',
    ...themeShadows.lg,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    overflow: 'hidden',
    ...themeShadows.lg,
  },
  modalHeader: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  modalBody: {
    padding: 24,
  },
  codeInputContainer: {
    borderRadius: 14,
    borderWidth: 2,
    marginBottom: 18,
    overflow: 'hidden',
  },
  codeInput: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 18,
    letterSpacing: 8,
  },
  modalJoinBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
  },
  modalJoinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  modalJoinText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
