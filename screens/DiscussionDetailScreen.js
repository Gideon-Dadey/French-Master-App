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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { discussionsAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';

const { width } = Dimensions.get('window');

export default function DiscussionDetailScreen({ route, navigation }) {
  const { discussionId } = route.params;
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [discussion, setDiscussion] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    loadDiscussion();
  }, [discussionId]);

  const loadDiscussion = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const response = await discussionsAPI.getById(discussionId);
      setDiscussion(response.data.data);
    } catch (error) {
      console.error('Failed to load discussion:', error);
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
      navigation.navigate('Auth');
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
      navigation.navigate('Auth');
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
    return <LoadingSpinner />;
  }

  if (error || !discussion) {
    return <ErrorMessage message={error || 'Discussion not found'} onRetry={loadDiscussion} />;
  }

  const author = typeof discussion.author === 'object' ? discussion.author : null;
  const hasLiked = discussion.likes?.some(like => 
    (typeof like.user === 'object' ? like.user._id : like.user) === user?._id
  );
  const likeCount = discussion.likes?.length || 0;

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
        {/* Discussion Header */}
        <View style={[styles.discussionHeader, { backgroundColor: colors.card }]}>
          <View style={styles.discussionHeaderTop}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            {isAuthor() && (
              <TouchableOpacity>
                <Ionicons name="create-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>

          {discussion.isPinned && (
            <View style={[styles.pinnedBadge, { backgroundColor: premiumColors.accent.gold + '20' }]}>
              <Ionicons name="pin" size={16} color={premiumColors.accent.gold} />
              <Text style={[styles.pinnedText, { color: premiumColors.accent.gold }]}>Pinned</Text>
            </View>
          )}

          <Text style={[styles.discussionTitle, { color: colors.text }]}>
            {discussion.title}
          </Text>

          <View style={styles.discussionMeta}>
            <View style={[styles.avatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
              <Ionicons name="person" size={20} color={premiumColors.primary.main} />
            </View>
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {author?.name || 'Anonymous'}
              </Text>
              <Text style={[styles.discussionDate, { color: colors.secondaryText }]}>
                {formatTimeAgo(discussion.createdAt)}
                {discussion.isEdited && ' (edited)'}
              </Text>
            </View>
          </View>

          {/* Voting */}
          <View style={styles.votingContainer}>
            <TouchableOpacity
              style={[styles.voteButton, hasLiked && { backgroundColor: premiumColors.accent.rose + '20' }]}
              onPress={handleLike}
            >
              <Ionicons 
                name={hasLiked ? 'heart' : 'heart-outline'} 
                size={24} 
                color={hasLiked ? premiumColors.accent.rose : colors.secondaryText} 
              />
              <Text style={[styles.voteCount, { color: colors.text }]}>
                {likeCount}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Discussion Content */}
        <View style={[styles.contentCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.contentText, { color: colors.text }]}>
            {discussion.content}
          </Text>
          {discussion.tags?.length > 0 && (
            <View style={styles.tagsContainer}>
              {discussion.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.background }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Replies Section */}
        <View style={styles.repliesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {discussion.replies?.length || 0} {discussion.replies?.length === 1 ? 'Reply' : 'Replies'}
          </Text>

          {discussion.replies?.map((reply, index) => {
            const replyUser = typeof reply.user === 'object' ? reply.user : null;
            const replyHasLiked = reply.likes?.some(like => 
              (typeof like.user === 'object' ? like.user._id : like.user) === user?._id
            );
            const replyLikeCount = reply.likes?.length || 0;
            const isReplyAuthor = replyUser?._id === user._id || (typeof reply.user === 'string' && reply.user === user._id);

            return (
              <View key={reply._id || index} style={[styles.replyCard, { backgroundColor: colors.card }]}>
                <View style={styles.replyHeader}>
                  <View style={[styles.avatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
                    <Ionicons name="person" size={18} color={premiumColors.primary.main} />
                  </View>
                  <View style={styles.replyAuthorInfo}>
                    <Text style={[styles.replyAuthorName, { color: colors.text }]}>
                      {replyUser?.name || 'Anonymous'}
                    </Text>
                    <Text style={[styles.replyDate, { color: colors.secondaryText }]}>
                      {formatTimeAgo(reply.createdAt)}
                      {reply.isEdited && ' (edited)'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.replyContent, { color: colors.text }]}>
                  {reply.content}
                </Text>
                <View style={styles.replyFooter}>
                  <TouchableOpacity
                    style={[styles.replyLikeButton, replyHasLiked && { backgroundColor: premiumColors.accent.rose + '20' }]}
                    onPress={() => handleLikeReply(reply._id)}
                  >
                    <Ionicons 
                      name={replyHasLiked ? 'heart' : 'heart-outline'} 
                      size={18} 
                      color={replyHasLiked ? premiumColors.accent.rose : colors.secondaryText} 
                    />
                    <Text style={[styles.replyLikeCount, { color: colors.text }]}>
                      {replyLikeCount}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Reply Input */}
        {!discussion.isLocked && (
          <View style={[styles.replyInputContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.inputTitle, { color: colors.text }]}>Your Reply</Text>
            <TextInput
              style={[styles.replyInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Write your reply here..."
              placeholderTextColor={colors.secondaryText}
              value={replyContent}
              onChangeText={setReplyContent}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleSubmitReply}
            >
              <Text style={styles.submitButtonText}>Post Reply</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
    padding: spacing.lg,
  },
  discussionHeader: {
    padding: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    ...premiumShadows.md,
  },
  discussionHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
    marginBottom: spacing.sm,
    gap: spacing.xs / 2,
  },
  pinnedText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  discussionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  discussionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  discussionDate: {
    fontSize: fontSize.xs,
  },
  votingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs,
  },
  voteCount: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  contentCard: {
    padding: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    ...premiumShadows.sm,
  },
  contentText: {
    fontSize: fontSize.md,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
  },
  tagText: {
    fontSize: fontSize.xs,
  },
  repliesSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  replyCard: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    ...premiumShadows.sm,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  replyAuthorInfo: {
    flex: 1,
  },
  replyAuthorName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  replyDate: {
    fontSize: fontSize.xs,
  },
  replyContent: {
    fontSize: fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  replyFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  replyLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs / 2,
  },
  replyLikeCount: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  replyInputContainer: {
    padding: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    ...premiumShadows.md,
  },
  inputTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  replyInput: {
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  submitButton: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.base,
    alignItems: 'center',
    ...premiumShadows.sm,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

