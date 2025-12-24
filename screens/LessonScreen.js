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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import VideoPlayer from '../components/VideoPlayer';
import { lessonsAPI } from '../src/services/api';

const { width } = Dimensions.get('window');

export default function LessonScreen({ route, navigation }) {
  const lessonId = route?.params?.lessonId;
  const courseId = route?.params?.courseId;
  const { colors, isDarkMode } = useTheme();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    } else {
      setLoading(false);
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [lessonId]);

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
    if (Math.floor(watchedSeconds) % 10 === 0) {
      try {
        await lessonsAPI.updateProgress(lessonId, {
          watchedDuration: watchedSeconds,
          isCompleted: progressPercent >= 90,
        });
        if (progressPercent >= 90 && !isCompleted) {
          setIsCompleted(true);
        }
      } catch (error) {}
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this lesson: ${lesson?.title}`,
        title: lesson?.title,
      });
    } catch (error) {}
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

  if (!lessonId) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={60} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Lesson Not Found</Text>
          <Text style={[styles.errorText, { color: colors.secondaryText }]}>Lesson ID is required</Text>
          <TouchableOpacity style={styles.backBtnLarge} onPress={() => navigation.goBack()}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.backBtnGradient}>
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
              <Text style={styles.backBtnText}>Go Back</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Loading lesson...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <View style={styles.errorCard}>
          <Ionicons name="document-text-outline" size={60} color="#F59E0B" />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Lesson Not Found</Text>
          <Text style={[styles.errorText, { color: colors.secondaryText }]}>This lesson may have been removed</Text>
          <TouchableOpacity style={styles.backBtnLarge} onPress={() => navigation.goBack()}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.backBtnGradient}>
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
              <Text style={styles.backBtnText}>Go Back</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Video Player */}
      <View style={styles.videoContainer}>
        <VideoPlayer
          source={{ uri: lesson.videoUrl }}
          thumbnail={lesson.thumbnail}
          style={styles.videoPlayer}
          onProgress={handleProgress}
          downloadable={lesson.isDownloadable}
        />
        {/* Overlay Header */}
        <View style={styles.videoOverlay}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.videoOverlayRight}>
            <TouchableOpacity style={styles.overlayBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            {lesson.isDownloadable && (
              <TouchableOpacity style={styles.overlayBtn}>
                <Ionicons name="download-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Title Card */}
          <View style={[styles.titleCard, { backgroundColor: colors.card }]}>
            <View style={styles.titleRow}>
              <View style={styles.titleInfo}>
                <Text style={[styles.lessonTitle, { color: colors.text }]}>{lesson.title}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
                    <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                      {formatDuration(lesson.videoDuration || 0)}
                    </Text>
                  </View>
                </View>
              </View>
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.completedGradient}>
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.completedText}>Completed</Text>
                  </LinearGradient>
                </View>
              )}
            </View>

            {/* Progress Bar */}
            {!isCompleted && progress > 0 && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.secondaryText }]}>Your Progress</Text>
                  <Text style={[styles.progressPercent, { color: colors.text }]}>{Math.round(getProgressPercent())}%</Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                  <LinearGradient colors={['#3B82F6', '#2563EB']} style={[styles.progressFill, { width: `${getProgressPercent()}%` }]} />
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          {lesson.description && (
            <View style={[styles.descriptionCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>About This Lesson</Text>
              <Text style={[styles.description, { color: colors.text }]}>{lesson.description}</Text>
            </View>
          )}

          {/* Resources */}
          {lesson.resources?.length > 0 && (
            <View style={[styles.resourcesCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Resources</Text>
              {lesson.resources.map((resource, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.resourceItem, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}
                  onPress={() => resource.url && Linking.openURL(resource.url)}
                >
                  <View style={[styles.resourceIcon, { backgroundColor: '#3B82F6' + '15' }]}>
                    <Ionicons
                      name={resource.type === 'pdf' ? 'document-text' : resource.type === 'link' ? 'link' : 'download'}
                      size={20}
                      color="#3B82F6"
                    />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={[styles.resourceTitle, { color: colors.text }]}>{resource.title}</Text>
                    <Text style={[styles.resourceType, { color: colors.secondaryText }]}>
                      {resource.type?.toUpperCase() || 'FILE'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quiz Button */}
          {lesson.quiz?.enabled && (
            <TouchableOpacity style={styles.quizBtn}>
              <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.quizBtnGradient}>
                <View style={styles.quizBtnContent}>
                  <View style={styles.quizIconContainer}>
                    <Ionicons name="help-circle" size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.quizInfo}>
                    <Text style={styles.quizTitle}>Take Quiz</Text>
                    <Text style={styles.quizSubtitle}>Test your knowledge</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Actions */}
          <View style={[styles.actionsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={[styles.actionItem, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
                <View style={[styles.actionIcon, { backgroundColor: '#EF4444' + '15' }]}>
                  <Ionicons name="heart-outline" size={22} color="#EF4444" />
                </View>
                <Text style={[styles.actionText, { color: colors.text }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionItem, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]} onPress={handleShare}>
                <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' + '15' }]}>
                  <Ionicons name="share-outline" size={22} color="#3B82F6" />
                </View>
                <Text style={[styles.actionText, { color: colors.text }]}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionItem, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
                <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' + '15' }]}>
                  <Ionicons name="flag-outline" size={22} color="#F59E0B" />
                </View>
                <Text style={[styles.actionText, { color: colors.text }]}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Next Lesson */}
          <TouchableOpacity style={styles.nextLessonBtn}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.nextLessonGradient}>
              <View style={styles.nextLessonContent}>
                <View style={styles.nextLessonInfo}>
                  <Text style={styles.nextLessonLabel}>NEXT UP</Text>
                  <Text style={styles.nextLessonTitle}>Continue to Next Lesson</Text>
                </View>
                <View style={styles.nextArrow}>
                  <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </Animated.View>
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
    padding: 20,
  },
  errorCard: {
    alignItems: 'center',
    padding: 30,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  backBtnLarge: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  backBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 16,
  },
  videoContainer: {
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: 220,
  },
  videoOverlay: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlayRight: {
    flexDirection: 'row',
    gap: 10,
  },
  overlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    padding: 16,
  },
  titleCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
  },
  completedBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  completedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  descriptionCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  resourcesCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  resourceType: {
    fontSize: 11,
    fontWeight: '500',
  },
  quizBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  quizBtnGradient: {
    padding: 20,
  },
  quizBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  quizSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  actionsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nextLessonBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextLessonGradient: {
    padding: 20,
  },
  nextLessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextLessonInfo: {},
  nextLessonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  nextLessonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nextArrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
