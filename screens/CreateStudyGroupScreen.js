import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { studyGroupsAPI } from '../src/services/api';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';

export default function CreateStudyGroupScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'all',
    focus: 'general',
    maxMembers: '20',
    isPrivate: false,
    meetingSchedule: {
      frequency: 'flexible',
      dayOfWeek: '',
      time: '',
    },
    studyGoals: [],
    tags: [],
  });
  const [currentGoal, setCurrentGoal] = useState('');
  const [currentTag, setCurrentTag] = useState('');

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];

  const focusOptions = [
    { id: 'general', name: 'General' },
    { id: 'grammar', name: 'Grammar' },
    { id: 'vocabulary', name: 'Vocabulary' },
    { id: 'conversation', name: 'Conversation' },
    { id: 'pronunciation', name: 'Pronunciation' },
    { id: 'writing', name: 'Writing' },
    { id: 'reading', name: 'Reading' },
    { id: 'exam-prep', name: 'Exam Prep' },
  ];

  const frequencies = [
    { id: 'flexible', name: 'Flexible' },
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'bi-weekly', name: 'Bi-weekly' },
    { id: 'monthly', name: 'Monthly' },
  ];

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to create a study group');
      navigation.navigate('Auth');
      return;
    }

    try {
      setLoading(true);
      
      // Clean up meetingSchedule - don't send empty dayOfWeek or time
      const cleanedMeetingSchedule = { ...formData.meetingSchedule };
      if (!cleanedMeetingSchedule.dayOfWeek || cleanedMeetingSchedule.dayOfWeek === '') {
        delete cleanedMeetingSchedule.dayOfWeek;
      }
      if (!cleanedMeetingSchedule.time || cleanedMeetingSchedule.time === '') {
        delete cleanedMeetingSchedule.time;
      }
      
      const submitData = {
        ...formData,
        maxMembers: parseInt(formData.maxMembers) || 20,
        studyGoals: formData.studyGoals.filter(goal => goal.trim()),
        tags: formData.tags.filter(tag => tag.trim()),
        meetingSchedule: cleanedMeetingSchedule,
      };

      const response = await studyGroupsAPI.create(submitData);
      Alert.alert('Success', 'Study group created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('StudyGroupDetail', { groupId: response.data.data._id }),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create study group');
    } finally {
      setLoading(false);
    }
  };

  const addGoal = () => {
    if (currentGoal.trim()) {
      setFormData({
        ...formData,
        studyGoals: [...formData.studyGoals, currentGoal.trim()],
      });
      setCurrentGoal('');
    }
  };

  const removeGoal = (index) => {
    setFormData({
      ...formData,
      studyGoals: formData.studyGoals.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (currentTag.trim()) {
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
              Create Study Group
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
        {/* Group Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Group Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter group name"
            placeholderTextColor={colors.secondaryText}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Describe your study group..."
            placeholderTextColor={colors.secondaryText}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        {/* Level */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Level</Text>
          <View style={styles.optionsContainer}>
            {levels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: formData.level === level.id
                      ? premiumColors.primary.main
                      : colors.card,
                    borderColor: formData.level === level.id
                      ? premiumColors.primary.main
                      : colors.border,
                  },
                ]}
                onPress={() => setFormData({ ...formData, level: level.id })}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: formData.level === level.id ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {level.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Focus */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Focus Area</Text>
          <View style={styles.optionsContainer}>
            {focusOptions.map((focus) => (
              <TouchableOpacity
                key={focus.id}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: formData.focus === focus.id
                      ? premiumColors.primary.main
                      : colors.card,
                    borderColor: formData.focus === focus.id
                      ? premiumColors.primary.main
                      : colors.border,
                  },
                ]}
                onPress={() => setFormData({ ...formData, focus: focus.id })}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: formData.focus === focus.id ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {focus.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Max Members */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Maximum Members</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="20"
            placeholderTextColor={colors.secondaryText}
            value={formData.maxMembers}
            onChangeText={(text) => setFormData({ ...formData, maxMembers: text })}
            keyboardType="numeric"
          />
        </View>

        {/* Privacy */}
        <View style={[styles.section, styles.switchSection]}>
          <View style={styles.switchContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Private Group</Text>
            <Text style={[styles.switchDescription, { color: colors.secondaryText }]}>
              Private groups require an invite code to join
            </Text>
          </View>
          <Switch
            value={formData.isPrivate}
            onValueChange={(value) => setFormData({ ...formData, isPrivate: value })}
            trackColor={{ false: colors.border, true: premiumColors.primary.main }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Meeting Schedule */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Meeting Frequency</Text>
          <View style={styles.optionsContainer}>
            {frequencies.map((freq) => (
              <TouchableOpacity
                key={freq.id}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: formData.meetingSchedule.frequency === freq.id
                      ? premiumColors.primary.main
                      : colors.card,
                    borderColor: formData.meetingSchedule.frequency === freq.id
                      ? premiumColors.primary.main
                      : colors.border,
                  },
                ]}
                onPress={() => setFormData({
                  ...formData,
                  meetingSchedule: { ...formData.meetingSchedule, frequency: freq.id },
                })}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: formData.meetingSchedule.frequency === freq.id ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  {freq.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Study Goals */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Study Goals</Text>
          <View style={styles.addItemContainer}>
            <TextInput
              style={[styles.addItemInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Add a study goal"
              placeholderTextColor={colors.secondaryText}
              value={currentGoal}
              onChangeText={setCurrentGoal}
              onSubmitEditing={addGoal}
            />
            <TouchableOpacity
              style={[styles.addItemButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={addGoal}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {formData.studyGoals.map((goal, index) => (
            <View key={index} style={[styles.itemChip, { backgroundColor: colors.card }]}>
              <Text style={[styles.itemText, { color: colors.text }]}>{goal}</Text>
              <TouchableOpacity onPress={() => removeGoal(index)}>
                <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Tags</Text>
          <View style={styles.addItemContainer}>
            <TextInput
              style={[styles.addItemInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Add a tag"
              placeholderTextColor={colors.secondaryText}
              value={currentTag}
              onChangeText={setCurrentTag}
              onSubmitEditing={addTag}
            />
            <TouchableOpacity
              style={[styles.addItemButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={addTag}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {formData.tags.map((tag, index) => (
            <View key={index} style={[styles.itemChip, { backgroundColor: colors.card }]}>
              <Text style={[styles.itemText, { color: colors.text }]}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(index)}>
                <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: premiumColors.primary.main }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Creating...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Create Study Group</Text>
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
  optionsContainer: {
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
  optionText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  switchSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    flex: 1,
  },
  switchDescription: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs / 2,
  },
  addItemContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  addItemInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.sm,
    fontSize: fontSize.sm,
  },
  addItemButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: premiumBorderRadius.base,
    marginBottom: spacing.xs,
  },
  itemText: {
    fontSize: fontSize.sm,
    flex: 1,
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

