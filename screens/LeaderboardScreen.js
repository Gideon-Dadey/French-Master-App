import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { leaderboardAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';

const { width } = Dimensions.get('window');

export default function LeaderboardScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [userEntry, setUserEntry] = useState(null);
  const [selectedType, setSelectedType] = useState('overall');

  const leaderboardTypes = [
    { id: 'overall', name: 'Overall', icon: 'trophy', color: premiumColors.accent.gold },
    { id: 'weekly', name: 'Weekly', icon: 'calendar', color: premiumColors.primary.main },
    { id: 'monthly', name: 'Monthly', icon: 'calendar-outline', color: premiumColors.accent.emerald },
    { id: 'streak', name: 'Streak', icon: 'flame', color: premiumColors.accent.rose },
    { id: 'level', name: 'Level', icon: 'star', color: premiumColors.accent.sky },
    { id: 'courses', name: 'Courses', icon: 'book', color: premiumColors.primary.main },
    { id: 'achievements', name: 'Achievements', icon: 'medal', color: premiumColors.accent.gold },
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [selectedType]);

  const loadLeaderboard = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      
      const response = await leaderboardAPI.getAll({
        type: selectedType,
        limit: 50,
        page: 1,
      });

      setLeaderboard(response.data.data || []);
      setUserRank(response.data.userRank);
      setUserEntry(response.data.userEntry);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setError('Failed to load leaderboard. Please check your connection.');
      setLeaderboard([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType, refreshing]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLeaderboard();
  }, [loadLeaderboard]);

  const getValueForType = (entry, type) => {
    switch (type) {
      case 'weekly':
        return entry.weeklyXP || 0;
      case 'monthly':
        return entry.monthlyXP || 0;
      case 'streak':
        return entry.currentStreak || 0;
      case 'level':
        return entry.level || 1;
      case 'courses':
        return entry.coursesCompleted || 0;
      case 'achievements':
        return entry.achievementsUnlocked || 0;
      default:
        return entry.totalXP || 0;
    }
  };

  const getLabelForType = (type) => {
    switch (type) {
      case 'weekly':
        return 'Weekly XP';
      case 'monthly':
        return 'Monthly XP';
      case 'streak':
        return 'Day Streak';
      case 'level':
        return 'Level';
      case 'courses':
        return 'Courses';
      case 'achievements':
        return 'Achievements';
      default:
        return 'Total XP';
    }
  };

  const formatValue = (value, type) => {
    if (type === 'level' || type === 'courses' || type === 'achievements' || type === 'streak') {
      return value.toString();
    }
    return value.toLocaleString();
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
                Leaderboard
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Top learners and achievers
              </Text>
            </View>
            <View style={{ width: 24 }} />
          </View>
        </View>
      </LinearGradient>

      {/* Type Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {leaderboardTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedType === type.id
                  ? type.color
                  : colors.card,
                borderColor: selectedType === type.id
                  ? type.color
                  : colors.border,
              },
              premiumShadows.sm,
            ]}
            onPress={() => setSelectedType(type.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={type.icon}
              size={18}
              color={selectedType === type.id ? '#FFFFFF' : colors.text}
            />
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedType === type.id ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* User's Rank Card */}
      {isAuthenticated && userEntry && (
        <View style={styles.userRankContainer}>
          <View style={[styles.userRankCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <View style={styles.userRankHeader}>
              <Text style={[styles.userRankLabel, { color: colors.secondaryText }]}>Your Rank</Text>
              <Text style={[styles.userRankValue, { color: premiumColors.primary.main }]}>
                #{userRank || 'N/A'}
              </Text>
            </View>
            <View style={styles.userRankStats}>
              <View style={styles.userStatItem}>
                <Ionicons name="trophy" size={16} color={premiumColors.accent.gold} />
                <Text style={[styles.userStatValue, { color: colors.text }]}>
                  {formatValue(getValueForType(userEntry, selectedType), selectedType)}
                </Text>
                <Text style={[styles.userStatLabel, { color: colors.secondaryText }]}>
                  {getLabelForType(selectedType)}
                </Text>
              </View>
              <View style={styles.userStatItem}>
                <Ionicons name="star" size={16} color={premiumColors.accent.sky} />
                <Text style={[styles.userStatValue, { color: colors.text }]}>
                  Level {userEntry.level || 1}
                </Text>
                <Text style={[styles.userStatLabel, { color: colors.secondaryText }]}>
                  Current Level
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Content */}
      {error && !loading ? (
        <ErrorMessage message={error} onRetry={loadLeaderboard} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        >
          {leaderboard.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No rankings yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                Start learning to appear on the leaderboard!
              </Text>
            </View>
          ) : (
            <>
              {/* Top 3 Podium */}
              {leaderboard.length >= 3 && (
                <View style={styles.podiumContainer}>
                  <PodiumItem
                    entry={leaderboard[1]}
                    position={2}
                    colors={colors}
                    value={getValueForType(leaderboard[1], selectedType)}
                    type={selectedType}
                    formatValue={formatValue}
                  />
                  <PodiumItem
                    entry={leaderboard[0]}
                    position={1}
                    colors={colors}
                    value={getValueForType(leaderboard[0], selectedType)}
                    type={selectedType}
                    formatValue={formatValue}
                  />
                  <PodiumItem
                    entry={leaderboard[2]}
                    position={3}
                    colors={colors}
                    value={getValueForType(leaderboard[2], selectedType)}
                    type={selectedType}
                    formatValue={formatValue}
                  />
                </View>
              )}

              {/* Rest of Leaderboard */}
              <View style={styles.listContainer}>
                {leaderboard.slice(3).map((entry, index) => (
                  <LeaderboardItem
                    key={entry._id || entry.user?._id || index}
                    entry={entry}
                    position={index + 4}
                    colors={colors}
                    value={getValueForType(entry, selectedType)}
                    type={selectedType}
                    formatValue={formatValue}
                    label={getLabelForType(selectedType)}
                    isCurrentUser={isAuthenticated && user && entry.user?._id === user._id}
                  />
                ))}
              </View>
            </>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

function PodiumItem({ entry, position, colors, value, type, formatValue }) {
  const { isDarkMode } = useTheme();
  const user = typeof entry.user === 'object' ? entry.user : null;
  const medalColors = {
    1: ['#FFD700', '#FFA500'], // Gold
    2: ['#C0C0C0', '#A0A0A0'], // Silver
    3: ['#CD7F32', '#B87333'], // Bronze
  };

  return (
    <View style={styles.podiumItem}>
      <View style={[styles.podiumAvatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
        {position === 1 ? (
          <Ionicons name="trophy" size={32} color={medalColors[1][0]} />
        ) : (
          <Ionicons name="person" size={24} color={premiumColors.primary.main} />
        )}
      </View>
      <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
        {user?.name || 'Anonymous'}
      </Text>
      <Text style={[styles.podiumValue, { color: premiumColors.primary.main }]}>
        {formatValue(value, type)}
      </Text>
      <View style={[styles.podiumBadge, { backgroundColor: medalColors[position][0] }]}>
        <Text style={styles.podiumBadgeText}>#{position}</Text>
      </View>
    </View>
  );
}

function LeaderboardItem({ entry, position, colors, value, type, formatValue, label, isCurrentUser }) {
  const user = typeof entry.user === 'object' ? entry.user : null;

  return (
    <View
      style={[
        styles.leaderboardItem,
        {
          backgroundColor: isCurrentUser ? premiumColors.primary.main + '10' : colors.card,
          borderColor: isCurrentUser ? premiumColors.primary.main : colors.border,
        },
        premiumShadows.sm,
      ]}
    >
      <View style={styles.itemLeft}>
        <Text style={[styles.positionText, { color: colors.secondaryText }]}>#{position}</Text>
        <View style={[styles.itemAvatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
          <Ionicons name="person" size={20} color={premiumColors.primary.main} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
            {user?.name || 'Anonymous'}
            {isCurrentUser && (
              <Text style={[styles.youBadge, { color: premiumColors.primary.main }]}> (You)</Text>
            )}
          </Text>
          <View style={styles.itemMeta}>
            <Text style={[styles.itemMetaText, { color: colors.secondaryText }]}>
              Level {entry.level || 1}
            </Text>
            {entry.currentStreak > 0 && (
              <>
                <Text style={[styles.itemMetaText, { color: colors.secondaryText }]}> • </Text>
                <Ionicons name="flame" size={12} color={premiumColors.accent.rose} />
                <Text style={[styles.itemMetaText, { color: colors.secondaryText }]}>
                  {entry.currentStreak}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text style={[styles.itemValue, { color: premiumColors.primary.main }]}>
          {formatValue(value, type)}
        </Text>
        <Text style={[styles.itemLabel, { color: colors.secondaryText }]}>{label}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
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
  userRankContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  userRankCard: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
  },
  userRankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userRankLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  userRankValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  userRankStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userStatItem: {
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  userStatValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  userStatLabel: {
    fontSize: fontSize.xs,
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
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  podiumName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  podiumValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  podiumBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
  },
  podiumBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  listContainer: {
    gap: spacing.md,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  positionText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
  itemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  youBadge: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  itemMetaText: {
    fontSize: fontSize.xs,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  itemLabel: {
    fontSize: fontSize.xs,
  },
});

