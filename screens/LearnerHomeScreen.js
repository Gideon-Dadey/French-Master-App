import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { spacing, fontSize, normalize } from '../src/utils/responsive';
import { progressAPI, coursesAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import DailyChallengeCard from '../src/components/DailyChallengeCard';
import QuickStatsGrid from '../src/components/QuickStatsGrid';
import RecommendedCourses from '../src/components/RecommendedCourses';
import LearningInsightCard from '../src/components/LearningInsightCard';

const { width } = Dimensions.get('window');

export default function LearnerHomeScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const { stats: gamificationStats } = useGamification();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState(62);
  const [cefrGoal, setCefrGoal] = useState({ current: 'A2', target: 'B1' });
  const [continueLesson, setContinueLesson] = useState(null);
  const [courses, setCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [learningStats, setLearningStats] = useState(null);
  const [learningInsight, setLearningInsight] = useState(null);
  const [vocabularyReview, setVocabularyReview] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load user progress and current lesson
      const [progressResponse, coursesResponse, featuredResponse] = await Promise.all([
        progressAPI.getDashboard().catch(() => null),
        coursesAPI.getAll({ limit: 10 }).catch(() => null),
        coursesAPI.getFeatured().catch(() => null),
      ]);

      if (progressResponse?.data?.data) {
        const dashboardData = progressResponse.data.data;
        setWeeklyProgress(Math.min(100, Math.round((dashboardData.totalLessonsCompleted || 0) / 3 * 100)));
        
        // Set learning stats
        setLearningStats({
          studyTime: formatStudyTime(dashboardData.totalTimeSpent || 0),
          studyTimeTrend: 15,
          lessonsCompleted: dashboardData.totalLessonsCompleted || 0,
          lessonsTrend: 12,
          streak: gamificationStats?.streak || 0,
          xpToday: gamificationStats?.xp || 0,
          xpTrend: 8,
        });
      }

      if (coursesResponse?.data?.data) {
        setRecommendedCourses(coursesResponse.data.data.slice(0, 5));
      }

      if (featuredResponse?.data?.data) {
        setCourses(featuredResponse.data.data.slice(0, 3));
      }

      // Mock continue lesson for now
      setContinueLesson({
        id: 'unit-8',
        title: 'Unité 8 - Au marché',
        skills: ['Listening', 'Vocabulary', 'Speaking'],
      });

      // Set daily challenge
      setDailyChallenge({
        title: 'Complete 3 lessons today',
        completed: 1,
        target: 3,
        unit: 'lessons',
        rewards: [
          { icon: 'star', text: '50 XP' },
          { icon: 'flame', text: 'Extend streak' },
        ],
      });

      // Set learning insight
      setLearningInsight({
        type: 'improvement',
        title: 'Great progress this week!',
        description: 'You\'ve completed 62% of your weekly goal. Keep up the momentum!',
        actionText: 'View progress',
      });

      // Set vocabulary review
      setVocabularyReview({
        count: 12,
        nextReview: 'in 2 hours',
      });
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatStudyTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const userName = user?.name?.split(' ')[0] || 'User';
  const displayName = userName || 'Learner';

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#1E88E5', '#6A1B9A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Bonjour, {displayName}</Text>
              <Text style={styles.subtitle}>Continue your French journey</Text>
            </View>
            <View style={styles.cefrBadge}>
              <Text style={styles.cefrBadgeText}>{cefrGoal.current}-{cefrGoal.target}</Text>
            </View>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Your CEFR goal: {cefrGoal.current} → {cefrGoal.target}</Text>
              <Text style={styles.progressPercentage}>{weeklyProgress}% week</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${weeklyProgress}%` }]} />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar - Top Priority */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search courses, lessons, vocabulary..."
            placeholderTextColor={colors.secondaryText}
          />
        </View>

        {/* Section: Continue Learning - Primary Action */}
        {continueLesson && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Continue Learning</Text>
            <TouchableOpacity
              style={[styles.continueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Learn')}
              activeOpacity={0.8}
            >
              <View style={styles.continueCardHeader}>
                <View style={styles.continueIconWrapper}>
                  <Ionicons name="play-circle" size={32} color={colors.primary} />
                </View>
                <View style={styles.continueCardContent}>
                  <Text style={[styles.continueLabel, { color: colors.secondaryText }]}>RESUME LESSON</Text>
                  <Text style={[styles.continueTitle, { color: colors.text }]} numberOfLines={1}>
                    {continueLesson.title}
                  </Text>
                  <View style={styles.skillsContainer}>
                    {continueLesson.skills.map((skill, index) => (
                      <View key={index} style={[styles.skillBadge, { backgroundColor: colors.primary + '15' }]}>
                        <Text style={[styles.skillText, { color: colors.primary }]}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.secondaryText} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Section: Key Metrics - Dashboard Overview */}
        {learningStats && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Today's Progress</Text>
            <QuickStatsGrid
              stats={learningStats}
              colors={colors}
              onStatPress={(stat) => {
                if (stat === 'Streak') {
                  navigation.navigate('Profile');
                } else {
                  navigation.navigate('MyCourses');
                }
              }}
            />
          </View>
        )}

        {/* Section: Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Courses')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="clipboard-outline" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Placement Test</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Practice')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="flash-outline" size={24} color={colors.warning} />
              </View>
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Quick Practice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('MyCourses')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="download-outline" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Downloads</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Daily Challenge */}
        {dailyChallenge && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Daily Challenge</Text>
            <DailyChallengeCard
              challenge={dailyChallenge}
              colors={colors}
              onPress={() => navigation.navigate('Practice')}
            />
          </View>
        )}

        {/* Section: Learning Path */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>Your Learning Path</Text>
          <ContentCard
            accentColor="#FFD700"
            title="Weekly Goal"
            description="Finish 3 lessons • Practice 20 minutes daily"
            status="On track"
            statusColor="#4CAF50"
            onPress={() => navigation.navigate('MyCourses')}
            colors={colors}
          />
          <ContentCard
            accentColor="#1E88E5"
            title="CEFR Progression"
            description="Unit 4: At school • Listening + speaking drills"
            onPress={() => navigation.navigate('Courses')}
            colors={colors}
          />
        </View>

        {/* Section: Practice Tools */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>Practice Tools</Text>
          <View style={styles.quickPracticeGrid}>
            <QuickPracticeCard
              icon="flash"
              title="Flashcards"
              subtitle="Review words"
              color="#6366F1"
              onPress={() => navigation.navigate('Practice')}
              colors={colors}
            />
            <QuickPracticeCard
              icon="mic"
              title="Speaking"
              subtitle="Pronunciation"
              color="#10B981"
              onPress={() => navigation.navigate('Practice')}
              colors={colors}
            />
            <QuickPracticeCard
              icon="headset"
              title="Listening"
              subtitle="Audio exercises"
              color="#F59E0B"
              onPress={() => navigation.navigate('Learn')}
              colors={colors}
            />
            <QuickPracticeCard
              icon="checkmark-circle"
              title="Quiz"
              subtitle="Test knowledge"
              color="#EC4899"
              onPress={() => navigation.navigate('Practice')}
              colors={colors}
            />
          </View>
        </View>

        {/* Section: Recommended Courses */}
        {recommendedCourses.length > 0 && (
          <View style={styles.section}>
            <RecommendedCourses
              courses={recommendedCourses}
              title="Recommended for You"
              onCoursePress={(course) => {
                if (course === 'seeAll') {
                  navigation.navigate('Courses');
                } else {
                  navigation.navigate('CourseDetail', { courseId: course._id || course.id });
                }
              }}
              colors={colors}
            />
          </View>
        )}

        {/* Section: Learning Insights */}
        {learningInsight && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Insights</Text>
            <LearningInsightCard
              insight={learningInsight}
              colors={colors}
              onPress={() => navigation.navigate('MyCourses')}
            />
          </View>
        )}

        {/* Section: Vocabulary Review */}
        {vocabularyReview && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.vocabularyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Practice')}
              activeOpacity={0.8}
            >
              <View style={styles.vocabularyHeader}>
                <View style={[styles.vocabularyIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="library-outline" size={28} color={colors.primary} />
                </View>
                <View style={styles.vocabularyContent}>
                  <Text style={[styles.vocabularyTitle, { color: colors.text }]}>Vocabulary Review</Text>
                  <Text style={[styles.vocabularySubtitle, { color: colors.secondaryText }]}>
                    {String(vocabularyReview.count || 0)} words ready for review
                  </Text>
                  <Text style={[styles.vocabularyNext, { color: colors.primary }]}>
                    Next review {vocabularyReview.nextReview || 'soon'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.secondaryText} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

function ContentCard({ accentColor, title, description, status, statusColor, onPress, colors }) {
  return (
    <TouchableOpacity
      style={[styles.contentCard, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
          {status && (
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.cardDescription, { color: colors.secondaryText }]}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: spacing.xxxl + 10,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cefrBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  cefrBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#000000',
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressPercentage: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xl * 1.5,
  },
  sectionHeader: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.xs,
  },
  continueCard: {
    padding: spacing.lg,
    borderRadius: spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  continueCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  continueCardContent: {
    flex: 1,
  },
  continueLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs / 2,
  },
  continueTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
    lineHeight: fontSize.lg * 1.3,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  skillBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.base,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentCard: {
    flexDirection: 'row',
    borderRadius: spacing.md,
    marginBottom: spacing.base,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  accentBar: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardDescription: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  vocabularyCard: {
    padding: spacing.lg,
    borderRadius: spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  vocabularyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vocabularyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F120',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  vocabularyContent: {
    flex: 1,
  },
  vocabularyTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  vocabularySubtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  vocabularyNext: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  quickPracticeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  bottomSpacing: {
    height: spacing.lg,
  },
  quickPracticeCard: {
    width: '47%',
    padding: spacing.lg,
    borderRadius: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: spacing.sm,
  },
  quickPracticeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickPracticeTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  quickPracticeSubtitle: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
function QuickPracticeCard({ icon, title, subtitle, color, onPress, colors }) {
  return (
    <TouchableOpacity
      style={[styles.quickPracticeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.quickPracticeIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.quickPracticeTitle, { color: colors.text, fontWeight: '600' }]}>{title}</Text>
      <Text style={[styles.quickPracticeSubtitle, { color: colors.secondaryText, fontWeight: '400' }]}>{subtitle}</Text>
    </TouchableOpacity>
  );
}


