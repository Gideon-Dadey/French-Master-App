import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
// Using expo-video instead of deprecated expo-av
// For now, using a placeholder - install expo-video for full functionality
// import { VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

export default function VideoPlayer({ source, thumbnail, style, onProgress, downloadable = false }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleDownload = async () => {
    if (!downloadable) return;
    
    try {
      // Implement download logic
      // This would download the video to local storage for offline viewing
      Alert.alert('Download', 'Video download started');
    } catch (error) {
      Alert.alert('Error', 'Failed to download video');
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Video player - Replace with expo-video when available */}
      <View style={styles.video}>
        <Text style={styles.videoPlaceholder}>Video Player</Text>
        <Text style={styles.videoUrl}>{source.uri}</Text>
      </View>
      {/* TODO: Replace with expo-video VideoView component */}
      {/* 
      <VideoView
        ref={videoRef}
        source={source}
        style={styles.video}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onPlaybackStatusUpdate={(status) => {
          setStatus(() => status);
          if (onProgress && status.positionMillis) {
            onProgress(status.positionMillis / 1000);
          }
        }}
      />
      */}

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {showControls && !loading && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={40}
              color="#fff"
            />
          </TouchableOpacity>

          {downloadable && (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownload}
            >
              <Ionicons name="download-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  videoUrl: {
    color: '#999',
    fontSize: 12,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 15,
  },
  downloadButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 10,
  },
});

