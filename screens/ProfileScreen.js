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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { usersAPI, progressAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import { showToast } from '../src/components/ToastNotification';

export default function ProfileScreen({ navigation }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedLessons: 0,
    totalProgress: 0,
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
        const completedCount = dashboardData.completedLessons || 0;
        const totalProgress = dashboardData.totalProgress || 0;

        setStats({
          enrolledCourses: enrolledCount,
          completedLessons: completedCount,
          totalProgress: Math.round(totalProgress),
        });
      } else if (user) {
        // Fallback to user from context
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

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleUpdatePreference = async (key, value) => {
    try {
      await usersAPI.updateProfile({ preferences: { [key]: value } });
      if (key === 'theme') {
        toggleTheme(); // Use theme context
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
        {
          text: 'Camera',
          onPress: handleOpenCamera,
        },
        {
          text: 'Photo Library',
          onPress: handleOpenImageLibrary,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleOpenCamera = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos. Please enable it in your device settings.'
        );
        return;
      }

      // Launch camera
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
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const handleOpenImageLibrary = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library permission is required to select images. Please enable it in your device settings.'
        );
        return;
      }

      // Launch image library
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
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
    }
  };

  const handleImageSelected = async (asset) => {
    try {
      setUploadingAvatar(true);

      // Create base64 data URI
      const base64Image = asset.base64 
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;

      // Update profile with new avatar
      const updateResponse = await usersAPI.updateProfile({ avatar: base64Image });

      if (updateResponse.data.success) {
        // Reload profile to get updated data
        await loadProfile();
        
        showToast.success('Avatar Updated', 'Your profile picture has been updated successfully!');
      } else {
        throw new Error('Failed to update avatar');
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      showToast.error('Upload Failed', 'Failed to upload avatar. Please try again.');
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
    // Reset form data
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
        // Reload profile to get updated data
        await loadProfile();
        setEditModalVisible(false);
        showToast.success('Profile Updated', 'Your profile has been updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast.error(
        'Update Failed',
        error.response?.data?.message || 'Failed to update profile. Please try again.'
      );
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
        <View style={styles.guestHeader}>
          <View style={styles.guestAvatarContainer}>
            <Ionicons name="person-circle-outline" size={120} color={colors.primary} />
          </View>
          <Text style={[styles.guestTitle, { color: colors.text }]}>Welcome!</Text>
          <Text style={[styles.guestSubtitle, { color: colors.secondaryText }]}>
            Please login to access your profile and track your learning progress
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.card, borderColor: colors.primary }]}
            onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
          >
            <Text style={[styles.registerButtonText, { color: colors.primary }]}>Create Account</Text>
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
  const avatarUrl = profile?.avatar || user?.avatar || 'https://via.placeholder.com/100';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#1E88E5', '#42A5F5']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: avatarUrl }}
              style={[styles.avatar, { borderColor: colors.card, backgroundColor: colors.card }]}
            />
            <TouchableOpacity 
              style={[styles.editAvatarButton, { backgroundColor: colors.primary, borderColor: colors.card }]}
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
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.card }]}
            onPress={handleOpenEditModal}
            disabled={editingProfile}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="book-outline" size={28} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.enrolledCourses}</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Courses</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="checkmark-circle-outline" size={28} color={colors.success} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.completedLessons}</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Completed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="trophy-outline" size={28} color={colors.warning} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalProgress}%</Text>
          <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Progress</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('MyCourses')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="library-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: colors.text }]}>My Courses</Text>
            <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>View your enrolled courses</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('Wishlist')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.error + '20' }]}>
            <Ionicons name="heart-outline" size={22} color={colors.error} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: colors.text }]}>My Wishlist</Text>
            <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>Saved courses you love</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('Courses')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="book-outline" size={22} color={colors.success} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: colors.text }]}>Browse Courses</Text>
            <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>Discover new courses</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('Achievements')}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="trophy-outline" size={22} color={colors.warning} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: colors.text }]}>Achievements</Text>
            <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>View your learning badges</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>

      {/* Account Settings */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>Account</Text>
        
        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => Alert.alert('Coming Soon', 'Payment methods will be available soon')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="card-outline" size={22} color={colors.warning} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: colors.text }]}>Payment Methods</Text>
            <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>Manage your payment options</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => Alert.alert('Coming Soon', 'Purchase history will be available soon')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.error + '20' }]}>
            <Ionicons name="receipt-outline" size={22} color={colors.error} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: colors.text }]}>Purchase History</Text>
            <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>View your transactions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>

      {/* App Settings */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>Settings</Text>
        
        <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <View style={[styles.menuIcon, { backgroundColor: (isDarkMode ? '#9C27B0' : colors.primary) + '20' }]}>
            <Ionicons name="moon-outline" size={22} color={isDarkMode ? '#9C27B0' : colors.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>Switch to dark theme</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={(value) => {
              toggleTheme();
              handleUpdatePreference('theme', value ? 'dark' : 'light');
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>

        <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <View style={[styles.menuIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: colors.text }]}>Notifications</Text>
            <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>Enable push notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={(value) => handleUpdatePreference('notifications', value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: colors.text }]}>Notifications</Text>
            <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>View all notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => Alert.alert('Coming Soon', 'Language settings will be available soon')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="language-outline" size={22} color={colors.success} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: colors.text }]}>Language</Text>
            <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>Change app language</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>Support</Text>
        
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('Resources')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="help-circle-outline" size={22} color={colors.warning} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: colors.text }]}>Resources</Text>
            <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>Access learning materials</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => Alert.alert('Terms & Conditions', 'Terms and conditions content will be displayed here.')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.tertiaryBackground || colors.border }]}>
            <Ionicons name="document-text-outline" size={22} color={colors.secondaryText} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: colors.text }]}>Terms & Conditions</Text>
            <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>Read our terms of service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: colors.border }]}
          onPress={() => Alert.alert('Privacy Policy', 'Privacy policy content will be displayed here.')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.tertiaryBackground || colors.border }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.secondaryText} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: colors.text }]}>Privacy Policy</Text>
            <Text style={[styles.menuSubtext, { color: colors.secondaryText }]}>How we protect your data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: colors.card }]} 
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
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
              <TouchableOpacity
                onPress={handleCloseEditModal}
                disabled={editingProfile}
              >
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Name *</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
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
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
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
                <Text style={[styles.cancelButtonText, { color: colors.secondaryText }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  { backgroundColor: colors.primary },
                  editingProfile && styles.disabledButton,
                ]}
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
    justifyContent: 'center',
    padding: 20,
  },
  guestHeader: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  guestAvatarContainer: {
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  loginButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginTop: 10,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    gap: 15,
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
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 30,
    paddingTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#1E88E5',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
