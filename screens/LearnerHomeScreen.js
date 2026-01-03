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
import { BlurView } from 'expo-blur';
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

    // French Master Premium Theme - derived from Organic Theme
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
                {/* Ultra-Premium Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerTopRow}>
                        <View style={styles.headerTitleArea}>
                            <BlurView intensity={20} tint={isDarkMode ? 'dark' : 'light'} style={styles.headerLogoBlur}>
                                <Image source={require('../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
                            </BlurView>
                            <View>
                                <Text style={[styles.headerGreeting, { color: mutedColor }]}>
                                    {new Date().getHours() < 12 ? 'Bon Matin' : new Date().getHours() < 18 ? 'Bon Après-midi' : 'Bonsoir'},
                                </Text>
                                <Text style={[styles.headerName, { color: navyColor }]}>{user?.firstName || 'Learner'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.profileButton, { backgroundColor: '#FFF', borderColor: goldColor + '30', borderWidth: 1.5 }, themeShadows.md]}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            {user?.avatar || user?.profilePicture ? (
                                <Image source={{ uri: user.avatar || user.profilePicture }} style={styles.headerAvatar} />
                            ) : (
                                <Ionicons name="person" size={20} color={navyColor} />
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.headerSystemRow}>
                        <View style={[styles.systemStatus, { backgroundColor: navyColor + '08' }]}>
                            <View style={[styles.systemPulse, { backgroundColor: theme.success }]} />
                            <Text style={[styles.systemText, { color: navyColor }]}>SESSION ACTIVE</Text>
                        </View>
                        <View style={styles.headerDot} />
                        <Text style={[styles.headerDateLabel, { color: mutedColor }]}>{dateInfo.day.toUpperCase()}</Text>
                    </View>
                </View>

                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* 1. HERO FEATURE - AI Studio: Mirah AI */}
                    <TouchableOpacity
                        style={[styles.heroCard, themeShadows.xl]}
                        onPress={() => navigation.navigate('ConversationSimulator')}
                        activeOpacity={0.97}
                    >
                        <Image
                            source={require('../assets/mirah_tutor.png')}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />

                        <LinearGradient
                            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.95)']}
                            locations={[0, 0.3, 0.8]}
                            style={styles.heroGradient}
                        >
                            {/* Top row with sophisticated badges */}
                            <View style={styles.heroTopRow}>
                                <BlurView intensity={20} tint="dark" style={styles.heroGlassBadge}>
                                    <View style={styles.heroLiveDot} />
                                    <Text style={styles.heroLiveText}>MIRAH ONLINE</Text>
                                </BlurView>

                                <BlurView intensity={20} tint="dark" style={styles.heroGlassBadge}>
                                    <Ionicons name="sparkles" size={14} color={goldColor} />
                                    <Text style={[styles.heroAiText, { color: goldColor }]}>AI STUDIO</Text>
                                </BlurView>
                            </View>

                            {/* Bottom content area with clean typography */}
                            <View style={styles.heroBottomContent}>
                                <View style={styles.heroTagRow}>
                                    <View style={[styles.heroPremiumTag, { backgroundColor: goldColor }]}>
                                        <Text style={[styles.heroPremiumTagText, { color: navyColor }]}>PREMIUM</Text>
                                    </View>
                                    <Text style={styles.heroSubtitle}>PRIVATE LEARNING</Text>
                                </View>

                                <Text style={styles.heroTitle}>Mirah AI Studio</Text>
                                <Text style={styles.heroDescription}>
                                    Your private French tutor, reimagined. Experience individual learning instances tailored to your progress.
                                </Text>

                                {/* Action row with Clean Action Button */}
                                <View style={styles.heroActionRow}>
                                    <TouchableOpacity
                                        style={[styles.heroActionBtn, { backgroundColor: goldColor }]}
                                        onPress={() => navigation.navigate('ConversationSimulator')}
                                    >
                                        <Text style={[styles.heroActionBtnText, { color: navyColor }]}>Enter Studio</Text>
                                        <View style={[styles.heroActionBtnIcon, { backgroundColor: 'rgba(27,54,93,0.15)' }]}>
                                            <Ionicons name="arrow-forward" size={16} color={navyColor} />
                                        </View>
                                    </TouchableOpacity>

                                    <View style={styles.heroInstanceBadge}>
                                        <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.7)" />
                                        <Text style={styles.heroInstanceText}>Private Instance</Text>
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

                    {/* 3. PREMIUM STUDIO STRIP - Senior Level Actions */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.headingWithBadge}>
                                <Text style={[styles.sectionHeading, { color: navyColor, marginHorizontal: 0 }]}>Daily Studio</Text>
                                <View style={[styles.statusBadge, { backgroundColor: goldColor + '15' }]}>
                                    <View style={[styles.statusDot, { backgroundColor: goldColor }]} />
                                    <Text style={[styles.statusText, { color: goldColor }]}>SYNCED</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
                                <Text style={{ color: goldColor, fontWeight: '700', fontSize: 13 }}>ADJUST HUB</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.studioStripScroll}
                            snapToInterval={width * 0.72 + 16}
                            decelerationRate="fast"
                        >
                            {/* Card 1: Word of the Day (The Master's Voice) */}
                            <TouchableOpacity
                                style={[styles.studioCard, { backgroundColor: navyColor }, themeShadows.lg]}
                                onPress={() => navigation.navigate('WordOfTheDay')}
                                activeOpacity={0.95}
                            >
                                <LinearGradient colors={['rgba(201, 162, 39, 0.15)', 'transparent']} style={StyleSheet.absoluteFill} />
                                <View style={styles.studioCardTop}>
                                    <View style={styles.studioIconCircle}>
                                        <Ionicons name="journal" size={20} color={goldColor} />
                                    </View>
                                    <Text style={styles.studioCategory}>VOCABULARY</Text>
                                </View>
                                <View style={styles.studioCardBody}>
                                    <Text style={styles.studioCardLabel}>MOT DU JOUR</Text>
                                    <Text style={styles.studioCardMainValue}>{dailyWord.french}</Text>
                                    <Text style={styles.studioCardSubscript}>{dailyWord.phonetic}</Text>
                                </View>
                                <View style={styles.studioCardFooter}>
                                    <Text style={styles.studioCardActionText}>REVEAL LESSON</Text>
                                    <Ionicons name="chevron-forward" size={16} color={goldColor} />
                                </View>
                            </TouchableOpacity>

                            {/* Card 2: Progress Tracking (The Path) */}
                            <TouchableOpacity
                                style={[styles.studioCard, { backgroundColor: '#FFF', borderColor: lightBlue, borderWidth: 1 }, themeShadows.md]}
                                onPress={() => navigation.navigate('Achievements')}
                                activeOpacity={0.95}
                            >
                                <View style={styles.studioCardTop}>
                                    <View style={[styles.studioIconCircle, { backgroundColor: navyColor + '08' }]}>
                                        <Ionicons name="trending-up" size={20} color={navyColor} />
                                    </View>
                                    <Text style={[styles.studioCategory, { color: mutedColor }]}>MASTERY PATH</Text>
                                </View>
                                <View style={styles.studioCardBody}>
                                    <Text style={[styles.studioCardLabel, { color: mutedColor }]}>TOTAL PROGRESS</Text>
                                    <Text style={[styles.studioCardMainValue, { color: navyColor }]}>{gamificationStats.xp || 0} XP</Text>
                                    <View style={styles.miniProgressTrack}>
                                        <View style={[styles.miniProgressBar, { backgroundColor: navyColor + '10' }]}>
                                            <View style={[styles.miniProgressFill, { backgroundColor: goldColor, width: '65%' }]} />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.studioCardFooter}>
                                    <Text style={[styles.studioCardActionText, { color: navyColor }]}>VIEW STATS</Text>
                                    <Ionicons name="chevron-forward" size={16} color={navyColor} />
                                </View>
                            </TouchableOpacity>

                            {/* Card 3: Review Center (Atelier) */}
                            <TouchableOpacity
                                style={[styles.studioCard, { backgroundColor: goldColor }, themeShadows.md]}
                                onPress={() => navigation.navigate('Flashcards')}
                                activeOpacity={0.95}
                            >
                                <LinearGradient colors={['rgba(255,255,255,0.2)', 'transparent']} style={StyleSheet.absoluteFill} />
                                <View style={styles.studioCardTop}>
                                    <View style={[styles.studioIconCircle, { backgroundColor: '#FFF' }]}>
                                        <Ionicons name="layers" size={20} color={goldColor} />
                                    </View>
                                    <Text style={[styles.studioCategory, { color: navyColor }]}>ATELIER</Text>
                                </View>
                                <View style={styles.studioCardBody}>
                                    <Text style={[styles.studioCardLabel, { color: navyColor, opacity: 0.7 }]}>ACTIVE REVIEW</Text>
                                    <Text style={[styles.studioCardMainValue, { color: navyColor }]}>Flashcards</Text>
                                    <Text style={[styles.studioCardSubscript, { color: navyColor }]}>12 CARDS READY</Text>
                                </View>
                                <View style={styles.studioCardFooter}>
                                    <Text style={[styles.studioCardActionText, { color: navyColor }]}>START REVIEW</Text>
                                    <Ionicons name="chevron-forward" size={16} color={navyColor} />
                                </View>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* 4. CURATED MASTERCLASSES - Same Premium Style */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.headingWithBadge}>
                                <Text style={[styles.sectionHeading, { color: navyColor, marginHorizontal: 0 }]}>Curated Paths</Text>
                                <View style={[styles.statusBadge, { backgroundColor: theme.info + '15' }]}>
                                    <View style={[styles.statusDot, { backgroundColor: theme.info }]} />
                                    <Text style={[styles.statusText, { color: theme.info }]}>EXPERT PICK</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
                                <Text style={{ color: goldColor, fontWeight: '700', fontSize: 13 }}>BROWSE ALL</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.studioStripScroll}
                            snapToInterval={width * 0.72 + 16}
                            decelerationRate="fast"
                        >
                            {topCourses.map((course, index) => (
                                <TouchableOpacity
                                    key={course._id || index}
                                    style={[styles.courseStudioCard, { backgroundColor: surfaceColor, borderColor: lightBlue, borderWidth: 1 }, themeShadows.md]}
                                    onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
                                    activeOpacity={0.95}
                                >
                                    <View style={styles.courseImageHero}>
                                        <Image
                                            source={getCourseImage(course._id, index, course.category, course.title)}
                                            style={styles.courseHeroImg}
                                        />
                                        <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFill} />
                                        <View style={styles.courseHeroMeta}>
                                            <BlurView intensity={20} tint="dark" style={styles.courseHeroLevel}>
                                                <Text style={styles.courseLevelText}>{course.level?.toUpperCase()}</Text>
                                            </BlurView>
                                        </View>
                                    </View>

                                    <View style={styles.courseStudioContent}>
                                        <View style={styles.courseStudioTop}>
                                            <Text style={[styles.courseStudioCat, { color: goldColor }]}>{course.category?.toUpperCase() || 'MASTERCLASS'}</Text>
                                            <View style={styles.courseStudioStar}>
                                                <Ionicons name="star" size={12} color={goldColor} />
                                                <Text style={[styles.courseStarText, { color: navyColor }]}>{course.rating?.average?.toFixed(1) || 4.8}</Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.courseStudioTitle, { color: navyColor }]} numberOfLines={2}>{course.title}</Text>

                                        <View style={styles.courseStudioFooter}>
                                            <Text style={[styles.courseStudioAction, { color: navyColor }]}>ENROLL NOW</Text>
                                            <View style={[styles.courseActionCircle, { backgroundColor: goldColor }]}>
                                                <Ionicons name="arrow-forward" size={14} color={navyColor} />
                                            </View>
                                        </View>
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
    // Header Refinements
    headerContainer: {
        paddingHorizontal: 22,
        marginBottom: 32,
        marginTop: 10,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitleArea: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    headerLogoBlur: {
        width: 52,
        height: 52,
        borderRadius: 18,
        padding: 6,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(30, 58, 95, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerLogo: {
        width: '100%',
        height: '100%',
    },
    headerGreeting: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    headerName: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1.2,
        marginTop: -2,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    profileButton: {
        width: 54,
        height: 54,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    headerAvatar: {
        width: '100%',
        height: '100%',
    },
    headerSystemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    systemStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    systemPulse: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    systemText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    headerDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    headerDateLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
        opacity: 0.6,
    },
    // Bento Grid Styling
    bentoContainer: {
        flexDirection: 'row',
        paddingHorizontal: 22,
        gap: 12,
        marginTop: 4,
    },
    bentoLarge: {
        flex: 1.2,
        height: 160,
        borderRadius: 24,
        padding: 20,
        overflow: 'hidden',
        justifyContent: 'space-between',
    },
    bentoContent: {
        marginTop: 10,
    },
    bentoSmallCol: {
        flex: 1,
        gap: 12,
    },
    bentoSmall: {
        height: 74,
        borderRadius: 20,
        padding: 14,
        overflow: 'hidden',
        justifyContent: 'center',
        gap: 2,
    },
    miniCardTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        opacity: 0.6,
    },
    miniCardValue: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    miniCardSub: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
        fontStyle: 'italic',
    },
    bentoArrow: {
        position: 'absolute',
        bottom: 16,
        right: 16,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Senior Level Studio Strip Styles
    headingWithBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginHorizontal: 22,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 5,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    studioStripScroll: {
        paddingLeft: 22,
        paddingRight: 10,
        paddingVertical: 10,
        gap: 16,
    },
    studioCard: {
        width: width * 0.72,
        height: 200,
        borderRadius: 24,
        padding: 24,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    studioCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    studioIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    studioCategory: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    studioCardBody: {
        marginTop: 10,
    },
    studioCardLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    studioCardMainValue: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    studioCardSubscript: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        fontWeight: '600',
        fontStyle: 'italic',
        marginTop: 2,
    },
    miniProgressTrack: {
        marginTop: 15,
    },
    miniProgressBar: {
        height: 5,
        borderRadius: 2.5,
        width: '100%',
    },
    miniProgressFill: {
        height: '100%',
        borderRadius: 2.5,
    },
    studioCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    studioCardActionText: {
        color: '#C9A227',
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.5,
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
    heroGlassBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        overflow: 'hidden',
    },
    heroAiText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    heroBottomContent: {
        gap: 10,
    },
    heroTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    heroPremiumTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    heroPremiumTagText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.2,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    heroTitle: {
        color: '#FFF',
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: -1.5,
        lineHeight: 46,
    },
    heroDescription: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 22,
        maxWidth: '90%',
    },
    heroActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    heroActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 8,
        paddingVertical: 8,
        borderRadius: 30,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    heroActionBtnText: {
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    heroActionBtnIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroInstanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    heroInstanceText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '700',
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
        borderRadius: 12,
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
        borderRadius: 10,
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
    // Course Studio Cards
    courseStudioCard: {
        width: width * 0.72,
        height: 300,
        borderRadius: 28,
        overflow: 'hidden',
    },
    courseImageHero: {
        height: 160,
        width: '100%',
    },
    courseHeroImg: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    courseHeroMeta: {
        position: 'absolute',
        bottom: 15,
        left: 15,
    },
    courseHeroLevel: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    courseLevelText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    courseStudioContent: {
        padding: 20,
        flex: 1,
        justifyContent: 'space-between',
    },
    courseStudioTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    courseStudioCat: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },
    courseStudioStar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    courseStarText: {
        fontSize: 12,
        fontWeight: '700',
    },
    courseStudioTitle: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.5,
        lineHeight: 26,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    courseStudioFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    courseStudioAction: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    courseActionCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});