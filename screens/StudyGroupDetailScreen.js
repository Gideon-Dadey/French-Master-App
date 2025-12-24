import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Dimensions,
  Modal,
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

export default function StudyGroupDetailScreen({ route, navigation }) {
  const { groupId } = route.params;
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [discussionMessage, setDiscussionMessage] = useState('');
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'link' });

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const response = await studyGroupsAPI.getById(groupId);
      setGroup(response.data.data);
    } catch (error) {
      console.error('Failed to load study group:', error);
      setError('Failed to load study group. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroup();
  };

  const isMember = () => {
    if (!user || !group) return false;
    return group.members?.some(member => 
      (typeof member.user === 'object' ? member.user._id : member.user) === user._id
    );
  };

  const isModerator = () => {
    if (!user || !group) return false;
    if (group.creator?._id === user._id || (typeof group.creator === 'string' && group.creator === user._id)) {
      return true;
    }
    return group.members?.some(member => 
      (typeof member.user === 'object' ? member.user._id : member.user) === user._id && member.role === 'moderator'
    );
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to join this study group');
      navigation.navigate('Auth');
      return;
    }

    if (group.isPrivate) {
      setShowJoinModal(true);
    } else {
      try {
        await studyGroupsAPI.join(groupId);
        Alert.alert('Success', 'You have successfully joined the study group!');
        loadGroup();
      } catch (error) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to join study group');
      }
    }
  };

  const handleJoinWithCode = async () => {
    if (!joinInviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    try {
      await studyGroupsAPI.join(groupId, joinInviteCode);
      Alert.alert('Success', 'You have successfully joined the study group!');
      setShowJoinModal(false);
      setJoinInviteCode('');
      loadGroup();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid invite code');
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this study group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await studyGroupsAPI.leave(groupId);
              Alert.alert('Success', 'You have left the study group');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to leave group');
            }
          },
        },
      ]
    );
  };

  const handleSendMessage = async () => {
    if (!discussionMessage.trim()) return;

    try {
      await studyGroupsAPI.addDiscussion(groupId, discussionMessage);
      setDiscussionMessage('');
      loadGroup();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send message');
    }
  };

  const handleAddResource = async () => {
    if (!newResource.title.trim() || !newResource.url.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await studyGroupsAPI.addResource(groupId, newResource);
      setShowResourceModal(false);
      setNewResource({ title: '', url: '', type: 'link' });
      loadGroup();
      Alert.alert('Success', 'Resource added successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add resource');
    }
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  if (error || !group) {
    return <ErrorMessage message={error || 'Study group not found'} onRetry={loadGroup} />;
  }

  const member = isMember();
  const moderator = isModerator();
  const memberCount = group.members?.length || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#424242'} />
              </TouchableOpacity>
              {moderator && (
                <TouchableOpacity>
                  <Ionicons name="settings-outline" size={24} color={isDarkMode ? '#FFFFFF' : '#424242'} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.groupName, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
              {group.name}
            </Text>
            <Text style={[styles.groupDescription, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              {group.description}
            </Text>
            <View style={styles.groupMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="people" size={16} color={isDarkMode ? '#FFFFFF' : '#424242'} />
                <Text style={[styles.metaText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                  {memberCount}/{group.maxMembers} members
                </Text>
              </View>
              {group.isPrivate && (
                <View style={styles.metaItem}>
                  <Ionicons name="lock-closed" size={16} color={isDarkMode ? '#FFFFFF' : '#424242'} />
                  <Text style={[styles.metaText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                    Private
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!member ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleJoin}
            >
              <Ionicons name="person-add" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Join Group</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
              onPress={handleLeave}
            >
              <Ionicons name="exit-outline" size={20} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Leave Group</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['about', 'members', 'discussions', 'resources'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                {
                  borderBottomColor: activeTab === tab ? premiumColors.primary.main : 'transparent',
                },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab ? premiumColors.primary.main : colors.secondaryText,
                    fontWeight: activeTab === tab ? '700' : '500',
                  },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <View style={styles.tabContent}>
            <InfoSection title="Level" value={group.level || 'All'} colors={colors} />
            <InfoSection title="Focus" value={group.focus || 'General'} colors={colors} />
            {group.studyGoals?.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Study Goals</Text>
                {group.studyGoals.map((goal, index) => (
                  <View key={index} style={[styles.goalItem, { backgroundColor: colors.card }]}>
                    <Ionicons name="checkmark-circle" size={16} color={premiumColors.accent.emerald} />
                    <Text style={[styles.goalText, { color: colors.text }]}>{goal}</Text>
                  </View>
                ))}
              </View>
            )}
            {group.meetingSchedule?.frequency && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Meeting Schedule</Text>
                <Text style={[styles.scheduleText, { color: colors.secondaryText }]}>
                  {group.meetingSchedule.frequency}
                  {group.meetingSchedule.dayOfWeek && ` - ${group.meetingSchedule.dayOfWeek}`}
                  {group.meetingSchedule.time && ` at ${group.meetingSchedule.time}`}
                </Text>
              </View>
            )}
            {group.tags?.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {group.tags.map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: colors.card }]}>
                      <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'members' && (
          <View style={styles.tabContent}>
            {group.members?.map((member, index) => {
              const memberUser = typeof member.user === 'object' ? member.user : null;
              const isCreator = group.creator?._id === memberUser?._id || 
                               (typeof group.creator === 'string' && group.creator === member.user);
              return (
                <View key={index} style={[styles.memberCard, { backgroundColor: colors.card }]}>
                  <View style={[styles.avatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
                    <Ionicons name="person" size={24} color={premiumColors.primary.main} />
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.text }]}>
                      {memberUser?.name || 'Member'}
                      {isCreator && (
                        <Text style={[styles.creatorBadge, { color: premiumColors.accent.gold }]}>
                          {' '}(Creator)
                        </Text>
                      )}
                    </Text>
                    <Text style={[styles.memberRole, { color: colors.secondaryText }]}>
                      {member.role || 'member'}
                    </Text>
                  </View>
                  {moderator && !isCreator && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          'Remove Member',
                          `Remove ${memberUser?.name || 'this member'} from the group?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Remove',
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  await studyGroupsAPI.removeMember(groupId, member.user._id || member.user);
                                  loadGroup();
                                } catch (error) {
                                  Alert.alert('Error', error.response?.data?.message || 'Failed to remove member');
                                }
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error || '#FF3B30'} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'discussions' && (
          <View style={styles.tabContent}>
            {member && (
              <View style={[styles.messageInputContainer, { backgroundColor: colors.card }]}>
                <TextInput
                  style={[styles.messageInput, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Type a message..."
                  placeholderTextColor={colors.secondaryText}
                  value={discussionMessage}
                  onChangeText={setDiscussionMessage}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: premiumColors.primary.main }]}
                  onPress={handleSendMessage}
                >
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
            {group.discussions?.length > 0 ? (
              group.discussions.map((discussion, index) => {
                const discussionUser = typeof discussion.user === 'object' ? discussion.user : null;
                return (
                  <View key={index} style={[styles.discussionCard, { backgroundColor: colors.card }]}>
                    <View style={[styles.avatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
                      <Ionicons name="person" size={20} color={premiumColors.primary.main} />
                    </View>
                    <View style={styles.discussionContent}>
                      <Text style={[styles.discussionAuthor, { color: colors.text }]}>
                        {discussionUser?.name || 'Member'}
                      </Text>
                      <Text style={[styles.discussionMessage, { color: colors.secondaryText }]}>
                        {discussion.message}
                      </Text>
                      <Text style={[styles.discussionTime, { color: colors.secondaryText }]}>
                        {new Date(discussion.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.secondaryText} />
                <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                  No discussions yet. Start the conversation!
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'resources' && (
          <View style={styles.tabContent}>
            {member && (
              <TouchableOpacity
                style={[styles.addResourceButton, { backgroundColor: premiumColors.primary.main }]}
                onPress={() => setShowResourceModal(true)}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addResourceText}>Add Resource</Text>
              </TouchableOpacity>
            )}
            {group.resources?.length > 0 ? (
              group.resources.map((resource, index) => {
                const resourceUser = typeof resource.addedBy === 'object' ? resource.addedBy : null;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.resourceCard, { backgroundColor: colors.card }]}
                    onPress={() => {
                      if (resource.url) {
                        // Open URL - you might want to use Linking here
                        Alert.alert('Resource', `Open ${resource.url}?`);
                      }
                    }}
                  >
                    <Ionicons
                      name={resource.type === 'video' ? 'videocam' : resource.type === 'document' ? 'document' : 'link'}
                      size={24}
                      color={premiumColors.primary.main}
                    />
                    <View style={styles.resourceInfo}>
                      <Text style={[styles.resourceTitle, { color: colors.text }]}>{resource.title}</Text>
                      <Text style={[styles.resourceMeta, { color: colors.secondaryText }]}>
                        Added by {resourceUser?.name || 'Member'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-outline" size={48} color={colors.secondaryText} />
                <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                  No resources yet. Add your first resource!
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

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

      {/* Add Resource Modal */}
      <Modal
        visible={showResourceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResourceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Resource</Text>
              <TouchableOpacity onPress={() => setShowResourceModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Resource Title"
              placeholderTextColor={colors.secondaryText}
              value={newResource.title}
              onChangeText={(text) => setNewResource({ ...newResource, title: text })}
            />
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="URL"
              placeholderTextColor={colors.secondaryText}
              value={newResource.url}
              onChangeText={(text) => setNewResource({ ...newResource, url: text })}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleAddResource}
            >
              <Text style={styles.modalButtonText}>Add Resource</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoSection({ title, value, colors }) {
  return (
    <View style={styles.infoSection}>
      <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>{title}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
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
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  groupName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  groupDescription: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  groupMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
  },
  actionsContainer: {
    padding: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    gap: spacing.sm,
    ...premiumShadows.md,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: spacing.lg,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 2,
    marginRight: spacing.lg,
  },
  tabText: {
    fontSize: fontSize.md,
  },
  tabContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: fontSize.md,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: premiumBorderRadius.base,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  goalText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  scheduleText: {
    fontSize: fontSize.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
  },
  tagText: {
    fontSize: fontSize.sm,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  creatorBadge: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: fontSize.xs,
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discussionCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  discussionContent: {
    flex: 1,
  },
  discussionAuthor: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  discussionMessage: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  discussionTime: {
    fontSize: fontSize.xs,
  },
  addResourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...premiumShadows.md,
  },
  addResourceText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  resourceMeta: {
    fontSize: fontSize.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    marginTop: spacing.md,
    textAlign: 'center',
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
  modalInput: {
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.md,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
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
  modalText: {
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
});

