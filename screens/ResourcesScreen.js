import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { resourcesAPI, blogAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import Heading from '../src/components/Heading';
import BlogCard from '../src/components/BlogCard';

const RESOURCE_CATEGORIES = [
  {
    id: 'study-guides',
    title: 'Study Guides',
    icon: 'book-outline',
    color: '#1E88E5',
    description: 'Comprehensive study materials and guides',
  },
  {
    id: 'practice-tests',
    title: 'Practice Tests',
    icon: 'document-text-outline',
    color: '#43A047',
    description: 'Test your knowledge with practice exams',
  },
  {
    id: 'vocabulary',
    title: 'Vocabulary Lists',
    icon: 'library-outline',
    color: '#E53935',
    description: 'Essential vocabulary for French and English',
  },
  {
    id: 'grammar',
    title: 'Grammar Resources',
    icon: 'school-outline',
    color: '#FF9800',
    description: 'Grammar rules and explanations',
  },
  {
    id: 'audio',
    title: 'Audio Resources',
    icon: 'headset-outline',
    color: '#9C27B0',
    description: 'Listen and improve your pronunciation',
  },
  {
    id: 'videos',
    title: 'Video Tutorials',
    icon: 'videocam-outline',
    color: '#00ACC1',
    description: 'Watch and learn from expert instructors',
  },
];

export default function ResourcesScreen({ navigation }) {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [featuredBlogPosts, setFeaturedBlogPosts] = useState([]);
  const [loadingBlogPosts, setLoadingBlogPosts] = useState(false);

  useEffect(() => {
    fetchResources();
    fetchFeaturedBlogPosts();
  }, [selectedCategory, searchQuery]);

  const fetchResources = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const params = {
        status: 'published',
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await resourcesAPI.getAll(params);
      
      if (response.data.success) {
        setResources(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch resources');
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load resources');
      // Fallback to empty array on error
      setResources([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchResources();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const fetchFeaturedBlogPosts = async () => {
    try {
      setLoadingBlogPosts(true);
      const response = await blogAPI.getAll({ limit: 3, page: 1 });
      if (response.data.success) {
        setFeaturedBlogPosts(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      // Don't show error for blog posts, just leave empty
      setFeaturedBlogPosts([]);
    } finally {
      setLoadingBlogPosts(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 MB';
    if (typeof bytes === 'string') return bytes; // Already formatted
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const handleDownload = async (resource) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to download resources.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
        ]
      );
      return;
    }

    try {
      setDownloadingId(resource._id || resource.id);
      
      // Get download URL from API
      const response = await resourcesAPI.getDownloadUrl(resource._id || resource.id);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get download URL');
      }

      const downloadUrl = response.data.data.downloadUrl || resource.fileUrl;
      
      if (!downloadUrl) {
        throw new Error('Download URL not available');
      }

      // For web URLs, open in browser or download based on platform
      if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) {
        if (Platform.OS !== 'web') {
          // Try to download file first
          try {
            const fileExtension = resource.type?.toLowerCase() || 'pdf';
            const fileName = `${resource.title || 'resource'}.${fileExtension}`;
            const fileUri = FileSystem.documentDirectory + fileName.replace(/[^a-z0-9.]/gi, '_');
            
            const downloadResumable = FileSystem.createDownloadResumable(
              downloadUrl,
              fileUri,
              {},
              (downloadProgress) => {
                const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                console.log(`Download progress: ${(progress * 100).toFixed(0)}%`);
              }
            );

            const result = await downloadResumable.downloadAsync();
            
            if (result) {
              Alert.alert(
                'Download Complete',
                `${resource.title} has been downloaded successfully!`,
                [{ text: 'OK' }]
              );
            }
          } catch (downloadError) {
            console.error('Download error:', downloadError);
            // Fallback to opening in browser
            const supported = await Linking.canOpenURL(downloadUrl);
            if (supported) {
              await Linking.openURL(downloadUrl);
              Alert.alert('Opened', 'Resource opened in browser');
            } else {
              Alert.alert('Error', 'Cannot download or open this resource');
            }
          }
        } else {
          // Web platform - open in new tab
          const supported = await Linking.canOpenURL(downloadUrl);
          if (supported) {
            await Linking.openURL(downloadUrl);
          } else {
            Alert.alert('Error', 'Cannot open this URL');
          }
        }
      } else {
        // Direct file path
        const supported = await Linking.canOpenURL(downloadUrl);
        if (supported) {
          await Linking.openURL(downloadUrl);
        } else {
          Alert.alert('Error', 'Cannot open this file');
        }
      }

      // Track download
      try {
        await resourcesAPI.trackDownload(resource._id || resource.id);
      } catch (trackError) {
        console.error('Error tracking download:', trackError);
      }

    } catch (err) {
      console.error('Download error:', err);
      Alert.alert(
        'Download Failed',
        err.message || 'Failed to download resource. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredResources = resources;

  const renderCategoryCard = (category) => {
    const isSelected = selectedCategory === category.id;
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryCard,
          {
            backgroundColor: isSelected ? category.color : colors.card,
            borderColor: isSelected ? category.color : colors.border,
          },
        ]}
        onPress={() => setSelectedCategory(isSelected ? null : category.id)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.categoryIcon,
            {
              backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : category.color + '20',
            },
          ]}
        >
          <Ionicons
            name={category.icon}
            size={fontSize.xl}
            color={isSelected ? '#fff' : category.color}
          />
        </View>
        <Text
          style={[
            styles.categoryTitle,
            { color: isSelected ? '#fff' : colors.text },
          ]}
        >
          {category.title}
        </Text>
        <Text
          style={[
            styles.categoryDescription,
            { color: isSelected ? 'rgba(255, 255, 255, 0.9)' : colors.secondaryText },
          ]}
          numberOfLines={2}
        >
          {category.description}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderResourceItem = (resource) => {
    const category = RESOURCE_CATEGORIES.find((c) => c.id === resource.category);
    const isDownloading = downloadingId === (resource._id || resource.id);
    const fileSize = formatFileSize(resource.sizeFormatted || resource.size);
    const rating = resource.rating?.average || resource.rating || 0;
    const downloads = resource.downloads || 0;

    return (
      <TouchableOpacity
        key={resource._id || resource.id}
        style={[styles.resourceItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <View style={[styles.resourceIcon, { backgroundColor: category?.color + '20' }]}>
          <Ionicons
            name={
              resource.type === 'MP3' || resource.type === 'audio' 
                ? 'musical-notes' 
                : resource.type === 'MP4' || resource.type === 'video'
                ? 'videocam'
                : 'document-text'
            }
            size={fontSize.lg}
            color={category?.color || colors.primary}
          />
        </View>
        <View style={styles.resourceContent}>
          <Text style={[styles.resourceTitle, { color: colors.text }]} numberOfLines={2}>
            {resource.title}
          </Text>
          {resource.description ? (
            <Text style={[styles.resourceDescription, { color: colors.secondaryText }]} numberOfLines={1}>
              {resource.description}
            </Text>
          ) : null}
          <View style={styles.resourceMeta}>
            <Text style={[styles.resourceType, { color: colors.secondaryText }]}>
              {resource.type}
            </Text>
            <Text style={[styles.resourceSize, { color: colors.secondaryText }]}>
              • {fileSize}
            </Text>
            {downloads > 0 && (
              <Text style={[styles.resourceDownloads, { color: colors.secondaryText }]}>
                • {downloads} {downloads === 1 ? 'download' : 'downloads'}
              </Text>
            )}
          </View>
          {rating > 0 && (
            <View style={styles.resourceRating}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.downloadButton, 
            { 
              backgroundColor: isDownloading 
                ? colors.secondaryText 
                : category?.color || colors.primary 
            }
          ]}
          onPress={() => handleDownload(resource)}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="download-outline" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && resources.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner message="Loading resources..." />
      </View>
    );
  }

  if (error && resources.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorMessage message={error} onRetry={fetchResources} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Learning Resources</Text>
            <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
              Free study materials and guides
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBarWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search resources..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse by Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {RESOURCE_CATEGORIES.map(renderCategoryCard)}
        </ScrollView>
      </View>

      {/* Resources List */}
      <View style={styles.resourcesSection}>
        <View style={styles.resourcesHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory
              ? RESOURCE_CATEGORIES.find((c) => c.id === selectedCategory)?.title
              : 'All Resources'}
          </Text>
          <Text style={[styles.resourceCount, { color: colors.secondaryText }]}>
            {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'}
          </Text>
        </View>

        {filteredResources.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color={colors.secondaryText} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Resources Found</Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              {searchQuery 
                ? 'Try a different search term'
                : selectedCategory
                ? 'Try selecting a different category'
                : 'No resources available at the moment'}
            </Text>
            {(searchQuery || selectedCategory) && (
              <TouchableOpacity
                style={[styles.clearFiltersButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
              >
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.resourcesList}>
            {filteredResources.map(renderResourceItem)}
          </View>
        )}
      </View>

      {/* Blog Section */}
      <View style={styles.blogSection}>
        <View style={styles.blogHeader}>
          <Heading
            title="French Lessons & News"
            onSeeAll={() => navigation.navigate('BlogList')}
            seeAllText="See all"
          />
          <Text style={[styles.blogSubtitle, { color: colors.secondaryText }]}>
            Stay updated with the latest French learning tips and news
          </Text>
        </View>

        {loadingBlogPosts ? (
          <View style={styles.blogLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : featuredBlogPosts.length > 0 ? (
          <View style={styles.blogPostsContainer}>
            {featuredBlogPosts.map((post) => (
              <BlogCard
                key={post._id || post.id}
                post={post}
                onPress={() => navigation.navigate('BlogDetail', { postId: post._id || post.id, post })}
              />
            ))}
          </View>
        ) : null}
      </View>

      {/* Info Banner */}
      {!isAuthenticated && (
        <View style={[styles.infoBanner, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Sign in to Download</Text>
            <Text style={[styles.infoText, { color: colors.secondaryText }]}>
              Create an account to access all free resources
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: spacing.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
  },
  clearButton: {
    padding: spacing.xs,
  },
  resourceDescription: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
  },
  clearFiltersButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
  },
  clearFiltersText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.xxl + 10,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
  },
  categoriesSection: {
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  categoryCard: {
    width: 160,
    padding: spacing.md,
    borderRadius: spacing.lg,
    borderWidth: 2,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  resourcesSection: {
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },
  resourcesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  resourceCount: {
    fontSize: fontSize.sm,
  },
  resourcesList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  resourceType: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  resourceSize: {
    fontSize: fontSize.xs,
  },
  resourceDownloads: {
    fontSize: fontSize.xs,
  },
  resourceRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  downloadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.sm,
  },
  signInButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  blogSection: {
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  blogHeader: {
    marginBottom: spacing.md,
  },
  blogSubtitle: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  blogPostsContainer: {
    gap: spacing.md,
  },
  blogLoading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});

