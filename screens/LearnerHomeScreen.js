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

// Elegant background blur accent (minimalist version of the blobs)
const BackgroundBlur = ({ style, color, size = 300 }) => (
    <View style={[style, {
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.05,
        transform: [{ scale: 1.5 }],
    }]} />
);

export default function LearnerHomeScreen({ navigation }) {
    const { user, isAuthenticated, loadUser } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const gamification = useGamification();
    const gamificationStats = gamification?.stats || {};
    const theme = getThemeColors(isDarkMode);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [topCourses, setTopCourses] = useState([]);
    const [videoMasterclasses, setVideoMasterclasses] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [error, setError] = useState(null);
    const [dailyWord, setDailyWord] = useState(DAILY_WORDS[0]);
    const [headerInteractable, setHeaderInteractable] = useState(false);
    const [totalCoursesCount, setTotalCoursesCount] = useState(0);

    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const cardAnims = useRef([...Array(8)].map(() => new Animated.Value(0))).current;



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
        if (isAuthenticated) {
            await loadUser();
            if (user) {
                await gamificationService.checkAndUpdateStreak(user);
            }
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
                coursesAPI.getAll({ limit: 1 }), // Get total count
                blogAPI.getAll({ limit: 5 }),
                coursesAPI.getAll({ category: 'video-masterclass', limit: 10 }),
            ]);

            let coursesData = [];
            let postsData = [];
            let videoData = [];
            let totalCount = 0;

            if (results[0].status === 'fulfilled') {
                coursesData = results[0].value?.data?.data || [];
            }

            if (results[1].status === 'fulfilled') {
                totalCount = results[1].value?.data?.total || 0;
            }

            if (results[2].status === 'fulfilled') {
                postsData = results[2].value?.data?.data || [];
            }

            if (results[3].status === 'fulfilled') {
                videoData = results[3].value?.data?.data || [];
            }

            setTopCourses(coursesData);
            setRecentPosts(postsData);
            setVideoMasterclasses(videoData);
            setTotalCoursesCount(totalCount);

            if (results[0].status === 'rejected' && results[2].status === 'rejected') {
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
                        <Text style={[styles.navTitle, { color: theme.text }]}>L'Alliance</Text>
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
                    <View style={[styles.heroContent, { backgroundColor: theme.background }]}>
                        <BackgroundBlur style={styles.blurTop} color={theme.primary} />

                        <View style={styles.heroHeader}>
                            <View style={styles.headerBranding}>
                                <LinearGradient
                                    colors={['#3B82F6', '#8B5CF6', '#EC4899']}
                                    style={styles.logoFrame}
                                >
                                    <View style={[styles.logoInner, { backgroundColor: theme.background }]}>
                                        <Image source={require('../assets/logo.jpeg')} style={styles.heroLogo} />
                                    </View>
                                </LinearGradient>
                                <View>
                                    <Text style={[styles.heroAppName, { color: theme.text }]}>L'Alliance</Text>
                                    <View style={styles.taglineRow}>
                                        <View style={[styles.taglineDot, { backgroundColor: theme.primary }]} />
                                        <Text style={[styles.heroTagline, { color: theme.textSecondary }]}>Modern Language Learning</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[styles.themeToggle, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
                                onPress={toggleTheme}
                            >
                                <Ionicons name={isDarkMode ? "sunny" : "moon"} size={20} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Personalized Greeting */}
                        <View style={styles.greetingSection}>
                            <Text style={[styles.greetingSubtitle, { color: theme.textSecondary }]}>
                                {new Date().getHours() < 12 ? 'Bonjour' : new Date().getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'},
                            </Text>
                            <Text style={[styles.greetingTitle, { color: theme.text }]}>
                                {user?.name?.split(' ')[0] || 'Learner'} 👋
                            </Text>
                        </View>

                        {/* Gamification HUD */}
                        <View style={styles.statsRow}>
                            <TouchableOpacity style={[styles.statBadge, { backgroundColor: theme.surface }, themeShadows.sm]}>
                                <View style={[styles.statIconBg, { backgroundColor: '#FF950015' }]}>
                                    <Ionicons name="flame" size={18} color="#FF9500" />
                                </View>
                                <Text style={[styles.statText, { color: theme.text }]}>{gamificationStats.streak || 0}d</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.statBadge, { backgroundColor: theme.surface }, themeShadows.sm]}>
                                <View style={[styles.statIconBg, { backgroundColor: '#34C75915' }]}>
                                    <Ionicons name="flash" size={18} color="#34C759" />
                                </View>
                                <Text style={[styles.statText, { color: theme.text }]}>{gamificationStats.xp || 0} XP</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.statBadge, { backgroundColor: theme.surface }, themeShadows.sm]}>
                                <View style={[styles.statIconBg, { backgroundColor: '#5856D615' }]}>
                                    <Ionicons name="diamond" size={16} color="#5856D6" />
                                </View>
                                <Text style={[styles.statText, { color: theme.text }]}>{gamificationStats.diamonds || 0}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
                                <View style={[styles.wordCardBadgeContainer, { borderLeftColor: theme.primary }]}>
                                    <Text style={[styles.wordCardBadgeText, { color: theme.textSecondary }]}>DAILY PRACTICE</Text>
                                </View>
                                <View style={[styles.arrowCircle, { backgroundColor: theme.primary + '10' }]}>
                                    <Ionicons name="arrow-forward" size={16} color={theme.primary} />
                                </View>
                            </View>
                            <Text style={[styles.wordFrench, { color: theme.text }]}>{dailyWord.french}</Text>
                            <Text style={[styles.wordPhonetic, { color: theme.textSecondary }]}>/{dailyWord.phonetic}/</Text>
                            <Text style={[styles.wordEnglish, { color: theme.primary }]}>{dailyWord.english}</Text>
                            <View style={[styles.wordExample, { backgroundColor: theme.primary + '08' }]}>
                                <Text style={[styles.wordExampleText, { color: theme.textSecondary }]}>"{dailyWord.example}"</Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Immersion Mode Feature Card */}
                    <Animated.View style={[
                        styles.section,
                        {
                            opacity: cardAnims[2], // Using index 2, ensure cardAnims is large enough (it is 8)
                            transform: [{ translateY: cardAnims[2].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                        },
                    ]}>
                        <TouchableOpacity
                            style={[styles.immersionCard, themeShadows.md]}
                            onPress={() => navigation.navigate('ConversationSimulator')}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#6366F1', '#8B5CF6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.immersionGradient}
                            >
                                <View style={styles.immersionContent}>
                                    <View style={styles.immersionIconContainer}>
                                        <Ionicons name="chatbubbles" size={32} color="#FFF" />
                                    </View>
                                    <View style={styles.immersionTextContainer}>
                                        <View style={styles.immersionHeaderRow}>
                                            <Text style={styles.immersionTitle}>Immersion Mode</Text>
                                            <View style={styles.newBadge}>
                                                <Text style={styles.newBadgeText}>NEW</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.immersionDesc}>Practice real-world conversations in simulated scenarios.</Text>
                                    </View>
                                    <View style={styles.immersionArrowInfo}>
                                        <Ionicons name="chevron-forward-circle" size={32} color="rgba(255,255,255,0.9)" />
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Daily Missions */}
                    <Animated.View style={[
                        styles.section,
                        {
                            opacity: cardAnims[1],
                            transform: [{ translateY: cardAnims[1].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                        },
                    ]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Missions</Text>
                            <Text style={[styles.missionStatus, { color: theme.primary }]}>2/3 Done</Text>
                        </View>
                        <View style={styles.missionsContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.missionsScroll}>
                                <TouchableOpacity style={[styles.missionCard, { backgroundColor: theme.surface }, themeShadows.md]}>
                                    <View style={[styles.missionIconContainer, { backgroundColor: '#4CD96420' }]}>
                                        <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
                                    </View>
                                    <View>
                                        <Text style={[styles.missionTitle, { color: theme.text }]}>Daily Lesson</Text>
                                        <Text style={[styles.missionReward, { color: theme.secondary }]}>+50 XP</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.missionCard, { backgroundColor: theme.surface }, themeShadows.md]}>
                                    <View style={[styles.missionIconContainer, { backgroundColor: '#FFCC0020' }]}>
                                        <Ionicons name="star" size={20} color="#FFCC00" />
                                    </View>
                                    <View>
                                        <Text style={[styles.missionTitle, { color: theme.text }]}>Perfect Quiz</Text>
                                        <Text style={[styles.missionReward, { color: theme.secondary }]}>+100 XP</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.missionCard, { backgroundColor: theme.surface, opacity: 0.7 }, themeShadows.md]}>
                                    <View style={[styles.missionIconContainer, { backgroundColor: theme.primary + '20' }]}>
                                        <Ionicons name="people" size={20} color={theme.primary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.missionTitle, { color: theme.text }]}>Socialize</Text>
                                        <Text style={[styles.missionReward, { color: theme.secondary }]}>+30 XP</Text>
                                    </View>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </Animated.View>


                    {/* Featured Courses */}
                    <Animated.View style={[
                        styles.section,
                        {
                            opacity: cardAnims[4],
                            transform: [{ translateY: cardAnims[4].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
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
                                    style={[styles.courseCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.md]}
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
                                        <View style={[styles.courseMeta, { borderTopColor: theme.border }]}>
                                            <View style={styles.courseRating}>
                                                <Ionicons name="star" size={14} color={theme.secondary} />
                                                <Text style={[styles.courseRatingText, { color: theme.text }]}>
                                                    {course.rating?.average?.toFixed(1) || '4.8'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Animated.View>

                    {/* Video Masterclasses Section */}
                    {videoMasterclasses.length > 0 && (
                        <Animated.View style={[
                            styles.section,
                            {
                                opacity: cardAnims[7],
                                transform: [{ translateY: cardAnims[7].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                            },
                        ]}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleRow}>
                                    <View style={[styles.titleAccent, { backgroundColor: theme.primary }]} />
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Video Masterclasses</Text>
                                </View>
                                <TouchableOpacity onPress={() => navigation.navigate('Learn', { category: 'video-masterclass' })}>
                                    <Text style={[styles.seeAllBtn, { color: theme.primary }]}>View All</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.coursesScroll}
                            >
                                {videoMasterclasses.map((course, index) => (
                                    <TouchableOpacity
                                        key={course._id || index}
                                        style={[styles.courseCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.md]}
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
                                            <View style={styles.videoBadge}>
                                                <Ionicons name="play" size={12} color="#FFFFFF" />
                                                <Text style={styles.videoBadgeText}>VIDEO</Text>
                                            </View>
                                        </View>
                                        <View style={styles.courseInfo}>
                                            <Text style={[styles.courseCategory, { color: theme.primary }]}>
                                                MASTERCLASS
                                            </Text>
                                            <Text style={[styles.courseTitle, { color: theme.text }]} numberOfLines={2}>
                                                {course.title}
                                            </Text>
                                            <View style={[styles.courseMeta, { borderTopColor: theme.border }]}>
                                                <View style={styles.courseRating}>
                                                    <Ionicons name="star" size={14} color={theme.secondary} />
                                                    <Text style={[styles.courseRatingText, { color: theme.text }]}>
                                                        {course.rating?.average?.toFixed(1) || '4.9'}
                                                    </Text>
                                                </View>
                                                <View style={styles.metaDivider} />
                                                <View style={styles.courseDuration}>
                                                    <Ionicons name="play-circle-outline" size={14} color={theme.textSecondary} />
                                                    <Text style={[styles.courseMetaText, { color: theme.textSecondary }]}>
                                                        {course.duration ? `${course.duration}h` : 'Video'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </Animated.View>
                    )}

                    {/* Skill Overview */}
                    <Animated.View style={[
                        styles.section,
                        {
                            opacity: cardAnims[5],
                            transform: [{ translateY: cardAnims[5].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                        },
                    ]}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Skill Overview</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
                                <Text style={[styles.seeAllBtn, { color: theme.primary }]}>Stats</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.skillsCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.md]}>
                            <View style={styles.skillRow}>
                                <View style={styles.skillItem}>
                                    <View style={styles.skillHeader}>
                                        <Ionicons name="headset-outline" size={16} color={theme.primary} />
                                        <Text style={[styles.skillName, { color: theme.textSecondary }]}>Listening</Text>
                                    </View>
                                    <View style={[styles.skillProgressContainer, { backgroundColor: theme.primary + '15' }]}>
                                        <View style={[styles.skillProgressBar, { width: '65%', backgroundColor: theme.primary }]} />
                                    </View>
                                </View>
                                <View style={styles.skillItem}>
                                    <View style={styles.skillHeader}>
                                        <Ionicons name="mic-outline" size={16} color={theme.secondary} />
                                        <Text style={[styles.skillName, { color: theme.textSecondary }]}>Speaking</Text>
                                    </View>
                                    <View style={[styles.skillProgressContainer, { backgroundColor: theme.secondary + '15' }]}>
                                        <View style={[styles.skillProgressBar, { width: '40%', backgroundColor: theme.secondary }]} />
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.skillRow, { marginTop: 16 }]}>
                                <View style={styles.skillItem}>
                                    <View style={styles.skillHeader}>
                                        <Ionicons name="book-outline" size={16} color="#4CD964" />
                                        <Text style={[styles.skillName, { color: theme.textSecondary }]}>Reading</Text>
                                    </View>
                                    <View style={[styles.skillProgressContainer, { backgroundColor: '#4CD96415' }]}>
                                        <View style={[styles.skillProgressBar, { width: '80%', backgroundColor: '#4CD964' }]} />
                                    </View>
                                </View>
                                <View style={styles.skillItem}>
                                    <View style={styles.skillHeader}>
                                        <Ionicons name="create-outline" size={16} color="#FF9500" />
                                        <Text style={[styles.skillName, { color: theme.textSecondary }]}>Writing</Text>
                                    </View>
                                    <View style={[styles.skillProgressContainer, { backgroundColor: '#FF950015' }]}>
                                        <View style={[styles.skillProgressBar, { width: '55%', backgroundColor: '#FF9500' }]} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Latest Stories */}
                    <Animated.View style={[
                        styles.section,
                        {
                            opacity: cardAnims[6],
                            transform: [{ translateY: cardAnims[6].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
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
                                style={[styles.postCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}
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
                            opacity: cardAnims[7],
                            transform: [{ translateY: cardAnims[7].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
                        },
                    ]}>
                        <TouchableOpacity
                            style={[styles.goalCard, { borderColor: theme.border }, themeShadows.lg]}
                            onPress={() => navigation.navigate('Practice')}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={[theme.primary, theme.primaryLight || theme.primary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.goalCardGradient, { backgroundColor: theme.primary }]}
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
            </Animated.ScrollView >
        </View >
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
    heroContent: {
        paddingTop: Platform.OS === 'ios' ? 70 : 55,
        paddingBottom: 20,
        paddingHorizontal: 24,
    },
    blurTop: {
        top: -150,
        right: -100,
    },
    taglineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    taglineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
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
        width: 54,
        height: 54,
        borderRadius: 27,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Immersion Card Styles
    immersionCard: {
        borderRadius: 20,
        overflow: 'hidden',
        minHeight: 110,
    },
    immersionGradient: {
        flex: 1,
        padding: 20,
    },
    immersionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    immersionIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    immersionTextContainer: {
        flex: 1,
    },
    immersionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    immersionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    newBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    newBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#000',
    },
    immersionDesc: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 18,
    },
    immersionArrowInfo: {
        justifyContent: 'center',
    },
    logoInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    heroLogo: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    heroAppName: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    heroTagline: {
        fontSize: 14,
        fontWeight: '500',
    },
    themeToggle: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    greetingSection: {
        marginTop: 20,
        marginBottom: 24,
    },
    greetingSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    greetingTitle: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 8,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 16,
        height: 48,
        minWidth: 90,
    },
    statIconBg: {
        width: 32,
        height: 32,
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statText: {
        fontSize: 14,
        fontWeight: '700',
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
        alignItems: 'baseline',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    seeAllBtn: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
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
    wordCardBadgeContainer: {
        borderLeftWidth: 3,
        paddingLeft: 10,
    },
    wordCardBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
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


    missionStatus: {
        fontSize: 14,
        fontWeight: '700',
    },
    missionsContainer: {
        marginBottom: 10,
    },
    missionsScroll: {
        paddingRight: 22,
        gap: 14,
    },
    missionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 18,
        gap: 12,
        width: 180,
    },
    missionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    missionTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    missionReward: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },

    skillsCard: {
        padding: 20,
        borderRadius: 22,
        borderWidth: 1,
    },
    skillRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },
    skillItem: {
        flex: 1,
        gap: 8,
    },
    skillHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    skillName: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    skillProgressContainer: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    skillProgressBar: {
        height: '100%',
        borderRadius: 3,
    },

    coursesScroll: {
        paddingRight: 22,
        gap: 16,
    },
    courseCard: {
        width: width * 0.72,
        marginRight: 20,
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    courseImageContainer: {
        height: 160,
    },
    courseImage: {
        width: '100%',
        height: '100%',
    },
    courseLevelBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    courseLevelText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    courseInfo: {
        padding: 16,
    },
    courseCategory: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 6,
    },
    courseTitle: {
        fontSize: 17,
        fontWeight: '700',
        lineHeight: 22,
        marginBottom: 12,
        height: 44,
    },
    courseMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
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
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        gap: 16,
    },
    postImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
    },
    postInfo: {
        flex: 1,
        gap: 4,
    },
    postCategoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    postCategoryText: {
        fontSize: 9,
        fontWeight: '800',
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
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
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
        gap: 16,
    },
    goalIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalCardTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    goalCardSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
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
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    titleAccent: {
        width: 4,
        height: 20,
        borderRadius: 2,
    },
    videoBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    videoBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
    },
    metaDivider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginHorizontal: 8,
    },
    courseDuration: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    courseMetaText: {
        fontSize: 13,
        fontWeight: '500',
    },
});