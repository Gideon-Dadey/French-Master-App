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
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { studyGroupsAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';

const { width } = Dimensions.get('window');

export default function StudyGroupsScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studyGroups, setStudyGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const filters = [
    { id: 'all', name: 'All Groups', icon: 'grid-outline' },
    { id: 'myGroups', name: 'My Groups', icon: 'people-outline' },
    { id: 'beginner', name: 'Beginner', icon: 'school-outline' },
    { id: 'intermediate', name: 'Intermediate', icon: 'trophy-outline' },
    { id: 'advanced', name: 'Advanced', icon: 'star-outline' },
  ];

  const focusOptions = [
    { id: 'general', name: 'General', icon: 'chatbubbles-outline' },
    { id: 'grammar', name: 'Grammar', icon: 'book-outline' },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'library-outline' },
    { id: 'conversation', name: 'Conversation', icon: 'mic-outline' },
    { id: 'pronunciation', name: 'Pronunciation', icon: 'volume-high-outline' },
  ];

  useEffect(() => {
    loadStudyGroups();
  }, [selectedFilter]);

  const loadStudyGroups = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      
      const params = {
        search: searchQuery || undefined,
        myGroups: selectedFilter === 'myGroups' ? 'true' : undefined,
        level: selectedFilter !== 'all' && selectedFilter !== 'myGroups' ? selectedFilter : undefined,
        status: 'active',
      };

      Object.keys(params).forEach(key => 
        params[key] === null || params[key] === undefined ? delete params[key] : {}
      );

      const response = await studyGroupsAPI.getAll(params);
      setStudyGroups(response.data.data || []);
    } catch (error) {
      console.error('Failed to load study groups:', error);
      setError('Failed to load study groups. Please check your connection.');
      setStudyGroups([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedFilter, refreshing]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStudyGroups();
  }, [loadStudyGroups]);

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
      Alert.alert('Success', 'You have successfully joined the study group!');
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
      Alert.alert('Success', 'You have successfully joined the study group!');
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
    if (!user) return false;
    return group.members?.some(member => 
      (typeof member.user === 'object' ? member.user._id : member.user) === user._id
    );
  };

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
              <Text style={[styles.title, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
                Study Groups
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Learn together, grow together
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleCreateGroup}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)' }]}>
            <Ionicons name="search" size={20} color={isDarkMode ? '#FFFFFF' : '#424242'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: isDarkMode ? '#FFFFFF' : '#000' }]}
              placeholder="Search study groups..."
              placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.6)' : '#9E9E9E'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={loadStudyGroups}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); loadStudyGroups(); }}>
                <Ionicons name="close-circle" size={20} color={isDarkMode ? '#FFFFFF' : '#424242'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedFilter === filter.id
                  ? premiumColors.primary.main
                  : colors.card,
                borderColor: selectedFilter === filter.id
                  ? premiumColors.primary.main
                  : colors.border,
              },
              premiumShadows.sm,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={filter.icon}
              size={16}
              color={selectedFilter === filter.id ? '#FFFFFF' : colors.text}
            />
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedFilter === filter.id ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {filter.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {error && !loading ? (
        <ErrorMessage message={error} onRetry={loadStudyGroups} />
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
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No study groups found
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                {selectedFilter === 'myGroups' 
                  ? 'You haven\'t joined any groups yet'
                  : 'Be the first to create a study group!'}
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: premiumColors.primary.main }]}
                onPress={handleCreateGroup}
              >
                <Text style={styles.emptyButtonText}>Create Study Group</Text>
              </TouchableOpacity>
            </View>
          ) : (
            studyGroups.map((group) => (
              <StudyGroupCard
                key={group._id}
                group={group}
                colors={colors}
                isMember={isMember(group)}
                onPress={() => navigation.navigate('StudyGroupDetail', { groupId: group._id })}
                onJoin={() => handleJoinGroup(group._id, group.isPrivate)}
              />
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Join Modal */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Join Private Group</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalText, { color: colors.secondaryText }]}>
              This is a private group. Please enter the invite code to join.
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Enter invite code"
              placeholderTextColor={colors.secondaryText}
              value={joinInviteCode}
              onChangeText={setJoinInviteCode}
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleJoinWithCode}
            >
              <Text style={styles.modalButtonText}>Join Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StudyGroupCard({ group, colors, isMember, onPress, onJoin }) {
  const { isDarkMode } = useTheme();
  const memberCount = group.members?.length || 0;
  const maxMembers = group.maxMembers || 20;
  const levelColors = {
    beginner: premiumColors.accent.emerald,
    intermediate: premiumColors.accent.gold,
    advanced: premiumColors.accent.rose,
    all: premiumColors.primary.main,
  };

  return (
    <TouchableOpacity
      style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.groupHeader}>
        <View style={styles.groupInfo}>
          <Text style={[styles.groupName, { color: colors.text }]} numberOfLines={1}>
            {group.name}
          </Text>
          <View style={styles.groupMeta}>
            <View style={[styles.levelBadge, { backgroundColor: levelColors[group.level || 'all'] + '20' }]}>
              <Text style={[styles.levelText, { color: levelColors[group.level || 'all'] }]}>
                {group.level?.toUpperCase() || 'ALL'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people" size={14} color={colors.secondaryText} />
              <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                {memberCount}/{maxMembers}
              </Text>
            </View>
            {group.isPrivate && (
              <View style={styles.metaItem}>
                <Ionicons name="lock-closed" size={14} color={colors.secondaryText} />
              </View>
            )}
          </View>
        </View>
        {isMember && (
          <View style={[styles.memberBadge, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
            <Text style={[styles.memberBadgeText, { color: premiumColors.accent.emerald }]}>
              Member
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.groupDescription, { color: colors.secondaryText }]} numberOfLines={2}>
        {group.description}
      </Text>

      <View style={styles.groupFooter}>
        <View style={styles.groupTags}>
          {group.focus && (
            <View style={[styles.tag, { backgroundColor: premiumColors.primary.main + '20' }]}>
              <Text style={[styles.tagText, { color: premiumColors.primary.main }]}>
                {group.focus}
              </Text>
            </View>
          )}
          {group.tags?.slice(0, 2).map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.border }]}>
              <Text style={[styles.tagText, { color: colors.secondaryText }]}>{tag}</Text>
            </View>
          ))}
        </View>
        {!isMember && (
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: premiumColors.primary.main }]}
            onPress={(e) => {
              e.stopPropagation();
              onJoin();
            }}
          >
            <Text style={styles.joinButtonText}>Join</Text>
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
  filtersContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
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
    marginBottom: spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    ...premiumShadows.md,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  groupCard: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
  },
  levelText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  metaText: {
    fontSize: fontSize.xs,
  },
  memberBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.base,
  },
  memberBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  groupDescription: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    flex: 1,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  joinButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.base,
    ...premiumShadows.sm,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    ...premiumShadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  modalText: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.md,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '600',
  },
  modalButton: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.base,
    alignItems: 'center',
    ...premiumShadows.md,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

