import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { studyGroupsAPI } from '../src/services/api';
import { getThemeColors, themeShadows } from '../src/utils/organicTheme';

const { width } = Dimensions.get('window');

export default function CreateStudyGroupScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);
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
  const [focusedField, setFocusedField] = useState(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(formAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8, delay: 150 }),
    ]).start();
  }, []);

  const levels = [
    { id: 'all', name: 'All Levels', icon: 'apps', color: theme.primary },
    { id: 'beginner', name: 'Beginner', icon: 'leaf', color: theme.success },
    { id: 'intermediate', name: 'Intermediate', icon: 'flame', color: theme.secondary },
    { id: 'advanced', name: 'Advanced', icon: 'diamond', color: theme.error },
  ];

  const focusOptions = [
    { id: 'general', name: 'General', icon: 'grid', color: theme.primary },
    { id: 'grammar', name: 'Grammar', icon: 'book', color: theme.info },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'library', color: theme.success },
    { id: 'conversation', name: 'Speaking', icon: 'chatbubbles', color: theme.secondary },
    { id: 'pronunciation', name: 'Pronunciation', icon: 'mic', color: theme.accent },
    { id: 'writing', name: 'Writing', icon: 'pencil', color: theme.primary },
    { id: 'reading', name: 'Reading', icon: 'glasses', color: theme.info },
    { id: 'exam-prep', name: 'Exam Prep', icon: 'school', color: theme.error },
  ];

  const frequencies = [
    { id: 'flexible', name: 'Flexible', icon: 'time' },
    { id: 'daily', name: 'Daily', icon: 'today' },
    { id: 'weekly', name: 'Weekly', icon: 'calendar' },
    { id: 'bi-weekly', name: 'Bi-weekly', icon: 'calendar-outline' },
    { id: 'monthly', name: 'Monthly', icon: 'calendar-number' },
  ];

  const memberOptions = ['5', '10', '15', '20', '30', '50'];

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter a group name');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Missing Information', 'Please enter a description');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to create a study group');
      navigation.navigate('Auth');
      return;
    }

    Animated.sequence([
      Animated.timing(buttonAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      setLoading(true);

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
      Alert.alert('🎉 Success!', 'Your study group has been created!', [
        {
          text: 'View Group',
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
    if (currentGoal.trim() && formData.studyGoals.length < 5) {
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
    if (currentTag.trim() && formData.tags.length < 5) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim().toLowerCase()],
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

  const getCompletionPercentage = () => {
    let completed = 0;
    if (formData.name.trim()) completed++;
    if (formData.description.trim()) completed++;
    if (formData.level) completed++;
    if (formData.focus) completed++;
    return Math.round((completed / 4) * 100);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      <Animated.View
        style={[
          styles.headerWrapper,
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
          },
        ]}
      >
        <LinearGradient
          colors={theme.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerDecor}>
            <View style={[styles.decorOrb, styles.decorOrb1, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
            <View style={[styles.decorOrb, styles.decorOrb2, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerNav}>
              <TouchableOpacity
                style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.headerTitleSection}>
                <Text style={[styles.headerBadgeText, { color: theme.secondary }]}>NEW GROUP</Text>
                <Text style={styles.headerTitle}>Create Study Group</Text>
              </View>
              <View style={{ width: 44 }} />
            </View>

            <View style={styles.progressSection}>
              <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${getCompletionPercentage()}%`, backgroundColor: theme.secondary }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{getCompletionPercentage()}% Complete</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: formAnim,
              transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            }}
          >
            {/* Basic Information */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name="create" size={20} color={theme.primary} />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Give your group an identity</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Group Name <Text style={{ color: theme.error }}>*</Text>
                </Text>
                <View style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.surface,
                    borderColor: focusedField === 'name' ? theme.primary : theme.border,
                  }
                ]}>
                  <Ionicons name="people" size={20} color={focusedField === 'name' ? theme.primary : theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="e.g., French Beginners Club"
                    placeholderTextColor={theme.textMuted}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    maxLength={100}
                  />
                  {formData.name.length > 0 && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                    </View>
                  )}
                </View>
                <Text style={[styles.charCount, { color: theme.textSecondary }]}>
                  {formData.name.length}/100
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Description <Text style={{ color: theme.error }}>*</Text>
                </Text>
                <View style={[
                  styles.textAreaContainer,
                  {
                    backgroundColor: theme.surface,
                    borderColor: focusedField === 'description' ? theme.primary : theme.border,
                  }
                ]}>
                  <TextInput
                    style={[styles.textArea, { color: theme.text }]}
                    placeholder="Describe what your group is about, learning goals, and what members can expect..."
                    placeholderTextColor={theme.textMuted}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    onFocus={() => setFocusedField('description')}
                    onBlur={() => setFocusedField(null)}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={[styles.charCount, { color: theme.textSecondary }]}>
                  {formData.description.length}/500
                </Text>
              </View>
            </View>

            {/* Skill Level */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: theme.success + '20' }]}>
                  <Ionicons name="trophy" size={20} color={theme.success} />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Skill Level</Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Who should join your group?</Text>
                </View>
              </View>

              <View style={styles.levelGrid}>
                {levels.map((level) => {
                  const isSelected = formData.level === level.id;
                  return (
                    <TouchableOpacity
                      key={level.id}
                      style={[
                        styles.levelCard,
                        {
                          backgroundColor: isSelected ? level.color + '15' : theme.surface,
                          borderColor: isSelected ? level.color : theme.border,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, level: level.id })}
                      activeOpacity={0.8}
                    >
                      <View style={[
                        styles.levelIconContainer,
                        { backgroundColor: isSelected ? level.color : level.color + '20' }
                      ]}>
                        <Ionicons name={level.icon} size={22} color={isSelected ? '#FFFFFF' : level.color} />
                      </View>
                      <Text style={[
                        styles.levelName,
                        { color: isSelected ? level.color : theme.text }
                      ]}>
                        {level.name}
                      </Text>
                      {isSelected && (
                        <View style={[styles.selectedIndicator, { backgroundColor: level.color }]}>
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Focus Area */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: theme.info + '20' }]}>
                  <Ionicons name="book" size={20} color={theme.info} />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Focus Area</Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>What will you study together?</Text>
                </View>
              </View>

              <View style={styles.focusGrid}>
                {focusOptions.map((focus) => {
                  const isSelected = formData.focus === focus.id;
                  return (
                    <TouchableOpacity
                      key={focus.id}
                      style={[
                        styles.focusCard,
                        {
                          backgroundColor: isSelected ? focus.color + '12' : theme.surface,
                          borderColor: isSelected ? focus.color : theme.border,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, focus: focus.id })}
                      activeOpacity={0.8}
                    >
                      <View style={[
                        styles.focusIconContainer,
                        { backgroundColor: isSelected ? focus.color : focus.color + '20' }
                      ]}>
                        <Ionicons name={focus.icon} size={20} color={isSelected ? '#FFFFFF' : focus.color} />
                      </View>
                      <Text style={[
                        styles.focusCardText,
                        { color: isSelected ? focus.color : theme.text }
                      ]}>
                        {focus.name}
                      </Text>
                      {isSelected && (
                        <View style={[styles.focusSelectedBadge, { backgroundColor: focus.color }]}>
                          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Group Settings */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: theme.secondary + '20' }]}>
                  <Ionicons name="settings" size={20} color={theme.secondary} />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Group Settings</Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Customize your group</Text>
                </View>
              </View>

              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Maximum Members</Text>
                <View style={styles.memberOptions}>
                  {memberOptions.map((num) => {
                    const isSelected = formData.maxMembers === num;
                    return (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.memberOption,
                          {
                            backgroundColor: isSelected ? theme.primary : theme.surface,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => setFormData({ ...formData, maxMembers: num })}
                      >
                        <Text style={[
                          styles.memberOptionText,
                          { color: isSelected ? '#FFFFFF' : theme.text }
                        ]}>
                          {num}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={[
                styles.toggleCard,
                { backgroundColor: theme.surface, borderColor: theme.border }
              ]}>
                <View style={styles.toggleContent}>
                  <View style={[styles.toggleIcon, { backgroundColor: formData.isPrivate ? theme.accent + '20' : theme.primary + '20' }]}>
                    <Ionicons
                      name={formData.isPrivate ? 'lock-closed' : 'lock-open'}
                      size={20}
                      color={formData.isPrivate ? theme.accent : theme.primary}
                    />
                  </View>
                  <View style={styles.toggleText}>
                    <Text style={[styles.toggleTitle, { color: theme.text }]}>Private Group</Text>
                    <Text style={[styles.toggleDescription, { color: theme.textSecondary }]}>
                      {formData.isPrivate
                        ? 'Members need an invite code to join'
                        : 'Anyone can discover and join this group'
                      }
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    { backgroundColor: formData.isPrivate ? theme.accent : theme.border }
                  ]}
                  onPress={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={[
                      styles.toggleKnob,
                      { transform: [{ translateX: formData.isPrivate ? 20 : 0 }] }
                    ]}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Meeting Schedule</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.frequencyScroll}
                >
                  {frequencies.map((freq) => {
                    const isSelected = formData.meetingSchedule.frequency === freq.id;
                    return (
                      <TouchableOpacity
                        key={freq.id}
                        style={[
                          styles.frequencyChip,
                          {
                            backgroundColor: isSelected ? theme.primary : theme.surface,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => setFormData({
                          ...formData,
                          meetingSchedule: { ...formData.meetingSchedule, frequency: freq.id },
                        })}
                      >
                        <Ionicons name={freq.icon} size={16} color={isSelected ? '#FFFFFF' : theme.primary} />
                        <Text style={[
                          styles.frequencyText,
                          { color: isSelected ? '#FFFFFF' : theme.text }
                        ]}>
                          {freq.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Goals & Tags */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: theme.accent + '20' }]}>
                  <Ionicons name="flag" size={20} color={theme.accent} />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Goals & Tags</Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Optional but recommended</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Study Goals</Text>
                  <Text style={[styles.inputHint, { color: theme.textSecondary }]}>
                    {formData.studyGoals.length}/5
                  </Text>
                </View>
                <View style={[
                  styles.addItemContainer,
                  {
                    backgroundColor: theme.surface,
                    borderColor: focusedField === 'goal' ? theme.primary : theme.border,
                  }
                ]}>
                  <TextInput
                    style={[styles.addItemInput, { color: theme.text }]}
                    placeholder="e.g., Complete A1 level by June"
                    placeholderTextColor={theme.textMuted}
                    value={currentGoal}
                    onChangeText={setCurrentGoal}
                    onFocus={() => setFocusedField('goal')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={addGoal}
                  />
                  <TouchableOpacity
                    style={[styles.addItemBtn, { opacity: currentGoal.trim() ? 1 : 0.5 }]}
                    onPress={addGoal}
                    disabled={!currentGoal.trim()}
                  >
                    <LinearGradient
                      colors={[theme.primary, theme.primaryLight || theme.primary]}
                      style={styles.addItemBtnGradient}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                {formData.studyGoals.length > 0 && (
                  <View style={styles.chipsContainer}>
                    {formData.studyGoals.map((goal, index) => (
                      <View
                        key={index}
                        style={[styles.goalChip, { backgroundColor: theme.border }]}
                      >
                        <Ionicons name="flag" size={14} color={theme.accent} />
                        <Text style={[styles.chipText, { color: theme.text }]} numberOfLines={1}>
                          {goal}
                        </Text>
                        <TouchableOpacity onPress={() => removeGoal(index)}>
                          <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Tags</Text>
                  <Text style={[styles.inputHint, { color: theme.textSecondary }]}>
                    {formData.tags.length}/5
                  </Text>
                </View>
                <View style={[
                  styles.addItemContainer,
                  {
                    backgroundColor: theme.surface,
                    borderColor: focusedField === 'tag' ? theme.primary : theme.border,
                  }
                ]}>
                  <TextInput
                    style={[styles.addItemInput, { color: theme.text }]}
                    placeholder="e.g., daily-practice, conversation"
                    placeholderTextColor={theme.textMuted}
                    value={currentTag}
                    onChangeText={setCurrentTag}
                    onFocus={() => setFocusedField('tag')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={addTag}
                  />
                  <TouchableOpacity
                    style={[styles.addItemBtn, { opacity: currentTag.trim() ? 1 : 0.5 }]}
                    onPress={addTag}
                    disabled={!currentTag.trim()}
                  >
                    <LinearGradient
                      colors={[theme.primary, theme.primaryLight || theme.primary]}
                      style={styles.addItemBtnGradient}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                {formData.tags.length > 0 && (
                  <View style={styles.chipsContainer}>
                    {formData.tags.map((tag, index) => (
                      <View
                        key={index}
                        style={[styles.tagChip, { backgroundColor: theme.primary + '15' }]}
                      >
                        <Text style={[styles.tagText, { color: theme.primary }]}>#{tag}</Text>
                        <TouchableOpacity onPress={() => removeTag(index)}>
                          <Ionicons name="close-circle" size={18} color={theme.primary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Submit */}
            <Animated.View style={[styles.submitSection, { transform: [{ scale: buttonAnim }] }]}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={loading ? [theme.textMuted, theme.textSecondary] : [theme.primary, theme.primaryLight || theme.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator color={theme.textOnPrimary || "#FFFFFF"} size="small" />
                      <Text style={[styles.submitText, { color: theme.textOnPrimary || '#FFFFFF' }]}>Creating Group...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="rocket" size={22} color={theme.textOnPrimary || "#FFFFFF"} />
                      <Text style={[styles.submitText, { color: theme.textOnPrimary || '#FFFFFF' }]}>Create Study Group</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                By creating a group, you agree to our community guidelines
              </Text>
            </Animated.View>

            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    zIndex: 10,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  decorOrb1: {
    width: 150,
    height: 150,
    top: -30,
    right: -30,
  },
  decorOrb2: {
    width: 100,
    height: 100,
    bottom: 10,
    left: -20,
  },
  headerContent: {
    zIndex: 1,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleSection: {
    flex: 1,
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  progressSection: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formSection: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
  checkIcon: {
    marginLeft: 8,
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  textAreaContainer: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
  },
  textArea: {
    fontSize: 15,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  levelCard: {
    width: (width - 50) / 2,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    position: 'relative',
  },
  levelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelName: {
    fontSize: 13,
    fontWeight: '700',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  focusCard: {
    width: (width - 50) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
    position: 'relative',
  },
  focusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusCardText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  focusSelectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItem: {
    marginBottom: 18,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  memberOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  memberOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 18,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 11,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 3,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    ...themeShadows.sm,
  },
  frequencyScroll: {
    gap: 8,
  },
  frequencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  frequencyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 5,
    gap: 10,
  },
  addItemInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
  },
  addItemBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  addItemBtnGradient: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    maxWidth: '100%',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitSection: {
    marginTop: 8,
    alignItems: 'center',
  },
  submitButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    ...themeShadows.md,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: 12,
    marginTop: 14,
    textAlign: 'center',
  },
});
