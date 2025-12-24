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
import { questionsAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';

const { width } = Dimensions.get('window');

export default function QuestionDetailScreen({ route, navigation }) {
  const { questionId } = route.params;
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answerContent, setAnswerContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const response = await questionsAPI.getById(questionId);
      setQuestion(response.data.data);
    } catch (error) {
      console.error('Failed to load question:', error);
      setError('Failed to load question. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadQuestion();
  };

  const isAuthor = () => {
    if (!user || !question) return false;
    return question.author?._id === user._id || (typeof question.author === 'string' && question.author === user._id);
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to vote');
      navigation.navigate('Auth');
      return;
    }

    try {
      await questionsAPI.upvote(questionId);
      loadQuestion();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to upvote');
    }
  };

  const handleDownvote = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to vote');
      navigation.navigate('Auth');
      return;
    }

    try {
      await questionsAPI.downvote(questionId);
      loadQuestion();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to downvote');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerContent.trim()) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to answer questions');
      navigation.navigate('Auth');
      return;
    }

    try {
      await questionsAPI.addAnswer(questionId, answerContent);
      setAnswerContent('');
      loadQuestion();
      Alert.alert('Success', 'Your answer has been posted!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to post answer');
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!isAuthor()) {
      Alert.alert('Error', 'Only the question author can accept answers');
      return;
    }

    try {
      await questionsAPI.acceptAnswer(questionId, answerId);
      loadQuestion();
      Alert.alert('Success', 'Answer marked as accepted!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to accept answer');
    }
  };

  const handleUpvoteAnswer = async (answerId) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to vote');
      return;
    }

    try {
      await questionsAPI.upvoteAnswer(questionId, answerId);
      loadQuestion();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to upvote');
    }
  };

  const handleDownvoteAnswer = async (answerId) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to vote');
      return;
    }

    try {
      await questionsAPI.downvoteAnswer(questionId, answerId);
      loadQuestion();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to downvote');
    }
  };

  const handleAddComment = async () => {
    if (!commentContent.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to comment');
      return;
    }

    try {
      await questionsAPI.addComment(questionId, selectedAnswerId, commentContent);
      setCommentContent('');
      setShowCommentModal(false);
      setSelectedAnswerId(null);
      loadQuestion();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add comment');
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

  if (error || !question) {
    return <ErrorMessage message={error || 'Question not found'} onRetry={loadQuestion} />;
  }

  const author = typeof question.author === 'object' ? question.author : null;
  const voteScore = (question.upvotes?.length || 0) - (question.downvotes?.length || 0);
  const hasUpvoted = question.upvotes?.some(vote => 
    (typeof vote.user === 'object' ? vote.user._id : vote.user) === user?._id
  );
  const hasDownvoted = question.downvotes?.some(vote => 
    (typeof vote.user === 'object' ? vote.user._id : vote.user) === user?._id
  );

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
        {/* Question Header */}
        <View style={[styles.questionHeader, { backgroundColor: colors.card }]}>
          <View style={styles.questionHeaderTop}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            {isAuthor() && (
              <TouchableOpacity>
                <Ionicons name="create-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.questionTitle, { color: colors.text }]}>
            {question.title}
          </Text>

          <View style={styles.questionMeta}>
            <View style={[styles.avatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
              <Ionicons name="person" size={20} color={premiumColors.primary.main} />
            </View>
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {author?.name || 'Anonymous'}
              </Text>
              <Text style={[styles.questionDate, { color: colors.secondaryText }]}>
                {formatTimeAgo(question.createdAt)}
              </Text>
            </View>
          </View>

          {/* Voting */}
          <View style={styles.votingContainer}>
            <TouchableOpacity
              style={[styles.voteButton, hasUpvoted && { backgroundColor: premiumColors.accent.emerald + '20' }]}
              onPress={handleUpvote}
            >
              <Ionicons 
                name="chevron-up" 
                size={24} 
                color={hasUpvoted ? premiumColors.accent.emerald : colors.secondaryText} 
              />
            </TouchableOpacity>
            <Text style={[styles.voteScore, { color: colors.text }]}>
              {voteScore}
            </Text>
            <TouchableOpacity
              style={[styles.voteButton, hasDownvoted && { backgroundColor: premiumColors.accent.rose + '20' }]}
              onPress={handleDownvote}
            >
              <Ionicons 
                name="chevron-down" 
                size={24} 
                color={hasDownvoted ? premiumColors.accent.rose : colors.secondaryText} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Question Content */}
        <View style={[styles.contentCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.contentText, { color: colors.text }]}>
            {question.content}
          </Text>
          {question.tags?.length > 0 && (
            <View style={styles.tagsContainer}>
              {question.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.background }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Answers Section */}
        <View style={styles.answersSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {question.answers?.length || 0} {question.answers?.length === 1 ? 'Answer' : 'Answers'}
          </Text>

          {question.answers?.map((answer, index) => {
            const answerUser = typeof answer.user === 'object' ? answer.user : null;
            const answerVoteScore = (answer.upvotes?.length || 0) - (answer.downvotes?.length || 0);
            const answerHasUpvoted = answer.upvotes?.some(vote => 
              (typeof vote.user === 'object' ? vote.user._id : vote.user) === user?._id
            );
            const answerHasDownvoted = answer.downvotes?.some(vote => 
              (typeof vote.user === 'object' ? vote.user._id : vote.user) === user?._id
            );

            return (
              <View key={answer._id || index} style={[styles.answerCard, { backgroundColor: colors.card }]}>
                {answer.isAccepted && (
                  <View style={[styles.acceptedBadge, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
                    <Ionicons name="checkmark-circle" size={16} color={premiumColors.accent.emerald} />
                    <Text style={[styles.acceptedText, { color: premiumColors.accent.emerald }]}>
                      Accepted Answer
                    </Text>
                  </View>
                )}
                <View style={styles.answerHeader}>
                  <View style={[styles.avatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
                    <Ionicons name="person" size={18} color={premiumColors.primary.main} />
                  </View>
                  <View style={styles.answerAuthorInfo}>
                    <Text style={[styles.answerAuthorName, { color: colors.text }]}>
                      {answerUser?.name || 'Anonymous'}
                    </Text>
                    <Text style={[styles.answerDate, { color: colors.secondaryText }]}>
                      {formatTimeAgo(answer.createdAt)}
                    </Text>
                  </View>
                  {isAuthor() && !question.isSolved && (
                    <TouchableOpacity
                      style={[styles.acceptButton, { backgroundColor: premiumColors.accent.emerald + '20' }]}
                      onPress={() => handleAcceptAnswer(answer._id)}
                    >
                      <Ionicons name="checkmark" size={16} color={premiumColors.accent.emerald} />
                      <Text style={[styles.acceptButtonText, { color: premiumColors.accent.emerald }]}>
                        Accept
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.answerContent, { color: colors.text }]}>
                  {answer.content}
                </Text>
                <View style={styles.answerFooter}>
                  <View style={styles.answerVoting}>
                    <TouchableOpacity
                      style={[styles.answerVoteButton, answerHasUpvoted && { backgroundColor: premiumColors.accent.emerald + '20' }]}
                      onPress={() => handleUpvoteAnswer(answer._id)}
                    >
                      <Ionicons 
                        name="chevron-up" 
                        size={18} 
                        color={answerHasUpvoted ? premiumColors.accent.emerald : colors.secondaryText} 
                      />
                    </TouchableOpacity>
                    <Text style={[styles.answerVoteScore, { color: colors.text }]}>
                      {answerVoteScore}
                    </Text>
                    <TouchableOpacity
                      style={[styles.answerVoteButton, answerHasDownvoted && { backgroundColor: premiumColors.accent.rose + '20' }]}
                      onPress={() => handleDownvoteAnswer(answer._id)}
                    >
                      <Ionicons 
                        name="chevron-down" 
                        size={18} 
                        color={answerHasDownvoted ? premiumColors.accent.rose : colors.secondaryText} 
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.commentButton}
                    onPress={() => {
                      setSelectedAnswerId(answer._id);
                      setShowCommentModal(true);
                    }}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color={colors.secondaryText} />
                    <Text style={[styles.commentButtonText, { color: colors.secondaryText }]}>
                      Comment ({answer.comments?.length || 0})
                    </Text>
                  </TouchableOpacity>
                </View>
                {answer.comments?.length > 0 && (
                  <View style={styles.commentsContainer}>
                    {answer.comments.map((comment, commentIndex) => {
                      const commentUser = typeof comment.user === 'object' ? comment.user : null;
                      return (
                        <View key={commentIndex} style={[styles.commentItem, { backgroundColor: colors.background }]}>
                          <Text style={[styles.commentAuthor, { color: colors.text }]}>
                            {commentUser?.name || 'Anonymous'}:
                          </Text>
                          <Text style={[styles.commentContent, { color: colors.secondaryText }]}>
                            {comment.content}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Answer Input */}
        {!question.isLocked && (
          <View style={[styles.answerInputContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.inputTitle, { color: colors.text }]}>Your Answer</Text>
            <TextInput
              style={[styles.answerInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Write your answer here..."
              placeholderTextColor={colors.secondaryText}
              value={answerContent}
              onChangeText={setAnswerContent}
              multiline
              numberOfLines={6}
            />
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleSubmitAnswer}
            >
              <Text style={styles.submitButtonText}>Post Answer</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCommentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Comment</Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Write a comment..."
              placeholderTextColor={colors.secondaryText}
              value={commentContent}
              onChangeText={setCommentContent}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleAddComment}
            >
              <Text style={styles.modalButtonText}>Post Comment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  questionHeader: {
    padding: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    ...premiumShadows.md,
  },
  questionHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  questionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  questionMeta: {
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
  questionDate: {
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
    padding: spacing.xs,
    borderRadius: premiumBorderRadius.base,
  },
  voteScore: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
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
  answersSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  answerCard: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
    ...premiumShadows.sm,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: premiumBorderRadius.base,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  acceptedText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  answerAuthorInfo: {
    flex: 1,
  },
  answerAuthorName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  answerDate: {
    fontSize: fontSize.xs,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs,
  },
  acceptButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  answerContent: {
    fontSize: fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  answerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  answerVoting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  answerVoteButton: {
    padding: spacing.xs / 2,
    borderRadius: premiumBorderRadius.base,
  },
  answerVoteScore: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  commentButtonText: {
    fontSize: fontSize.xs,
  },
  commentsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  commentItem: {
    padding: spacing.sm,
    borderRadius: premiumBorderRadius.base,
    marginBottom: spacing.xs,
  },
  commentAuthor: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  commentContent: {
    fontSize: fontSize.sm,
  },
  answerInputContainer: {
    padding: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    ...premiumShadows.md,
  },
  inputTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  answerInput: {
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 120,
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
    minHeight: 100,
    textAlignVertical: 'top',
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
});

