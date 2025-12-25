import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { blogAPI } from '../src/services/api';
import { spacing, fontSize } from '../src/utils/responsive';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width } = Dimensions.get('window');

const POST_CATEGORIES = [
  { id: 'discussion', label: 'Discussion', icon: 'chatbubbles', color: '#6366f1' },
  { id: 'question', label: 'Question', icon: 'help-circle', color: '#f59e0b' },
  { id: 'study-tip', label: 'Study Tip', icon: 'bulb', color: '#10b981' },
  { id: 'progress', label: 'Progress', icon: 'trophy', color: '#ec4899' },
  { id: 'resource', label: 'Resource', icon: 'document', color: '#3b82f6' },
];

export default function CreatePostScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const MAX_CONTENT_LENGTH = 2000;
  const MAX_IMAGES = 4;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContentChange = (text) => {
    if (text.length <= MAX_CONTENT_LENGTH) {
      setContent(text);
      setCharCount(text.length);
    }
  };

  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limit Reached', `You can only add up to ${MAX_IMAGES} images.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validatePost = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please add a title for your post.');
      return false;
    }
    if (!content.trim()) {
      Alert.alert('Missing Content', 'Please write something for your post.');
      return false;
    }
    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a category for your post.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePost()) return;

    setLoading(true);
    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory,
        images: images,
      };

      await blogAPI.create(postData);

      Alert.alert(
        'Post Created! 🎉',
        'Your post has been published to the community.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.authPrompt}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.authIconBg}
          >
            <Ionicons name="person" size={40} color="#fff" />
          </LinearGradient>
          <Text style={[styles.authTitle, { color: colors.text }]}>
            Sign in to Post
          </Text>
          <Text style={[styles.authSubtitle, { color: colors.secondaryText }]}>
            Join the community to share your thoughts and connect with fellow learners.
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => navigation.navigate('Login')}
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.authButtonGradient}
            >
              <Text style={styles.authButtonText}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >

      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Post</Text>

        <TouchableOpacity
          style={[
            styles.postBtn,
            (!title.trim() || !content.trim() || !selectedCategory) && styles.postBtnDisabled
          ]}
          onPress={handleSubmit}
          disabled={loading || !title.trim() || !content.trim() || !selectedCategory}
        >
          {loading ? (
            <LoadingSpinner size={20} color="#fff" />
          ) : (
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.postBtnGradient}
            >
              <Text style={styles.postBtnText}>Post</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >

          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.name || 'User'}
              </Text>
              <Text style={[styles.postingTo, { color: colors.secondaryText }]}>
                Posting to Community
              </Text>
            </View>
          </View>

          <View style={styles.categorySection}>
            <Text style={[styles.sectionLabel, { color: colors.secondaryText }]}>
              Select Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesRow}
            >
              {POST_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.id && {
                      backgroundColor: cat.color,
                      borderColor: cat.color,
                    },
                    selectedCategory !== cat.id && {
                      backgroundColor: isDarkMode ? '#1c1c1e' : '#f5f5f5',
                      borderColor: isDarkMode ? '#2c2c2e' : '#e5e5e5',
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon}
                    size={16}
                    color={selectedCategory === cat.id ? '#fff' : cat.color}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: selectedCategory === cat.id ? '#fff' : colors.text }
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputSection}>
            <TextInput
              style={[
                styles.titleInput,
                {
                  color: colors.text,
                  backgroundColor: isDarkMode ? '#1c1c1e' : '#f8f9fa',
                  borderColor: isDarkMode ? '#2c2c2e' : '#e5e5e5',
                }
              ]}
              placeholder="Add a compelling title..."
              placeholderTextColor={colors.secondaryText}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          <View style={styles.inputSection}>
            <TextInput
              style={[
                styles.contentInput,
                {
                  color: colors.text,
                  backgroundColor: isDarkMode ? '#1c1c1e' : '#f8f9fa',
                  borderColor: isDarkMode ? '#2c2c2e' : '#e5e5e5',
                }
              ]}
              placeholder="Share your thoughts, questions, or tips with the community..."
              placeholderTextColor={colors.secondaryText}
              value={content}
              onChangeText={handleContentChange}
              multiline
              textAlignVertical="top"
            />
            <Text style={[styles.charCounter, { color: colors.secondaryText }]}>
              {charCount}/{MAX_CONTENT_LENGTH}
            </Text>
          </View>

          {images.length > 0 && (
            <View style={styles.imagesSection}>
              <Text style={[styles.sectionLabel, { color: colors.secondaryText }]}>
                Attached Images
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagesRow}
              >
                {images.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.mediaSection}>
            <Text style={[styles.sectionLabel, { color: colors.secondaryText }]}>
              Add to your post
            </Text>
            <View style={styles.mediaButtons}>
              <TouchableOpacity
                style={[
                  styles.mediaBtn,
                  { backgroundColor: isDarkMode ? '#1c1c1e' : '#f5f5f5' }
                ]}
                onPress={pickImage}
                disabled={images.length >= MAX_IMAGES}
              >
                <Ionicons
                  name="image"
                  size={22}
                  color={images.length >= MAX_IMAGES ? colors.secondaryText : '#10b981'}
                />
                <Text
                  style={[
                    styles.mediaBtnText,
                    { color: images.length >= MAX_IMAGES ? colors.secondaryText : colors.text }
                  ]}
                >
                  Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mediaBtn,
                  { backgroundColor: isDarkMode ? '#1c1c1e' : '#f5f5f5' }
                ]}
                onPress={() => Alert.alert('Coming Soon', 'Video upload will be available soon!')}
              >
                <Ionicons name="videocam" size={22} color="#f59e0b" />
                <Text style={[styles.mediaBtnText, { color: colors.text }]}>Video</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mediaBtn,
                  { backgroundColor: isDarkMode ? '#1c1c1e' : '#f5f5f5' }
                ]}
                onPress={() => Alert.alert('Coming Soon', 'Link sharing will be available soon!')}
              >
                <Ionicons name="link" size={22} color="#3b82f6" />
                <Text style={[styles.mediaBtnText, { color: colors.text }]}>Link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mediaBtn,
                  { backgroundColor: isDarkMode ? '#1c1c1e' : '#f5f5f5' }
                ]}
                onPress={() => Alert.alert('Coming Soon', 'Polls will be available soon!')}
              >
                <Ionicons name="stats-chart" size={22} color="#ec4899" />
                <Text style={[styles.mediaBtnText, { color: colors.text }]}>Poll</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.tipsCard, { backgroundColor: isDarkMode ? '#1c1c1e' : '#f0f9ff' }]}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color="#f59e0b" />
              <Text style={[styles.tipsTitle, { color: colors.text }]}>
                Tips for a great post
              </Text>
            </View>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={[styles.tipText, { color: colors.secondaryText }]}>
                  Use a clear, descriptive title
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={[styles.tipText, { color: colors.secondaryText }]}>
                  Add images to make your post stand out
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={[styles.tipText, { color: colors.secondaryText }]}>
                  Be respectful and helpful to others
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  postBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  postBtnDisabled: {
    opacity: 0.5,
  },
  postBtnGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  formContainer: {
    gap: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  postingTo: {
    fontSize: 13,
  },
  categorySection: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputSection: {
    gap: 8,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  contentInput: {
    fontSize: 15,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 150,
    maxHeight: 300,
  },
  charCounter: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 4,
  },
  imagesSection: {
    gap: 10,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: 120,
    height: 80,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  mediaSection: {
    gap: 12,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  mediaBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 4,
  },
  mediaBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    flex: 1,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  authIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  authSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  authButton: {
    marginTop: 16,
    borderRadius: 25,
    overflow: 'hidden',
  },
  authButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

