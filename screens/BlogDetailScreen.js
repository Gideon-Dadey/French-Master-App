import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Share,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { premiumColors, premiumShadows, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';
import PremiumErrorState from '../src/components/PremiumErrorState';
import { blogAPI } from '../src/services/api';
import { offlineService } from '../src/services/offlineService';
import { gamificationService } from '../src/services/gamificationService';
import { useAuth } from '../src/context/AuthContext';
import { useGamification } from '../src/context/GamificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

const CATEGORY_CONFIG = {
  'written-lessons': { color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'], icon: 'book', name: 'Lesson' },
  'lessons': { color: '#3B82F6', gradient: ['#3B82F6', '#2563EB'], icon: 'book', name: 'Lesson' },
  'news': { color: '#10B981', gradient: ['#10B981', '#059669'], icon: 'newspaper', name: 'News' },
  'tips': { color: '#F59E0B', gradient: ['#F59E0B', '#D97706'], icon: 'bulb', name: 'Tips' },
  'grammar': { color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'], icon: 'school', name: 'Grammar' },
  'culture': { color: '#EC4899', gradient: ['#EC4899', '#DB2777'], icon: 'earth', name: 'Culture' },
  'default': { color: '#6366F1', gradient: ['#6366F1', '#4F46E5'], icon: 'document-text', name: 'Article' },
};

export default function BlogDetailScreen({ route, navigation }) {
  const { postId, post: initialPost } = route.params;
  const { colors, isDarkMode } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const gamification = useGamification();
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState(null);
  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasCompletedReading, setHasCompletedReading] = useState(false);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const likeAnim = useRef(new Animated.Value(1)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(0);
  const scrollViewHeight = useRef(0);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    loadSavedState();
    checkOfflineStatus();
    if (!initialPost) {
      loadPost();
    }

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    floatLoop.start();

    return () => {
      floatLoop.stop();
      Speech.stop();
    };
  }, [postId]);

  const loadSavedState = async () => {
    try {
      const [liked, bookmarked, completed, fontSize] = await Promise.all([
        AsyncStorage.getItem(`liked_${postId}`),
        AsyncStorage.getItem(`bookmarked_${postId}`),
        AsyncStorage.getItem(`completed_${postId}`),
        AsyncStorage.getItem('reading_font_size'),
      ]);
      if (liked) setIsLiked(JSON.parse(liked));
      if (bookmarked) setIsBookmarked(JSON.parse(bookmarked));
      if (completed) setHasCompletedReading(JSON.parse(completed));
      if (fontSize) setFontSizeMultiplier(JSON.parse(fontSize));
    } catch (e) {
      console.error('Failed to load saved state:', e);
    }
  };

  const checkOfflineStatus = async () => {
    const cached = await offlineService.getFromCache(`blog_post_${postId}`);
    if (cached?.data) {
      setIsSavedOffline(true);
      if (!post) setPost(cached.data);
    }
  };

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await blogAPI.getById(postId);
      if (response.data?.data) {
        setPost(response.data.data);
        await offlineService.saveToCache(`blog_post_${postId}`, response.data.data);
      } else {
        setError('Blog post not found.');
      }
    } catch (err) {
      console.error('Failed to load blog post:', err);
      const cached = await offlineService.getFromCache(`blog_post_${postId}`);
      if (cached?.data) {
        setPost(cached.data);
        setError(null);
      } else {
        setError('Failed to load blog post. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (isSavedOffline) {
      Alert.alert('Remove Download', 'Remove this article from offline storage?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await offlineService.saveToCache(`blog_post_${postId}`, null);
            setIsSavedOffline(false);
          }
        }
      ]);
      return;
    }

    try {
      setDownloading(true);
      await offlineService.saveToCache(`blog_post_${postId}`, post);

      if (post.image || post.thumbnail) {
        await offlineService.downloadAsset(post.image || post.thumbnail, `blog_${postId}.jpg`);
      }

      setIsSavedOffline(true);
      Vibration.vibrate(50);
      Alert.alert('✓ Saved Offline', 'Read this article anytime, even without internet.');
    } catch (err) {
      Alert.alert('Error', 'Failed to save article offline.');
    } finally {
      setDownloading(false);
    }
  };

  const handleLike = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);

    Animated.sequence([
      Animated.timing(likeAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
      Animated.spring(likeAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    if (newLiked) Vibration.vibrate(50);
    await AsyncStorage.setItem(`liked_${postId}`, JSON.stringify(newLiked));
  };

  const handleBookmark = async () => {
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);
    if (newBookmarked) Vibration.vibrate(50);
    await AsyncStorage.setItem(`bookmarked_${postId}`, JSON.stringify(newBookmarked));
  };

  const handleFinishedReading = async () => {
    if (hasCompletedReading) return;

    setHasCompletedReading(true);
    setShowCompletionCelebration(true);
    await AsyncStorage.setItem(`completed_${postId}`, JSON.stringify(true));

    Vibration.vibrate([0, 50, 50, 50]);

    Animated.timing(celebrationAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    if (gamification?.awardXP) {
      await gamification.awardXP(20, 'Article completed');
    }

    setTimeout(() => {
      setShowCompletionCelebration(false);
      Animated.timing(celebrationAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }, 3000);
  };

  const handleTextToSpeech = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      const textToSpeak = post.content || post.excerpt || post.title;
      setIsSpeaking(true);
      Speech.speak(textToSpeak, {
        language: 'fr-FR',
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const handleFontSizeChange = async (delta) => {
    const newSize = Math.max(0.8, Math.min(1.4, fontSizeMultiplier + delta));
    setFontSizeMultiplier(newSize);
    await AsyncStorage.setItem('reading_font_size', JSON.stringify(newSize));
  };

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollableHeight = contentSize.height - layoutMeasurement.height;
    const progress = scrollableHeight > 0 ? contentOffset.y / scrollableHeight : 0;
    const clampedProgress = Math.max(0, Math.min(1, progress));
    setReadingProgress(clampedProgress);

    Animated.timing(progressAnim, {
      toValue: clampedProgress,
      duration: 100,
      useNativeDriver: false
    }).start();

    if (clampedProgress >= 0.9 && !hasCompletedReading && post.content) {
      handleFinishedReading();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `📚 Check out this French lesson: "${post.title}"\n\n${post.excerpt || ''}\n\nLearn more on French Master!`,
        title: post.title,
      });
    } catch (error) {}
  };

  const handleOpenInBrowser = () => {
    if (post.url) {
      Linking.openURL(post.url);
    }
  };

  const getCategoryConfig = (category) => {
    const key = (category || '').toLowerCase().replace(/\s+/g, '-');
    return CATEGORY_CONFIG[key] || CATEGORY_CONFIG['default'];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getReadingTime = (content) => {
    if (!content) return 3;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const formatContent = (content) => {
    if (!content) return [];

    const paragraphs = content.split(/\n\n+/);
    return paragraphs.map((p, i) => {
      const trimmed = p.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('>') || trimmed.startsWith('"')) {
        return { type: 'quote', content: trimmed.replace(/^[>"]\s*/, '').replace(/"$/, ''), key: i };
      }

      if (trimmed.startsWith('#') || (trimmed === trimmed.toUpperCase() && trimmed.length < 100)) {
        return { type: 'heading', content: trimmed.replace(/^#+\s*/, ''), key: i };
      }

      if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+\.\s/)) {
        return { type: 'list', content: trimmed.replace(/^[-•*\d.]\s*/, ''), key: i };
      }

      if (trimmed.match(/[àâäéèêëïîôùûüÿçœæ]/i) && trimmed.length < 200) {
        return { type: 'french', content: trimmed, key: i };
      }

      return { type: 'paragraph', content: trimmed, key: i };
    }).filter(Boolean);
  };

  if (loading) {
    return <LoadingSpinner message="Loading article..." />;
  }

  if (error && !post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <PremiumErrorState
          title="Article Unavailable"
          message={error}
          onRetry={loadPost}
        />
      </View>
    );
  }

  const categoryConfig = getCategoryConfig(post.category);
  const hasImage = post.image || post.thumbnail;
  const readingTime = getReadingTime(post.content);
  const formattedContent = formatContent(post.content);

  const headerHeight = scrollY.interpolate({
    inputRange: [-100, 0, 200],
    outputRange: [height * 0.5 + 100, height * 0.45, height * 0.3],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  const titleTranslate = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
              backgroundColor: categoryConfig.color
            }
          ]}
        />
      </View>

      <View style={styles.floatingHeader}>
        <TouchableOpacity
          style={[styles.floatingBtn, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.floatingRight}>
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
            onPress={() => setShowSettings(!showSettings)}
          >
            <Ionicons name="text" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
            onPress={handleTextToSpeech}
          >
            <Ionicons
              name={isSpeaking ? "pause" : "volume-high"}
              size={20}
              color={isSpeaking ? "#10B981" : "#FFFFFF"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {showSettings && (
        <Animated.View style={[
          styles.settingsPanel,
          { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' },
          premiumShadows.lg,
        ]}>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>Reading Settings</Text>
          <View style={styles.fontSizeRow}>
            <TouchableOpacity
              style={[styles.fontSizeBtn, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
              onPress={() => handleFontSizeChange(-0.1)}
            >
              <Text style={[styles.fontSizeBtnText, { color: colors.text }]}>A-</Text>
            </TouchableOpacity>
            <Text style={[styles.fontSizeLabel, { color: colors.secondaryText }]}>
              {Math.round(fontSizeMultiplier * 100)}%
            </Text>
            <TouchableOpacity
              style={[styles.fontSizeBtn, { backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }]}
              onPress={() => handleFontSizeChange(0.1)}
            >
              <Text style={[styles.fontSizeBtnText, { color: colors.text }]}>A+</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >

        <Animated.View style={[styles.heroContainer, { height: headerHeight }]}>
          {hasImage ? (
            <Image
              source={{ uri: post.image || post.thumbnail }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={categoryConfig.gradient}
              style={styles.heroImage}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}

          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroOverlay}
          />

          <Animated.View style={[
            styles.floatingOrb,
            styles.orb1,
            {
              transform: [
                { translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
              ],
            },
          ]} />
          <View style={[styles.floatingOrb, styles.orb2]} />

          <Animated.View style={[
            styles.heroContent,
            {
              opacity: headerOpacity,
              transform: [{ translateY: titleTranslate }],
            },
          ]}>

            <View style={styles.categoryRow}>
              <LinearGradient
                colors={categoryConfig.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.categoryBadge}
              >
                <Ionicons name={categoryConfig.icon} size={12} color="#FFFFFF" />
                <Text style={styles.categoryText}>{categoryConfig.name.toUpperCase()}</Text>
              </LinearGradient>

              {hasCompletedReading && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.completedText}>COMPLETED</Text>
                </View>
              )}
            </View>

            <Text style={styles.heroTitle}>{post.title}</Text>

            <View style={styles.heroMeta}>
              <View style={styles.readingInfo}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.readingInfoText}>{readingTime} min read</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.readingInfo}>
                <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.readingInfoText}>{formatDate(post.createdAt)}</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>

        <View style={[styles.contentBody, { backgroundColor: colors.background }]}>

          <View style={[
            styles.authorCard,
            { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' },
            premiumShadows.md,
          ]}>
            <View style={styles.authorLeft}>
              <View style={[styles.authorAvatar, { backgroundColor: categoryConfig.color + '20' }]}>
                {post.author?.avatar ? (
                  <Image source={{ uri: post.author.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={[styles.authorInitial, { color: categoryConfig.color }]}>
                    {(post.author?.name || 'F')[0].toUpperCase()}
                  </Text>
                )}
              </View>
              <View>
                <Text style={[styles.authorName, { color: colors.text }]}>
                  {post.author?.name || 'French Master'}
                </Text>
                <Text style={[styles.authorRole, { color: colors.secondaryText }]}>
                  Language Expert
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.followBtn, { backgroundColor: categoryConfig.color }]}
            >
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>
          </View>

          <View style={[
            styles.actionsBar,
            { backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB', borderColor: isDarkMode ? '#374151' : '#E5E7EB' },
          ]}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={22}
                  color={isLiked ? "#EF4444" : colors.secondaryText}
                />
              </Animated.View>
              <Text style={[styles.actionBtnText, { color: isLiked ? "#EF4444" : colors.secondaryText }]}>
                {isLiked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.actionDivider, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]} />

            <TouchableOpacity style={styles.actionBtn} onPress={handleBookmark}>
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={22}
                color={isBookmarked ? "#F59E0B" : colors.secondaryText}
              />
              <Text style={[styles.actionBtnText, { color: isBookmarked ? "#F59E0B" : colors.secondaryText }]}>
                {isBookmarked ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.actionDivider, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]} />

            <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
              {downloading ? (
                <ActivityIndicator size="small" color={colors.secondaryText} />
              ) : (
                <Ionicons
                  name={isSavedOffline ? "cloud-done" : "cloud-download-outline"}
                  size={22}
                  color={isSavedOffline ? "#10B981" : colors.secondaryText}
                />
              )}
              <Text style={[styles.actionBtnText, { color: isSavedOffline ? "#10B981" : colors.secondaryText }]}>
                {isSavedOffline ? 'Offline' : 'Download'}
              </Text>
            </TouchableOpacity>
          </View>

          {post.excerpt && (
            <View style={[styles.excerptCard, { borderLeftColor: categoryConfig.color }]}>
              <Ionicons name="chatbubble-ellipses" size={20} color={categoryConfig.color} style={styles.excerptIcon} />
              <Text style={[styles.excerptText, { color: colors.text, fontSize: 17 * fontSizeMultiplier }]}>
                {post.excerpt}
              </Text>
            </View>
          )}

          {post.content ? (
            <View style={styles.articleContent}>
              {formattedContent.map((block) => {
                if (block.type === 'heading') {
                  return (
                    <Text
                      key={block.key}
                      style={[styles.contentHeading, { color: colors.text, fontSize: 22 * fontSizeMultiplier }]}
                    >
                      {block.content}
                    </Text>
                  );
                }

                if (block.type === 'quote') {
                  return (
                    <View
                      key={block.key}
                      style={[styles.contentQuote, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}
                    >
                      <Ionicons name="chatbubble-outline" size={16} color={categoryConfig.color} />
                      <Text style={[styles.contentQuoteText, { color: colors.text, fontSize: 16 * fontSizeMultiplier }]}>
                        {block.content}
                      </Text>
                    </View>
                  );
                }

                if (block.type === 'french') {
                  return (
                    <View
                      key={block.key}
                      style={[styles.frenchPhrase, { backgroundColor: categoryConfig.color + '10', borderColor: categoryConfig.color }]}
                    >
                      <View style={styles.frenchHeader}>
                        <Ionicons name="language" size={16} color={categoryConfig.color} />
                        <Text style={[styles.frenchLabel, { color: categoryConfig.color }]}>French</Text>
                      </View>
                      <Text style={[styles.frenchText, { color: colors.text, fontSize: 18 * fontSizeMultiplier }]}>
                        {block.content}
                      </Text>
                      <TouchableOpacity
                        style={styles.speakBtn}
                        onPress={() => Speech.speak(block.content, { language: 'fr-FR' })}
                      >
                        <Ionicons name="volume-high" size={16} color={categoryConfig.color} />
                      </TouchableOpacity>
                    </View>
                  );
                }

                if (block.type === 'list') {
                  return (
                    <View key={block.key} style={styles.listItem}>
                      <View style={[styles.listBullet, { backgroundColor: categoryConfig.color }]} />
                      <Text style={[styles.listText, { color: colors.text, fontSize: 17 * fontSizeMultiplier }]}>
                        {block.content}
                      </Text>
                    </View>
                  );
                }

                return (
                  <Text
                    key={block.key}
                    style={[styles.contentParagraph, { color: colors.text, fontSize: 17 * fontSizeMultiplier }]}
                  >
                    {block.content}
                  </Text>
                );
              })}
            </View>
          ) : (
            <View style={styles.browserRedirect}>
              <LinearGradient
                colors={isDarkMode ? ['#1F2937', '#374151'] : ['#F9FAFB', '#F3F4F6']}
                style={styles.redirectCard}
              >
                <View style={[styles.redirectIconContainer, { backgroundColor: categoryConfig.color + '15' }]}>
                  <Ionicons name="reader-outline" size={40} color={categoryConfig.color} />
                </View>
                <Text style={[styles.redirectTitle, { color: colors.text }]}>View Full Lesson</Text>
                <Text style={[styles.redirectSubtitle, { color: colors.secondaryText }]}>
                  This article contains interactive elements. Open the complete experience in your browser.
                </Text>
                <TouchableOpacity style={styles.redirectBtn} onPress={handleOpenInBrowser}>
                  <LinearGradient
                    colors={categoryConfig.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.redirectBtnGradient}
                  >
                    <Text style={styles.redirectBtnText}>Open in Browser</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          {post.tags?.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={[styles.tagsLabel, { color: colors.secondaryText }]}>TOPICS</Text>
              <View style={styles.tagsRow}>
                {post.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={[styles.tagPill, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}
                  >
                    <Text style={[styles.tagText, { color: categoryConfig.color }]}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {!hasCompletedReading && post.content && (
            <TouchableOpacity
              style={[styles.completeCard, premiumShadows.md]}
              onPress={handleFinishedReading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.completeCardGradient}
              >
                <View style={styles.completeCardContent}>
                  <View style={styles.completeCardLeft}>
                    <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
                    <View>
                      <Text style={styles.completeCardTitle}>Mark as Complete</Text>
                      <Text style={styles.completeCardSubtitle}>Earn +20 XP for finishing</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={[
            styles.progressCard,
            { backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB' },
          ]}>
            <View style={styles.progressCardHeader}>
              <Text style={[styles.progressCardTitle, { color: colors.text }]}>Reading Progress</Text>
              <Text style={[styles.progressPercent, { color: categoryConfig.color }]}>
                {Math.round(readingProgress * 100)}%
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${readingProgress * 100}%`, backgroundColor: categoryConfig.color }
                ]}
              />
            </View>
            <Text style={[styles.progressHint, { color: colors.secondaryText }]}>
              {readingProgress < 0.9 ? 'Keep reading to complete this lesson' : '🎉 Almost there!'}
            </Text>
          </View>

          <View style={[styles.shareSection, { borderTopColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
            <Text style={[styles.shareTitle, { color: colors.text }]}>Enjoyed this lesson?</Text>
            <Text style={[styles.shareSubtitle, { color: colors.secondaryText }]}>
              Share it with friends learning French
            </Text>
            <View style={styles.shareButtons}>
              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: '#1DA1F2' }]}
                onPress={handleShare}
              >
                <Ionicons name="logo-twitter" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: '#4267B2' }]}
                onPress={handleShare}
              >
                <Ionicons name="logo-facebook" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: '#25D366' }]}
                onPress={handleShare}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {showCompletionCelebration && (
        <Animated.View
          style={[
            styles.celebrationOverlay,
            { opacity: celebrationAnim },
          ]}
        >
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>Félicitations!</Text>
            <Text style={styles.celebrationSubtitle}>You earned +20 XP</Text>
            <View style={styles.xpBadge}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.xpBadgeText}>+20 XP</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  progressBar: {
    height: 3,
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  floatingBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingRight: {
    flexDirection: 'row',
    gap: 10,
  },
  settingsPanel: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    borderRadius: 16,
    padding: 16,
    zIndex: 200,
    minWidth: 180,
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  fontSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fontSizeBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  fontSizeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    width: width,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.2,
  },
  orb1: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.3)',
    top: 60,
    right: -40,
  },
  orb2: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    bottom: 100,
    left: 20,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readingInfoText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 12,
  },
  contentBody: {
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  authorInitial: {
    fontSize: 20,
    fontWeight: '700',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
  },
  authorRole: {
    fontSize: 13,
    marginTop: 2,
  },
  followBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  followBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionDivider: {
    width: 1,
  },
  excerptCard: {
    borderLeftWidth: 4,
    paddingLeft: 16,
    paddingVertical: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  excerptIcon: {
    marginTop: 3,
  },
  excerptText: {
    flex: 1,
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 26,
  },
  articleContent: {
    marginBottom: 32,
  },
  contentHeading: {
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  contentParagraph: {
    lineHeight: 28,
    marginBottom: 16,
  },
  contentQuote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    gap: 12,
  },
  contentQuoteText: {
    flex: 1,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  frenchPhrase: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginVertical: 16,
  },
  frenchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  frenchLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  frenchText: {
    fontWeight: '600',
    lineHeight: 28,
  },
  speakBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  listBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  listText: {
    flex: 1,
    lineHeight: 26,
  },
  browserRedirect: {
    marginVertical: 24,
  },
  redirectCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  redirectIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  redirectTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  redirectSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  redirectBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  redirectBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  redirectBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  completeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  completeCardGradient: {
    padding: 20,
  },
  completeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  completeCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completeCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  progressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 13,
  },
  shareSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  shareSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  celebrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  xpBadgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D97706',
  },
});
