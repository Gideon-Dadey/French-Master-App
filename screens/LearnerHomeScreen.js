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
import { getThemeColors, themeShadows } from '../src/utils/organicTheme';

const { width } = Dimensions.get('window');

const DAILY_WORDS = [
    { french: 'Bonjour', english: 'Hello', phonetic: 'bohn-ZHOOR', example: 'Bonjour, comment allez-vous?' },
    { french: 'Merci', english: 'Thank you', phonetic: 'mehr-SEE', example: 'Merci beaucoup!' },
    { french: 'Enchanté', english: 'Nice to meet you', phonetic: 'ahn-shahn-TAY', example: 'Enchanté de vous rencontrer.' },
];

export default function LearnerHomeScreen({ navigation }) {
    const { user, isAuthenticated, loadUser } = useAuth();
    const { isDarkMode } = useTheme(); // Removed toggleTheme for cleaner UI
    const gamification = useGamification();
    const gamificationStats = gamification?.stats || {};
    const theme = getThemeColors(isDarkMode);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [topCourses, setTopCourses] = useState([]);
    const [videoMasterclasses, setVideoMasterclasses] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [dailyWord, setDailyWord] = useState(DAILY_WORDS[0]);

    // Animations
    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        const today = new Date().getDate();
        setDailyWord(DAILY_WORDS[today % DAILY_WORDS.length]);
        initScreen();
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
                }
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
            >
                {/* Header Section */}
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerDate, { color: theme.textSecondary }]}>{dateInfo.weekday}, {dateInfo.day}</Text>
                    <View style={styles.headerRow}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Today</Text>
                        <TouchableOpacity
                            style={[styles.profileButton, { backgroundColor: theme.surfaceAlt, overflow: 'hidden' }]}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            {user?.avatar || user?.profilePicture ? (
                                <Image source={{ uri: user.avatar || user.profilePicture }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.primary }}>
                                    {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* 1. HERO FEATURE - Immersion Mode */}
                    <TouchableOpacity
                        style={[styles.heroCard, themeShadows.md]}
                        onPress={() => navigation.navigate('ConversationSimulator')}
                        activeOpacity={0.95}
                    >
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop' }}
                            style={styles.heroImage}
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.heroGradient}
                        >
                            <Text style={styles.heroSubtitle}>NEW EXPERIENCE</Text>
                            <Text style={styles.heroTitle}>Immersion Mode</Text>
                            <Text style={styles.heroDescription}>Step into real-world French conversations.</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* 2. DAILY FOCUS - Combined Goal & Streak */}
                    <View style={styles.sectionContainer}>
                        <TouchableOpacity
                            style={[styles.focusCard, { backgroundColor: theme.surface }, themeShadows.sm]}
                            onPress={() => navigation.navigate('Practice')}
                            activeOpacity={0.92}
                        >
                            <View style={styles.focusLeft}>
                                <View style={[styles.ringContainer, { borderColor: theme.primary }]}>
                                    <Ionicons name="flame" size={24} color={theme.primary} />
                                </View>
                                <View>
                                    <Text style={[styles.focusLabel, { color: theme.textSecondary }]}>DAILY GOAL</Text>
                                    <Text style={[styles.focusValue, { color: theme.text }]}>Keep the streak alive!</Text>
                                </View>
                            </View>
                            <View style={[styles.actionButton, { backgroundColor: theme.surfaceAlt }]}>
                                <Text style={[styles.actionButtonText, { color: theme.primary }]}>GO</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* 3. QUICK BITES - Word of Day & Missions */}
                    <View style={styles.sectionContainer}>
                        <Text style={[styles.sectionHeading, { color: theme.text }]}>Quick Practice</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>

                            {/* Word Card */}
                            <TouchableOpacity
                                style={[styles.miniCard, { backgroundColor: theme.surface }, themeShadows.sm]}
                                onPress={() => navigation.navigate('WordOfTheDay')}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: '#FF950020' }]}>
                                    <Ionicons name="book" size={20} color="#FF9500" />
                                </View>
                                <Text style={[styles.miniCardTitle, { color: theme.text }]}>Word of the Day</Text>
                                <Text style={[styles.miniCardSubtitle, { color: theme.textSecondary }]}>{dailyWord.french}</Text>
                            </TouchableOpacity>

                            {/* Stats Card */}
                            <TouchableOpacity
                                style={[styles.miniCard, { backgroundColor: theme.surface }, themeShadows.sm]}
                                onPress={() => navigation.navigate('Achievements')}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: '#34C75920' }]}>
                                    <Ionicons name="stats-chart" size={20} color="#34C759" />
                                </View>
                                <Text style={[styles.miniCardTitle, { color: theme.text }]}>My Progress</Text>
                                <Text style={[styles.miniCardSubtitle, { color: theme.textSecondary }]}>{gamificationStats.xp || 0} XP Earned</Text>
                            </TouchableOpacity>

                            {/* Review Card */}
                            <TouchableOpacity
                                style={[styles.miniCard, { backgroundColor: theme.surface }, themeShadows.sm]}
                                onPress={() => navigation.navigate('Flashcards')}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: '#5856D620' }]}>
                                    <Ionicons name="documents" size={20} color="#5856D6" />
                                </View>
                                <Text style={[styles.miniCardTitle, { color: theme.text }]}>Review</Text>
                                <Text style={[styles.miniCardSubtitle, { color: theme.textSecondary }]}>Flashcards</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* 4. DISCOVERY - Featured Courses */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={[styles.sectionHeading, { color: theme.text }]}>Mastery Path</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
                                <Text style={{ color: theme.primary, fontWeight: '600' }}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                            {topCourses.map((course, index) => (
                                <TouchableOpacity
                                    key={course._id || index}
                                    style={[styles.courseCard, { backgroundColor: theme.surface }, themeShadows.md]}
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
                                        <Text style={[styles.courseTitle, { color: theme.text }]} numberOfLines={2}>{course.title}</Text>
                                        <Text style={[styles.courseMeta, { color: theme.textSecondary }]}>{course.level} • {course.rating?.average?.toFixed(1) || 4.8} ★</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 5. WATCH & LEARN - Video Masterclasses */}
                    {videoMasterclasses.length > 0 && (
                        <View style={styles.sectionContainer}>
                            <Text style={[styles.sectionHeading, { color: theme.text }]}>Watch & Learn</Text>
                            {videoMasterclasses.slice(0, 3).map((video, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.videoRow, { borderBottomColor: theme.border }]}
                                    onPress={() => navigation.navigate('CourseDetail', { courseId: video._id })}
                                >
                                    <Image
                                        source={getCourseImage(video._id, index, video.category, video.title)}
                                        style={styles.videoThumb}
                                    />
                                    <View style={styles.videoInfo}>
                                        <Text style={[styles.videoTitle, { color: theme.text }]} numberOfLines={2}>{video.title}</Text>
                                        <Text style={[styles.videoDuration, { color: theme.textSecondary }]}>Video Masterclass • {video.duration || '15'}m</Text>
                                    </View>
                                    <Ionicons name="play-circle" size={32} color={theme.primary} />
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
        paddingBottom: 40,
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
    // Hero Card
    heroCard: {
        marginHorizontal: 22,
        height: 420,
        borderRadius: 28, // Apple style large radius
        overflow: 'hidden',
        marginBottom: 32,
        backgroundColor: '#000', // fallback
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
        bottom: 0,
        height: 200, // fade from bottom
        padding: 24,
        justifyContent: 'flex-end',
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    heroTitle: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
        lineHeight: 36,
    },
    heroDescription: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 20,
    },
    // Focus Card (Goal)
    sectionContainer: {
        marginBottom: 32,
    },
    focusCard: {
        marginHorizontal: 22,
        padding: 20,
        borderRadius: 22,
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
        borderRadius: 22,
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