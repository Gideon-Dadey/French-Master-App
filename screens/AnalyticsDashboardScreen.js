import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width } = Dimensions.get('window');

export default function AnalyticsDashboardScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const periods = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'quarter', label: 'Quarter' },
    { id: 'year', label: 'Year' },
  ];

  const overviewStats = {
    totalStudents: 1245,
    activeStudents: 892,
    totalRevenue: 45680,
    coursesPublished: 12,
    completionRate: 78,
    averageRating: 4.8,
    totalLessons: 156,
    totalViews: 45230,
  };

  const coursePerformance = [
    {
      id: 1,
      title: 'French for Beginners',
      students: 450,
      revenue: 12500,
      rating: 4.9,
      completion: 85,
      views: 12000,
    },
    {
      id: 2,
      title: 'Advanced Grammar',
      students: 320,
      revenue: 9800,
      rating: 4.7,
      completion: 72,
      views: 8500,
    },
    {
      id: 3,
      title: 'Conversational French',
      students: 280,
      revenue: 8400,
      rating: 4.8,
      completion: 80,
      views: 7200,
    },
  ];

  const studentEngagement = {
    dailyActive: 245,
    weeklyActive: 892,
    monthlyActive: 1245,
    averageSessionTime: '32 min',
    completionRate: 78,
    retentionRate: 85,
  };

  const revenueData = {
    thisMonth: 15680,
    lastMonth: 12450,
    growth: 26,
    total: 45680,
    bySource: {
      courses: 32000,
      subscriptions: 10000,
      premium: 3680,
    },
  };

  const handleExportReport = (type) => {
    Alert.alert(
      'Export Report',
      `Export ${type} report as PDF?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Success', 'Report exported successfully!');
          },
        },
      ]
    );
  };

  if (loading) {
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
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.greeting, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
                Analytics Dashboard
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Track performance & insights
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.exportButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={() => handleExportReport('Full')}
            >
              <Ionicons name="download" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.section}>
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.periodButton,
                  {
                    backgroundColor: selectedPeriod === period.id
                      ? premiumColors.primary.main
                      : colors.card,
                    borderColor: selectedPeriod === period.id
                      ? premiumColors.primary.main
                      : colors.border,
                  },
                ]}
                onPress={() => setSelectedPeriod(period.id)}
              >
                <Text
                  style={[
                    styles.periodText,
                    {
                      color: selectedPeriod === period.id ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="people"
              value={overviewStats.totalStudents}
              label="Total Students"
              color={premiumColors.primary.main}
              trend="+12%"
              colors={colors}
            />
            <StatCard
              icon="flash"
              value={overviewStats.activeStudents}
              label="Active Students"
              color={premiumColors.accent.emerald}
              trend="+8%"
              colors={colors}
            />
            <StatCard
              icon="cash"
              value={`GHS ${overviewStats.totalRevenue.toLocaleString()}`}
              label="Total Revenue"
              color={premiumColors.accent.gold}
              trend="+26%"
              colors={colors}
            />
            <StatCard
              icon="school"
              value={overviewStats.coursesPublished}
              label="Courses"
              color={premiumColors.accent.rose}
              trend="+2"
              colors={colors}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Metrics</Text>
          <View style={[styles.metricsCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <MetricRow
              label="Completion Rate"
              value={`${overviewStats.completionRate}%`}
              progress={overviewStats.completionRate}
              color={premiumColors.accent.emerald}
              colors={colors}
            />
            <MetricRow
              label="Average Rating"
              value={overviewStats.averageRating.toFixed(1)}
              progress={overviewStats.averageRating * 20}
              color={premiumColors.accent.gold}
              colors={colors}
            />
            <MetricRow
              label="Total Views"
              value={overviewStats.totalViews.toLocaleString()}
              progress={75}
              color={premiumColors.primary.main}
              colors={colors}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Revenue Analytics</Text>
            <TouchableOpacity onPress={() => handleExportReport('Revenue')}>
              <Ionicons name="download-outline" size={20} color={premiumColors.primary.main} />
            </TouchableOpacity>
          </View>
          <View style={[styles.revenueCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <View style={styles.revenueHeader}>
              <View>
                <Text style={[styles.revenueLabel, { color: colors.secondaryText }]}>This Month</Text>
                <Text style={[styles.revenueValue, { color: colors.text }]}>
                  GHS {revenueData.thisMonth.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.growthBadge, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
                <Ionicons name="trending-up" size={16} color={premiumColors.accent.emerald} />
                <Text style={[styles.growthText, { color: premiumColors.accent.emerald }]}>
                  +{revenueData.growth}%
                </Text>
              </View>
            </View>
            <View style={styles.revenueBreakdown}>
              <RevenueItem
                label="Courses"
                value={revenueData.bySource.courses}
                percentage={(revenueData.bySource.courses / revenueData.total) * 100}
                color={premiumColors.primary.main}
                colors={colors}
              />
              <RevenueItem
                label="Subscriptions"
                value={revenueData.bySource.subscriptions}
                percentage={(revenueData.bySource.subscriptions / revenueData.total) * 100}
                color={premiumColors.accent.emerald}
                colors={colors}
              />
              <RevenueItem
                label="Premium"
                value={revenueData.bySource.premium}
                percentage={(revenueData.bySource.premium / revenueData.total) * 100}
                color={premiumColors.accent.gold}
                colors={colors}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Student Engagement</Text>
          <View style={[styles.engagementCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <EngagementItem
              icon="people"
              label="Daily Active"
              value={studentEngagement.dailyActive}
              color={premiumColors.primary.main}
              colors={colors}
            />
            <EngagementItem
              icon="calendar"
              label="Weekly Active"
              value={studentEngagement.weeklyActive}
              color={premiumColors.accent.emerald}
              colors={colors}
            />
            <EngagementItem
              icon="time"
              label="Avg Session"
              value={studentEngagement.averageSessionTime}
              color={premiumColors.accent.gold}
              colors={colors}
            />
            <EngagementItem
              icon="checkmark-circle"
              label="Completion Rate"
              value={`${studentEngagement.completionRate}%`}
              color={premiumColors.accent.rose}
              colors={colors}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Performing Courses</Text>
            <TouchableOpacity onPress={() => handleExportReport('Courses')}>
              <Ionicons name="download-outline" size={20} color={premiumColors.primary.main} />
            </TouchableOpacity>
          </View>
          <View style={styles.coursesList}>
            {coursePerformance.map((course) => (
              <CoursePerformanceCard
                key={course.id}
                course={course}
                colors={colors}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Insights</Text>
          <View style={[styles.insightsCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <InsightItem
              icon="trending-up"
              title="Revenue Growth"
              description="Your revenue has increased by 26% this month"
              color={premiumColors.accent.emerald}
              colors={colors}
            />
            <InsightItem
              icon="people"
              title="Student Growth"
              description="You've gained 145 new students this month"
              color={premiumColors.primary.main}
              colors={colors}
            />
            <InsightItem
              icon="star"
              title="High Ratings"
              description="Your courses maintain an average rating of 4.8"
              color={premiumColors.accent.gold}
              colors={colors}
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, value, label, color, trend, colors }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
      {trend && (
        <View style={[styles.trendBadge, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
          <Text style={[styles.trendText, { color: premiumColors.accent.emerald }]}>{trend}</Text>
        </View>
      )}
    </View>
  );
}

function MetricRow({ label, value, progress, color, colors }) {
  return (
    <View style={styles.metricRow}>
      <View style={styles.metricHeader}>
        <Text style={[styles.metricLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.metricValue, { color: color }]}>{value}</Text>
      </View>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <LinearGradient
          colors={[color, color + 'DD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress}%` }]}
        />
      </View>
    </View>
  );
}

function RevenueItem({ label, value, percentage, color, colors }) {
  return (
    <View style={styles.revenueItem}>
      <View style={styles.revenueItemHeader}>
        <View style={[styles.revenueDot, { backgroundColor: color }]} />
        <Text style={[styles.revenueItemLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.revenueItemValue, { color: colors.text }]}>
          GHS {value.toLocaleString()}
        </Text>
      </View>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.revenuePercentage, { color: colors.secondaryText }]}>
        {percentage.toFixed(1)}%
      </Text>
    </View>
  );
}

function EngagementItem({ icon, label, value, color, colors }) {
  return (
    <View style={styles.engagementItem}>
      <View style={[styles.engagementIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.engagementContent}>
        <Text style={[styles.engagementLabel, { color: colors.secondaryText }]}>{label}</Text>
        <Text style={[styles.engagementValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

function CoursePerformanceCard({ course, colors }) {
  return (
    <View style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}>
      <View style={styles.courseHeader}>
        <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={1}>
          {course.title}
        </Text>
        <View style={styles.courseRating}>
          <Ionicons name="star" size={14} color={premiumColors.accent.gold} />
          <Text style={[styles.ratingText, { color: colors.text }]}>{course.rating}</Text>
        </View>
      </View>
      <View style={styles.courseMetrics}>
        <View style={styles.courseMetric}>
          <Ionicons name="people" size={14} color={colors.secondaryText} />
          <Text style={[styles.courseMetricText, { color: colors.secondaryText }]}>
            {course.students} students
          </Text>
        </View>
        <View style={styles.courseMetric}>
          <Ionicons name="cash" size={14} color={colors.secondaryText} />
          <Text style={[styles.courseMetricText, { color: colors.secondaryText }]}>
            GHS {course.revenue.toLocaleString()}
          </Text>
        </View>
        <View style={styles.courseMetric}>
          <Ionicons name="checkmark-circle" size={14} color={colors.secondaryText} />
          <Text style={[styles.courseMetricText, { color: colors.secondaryText }]}>
            {course.completion}% complete
          </Text>
        </View>
      </View>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <LinearGradient
          colors={[premiumColors.primary.main, premiumColors.primary.light]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${course.completion}%` }]}
        />
      </View>
    </View>
  );
}

function InsightItem({ icon, title, description, color, colors }) {
  return (
    <View style={styles.insightItem}>
      <View style={[styles.insightIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.insightContent}>
        <Text style={[styles.insightTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.insightDescription, { color: colors.secondaryText }]}>{description}</Text>
      </View>
    </View>
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
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...premiumShadows.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: premiumBorderRadius.base,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  trendBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
  },
  trendText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  metricsCard: {
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  metricRow: {
    marginBottom: spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  revenueCard: {
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  revenueLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs / 2,
  },
  revenueValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs / 2,
  },
  growthText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  revenueBreakdown: {
    gap: spacing.sm,
  },
  revenueItem: {
    marginBottom: spacing.sm,
  },
  revenueItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  revenueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  revenueItemLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  revenueItemValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  revenuePercentage: {
    fontSize: fontSize.xs,
    textAlign: 'right',
    marginTop: spacing.xs / 2,
  },
  engagementCard: {
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  engagementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  engagementContent: {
    flex: 1,
  },
  engagementLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs / 2,
  },
  engagementValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  coursesList: {
    gap: spacing.md,
  },
  courseCard: {
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  courseTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  courseRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  courseMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  courseMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  courseMetricText: {
    fontSize: fontSize.xs,
  },
  insightsCard: {
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  insightDescription: {
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
});

