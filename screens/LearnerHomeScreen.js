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
    const [recentPosts, setRecentPosts] = useState([]);
    const [error, setError] = useState(null);
    const [dailyWord, setDailyWord] = useState(DAILY_WORDS[0]);
    const [headerInteractable, setHeaderInteractable] = useState(false);
    const [totalCoursesCount, setTotalCoursesCount] = useState(0);

    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const cardAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;



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
                coursesAPI.getAll({ limit: 1 }), // Get total count
                blogAPI.getAll({ limit: 5 }),
            ]);

            let coursesData = [];
            let postsData = [];
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

            setTopCourses(coursesData);
            setRecentPosts(postsData);
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
                                <View style={[styles.logoFrame, { borderColor: theme.border }]}>
                                    <Image source={require('../assets/logo.jpeg')} style={styles.heroLogo} />
                                </View>
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
                                    style={[styles.quickActionCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}
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
                            opacity: cardAnims[5],
                            transform: [{ translateY: cardAnims[5].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
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
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    heroTagline: {
        fontSize: 14,
        fontWeight: '500',
    },
    themeToggle: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
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
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionCard: {
        width: (width - 60) / 2,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quickActionIconBg: {
        width: 42,
        height: 42,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionLabel: {
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
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
});