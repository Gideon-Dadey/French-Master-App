import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  StatusBar,
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
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const gamificationContext = useGamification();
  const gamificationStats = gamificationContext?.stats || {};
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedLessons: 0,
    totalProgress: 0,
    studyTime: 0,
    streak: 0,
    xp: 0,
    level: 1,
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

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.8)).current;
  const guestAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();

      Animated.parallel([
        Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
        Animated.spring(avatarScale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }),
        Animated.timing(contentAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start();
    } else {
      setLoading(false);

      Animated.spring(guestAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true
      }).start();
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
          streak: gamificationStats?.streak || 7,
          xp: gamificationStats?.xp || 2450,
          level: gamificationStats?.level || 12,
        });
      } else if (user) {
        setProfile({
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        });
        setStats({
          enrolledCourses: 3,
          completedLessons: 42,
          totalProgress: 65,
          studyTime: '7h 30m',
          streak: 7,
          xp: 2450,
          level: 12,
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
    if (hours > 0) return `${hours}h ${minutes}m`;
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
      Alert.alert('Error', 'Failed to update setting.');
    }
  };

  const handleAvatarPicker = () => {
    Alert.alert('Change Photo', 'Choose an option', [
      { text: 'Camera', onPress: handleOpenCamera },
      { text: 'Photo Library', onPress: handleOpenImageLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleOpenCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        await handleImageSelected(result.assets[0]);
      }
    } catch (error) {
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
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        await handleImageSelected(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open photo library.');
    }
  };

  const handleImageSelected = async (asset) => {
    try {
      setUploadingAvatar(true);
      const base64Image = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
      const updateResponse = await usersAPI.updateProfile({ avatar: base64Image });
      if (updateResponse.data.success) {
        await updateUser({ avatar: base64Image });
        await loadProfile();
        showToast.success('Photo Updated', 'Your profile picture has been updated!');
      }
    } catch (error) {
      showToast.error('Upload Failed', 'Failed to upload photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleOpenEditModal = () => {
    if (profile) {
      setEditFormData({ name: profile.name || '', phone: profile.phone || '' });
    }
    setEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
  };

  const handleSaveProfile = async () => {
    if (!editFormData.name?.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    try {
      setEditingProfile(true);
      const updateData = { name: editFormData.name.trim() };
      if (editFormData.phone) updateData.phone = editFormData.phone.trim();
      const updateResponse = await usersAPI.updateProfile(updateData);
      if (updateResponse.data.success) {
        await loadProfile();
        setEditModalVisible(false);
        showToast.success('Profile Updated', 'Your profile has been updated!');
      }
    } catch (error) {
      showToast.error('Update Failed', error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setEditingProfile(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
        },
      },
    ]);
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
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8FAFC' }]}>
        <StatusBar barStyle="light-content" />
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <Animated.View
            style={[
              styles.guestHeader,
              {
                opacity: guestAnim,
                transform: [{ translateY: guestAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }]
              }
            ]}
          >
            <LinearGradient
              colors={isDarkMode ? ['#1E293B', '#0F172A'] : ['#3B82F6', '#1D4ED8']}
              style={StyleSheet.absoluteFill}
            />

            <View style={[styles.guestDecor1, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.15)' }]} />
            <View style={[styles.guestDecor2, { backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.1)' }]} />

            <View style={styles.guestContent}>
              <Animated.View style={[styles.guestIconContainer, { transform: [{ scale: guestAnim }] }]}>
                <View style={styles.guestIconOuter}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.guestIconGlow}
                  />
                  <Ionicons name="person" size={50} color="#FFFFFF" />
                </View>
              </Animated.View>

              <Text style={styles.guestTitle}>Join French Master</Text>
              <Text style={styles.guestSubtitle}>
                Unlock the full potential of your language journey. Track progress, earn rewards, and join our global community.
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.guestActions,
              {
                opacity: guestAnim,
                transform: [{ translateY: guestAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInGradient}
              >
                <Ionicons name="log-in" size={22} color="#FFFFFF" />
                <Text style={styles.signInText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createAccountBtn, { borderColor: isDarkMode ? '#334155' : '#E2E8F0' }]}
              onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add-outline" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              <Text style={[styles.createAccountText, { color: isDarkMode ? '#F8FAFC' : '#1E293B' }]}>Create Account</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.featuresSection,
              {
                opacity: guestAnim,
                transform: [{ translateY: guestAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }]
              }
            ]}
          >
            <View style={styles.featureHeaderRow}>
              <Text style={[styles.featuresTitle, { color: colors.text }]}>Why Join?</Text>
              <View style={styles.featureBadge}>
                <Text style={styles.featureBadgeText}>ELITE ACCESS</Text>
              </View>
            </View>

            <View style={styles.featuresGrid}>
              {[
                { icon: 'analytics-outline', title: 'Track Progress', color: '#3B82F6', desc: 'See your daily growth' },
                { icon: 'trophy-outline', title: 'Earn Badges', color: '#F59E0B', desc: 'Unlock achievements' },
                { icon: 'people-outline', title: 'Community', color: '#10B981', desc: 'Learn with others' },
                { icon: 'cloud-download-outline', title: 'Offline Mode', color: '#8B5CF6', desc: 'Study anywhere' },
              ].map((feature, index) => (
                <View
                  key={index}
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                      borderColor: isDarkMode ? '#334155' : '#F1F5F9',
                      borderWidth: 1
                    },
                    premiumShadows.sm
                  ]}
                >
                  <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                    <Ionicons name={feature.icon} size={24} color={feature.color} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureText, { color: colors.text }]}>{feature.title}</Text>
                    <Text style={[styles.featureDesc, { color: colors.secondaryText }]}>{feature.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
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
  const avatarUrl = profile?.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B82F6&color=fff&size=200`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      >

        <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }] }}>
          <LinearGradient
            colors={isDarkMode ? ['#0F172A', '#1E3A5F', '#1E40AF'] : ['#3B82F6', '#2563EB', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >

            <View style={styles.headerDecor1} />
            <View style={styles.headerDecor2} />
            <View style={styles.headerDecor3} />

            <TouchableOpacity style={styles.settingsBtn} onPress={() => {}}>
              <Ionicons name="settings-outline" size={24} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>

            <Animated.View style={[styles.avatarSection, { transform: [{ scale: avatarScale }] }]}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                <TouchableOpacity
                  style={styles.editAvatarBtn}
                  onPress={handleAvatarPicker}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>

                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Lvl {stats.level}</Text>
                </View>
              </View>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{displayEmail}</Text>

              {stats.streak > 0 && (
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={16} color="#F97316" />
                  <Text style={styles.streakText}>{stats.streak} day streak!</Text>
                </View>
              )}

              <TouchableOpacity style={styles.editProfileBtn} onPress={handleOpenEditModal}>
                <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.xpSection}>
              <View style={styles.xpHeader}>
                <Text style={styles.xpLabel}>XP Progress</Text>
                <Text style={styles.xpValue}>{stats.xp.toLocaleString()} XP</Text>
              </View>
              <View style={styles.xpTrack}>
                <View style={[styles.xpFill, { width: `${(stats.xp % 1000) / 10}%` }]} />
              </View>
              <Text style={styles.xpNext}>{1000 - (stats.xp % 1000)} XP to next level</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.statsSection, { opacity: contentAnim, transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
            <StatCard icon="book" value={stats.enrolledCourses} label="Courses" color="#3B82F6" colors={colors} />
            <StatCard icon="checkmark-circle" value={stats.completedLessons} label="Lessons" color="#10B981" colors={colors} />
            <StatCard icon="time" value={stats.studyTime} label="Study Time" color="#F59E0B" colors={colors} />
            <StatCard icon="trending-up" value={`${stats.totalProgress}%`} label="Progress" color="#8B5CF6" colors={colors} />
          </ScrollView>
        </Animated.View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionCard icon="library" title="My Courses" subtitle="View enrolled" color="#3B82F6" colors={colors} onPress={() => navigation.navigate('MyCourses')} />
            <ActionCard icon="trophy" title="Achievements" subtitle="View badges" color="#F59E0B" colors={colors} onPress={() => navigation.navigate('Achievements')} />
            <ActionCard icon="heart" title="Wishlist" subtitle="Saved courses" color="#EC4899" colors={colors} onPress={() => navigation.navigate('Wishlist')} />
            <ActionCard icon="notifications" title="Notifications" subtitle="View alerts" color="#6366F1" colors={colors} onPress={() => navigation.navigate('Notifications')} />
            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <ActionCard icon="school" title="For Teachers" subtitle="Teach & earn" color="#10B981" colors={colors} onPress={() => navigation.navigate('Teachers')} />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
            <SettingRow
              icon="moon"
              title="Dark Mode"
              subtitle="Switch theme"
              colors={colors}
              isDarkMode={isDarkMode}
              isSwitch
              value={isDarkMode}
              onValueChange={() => {
                toggleTheme();
                handleUpdatePreference('theme', !isDarkMode ? 'dark' : 'light');
              }}
            />
            <SettingRow
              icon="notifications"
              title="Notifications"
              subtitle="Push alerts"
              colors={colors}
              isDarkMode={isDarkMode}
              isSwitch
              value={notifications}
              onValueChange={(value) => {
                setNotifications(value);
                handleUpdatePreference('notifications', value);
              }}
            />
          </View>
        </View>

        {(user?.role === 'instructor' || user?.role === 'admin' || true) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Content Management</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
              <SettingRow
                icon="videocam"
                title="Sample Videos"
                subtitle="Upload & manage previews"
                colors={colors}
                isDarkMode={isDarkMode}
                onPress={() => navigation.navigate('ManageSampleVideos')}
              />
              <SettingRow
                icon="analytics"
                title="Analytics"
                subtitle="View insights"
                colors={colors}
                isDarkMode={isDarkMode}
                onPress={() => navigation.navigate('AnalyticsDashboard')}
                isLast
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>More</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
            <SettingRow icon="card" title="Payment Methods" subtitle="Manage payments" colors={colors} isDarkMode={isDarkMode} onPress={() => Alert.alert('Coming Soon', 'Payment methods will be available soon')} />
            <SettingRow icon="receipt" title="Purchase History" subtitle="View transactions" colors={colors} isDarkMode={isDarkMode} onPress={() => Alert.alert('Coming Soon', 'Purchase history will be available soon')} />
            <SettingRow icon="help-circle" title="Help & Support" subtitle="Get assistance" colors={colors} isDarkMode={isDarkMode} onPress={() => navigation.navigate('Resources')} />
            <SettingRow icon="document-text" title="Terms & Privacy" subtitle="Legal info" colors={colors} isDarkMode={isDarkMode} onPress={() => Alert.alert('Terms & Privacy', 'Legal information will be displayed here.')} isLast />
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.card }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.secondaryText }]}>Version 1.0.0</Text>
      </ScrollView>

      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={handleCloseEditModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={handleCloseEditModal}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Name *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Phone</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
                  placeholder="Enter your phone"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={handleCloseEditModal}>
                <Text style={[styles.cancelBtnText, { color: colors.secondaryText }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={editingProfile}>
                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.saveBtnGradient}>
                  {editingProfile ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function StatCard({ icon, value, label, color, colors }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
    </View>
  );
}

function ActionCard({ icon, title, subtitle, color, colors, onPress }) {
  return (
    <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.card }]} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={[color, color + 'CC']} style={styles.actionIcon}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </LinearGradient>
      <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.actionSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function SettingRow({ icon, title, subtitle, colors, isDarkMode, isSwitch, value, onValueChange, onPress, isLast }) {
  const iconColor = isDarkMode ? '#60A5FA' : '#3B82F6';

  const Content = (
    <View style={[styles.settingRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingSubtitle, { color: colors.secondaryText }]}>{subtitle}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: '#3B82F6' }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
      )}
    </View>
  );

  if (onPress && !isSwitch) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{Content}</TouchableOpacity>;
  }
  return Content;
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

  guestHeader: {
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 60,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 380,
    justifyContent: 'center',
  },
  guestDecor1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -100,
    right: -80,
  },
  guestDecor2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: -60,
    left: -50,
  },
  guestContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  guestIconContainer: {
    marginBottom: 24,
  },
  guestIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  guestIconGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    opacity: 0.5,
  },
  guestTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  guestSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 15,
  },
  guestActions: {
    paddingHorizontal: 24,
    marginTop: -30,
    gap: 16,
    zIndex: 2,
  },
  signInBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  signInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  signInText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  createAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 2,
    gap: 12,
    backgroundColor: 'transparent',
  },
  createAccountText: {
    fontSize: 17,
    fontWeight: '700',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  featureHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  featureBadge: {
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  featureBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  featuresGrid: {
    gap: 14,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    gap: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    opacity: 0.7,
  },

  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  headerDecor1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -40,
  },
  headerDecor2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -40,
    left: -30,
  },
  headerDecor3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: 100,
    right: 80,
  },
  settingsBtn: {
    position: 'absolute',
    top: 55,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 14,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249,115,22,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  xpSection: {
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  xpLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  xpValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  xpTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#FCD34D',
    borderRadius: 4,
  },
  xpNext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },

  statsSection: {
    marginTop: -20,
    marginBottom: 20,
  },
  statsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: 100,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.3,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 11,
    textAlign: 'center',
  },

  settingsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 0,
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
    fontWeight: '700',
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
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
