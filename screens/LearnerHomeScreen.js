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
import { coursesAPI, blogAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { getCourseImage } from '../src/utils/courseImages';
import PremiumErrorState from '../src/components/PremiumErrorState';
import { gamificationService } from '../src/services/gamificationService';
import { themeShadows } from '../src/utils/organicTheme';

const { width } = Dimensions.get('window');

const DAILY_WORDS = [
    { french: 'Bonjour', english: 'Hello', phonetic: 'bohn-ZHOOR', example: 'Bonjour, comment allez-vous?' },
    { french: 'Merci', english: 'Thank you', phonetic: 'mehr-SEE', example: 'Merci beaucoup!' },
    { french: 'Enchanté', english: 'Nice to meet you', phonetic: 'ahn-shahn-TAY', example: 'Enchanté de vous rencontrer.' },
];

// Immersion Mode rotating images - changes every 15 minutes
const IMMERSION_IMAGES = [
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop', // People collaborating
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop', // Study group
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop', // Students learning
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2032&auto=format&fit=crop', // Friends talking
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2049&auto=format&fit=crop', // Group discussion
    'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=2074&auto=format&fit=crop', // Team working
    'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop', // Collaborative work
    'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=2070&auto=format&fit=crop', // Friends laughing
];

export default function LearnerHomeScreen({ navigation }) {
    const { user, isAuthenticated, loadUser } = useAuth();
    const { isDarkMode, organicColors: theme } = useTheme();
    const gamification = useGamification();
    const gamificationStats = gamification?.stats || {};

    // L'Alliance Premium Theme - derived from Organic Theme
    const navyColor = theme.primary;
    const goldColor = theme.secondary;
    const bgColor = theme.background;
    const surfaceColor = theme.surface;
    const mutedColor = theme.textSecondary;
    const lightBlue = theme.borderLight || theme.border;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [topCourses, setTopCourses] = useState([]);
    const [videoMasterclasses, setVideoMasterclasses] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [dailyWord, setDailyWord] = useState(DAILY_WORDS[0]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Animations
    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        const today = new Date().getDate();
        setDailyWord(DAILY_WORDS[today % DAILY_WORDS.length]);

        // Calculate which image to show based on 15-minute intervals
        const updateImageIndex = () => {
            const now = new Date();
            const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
            const fifteenMinuteSlot = Math.floor(minutesSinceMidnight / 15);
            const imageIndex = fifteenMinuteSlot % IMMERSION_IMAGES.length;
            setCurrentImageIndex(imageIndex);
        };

        updateImageIndex(); // Set initial image

        // Check every minute if we need to update (to catch the 15-minute boundary)
        const imageInterval = setInterval(updateImageIndex, 60000);

        initScreen();
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();

        return () => clearInterval(imageInterval);
    }, []);

    const initScreen = async () => {
        await loadData();
        if (isAuthenticated && user) {
            await gamificationService.checkAndUpdateStreak(user);
        }
    };

    const loadData = async () => {
        try {
            if (!refreshing) setLoading(true);
            const [coursesRes, blogRes, videoRes] = await Promise.allSettled([
                coursesAPI.getFeatured(),
                blogAPI.getAll({ limit: 3 }),
                coursesAPI.getAll({ category: 'video-masterclass', limit: 5 }),
            ]);

            if (coursesRes.status === 'fulfilled') setTopCourses(coursesRes.value?.data?.data || []);
            if (blogRes.status === 'fulfilled') setRecentPosts(blogRes.value?.data?.data || []);
            if (videoRes.status === 'fulfilled') setVideoMasterclasses(videoRes.value?.data?.data || []);

        } catch (err) {
            console.error(err);
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

    const formatDate = () => {
        const date = new Date();
        return {
            weekday: date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
            day: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
        };
    };

    const dateInfo = formatDate();

    if (loading && !refreshing) return <LoadingSpinner />;

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />

            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerDate, { color: mutedColor }]}>{dateInfo.weekday}, {dateInfo.day}</Text>
                    <View style={styles.headerRow}>
                        <Text style={[styles.headerTitle, { color: navyColor }]}>L'Alliance</Text>
                        <TouchableOpacity
                            style={[styles.profileButton, { backgroundColor: lightBlue, overflow: 'hidden' }]}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            {user?.avatar || user?.profilePicture ? (
                                <Image source={{ uri: user.avatar || user.profilePicture }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <Ionicons name="person-sharp" size={20} color={navyColor} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* 1. HERO FEATURE - AI Studio: Mirah AI */}
                    <TouchableOpacity
                        style={[styles.heroCard, themeShadows.lg]}
                        onPress={() => navigation.navigate('ConversationSimulator')}
                        activeOpacity={0.97}
                    >
                        <Image
                            source={{ uri: IMMERSION_IMAGES[currentImageIndex] }}
                            style={styles.heroImage}
                        />
                        {/* Multi-layer gradient for depth */}
                        <LinearGradient
                            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,1)']}
                            locations={[0, 0.4, 0.9]}
                            style={styles.heroGradient}
                        >
                            {/* Top floating badges */}
                            <View style={styles.heroTopRow}>
                                <View style={styles.heroLiveBadge}>
                                    <View style={styles.heroLiveDot} />
                                    <Text style={styles.heroLiveText}>MIRAH ONLINE</Text>
                                </View>
                                <View style={styles.heroAiBadge}>
                                    <Ionicons name="sparkles" size={14} color="#FFD700" />
                                    <Text style={styles.heroAiText}>AI STUDIO</Text>
                                </View>
                            </View>

                            {/* Bottom content area */}
                            <View style={styles.heroBottomContent}>
                                <View style={styles.heroTagRow}>
                                    <View style={[styles.heroNewTag, { backgroundColor: goldColor }]}>
                                        <Text style={[styles.heroNewTagText, { color: navyColor }]}>PREMIUM</Text>
                                    </View>
                                    <Text style={styles.heroSubtitle}>PRIVATE AI TUTOR</Text>
                                </View>

                                <Text style={styles.heroTitle}>Mirah AI Studio</Text>
                                <Text style={styles.heroDescription}>
                                    Your private French tutor. Practice any topic, get instant feedback, and enjoy individual learning instances hidden from others.
                                </Text>

                                {/* Action row */}
                                <View style={styles.heroActionRow}>
                                    <View style={[styles.heroStartBtn, { backgroundColor: goldColor }]}>
                                        <Text style={[styles.heroStartBtnText, { color: navyColor }]}>Enter Studio</Text>
                                        <Ionicons name="mic-outline" size={18} color={navyColor} />
                                    </View>
                                    <View style={styles.heroStats}>
                                        <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.7)" />
                                        <Text style={styles.heroStatsText}>Private Instance</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* 2. DAILY FOCUS - Combined Goal & Streak */}
                    <View style={styles.sectionContainer}>
                        <TouchableOpacity
                            style={[styles.focusCard, { backgroundColor: surfaceColor, borderColor: lightBlue, borderWidth: 1 }, themeShadows.md]}
                            onPress={() => navigation.navigate('Streaks')}
                            activeOpacity={0.92}
                        >
                            <View style={styles.focusLeft}>
                                <View style={[styles.ringContainer, { borderColor: goldColor, backgroundColor: goldColor + '10' }]}>
                                    <Ionicons name="flash-sharp" size={24} color={goldColor} />
                                </View>
                                <View>
                                    <Text style={[styles.focusLabel, { color: mutedColor }]}>DAILY STREAK</Text>
                                    <Text style={[styles.focusValue, { color: navyColor }]}>
                                        {user?.streak?.current || 0} Days Active
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.actionButton, { backgroundColor: navyColor }]}>
                                <Text style={[styles.actionButtonText, { color: theme.textOnPrimary }]}>VIEW</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* 3. QUICK BITES - Word of Day & Missions */}
                    <View style={styles.sectionContainer}>
                        <Text style={[styles.sectionHeading, { color: navyColor }]}>Quick Practice</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>

                            {/* Word Card */}
                            <TouchableOpacity
                                style={[styles.miniCard, { backgroundColor: surfaceColor, borderColor: lightBlue, borderWidth: 1 }, themeShadows.sm]}
                                onPress={() => navigation.navigate('WordOfTheDay')}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: theme.warning + '15' }]}>
                                    <Ionicons name="book-sharp" size={20} color={theme.warning} />
                                </View>
                                <Text style={[styles.miniCardTitle, { color: navyColor }]}>Word of Day</Text>
                                <Text style={[styles.miniCardSubtitle, { color: mutedColor }]}>{dailyWord.french}</Text>
                            </TouchableOpacity>

                            {/* Stats Card */}
                            <TouchableOpacity
                                style={[styles.miniCard, { backgroundColor: surfaceColor, borderColor: lightBlue, borderWidth: 1 }, themeShadows.sm]}
                                onPress={() => navigation.navigate('Achievements')}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: theme.success + '15' }]}>
                                    <Ionicons name="stats-chart-sharp" size={20} color={theme.success} />
                                </View>
                                <Text style={[styles.miniCardTitle, { color: navyColor }]}>My Progress</Text>
                                <Text style={[styles.miniCardSubtitle, { color: mutedColor }]}>{gamificationStats.xp || 0} XP</Text>
                            </TouchableOpacity>

                            {/* Review Card */}
                            <TouchableOpacity
                                style={[styles.miniCard, { backgroundColor: surfaceColor, borderColor: lightBlue, borderWidth: 1 }, themeShadows.sm]}
                                onPress={() => navigation.navigate('Flashcards')}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: theme.info + '15' }]}>
                                    <Ionicons name="documents-sharp" size={20} color={theme.info} />
                                </View>
                                <Text style={[styles.miniCardTitle, { color: navyColor }]}>Review</Text>
                                <Text style={[styles.miniCardSubtitle, { color: mutedColor }]}>Flashcards</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* 4. DISCOVERY - Featured Courses */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={[styles.sectionHeading, { color: navyColor }]}>Mastery Path</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
                                <Text style={{ color: goldColor, fontWeight: '700' }}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                            {topCourses.map((course, index) => (
                                <TouchableOpacity
                                    key={course._id || index}
                                    style={[styles.courseCard, { backgroundColor: surfaceColor, borderColor: lightBlue, borderWidth: 1 }, themeShadows.md]}
                                    onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                                    activeOpacity={0.9}
                                >
                                    <View style={styles.courseImageWrapper}>
                                        <Image
                                            source={getCourseImage(course._id, index, course.category, course.title)}
                                            style={styles.courseImage}
                                        />
                                        <View style={styles.courseOverlay}>
                                            <Text style={styles.courseCategoryBadge}>{course.category?.toUpperCase() || 'COURSE'}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.courseContent}>
                                        <Text style={[styles.courseTitle, { color: navyColor }]} numberOfLines={2}>{course.title}</Text>
                                        <Text style={[styles.courseMeta, { color: mutedColor }]}>{course.level} • {course.rating?.average?.toFixed(1) || 4.8} ★</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 5. WATCH & LEARN - Video Masterclasses */}
                    {videoMasterclasses.length > 0 && (
                        <View style={styles.sectionContainer}>
                            <Text style={[styles.sectionHeading, { color: navyColor }]}>Watch & Learn</Text>
                            {videoMasterclasses.slice(0, 3).map((video, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.videoRow, { borderBottomColor: lightBlue }]}
                                    onPress={() => navigation.navigate('CourseDetail', { courseId: video._id })}
                                >
                                    <Image
                                        source={getCourseImage(video._id, index, video.category, video.title)}
                                        style={styles.videoThumb}
                                    />
                                    <View style={styles.videoInfo}>
                                        <Text style={[styles.videoTitle, { color: navyColor }]} numberOfLines={2}>{video.title}</Text>
                                        <Text style={[styles.videoDuration, { color: mutedColor }]}>Video Masterclass • {video.duration || '15'}m</Text>
                                    </View>
                                    <Ionicons name="play-circle-sharp" size={32} color={goldColor} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </Animated.View>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 80,
    },
    // Header
    headerContainer: {
        paddingHorizontal: 22,
        marginBottom: 24,
    },
    headerDate: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Hero Card - Premium Design
    heroCard: {
        marginHorizontal: 22,
        height: 440,
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 32,
        backgroundColor: '#0A1628',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        padding: 20,
        justifyContent: 'space-between',
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    heroLiveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    heroLiveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4ADE80',
    },
    heroLiveText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    heroAiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)',
    },
    heroAiText: {
        color: '#FFD700',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    heroBottomContent: {
        gap: 12,
    },
    heroTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    heroNewTag: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    heroNewTagText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    heroTitle: {
        color: '#FFF',
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1,
        lineHeight: 40,
    },
    heroDescription: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        maxWidth: '95%',
    },
    heroActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    heroStartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 16,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    heroStartBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    heroStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    heroStatsText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '600',
    },
    // Focus Card (Goal)
    sectionContainer: {
        marginBottom: 32,
    },
    focusCard: {
        marginHorizontal: 22,
        padding: 20,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    focusLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    ringContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    focusLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    focusValue: {
        fontSize: 17,
        fontWeight: '700',
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    actionButtonText: {
        fontWeight: '800',
        fontSize: 14,
    },
    // Quick Bites
    sectionHeading: {
        fontSize: 22,
        fontWeight: '800',
        marginHorizontal: 22,
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingRight: 22,
        marginBottom: 16,
    },
    horizontalScroll: {
        paddingLeft: 22,
        paddingRight: 10,
        gap: 16,
    },
    miniCard: {
        width: 140,
        height: 140,
        padding: 16,
        borderRadius: 20,
        justifyContent: 'space-between',
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniCardTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 8,
    },
    miniCardSubtitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    // Course Cards
    courseCard: {
        width: 260,
        height: 280,
        borderRadius: 20,
        overflow: 'hidden',
    },
    courseImageWrapper: {
        height: 180,
        width: '100%',
    },
    courseImage: {
        width: '100%',
        height: '100%',
    },
    courseOverlay: {
        position: 'absolute',
        top: 12,
        left: 12,
    },
    courseCategoryBadge: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    courseContent: {
        padding: 16,
    },
    courseTitle: {
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 22,
        marginBottom: 6,
    },
    courseMeta: {
        fontSize: 13,
        fontWeight: '500',
    },
    // Video Rows
    videoRow: {
        marginHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 16,
    },
    videoThumb: {
        width: 80,
        height: 60,
        borderRadius: 12,
    },
    videoInfo: {
        flex: 1,
    },
    videoTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    videoDuration: {
        fontSize: 12,
    },
});