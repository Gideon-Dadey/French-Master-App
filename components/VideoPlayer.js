import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../src/context/ThemeContext';

const { width } = Dimensions.get('window');

const VideoPlayer = React.forwardRef(({
  source,
  thumbnail,
  style,
  onProgress,
  downloadable = false,
  autoPlay = false,
  initialTime = 0,
}, ref) => {
  const videoRef = useRef(null);
  const { organicColors: theme } = useTheme();
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showThumbnail, setShowThumbnail] = useState(!autoPlay && thumbnail);

  React.useImperativeHandle(ref, () => ({
    seekTo: async (seconds) => {
      if (videoRef.current) {
        setShowThumbnail(false);
        await videoRef.current.setPositionAsync(seconds * 1000);
        await videoRef.current.playAsync();
      }
    },
    play: () => videoRef.current?.playAsync(),
    pause: () => videoRef.current?.pauseAsync(),
  }));

  const handlePlaybackStatusUpdate = (playbackStatus) => {
    setStatus(playbackStatus);

    if (playbackStatus.isLoaded) {
      setLoading(false);
      if (onProgress && playbackStatus.positionMillis) {
        onProgress(playbackStatus.positionMillis / 1000);
      }
    }

    if (playbackStatus.error) {
      setError('Failed to load video');
      setLoading(false);
    }
  };

  const handlePlay = async () => {
    setShowThumbnail(false);
    if (videoRef.current) {
      await videoRef.current.playAsync();
    }
  };

  const handleDownload = async () => {
    if (!downloadable || !source?.uri) return;

    try {
      const fileName = source.uri.split('/').pop() || 'video.mp4';
      const fileUri = FileSystem.documentDirectory + fileName;

      Alert.alert('Download', 'Video download started');

      const downloadResumable = FileSystem.createDownloadResumable(
        source.uri,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log('Download progress:', Math.round(progress * 100) + '%');
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result?.uri) {
        Alert.alert('Success', 'Video downloaded successfully!');
      }
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Error', 'Failed to download video');
    }
  };

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={() => {
            setError(null);
            setLoading(true);
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Thumbnail overlay */}
      {showThumbnail && thumbnail && (
        <TouchableOpacity
          style={styles.thumbnailContainer}
          onPress={handlePlay}
          activeOpacity={0.9}
        >
          <Image
            source={typeof thumbnail === 'string' ? { uri: thumbnail } : thumbnail}
            style={styles.thumbnail}
          />
          <View style={styles.playOverlay}>
            <View style={[styles.playButton, { backgroundColor: theme.primary + 'E6', shadowColor: theme.primary }]}>
              <Ionicons name="play" size={36} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Video Player */}
      {!showThumbnail && (
        <Video
          ref={videoRef}
          source={typeof source === 'string' ? { uri: source } : source}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          shouldPlay={autoPlay}
          onLoadStart={() => setLoading(true)}
          onLoad={(status) => {
            setLoading(false);
            if (initialTime > 0) {
              videoRef.current.setPositionAsync(initialTime * 1000);
            }
          }}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onError={(err) => {
            console.error('Video error:', err);
            setError('Failed to load video');
          }}
        />
      )}

      {/* Loading indicator */}
      {loading && !showThumbnail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}

      {/* Download button */}
      {downloadable && !showThumbnail && (
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownload}
        >
          <Ionicons name="download-outline" size={22} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
});

export default VideoPlayer;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  thumbnailContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 12,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  downloadButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
