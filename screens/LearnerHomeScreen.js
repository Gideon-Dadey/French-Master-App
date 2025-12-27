import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { coursesAPI, blogAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { getCourseImage } from '../src/utils/courseImages';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import { formatCurrency } from '../src/utils/helpers';
import PremiumErrorState from '../src/components/PremiumErrorState';
import { offlineService } from '../src/services/offlineService';
import { gamificationService } from '../src/services/gamificationService';

const { width, height } = Dimensions.get('window');

const DAILY_WORDS = [
  { french: 'Bonjour', english: 'Hello', phonetic: 'bohn-ZHOOR' },
  { french: 'Merci', english: 'Thank you', phonetic: 'mehr-SEE' },
  { french: 'S\'il vous plaît', english: 'Please', phonetic: 'seel voo PLEH' },
  { french: 'Au revoir', english: 'Goodbye', phonetic: 'oh ruh-VWAHR' },
  { french: 'Enchanté', english: 'Nice to meet you', phonetic: 'ahn-shahn-TAY' },
];

export default function LearnerHomeScreen({ navigation }) {
  const { user, isAuthenticated, loadUser } = useAuth();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const gamification = useGamification();
  const gamificationStats = gamification?.stats || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topCourses, setTopCourses] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [error, setError] = useState(null);
  const [dailyWord, setDailyWord] = useState(DAILY_WORDS[0]);
  const [headerInteractable, setHeaderInteractable] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  const userName = user?.name?.split(' ')[0] || 'Learner';
  const userLevel = gamificationStats.level || user?.level || 1;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    const today = new Date().getDate();
    setDailyWord(DAILY_WORDS[today % DAILY_WORDS.length]);

    initScreen();
    startAnimations();

    return () => {

    };
  }, []);

  const startAnimations = () => {

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    Animated.stagger(80, cardAnims.map(anim =>
      Animated.spring(anim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true })
    )).start();

    const orbLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(orb1Anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
          Animated.timing(orb1Anim, { toValue: 0, duration: 3000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(orb2Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
          Animated.timing(orb2Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
        ]),
      ])
    );
    orbLoop.start();
  };

  const initScreen = async () => {
    await loadData();
    if (isAuthenticated && user) {
      await gamificationService.checkAndUpdateStreak(user);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setHeaderInteractable(offsetY > 100);
      }
    }
  );

  const loadData = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        coursesAPI.getFeatured(),
        blogAPI.getAll({ limit: 5 }),
      ]);

      let coursesData = [];
      let postsData = [];

      if (results[0].status === 'fulfilled') {
        coursesData = results[0].value?.data?.data || [];
      } else {
        console.warn('Failed to fetch featured courses:', results[0].reason);
      }

      if (results[1].status === 'fulfilled') {
        postsData = results[1].value?.data?.data || [];
      } else {
        console.warn('Failed to fetch blog posts:', results[1].reason);
      }

      setTopCourses(coursesData);
      setRecentPosts(postsData);

      // Show error only if both failed
      if (results[0].status === 'rejected' && results[1].status === 'rejected') {
        const errorMsg = results[0].reason?.message || 'Failed to load content';
        if (errorMsg.includes('Network') || errorMsg.includes('network')) {
          setError('Connection Lost - Please check your internet connection');
        } else {
          setError('Failed to load home content. Please refresh.');
        }
      }

    } catch (err) {
      console.error('Failed to load home data:', err);
      setError('Network Error - Please check your connection');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    loadData();
    if (isAuthenticated) loadUser();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getLevelColor = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'beginner') return '#10B981';
    if (l === 'intermediate') return '#F59E0B';
    if (l === 'advanced') return '#EF4444';
    return '#6366F1';
  };

  const quickActions = [
    { id: 'courses', icon: 'book', label: 'Courses', screen: 'Learn', gradient: ['#6366F1', '#8B5CF6'], badge: topCourses.length },
    { id: 'practice', icon: 'fitness', label: 'Practice', screen: 'Practice', gradient: ['#10B981', '#059669'], badge: null },
    { id: 'flashcards', icon: 'albums', label: 'Flashcards', screen: 'Flashcards', gradient: ['#F59E0B', '#D97706'], badge: null },
    { id: 'community', icon: 'people', label: 'Community', screen: 'Community', gradient: ['#EC4899', '#DB2777'], badge: null },
  ];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const heroScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 0.95],
    extrapolate: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  if (error && topCourses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PremiumErrorState onRetry={loadData} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      <Animated.View
        pointerEvents={headerInteractable ? 'auto' : 'none'}
        style={[
          styles.floatingNavBar,
          {
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
            opacity: headerOpacity,
            borderBottomColor: isDarkMode ? '#1F2937' : '#E5E7EB',
          }
        ]}
      >
        <View style={styles.navBarContent}>
          <View style={styles.navBarLeft}>
            <Image source={require('../assets/logo.jpeg')} style={styles.navLogo} />
            <Text style={[styles.navTitle, { color: colors.text }]}>French Master</Text>
          </View>
          <View style={styles.navBarRight}>
            <TouchableOpacity style={styles.navIconBtn} onPress={toggleTheme}>
              <Ionicons name={isDarkMode ? "sunny" : "moon"} size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={['#6366F1']}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >

        <Animated.View style={[styles.heroSection, { transform: [{ scale: heroScale }], opacity: heroOpacity }]}>
          <LinearGradient
            colors={isDarkMode ? ['#1E1B4B', '#312E81', '#4338CA'] : ['#4F46E5', '#6366F1', '#818CF8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >

            <Animated.View style={[
              styles.floatingOrb,
              styles.orb1,
              {
                transform: [
                  { translateY: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
                  { scale: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
                ],
              },
            ]} />
            <Animated.View style={[
              styles.floatingOrb,
              styles.orb2,
              {
                transform: [
                  { translateY: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 15] }) },
                  { scale: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] }) },
                ],
              },
            ]} />
            <View style={[styles.floatingOrb, styles.orb3]} />
            <View style={[styles.floatingOrb, styles.orb4]} />

            <View style={styles.heroHeader}>
              <View style={styles.headerBranding}>
                <Image source={require('../assets/logo.jpeg')} style={styles.heroLogo} />
                <View>
                  <View style={styles.brandNameRow}>
                    <Text style={styles.heroAppName}>French Master</Text>
                  </View>
                  <Text style={styles.heroTagline}>Master French, One Day at a Time</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.heroIconBtn}
                onPress={toggleTheme}
              >
                <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Animated.View style={[
              styles.heroContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}>

              <View style={styles.greetingCard}>
                <View style={styles.greetingLeft}>
                  <Text style={styles.greetingText}>{getGreeting()}</Text>
                  <Text style={styles.greetingName}>{userName} 👋</Text>
                </View>
                <TouchableOpacity
                  style={styles.avatarContainer}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#F97316']}
                    style={styles.avatarRing}
                  >
                    <View style={styles.avatarInner}>
                      <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
                    </View>
                  </LinearGradient>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>{userLevel}</Text>
                  </View>
                </TouchableOpacity>
              </View>

            </Animated.View>
          </LinearGradient>
        </Animated.View>

        <View style={[styles.contentBody, { backgroundColor: colors.background }]}>

          <Animated.View style={[
            styles.section,
            {
              opacity: cardAnims[0],
              transform: [{ translateY: cardAnims[0].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}>
            <TouchableOpacity
              style={[styles.wordCard, premiumShadows.lg]}
              onPress={() => navigation.navigate('WordOfTheDay')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={isDarkMode ? ['#1E1B4B', '#312E81'] : ['#EEF2FF', '#E0E7FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.wordCardGradient}
              >
                <View style={styles.wordCardHeader}>
                  <Text style={[styles.wordCardBadgeText, { color: '#6366F1' }]}>WORD OF THE DAY</Text>
                  <Ionicons name="chevron-forward" size={20} color="#6366F1" />
                </View>
                <Text style={[styles.wordFrench, { color: colors.text }]}>{dailyWord.french}</Text>
                <Text style={[styles.wordPhonetic, { color: colors.secondaryText }]}>/{dailyWord.phonetic}/</Text>
                <Text style={[styles.wordEnglish, { color: '#6366F1' }]}>{dailyWord.english}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[
            styles.section,
            {
              opacity: cardAnims[1],
              transform: [{ translateY: cardAnims[1].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            </View>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.quickActionCard,
                    { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' },
                    premiumShadows.sm,
                  ]}
                  onPress={() => navigation.navigate(action.screen)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={action.gradient}
                    style={styles.quickActionIconBg}
                  >
                    <Ionicons name={action.icon} size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={[styles.quickActionLabel, { color: colors.text }]}>{action.label}</Text>
                  {action.badge && (
                    <View style={styles.quickActionBadge}>
                      <Text style={styles.quickActionBadgeText}>{action.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {topCourses.length > 0 && (
            <Animated.View style={[
              styles.section,
              {
                opacity: cardAnims[2],
                transform: [{ translateY: cardAnims[2].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
              },
            ]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Continue Learning</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyCourses')}>
                <Text style={styles.seeAllBtn}>See All</Text>
              </TouchableOpacity>
            </View>

              <TouchableOpacity
                style={[styles.continueCard, premiumShadows.lg]}
                onPress={() => navigation.navigate('CourseDetail', { courseId: topCourses[0]._id })}
                activeOpacity={0.95}
              >
                <Image
                  source={getCourseImage(topCourses[0]._id, 0, topCourses[0].category, topCourses[0].title)}
                  style={styles.continueImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
                  style={styles.continueOverlay}
                />

                <View style={styles.playButtonContainer}>
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.playButton}
                  >
                    <Ionicons name="play" size={28} color="#FFFFFF" />
                  </LinearGradient>
                </View>

                <View style={styles.continueContent}>
                  <View style={styles.continueTopRow}>
                    <View style={styles.continueBadge}>
                      <Text style={styles.continueBadgeText}>IN PROGRESS</Text>
                    </View>
                    <View style={[styles.levelTag, { backgroundColor: getLevelColor(topCourses[0].level) }]}>
                      <Text style={styles.levelTagText}>{topCourses[0].level || 'Beginner'}</Text>
                    </View>
                  </View>

                  <Text style={styles.continueTitle} numberOfLines={2}>
                    {topCourses[0].title}
                  </Text>

                  <View style={styles.continueProgress}>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressTrack}>
                        <LinearGradient
                          colors={['#6366F1', '#8B5CF6']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressFill, { width: '45%' }]}
                        />
                      </View>
                      <Text style={styles.progressPercent}>45%</Text>
                    </View>
                    <Text style={styles.progressHint}>Keep going! You're doing great 🔥</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View style={[
            styles.section,
            {
              opacity: cardAnims[3],
              transform: [{ translateY: cardAnims[3].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Courses</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
                <Text style={styles.seeAllBtn}>Explore</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.coursesScroll}
            >
              {topCourses.map((course, index) => (
                <TouchableOpacity
                  key={course._id || index}
                  style={[
                    styles.courseCard,
                    { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' },
                    premiumShadows.md
                  ]}
                  onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                  activeOpacity={0.9}
                >
                  <View style={styles.courseImageContainer}>
                    <Image
                      source={getCourseImage(course._id, index, course.category, course.title)}
                      style={styles.courseImage}
                    />
                    <View style={[styles.courseLevelBadge, { backgroundColor: getLevelColor(course.level) }]}>
                      <Text style={styles.courseLevelText}>{course.level || 'All'}</Text>
                    </View>
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={[styles.courseCategory, { color: '#6366F1' }]}>
                      {(course.category || 'French').toUpperCase()}
                    </Text>
                    <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
                      {course.title}
                    </Text>
                    <View style={styles.courseMeta}>
                      <View style={styles.courseRating}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={[styles.courseRatingText, { color: colors.text }]}>
                          {course.rating?.average?.toFixed(1) || '4.8'}
                        </Text>
                      </View>
                      <Text style={[styles.coursePrice, { color: '#6366F1' }]}>
                        {course.price === 0 ? 'FREE' : formatCurrency(course.price, 'GHS')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View style={[
            styles.section,
            {
              opacity: cardAnims[4],
              transform: [{ translateY: cardAnims[4].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest Stories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BlogList')}>
                <Text style={styles.seeAllBtn}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentPosts.slice(0, 3).map((post, index) => (
              <TouchableOpacity
                key={post._id || index}
                style={[
                  styles.postCard,
                  { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' },
                  premiumShadows.sm
                ]}
                onPress={() => navigation.navigate('BlogDetail', { postId: post._id, post })}
                activeOpacity={0.8}
              >
                <Image
                  source={post.thumbnail ? { uri: post.thumbnail } : require('../assets/logo.jpeg')}
                  style={styles.postImage}
                />
                <View style={styles.postInfo}>
                  <View style={[styles.postCategoryBadge, { backgroundColor: '#6366F115' }]}>
                    <Text style={[styles.postCategoryText, { color: '#6366F1' }]}>
                      {(post.category || 'Article').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.postTitle, { color: colors.text }]} numberOfLines={2}>
                    {post.title}
                  </Text>
                  <View style={styles.postMeta}>
                    <Text style={[styles.postTime, { color: colors.secondaryText }]}>
                      {formatTimeAgo(post.createdAt)}
                    </Text>
                    <View style={styles.postDot} />
                    <Text style={[styles.postTime, { color: colors.secondaryText }]}>
                      {post.readTime || '3'} min read
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>

          <Animated.View style={[
            styles.section,
            {
              opacity: cardAnims[5],
              transform: [{ translateY: cardAnims[5].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}>
            <TouchableOpacity
              style={[styles.goalCard, premiumShadows.md]}
              onPress={() => navigation.navigate('Practice')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.goalCardGradient}
              >
                <View style={styles.goalCardContent}>
                  <View style={styles.goalCardLeft}>
                    <View>
                      <Text style={styles.goalCardTitle}>Daily Goal</Text>
                      <Text style={styles.goalCardSubtitle}>Complete 1 lesson today</Text>
                    </View>
                  </View>
                  <View style={styles.goalProgress}>
                    <Text style={styles.goalProgressText}>0/1</Text>
                    <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    zIndex: 1000,
    borderBottomWidth: 1,
  },
  navBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  navBarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  navIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    overflow: 'hidden',
  },
  heroGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.25,
  },
  orb1: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.2)',
    top: -50,
    right: -60,
  },
  orb2: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.15)',
    bottom: 60,
    left: -40,
  },
  orb3: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: '40%',
    right: 40,
  },
  orb4: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: 100,
    right: 100,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  streakButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  streakButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  heroHeaderRight: {
    flexDirection: 'row',
    gap: 10,
  },
  heroIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    gap: 20,
  },
  heroLogo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroAppName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  heroTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 20,
  },
  greetingLeft: {
    gap: 4,
  },
  greetingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    padding: 3,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 16,
    gap: 10,
  },
  statIcon: {
    width: 40,
    height: 40,
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
    fontWeight: '500',
  },
  xpProgressContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 16,
  },
  xpProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  xpProgressLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  xpProgressValue: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  xpProgressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  contentBody: {
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  seeAllBtn: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
  },
  wordCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  wordCardGradient: {
    padding: 20,
  },
  wordCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  wordCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wordCardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  wordFrench: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  wordPhonetic: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  wordEnglish: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  quickActionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  quickActionBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  quickActionBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  continueCard: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
  },
  continueImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  continueOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  playButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  continueTopRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  continueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99,102,241,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  continueBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  levelTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  levelTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  continueTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  continueProgress: {
    gap: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercent: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  progressHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  coursesScroll: {
    paddingRight: 20,
    gap: 16,
  },
  courseCard: {
    width: 220,
    borderRadius: 20,
    overflow: 'hidden',
  },
  courseImageContainer: {
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: 130,
  },
  courseLevelBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  courseLevelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  courseInfo: {
    padding: 14,
    gap: 6,
  },
  courseCategory: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    height: 40,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  courseRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courseRatingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  coursePrice: {
    fontSize: 15,
    fontWeight: '800',
  },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    gap: 14,
  },
  postImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
  },
  postInfo: {
    flex: 1,
    gap: 6,
  },
  postCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  postCategoryText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  postTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  postDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9CA3AF',
  },
  postArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  goalCardGradient: {
    padding: 20,
  },
  goalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  goalCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalProgressText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
