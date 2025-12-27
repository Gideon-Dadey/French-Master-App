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
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';
import PremiumErrorState from '../src/components/PremiumErrorState';
import { offlineService } from '../src/services/offlineService';

const { width, height } = Dimensions.get('window');

export default function StudyGroupsScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studyGroups, setStudyGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedFocus, setSelectedFocus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    { id: 'all', name: 'All Groups', icon: 'apps', color: '#6366F1' },
    { id: 'myGroups', name: 'My Groups', icon: 'person', color: '#EC4899' },
    { id: 'beginner', name: 'Beginner', icon: 'leaf', color: '#10B981' },
    { id: 'intermediate', name: 'Intermediate', icon: 'flame', color: '#F59E0B' },
    { id: 'advanced', name: 'Advanced', icon: 'diamond', color: '#EF4444' },
  ];

  const focusAreas = [
    { id: 'all', name: 'All Topics', icon: 'grid', color: '#8B5CF6' },
    { id: 'grammar', name: 'Grammar', icon: 'book', color: '#3B82F6' },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'library', color: '#14B8A6' },
    { id: 'conversation', name: 'Speaking', icon: 'chatbubbles', color: '#F97316' },
    { id: 'pronunciation', name: 'Pronunciation', icon: 'mic', color: '#EC4899' },
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>

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
          colors={isDarkMode
            ? ['#0C0A1D', '#1A1040', '#2D1B69']
            : ['#F0F4FF', '#E8DEFF', '#F5E6FF']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >

          <View style={styles.headerDecor}>
            <Animated.View
              style={[
                styles.decorOrb,
                styles.decorOrb1,
                {
                  backgroundColor: isDarkMode ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.12)',
                  transform: [{ scale: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
                }
              ]}
            />
            <Animated.View
              style={[
                styles.decorOrb,
                styles.decorOrb2,
                {
                  backgroundColor: isDarkMode ? 'rgba(236,72,153,0.12)' : 'rgba(236,72,153,0.1)',
                  transform: [{ scale: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
                }
              ]}
            />
            <Animated.View
              style={[
                styles.decorOrb,
                styles.decorOrb3,
                {
                  backgroundColor: isDarkMode ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
                  transform: [{ scale: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
                }
              ]}
            />
          </View>

          <View style={styles.headerContent}>

            <View style={styles.headerTopRow}>
              <View style={styles.headerTitleSection}>
                <View style={styles.headerBadge}>
                  <LinearGradient
                    colors={['#8B5CF6', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerBadgeGradient}
                  >
                    <Ionicons name="people" size={14} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.headerBadgeText, { color: isDarkMode ? '#C4B5FD' : '#8B5CF6' }]}>
                    STUDY GROUPS
                  </Text>
                </View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Learn Together
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
                  Grow together, succeed together
                </Text>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={[styles.headerActionBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(139,92,246,0.1)' }]}
                  onPress={toggleSearch}
                >
                  <Ionicons name="search" size={22} color={isDarkMode ? '#FFFFFF' : '#8B5CF6'} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)' }]}>
                <View style={[styles.statIconContainer, { backgroundColor: '#8B5CF6' + '20' }]}>
                  <Ionicons name="people" size={18} color="#8B5CF6" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalGroups || 24}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Groups</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)' }]}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={[styles.liveText, { color: '#10B981' }]}>LIVE</Text>
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.activeNow}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Active</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)' }]}>
                <View style={[styles.statIconContainer, { backgroundColor: '#EC4899' + '20' }]}>
                  <Ionicons name="person" size={18} color="#EC4899" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalMembers}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Members</Text>
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
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
            <Ionicons name="search" size={20} color={colors.secondaryText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search study groups..."
              placeholderTextColor={colors.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={loadStudyGroups}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setSearchQuery(''); toggleSearch(); loadStudyGroups(); }}>
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
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
                    backgroundColor: isActive
                      ? filter.color
                      : isDarkMode ? 'rgba(255,255,255,0.08)' : colors.card,
                    borderColor: isActive ? filter.color : isDarkMode ? '#374151' : '#E5E7EB',
                  },
                  isActive && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={isActive ? '#FFFFFF' : filter.color}
                />
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? '#FFFFFF' : colors.text },
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
                    backgroundColor: isActive
                      ? focus.color + '20'
                      : 'transparent',
                    borderColor: isActive ? focus.color : 'transparent',
                  },
                ]}
                onPress={() => setSelectedFocus(focus.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.focusText,
                    { color: isActive ? focus.color : colors.secondaryText },
                  ]}
                >
                  {focus.name}
                </Text>
                {isActive && <View style={[styles.focusIndicator, { backgroundColor: focus.color }]} />}
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
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
              <LinearGradient
                colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#F5F3FF', '#EDE9FE']}
                style={styles.emptyIconContainer}
              >
                <Ionicons name="people" size={48} color="#8B5CF6" />
              </LinearGradient>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No study groups found
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
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
                  colors={['#8B5CF6', '#7C3AED']}
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
                <Text style={[styles.resultsCount, { color: colors.secondaryText }]}>
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
                    colors={colors}
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
            colors={['#8B5CF6', '#7C3AED']}
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
          <Animated.View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#F5F3FF', '#EDE9FE']}
              style={styles.modalHeader}
            >
              <View style={styles.modalIconContainer}>
                <Ionicons name="lock-closed" size={32} color="#8B5CF6" />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Private Group</Text>
              <Text style={[styles.modalSubtitle, { color: colors.secondaryText }]}>
                Enter the invite code to join
              </Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              <View style={[styles.codeInputContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6', borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                <TextInput
                  style={[styles.codeInput, { color: colors.text }]}
                  placeholder="• • • • • •"
                  placeholderTextColor={colors.secondaryText}
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
                  colors={['#8B5CF6', '#7C3AED']}
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
                <Text style={[styles.modalCancelText, { color: colors.secondaryText }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function StudyGroupCard({ group, colors, isDarkMode, isMember, onPress, onJoin, index }) {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const memberCount = group.members?.length || 0;
  const maxMembers = group.maxMembers || 20;
  const fillPercentage = (memberCount / maxMembers) * 100;

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
      delay: index * 100,
    }).start();
  }, []);

  const levelConfig = {
    beginner: { color: '#10B981', gradient: ['#10B981', '#059669'], icon: 'leaf', label: 'Beginner' },
    intermediate: { color: '#F59E0B', gradient: ['#F59E0B', '#D97706'], icon: 'flame', label: 'Intermediate' },
    advanced: { color: '#EF4444', gradient: ['#EF4444', '#DC2626'], icon: 'diamond', label: 'Advanced' },
    all: { color: '#6366F1', gradient: ['#6366F1', '#4F46E5'], icon: 'apps', label: 'All Levels' },
  };

  const focusConfig = {
    grammar: { color: '#3B82F6', icon: 'book' },
    vocabulary: { color: '#14B8A6', icon: 'library' },
    conversation: { color: '#F97316', icon: 'chatbubbles' },
    pronunciation: { color: '#EC4899', icon: 'mic' },
    general: { color: '#8B5CF6', icon: 'grid' },
  };

  const level = group.level?.toLowerCase() || 'all';
  const focus = group.focus?.toLowerCase() || 'general';
  const levelStyle = levelConfig[level] || levelConfig.all;
  const focusStyle = focusConfig[focus] || focusConfig.general;

  return (
    <TouchableOpacity
      style={[
        styles.groupCard,
        {
          backgroundColor: isDarkMode ? '#1E1B4B' : '#FFFFFF',
          borderColor: isDarkMode ? '#312E81' : '#E5E7EB',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >

      <LinearGradient
        colors={levelStyle.gradient}
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

          <View style={[styles.focusBadge, { backgroundColor: focusStyle.color + '15' }]}>
            <Ionicons name={focusStyle.icon} size={12} color={focusStyle.color} />
          </View>

          {group.isPrivate && (
            <View style={[styles.privateBadge, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
              <Ionicons name="lock-closed" size={12} color="#64748B" />
            </View>
          )}
        </View>

        {isMember ? (
          <View style={styles.memberBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.memberBadgeText}>Member</Text>
          </View>
        ) : (
          <View style={styles.activeBadge}>
            <View style={styles.activeIndicator} />
            <Text style={styles.activeText}>Active</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.groupName, { color: colors.text }]} numberOfLines={1}>
          {group.name}
        </Text>
        <Text style={[styles.groupDesc, { color: colors.secondaryText }]} numberOfLines={2}>
          {group.description || 'Join this study group to learn French together with fellow learners!'}
        </Text>
      </View>

      <View style={styles.progressSection}>
        <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${fillPercentage}%`,
                backgroundColor: fillPercentage > 80 ? '#EF4444' : fillPercentage > 50 ? '#F59E0B' : '#10B981',
              }
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.secondaryText }]}>
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
                  { marginLeft: idx > 0 ? -12 : 0, zIndex: 4 - idx }
                ]}
              />
            ))}
            {memberCount > 4 && (
              <View style={[styles.moreAvatar, { marginLeft: -12 }]}>
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
              colors={['#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <Text style={styles.actionText}>Enter</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.joinBtn}
            onPress={(e) => { e.stopPropagation(); onJoin(); }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
  decorOrb3: {
    width: 100,
    height: 100,
    top: 60,
    left: '40%',
  },
  headerContent: {
    zIndex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitleSection: {
    flex: 1,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerBadgeGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  filterChipActive: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  focusSection: {
    paddingBottom: 8,
  },
  focusScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  focusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
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
    marginBottom: 16,
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
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 10,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  groupCard: {
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  focusBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#10B981',
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
    backgroundColor: '#10B981',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  groupDesc: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
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
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  avatarsSection: {
    flex: 1,
  },
  avatarsStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreAvatarText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  enterBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
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
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
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
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  modalHeader: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(139,92,246,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalBody: {
    padding: 24,
    paddingTop: 0,
  },
  codeInputContainer: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  codeInput: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 20,
    letterSpacing: 8,
  },
  modalJoinBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  modalJoinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  modalJoinText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
