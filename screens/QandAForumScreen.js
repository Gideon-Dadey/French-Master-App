import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { questionsAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
  { id: null, name: 'All Topics', icon: 'apps', color: '#6366F1', gradient: ['#6366F1', '#4F46E5'] },
  { id: 'grammar', name: 'Grammar', icon: 'school', color: '#10B981', gradient: ['#10B981', '#059669'] },
  { id: 'vocabulary', name: 'Vocabulary', icon: 'book', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
  { id: 'pronunciation', name: 'Pronunciation', icon: 'mic', color: '#EC4899', gradient: ['#EC4899', '#DB2777'] },
  { id: 'culture', name: 'Culture', icon: 'earth', color: '#06B6D4', gradient: ['#06B6D4', '#0891B2'] },
  { id: 'exam-prep', name: 'Exam Prep', icon: 'document-text', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
  { id: 'general', name: 'General', icon: 'chatbubbles', color: '#14B8A6', gradient: ['#14B8A6', '#0D9488'] },
];

const SORT_OPTIONS = [
  { id: 'recent', name: 'Recent', icon: 'time' },
  { id: 'popular', name: 'Popular', icon: 'flame' },
  { id: 'unanswered', name: 'Unanswered', icon: 'help-circle' },
  { id: 'solved', name: 'Solved', icon: 'checkmark-circle' },
];

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
  const [showSearch, setShowSearch] = useState(false);
  const [stats, setStats] = useState({ total: 0, answered: 0, solved: 0 });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([]).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadQuestions();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

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
      const data = response.data.data || [];
      setQuestions(data);

      const answered = data.filter(q => q.answers?.length > 0).length;
      const solved = data.filter(q => q.isSolved).length;
      setStats({ total: data.length, answered, solved });

      data.forEach((_, index) => {
        if (!cardAnims[index]) {
          cardAnims[index] = new Animated.Value(0);
        }
      });

      Animated.stagger(50,
        data.map((_, index) =>
          Animated.spring(cardAnims[index] || new Animated.Value(0), {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ).start();

    } catch (error) {
      console.error('Failed to load questions:', error);
      setError('Failed to load questions');
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
      Alert.alert(
        'Sign In Required',
        'Please sign in to ask a question',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Auth') },
        ]
      );
      return;
    }
    navigation.navigate('CreateQuestion');
  };

  const toggleSearch = () => {
    const toValue = showSearch ? 0 : 1;
    Animated.spring(searchAnim, {
      toValue,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
    setShowSearch(!showSearch);
    if (showSearch && searchQuery) {
      setSearchQuery('');
      loadQuestions();
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w`;
    return `${Math.floor(diffInDays / 30)}mo`;
  };

  const getCategoryInfo = (categoryId) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.loadingHeader}>
          <Text style={styles.loadingText}>Loading Questions...</Text>
        </LinearGradient>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={{ opacity: headerOpacity }}>
        <LinearGradient
          colors={isDarkMode ? ['#312E81', '#4338CA'] : ['#6366F1', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />
          <View style={styles.headerDecor3} />

          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.headerTitleWrap,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <Text style={styles.headerTitle}>Q&A Forum</Text>
              <Text style={styles.headerSubtitle}>
                {stats.total} questions • {stats.solved} solved
              </Text>
            </Animated.View>

            <TouchableOpacity
              style={styles.searchBtn}
              onPress={toggleSearch}
            >
              <Ionicons name={showSearch ? 'close' : 'search'} size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[
              styles.searchBarContainer,
              {
                height: searchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 56],
                }),
                opacity: searchAnim,
                marginTop: searchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 16],
                }),
              }
            ]}
          >
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search questions..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={loadQuestions}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.statsRow,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="help-circle" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Questions</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="chatbubbles" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.statValue}>{stats.answered}</Text>
                <Text style={styles.statLabel}>Answered</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16,185,129,0.3)' }]}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              </View>
              <View>
                <Text style={styles.statValue}>{stats.solved}</Text>
                <Text style={styles.statLabel}>Solved</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id || 'all'}
                style={[
                  styles.categoryChip,
                  isActive && { backgroundColor: category.color },
                  !isActive && { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={isActive ? '#FFFFFF' : category.color}
                />
                <Text style={[
                  styles.categoryChipText,
                  { color: isActive ? '#FFFFFF' : colors.text }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.sortSection, { backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9' }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortScroll}
        >
          {SORT_OPTIONS.map((option) => {
            const isActive = selectedSort === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortChip,
                  isActive && styles.sortChipActive,
                  { backgroundColor: isActive ? '#6366F1' : 'transparent' }
                ]}
                onPress={() => setSelectedSort(option.id)}
              >
                <Ionicons
                  name={option.icon}
                  size={14}
                  color={isActive ? '#FFFFFF' : colors.secondaryText}
                />
                <Text style={[
                  styles.sortChipText,
                  { color: isActive ? '#FFFFFF' : colors.secondaryText }
                ]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
            colors={['#6366F1']}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {questions.length === 0 ? (
          <EmptyState onCreateQuestion={handleCreateQuestion} colors={colors} isDarkMode={isDarkMode} />
        ) : (
          questions.map((question, index) => (
            <Animated.View
              key={question._id}
              style={{
                opacity: cardAnims[index] || 1,
                transform: [{
                  translateY: (cardAnims[index] || new Animated.Value(1)).interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  })
                }]
              }}
            >
              <QuestionCard
                question={question}
                colors={colors}
                isDarkMode={isDarkMode}
                onPress={() => navigation.navigate('QuestionDetail', { questionId: question._id })}
                formatTimeAgo={formatTimeAgo}
                getCategoryInfo={getCategoryInfo}
              />
            </Animated.View>
          ))
        )}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateQuestion}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function EmptyState({ onCreateQuestion, colors, isDarkMode }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
        <Ionicons name="chatbubbles-outline" size={56} color="#6366F1" />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Questions Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
        Be the first to start a discussion!{'\n'}Ask anything about learning French.
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onCreateQuestion}>
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.emptyBtnGradient}
        >
          <Ionicons name="add-circle" size={22} color="#FFFFFF" />
          <Text style={styles.emptyBtnText}>Ask a Question</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function QuestionCard({ question, colors, isDarkMode, onPress, formatTimeAgo, getCategoryInfo }) {
  const author = typeof question.author === 'object' ? question.author : null;
  const answerCount = question.answers?.length || 0;
  const voteScore = (question.upvotes?.length || 0) - (question.downvotes?.length || 0);
  const categoryInfo = getCategoryInfo(question.category);
  const hasAcceptedAnswer = question.isSolved;

  return (
    <TouchableOpacity
      style={[
        styles.questionCard,
        {
          backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
          borderLeftColor: hasAcceptedAnswer ? '#10B981' : categoryInfo.color,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >

      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          {question.isPinned && (
            <View style={styles.pinnedBadge}>
              <Ionicons name="pin" size={12} color="#F59E0B" />
            </View>
          )}
          {hasAcceptedAnswer && (
            <View style={[styles.solvedBadge, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={[styles.solvedText, { color: '#10B981' }]}>Solved</Text>
            </View>
          )}
          <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '15' }]}>
            <Ionicons name={categoryInfo.icon} size={12} color={categoryInfo.color} />
            <Text style={[styles.categoryBadgeText, { color: categoryInfo.color }]}>
              {categoryInfo.name}
            </Text>
          </View>
        </View>
        <Text style={[styles.timeAgo, { color: colors.secondaryText }]}>
          {formatTimeAgo(question.createdAt)}
        </Text>
      </View>

      <Text style={[styles.questionTitle, { color: colors.text }]} numberOfLines={2}>
        {question.title}
      </Text>

      <Text style={[styles.questionExcerpt, { color: colors.secondaryText }]} numberOfLines={2}>
        {question.content?.replace(/<[^>]*>/g, '').substring(0, 150)}
      </Text>

      {question.tags?.length > 0 && (
        <View style={styles.tagsRow}>
          {question.tags.slice(0, 3).map((tag, idx) => (
            <View
              key={idx}
              style={[styles.tag, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
            >
              <Text style={[styles.tagText, { color: colors.secondaryText }]}>#{tag}</Text>
            </View>
          ))}
          {question.tags.length > 3 && (
            <Text style={[styles.moreTags, { color: colors.secondaryText }]}>
              +{question.tags.length - 3}
            </Text>
          )}
        </View>
      )}

      <View style={[styles.cardFooter, { borderTopColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
        <View style={styles.footerLeft}>
          <View style={[styles.authorAvatar, { backgroundColor: categoryInfo.color + '30' }]}>
            <Text style={[styles.authorInitial, { color: categoryInfo.color }]}>
              {(author?.name || 'A')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.authorName, { color: colors.secondaryText }]} numberOfLines={1}>
            {author?.name || 'Anonymous'}
          </Text>
        </View>

        <View style={styles.footerRight}>
          <View style={styles.footerStat}>
            <Ionicons
              name={voteScore > 0 ? 'arrow-up' : voteScore < 0 ? 'arrow-down' : 'swap-vertical'}
              size={16}
              color={voteScore > 0 ? '#10B981' : voteScore < 0 ? '#EF4444' : colors.secondaryText}
            />
            <Text style={[
              styles.footerStatText,
              {
                color: voteScore > 0 ? '#10B981' : voteScore < 0 ? '#EF4444' : colors.secondaryText,
                fontWeight: voteScore !== 0 ? '700' : '500'
              }
            ]}>
              {voteScore}
            </Text>
          </View>
          <View style={styles.footerStat}>
            <Ionicons
              name="chatbubble-outline"
              size={15}
              color={answerCount > 0 ? '#6366F1' : colors.secondaryText}
            />
            <Text style={[
              styles.footerStatText,
              { color: answerCount > 0 ? '#6366F1' : colors.secondaryText }
            ]}>
              {answerCount}
            </Text>
          </View>
          <View style={styles.footerStat}>
            <Ionicons name="eye-outline" size={15} color={colors.secondaryText} />
            <Text style={[styles.footerStatText, { color: colors.secondaryText }]}>
              {question.views || 0}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerDecor3: {
    position: 'absolute',
    top: 80,
    left: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    overflow: 'hidden',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoriesSection: {
    paddingVertical: 14,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sortSection: {
    paddingVertical: 10,
  },
  sortScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
    marginRight: 8,
  },
  sortChipActive: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  emptyBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 10,
  },
  emptyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  questionCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  pinnedBadge: {
    marginRight: 4,
  },
  solvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  solvedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeAgo: {
    fontSize: 12,
    fontWeight: '500',
  },
  questionTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  questionExcerpt: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  authorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    fontSize: 14,
    fontWeight: '700',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerStatText: {
    fontSize: 13,
    fontWeight: '500',
  },

  fabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 90,
    right: 20,
  },
  fab: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  fabGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
