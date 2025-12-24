import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { discussionsAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';

export default function CreateDiscussionScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [],
  });
  const [currentTag, setCurrentTag] = useState('');

  const categories = [
    { id: 'general', name: 'General', icon: 'chatbubbles-outline' },
    { id: 'grammar', name: 'Grammar', icon: 'school-outline' },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'book-outline' },
    { id: 'pronunciation', name: 'Pronunciation', icon: 'mic-outline' },
    { id: 'culture', name: 'Culture', icon: 'globe-outline' },
    { id: 'tips', name: 'Tips', icon: 'bulb-outline' },
    { id: 'resources', name: 'Resources', icon: 'folder-outline' },
    { id: 'off-topic', name: 'Off Topic', icon: 'ellipsis-horizontal-outline' },
  ];

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a discussion title');
      return;
    }

    if (!formData.content.trim()) {
      Alert.alert('Error', 'Please enter discussion content');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to start a discussion');
      navigation.navigate('Auth');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim()),
      };

      const response = await discussionsAPI.create(submitData);
      Alert.alert('Success', 'Your discussion has been posted!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('DiscussionDetail', { discussionId: response.data.data._id }),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create discussion');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && formData.tags.length < 5) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()],
      });
      setCurrentTag('');
    }
  };

  const removeTag = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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
            <Text style={[styles.title, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
              Start Discussion
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Discussion Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="What's your discussion about?"
            placeholderTextColor={colors.secondaryText}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            maxLength={200}
          />
          <Text style={[styles.charCount, { color: colors.secondaryText }]}>
            {formData.title.length}/200
          </Text>
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Content *</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Share your thoughts, ask questions, or start a conversation..."
            placeholderTextColor={colors.secondaryText}
            value={formData.content}
            onChangeText={(text) => setFormData({ ...formData, content: text })}
            multiline
            numberOfLines={8}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Category</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  {
                    backgroundColor: formData.category === category.id
                      ? premiumColors.primary.main
                      : colors.card,
                    borderColor: formData.category === category.id
                      ? premiumColors.primary.main
                      : colors.border,
                  },
                ]}
                onPress={() => setFormData({ ...formData, category: category.id })}
              >
                <Ionicons
                  name={category.icon}
                  size={20}
                  color={formData.category === category.id ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.categoryOptionText,
                    {
                      color: formData.category === category.id ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Tags (Optional)</Text>
          <Text style={[styles.hint, { color: colors.secondaryText }]}>
            Add up to 5 tags to help others find your discussion
          </Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.tagInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Add a tag"
              placeholderTextColor={colors.secondaryText}
              value={currentTag}
              onChangeText={setCurrentTag}
              onSubmitEditing={addTag}
              maxLength={20}
            />
            <TouchableOpacity
              style={[styles.addTagButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={addTag}
              disabled={formData.tags.length >= 5}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {formData.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {formData.tags.map((tag, index) => (
                <View key={index} style={[styles.tagChip, { backgroundColor: colors.card }]}>
                  <Text style={[styles.tagChipText, { color: colors.text }]}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(index)}>
                    <Ionicons name="close-circle" size={18} color={colors.secondaryText} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: premiumColors.primary.main }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Posting...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Start Discussion</Text>
          )}
        </TouchableOpacity>

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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: fontSize.xs,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.md,
    fontSize: fontSize.md,
  },
  charCount: {
    fontSize: fontSize.xs,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.md,
    fontSize: fontSize.md,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.base,
    borderWidth: 1,
    gap: spacing.xs,
    minWidth: '45%',
  },
  categoryOptionText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.sm,
    fontSize: fontSize.sm,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.base,
    gap: spacing.xs,
  },
  tagChipText: {
    fontSize: fontSize.sm,
  },
  submitButton: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...premiumShadows.md,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

