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
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { coursesAPI, blogAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { getCourseImage } from '../src/utils/courseImages';
import { formatCurrency } from '../src/utils/helpers';
import PremiumErrorState from '../src/components/PremiumErrorState';
import { gamificationService } from '../src/services/gamificationService';
import { getThemeColors, themeShadows, themeRadius } from '../src/utils/organicTheme';

const { width, height } = Dimensions.get('window');

const DAILY_WORDS = [
  { french: 'Bonjour', english: 'Hello', phonetic: 'bohn-ZHOOR', example: 'Bonjour, comment allez-vous?' },
  { french: 'Merci', english: 'Thank you', phonetic: 'mehr-SEE', example: 'Merci beaucoup!' },
  { french: 'S\'il vous plaît', english: 'Please', phonetic: 'seel voo PLEH', example: 'Un café, s\'il vous plaît.' },
  { french: 'Au revoir', english: 'Goodbye', phonetic: 'oh ruh-VWAHR', example: 'Au revoir et à bientôt!' },
  { french: 'Enchanté', english: 'Nice to meet you', phonetic: 'ahn-shahn-TAY', example: 'Enchanté de vous rencontrer.' },
];

// Elegant decorative blob
const DecorativeBlob = ({ style, colors, opacity = 0.15 }) => (
  <View style={[style, { opacity }]}>
    <Svg width="100%" height="100%" viewBox="0 0 200 200">
      <Defs>
        <RadialGradient id="blobGradHome" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={colors[0]} stopOpacity="0.6" />
          <Stop offset="100%" stopColor={colors[1]} stopOpacity="0.1" />
        </RadialGradient>
      </Defs>
      <Path
        d="M45.3,-51.2C58.4,-42.3,68.3,-27.4,71.7,-10.7C75.1,6,72,24.4,62.1,37.5C52.2,50.6,35.5,58.4,18.2,63.2C0.9,68,-16.9,69.8,-32.8,64C-48.7,58.2,-62.6,44.8,-70.2,28.1C-77.8,11.4,-79.1,-8.7,-72.3,-25.4C-65.5,-42.1,-50.6,-55.5,-34.6,-63.5C-18.6,-71.5,-1.5,-74.2,13.2,-69.5C27.9,-64.8,32.2,-60.1,45.3,-51.2Z"
        fill="url(#blobGradHome)"
        transform="translate(100 100)"
      />
    </Svg>
  </View>
);

// Floating accent element
const FloatingAccent = ({ style, color, delay = 0 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 3500, delay, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 3500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const scale = floatAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.1, 1] });

  return (
    <Animated.View style={[style, { transform: [{ translateY }, { scale }] }]}>
      <View style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        opacity: 0.6,
      }} />
    </Animated.View>
  );
};

export default function LearnerHomeScreen({ navigation }) {
  const { user, isAuthenticated, loadUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const gamification = useGamification();
  const gamificationStats = gamification?.stats || {};
  const theme = getThemeColors(isDarkMode);

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
  const cardAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  const userName = user?.name?.split(' ')[0] || 'Learner';
  const userLevel = gamificationStats.level || user?.level || 1;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    const today = new Date().getDate();
    setDailyWord(DAILY_WORDS[today % DAILY_WORDS.length]);
    initScreen();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    Animated.stagger(100, cardAnims.map(anim =>
      Animated.spring(anim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true })
    )).start();
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
      }

      if (results[1].status === 'fulfilled') {
        postsData = results[1].value?.data?.data || [];
      }

      setTopCourses(coursesData);
      setRecentPosts(postsData);

      if (results[0].status === 'rejected' && results[1].status === 'rejected') {
        setError('Connection Lost - Please check your internet connection');
      }
    } catch (err) {
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
    if (hour < 12) return { french: 'Bonjour', english: 'Good Morning' };
    if (hour < 17) return { french: 'Bon après-midi', english: 'Good Afternoon' };
    return { french: 'Bonsoir', english: 'Good Evening' };
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
    if (l === 'beginner') return theme.success;
    if (l === 'intermediate') return theme.secondary;
    if (l === 'advanced') return theme.primary;
    return theme.accent;
  };

  const quickActions = [
    { id: 'courses', icon: 'book-outline', label: 'Courses', screen: 'Learn' },
    { id: 'practice', icon: 'barbell-outline', label: 'Practice', screen: 'Practice' },
    { id: 'flashcards', icon: 'albums-outline', label: 'Flashcards', screen: 'Flashcards' },
    { id: 'community', icon: 'people-outline', label: 'Community', screen: 'Community' },
  ];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const heroScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.15, 1, 0.95],
    extrapolate: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const greeting = getGreeting();

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  if (error && topCourses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <PremiumErrorState onRetry={loadData} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Floating Navigation Bar */}
      <Animated.View
        pointerEvents={headerInteractable ? 'auto' : 'none'}
        style={[
          styles.floatingNavBar,
          {
            backgroundColor: theme.surface + 'F8',
            opacity: headerOpacity,
            borderBottomColor: theme.border,
          }
        ]}
      >
        <View style={styles.navBarContent}>
          <View style={styles.navBarLeft}>
            <Image source={require('../assets/logo.jpeg')} style={styles.navLogo} />
            <Text style={[styles.navTitle, { color: theme.text }]}>French Master</Text>
          </View>
          <TouchableOpacity 
            style={[styles.navIconBtn, { backgroundColor: theme.primary + '15' }]} 
            onPress={toggleTheme}
          >
            <Ionicons name={isDarkMode ? "sunny" : "moon"} size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >

        {/* Hero Section */}
        <Animated.View style={[styles.heroSection, { transform: [{ scale: heroScale }], opacity: heroOpacity }]}>
          <LinearGradient
            colors={theme.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            {/* Decorative Elements */}
            <DecorativeBlob 
              style={styles.heroBlob1} 
              colors={[theme.secondary, theme.accent]} 
              opacity={0.2}
            />
            <DecorativeBlob 
              style={styles.heroBlob2} 
              colors={[theme.accent, theme.primary]} 
              opacity={0.15}
            />
            
            {/* Floating Accents */}
            <FloatingAccent style={styles.floatingAccent1} color={theme.secondary} delay={0} />
            <FloatingAccent style={styles.floatingAccent2} color="#FFFFFF" delay={500} />
            <FloatingAccent style={styles.floatingAccent3} color={theme.secondary} delay={1000} />

            {/* Header Row */}
            <View style={styles.heroHeader}>
              <View style={styles.headerBranding}>
                <View style={[styles.logoFrame, { borderColor: 'rgba(255,255,255,0.2)' }]}>
                  <Image source={require('../assets/logo.jpeg')} style={styles.heroLogo} />
                </View>
                <View>
                  <Text style={styles.heroAppName}>French Master</Text>
                  <Text style={styles.heroTagline}>Master French Elegantly</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.themeToggle, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                onPress={toggleTheme}
              >
                <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Greeting Card */}
            <Animated.View style={[
              styles.greetingCard,
              { 
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.1)',
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }] 
              }
            ]}>
              <View style={styles.greetingContent}>
                <View style={styles.greetingTextSection}>
                  <Text style={styles.greetingFrench}>{greeting.french}</Text>
                  <Text style={styles.greetingEnglish}>{greeting.english}</Text>
                  <Text style={styles.greetingName}>{userName}</Text>
                </View>
                <TouchableOpacity
                  style={styles.avatarContainer}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <LinearGradient
                    colors={[theme.secondary, theme.secondaryLight || theme.secondary]}
                    style={styles.avatarRing}
                  >
                    <View style={styles.avatarInner}>
                      <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
                    </View>
                  </LinearGradient>
                  <View style={[styles.levelBadge, { backgroundColor: theme.success }]}>
                    <Text style={styles.levelBadgeText}>{userLevel}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="flame" size={18} color={theme.secondary} />
                  <Text style={styles.statValue}>{gamificationStats.streak || 0}</Text>
                  <Text style={styles.statLabel}>Streak</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
                <View style={styles.statItem}>
                  <Ionicons name="star" size={18} color={theme.secondary} />
                  <Text style={styles.statValue}>{gamificationStats.xp || 0}</Text>
                  <Text style={styles.statLabel}>XP</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
                <View style={styles.statItem}>
                  <Ionicons name="book" size={18} color={theme.secondary} />
                  <Text style={styles.statValue}>{topCourses.length}</Text>
                  <Text style={styles.statLabel}>Courses</Text>
                </View>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Content Body */}
        <View style={[styles.contentBody, { backgroundColor: theme.background }]}>

          {/* Word of the Day */}
          <Animated.View style={[
            styles.section,
            {
              opacity: cardAnims[0],
              transform: [{ translateY: cardAnims[0].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}>
            <TouchableOpacity
              style={[styles.wordCard, { backgroundColor: theme.surface }, themeShadows.md]}
              onPress={() => navigation.navigate('WordOfTheDay')}
              activeOpacity={0.9}
            >
              <View style={styles.wordCardHeader}>
                <View style={[styles.wordCardBadge, { backgroundColor: theme.secondary + '20' }]}>
                  <Ionicons name="sparkles" size={14} color={theme.secondary} />
                  <Text style={[styles.wordCardBadgeText, { color: theme.secondary }]}>WORD OF THE DAY</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.wordFrench, { color: theme.text }]}>{dailyWord.french}</Text>
              <Text style={[styles.wordPhonetic, { color: theme.textSecondary }]}>/{dailyWord.phonetic}/</Text>
              <Text style={[styles.wordEnglish, { color: theme.primary }]}>{dailyWord.english}</Text>
              <View style={[styles.wordExample, { backgroundColor: theme.primary + '08' }]}>
                <Text style={[styles.wordExampleText, { color: theme.textSecondary }]}>"{dailyWord.example}"</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View style={[
            styles.section,
            {
              opacity: cardAnims[1],
              transform: [{ translateY: cardAnims[1].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
            </View>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionCard, { backgroundColor: theme.surface }, themeShadows.sm]}
                  onPress={() => navigation.navigate(action.screen)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIconBg, { backgroundColor: theme.primary + '12' }]}>
                    <Ionicons name={action.icon} size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: theme.text }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Continue Learning */}
          {topCourses.length > 0 && (
            <Animated.View style={[
              styles.section,
              {
                opacity: cardAnims[2],
                transform: [{ translateY: cardAnims[2].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
              },
            ]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Continue Learning</Text>
                <TouchableOpacity onPress={() => navigation.navigate('MyCourses')}>
                  <Text style={[styles.seeAllBtn, { color: theme.primary }]}>See All</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.continueCard, themeShadows.lg]}
                onPress={() => navigation.navigate('CourseDetail', { courseId: topCourses[0]._id })}
                activeOpacity={0.95}
              >
                <Image
                  source={getCourseImage(topCourses[0]._id, 0, topCourses[0].category, topCourses[0].title)}
                  style={styles.continueImage}
                />
                <LinearGradient
                  colors={['transparent', theme.primary + '80', theme.primary + 'E6']}
                  style={styles.continueOverlay}
                />

                <View style={styles.playButtonContainer}>
                  <LinearGradient
                    colors={[theme.secondary, theme.secondaryLight || theme.secondary]}
                    style={styles.playButton}
                  >
                    <Ionicons name="play" size={26} color="#FFFFFF" />
                  </LinearGradient>
                </View>

                <View style={styles.continueContent}>
                  <View style={styles.continueTopRow}>
                    <View style={[styles.continueBadge, { backgroundColor: theme.secondary }]}>
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
                      <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                        <LinearGradient
                          colors={[theme.secondary, theme.secondaryLight || theme.secondary]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressFill, { width: '45%' }]}
                        />
                      </View>
                      <Text style={styles.progressPercent}>45%</Text>
                    </View>
                    <Text style={styles.progressHint}>Keep going! You're making great progress</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Featured Courses */}
          <Animated.View style={[
            styles.section,
            {
              opacity: cardAnims[3],
              transform: [{ translateY: cardAnims[3].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Courses</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
                <Text style={[styles.seeAllBtn, { color: theme.primary }]}>Explore</Text>
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
                  style={[styles.courseCard, { backgroundColor: theme.surface }, themeShadows.md]}
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
                    <Text style={[styles.courseCategory, { color: theme.primary }]}>
                      {(course.category || 'French').toUpperCase()}
                    </Text>
                    <Text style={[styles.courseTitle, { color: theme.text }]} numberOfLines={2}>
                      {course.title}
                    </Text>
                    <View style={styles.courseMeta}>
                      <View style={styles.courseRating}>
                        <Ionicons name="star" size={14} color={theme.secondary} />
                        <Text style={[styles.courseRatingText, { color: theme.text }]}>
                          {course.rating?.average?.toFixed(1) || '4.8'}
                        </Text>
                      </View>
                      <Text style={[styles.coursePrice, { color: theme.primary }]}>
                        {course.price === 0 ? 'FREE' : formatCurrency(course.price, 'GHS')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Latest Stories */}
          <Animated.View style={[
            styles.section,
            {
              opacity: cardAnims[4],
              transform: [{ translateY: cardAnims[4].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Latest Stories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('BlogList')}>
                <Text style={[styles.seeAllBtn, { color: theme.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentPosts.slice(0, 3).map((post, index) => (
              <TouchableOpacity
                key={post._id || index}
                style={[styles.postCard, { backgroundColor: theme.surface }, themeShadows.sm]}
                onPress={() => navigation.navigate('BlogDetail', { postId: post._id, post })}
                activeOpacity={0.8}
              >
                <Image
                  source={post.thumbnail ? { uri: post.thumbnail } : require('../assets/logo.jpeg')}
                  style={styles.postImage}
                />
                <View style={styles.postInfo}>
                  <View style={[styles.postCategoryBadge, { backgroundColor: theme.primary + '12' }]}>
                    <Text style={[styles.postCategoryText, { color: theme.primary }]}>
                      {(post.category || 'Article').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.postTitle, { color: theme.text }]} numberOfLines={2}>
                    {post.title}
                  </Text>
                  <View style={styles.postMeta}>
                    <Text style={[styles.postTime, { color: theme.textSecondary }]}>
                      {formatTimeAgo(post.createdAt)}
                    </Text>
                    <View style={[styles.postDot, { backgroundColor: theme.textMuted }]} />
                    <Text style={[styles.postTime, { color: theme.textSecondary }]}>
                      {post.readTime || '3'} min read
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Daily Goal Card */}
          <Animated.View style={[
            styles.section,
            {
              opacity: cardAnims[5],
              transform: [{ translateY: cardAnims[5].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}>
            <TouchableOpacity
              style={[styles.goalCard, themeShadows.lg]}
              onPress={() => navigation.navigate('Practice')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.primary, theme.primaryLight || theme.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.goalCardGradient}
              >
                <View style={styles.goalCardContent}>
                  <View style={styles.goalCardLeft}>
                    <View style={styles.goalIconContainer}>
                      <Ionicons name="trophy-outline" size={24} color="#FFFFFF" />
                    </View>
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

          {/* Footer Decoration */}
          <View style={styles.footerDecor}>
            <View style={[styles.decorLine, { backgroundColor: theme.border }]} />
            <Ionicons name="school-outline" size={18} color={theme.textMuted} />
            <View style={[styles.decorLine, { backgroundColor: theme.border }]} />
          </View>

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
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  navIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 35,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  heroBlob1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 240,
    height: 240,
  },
  heroBlob2: {
    position: 'absolute',
    bottom: -40,
    left: -80,
    width: 200,
    height: 200,
  },
  floatingAccent1: {
    position: 'absolute',
    top: 100,
    right: 40,
  },
  floatingAccent2: {
    position: 'absolute',
    top: 180,
    left: 30,
  },
  floatingAccent3: {
    position: 'absolute',
    bottom: 120,
    right: 100,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoFrame: {
    padding: 3,
    borderRadius: 16,
    borderWidth: 2,
  },
  heroLogo: {
    width: 46,
    height: 46,
    borderRadius: 12,
  },
  heroAppName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  heroTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  themeToggle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greetingTextSection: {
    gap: 2,
  },
  greetingFrench: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  greetingEnglish: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  greetingName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 3,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  contentBody: {
    marginTop: -20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
  },
  section: {
    paddingHorizontal: 22,
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  seeAllBtn: {
    fontSize: 14,
    fontWeight: '600',
  },
  wordCard: {
    borderRadius: 22,
    padding: 22,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  wordCardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  wordFrench: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  wordPhonetic: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  wordEnglish: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 14,
  },
  wordExample: {
    padding: 14,
    borderRadius: 12,
  },
  wordExampleText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 56) / 2,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
  },
  quickActionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  continueCard: {
    height: 240,
    borderRadius: 26,
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
    padding: 22,
  },
  continueTopRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  continueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  continueBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  levelTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  levelTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  continueTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
    paddingRight: 22,
    gap: 16,
  },
  courseCard: {
    width: 200,
    borderRadius: 20,
    overflow: 'hidden',
  },
  courseImageContainer: {
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: 120,
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
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
    height: 38,
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
    fontWeight: '600',
  },
  coursePrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
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
    paddingVertical: 4,
    borderRadius: 6,
  },
  postCategoryText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  postDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  goalCard: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  goalCardGradient: {
    padding: 22,
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
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  goalCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
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
  footerDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    gap: 12,
  },
  decorLine: {
    width: 50,
    height: 1,
  },
});
