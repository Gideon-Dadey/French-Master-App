import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  RefreshControl,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useTheme } from '../src/context/ThemeContext';
import VideoUploader from '../src/components/VideoUploader';

const SAMPLE_VIDEOS = [
  {
    id: '1',
    title: 'French Pronunciation Basics',
    description: 'Learn the fundamental French sounds and accents',
    videoUrl: 'https://sample-videos.com/french-basics.mp4',
    thumbnail: 'https://picsum.photos/400/225?random=1',
    duration: 180,
    views: 1250,
    isPublished: true,
    courseId: 'course-1',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Essential French Greetings',
    description: 'Master common French greetings and introductions',
    videoUrl: 'https://sample-videos.com/french-greetings.mp4',
    thumbnail: 'https://picsum.photos/400/225?random=2',
    duration: 240,
    views: 890,
    isPublished: true,
    courseId: 'course-2',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    title: 'Numbers in French 1-100',
    description: 'Learn to count in French from 1 to 100',
    videoUrl: 'https://sample-videos.com/french-numbers.mp4',
    thumbnail: 'https://picsum.photos/400/225?random=3',
    duration: 300,
    views: 2100,
    isPublished: false,
    courseId: 'course-3',
    createdAt: new Date('2024-02-01'),
  },
];

export default function ManageSampleVideosScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [videos, setVideos] = useState(SAMPLE_VIDEOS);
  const [refreshing, setRefreshing] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVideoId, setPlayingVideoId] = useState(null);

  const onRefresh = async () => {
    setRefreshing(true);

    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const handleDeleteVideo = (videoId) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this sample video? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setVideos(prev => prev.filter(v => v.id !== videoId));
            Alert.alert('Deleted', 'Sample video has been removed.');
          }
        },
      ]
    );
  };

  const handleTogglePublish = (videoId) => {
    setVideos(prev => prev.map(v =>
      v.id === videoId ? { ...v, isPublished: !v.isPublished } : v
    ));
  };

  const handleVideoSelected = (video) => {
    console.log('Video selected:', video);
  };

  const handleUploadComplete = (videoData) => {
    const newVideo = {
      id: Date.now().toString(),
      title: 'New Sample Video',
      description: 'Add a description...',
      videoUrl: videoData.url,
      thumbnail: null,
      duration: videoData.duration ? videoData.duration / 1000 : 0,
      views: 0,
      isPublished: false,
      courseId: null,
      createdAt: new Date(),
    };
    setVideos(prev => [newVideo, ...prev]);
    setShowUploader(false);
    Alert.alert('Success', 'Sample video uploaded! You can now edit its details.');
  };

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <LinearGradient
        colors={isDarkMode ? ['#1c1c1e', '#000'] : ['#6366f1', '#4f46e5']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sample Videos</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowUploader(!showUploader)}
          >
            <Ionicons name={showUploader ? "close" : "add"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Manage preview videos for your courses
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{videos.length}</Text>
            <Text style={styles.statLabel}>Total Videos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {videos.filter(v => v.isPublished).length}
            </Text>
            <Text style={styles.statLabel}>Published</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {videos.reduce((acc, v) => acc + v.views, 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        <View style={[styles.searchBar, { backgroundColor: isDarkMode ? '#1c1c1e' : '#fff' }]}>
          <Ionicons name="search" size={20} color={colors.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search videos..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>

        {showUploader && (
          <View style={[styles.uploaderSection, { backgroundColor: isDarkMode ? '#1c1c1e' : '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Upload New Sample Video
            </Text>
            <VideoUploader
              onVideoSelected={handleVideoSelected}
              onUploadComplete={handleUploadComplete}
              label=""
            />
          </View>
        )}

        <View style={styles.videosList}>
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video, index) => (
              <View
                key={video.id}
                style={[styles.videoCard, { backgroundColor: isDarkMode ? '#1c1c1e' : '#fff' }]}
              >

                <TouchableOpacity
                  style={styles.videoThumbnail}
                  onPress={() => setPlayingVideoId(playingVideoId === video.id ? null : video.id)}
                >
                  {playingVideoId === video.id ? (
                    <Video
                      source={{ uri: video.videoUrl }}
                      style={styles.videoPlayer}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay
                    />
                  ) : (
                    <>
                      <Image
                        source={{ uri: video.thumbnail || 'https://picsum.photos/400/225' }}
                        style={styles.thumbnailImage}
                      />
                      <View style={styles.playOverlay}>
                        <View style={styles.playButton}>
                          <Ionicons name="play" size={28} color="#fff" />
                        </View>
                      </View>
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.videoInfo}>
                  <View style={styles.videoInfoTop}>
                    <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: video.isPublished ? '#10b98115' : '#f59e0b15' }
                    ]}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: video.isPublished ? '#10b981' : '#f59e0b' }
                      ]} />
                      <Text style={[
                        styles.statusText,
                        { color: video.isPublished ? '#10b981' : '#f59e0b' }
                      ]}>
                        {video.isPublished ? 'Published' : 'Draft'}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[styles.videoDescription, { color: colors.secondaryText }]}
                    numberOfLines={2}
                  >
                    {video.description}
                  </Text>

                  <View style={styles.videoMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="eye-outline" size={14} color={colors.secondaryText} />
                      <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                        {formatViews(video.views)}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={colors.secondaryText} />
                      <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                        {formatDuration(video.duration)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.videoActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: isDarkMode ? '#2c2c2e' : '#f0f0f5' }]}
                      onPress={() => setEditingVideo(video)}
                    >
                      <Ionicons name="pencil" size={16} color="#6366f1" />
                      <Text style={[styles.actionText, { color: '#6366f1' }]}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: isDarkMode ? '#2c2c2e' : '#f0f0f5' }]}
                      onPress={() => handleTogglePublish(video.id)}
                    >
                      <Ionicons
                        name={video.isPublished ? "eye-off" : "eye"}
                        size={16}
                        color={video.isPublished ? "#f59e0b" : "#10b981"}
                      />
                      <Text style={[
                        styles.actionText,
                        { color: video.isPublished ? "#f59e0b" : "#10b981" }
                      ]}>
                        {video.isPublished ? 'Unpublish' : 'Publish'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#ef444415' }]}
                      onPress={() => handleDeleteVideo(video.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="videocam-outline" size={64} color={colors.secondaryText} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Sample Videos Yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                Upload sample videos to showcase your courses
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowUploader(true)}
              >
                <LinearGradient
                  colors={['#6366f1', '#4f46e5']}
                  style={styles.emptyButtonGradient}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.emptyButtonText}>Add First Video</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  uploaderSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  videosList: {
    gap: 16,
  },
  videoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  videoThumbnail: {
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 14,
  },
  videoInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  videoDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  videoMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  videoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

