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
  Modal,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { questionsAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';

const { width, height } = Dimensions.get('window');

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

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadQuestion();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const response = await questionsAPI.getById(questionId);
      setQuestion(response.data.data);
    } catch (error) {
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
    return <LoadingSpinner message="Loading question..." />;
  }

  if (error || !question) {
    return <ErrorMessage message={error || 'Question not found'} onRetry={loadQuestion} />;
  }

  const author = typeof question.author === 'object' ? question.author : null;
  const voteScore = (question.upvotes?.length || 0) - (question.downvotes?.length || 0);
  const hasUpvoted = question.upvotes?.some((vote) => (typeof vote.user === 'object' ? vote.user._id : vote.user) === user?._id);
  const hasDownvoted = question.downvotes?.some((vote) => (typeof vote.user === 'object' ? vote.user._id : vote.user) === user?._id);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
        <LinearGradient colors={['#8B5CF6', '#6366F1', '#4F46E5']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerLabel}>QUESTION</Text>
              <Text style={styles.headerTitle} numberOfLines={1}>Q&A Discussion</Text>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Card */}
        <View style={[styles.questionCard, { backgroundColor: colors.card }]}>
          {/* Status Badge */}
          <View style={styles.statusRow}>
            {question.isSolved ? (
              <View style={[styles.statusBadge, { backgroundColor: '#10B981' + '20' }]}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={[styles.statusText, { color: '#10B981' }]}>Solved</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: '#F59E0B' + '20' }]}>
                <Ionicons name="help-circle" size={16} color="#F59E0B" />
                <Text style={[styles.statusText, { color: '#F59E0B' }]}>Open</Text>
              </View>
            )}
            <Text style={[styles.answersCount, { color: colors.secondaryText }]}>
              {question.answers?.length || 0} answers
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.questionTitle, { color: colors.text }]}>{question.title}</Text>

          {/* Content */}
          <Text style={[styles.questionContent, { color: colors.text }]}>{question.content}</Text>

          {/* Tags */}
          {question.tags?.length > 0 && (
            <View style={styles.tagsRow}>
              {question.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Author & Meta */}
          <View style={styles.authorSection}>
            <View style={styles.authorRow}>
              <View style={[styles.avatar, { backgroundColor: '#8B5CF6' }]}>
                {author?.avatar ? (
                  <Image source={{ uri: author.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{author?.name?.charAt(0) || '?'}</Text>
                )}
              </View>
              <View style={styles.authorInfo}>
                <Text style={[styles.authorName, { color: colors.text }]}>{author?.name || 'Anonymous'}</Text>
                <Text style={[styles.authorDate, { color: colors.secondaryText }]}>
                  Asked {formatTimeAgo(question.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Voting Row */}
          <View style={styles.votingRow}>
            <View style={styles.voteButtons}>
              <TouchableOpacity
                style={[styles.voteBtn, hasUpvoted && styles.voteBtnActive, hasUpvoted && { backgroundColor: '#10B981' + '20' }]}
                onPress={handleUpvote}
              >
                <Ionicons name="arrow-up" size={20} color={hasUpvoted ? '#10B981' : colors.secondaryText} />
              </TouchableOpacity>
              <Text style={[styles.voteScore, { color: colors.text }]}>{voteScore}</Text>
              <TouchableOpacity
                style={[styles.voteBtn, hasDownvoted && styles.voteBtnActive, hasDownvoted && { backgroundColor: '#EF4444' + '20' }]}
                onPress={handleDownvote}
              >
                <Ionicons name="arrow-down" size={20} color={hasDownvoted ? '#EF4444' : colors.secondaryText} />
              </TouchableOpacity>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="bookmark-outline" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="share-outline" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Answers Section */}
        <View style={styles.answersSection}>
          <View style={styles.answersSectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {question.answers?.length || 0} {question.answers?.length === 1 ? 'Answer' : 'Answers'}
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

          {question.answers?.map((answer, index) => {
            const answerUser = typeof answer.user === 'object' ? answer.user : null;
            const answerVoteScore = (answer.upvotes?.length || 0) - (answer.downvotes?.length || 0);
            const answerHasUpvoted = answer.upvotes?.some((vote) => (typeof vote.user === 'object' ? vote.user._id : vote.user) === user?._id);
            const answerHasDownvoted = answer.downvotes?.some((vote) => (typeof vote.user === 'object' ? vote.user._id : vote.user) === user?._id);

            return (
              <View key={answer._id || index} style={[styles.answerCard, { backgroundColor: colors.card }]}>
                {/* Accepted Badge */}
                {answer.isAccepted && (
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.acceptedBanner}>
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.acceptedBannerText}>Accepted Answer</Text>
                  </LinearGradient>
                )}

                {/* Answer Author */}
                <View style={styles.answerAuthorRow}>
                  <View style={[styles.answerAvatar, { backgroundColor: '#3B82F6' }]}>
                    {answerUser?.avatar ? (
                      <Image source={{ uri: answerUser.avatar }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarText}>{answerUser?.name?.charAt(0) || '?'}</Text>
                    )}
                  </View>
                  <View style={styles.answerAuthorInfo}>
                    <Text style={[styles.answerAuthorName, { color: colors.text }]}>{answerUser?.name || 'Anonymous'}</Text>
                    <Text style={[styles.answerAuthorDate, { color: colors.secondaryText }]}>
                      {formatTimeAgo(answer.createdAt)}
                    </Text>
                  </View>
                  {isAuthor() && !question.isSolved && (
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptAnswer(answer._id)}>
                      <LinearGradient colors={['#10B981', '#059669']} style={styles.acceptBtnGradient}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        <Text style={styles.acceptBtnText}>Accept</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Answer Content */}
                <Text style={[styles.answerContent, { color: colors.text }]}>{answer.content}</Text>

                {/* Answer Actions */}
                <View style={styles.answerActions}>
                  <View style={styles.answerVoteButtons}>
                    <TouchableOpacity
                      style={[styles.answerVoteBtn, answerHasUpvoted && { backgroundColor: '#10B981' + '20' }]}
                      onPress={() => handleUpvoteAnswer(answer._id)}
                    >
                      <Ionicons name="arrow-up" size={18} color={answerHasUpvoted ? '#10B981' : colors.secondaryText} />
                    </TouchableOpacity>
                    <Text style={[styles.answerVoteScore, { color: colors.text }]}>{answerVoteScore}</Text>
                    <TouchableOpacity
                      style={[styles.answerVoteBtn, answerHasDownvoted && { backgroundColor: '#EF4444' + '20' }]}
                      onPress={() => handleDownvoteAnswer(answer._id)}
                    >
                      <Ionicons name="arrow-down" size={18} color={answerHasDownvoted ? '#EF4444' : colors.secondaryText} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.commentBtn}
                    onPress={() => {
                      setSelectedAnswerId(answer._id);
                      setShowCommentModal(true);
                    }}
                  >
                    <Ionicons name="chatbubble-outline" size={18} color={colors.secondaryText} />
                    <Text style={[styles.commentBtnText, { color: colors.secondaryText }]}>
                      {answer.comments?.length || 0}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Comments */}
                {answer.comments?.length > 0 && (
                  <View style={styles.commentsContainer}>
                    {answer.comments.map((comment, cIdx) => {
                      const commentUser = typeof comment.user === 'object' ? comment.user : null;
                      return (
                        <View key={cIdx} style={[styles.commentItem, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
                          <Text style={[styles.commentAuthor, { color: colors.text }]}>
                            {commentUser?.name || 'Anonymous'}
                          </Text>
                          <Text style={[styles.commentText, { color: colors.secondaryText }]}>{comment.content}</Text>
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
          <View style={[styles.answerInputCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.answerInputTitle, { color: colors.text }]}>Your Answer</Text>
            <TextInput
              style={[styles.answerInput, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', color: colors.text }]}
              placeholder="Share your knowledge and help solve this question..."
              placeholderTextColor={colors.secondaryText}
              value={answerContent}
              onChangeText={setAnswerContent}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitAnswer}>
              <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.submitBtnGradient}>
                <Ionicons name="send" size={18} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Post Answer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Comment Modal */}
      <Modal visible={showCommentModal} transparent animationType="slide" onRequestClose={() => setShowCommentModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Comment</Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.modalInput, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', color: colors.text }]}
              placeholder="Write a helpful comment..."
              placeholderTextColor={colors.secondaryText}
              value={commentContent}
              onChangeText={setCommentContent}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.modalBtn} onPress={handleAddComment}>
              <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.modalBtnGradient}>
                <Text style={styles.modalBtnText}>Post Comment</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  questionCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  answersCount: {
    fontSize: 13,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
    lineHeight: 30,
  },
  questionContent: {
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
  votingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  voteButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  voteBtnActive: {},
  voteScore: {
    fontSize: 18,
    fontWeight: '800',
    minWidth: 36,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  answersSection: {},
  answersSectionHeader: {
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
  answerCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  acceptedBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  answerAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 0,
  },
  answerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  answerAuthorInfo: {
    flex: 1,
  },
  answerAuthorName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  answerAuthorDate: {
    fontSize: 11,
  },
  acceptBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  acceptBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  acceptBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  answerContent: {
    fontSize: 15,
    lineHeight: 24,
    padding: 16,
  },
  answerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answerVoteButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  answerVoteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  answerVoteScore: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
  },
  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  commentBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  commentsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  commentItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 20,
  },
  answerInputCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  answerInputTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  answerInput: {
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    minHeight: 120,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalInput: {
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 14,
  },
  modalBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalBtnGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
