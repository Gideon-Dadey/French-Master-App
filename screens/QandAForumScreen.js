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
  Alert,
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

export default function QandAForumScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSort, setSelectedSort] = useState('recent');

  const categories = [
    { id: null, name: 'All', icon: 'grid-outline', color: premiumColors.primary.main },
    { id: 'grammar', name: 'Grammar', icon: 'school-outline', color: premiumColors.accent.emerald },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'book-outline', color: premiumColors.accent.gold },
    { id: 'pronunciation', name: 'Pronunciation', icon: 'mic-outline', color: premiumColors.accent.rose },
    { id: 'culture', name: 'Culture', icon: 'globe-outline', color: premiumColors.accent.sky },
    { id: 'exam-prep', name: 'Exam Prep', icon: 'document-text-outline', color: premiumColors.primary.main },
    { id: 'general', name: 'General', icon: 'chatbubbles-outline', color: premiumColors.accent.emerald },
  ];

  const sortOptions = [
    { id: 'recent', name: 'Recent', icon: 'time-outline' },
    { id: 'popular', name: 'Popular', icon: 'flame-outline' },
    { id: 'unanswered', name: 'Unanswered', icon: 'help-circle-outline' },
    { id: 'solved', name: 'Solved', icon: 'checkmark-circle-outline' },
    { id: 'trending', name: 'Trending', icon: 'trending-up-outline' },
  ];

  useEffect(() => {
    loadQuestions();
  }, [selectedCategory, selectedSort]);

  const loadQuestions = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      
      const params = {
        category: selectedCategory || undefined,
        sort: selectedSort,
        search: searchQuery || undefined,
        limit: 20,
        page: 1,
      };

      Object.keys(params).forEach(key => 
        params[key] === null || params[key] === undefined ? delete params[key] : {}
      );

      const response = await questionsAPI.getAll(params);
      setQuestions(response.data.data || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
      setError('Failed to load questions. Please check your connection.');
      setQuestions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedSort, searchQuery, refreshing]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadQuestions();
  }, [loadQuestions]);

  const handleCreateQuestion = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to ask a question', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }
    navigation.navigate('CreateQuestion');
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
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    return 'Long ago';
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#424242'} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.title, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
                Q&A Forum
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Ask questions, get answers
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleCreateQuestion}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)' }]}>
            <Ionicons name="search" size={20} color={isDarkMode ? '#FFFFFF' : '#424242'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: isDarkMode ? '#FFFFFF' : '#000' }]}
              placeholder="Search questions..."
              placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.6)' : '#9E9E9E'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={loadQuestions}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); loadQuestions(); }}>
                <Ionicons name="close-circle" size={20} color={isDarkMode ? '#FFFFFF' : '#424242'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Categories Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id || 'all'}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === category.id
                  ? category.color
                  : colors.card,
                borderColor: selectedCategory === category.id
                  ? category.color
                  : colors.border,
              },
              premiumShadows.sm,
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={category.icon}
              size={16}
              color={selectedCategory === category.id ? '#FFFFFF' : colors.text}
            />
            <Text
              style={[
                styles.categoryText,
                {
                  color: selectedCategory === category.id ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
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

      {/* Content */}
      {error && !loading ? (
        <ErrorMessage message={error} onRetry={loadQuestions} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        >
          {questions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="help-circle-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No questions found
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                Be the first to ask a question!
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: premiumColors.primary.main }]}
                onPress={handleCreateQuestion}
              >
                <Text style={styles.emptyButtonText}>Ask Question</Text>
              </TouchableOpacity>
            </View>
          ) : (
            questions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                colors={colors}
                onPress={() => navigation.navigate('QuestionDetail', { questionId: question._id })}
                formatTimeAgo={formatTimeAgo}
              />
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

function QuestionCard({ question, colors, onPress, formatTimeAgo }) {
  const author = typeof question.author === 'object' ? question.author : null;
  const answerCount = question.answers?.length || 0;
  const voteScore = (question.upvotes?.length || 0) - (question.downvotes?.length || 0);
  const categoryColors = {
    grammar: premiumColors.accent.emerald,
    vocabulary: premiumColors.accent.gold,
    pronunciation: premiumColors.accent.rose,
    culture: premiumColors.accent.sky,
    'exam-prep': premiumColors.primary.main,
    general: premiumColors.primary.main,
  };

  return (
    <TouchableOpacity
      style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.questionHeader}>
        <View style={styles.questionLeft}>
          <View style={[styles.voteContainer, { backgroundColor: colors.background }]}>
            <Ionicons 
              name="chevron-up" 
              size={20} 
              color={voteScore > 0 ? premiumColors.accent.emerald : colors.secondaryText} 
            />
            <Text style={[styles.voteScore, { color: colors.text }]}>
              {voteScore}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={voteScore < 0 ? premiumColors.accent.rose : colors.secondaryText} 
            />
          </View>
          <View style={styles.questionContent}>
            <View style={styles.questionTitleRow}>
              {question.isSolved && (
                <View style={[styles.solvedBadge, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
                  <Ionicons name="checkmark-circle" size={14} color={premiumColors.accent.emerald} />
                  <Text style={[styles.solvedText, { color: premiumColors.accent.emerald }]}>
                    Solved
                  </Text>
                </View>
              )}
              {question.isPinned && (
                <Ionicons name="pin" size={14} color={premiumColors.accent.gold} />
              )}
              <Text style={[styles.questionTitle, { color: colors.text }]} numberOfLines={2}>
                {question.title}
              </Text>
            </View>
            <Text style={[styles.questionExcerpt, { color: colors.secondaryText }]} numberOfLines={2}>
              {question.content}
            </Text>
            <View style={styles.questionMeta}>
              <View style={[styles.categoryBadge, { backgroundColor: (categoryColors[question.category] || premiumColors.primary.main) + '20' }]}>
                <Text style={[styles.categoryBadgeText, { color: categoryColors[question.category] || premiumColors.primary.main }]}>
                  {question.category?.toUpperCase() || 'GENERAL'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="person" size={12} color={colors.secondaryText} />
                <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                  {author?.name || 'Anonymous'}
                </Text>
              </View>
              <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                {formatTimeAgo(question.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.questionFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.secondaryText} />
          <Text style={[styles.footerText, { color: colors.secondaryText }]}>
            {answerCount} {answerCount === 1 ? 'answer' : 'answers'}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="eye-outline" size={16} color={colors.secondaryText} />
          <Text style={[styles.footerText, { color: colors.secondaryText }]}>
            {question.views || 0} views
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
  categoriesContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  categoryText: {
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
  questionCard: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  questionHeader: {
    marginBottom: spacing.sm,
  },
  questionLeft: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  voteContainer: {
    alignItems: 'center',
    padding: spacing.xs,
    borderRadius: premiumBorderRadius.base,
    minWidth: 40,
  },
  voteScore: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginVertical: spacing.xs / 2,
  },
  questionContent: {
    flex: 1,
  },
  questionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  solvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs / 2,
  },
  solvedText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  questionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    flex: 1,
  },
  questionExcerpt: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
  },
  categoryBadgeText: {
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
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  footerText: {
    fontSize: fontSize.xs,
  },
});

