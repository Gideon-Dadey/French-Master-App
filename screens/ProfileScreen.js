import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
  RefreshControl,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { usersAPI, progressAPI } from '../src/services/api';
import { spacing, fontSize } from '../src/utils/responsive';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import { showToast } from '../src/components/ToastNotification';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { stats: gamificationStats } = useGamification();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedLessons: 0,
    totalProgress: 0,
    studyTime: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      setError(null);
      const [profileResponse, progressResponse] = await Promise.all([
        usersAPI.getProfile().catch(() => null),
        progressAPI.getDashboard().catch(() => null),
      ]);

      if (profileResponse?.data?.data) {
        const profileData = profileResponse.data.data;
        setProfile(profileData);
        setNotifications(profileData.preferences?.notifications !== false);
        setEditFormData({
          name: profileData.name || '',
          phone: profileData.phone || '',
        });
        
        // Calculate stats
        const enrolledCount = profileData.enrolledCourses?.length || 0;
        const dashboardData = progressResponse?.data?.data || {};
        const completedCount = dashboardData.totalLessonsCompleted || 0;
        const totalProgress = dashboardData.totalProgress || 0;
        const studyTime = dashboardData.totalTimeSpent || 0;

        setStats({
          enrolledCourses: enrolledCount,
          completedLessons: completedCount,
          totalProgress: Math.round(totalProgress),
          studyTime: formatStudyTime(studyTime),
          streak: gamificationStats?.streak || 0,
        });
      } else if (user) {
        setProfile({
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatStudyTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleUpdatePreference = async (key, value) => {
    try {
      await usersAPI.updateProfile({ preferences: { [key]: value } });
      if (key === 'theme') {
        toggleTheme();
      } else if (key === 'notifications') {
        setNotifications(value);
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const handleAvatarPicker = () => {
    Alert.alert(
      'Change Avatar',
      'Choose an option',
      [
        { text: 'Camera', onPress: handleOpenCamera },
        { text: 'Photo Library', onPress: handleOpenImageLibrary },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleOpenCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleImageSelected(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera.');
    }
  };

  const handleOpenImageLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library permission is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleImageSelected(result.assets[0]);
      }
    } catch (error) {
      console.error('Image library error:', error);
      Alert.alert('Error', 'Failed to open photo library.');
    }
  };

  const handleImageSelected = async (asset) => {
    try {
      setUploadingAvatar(true);
      const base64Image = asset.base64 
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      const updateResponse = await usersAPI.updateProfile({ avatar: base64Image });
      if (updateResponse.data.success) {
        // Update user in AuthContext to reflect avatar change in tab bar
        await updateUser({ avatar: base64Image });
        await loadProfile();
        showToast.success('Avatar Updated', 'Your profile picture has been updated!');
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      showToast.error('Upload Failed', 'Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleOpenEditModal = () => {
    if (profile) {
      setEditFormData({
        name: profile.name || '',
        phone: profile.phone || '',
      });
    }
    setEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    if (profile) {
      setEditFormData({
        name: profile.name || '',
        phone: profile.phone || '',
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!editFormData.name || editFormData.name.trim() === '') {
      Alert.alert('Error', 'Name is required');
      return;
    }
    try {
      setEditingProfile(true);
      const updateData = {
        name: editFormData.name.trim(),
      };
      if (editFormData.phone) {
        updateData.phone = editFormData.phone.trim();
      }
      const updateResponse = await usersAPI.updateProfile(updateData);
      if (updateResponse.data.success) {
        await loadProfile();
        setEditModalVisible(false);
        showToast.success('Profile Updated', 'Your profile has been updated!');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast.error('Update Failed', error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setEditingProfile(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Landing' }],
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.guestContainer}
      >
        <LinearGradient
          colors={isDarkMode 
            ? ['#1a0a2e', '#16213e', '#0f3460']
            : ['#E8EAF6', '#F3E5F5', '#E1BEE7']
          }
          style={styles.guestHeader}
        >
          <View style={styles.guestAvatarContainer}>
            <Ionicons name="person-circle-outline" size={120} color={isDarkMode ? '#BB86FC' : '#9C27B0'} />
          </View>
          <Text style={[styles.guestTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>Welcome!</Text>
          <Text style={[styles.guestSubtitle, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : '#616161' }]}>
            Please login to access your profile and track your learning progress
          </Text>
        </LinearGradient>
        <View style={styles.guestActions}>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: premiumColors.primary.main }, premiumShadows.md]}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.card, borderColor: premiumColors.primary.main }, premiumShadows.sm]}
            onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
          >
            <Text style={[styles.registerButtonText, { color: premiumColors.primary.main }]}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (error && !profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorMessage message={error} onRetry={loadProfile} />
      </View>
    );
  }

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366F1&color=fff&size=200`;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Premium Header */}
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
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: avatarUrl }}
              style={[styles.avatar, { borderColor: colors.card }]}
            />
            <TouchableOpacity 
              style={[styles.editAvatarButton, { backgroundColor: premiumColors.primary.main }]}
              onPress={handleAvatarPicker}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>{displayName}</Text>
          <Text style={[styles.email, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : '#616161' }]}>{displayEmail}</Text>
          {stats.streak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: '#FFD700' }]}>
              <Ionicons name="flame" size={16} color="#000" />
              <Text style={styles.streakText}>{stats.streak} day streak</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : colors.card }, premiumShadows.sm]}
            onPress={handleOpenEditModal}
            disabled={editingProfile}
          >
            <Ionicons name="create-outline" size={16} color={isDarkMode ? '#FFFFFF' : premiumColors.primary.main} />
            <Text style={[styles.editButtonText, { color: isDarkMode ? '#FFFFFF' : premiumColors.primary.main }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Premium Statistics Cards */}
      <View style={styles.statsSection}>
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.lg]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Learning Statistics</Text>
          <View style={styles.statsGrid}>
            <StatItem
              icon="book"
              value={stats.enrolledCourses}
              label="Courses"
              color={premiumColors.primary.main}
              colors={colors}
            />
            <StatItem
              icon="checkmark-circle"
              value={stats.completedLessons}
              label="Lessons"
              color={premiumColors.accent.emerald}
              colors={colors}
            />
            <StatItem
              icon="time"
              value={stats.studyTime}
              label="Study Time"
              color={premiumColors.accent.gold}
              colors={colors}
            />
            <StatItem
              icon="trophy"
              value={`${stats.totalProgress}%`}
              label="Progress"
              color={premiumColors.accent.rose}
              colors={colors}
            />
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.section}>
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Overall Progress</Text>
            <Text style={[styles.progressPercentage, { color: premiumColors.primary.main }]}>
              {stats.totalProgress}%
            </Text>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
            <LinearGradient
              colors={[premiumColors.primary.main, premiumColors.primary.light]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${stats.totalProgress}%` }]}
            />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionCard
            icon="library"
            title="My Courses"
            subtitle="View enrolled"
            color={premiumColors.primary.main}
            colors={colors}
            onPress={() => navigation.navigate('MyCourses')}
          />
          <QuickActionCard
            icon="trophy"
            title="Achievements"
            subtitle="View badges"
            color={premiumColors.accent.gold}
            colors={colors}
            onPress={() => navigation.navigate('Achievements')}
          />
          <QuickActionCard
            icon="heart"
            title="Wishlist"
            subtitle="Saved courses"
            color={premiumColors.accent.rose}
            colors={colors}
            onPress={() => navigation.navigate('Wishlist')}
          />
          <QuickActionCard
            icon="notifications"
            title="Notifications"
            subtitle="View alerts"
            color={premiumColors.accent.sky}
            colors={colors}
            onPress={() => navigation.navigate('Notifications')}
          />
        </View>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Settings</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle="Switch theme"
            colors={colors}
            isDarkMode={isDarkMode}
            value={isDarkMode}
            onValueChange={(value) => {
              toggleTheme();
              handleUpdatePreference('theme', value ? 'dark' : 'light');
            }}
          />
          <SettingItem
            icon="notifications"
            title="Notifications"
            subtitle="Push notifications"
            colors={colors}
            value={notifications}
            onValueChange={(value) => handleUpdatePreference('notifications', value)}
          />
        </View>
      </View>

      {/* More Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>More Options</Text>
        <View style={[styles.optionsCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
          <MenuOption
            icon="card"
            title="Payment Methods"
            subtitle="Manage payments"
            color={premiumColors.accent.gold}
            colors={colors}
            onPress={() => Alert.alert('Coming Soon', 'Payment methods will be available soon')}
          />
          <MenuOption
            icon="receipt"
            title="Purchase History"
            subtitle="View transactions"
            color={premiumColors.accent.emerald}
            colors={colors}
            onPress={() => Alert.alert('Coming Soon', 'Purchase history will be available soon')}
          />
          <MenuOption
            icon="help-circle"
            title="Help & Support"
            subtitle="Get assistance"
            color={premiumColors.accent.sky}
            colors={colors}
            onPress={() => navigation.navigate('Resources')}
          />
          <MenuOption
            icon="document-text"
            title="Terms & Conditions"
            subtitle="Legal information"
            color={colors.secondaryText}
            colors={colors}
            onPress={() => Alert.alert('Terms & Conditions', 'Terms content will be displayed here.')}
          />
          <MenuOption
            icon="shield-checkmark"
            title="Privacy Policy"
            subtitle="Data protection"
            color={colors.secondaryText}
            colors={colors}
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy content will be displayed here.')}
          />
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]} 
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={22} color={premiumColors.error} />
        <Text style={[styles.logoutText, { color: premiumColors.error }]}>Logout</Text>
      </TouchableOpacity>

      {/* Version Info */}
      <Text style={[styles.version, { color: colors.secondaryText }]}>Version 1.0.0</Text>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={handleCloseEditModal} disabled={editingProfile}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Name *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.secondaryText}
                  editable={!editingProfile}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Phone</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="phone-pad"
                  editable={!editingProfile}
                />
              </View>
            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleCloseEditModal}
                disabled={editingProfile}
              >
                <Text style={[styles.cancelButtonText, { color: colors.secondaryText }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: premiumColors.primary.main }, editingProfile && styles.disabledButton]}
                onPress={handleSaveProfile}
                disabled={editingProfile}
              >
                {editingProfile ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

function StatItem({ icon, value, label, color, colors }) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
    </View>
  );
}

function QuickActionCard({ icon, title, subtitle, color, colors, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[color, color + 'DD']}
        style={styles.quickActionGradient}
      >
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </LinearGradient>
      <Text style={[styles.quickActionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.quickActionSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function SettingItem({ icon, title, subtitle, colors, isDarkMode, value, onValueChange }) {
  return (
    <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: (isDarkMode ? '#9C27B0' : premiumColors.primary.main) + '20' }]}>
        <Ionicons name={icon} size={20} color={isDarkMode ? '#9C27B0' : premiumColors.primary.main} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: premiumColors.primary.main }}
        thumbColor="#fff"
      />
    </View>
  );
}

function MenuOption({ icon, title, subtitle, color, colors, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.menuOption, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuText, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestContainer: {
    flexGrow: 1,
  },
  guestHeader: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  guestAvatarContainer: {
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  guestActions: {
    padding: 20,
    gap: 15,
  },
  loginButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: premiumBorderRadius.lg,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  registerButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: premiumBorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  registerButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...premiumShadows.md,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.full,
    gap: spacing.xs / 2,
    marginBottom: spacing.md,
  },
  streakText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#000',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: premiumBorderRadius.full,
    gap: spacing.xs,
  },
  editButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  statsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: spacing.md,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  progressCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  quickActionCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  settingsCard: {
    borderRadius: premiumBorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: fontSize.xs,
  },
  optionsCard: {
    borderRadius: premiumBorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: fontSize.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    marginBottom: spacing.xxxl,
    paddingTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: premiumBorderRadius.xl,
    borderTopRightRadius: premiumBorderRadius.xl,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  modalBody: {
    padding: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: premiumBorderRadius.base,
    padding: spacing.md,
    fontSize: fontSize.md,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: premiumBorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: premiumColors.primary.main,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
