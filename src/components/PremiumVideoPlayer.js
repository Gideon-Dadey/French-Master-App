import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { premiumColors, premiumSpacing, premiumBorderRadius } from '../utils/premiumDesign';

const { width, height } = Dimensions.get('window');

export default function PremiumVideoPlayer({
  videoUri,
  title,
  onComplete,
  onProgress,
  autoPlay = false,
  showControls = true,
  playbackRate = 1.0,
  subtitles,
}) {
  const { colors } = useTheme();
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [speed, setSpeed] = useState(playbackRate);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);

  useEffect(() => {
    if (status.didJustFinish && onComplete) {
      onComplete();
    }
  }, [status.didJustFinish]);

  useEffect(() => {
    if (status.positionMillis && status.durationMillis) {
      setCurrentTime(status.positionMillis);
      setDuration(status.durationMillis);
      if (onProgress) {
        onProgress(status.positionMillis / status.durationMillis);
      }
    }
  }, [status.positionMillis, status.durationMillis]);

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
        await videoRef.current.setRateAsync(speed, true);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = async (position) => {
    if (videoRef.current && duration) {
      const seekPosition = (position / 100) * duration;
      await videoRef.current.setPositionAsync(seekPosition);
    }
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSpeedChange = async (newSpeed) => {
    setSpeed(newSpeed);
    setShowSpeedMenu(false);
    if (videoRef.current && isPlaying) {
      await videoRef.current.setRateAsync(newSpeed, true);
    }
  };

  const addBookmark = () => {
    setShowBookmarkModal(true);
    // In production, save bookmark to backend
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        onPlaybackStatusUpdate={setStatus}
        shouldPlay={isPlaying}
        useNativeControls={false}
      />

      {showControls && (
        <View style={styles.controlsOverlay}>
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.gradientOverlay}
          >
            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity
                onPress={() => setIsFullscreen(false)}
                style={styles.controlButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.topRightControls}>
                <TouchableOpacity
                  onPress={() => setShowSubtitles(!showSubtitles)}
                  style={styles.controlButton}
                >
                  <Ionicons
                    name={showSubtitles ? 'text' : 'text-outline'}
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={addBookmark} style={styles.controlButton}>
                  <Ionicons name="bookmark-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Center Play Button */}
            <TouchableOpacity
              onPress={togglePlayPause}
              style={styles.centerPlayButton}
              activeOpacity={0.8}
            >
              <View style={styles.playButtonCircle}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={40}
                  color="#FFFFFF"
                />
              </View>
            </TouchableOpacity>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
                  <TouchableOpacity
                    style={[styles.progressThumb, { left: `${progressPercentage}%` }]}
                    onPress={() => {}}
                  />
                </View>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              <View style={styles.bottomButtons}>
                <TouchableOpacity
                  onPress={() => handleSeek(Math.max(0, progressPercentage - 10))}
                  style={styles.smallButton}
                >
                  <Ionicons name="replay-10" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSeek(Math.min(100, progressPercentage + 10))}
                  style={styles.smallButton}
                >
                  <Ionicons name="forward-10" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowSpeedMenu(!showSpeedMenu)}
                  style={styles.smallButton}
                >
                  <Text style={styles.speedText}>{speed}x</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsFullscreen(true)}
                  style={styles.smallButton}
                >
                  <Ionicons name="expand" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Speed Menu */}
      {showSpeedMenu && (
        <View style={styles.speedMenu}>
          {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
            <TouchableOpacity
              key={rate}
              onPress={() => handleSpeedChange(rate)}
              style={[
                styles.speedMenuItem,
                speed === rate && styles.speedMenuItemActive,
              ]}
            >
              <Text
                style={[
                  styles.speedMenuText,
                  speed === rate && styles.speedMenuTextActive,
                ]}
              >
                {rate}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Subtitles Overlay */}
      {showSubtitles && subtitles && (
        <View style={styles.subtitlesContainer}>
          <Text style={styles.subtitleText}>
            {subtitles.find((s) => s.start <= currentTime && s.end >= currentTime)?.text || ''}
          </Text>
        </View>
      )}

      {/* Fullscreen Modal - Note: Fullscreen implementation requires separate handling */}
      {/* For now, fullscreen is handled via video player's native controls */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: premiumBorderRadius.lg,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: premiumSpacing.base,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRightControls: {
    flexDirection: 'row',
    gap: premiumSpacing.base,
  },
  controlButton: {
    padding: premiumSpacing.sm,
    borderRadius: premiumBorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  centerPlayButton: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    gap: premiumSpacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: premiumSpacing.sm,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: premiumColors.primary.main,
    borderRadius: 2,
  },
  progressThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: premiumColors.primary.main,
    position: 'absolute',
    top: -6,
    marginLeft: -8,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 45,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: premiumSpacing.lg,
  },
  smallButton: {
    padding: premiumSpacing.sm,
    borderRadius: premiumBorderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  speedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  speedMenu: {
    position: 'absolute',
    bottom: 80,
    right: premiumSpacing.base,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: premiumBorderRadius.md,
    padding: premiumSpacing.sm,
    minWidth: 80,
  },
  speedMenuItem: {
    paddingVertical: premiumSpacing.sm,
    paddingHorizontal: premiumSpacing.base,
    borderRadius: premiumBorderRadius.sm,
  },
  speedMenuItemActive: {
    backgroundColor: premiumColors.primary.main,
  },
  speedMenuText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  speedMenuTextActive: {
    fontWeight: '600',
  },
  subtitlesContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: premiumSpacing.lg,
    paddingVertical: premiumSpacing.md,
    borderRadius: premiumBorderRadius.md,
    maxWidth: '90%',
  },
  subtitleText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
});

