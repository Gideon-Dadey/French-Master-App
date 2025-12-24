import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width } = Dimensions.get('window');

export default function AdvancedVideoHostingScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: 'Introduction to French Verbs',
      duration: '15:30',
      size: '245 MB',
      status: 'published',
      views: 1250,
      uploadDate: '2024-01-15',
      thumbnail: null,
    },
    {
      id: 2,
      title: 'French Pronunciation Basics',
      duration: '22:45',
      size: '380 MB',
      status: 'processing',
      views: 0,
      uploadDate: '2024-01-20',
      thumbnail: null,
    },
  ]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'grammar',
    quality: 'hd',
    autoOptimize: true,
  });

  const videoStats = {
    totalVideos: videos.length,
    totalStorage: '2.5 GB',
    usedStorage: '625 MB',
    totalViews: 1250,
    averageQuality: 'HD',
  };

  const storagePercentage = (625 / 2500) * 100;

  const handleUploadVideo = async () => {
    if (!uploadForm.title.trim()) {
      Alert.alert('Error', 'Please enter a video title');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to upload videos');
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Simulate video upload
      await new Promise((resolve) => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add new video to list
      const newVideo = {
        id: videos.length + 1,
        title: uploadForm.title,
        duration: '0:00',
        size: '0 MB',
        status: 'processing',
        views: 0,
        uploadDate: new Date().toISOString().split('T')[0],
        thumbnail: null,
      };

      setVideos([newVideo, ...videos]);
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        category: 'grammar',
        quality: 'hd',
        autoOptimize: true,
      });
      setUploadProgress(0);

      Alert.alert('Success', 'Video uploaded successfully! Processing will begin shortly.');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSelectThumbnail = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Handle thumbnail selection
      Alert.alert('Success', 'Thumbnail selected successfully');
    }
  };

  const handleVideoAction = (video, action) => {
    switch (action) {
      case 'edit':
        Alert.alert('Edit Video', `Edit ${video.title}`);
        break;
      case 'delete':
        Alert.alert(
          'Delete Video',
          `Are you sure you want to delete "${video.title}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                setVideos(videos.filter((v) => v.id !== video.id));
                Alert.alert('Success', 'Video deleted successfully');
              },
            },
          ]
        );
        break;
      case 'analytics':
        Alert.alert('Video Analytics', `Views: ${video.views}\nStatus: ${video.status}`);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <LinearGradient
        colors={isDarkMode 
          ? ['#1a0a2e', '#16213e', '#0f3460']
          : ['#E8EAF6', '#F3E5F5', '#E1BEE7']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#424242'} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.greeting, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
                Advanced Video Hosting
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Professional video management & hosting
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={() => setShowUploadModal(true)}
            >
              <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics Cards */}
        <View style={styles.statsSection}>
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.lg]}>
            <View style={styles.statsGrid}>
              <StatItem
                icon="videocam"
                value={videoStats.totalVideos}
                label="Total Videos"
                color={premiumColors.primary.main}
                colors={colors}
              />
              <StatItem
                icon="eye"
                value={videoStats.totalViews}
                label="Total Views"
                color={premiumColors.accent.emerald}
                colors={colors}
              />
              <StatItem
                icon="server"
                value={videoStats.usedStorage}
                label="Storage Used"
                color={premiumColors.accent.gold}
                colors={colors}
              />
              <StatItem
                icon="star"
                value={videoStats.averageQuality}
                label="Avg Quality"
                color={premiumColors.accent.rose}
                colors={colors}
              />
            </View>
          </View>
        </View>

        {/* Storage Usage */}
        <View style={styles.section}>
          <View style={[styles.storageCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <View style={styles.storageHeader}>
              <Text style={[styles.storageTitle, { color: colors.text }]}>Storage Usage</Text>
              <Text style={[styles.storageText, { color: colors.secondaryText }]}>
                {videoStats.usedStorage} / {videoStats.totalStorage}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <LinearGradient
                colors={[premiumColors.primary.main, premiumColors.primary.light]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${storagePercentage}%` }]}
              />
            </View>
            <Text style={[styles.storagePercentage, { color: colors.secondaryText }]}>
              {storagePercentage.toFixed(1)}% used
            </Text>
          </View>
        </View>

        {/* Video Library */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Video Library</Text>
            <TouchableOpacity onPress={() => setShowUploadModal(true)}>
              <Text style={[styles.seeAllText, { color: premiumColors.primary.main }]}>Upload New</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.videosList}>
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                colors={colors}
                onAction={handleVideoAction}
              />
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Premium Features</Text>
          <View style={styles.featuresGrid}>
            <FeatureItem
              icon="flash"
              title="Auto Optimization"
              description="Automatic video compression and optimization"
              colors={colors}
            />
            <FeatureItem
              icon="globe"
              title="CDN Delivery"
              description="Fast global content delivery network"
              colors={colors}
            />
            <FeatureItem
              icon="shield-checkmark"
              title="Secure Hosting"
              description="Enterprise-grade security and encryption"
              colors={colors}
            />
            <FeatureItem
              icon="analytics"
              title="Analytics"
              description="Detailed video performance analytics"
              colors={colors}
            />
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Upload Modal */}
      {showUploadModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Upload Video</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Video Title *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter video title"
                  placeholderTextColor={colors.secondaryText}
                  value={uploadForm.title}
                  onChangeText={(text) => setUploadForm({ ...uploadForm, title: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter video description"
                  placeholderTextColor={colors.secondaryText}
                  value={uploadForm.description}
                  onChangeText={(text) => setUploadForm({ ...uploadForm, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Video Quality</Text>
                <View style={styles.qualityOptions}>
                  {['sd', 'hd', '4k'].map((quality) => (
                    <TouchableOpacity
                      key={quality}
                      style={[
                        styles.qualityOption,
                        {
                          backgroundColor: uploadForm.quality === quality
                            ? premiumColors.primary.main
                            : colors.background,
                          borderColor: uploadForm.quality === quality
                            ? premiumColors.primary.main
                            : colors.border,
                        },
                      ]}
                      onPress={() => setUploadForm({ ...uploadForm, quality })}
                    >
                      <Text
                        style={[
                          styles.qualityText,
                          {
                            color: uploadForm.quality === quality ? '#FFFFFF' : colors.text,
                          },
                        ]}
                      >
                        {quality.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {uploading && (
                <View style={styles.uploadProgress}>
                  <Text style={[styles.progressText, { color: colors.text }]}>
                    Uploading... {uploadProgress}%
                  </Text>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${uploadProgress}%`, backgroundColor: premiumColors.primary.main },
                      ]}
                    />
                  </View>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.uploadButtonFull, { backgroundColor: premiumColors.primary.main }]}
                  onPress={handleUploadVideo}
                  disabled={uploading}
                >
                  <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>
                    {uploading ? 'Uploading...' : 'Upload Video'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

function StatItem({ icon, value, label, color, colors }) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
    </View>
  );
}

function VideoCard({ video, colors, onAction }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return premiumColors.accent.emerald;
      case 'processing':
        return premiumColors.accent.gold;
      case 'draft':
        return premiumColors.accent.sky;
      default:
        return colors.secondaryText;
    }
  };

  return (
    <View style={[styles.videoCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
      <View style={styles.videoThumbnail}>
        <LinearGradient
          colors={[premiumColors.primary.main, premiumColors.primary.main + 'DD']}
          style={styles.thumbnailGradient}
        >
          <Ionicons name="videocam" size={32} color="#FFFFFF" />
        </LinearGradient>
        <View style={styles.videoDuration}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>
      <View style={styles.videoInfo}>
        <View style={styles.videoHeader}>
          <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
            {video.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(video.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(video.status) }]}>
              {video.status}
            </Text>
          </View>
        </View>
        <View style={styles.videoMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="eye" size={14} color={colors.secondaryText} />
            <Text style={[styles.metaText, { color: colors.secondaryText }]}>{video.views} views</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={14} color={colors.secondaryText} />
            <Text style={[styles.metaText, { color: colors.secondaryText }]}>{video.uploadDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="server" size={14} color={colors.secondaryText} />
            <Text style={[styles.metaText, { color: colors.secondaryText }]}>{video.size}</Text>
          </View>
        </View>
        <View style={styles.videoActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: premiumColors.primary.main + '20' }]}
            onPress={() => onAction(video, 'analytics')}
          >
            <Ionicons name="analytics" size={16} color={premiumColors.primary.main} />
            <Text style={[styles.actionButtonText, { color: premiumColors.primary.main }]}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: premiumColors.accent.emerald + '20' }]}
            onPress={() => onAction(video, 'edit')}
          >
            <Ionicons name="create" size={16} color={premiumColors.accent.emerald} />
            <Text style={[styles.actionButtonText, { color: premiumColors.accent.emerald }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: premiumColors.error + '20' }]}
            onPress={() => onAction(video, 'delete')}
          >
            <Ionicons name="trash" size={16} color={premiumColors.error} />
            <Text style={[styles.actionButtonText, { color: premiumColors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function FeatureItem({ icon, title, description, colors }) {
  return (
    <View style={[styles.featureItem, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}>
      <View style={[styles.featureIcon, { backgroundColor: premiumColors.primary.main + '20' }]}>
        <Ionicons name={icon} size={24} color={premiumColors.primary.main} />
      </View>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureDescription, { color: colors.secondaryText }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  uploadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...premiumShadows.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  statsCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: spacing.md,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  storageCard: {
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  storageTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  storageText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  storagePercentage: {
    fontSize: fontSize.xs,
    textAlign: 'right',
  },
  videosList: {
    gap: spacing.md,
  },
  videoCard: {
    flexDirection: 'row',
    borderRadius: premiumBorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  videoThumbnail: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  thumbnailGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  videoInfo: {
    flex: 1,
    padding: spacing.md,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  videoTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  videoMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  metaText: {
    fontSize: fontSize.xs,
  },
  videoActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs / 2,
  },
  actionButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  featureItem: {
    width: '48%',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: premiumBorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  modalBody: {
    padding: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.md,
    fontSize: fontSize.md,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  qualityOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  qualityOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: premiumBorderRadius.base,
    borderWidth: 1,
    alignItems: 'center',
  },
  qualityText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  uploadProgress: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  progressText: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  uploadButtonFull: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    gap: spacing.xs,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});

