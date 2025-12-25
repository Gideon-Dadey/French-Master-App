import React, { useState, useEffect } from 'react';
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
import { useGamification } from '../src/context/GamificationContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { progressShareAPI, coursesAPI, progressAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';

export default function CreateProgressShareScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const { stats: gamificationStats } = useGamification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'custom',
    title: '',
    description: '',
    course: null,
    achievement: null,
    milestone: null,
    streak: null,
    tags: [],
  });
  const [currentTag, setCurrentTag] = useState('');
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCoursePicker, setShowCoursePicker] = useState(false);

  const shareTypes = [
    { id: 'course-completed', name: 'Course Completed', icon: 'checkmark-circle', color: premiumColors.accent.emerald },
    { id: 'achievement', name: 'Achievement', icon: 'trophy', color: premiumColors.accent.gold },
    { id: 'milestone', name: 'Milestone', icon: 'flag', color: premiumColors.primary.main },
    { id: 'streak', name: 'Streak', icon: 'flame', color: premiumColors.accent.rose },
    { id: 'certificate', name: 'Certificate', color: premiumColors.accent.sky },
    { id: 'custom', name: 'Custom', icon: 'star', color: premiumColors.primary.main },
  ];

  const milestones = [
    { id: 'first-course', name: 'First Course' },
    { id: 'first-lesson', name: 'First Lesson' },
    { id: 'week-streak', name: 'Week Streak' },
    { id: 'month-streak', name: 'Month Streak' },
    { id: 'level-up', name: 'Level Up' },
    { id: 'perfect-quiz', name: 'Perfect Quiz' },
    { id: 'other', name: 'Other' },
  ];

  useEffect(() => {
    if (formData.type === 'course-completed') {
      loadUserCourses();
    }
  }, [formData.type]);

  const loadUserCourses = async () => {
    try {
      const response = await coursesAPI.getAll({ limit: 50 });
      setAvailableCourses(response.data.data || []);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to share progress');
      navigation.navigate('Auth');
      return;
    }

    try {
      setLoading(true);

      const shareData = {
        type: formData.type,
        title: formData.title,
        description: formData.description || undefined,
        tags: formData.tags.filter(tag => tag.trim()),
        stats: {
          level: gamificationStats?.level || 1,
          totalXP: gamificationStats?.xp || 0,
          currentStreak: gamificationStats?.streak || 0,
        },
      };

      if (formData.type === 'course-completed' && formData.course) {
        shareData.course = formData.course;
      } else if (formData.type === 'achievement' && formData.achievement) {
        shareData.achievement = formData.achievement;
      } else if (formData.type === 'milestone' && formData.milestone) {
        shareData.milestone = formData.milestone;
      } else if (formData.type === 'streak' && formData.streak) {
        shareData.streak = formData.streak;
      }

      const response = await progressShareAPI.create(shareData);
      Alert.alert('Success', 'Your progress has been shared!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to share progress');
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

  const getDefaultTitle = () => {
    switch (formData.type) {
      case 'course-completed':
        return formData.course ? `Completed ${formData.course.title || 'Course'}` : 'Completed a Course!';
      case 'achievement':
        return formData.achievement?.name || 'Unlocked an Achievement!';
      case 'milestone':
        const milestone = milestones.find(m => m.id === formData.milestone);
        return milestone ? `Reached ${milestone.name}!` : 'Reached a Milestone!';
      case 'streak':
        return formData.streak?.days ? `${formData.streak.days} Day Streak! 🔥` : 'Learning Streak!';
      case 'certificate':
        return 'Earned a Certificate!';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (formData.type !== 'custom' && !formData.title) {
      setFormData({ ...formData, title: getDefaultTitle() });
    }
  }, [formData.type, formData.course, formData.achievement, formData.milestone, formData.streak]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

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
              Share Progress
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

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>What are you sharing? *</Text>
          <View style={styles.typesGrid}>
            {shareTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeOption,
                  {
                    backgroundColor: formData.type === type.id
                      ? type.color
                      : colors.card,
                    borderColor: formData.type === type.id
                      ? type.color
                      : colors.border,
                  },
                ]}
                onPress={() => setFormData({ ...formData, type: type.id, title: '' })}
              >
                <Ionicons
                  name={type.icon}
                  size={24}
                  color={formData.type === type.id ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    {
                      color: formData.type === type.id ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {formData.type === 'course-completed' && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Select Course</Text>
            <TouchableOpacity
              style={[styles.coursePicker, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowCoursePicker(true)}
            >
              <Text style={[styles.coursePickerText, { color: formData.course ? colors.text : colors.secondaryText }]}>
                {formData.course ? formData.course.title : 'Select a course...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
        )}

        {formData.type === 'milestone' && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Milestone Type</Text>
            <View style={styles.optionsGrid}>
              {milestones.map((milestone) => (
                <TouchableOpacity
                  key={milestone.id}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: formData.milestone === milestone.id
                        ? premiumColors.primary.main
                        : colors.card,
                      borderColor: formData.milestone === milestone.id
                        ? premiumColors.primary.main
                        : colors.border,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, milestone: milestone.id })}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      {
                        color: formData.milestone === milestone.id ? '#FFFFFF' : colors.text,
                      },
                    ]}
                  >
                    {milestone.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {formData.type === 'streak' && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Streak Days</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Enter number of days"
              placeholderTextColor={colors.secondaryText}
              value={formData.streak?.days?.toString() || ''}
              onChangeText={(text) => setFormData({
                ...formData,
                streak: { days: parseInt(text) || 0, type: 'learning' }
              })}
              keyboardType="numeric"
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="What's your achievement?"
            placeholderTextColor={colors.secondaryText}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            maxLength={200}
          />
          <Text style={[styles.charCount, { color: colors.secondaryText }]}>
            {formData.title.length}/200
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Share your experience..."
            placeholderTextColor={colors.secondaryText}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Tags (Optional)</Text>
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

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: premiumColors.primary.main }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Sharing...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Share Progress</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {showCoursePicker && (
        <Modal
          visible={showCoursePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCoursePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Course</Text>
                <TouchableOpacity onPress={() => setShowCoursePicker(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.courseList}>
                {availableCourses.map((course) => (
                  <TouchableOpacity
                    key={course._id}
                    style={[styles.courseItem, { backgroundColor: colors.background }]}
                    onPress={() => {
                      setFormData({ ...formData, course: course._id });
                      setShowCoursePicker(false);
                    }}
                  >
                    <Text style={[styles.courseItemText, { color: colors.text }]}>
                      {course.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
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
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeOption: {
    width: '48%',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.base,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeOptionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  coursePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.base,
    borderWidth: 1,
  },
  coursePickerText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.full,
    borderWidth: 1,
  },
  optionChipText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
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
    minHeight: 100,
    textAlignVertical: 'top',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    ...premiumShadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  courseList: {
    maxHeight: 400,
  },
  courseItem: {
    padding: spacing.md,
    borderRadius: premiumBorderRadius.base,
    marginBottom: spacing.sm,
  },
  courseItemText: {
    fontSize: fontSize.md,
  },
});

