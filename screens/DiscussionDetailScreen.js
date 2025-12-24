import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { discussionsAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';

const { width, height } = Dimensions.get('window');

export default function DiscussionDetailScreen({ route, navigation }) {
  const { discussionId } = route.params;
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [discussion, setDiscussion] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDiscussion();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [discussionId]);

  const loadDiscussion = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const response = await discussionsAPI.getById(discussionId);
      setDiscussion(response.data.data);
    } catch (error) {
      setError('Failed to load discussion. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDiscussion();
  };

  const isAuthor = () => {
    if (!user || !discussion) return false;
    return discussion.author?._id === user._id || (typeof discussion.author === 'string' && discussion.author === user._id);
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to like discussions');
      return;
    }
    try {
      await discussionsAPI.like(discussionId);
      loadDiscussion();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to like discussion');
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      Alert.alert('Error', 'Please enter a reply');
      return;
    }
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to reply');
      return;
    }
    try {
      await discussionsAPI.addReply(discussionId, replyContent);
      setReplyContent('');
      loadDiscussion();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to post reply');
    }
  };

  const handleLikeReply = async (replyId) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to like replies');
      return;
    }
    try {
      await discussionsAPI.likeReply(discussionId, replyId);
      loadDiscussion();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to like reply');
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Loading discussion..." />;
  }

  if (error || !discussion) {
    return <ErrorMessage message={error || 'Discussion not found'} onRetry={loadDiscussion} />;
  }

  const author = typeof discussion.author === 'object' ? discussion.author : null;
  const hasLiked = discussion.likes?.some((like) => (typeof like.user === 'object' ? like.user._id : like.user) === user?._id);
  const likeCount = discussion.likes?.length || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
        <LinearGradient colors={['#10B981', '#059669', '#047857']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerLabel}>DISCUSSION</Text>
              <Text style={styles.headerTitle} numberOfLines={1}>Community Thread</Text>
            </View>
            <View style={styles.headerRight}>
              {isAuthor() && (
                <TouchableOpacity style={styles.editBtn}>
                  <Ionicons name="create-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Discussion Card */}
          <View style={[styles.discussionCard, { backgroundColor: colors.card }]}>
            {/* Pinned Badge */}
            {discussion.isPinned && (
              <View style={styles.pinnedBadge}>
                <Ionicons name="pin" size={14} color="#F59E0B" />
                <Text style={styles.pinnedText}>Pinned</Text>
              </View>
            )}

            {/* Title */}
            <Text style={[styles.discussionTitle, { color: colors.text }]}>{discussion.title}</Text>

            {/* Content */}
            <Text style={[styles.discussionContent, { color: colors.text }]}>{discussion.content}</Text>

            {/* Tags */}
            {discussion.tags?.length > 0 && (
              <View style={styles.tagsRow}>
                {discussion.tags.map((tag, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                    <Text style={[styles.tagText, { color: colors.text }]}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Author & Meta */}
            <View style={styles.authorSection}>
              <View style={styles.authorRow}>
                <View style={[styles.avatar, { backgroundColor: '#10B981' }]}>
                  {author?.avatar ? (
                    <Image source={{ uri: author.avatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{author?.name?.charAt(0) || '?'}</Text>
                  )}
                </View>
                <View style={styles.authorInfo}>
                  <Text style={[styles.authorName, { color: colors.text }]}>{author?.name || 'Anonymous'}</Text>
                  <Text style={[styles.authorDate, { color: colors.secondaryText }]}>
                    Posted {formatTimeAgo(discussion.createdAt)}
                    {discussion.isEdited && ' • Edited'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions Row */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.actionBtn, hasLiked && styles.actionBtnActive]} onPress={handleLike}>
                <Ionicons name={hasLiked ? 'heart' : 'heart-outline'} size={22} color={hasLiked ? '#EF4444' : colors.secondaryText} />
                <Text style={[styles.actionText, { color: hasLiked ? '#EF4444' : colors.secondaryText }]}>{likeCount}</Text>
              </TouchableOpacity>
              <View style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={22} color={colors.secondaryText} />
                <Text style={[styles.actionText, { color: colors.secondaryText }]}>{discussion.replies?.length || 0}</Text>
              </View>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="share-outline" size={22} color={colors.secondaryText} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="bookmark-outline" size={22} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Replies Section */}
          <View style={styles.repliesSection}>
            <View style={styles.repliesSectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {discussion.replies?.length || 0} {discussion.replies?.length === 1 ? 'Reply' : 'Replies'}
              </Text>
              <View style={styles.sortButtons}>
                <TouchableOpacity style={[styles.sortBtn, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                  <Text style={[styles.sortBtnText, { color: colors.text }]}>Top</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortBtn}>
                  <Text style={[styles.sortBtnText, { color: colors.secondaryText }]}>Recent</Text>
                </TouchableOpacity>
              </View>
            </View>

            {discussion.replies?.map((reply, index) => {
              const replyUser = typeof reply.user === 'object' ? reply.user : null;
              const replyHasLiked = reply.likes?.some((like) => (typeof like.user === 'object' ? like.user._id : like.user) === user?._id);
              const replyLikeCount = reply.likes?.length || 0;

              return (
                <View key={reply._id || index} style={[styles.replyCard, { backgroundColor: colors.card }]}>
                  {/* Reply Author */}
                  <View style={styles.replyAuthorRow}>
                    <View style={[styles.replyAvatar, { backgroundColor: '#3B82F6' }]}>
                      {replyUser?.avatar ? (
                        <Image source={{ uri: replyUser.avatar }} style={styles.avatarImage} />
                      ) : (
                        <Text style={styles.avatarText}>{replyUser?.name?.charAt(0) || '?'}</Text>
                      )}
                    </View>
                    <View style={styles.replyAuthorInfo}>
                      <Text style={[styles.replyAuthorName, { color: colors.text }]}>{replyUser?.name || 'Anonymous'}</Text>
                      <Text style={[styles.replyAuthorDate, { color: colors.secondaryText }]}>
                        {formatTimeAgo(reply.createdAt)}
                        {reply.isEdited && ' • Edited'}
                      </Text>
                    </View>
                  </View>

                  {/* Reply Content */}
                  <Text style={[styles.replyContent, { color: colors.text }]}>{reply.content}</Text>

                  {/* Reply Actions */}
                  <View style={styles.replyActions}>
                    <TouchableOpacity
                      style={[styles.replyActionBtn, replyHasLiked && styles.replyActionBtnActive]}
                      onPress={() => handleLikeReply(reply._id)}
                    >
                      <Ionicons name={replyHasLiked ? 'heart' : 'heart-outline'} size={18} color={replyHasLiked ? '#EF4444' : colors.secondaryText} />
                      <Text style={[styles.replyActionText, { color: replyHasLiked ? '#EF4444' : colors.secondaryText }]}>{replyLikeCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.replyActionBtn}>
                      <Ionicons name="chatbubble-outline" size={18} color={colors.secondaryText} />
                      <Text style={[styles.replyActionText, { color: colors.secondaryText }]}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Reply Input */}
          {!discussion.isLocked && (
            <View style={[styles.replyInputCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.replyInputTitle, { color: colors.text }]}>Join the Discussion</Text>
              <TextInput
                style={[styles.replyInput, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', color: colors.text }]}
                placeholder="Share your thoughts..."
                placeholderTextColor={colors.secondaryText}
                value={replyContent}
                onChangeText={setReplyContent}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReply}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.submitBtnGradient}>
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Post Reply</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {discussion.isLocked && (
            <View style={[styles.lockedCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FEF3C7' }]}>
              <Ionicons name="lock-closed" size={24} color="#F59E0B" />
              <View style={styles.lockedInfo}>
                <Text style={[styles.lockedTitle, { color: colors.text }]}>Discussion Locked</Text>
                <Text style={[styles.lockedText, { color: colors.secondaryText }]}>This discussion has been locked by a moderator.</Text>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 14,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
  },
  editBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  discussionCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
    gap: 6,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  discussionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
    lineHeight: 30,
  },
  discussionContent: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  authorSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  authorInfo: {},
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  authorDate: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnActive: {},
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  repliesSection: {},
  repliesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  replyCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  replyAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  replyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  replyAuthorInfo: {
    flex: 1,
  },
  replyAuthorName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  replyAuthorDate: {
    fontSize: 11,
  },
  replyContent: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  replyActions: {
    flexDirection: 'row',
    gap: 16,
  },
  replyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    gap: 6,
  },
  replyActionBtnActive: {},
  replyActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  replyInputCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  replyInputTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  replyInput: {
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 14,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    gap: 14,
  },
  lockedInfo: {},
  lockedTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  lockedText: {
    fontSize: 13,
  },
});
