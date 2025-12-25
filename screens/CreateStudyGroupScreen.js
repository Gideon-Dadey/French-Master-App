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
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';

const { width } = Dimensions.get('window');

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
    { id: 'all', name: 'All Levels', icon: 'apps', color: '#6366F1', gradient: ['#6366F1', '#4F46E5'] },
    { id: 'beginner', name: 'Beginner', icon: 'leaf', color: '#10B981', gradient: ['#10B981', '#059669'] },
    { id: 'intermediate', name: 'Intermediate', icon: 'flame', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
    { id: 'advanced', name: 'Advanced', icon: 'diamond', color: '#EF4444', gradient: ['#EF4444', '#DC2626'] },
  ];

  const focusOptions = [
    { id: 'general', name: 'General', icon: 'grid', color: '#8B5CF6' },
    { id: 'grammar', name: 'Grammar', icon: 'book', color: '#3B82F6' },
    { id: 'vocabulary', name: 'Vocabulary', icon: 'library', color: '#14B8A6' },
    { id: 'conversation', name: 'Speaking', icon: 'chatbubbles', color: '#F97316' },
    { id: 'pronunciation', name: 'Pronunciation', icon: 'mic', color: '#EC4899' },
    { id: 'writing', name: 'Writing', icon: 'pencil', color: '#8B5CF6' },
    { id: 'reading', name: 'Reading', icon: 'glasses', color: '#06B6D4' },
    { id: 'exam-prep', name: 'Exam Prep', icon: 'school', color: '#EF4444' },
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>

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
          colors={isDarkMode
            ? ['#0C0A1D', '#1A1040', '#2D1B69']
            : ['#F0F4FF', '#E8DEFF', '#F5E6FF']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >

          <View style={styles.headerDecor}>
            <Animated.View
              style={[
                styles.decorOrb,
                styles.decorOrb1,
                { backgroundColor: isDarkMode ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.12)' }
              ]}
            />
            <Animated.View
              style={[
                styles.decorOrb,
                styles.decorOrb2,
                { backgroundColor: isDarkMode ? 'rgba(236,72,153,0.12)' : 'rgba(236,72,153,0.1)' }
              ]}
            />
          </View>

          <View style={styles.headerContent}>

            <View style={styles.headerNav}>
              <TouchableOpacity
                style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(139,92,246,0.1)' }]}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={22} color={isDarkMode ? '#FFFFFF' : '#8B5CF6'} />
              </TouchableOpacity>
              <View style={styles.headerTitleSection}>
                <Text style={[styles.headerBadgeText, { color: isDarkMode ? '#C4B5FD' : '#8B5CF6' }]}>
                  NEW GROUP
                </Text>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Create Study Group
                </Text>
              </View>
              <View style={{ width: 44 }} />
            </View>

            <View style={styles.progressSection}>
              <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(139,92,246,0.15)' }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: `${getCompletionPercentage()}%` }
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.secondaryText }]}>
                {getCompletionPercentage()}% Complete
              </Text>
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

            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                  <Ionicons name="create" size={20} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>Give your group an identity</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Group Name <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <View style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDarkMode ? '#1E1B4B' : '#FFFFFF',
                    borderColor: focusedField === 'name' ? '#8B5CF6' : (isDarkMode ? '#312E81' : '#E5E7EB'),
                  }
                ]}>
                  <Ionicons name="people" size={20} color={focusedField === 'name' ? '#8B5CF6' : colors.secondaryText} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="e.g., French Beginners Club"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    maxLength={100}
                  />
                  {formData.name.length > 0 && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    </View>
                  )}
                </View>
                <Text style={[styles.charCount, { color: colors.secondaryText }]}>
                  {formData.name.length}/100
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Description <Text style={{ color: '#EF4444' }}>*</Text>
                </Text>
                <View style={[
                  styles.textAreaContainer,
                  {
                    backgroundColor: isDarkMode ? '#1E1B4B' : '#FFFFFF',
                    borderColor: focusedField === 'description' ? '#8B5CF6' : (isDarkMode ? '#312E81' : '#E5E7EB'),
                  }
                ]}>
                  <TextInput
                    style={[styles.textArea, { color: colors.text }]}
                    placeholder="Describe what your group is about, learning goals, and what members can expect..."
                    placeholderTextColor={colors.secondaryText}
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
                <Text style={[styles.charCount, { color: colors.secondaryText }]}>
                  {formData.description.length}/500
                </Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#10B981' + '20' }]}>
                  <Ionicons name="trophy" size={20} color="#10B981" />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Skill Level</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>Who should join your group?</Text>
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
                          backgroundColor: isSelected
                            ? level.color + '15'
                            : isDarkMode ? '#1E1B4B' : '#FFFFFF',
                          borderColor: isSelected ? level.color : (isDarkMode ? '#312E81' : '#E5E7EB'),
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, level: level.id })}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={isSelected ? level.gradient : [isDarkMode ? '#312E81' : '#F3F4F6', isDarkMode ? '#312E81' : '#F3F4F6']}
                        style={styles.levelIconContainer}
                      >
                        <Ionicons name={level.icon} size={22} color={isSelected ? '#FFFFFF' : level.color} />
                      </LinearGradient>
                      <Text style={[
                        styles.levelName,
                        { color: isSelected ? level.color : colors.text }
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

            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#3B82F6' + '20' }]}>
                  <Ionicons name="book" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Focus Area</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>What will you study together?</Text>
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
                          backgroundColor: isSelected ? focus.color + '12' : (isDarkMode ? '#1E1B4B' : '#FFFFFF'),
                          borderColor: isSelected ? focus.color : (isDarkMode ? '#312E81' : '#E5E7EB'),
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
                        { color: isSelected ? focus.color : colors.text }
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

            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#F59E0B' + '20' }]}>
                  <Ionicons name="settings" size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Group Settings</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>Customize your group</Text>
                </View>
              </View>

              <View style={styles.settingItem}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Maximum Members</Text>
                <View style={styles.memberOptions}>
                  {memberOptions.map((num) => {
                    const isSelected = formData.maxMembers === num;
                    return (
                      <TouchableOpacity
                        key={num}
                        style={[
                          styles.memberOption,
                          {
                            backgroundColor: isSelected ? '#8B5CF6' : (isDarkMode ? '#1E1B4B' : '#F3F4F6'),
                            borderColor: isSelected ? '#8B5CF6' : (isDarkMode ? '#312E81' : '#E5E7EB'),
                          },
                        ]}
                        onPress={() => setFormData({ ...formData, maxMembers: num })}
                      >
                        <Text style={[
                          styles.memberOptionText,
                          { color: isSelected ? '#FFFFFF' : colors.text }
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
                { backgroundColor: isDarkMode ? '#1E1B4B' : '#FFFFFF', borderColor: isDarkMode ? '#312E81' : '#E5E7EB' }
              ]}>
                <View style={styles.toggleContent}>
                  <View style={[styles.toggleIcon, { backgroundColor: formData.isPrivate ? '#EC4899' + '20' : '#6366F1' + '20' }]}>
                    <Ionicons
                      name={formData.isPrivate ? 'lock-closed' : 'lock-open'}
                      size={20}
                      color={formData.isPrivate ? '#EC4899' : '#6366F1'}
                    />
                  </View>
                  <View style={styles.toggleText}>
                    <Text style={[styles.toggleTitle, { color: colors.text }]}>Private Group</Text>
                    <Text style={[styles.toggleDescription, { color: colors.secondaryText }]}>
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
                    { backgroundColor: formData.isPrivate ? '#EC4899' : (isDarkMode ? '#374151' : '#E5E7EB') }
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
                <Text style={[styles.settingLabel, { color: colors.text }]}>Meeting Schedule</Text>
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
                            backgroundColor: isSelected ? '#8B5CF6' : (isDarkMode ? '#1E1B4B' : '#FFFFFF'),
                            borderColor: isSelected ? '#8B5CF6' : (isDarkMode ? '#312E81' : '#E5E7EB'),
                          },
                        ]}
                        onPress={() => setFormData({
                          ...formData,
                          meetingSchedule: { ...formData.meetingSchedule, frequency: freq.id },
                        })}
                      >
                        <Ionicons name={freq.icon} size={16} color={isSelected ? '#FFFFFF' : '#8B5CF6'} />
                        <Text style={[
                          styles.frequencyText,
                          { color: isSelected ? '#FFFFFF' : colors.text }
                        ]}>
                          {freq.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View style={styles.formSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#EC4899' + '20' }]}>
                  <Ionicons name="flag" size={20} color="#EC4899" />
                </View>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Goals & Tags</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>Optional but recommended</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Study Goals</Text>
                  <Text style={[styles.inputHint, { color: colors.secondaryText }]}>
                    {formData.studyGoals.length}/5
                  </Text>
                </View>
                <View style={[
                  styles.addItemContainer,
                  {
                    backgroundColor: isDarkMode ? '#1E1B4B' : '#FFFFFF',
                    borderColor: focusedField === 'goal' ? '#8B5CF6' : (isDarkMode ? '#312E81' : '#E5E7EB'),
                  }
                ]}>
                  <TextInput
                    style={[styles.addItemInput, { color: colors.text }]}
                    placeholder="e.g., Complete A1 level by June"
                    placeholderTextColor={colors.secondaryText}
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
                      colors={['#8B5CF6', '#7C3AED']}
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
                        style={[styles.goalChip, { backgroundColor: isDarkMode ? '#312E81' : '#F3F4F6' }]}
                      >
                        <Ionicons name="flag" size={14} color="#EC4899" />
                        <Text style={[styles.chipText, { color: colors.text }]} numberOfLines={1}>
                          {goal}
                        </Text>
                        <TouchableOpacity onPress={() => removeGoal(index)}>
                          <Ionicons name="close-circle" size={18} color={colors.secondaryText} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Tags</Text>
                  <Text style={[styles.inputHint, { color: colors.secondaryText }]}>
                    {formData.tags.length}/5
                  </Text>
                </View>
                <View style={[
                  styles.addItemContainer,
                  {
                    backgroundColor: isDarkMode ? '#1E1B4B' : '#FFFFFF',
                    borderColor: focusedField === 'tag' ? '#8B5CF6' : (isDarkMode ? '#312E81' : '#E5E7EB'),
                  }
                ]}>
                  <TextInput
                    style={[styles.addItemInput, { color: colors.text }]}
                    placeholder="e.g., daily-practice, conversation"
                    placeholderTextColor={colors.secondaryText}
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
                      colors={['#8B5CF6', '#7C3AED']}
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
                        style={[styles.tagChip, { backgroundColor: '#8B5CF6' + '15' }]}
                      >
                        <Text style={[styles.tagText, { color: '#8B5CF6' }]}>#{tag}</Text>
                        <TouchableOpacity onPress={() => removeTag(index)}>
                          <Ionicons name="close-circle" size={18} color="#8B5CF6" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <Animated.View style={[styles.submitSection, { transform: [{ scale: buttonAnim }] }]}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={loading ? ['#9CA3AF', '#6B7280'] : ['#8B5CF6', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.submitText}>Creating Group...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="rocket" size={22} color="#FFFFFF" />
                      <Text style={styles.submitText}>Create Study Group</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={[styles.termsText, { color: colors.secondaryText }]}>
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
    marginBottom: 20,
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
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  progressSection: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 14,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputHint: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  checkIcon: {
    marginLeft: 8,
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 6,
  },
  textAreaContainer: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
  },
  textArea: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  levelCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  levelIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelName: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  focusCard: {
    width: (width - 52) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
    position: 'relative',
  },
  focusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusCardText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  focusSelectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  memberOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  memberOption: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberOptionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 20,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  toggleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
  },
  toggleSwitch: {
    width: 52,
    height: 32,
    borderRadius: 16,
    padding: 4,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  frequencyScroll: {
    gap: 10,
  },
  frequencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    gap: 8,
  },
  frequencyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 6,
    gap: 12,
  },
  addItemInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
  addItemBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addItemBtnGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    maxWidth: '100%',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitSection: {
    marginTop: 12,
    alignItems: 'center',
  },
  submitButton: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  submitText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});
