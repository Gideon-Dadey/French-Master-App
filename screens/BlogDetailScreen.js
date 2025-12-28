import React, { useState, useEffect, useRef } from 'react';
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
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import { blogAPI } from '../src/services/api';
import { offlineService } from '../src/services/offlineService';
import { useAuth } from '../src/context/AuthContext';
import { useGamification } from '../src/context/GamificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { getThemeColors, themeShadows, themeRadius } from '../src/utils/organicTheme';

const { width, height } = Dimensions.get('window');

const CATEGORY_CONFIG = {
  'written-lessons': { icon: 'book', name: 'Lesson' },
  'lessons': { icon: 'book', name: 'Lesson' },
  'news': { icon: 'newspaper', name: 'News' },
  'tips': { icon: 'bulb', name: 'Tips' },
  'grammar': { icon: 'school', name: 'Grammar' },
  'culture': { icon: 'earth', name: 'Culture' },
  'default': { icon: 'document-text', name: 'Article' },
};

export default function BlogDetailScreen({ route, navigation }) {
  const { postId, post: initialPost } = route.params;
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);
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

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const likeAnim = useRef(new Animated.Value(1)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    loadSavedState();
    checkOfflineStatus();
    if (!initialPost) {
      loadPost();
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    return () => Speech.stop();
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
          },
        },
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
      useNativeDriver: false,
    }).start();
    if (clampedProgress >= 0.9 && !hasCompletedReading && post.content) {
      handleFinishedReading();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `📚 Check out this French lesson: "${post.title}"\n\n${post.excerpt || ''}\n\nLearn more on L'Alliance!`,
        title: post.title,
      });
    } catch (error) { }
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
    return paragraphs
      .map((p, i) => {
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
      })
      .filter(Boolean);
  };

  if (loading) {
    return <LoadingSpinner message="Loading article..." />;
  }

  if (error && !post) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ErrorMessage message={error} onRetry={loadPost} />
      </View>
    );
  }

  const categoryConfig = getCategoryConfig(post.category);
  const hasImage = post.image || post.thumbnail;
  const readingTime = getReadingTime(post.content);
  const formattedContent = formatContent(post.content);

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
              backgroundColor: theme.primary,
            },
          ]}
        />
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.floatingActions}>
        <TouchableOpacity
          style={[styles.floatingBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.floatingRight}>
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={() => setShowSettings(!showSettings)}
            activeOpacity={0.7}
          >
            <Ionicons name="text" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={handleTextToSpeech}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSpeaking ? 'pause' : 'volume-high'}
              size={18}
              color={isSpeaking ? theme.primary : '#FFFFFF'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Font Size Settings Panel */}
      {showSettings && (
        <Animated.View
          style={[
            styles.settingsPanel,
            { backgroundColor: theme.surface },
            themeShadows.lg,
            { opacity: fadeAnim },
          ]}
        >
          <Text style={[styles.settingsTitle, { color: theme.text }]}>Reading Settings</Text>
          <View style={styles.fontSizeRow}>
            <TouchableOpacity
              style={[styles.fontSizeBtn, { backgroundColor: theme.primary + '15' }]}
              onPress={() => handleFontSizeChange(-0.1)}
            >
              <Text style={[styles.fontSizeBtnText, { color: theme.primary }]}>A-</Text>
            </TouchableOpacity>
            <Text style={[styles.fontSizeLabel, { color: theme.text }]}>
              {Math.round(fontSizeMultiplier * 100)}%
            </Text>
            <TouchableOpacity
              style={[styles.fontSizeBtn, { backgroundColor: theme.primary + '15' }]}
              onPress={() => handleFontSizeChange(0.1)}
            >
              <Text style={[styles.fontSizeBtnText, { color: theme.primary }]}>A+</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
          listener: handleScroll,
        })}
        scrollEventThrottle={16}
      >
        {/* Hero Image Section */}
        <Animated.View style={[styles.heroSection, { transform: [{ scale: imageScale }] }]}>
          {hasImage ? (
            <Image source={{ uri: post.image || post.thumbnail }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[theme.primary, theme.primaryLight || theme.primary]} style={styles.heroImage} />
          )}
          <LinearGradient
            colors={[theme.primary + 'E6', theme.primary + 'B3', 'transparent']}
            style={styles.heroGradient}
          />
        </Animated.View>

        {/* Main Content */}
        <View style={[styles.contentWrapper, { backgroundColor: theme.background }]}>
          {/* Title & Meta Section */}
          <Animated.View style={[styles.titleSection, { opacity: fadeAnim }]}>
            <View style={styles.badgeRow}>
              <View style={[styles.categoryBadge, { backgroundColor: theme.primary }]}>
                <Ionicons name={categoryConfig.icon} size={14} color="#FFFFFF" />
                <Text style={styles.categoryBadgeText}>{categoryConfig.name.toUpperCase()}</Text>
              </View>
              {hasCompletedReading && (
                <View style={[styles.completedBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.primary} />
                  <Text style={[styles.completedText, { color: theme.primary }]}>COMPLETED</Text>
                </View>
              )}
            </View>

            <Text style={[styles.articleTitle, { color: theme.text }]}>{post.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>{readingTime} min read</Text>
              </View>
              <View style={[styles.metaDivider, { backgroundColor: theme.border }]} />
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>{formatDate(post.createdAt)}</Text>
              </View>
              {post.views && (
                <>
                  <View style={[styles.metaDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.metaItem}>
                    <Ionicons name="eye-outline" size={14} color={theme.textSecondary} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>{post.views} views</Text>
                  </View>
                </>
              )}
            </View>
          </Animated.View>

          {/* Author Card */}
          <Animated.View
            style={[styles.authorCard, { backgroundColor: theme.surface }, themeShadows.md, { opacity: fadeAnim }]}
          >
            <View style={styles.authorLeft}>
              <View style={[styles.authorAvatar, { backgroundColor: theme.primary + '15' }]}>
                {post.author?.avatar ? (
                  <Image source={{ uri: post.author.avatar }} style={styles.avatarImage} />
                ) : (
                  <LinearGradient
                    colors={[theme.primary, theme.primaryLight || theme.primary]}
                    style={styles.avatarPlaceholder}
                  >
                    <Text style={styles.avatarText}>{(post.author?.name || 'F')[0].toUpperCase()}</Text>
                  </LinearGradient>
                )}
              </View>
              <View>
                <Text style={[styles.authorName, { color: theme.text }]}>
                  {post.author?.name || "L'Alliance"}
                </Text>
                <Text style={[styles.authorRole, { color: theme.textSecondary }]}>Language Expert</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.followBtn, { backgroundColor: theme.primary }]}
              activeOpacity={0.8}
            >
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[styles.actionsBar, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm, { opacity: fadeAnim }]}
          >
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isLiked ? theme.primary : theme.textSecondary}
                />
              </Animated.View>
              <Text style={[styles.actionBtnText, { color: isLiked ? theme.primary : theme.textSecondary }]}>
                {isLiked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.actionDivider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.actionBtn} onPress={handleBookmark}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isBookmarked ? theme.primary : theme.textSecondary}
              />
              <Text style={[styles.actionBtnText, { color: isBookmarked ? theme.primary : theme.textSecondary }]}>
                {isBookmarked ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.actionDivider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
              {downloading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Ionicons
                  name={isSavedOffline ? 'cloud-done' : 'cloud-download-outline'}
                  size={22}
                  color={isSavedOffline ? theme.primary : theme.textSecondary}
                />
              )}
              <Text style={[styles.actionBtnText, { color: isSavedOffline ? theme.primary : theme.textSecondary }]}>
                {isSavedOffline ? 'Offline' : 'Download'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Excerpt */}
          {post.excerpt && (
            <Animated.View
              style={[styles.excerptCard, { borderLeftColor: theme.primary, backgroundColor: theme.surface }, themeShadows.sm, { opacity: fadeAnim }]}
            >
              <View style={[styles.excerptIcon, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name="chatbubble-ellipses" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.excerptText, { color: theme.text, fontSize: 17 * fontSizeMultiplier }]}>
                {post.excerpt}
              </Text>
            </Animated.View>
          )}

          {/* Article Content */}
          {post.content ? (
            <Animated.View style={[styles.articleContent, { opacity: fadeAnim }]}>
              {formattedContent.map((block) => {
                if (block.type === 'heading') {
                  return (
                    <Text
                      key={block.key}
                      style={[
                        styles.contentHeading,
                        { color: theme.text, fontSize: 22 * fontSizeMultiplier },
                      ]}
                    >
                      {block.content}
                    </Text>
                  );
                }

                if (block.type === 'quote') {
                  return (
                    <View
                      key={block.key}
                      style={[styles.contentQuote, { backgroundColor: theme.primary + '10', borderLeftColor: theme.primary }]}
                    >
                      <Ionicons name="chatbubble-outline" size={18} color={theme.primary} />
                      <Text style={[styles.contentQuoteText, { color: theme.text, fontSize: 16 * fontSizeMultiplier }]}>
                        {block.content}
                      </Text>
                    </View>
                  );
                }

                if (block.type === 'french') {
                  return (
                    <View
                      key={block.key}
                      style={[styles.frenchPhrase, { backgroundColor: theme.primary + '10', borderColor: theme.primary }]}
                    >
                      <View style={styles.frenchHeader}>
                        <Ionicons name="language" size={16} color={theme.primary} />
                        <Text style={[styles.frenchLabel, { color: theme.primary }]}>French</Text>
                      </View>
                      <Text style={[styles.frenchText, { color: theme.text, fontSize: 18 * fontSizeMultiplier }]}>
                        {block.content}
                      </Text>
                      <TouchableOpacity
                        style={styles.speakBtn}
                        onPress={() => Speech.speak(block.content, { language: 'fr-FR' })}
                      >
                        <Ionicons name="volume-high" size={16} color={theme.primary} />
                      </TouchableOpacity>
                    </View>
                  );
                }

                if (block.type === 'list') {
                  return (
                    <View key={block.key} style={styles.listItem}>
                      <View style={[styles.listBullet, { backgroundColor: theme.primary }]} />
                      <Text style={[styles.listText, { color: theme.text, fontSize: 17 * fontSizeMultiplier }]}>
                        {block.content}
                      </Text>
                    </View>
                  );
                }

                return (
                  <Text
                    key={block.key}
                    style={[styles.contentParagraph, { color: theme.text, fontSize: 17 * fontSizeMultiplier }]}
                  >
                    {block.content}
                  </Text>
                );
              })}
            </Animated.View>
          ) : (
            <Animated.View style={[styles.browserRedirect, { opacity: fadeAnim }]}>
              <View style={[styles.redirectCard, { backgroundColor: theme.surface }, themeShadows.lg]}>
                <View style={[styles.redirectIconContainer, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name="reader-outline" size={40} color={theme.primary} />
                </View>
                <Text style={[styles.redirectTitle, { color: theme.text }]}>View Full Lesson</Text>
                <Text style={[styles.redirectSubtitle, { color: theme.textSecondary }]}>
                  This article contains interactive elements. Open the complete experience in your browser.
                </Text>
                <TouchableOpacity style={styles.redirectBtn} onPress={handleOpenInBrowser} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[theme.primary, theme.primaryLight || theme.primary]}
                    style={styles.redirectBtnGradient}
                  >
                    <Text style={styles.redirectBtnText}>Open in Browser</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <Animated.View style={[styles.tagsSection, { opacity: fadeAnim }]}>
              <Text style={[styles.tagsLabel, { color: theme.textSecondary }]}>TOPICS</Text>
              <View style={styles.tagsRow}>
                {post.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={[styles.tagPill, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}
                  >
                    <Text style={[styles.tagText, { color: theme.primary }]}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Complete Card */}
          {!hasCompletedReading && post.content && (
            <TouchableOpacity
              style={[styles.completeCard, themeShadows.md]}
              onPress={handleFinishedReading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.primary, theme.primaryLight || theme.primary]}
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

          {/* Reading Progress */}
          <View style={[styles.progressCard, { backgroundColor: theme.surface }, themeShadows.sm]}>
            <View style={styles.progressCardHeader}>
              <Text style={[styles.progressCardTitle, { color: theme.text }]}>Reading Progress</Text>
              <Text style={[styles.progressPercent, { color: theme.primary }]}>
                {Math.round(readingProgress * 100)}%
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${readingProgress * 100}%`, backgroundColor: theme.primary },
                ]}
              />
            </View>
            <Text style={[styles.progressHint, { color: theme.textSecondary }]}>
              {readingProgress < 0.9 ? 'Keep reading to complete this lesson' : '🎉 Almost there!'}
            </Text>
          </View>

          {/* Share Section */}
          <View style={[styles.shareSection, { borderTopColor: theme.border }]}>
            <Text style={[styles.shareTitle, { color: theme.text }]}>Enjoyed this lesson?</Text>
            <Text style={[styles.shareSubtitle, { color: theme.textSecondary }]}>
              Share it with friends learning French
            </Text>
            <View style={styles.shareButtons}>
              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: theme.primary }]}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: theme.primary + '15' }]}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-twitter" size={20} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: theme.primary + '15' }]}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-facebook" size={20} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: theme.primary + '15' }]}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Completion Celebration */}
      {showCompletionCelebration && (
        <Animated.View
          style={[
            styles.celebrationOverlay,
            { opacity: celebrationAnim },
          ]}
        >
          <View style={[styles.celebrationCard, { backgroundColor: theme.surface }, themeShadows.xl]}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={[styles.celebrationTitle, { color: theme.text }]}>Félicitations!</Text>
            <Text style={[styles.celebrationSubtitle, { color: theme.textSecondary }]}>You earned +20 XP</Text>
            <View style={[styles.xpBadge, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="star" size={16} color={theme.primary} />
              <Text style={[styles.xpBadgeText, { color: theme.primary }]}>+20 XP</Text>
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
  floatingActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
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
    backdropFilter: 'blur(10px)',
  },
  floatingRight: {
    flexDirection: 'row',
    gap: 10,
  },
  settingsPanel: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 90,
    right: 20,
    borderRadius: 16,
    padding: 16,
    zIndex: 200,
    minWidth: 180,
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  fontSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: height * 0.45,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentWrapper: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 12,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  authorName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  authorRole: {
    fontSize: 14,
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
    borderRadius: 16,
  },
  excerptIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
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
    marginTop: 28,
    marginBottom: 16,
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  contentParagraph: {
    lineHeight: 28,
    marginBottom: 20,
  },
  contentQuote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    borderRadius: 16,
    marginVertical: 20,
    gap: 12,
    borderLeftWidth: 4,
  },
  contentQuoteText: {
    flex: 1,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  frenchPhrase: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginVertical: 20,
    position: 'relative',
  },
  frenchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  frenchLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  frenchText: {
    fontWeight: '600',
    lineHeight: 28,
  },
  speakBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
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
    borderRadius: 24,
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
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  redirectSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  redirectBtn: {
    width: '100%',
    borderRadius: 16,
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
    gap: 10,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  completeCard: {
    borderRadius: 20,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completeCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  progressCard: {
    padding: 20,
    borderRadius: 20,
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
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '800',
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
    fontWeight: '500',
  },
  shareSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  shareTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  shareSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    fontWeight: '500',
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
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    minWidth: 280,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  celebrationSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: '500',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  xpBadgeText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
