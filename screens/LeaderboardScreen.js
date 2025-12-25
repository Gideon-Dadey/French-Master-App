import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { leaderboardAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width, height } = Dimensions.get('window');

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

  const headerAnim = useRef(new Animated.Value(0)).current;
  const podiumAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const crownPulse = useRef(new Animated.Value(1)).current;

  const leaderboardTypes = [
    { id: 'overall', name: 'Overall', icon: 'trophy', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
    { id: 'weekly', name: 'Weekly', icon: 'calendar', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
    { id: 'monthly', name: 'Monthly', icon: 'calendar-outline', color: '#10B981', gradient: ['#10B981', '#059669'] },
    { id: 'streak', name: 'Streak', icon: 'flame', color: '#EF4444', gradient: ['#EF4444', '#DC2626'] },
    { id: 'level', name: 'Level', icon: 'star', color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] },
    { id: 'courses', name: 'Courses', icon: 'book', color: '#EC4899', gradient: ['#EC4899', '#DB2777'] },
    { id: 'achievements', name: 'Badges', icon: 'medal', color: '#F97316', gradient: ['#F97316', '#EA580C'] },
  ];

  const currentTypeConfig = leaderboardTypes.find(t => t.id === selectedType) || leaderboardTypes[0];

  useEffect(() => {

    Animated.parallel([
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(podiumAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8, delay: 200 }),
      Animated.spring(listAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8, delay: 400 }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(crownPulse, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(crownPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

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
      setError('Failed to load leaderboard');
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
      case 'weekly': return entry.weeklyXP || 0;
      case 'monthly': return entry.monthlyXP || 0;
      case 'streak': return entry.currentStreak || 0;
      case 'level': return entry.level || 1;
      case 'courses': return entry.coursesCompleted || 0;
      case 'achievements': return entry.achievementsUnlocked || 0;
      default: return entry.totalXP || 0;
    }
  };

  const getLabelForType = (type) => {
    switch (type) {
      case 'weekly': return 'Weekly XP';
      case 'monthly': return 'Monthly XP';
      case 'streak': return 'Day Streak';
      case 'level': return 'Level';
      case 'courses': return 'Courses';
      case 'achievements': return 'Badges';
      default: return 'Total XP';
    }
  };

  const formatValue = (value, type) => {
    if (type === 'level' || type === 'courses' || type === 'achievements' || type === 'streak') {
      return value.toString();
    }
    return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <Animated.View
        style={[
          styles.headerWrapper,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
          },
        ]}
      >
        <LinearGradient
          colors={isDarkMode
            ? ['#1A0F00', '#2D1810', '#1F1005']
            : ['#FFFBF0', '#FFF3E0', '#FFE8CC']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >

          <View style={styles.headerDecor}>
            <Animated.View
              style={[
                styles.decorOrb,
                styles.decorOrb1,
                {
                  backgroundColor: isDarkMode ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.12)',
                  transform: [{ scale: crownPulse }]
                }
              ]}
            />
            <Animated.View
              style={[
                styles.decorOrb,
                styles.decorOrb2,
                { backgroundColor: isDarkMode ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.1)' }
              ]}
            />
            <Animated.View
              style={[
                styles.decorOrb,
                styles.decorOrb3,
                { backgroundColor: isDarkMode ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.08)' }
              ]}
            />
          </View>

          <View style={styles.headerContent}>

            <View style={styles.headerNav}>
              <TouchableOpacity
                style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(245,158,11,0.1)' }]}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={22} color={isDarkMode ? '#FFFFFF' : '#F59E0B'} />
              </TouchableOpacity>

              <View style={styles.headerTitleSection}>
                <View style={styles.headerBadge}>
                  <Animated.View style={{ transform: [{ scale: crownPulse }] }}>
                    <Ionicons name="trophy" size={20} color="#F59E0B" />
                  </Animated.View>
                </View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Leaderboard
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
                  Compete with the best
                </Text>
              </View>

              <View style={{ width: 44 }} />
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)' }]}>
                <Ionicons name="people" size={18} color="#F59E0B" />
                <Text style={[styles.statValue, { color: colors.text }]}>{leaderboard.length || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Competitors</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)' }]}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={[styles.liveText, { color: '#10B981' }]}>LIVE</Text>
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{currentTypeConfig.name}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Category</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)' }]}>
                <Ionicons name="ribbon" size={18} color="#EC4899" />
                <Text style={[styles.statValue, { color: colors.text }]}>#{userRank || '-'}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Your Rank</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {leaderboardTypes.map((type) => {
            const isActive = selectedType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? type.color : (isDarkMode ? 'rgba(255,255,255,0.08)' : colors.card),
                    borderColor: isActive ? type.color : (isDarkMode ? '#374151' : '#E5E7EB'),
                  },
                  isActive && styles.filterChipActive,
                ]}
                onPress={() => setSelectedType(type.id)}
                activeOpacity={0.8}
              >
                <Ionicons name={type.icon} size={16} color={isActive ? '#FFFFFF' : type.color} />
                <Text style={[styles.filterText, { color: isActive ? '#FFFFFF' : colors.text }]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {error && !loading ? (
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#FEF2F2', '#FEE2E2']}
            style={styles.errorCard}
          >
            <Ionicons name="cloud-offline" size={48} color="#EF4444" />
            <Text style={[styles.errorTitle, { color: colors.text }]}>Connection Error</Text>
            <Text style={[styles.errorMessage, { color: colors.secondaryText }]}>
              {error}
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadLeaderboard}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.retryGradient}
              >
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.retryText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
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
            <Animated.View
              style={[
                styles.emptyContainer,
                {
                  opacity: podiumAnim,
                  transform: [{ translateY: podiumAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                }
              ]}
            >
              <LinearGradient
                colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#FFF7ED', '#FFEDD5']}
                style={styles.emptyIconContainer}
              >
                <Ionicons name="trophy" size={48} color="#F59E0B" />
              </LinearGradient>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No rankings yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                Start learning to appear on the leaderboard!
              </Text>
            </Animated.View>
          ) : (
            <>

              {leaderboard.length >= 3 && (
                <Animated.View
                  style={[
                    styles.podiumSection,
                    {
                      opacity: podiumAnim,
                      transform: [{ translateY: podiumAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }],
                    }
                  ]}
                >
                  <LinearGradient
                    colors={isDarkMode ? ['#1A1040', '#0F172A'] : ['#FFFBF5', '#FFF7ED']}
                    style={styles.podiumContainer}
                  >

                    <Animated.View style={[styles.crownContainer, { transform: [{ scale: crownPulse }] }]}>
                      <Ionicons name="trophy" size={32} color="#F59E0B" />
                    </Animated.View>

                    <View style={styles.podiumRow}>

                      <PodiumCard
                        entry={leaderboard[1]}
                        position={2}
                        colors={colors}
                        isDarkMode={isDarkMode}
                        value={getValueForType(leaderboard[1], selectedType)}
                        type={selectedType}
                        formatValue={formatValue}
                        label={getLabelForType(selectedType)}
                      />

                      <PodiumCard
                        entry={leaderboard[0]}
                        position={1}
                        colors={colors}
                        isDarkMode={isDarkMode}
                        value={getValueForType(leaderboard[0], selectedType)}
                        type={selectedType}
                        formatValue={formatValue}
                        label={getLabelForType(selectedType)}
                        isWinner
                      />

                      <PodiumCard
                        entry={leaderboard[2]}
                        position={3}
                        colors={colors}
                        isDarkMode={isDarkMode}
                        value={getValueForType(leaderboard[2], selectedType)}
                        type={selectedType}
                        formatValue={formatValue}
                        label={getLabelForType(selectedType)}
                      />
                    </View>
                  </LinearGradient>
                </Animated.View>
              )}

              {isAuthenticated && userEntry && userRank > 3 && (
                <Animated.View
                  style={[
                    styles.yourRankSection,
                    {
                      opacity: listAnim,
                      transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                    }
                  ]}
                >
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Position</Text>
                  </View>
                  <View style={[styles.yourRankCard, { borderColor: currentTypeConfig.color }]}>
                    <LinearGradient
                      colors={isDarkMode
                        ? [currentTypeConfig.color + '20', currentTypeConfig.color + '10']
                        : [currentTypeConfig.color + '15', currentTypeConfig.color + '05']
                      }
                      style={styles.yourRankGradient}
                    >
                      <View style={styles.yourRankLeft}>
                        <View style={[styles.yourRankPosition, { backgroundColor: currentTypeConfig.color }]}>
                          <Text style={styles.yourRankPositionText}>#{userRank}</Text>
                        </View>
                        <View style={[styles.yourRankAvatar, { borderColor: currentTypeConfig.color }]}>
                          <Ionicons name="person" size={24} color={currentTypeConfig.color} />
                        </View>
                        <View>
                          <Text style={[styles.yourRankName, { color: colors.text }]}>
                            {user?.name || 'You'}
                          </Text>
                          <Text style={[styles.yourRankLevel, { color: colors.secondaryText }]}>
                            Level {userEntry.level || 1}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.yourRankRight}>
                        <Text style={[styles.yourRankValue, { color: currentTypeConfig.color }]}>
                          {formatValue(getValueForType(userEntry, selectedType), selectedType)}
                        </Text>
                        <Text style={[styles.yourRankLabel, { color: colors.secondaryText }]}>
                          {getLabelForType(selectedType)}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                </Animated.View>
              )}

              <Animated.View
                style={[
                  styles.listSection,
                  {
                    opacity: listAnim,
                    transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                  }
                ]}
              >
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Rankings</Text>
                  <View style={[styles.sectionBadge, { backgroundColor: currentTypeConfig.color + '20' }]}>
                    <Text style={[styles.sectionBadgeText, { color: currentTypeConfig.color }]}>
                      Top {Math.min(50, leaderboard.length)}
                    </Text>
                  </View>
                </View>

                <View style={styles.listContainer}>
                  {leaderboard.slice(3).map((entry, index) => (
                    <LeaderboardItem
                      key={entry._id || entry.user?._id || index}
                      entry={entry}
                      position={index + 4}
                      colors={colors}
                      isDarkMode={isDarkMode}
                      value={getValueForType(entry, selectedType)}
                      type={selectedType}
                      formatValue={formatValue}
                      label={getLabelForType(selectedType)}
                      isCurrentUser={isAuthenticated && user && entry.user?._id === user._id}
                      typeColor={currentTypeConfig.color}
                      index={index}
                    />
                  ))}
                </View>
              </Animated.View>
            </>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}
    </View>
  );
}

function PodiumCard({ entry, position, colors, isDarkMode, value, type, formatValue, label, isWinner }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const user = typeof entry?.user === 'object' ? entry.user : null;

  const medalConfig = {
    1: { colors: ['#FFD700', '#FFA500'], shadow: '#FFD700', icon: 'trophy', size: 80 },
    2: { colors: ['#E5E7EB', '#9CA3AF'], shadow: '#9CA3AF', icon: 'medal', size: 68 },
    3: { colors: ['#CD7F32', '#B87333'], shadow: '#CD7F32', icon: 'medal', size: 68 },
  };

  const config = medalConfig[position];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
      delay: position * 150,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.podiumCard,
        position === 1 && styles.podiumCardWinner,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >

      <View style={[styles.medalBadge, { backgroundColor: config.colors[0] }]}>
        <Text style={styles.medalText}>{position}</Text>
      </View>

      <LinearGradient
        colors={config.colors}
        style={[
          styles.podiumAvatar,
          { width: config.size, height: config.size, borderRadius: config.size / 2 }
        ]}
      >
        <View style={[
          styles.podiumAvatarInner,
          {
            width: config.size - 6,
            height: config.size - 6,
            borderRadius: (config.size - 6) / 2,
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF'
          }
        ]}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.podiumAvatarImage} />
          ) : (
            <Ionicons name="person" size={position === 1 ? 36 : 28} color={config.colors[0]} />
          )}
        </View>
      </LinearGradient>

      {position === 1 && (
        <View style={styles.crownBadge}>
          <Ionicons name="trophy" size={20} color="#FFD700" />
        </View>
      )}

      <Text
        style={[
          styles.podiumName,
          { color: colors.text },
          position === 1 && styles.podiumNameWinner
        ]}
        numberOfLines={1}
      >
        {user?.name || 'Anonymous'}
      </Text>

      <View style={[styles.podiumValueContainer, { backgroundColor: config.colors[0] + '20' }]}>
        <Text style={[styles.podiumValue, { color: config.colors[0] }]}>
          {formatValue(value, type)}
        </Text>
      </View>

      <Text style={[styles.podiumLabel, { color: colors.secondaryText }]}>{label}</Text>
    </Animated.View>
  );
}

function LeaderboardItem({ entry, position, colors, isDarkMode, value, type, formatValue, label, isCurrentUser, typeColor, index }) {
  const itemAnim = useRef(new Animated.Value(0)).current;
  const user = typeof entry?.user === 'object' ? entry.user : null;

  useEffect(() => {
    Animated.spring(itemAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
      delay: index * 50,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.leaderboardItem,
        {
          backgroundColor: isCurrentUser
            ? (isDarkMode ? typeColor + '20' : typeColor + '10')
            : (isDarkMode ? '#1E1B4B' : '#FFFFFF'),
          borderColor: isCurrentUser ? typeColor : (isDarkMode ? '#312E81' : '#E5E7EB'),
          opacity: itemAnim,
          transform: [{ translateX: itemAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }],
        },
      ]}
    >

      <View style={[styles.positionContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }]}>
        <Text style={[styles.positionText, { color: colors.secondaryText }]}>{position}</Text>
      </View>

      <View style={[styles.itemAvatar, { borderColor: isCurrentUser ? typeColor : (isDarkMode ? '#374151' : '#E5E7EB') }]}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.itemAvatarImage} />
        ) : (
          <Ionicons name="person" size={20} color={isCurrentUser ? typeColor : colors.secondaryText} />
        )}
      </View>

      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
          {user?.name || 'Anonymous'}
          {isCurrentUser && <Text style={{ color: typeColor }}> (You)</Text>}
        </Text>
        <View style={styles.itemMeta}>
          <View style={[styles.levelBadge, { backgroundColor: '#8B5CF6' + '20' }]}>
            <Ionicons name="star" size={10} color="#8B5CF6" />
            <Text style={[styles.levelText, { color: '#8B5CF6' }]}>Lv. {entry.level || 1}</Text>
          </View>
          {entry.currentStreak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: '#EF4444' + '20' }]}>
              <Ionicons name="flame" size={10} color="#EF4444" />
              <Text style={[styles.streakText, { color: '#EF4444' }]}>{entry.currentStreak}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.itemRight}>
        <Text style={[styles.itemValue, { color: typeColor }]}>
          {formatValue(value, type)}
        </Text>
        <Text style={[styles.itemLabel, { color: colors.secondaryText }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    zIndex: 10,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  decorOrb1: {
    width: 180,
    height: 180,
    top: -40,
    right: -40,
  },
  decorOrb2: {
    width: 120,
    height: 120,
    bottom: 20,
    left: -30,
  },
  decorOrb3: {
    width: 80,
    height: 80,
    top: 80,
    left: '50%',
  },
  headerContent: {
    zIndex: 1,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleSection: {
    flex: 1,
    alignItems: 'center',
  },
  headerBadge: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  filtersSection: {
    paddingVertical: 16,
  },
  filtersScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
  },
  filterChipActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorCard: {
    width: '100%',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
  },
  podiumSection: {
    marginBottom: 24,
  },
  podiumContainer: {
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  crownContainer: {
    marginBottom: 20,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  podiumCard: {
    alignItems: 'center',
    width: (width - 72) / 3,
    paddingVertical: 16,
    position: 'relative',
  },
  podiumCardWinner: {
    marginBottom: 16,
  },
  medalBadge: {
    position: 'absolute',
    top: 0,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  medalText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  podiumAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  podiumAvatarInner: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  podiumAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  crownBadge: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  podiumNameWinner: {
    fontSize: 15,
    fontWeight: '800',
  },
  podiumValueContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
  },
  podiumValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  podiumLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  yourRankSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  yourRankCard: {
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
  },
  yourRankGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  yourRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  yourRankPosition: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  yourRankPositionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  yourRankAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  yourRankName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  yourRankLevel: {
    fontSize: 12,
  },
  yourRankRight: {
    alignItems: 'flex-end',
  },
  yourRankValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  yourRankLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  listSection: {
    marginBottom: 24,
  },
  listContainer: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 12,
  },
  positionContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  itemAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.1)',
    overflow: 'hidden',
  },
  itemAvatarImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '700',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
