import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VideoPlayer from '../components/VideoPlayer';
import { lessonsAPI } from '../src/services/api';

export default function LessonScreen({ route, navigation }) {
  const lessonId = route?.params?.lessonId;
  const courseId = route?.params?.courseId;
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (lessonId) {
      loadLesson();
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

    // Update progress every 10 seconds
    if (Math.floor(watchedSeconds) % 10 === 0) {
      try {
        await lessonsAPI.updateProgress(lessonId, {
          watchedDuration: watchedSeconds,
          isCompleted: progressPercent >= 90,
        });

        if (progressPercent >= 90 && !isCompleted) {
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
  };

  if (!lessonId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Lesson ID is required</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Lesson not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <VideoPlayer
        source={{ uri: lesson.videoUrl }}
        thumbnail={lesson.thumbnail}
        style={styles.videoPlayer}
        onProgress={handleProgress}
        downloadable={lesson.isDownloadable}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{lesson.title}</Text>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>

        {lesson.description && (
          <Text style={styles.description}>{lesson.description}</Text>
        )}

        {lesson.resources && lesson.resources.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resources</Text>
            {lesson.resources.map((resource, index) => (
              <TouchableOpacity key={index} style={styles.resourceItem}>
                <Ionicons
                  name={
                    resource.type === 'pdf'
                      ? 'document-text'
                      : resource.type === 'link'
                      ? 'link'
                      : 'download'
                  }
                  size={20}
                  color="#1E88E5"
                />
                <Text style={styles.resourceText}>{resource.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {lesson.quiz && lesson.quiz.enabled && (
          <TouchableOpacity style={styles.quizButton}>
            <Ionicons name="help-circle" size={24} color="#fff" />
            <Text style={styles.quizButtonText}>Take Quiz</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    gap: 10,
  },
  resourceText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E88E5',
    borderRadius: 12,
    paddingVertical: 15,
    gap: 10,
    marginTop: 20,
  },
  quizButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

