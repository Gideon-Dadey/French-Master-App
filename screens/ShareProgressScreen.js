import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { progressShareAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';

const { width } = Dimensions.get('window');

export default function ShareProgressScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shares, setShares] = useState([]);
  const [selectedSort, setSelectedSort] = useState('recent');
  const [selectedType, setSelectedType] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedShareId, setSelectedShareId] = useState(null);
  const [commentContent, setCommentContent] = useState('');

  const sortOptions = [
    { id: 'recent', name: 'Recent', icon: 'time-outline' },
    { id: 'popular', name: 'Popular', icon: 'flame-outline' },
    { id: 'trending', name: 'Trending', icon: 'trending-up-outline' },
  ];

  const typeFilters = [
    { id: null, name: 'All', icon: 'grid-outline' },
    { id: 'course-completed', name: 'Courses', icon: 'book-outline' },
    { id: 'achievement', name: 'Achievements', icon: 'trophy-outline' },
    { id: 'milestone', name: 'Milestones', icon: 'flag-outline' },
    { id: 'streak', name: 'Streaks', icon: 'flame-outline' },
    { id: 'certificate', name: 'Certificates', icon: 'ribbon-outline' },
  ];

  useEffect(() => {
    loadShares();
  }, [selectedSort, selectedType]);

  const loadShares = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      const params = {
        type: selectedType || undefined,
        sort: selectedSort,
        limit: 20,
        page: 1,
      };

      Object.keys(params).forEach(key =>
        params[key] === null || params[key] === undefined ? delete params[key] : {}
      );

      const response = await progressShareAPI.getAll(params);
      setShares(response.data.data || []);
    } catch (error) {
      console.error('Failed to load progress shares:', error);
      setError('Failed to load progress shares. Please check your connection.');
      setShares([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSort, selectedType, refreshing]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadShares();
  }, [loadShares]);

  const handleLike = async (shareId) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to like posts');
      navigation.navigate('Auth');
      return;
    }

    try {
      await progressShareAPI.like(shareId);
      loadShares();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to like post');
    }
  };

  const handleComment = (shareId) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to comment');
      navigation.navigate('Auth');
      return;
    }
    setSelectedShareId(shareId);
    setShowCommentModal(true);
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      await progressShareAPI.addComment(selectedShareId, commentContent);
      setCommentContent('');
      setShowCommentModal(false);
      setSelectedShareId(null);
      loadShares();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleCreateShare = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to share your progress', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }
    navigation.navigate('CreateProgressShare');
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

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
            <View>
              <Text style={[styles.title, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
                Share Progress
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Celebrate your achievements
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleCreateShare}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {typeFilters.map((filter) => (
          <TouchableOpacity
            key={filter.id || 'all'}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedType === filter.id
                  ? premiumColors.primary.main
                  : colors.card,
                borderColor: selectedType === filter.id
                  ? premiumColors.primary.main
                  : colors.border,
              },
              premiumShadows.sm,
            ]}
            onPress={() => setSelectedType(filter.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={filter.icon}
              size={16}
              color={selectedType === filter.id ? '#FFFFFF' : colors.text}
            />
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedType === filter.id ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {filter.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortContainer}
        contentContainerStyle={styles.sortContent}
      >
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.sortChip,
              {
                backgroundColor: selectedSort === option.id
                  ? premiumColors.primary.main
                  : colors.card,
                borderColor: selectedSort === option.id
                  ? premiumColors.primary.main
                  : colors.border,
              },
            ]}
            onPress={() => setSelectedSort(option.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={option.icon}
              size={14}
              color={selectedSort === option.id ? '#FFFFFF' : colors.text}
            />
            <Text
              style={[
                styles.sortText,
                {
                  color: selectedSort === option.id ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error && !loading ? (
        <ErrorMessage message={error} onRetry={loadShares} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        >
          {shares.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="share-social-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No progress shared yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                Be the first to share your learning progress!
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: premiumColors.primary.main }]}
                onPress={handleCreateShare}
              >
                <Text style={styles.emptyButtonText}>Share Progress</Text>
              </TouchableOpacity>
            </View>
          ) : (
            shares.map((share) => (
              <ProgressShareCard
                key={share._id}
                share={share}
                colors={colors}
                onPress={() => navigation.navigate('ProgressShareDetail', { shareId: share._id })}
                onLike={() => handleLike(share._id)}
                onComment={() => handleComment(share._id)}
                formatTimeAgo={formatTimeAgo}
                isAuthenticated={isAuthenticated}
                currentUserId={user?._id}
              />
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

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
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleSubmitComment}
            >
              <Text style={styles.modalButtonText}>Post Comment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ProgressShareCard({ share, colors, onPress, onLike, onComment, formatTimeAgo, isAuthenticated, currentUserId }) {
  const shareUser = typeof share.user === 'object' ? share.user : null;
  const hasLiked = share.likes?.some(like =>
    (typeof like.user === 'object' ? like.user._id : like.user) === currentUserId
  );
  const likeCount = share.likes?.length || 0;
  const commentCount = share.comments?.length || 0;

  const getTypeIcon = () => {
    switch (share.type) {
      case 'course-completed':
        return 'checkmark-circle';
      case 'achievement':
        return 'trophy';
      case 'milestone':
        return 'flag';
      case 'streak':
        return 'flame';
      case 'certificate':
        return 'ribbon';
      default:
        return 'star';
    }
  };

  const getTypeColor = () => {
    switch (share.type) {
      case 'course-completed':
        return premiumColors.accent.emerald;
      case 'achievement':
        return premiumColors.accent.gold;
      case 'milestone':
        return premiumColors.primary.main;
      case 'streak':
        return premiumColors.accent.rose;
      case 'certificate':
        return premiumColors.accent.sky;
      default:
        return premiumColors.primary.main;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.shareCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.shareHeader}>
        <View style={[styles.typeIcon, { backgroundColor: getTypeColor() + '20' }]}>
          <Ionicons name={getTypeIcon()} size={24} color={getTypeColor()} />
        </View>
        <View style={styles.shareUserInfo}>
          <Text style={[styles.shareUserName, { color: colors.text }]}>
            {shareUser?.name || 'Anonymous'}
          </Text>
          <Text style={[styles.shareTime, { color: colors.secondaryText }]}>
            {formatTimeAgo(share.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={[styles.shareTitle, { color: colors.text }]}>
        {share.title}
      </Text>

      {share.description && (
        <Text style={[styles.shareDescription, { color: colors.secondaryText }]} numberOfLines={3}>
          {share.description}
        </Text>
      )}

      {share.stats && (
        <View style={styles.statsContainer}>
          {share.stats.level && (
            <View style={[styles.statBadge, { backgroundColor: colors.background }]}>
              <Ionicons name="star" size={14} color={premiumColors.accent.gold} />
              <Text style={[styles.statText, { color: colors.text }]}>
                Level {share.stats.level}
              </Text>
            </View>
          )}
          {share.stats.currentStreak && (
            <View style={[styles.statBadge, { backgroundColor: colors.background }]}>
              <Ionicons name="flame" size={14} color={premiumColors.accent.rose} />
              <Text style={[styles.statText, { color: colors.text }]}>
                {share.stats.currentStreak} day streak
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.shareFooter}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={(e) => {
            e.stopPropagation();
            onLike();
          }}
        >
          <Ionicons
            name={hasLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={hasLiked ? premiumColors.accent.rose : colors.secondaryText}
          />
          <Text style={[styles.footerButtonText, { color: hasLiked ? premiumColors.accent.rose : colors.secondaryText }]}>
            {likeCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={(e) => {
            e.stopPropagation();
            onComment();
          }}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.secondaryText} />
          <Text style={[styles.footerButtonText, { color: colors.secondaryText }]}>
            {commentCount}
          </Text>
        </TouchableOpacity>
        <View style={styles.footerButton}>
          <Ionicons name="eye-outline" size={20} color={colors.secondaryText} />
          <Text style={[styles.footerButtonText, { color: colors.secondaryText }]}>
            {share.views || 0}
          </Text>
        </View>
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
  sortContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sortContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
    gap: spacing.xs / 2,
  },
  sortText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
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
  shareCard: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareUserInfo: {
    flex: 1,
  },
  shareUserName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  shareTime: {
    fontSize: fontSize.xs,
  },
  shareTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  shareDescription: {
    fontSize: fontSize.md,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs / 2,
  },
  statText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  shareFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    padding: spacing.xs,
  },
  footerButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
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

