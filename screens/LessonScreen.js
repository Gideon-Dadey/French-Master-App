import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Linking,
  Share,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import VideoPlayer from '../components/VideoPlayer';
import { lessonsAPI } from '../src/services/api';
import { getThemeColors, themeShadows, themeRadius } from '../src/utils/organicTheme';

const { width, height } = Dimensions.get('window');

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

export default function LessonScreen({ route, navigation }) {
  const lessonId = route?.params?.lessonId;
  const courseId = route?.params?.courseId;
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    } else {
      setLoading(false);
    }
    startAnimations();
  }, [lessonId]);

  const startAnimations = () => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.stagger(100, cardAnims.map(anim =>
      Animated.spring(anim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true })
    )).start();
  };

  const loadLesson = async () => {
    try {
      const response = await lessonsAPI.getById(lessonId);
      setLesson(response.data.data.lesson);
      if (response.data.data.progress) {
        setProgress(response.data.data.progress.watchedDuration);
        setIsCompleted(response.data.data.progress.isCompleted);
      }
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProgress = async (watchedSeconds) => {
    if (!lesson) return;
    const totalSeconds = lesson.videoDuration;
    const progressPercent = (watchedSeconds / totalSeconds) * 100;

    // Update progress in state
    setProgress(watchedSeconds);

    if (Math.floor(watchedSeconds) % 10 === 0) {
      try {
        await lessonsAPI.updateProgress(lessonId, {
          watchedDuration: watchedSeconds,
          isCompleted: progressPercent >= 90,
        });
        if (progressPercent >= 90 && !isCompleted) {
          setIsCompleted(true);
        }
      } catch (error) { }
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this lesson: ${lesson?.title}`,
        title: lesson?.title,
      });
    } catch (error) { }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = () => {
    if (!lesson?.videoDuration || !progress) return 0;
    return Math.min((progress / lesson.videoDuration) * 100, 100);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [200, 250],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={60} color={theme.error} />
        <Text style={[styles.errorTitle, { color: theme.text }]}>Lesson Not Found</Text>
        <TouchableOpacity style={styles.backBtnLarge} onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Floating Navigation Bar (appears on scroll) */}
      <Animated.View style={[styles.floatingNavBar, { backgroundColor: theme.surface + 'F8', opacity: headerOpacity, borderBottomColor: theme.border }]}>
        <View style={styles.navBarContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: theme.text }]} numberOfLines={1}>{lesson.title}</Text>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        showsVerticalScrollIndicator={false}
      >
        {/* Video Player Section */}
        <View style={[styles.videoWrapper, themeShadows.md]}>
          <VideoPlayer
            source={{ uri: lesson.videoUrl }}
            thumbnail={lesson.thumbnail}
            style={styles.videoPlayer}
            onProgress={handleProgress}
            downloadable={lesson.isDownloadable}
          />

          {/* Overlay Controls */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <BackgroundBlur style={{ top: 0, right: -50 }} color={theme.primary} size={300} />

          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Title & Stats */}
            <Animated.View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm, { transform: [{ translateY: cardAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
              <View style={styles.headerRow}>
                <View style={styles.titleInfo}>
                  <Text style={[styles.lessonTitle, { color: theme.text }]}>{lesson.title}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                      <Text style={[styles.metaText, { color: theme.textSecondary }]}>{formatDuration(lesson.videoDuration || 0)}</Text>
                    </View>
                    <View style={[styles.dot, { backgroundColor: theme.border }]} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>Lesson Content</Text>
                  </View>
                </View>
                {isCompleted && (
                  <View style={[styles.completeBadge, { backgroundColor: theme.success + '15' }]}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                    <Text style={[styles.completeText, { color: theme.success }]}>COMPLETED</Text>
                  </View>
                )}
              </View>

              {/* Minimal Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>Current Progress</Text>
                  <Text style={[styles.progressVal, { color: theme.primary }]}>{Math.round(getProgressPercent())}%</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
                  <LinearGradient
                    colors={[theme.primary, theme.primaryLight || theme.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${getProgressPercent()}%` }]}
                  />
                </View>
              </View>
            </Animated.View>

            {/* Description */}
            {lesson.description && (
              <Animated.View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm, { transform: [{ translateY: cardAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.accent, { backgroundColor: theme.primary }]} />
                  <Text style={[styles.cardTitle, { color: theme.text }]}>Description</Text>
                </View>
                <Text style={[styles.description, { color: theme.textSecondary }]}>{lesson.description}</Text>
              </Animated.View>
            )}

            {/* Resources */}
            {lesson.resources?.length > 0 && (
              <Animated.View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm, { transform: [{ translateY: cardAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.accent, { backgroundColor: theme.secondary }]} />
                  <Text style={[styles.cardTitle, { color: theme.text }]}>Learning Resources</Text>
                </View>
                <View style={styles.resourceList}>
                  {lesson.resources.map((res, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.resourceItem, { borderBottomColor: theme.border, borderBottomWidth: index === lesson.resources.length - 1 ? 0 : 1 }]}
                      onPress={() => res.url && Linking.openURL(res.url)}
                    >
                      <View style={[styles.resourceIcon, { backgroundColor: theme.secondary + '10' }]}>
                        <Ionicons
                          name={res.type === 'pdf' ? 'document-text-outline' : 'link-outline'}
                          size={20}
                          color={theme.secondary}
                        />
                      </View>
                      <View style={styles.resourceInfo}>
                        <Text style={[styles.resourceName, { color: theme.text }]} numberOfLines={1}>{res.title}</Text>
                        <Text style={[styles.resourceType, { color: theme.textMuted }]}>{res.type?.toUpperCase() || 'DOCUMENT'}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Quick Quiz */}
            {lesson.quiz?.enabled && (
              <Animated.View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm, { transform: [{ translateY: cardAnims[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                <TouchableOpacity style={styles.quizContent}>
                  <LinearGradient
                    colors={[theme.accent + '15', 'transparent']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={[styles.quizIcon, { backgroundColor: theme.accent + '15' }]}>
                    <Ionicons name="help-circle-outline" size={24} color={theme.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.quizTitle, { color: theme.text }]}>Quick Assessment</Text>
                    <Text style={[styles.quizSubtitle, { color: theme.textSecondary }]}>Test what you've just learned</Text>
                  </View>
                  <View style={[styles.startBtn, { backgroundColor: theme.accent }]}>
                    <Text style={styles.startBtnText}>Start</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Next Action */}
            <Animated.View style={[styles.footer, { transform: [{ translateY: cardAnims[4].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
              <TouchableOpacity style={[styles.nextBtn, themeShadows.md]}>
                <LinearGradient
                  colors={[theme.primary, theme.primaryLight || theme.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.nextGradient}
                >
                  <View>
                    <Text style={styles.nextLabel}>CONTINUE JOURNEY</Text>
                    <Text style={styles.nextTitle}>Go to Next Lesson</Text>
                  </View>
                  <View style={styles.nextArrow}>
                    <Ionicons name="arrow-forward" size={24} color="#FFF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

          </Animated.View>
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 20,
  },
  floatingNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    zIndex: 100,
    borderBottomWidth: 1,
  },
  navBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 50,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  videoWrapper: {
    width: width,
    height: width * 0.56,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  videoPlayer: {
    flex: 1,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 22,
    marginTop: -10,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleInfo: {
    flex: 1,
    marginRight: 10,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 6,
    lineHeight: 30,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  completeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressVal: {
    fontSize: 13,
    fontWeight: '900',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  accent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  resourceList: {
    marginTop: 4,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  resourceIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  resourceType: {
    fontSize: 11,
    fontWeight: '600',
  },
  quizContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    gap: 16,
  },
  quizIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  quizSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  startBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  footerStatus: {
    alignItems: 'center',
    marginBottom: 24,
  },
  nextBtn: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  nextLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  nextTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  nextArrow: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
