import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Video, ResizeMode } from 'expo-av';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function VideoUploader({
  onVideoSelected,
  onUploadComplete,
  currentVideo,
  label = "Upload Sample Video",
  maxDuration = 300,
  style,
}) {
  const { organicColors: theme, isDarkMode } = useTheme();
  // The instruction implies using 'theme' for organicColors and replacing hardcoded values.
  // The original code had `const colors = theme;` for compatibility, which is now redundant if 'theme' is used directly.
  // I will remove the redundant `colors` declaration and use `theme` directly.
  const [selectedVideo, setSelectedVideo] = useState(currentVideo || null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoLoading, setVideoLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload videos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: maxDuration,
      });

      if (!result.canceled && result.assets[0]) {
        const video = result.assets[0];

        if (video.duration && video.duration > maxDuration * 1000) {
          Alert.alert(
            'Video Too Long',
            `Please select a video shorter than ${Math.floor(maxDuration / 60)} minutes.`,
            [{ text: 'OK' }]
          );
          return;
        }

        setSelectedVideo({
          uri: video.uri,
          type: video.type || 'video/mp4',
          duration: video.duration,
          width: video.width,
          height: video.height,
        });

        if (onVideoSelected) {
          onVideoSelected(video);
        }
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    }
  };

  const pickFromDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const video = result.assets[0];
        setSelectedVideo({
          uri: video.uri,
          type: video.mimeType || 'video/mp4',
          name: video.name,
        });

        if (onVideoSelected) {
          onVideoSelected(video);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      {selectedVideo ? (
        <View style={styles.videoPreviewContainer}>
          <Video
            source={{ uri: selectedVideo.uri }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
          />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => setSelectedVideo(null)}
          >
            <Ionicons name="close-circle" size={28} color={theme.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadPicker, { borderColor: theme.border }]}
          onPress={pickVideo}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[theme.surface, theme.background]}
            style={styles.uploadPickerGradient}
          >
            <View style={[styles.uploadIcon, { backgroundColor: theme.surfaceAlt || theme.borderLight }]}>
              <Ionicons name="videocam" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.uploadTitle, { color: theme.text }]}>
              Add Sample Video
            </Text>
            <Text style={[styles.uploadSubtitle, { color: theme.textSecondary }]}>
              Tap to record or choose from gallery
            </Text>
            <View style={styles.formatTags}>
              <View style={[styles.formatTag, { backgroundColor: theme.surfaceAlt || theme.borderLight }]}>
                <Text style={[styles.formatTagText, { color: theme.textSecondary }]}>MP4</Text>
              </View>
              <View style={[styles.formatTag, { backgroundColor: theme.surfaceAlt || theme.borderLight }]}>
                <Text style={[styles.formatTagText, { color: theme.textSecondary }]}>MOV</Text>
              </View>
              <View style={[styles.formatTag, { backgroundColor: theme.surfaceAlt || theme.borderLight }]}>
                <Text style={[styles.formatTagText, { color: theme.textSecondary }]}>Max 5 min</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  uploadPicker: {
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadPickerGradient: {
    padding: 32,
    alignItems: 'center',
  },
  uploadIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  uploadSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  formatTags: {
    flexDirection: 'row',
    gap: 8,
  },
  formatTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  formatTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  videoPreviewContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoPreview: {
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoInfo: {
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  videoInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  videoInfoText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  videoMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  changeBtn: {
    backgroundColor: '#6366f115',
  },
  changeBtnText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  removeBtn: {
    backgroundColor: '#ef444415',
  },
  removeBtnText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  uploadBtn: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
});

