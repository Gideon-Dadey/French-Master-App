import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Linking,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import { lessonsAPI, usersAPI, notesAPI } from '../src/services/api';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = width * 0.56;

export default function LessonScreen({ route, navigation }) {
  const lessonId = route?.params?.lessonId;
  const courseId = route?.params?.courseId;
  const { isDarkMode, organicColors: theme } = useTheme();
  const { user, updateUser } = useAuth();

  // L'Alliance Theme Colors - derived from Organic Theme
  const bgColor = theme.background;
  const cardColor = theme.surface;
  const textColor = theme.text;
  const subTextColor = theme.textSecondary;
  const accentColor = theme.primary;
  const goldColor = theme.secondary;
  const borderColor = theme.border;

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [startPosition, setStartPosition] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookmarking, setBookmarking] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [lastSavedProgress, setLastSavedProgress] = useState(0);
  const videoPlayerRef = useRef(null);

  const isBookmarked = user?.bookmarkedLessons?.includes(lessonId);

  useEffect(() => {
    if (lessonId) {
      loadLesson();
      loadNotes();
    } else {
      setLoading(false);
    }
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const response = await lessonsAPI.getById(lessonId);
      setLesson(response.data.data.lesson);
      if (response.data.data.progress) {
        setProgress(response.data.data.progress.watchedDuration);
        setStartPosition(response.data.data.progress.watchedDuration);
        setLastSavedProgress(response.data.data.progress.watchedDuration);
        setIsCompleted(response.data.data.progress.isCompleted);
      }
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    setLoadingNotes(true);
    try {
      const res = await notesAPI.getByLesson(lessonId);
      setNotes(res.data.data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      const res = await notesAPI.create({
        lessonId,
        content: newNote,
        timestamp: progress // Link to current video time
      });
      setNotes([...notes, res.data.data].sort((a, b) => a.timestamp - b.timestamp));
      setNewNote('');
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await notesAPI.delete(noteId);
      setNotes(notes.filter(n => n._id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const toggleBookmark = async () => {
    if (bookmarking) return;
    try {
      setBookmarking(true);
      const res = await usersAPI.toggleBookmarkLesson(lessonId);
      if (res.data.success) {
        // Update user context with new bookmarkedLessons array
        await updateUser({ bookmarkedLessons: res.data.data });
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setBookmarking(false);
    }
  };

  const handleProgress = async (watchedSeconds) => {
    if (!lesson) return;
    const totalSeconds = lesson.videoDuration || 0;
    const progressPercent = totalSeconds > 0 ? (watchedSeconds / totalSeconds) * 100 : 0;

    setProgress(watchedSeconds);

    // Save progress every 10 seconds or when significantly ahead/behind
    if (Math.abs(watchedSeconds - lastSavedProgress) >= 10 || (progressPercent >= 90 && !isCompleted)) {
      try {
        setLastSavedProgress(watchedSeconds);
        await lessonsAPI.updateProgress(lessonId, {
          watchedDuration: Math.floor(watchedSeconds),
          isCompleted: progressPercent >= 90,
        });
        if (progressPercent >= 90 && !isCompleted) {
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('Failed to sync progress:', error);
      }
    }
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

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={goldColor} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: bgColor }]}>
        <Ionicons name="alert-circle-outline" size={60} color="#C94C4C" />
        <Text style={[styles.errorTitle, { color: textColor }]}>Lesson Not Found</Text>
        <TouchableOpacity
          style={[styles.backBtnLarge, { backgroundColor: accentColor }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#FFF', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Video Player - Full Width */}
      <View style={styles.videoContainer}>
        <VideoPlayer
          ref={videoPlayerRef}
          source={{ uri: lesson.videoUrl }}
          thumbnail={lesson.thumbnail}
          style={styles.videoPlayer}
          onProgress={handleProgress}
          initialTime={startPosition}
          downloadable={lesson.isDownloadable}
        />
      </View>

      {/* Content Below Video */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header with Back, Title and Bookmark */}
        <View style={styles.lessonHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={textColor} />
          </TouchableOpacity>

          <View style={styles.lessonTitleSection}>
            <Text style={[styles.lessonTitle, { color: textColor }]} numberOfLines={2}>
              {lesson.title}
            </Text>
            <View style={styles.lessonMeta}>
              <Ionicons name="play-circle" size={14} color={subTextColor} />
              <Text style={[styles.lessonMetaText, { color: subTextColor }]}>
                {formatDuration(lesson.videoDuration || 0)}
              </Text>
              {isCompleted && (
                <>
                  <View style={[styles.dotSeparator, { backgroundColor: borderColor }]} />
                  <Ionicons name="checkmark-circle" size={14} color="#2E7D5A" />
                  <Text style={[styles.lessonMetaText, { color: '#2E7D5A' }]}>Completed</Text>
                </>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.bookmarkButton, { backgroundColor: isBookmarked ? goldColor + '20' : 'transparent' }]}
            onPress={toggleBookmark}
          >
            {bookmarking ? (
              <ActivityIndicator size="small" color={goldColor} />
            ) : (
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={22}
                color={isBookmarked ? goldColor : textColor}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressLabel, { color: subTextColor }]}>Your progress</Text>
            <Text style={[styles.progressPercent, { color: goldColor }]}>
              {Math.round(getProgressPercent())}%
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: borderColor }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${getProgressPercent()}%`, backgroundColor: goldColor }
              ]}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: borderColor }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'overview' ? goldColor : subTextColor }
            ]}>
              Overview
            </Text>
            {activeTab === 'overview' && <View style={[styles.tabIndicator, { backgroundColor: goldColor }]} />}
          </TouchableOpacity>

          {lesson.resources?.length > 0 && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'resources' && styles.tabActive]}
              onPress={() => setActiveTab('resources')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'resources' ? goldColor : subTextColor }
              ]}>
                Resources ({lesson.resources.length})
              </Text>
              {activeTab === 'resources' && <View style={[styles.tabIndicator, { backgroundColor: goldColor }]} />}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
            onPress={() => setActiveTab('notes')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'notes' ? goldColor : subTextColor }
            ]}>
              Notes ({notes.length})
            </Text>
            {activeTab === 'notes' && <View style={[styles.tabIndicator, { backgroundColor: goldColor }]} />}
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View style={styles.contentSection}>
            {/* About this lesson */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>About this lesson</Text>
              <Text style={[styles.descriptionText, { color: subTextColor }]}>
                {lesson.description || 'No description available for this lesson.'}
              </Text>
            </View>

            {/* What you'll learn */}
            {lesson.objectives && lesson.objectives.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>What you'll learn</Text>
                {lesson.objectives.map((obj, index) => (
                  <View key={index} style={styles.objectiveItem}>
                    <Ionicons name="checkmark" size={18} color={goldColor} />
                    <Text style={[styles.objectiveText, { color: subTextColor }]}>{obj}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'resources' && (
          <View style={styles.contentSection}>
            {/* Resources List */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Downloadable Resources</Text>
              {lesson.resources?.map((res, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.resourceItem, { backgroundColor: cardColor }]}
                  onPress={() => res.url && Linking.openURL(res.url)}
                >
                  <View style={[styles.resourceIcon, { backgroundColor: accentColor }]}>
                    <Ionicons
                      name={res.type === 'pdf' ? 'document-text' : 'link'}
                      size={20}
                      color="#FFF"
                    />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={[styles.resourceName, { color: textColor }]} numberOfLines={1}>
                      {res.title}
                    </Text>
                    <Text style={[styles.resourceType, { color: subTextColor }]}>
                      {res.type?.toUpperCase() || 'DOCUMENT'}
                    </Text>
                  </View>
                  <Ionicons name="download-outline" size={20} color={goldColor} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'notes' && (
          <View style={styles.contentSection}>
            {/* Notes Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Personal Notes</Text>
              <View style={[styles.noteInputContainer, { backgroundColor: cardColor, borderColor: borderColor }]}>
                <TextInput
                  style={[styles.noteInput, { color: textColor }]}
                  placeholder="Take a note at this moment..."
                  placeholderTextColor={subTextColor}
                  value={newNote}
                  onChangeText={setNewNote}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.saveNoteBtn, { backgroundColor: goldColor }]}
                  onPress={handleAddNote}
                  disabled={savingNote}
                >
                  {savingNote ? (
                    <ActivityIndicator size="small" color="#1A2332" />
                  ) : (
                    <Ionicons name="add" size={24} color="#1A2332" />
                  )}
                </TouchableOpacity>
              </View>

              {loadingNotes ? (
                <ActivityIndicator size="small" color={goldColor} style={{ marginTop: 20 }} />
              ) : (
                <View style={styles.notesList}>
                  {notes.length === 0 ? (
                    <Text style={[styles.emptyNotesText, { color: subTextColor }]}>
                      No notes yet. Take a note to remember key parts of the lesson.
                    </Text>
                  ) : (
                    notes.map((note) => (
                      <View key={note._id} style={[styles.noteItem, { backgroundColor: cardColor, borderColor: borderColor }]}>
                        <View style={styles.noteHeader}>
                          <TouchableOpacity
                            style={[styles.noteTimestamp, { backgroundColor: accentColor }]}
                            onPress={() => videoPlayerRef.current?.seekTo(note.timestamp)}
                          >
                            <Text style={styles.noteTimestampText}>{formatDuration(note.timestamp)}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteNote(note._id)}>
                            <Ionicons name="trash-outline" size={18} color="#C94C4C" />
                          </TouchableOpacity>
                        </View>
                        <Text style={[styles.noteContent, { color: textColor }]}>{note.content}</Text>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Next Lesson Button */}
        <View style={styles.nextSection}>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: goldColor }]}
            onPress={() => {
              // Navigate to next lesson logic here
              navigation.goBack();
            }}
          >
            <Text style={styles.nextButtonText}>Complete & Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#1A2332" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 20,
  },
  backBtnLarge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  // Video
  videoContainer: {
    width: width,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  videoPlayer: {
    flex: 1,
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },

  // Lesson Header
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: -4,
  },
  lessonTitleSection: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lessonMetaText: {
    fontSize: 13,
  },
  bookmarkButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
  },

  // Progress
  progressSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 14,
    marginRight: 24,
    position: 'relative',
  },
  tabActive: {},
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
  },

  // Content
  contentSection: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },

  // Objectives
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  // Resources
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  resourceType: {
    fontSize: 12,
  },

  // Next Button
  nextSection: {
    padding: 16,
    paddingTop: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  nextButtonText: {
    color: '#1A2332',
    fontSize: 16,
    fontWeight: '700',
  },

  // Notes
  noteInputContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  noteInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 40,
    maxHeight: 100,
  },
  saveNoteBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  notesList: {
    gap: 12,
  },
  noteItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTimestamp: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  noteTimestampText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyNotesText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 40,
    fontStyle: 'italic',
  },
});
