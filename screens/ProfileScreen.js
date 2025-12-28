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
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { useGamification } from '../src/context/GamificationContext';
import { usersAPI, progressAPI } from '../src/services/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import ErrorMessage from '../src/components/ErrorMessage';
import { showToast } from '../src/components/ToastNotification';
import { getThemeColors, themeShadows } from '../src/utils/organicTheme';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const gamificationContext = useGamification();
  const gamificationStats = gamificationContext?.stats || {};
  const theme = getThemeColors(isDarkMode);

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
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  // Decorative blob component
  const DecorativeBlob = ({ style, blobColors }) => (
    <View style={style}>
      <Svg width="100%" height="100%" viewBox="0 0 200 200">
        <Defs>
          <RadialGradient id="guestBlobGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={blobColors[0]} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={blobColors[1]} stopOpacity="0.15" />
          </RadialGradient>
        </Defs>
        <Path
          d="M45.3,-51.2C58.4,-42.3,68.3,-27.4,71.7,-10.7C75.1,6,72,24.4,62.1,37.5C52.2,50.6,35.5,58.4,18.2,63.2C0.9,68,-16.9,69.8,-32.8,64C-48.7,58.2,-62.6,44.8,-70.2,28.1C-77.8,11.4,-79.1,-8.7,-72.3,-25.4C-65.5,-42.1,-50.6,-55.5,-34.6,-63.5C-18.6,-71.5,-1.5,-74.2,13.2,-69.5C27.9,-64.8,32.2,-60.1,45.3,-51.2Z"
          fill="url(#guestBlobGrad)"
          transform="translate(100 100)"
        />
      </Svg>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Background */}
          <View style={styles.bgContainer}>
            <LinearGradient
              colors={isDarkMode
                ? [theme.background, '#0A1219', theme.background]
                : [theme.background, '#F0EDE8', theme.background]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Decorative blobs */}
            <DecorativeBlob
              style={styles.blob1}
              blobColors={[theme.secondary, theme.accent]}
            />
            <DecorativeBlob
              style={styles.blob2}
              blobColors={[theme.primary, theme.accent]}
            />

            {/* Wave pattern */}
            <View style={styles.waveContainer}>
              <Svg width={width} height="120" viewBox={`0 0 ${width} 120`}>
                <Path
                  d={`M0,60 C${width * 0.25},20 ${width * 0.5},100 ${width * 0.75},40 C${width},0 ${width},60 ${width},60 L${width},120 L0,120 Z`}
                  fill={theme.primary + '10'}
                />
              </Svg>
            </View>
          </View>

          <Animated.View
            style={[
              styles.guestHeader,
              {
                opacity: guestAnim,
                transform: [{ translateY: guestAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }]
              }
            ]}
          >
            <View style={styles.guestContent}>
              {/* Logo */}
              <Animated.View style={[styles.guestIconContainer, { transform: [{ scale: guestAnim }] }]}>
                <View style={[styles.logoRing, { borderColor: theme.secondary + '40' }]}>
                  <View style={[styles.logoInner, { borderColor: theme.primary + '60' }]}>
                    <Image
                      source={require('../assets/logo.jpeg')}
                      style={styles.guestLogo}
                    />
                  </View>
                </View>
                {/* Decorative dots */}
                <View style={[styles.logoDot, styles.logoDot1, { backgroundColor: theme.secondary }]} />
                <View style={[styles.logoDot, styles.logoDot2, { backgroundColor: theme.accent }]} />
                <View style={[styles.logoDot, styles.logoDot3, { backgroundColor: theme.primary }]} />
              </Animated.View>

              <Text style={[styles.guestGreeting, { color: theme.secondary }]}>Bienvenue</Text>
              <Text style={[styles.guestTitle, { color: theme.text }]}>Join L'Alliance</Text>
              <Text style={[styles.guestSubtitle, { color: theme.textSecondary }]}>
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
                colors={[theme.primary, theme.primaryLight || theme.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.signInGradient}
              >
                <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                <Text style={styles.signInText}>Sign In</Text>
                <View style={styles.btnIconContainer}>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createAccountBtn, {
                borderColor: theme.border,
                backgroundColor: theme.surface
              }]}
              onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles-outline" size={20} color={theme.primary} />
              <Text style={[styles.createAccountText, { color: theme.text }]}>Create Account</Text>
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
              <Text style={[styles.featuresTitle, { color: theme.text }]}>Why Join?</Text>
              <View style={[styles.featureBadge, { backgroundColor: theme.secondary + '20', borderColor: theme.secondary + '40' }]}>
                <Ionicons name="star" size={12} color={theme.secondary} style={{ marginRight: 4 }} />
                <Text style={[styles.featureBadgeText, { color: theme.secondary }]}>PREMIUM</Text>
              </View>
            </View>

            <View style={styles.featuresGrid}>
              {[
                { icon: 'analytics-outline', title: 'Track Progress', color: theme.primary, desc: 'See your daily growth' },
                { icon: 'trophy-outline', title: 'Earn Badges', color: theme.secondary, desc: 'Unlock achievements' },
                { icon: 'people-outline', title: 'Community', color: theme.accent, desc: 'Learn with others' },
                { icon: 'cloud-download-outline', title: 'Offline Mode', color: theme.primary, desc: 'Study anywhere' },
              ].map((feature, index) => (
                <View
                  key={index}
                  style={[
                    styles.featureCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    themeShadows.sm
                  ]}
                >
                  <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                    <Ionicons name={feature.icon} size={24} color={feature.color} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureText, { color: theme.text }]}>{feature.title}</Text>
                    <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{feature.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Footer decoration */}
          <View style={styles.footerDecor}>
            <View style={[styles.decorLine, { backgroundColor: theme.border }]} />
            <Ionicons name="school-outline" size={18} color={theme.textMuted} />
            <View style={[styles.decorLine, { backgroundColor: theme.border }]} />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ErrorMessage message={error} onRetry={loadProfile} />
      </View>
    );
  }

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1E3A5F&color=fff&size=200`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      >

        <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }] }}>
          <LinearGradient
            colors={theme.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={[styles.headerDecor1, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
            <View style={[styles.headerDecor2, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
            <View style={[styles.headerDecor3, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />

            <TouchableOpacity style={styles.settingsBtn} onPress={() => { }}>
              <Ionicons name="settings-outline" size={24} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>

            <Animated.View style={[styles.avatarSection, { transform: [{ scale: avatarScale }] }]}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                <TouchableOpacity
                  style={[styles.editAvatarBtn, { backgroundColor: theme.secondary }]}
                  onPress={handleAvatarPicker}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>

                <View style={[styles.levelBadge, { backgroundColor: theme.secondary }]}>
                  <Text style={styles.levelText}>Lvl {stats.level}</Text>
                </View>
              </View>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{displayEmail}</Text>

              {stats.streak > 0 && (
                <View style={[styles.streakBadge, { backgroundColor: theme.secondary + '30' }]}>
                  <Ionicons name="flame" size={16} color={theme.secondary} />
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
                <View style={[styles.xpFill, { width: `${(stats.xp % 1000) / 10}%`, backgroundColor: theme.secondary }]} />
              </View>
              <Text style={styles.xpNext}>{1000 - (stats.xp % 1000)} XP to next level</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.statsSection, { opacity: contentAnim, transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
            <StatCard icon="book" value={stats.enrolledCourses} label="Courses" color={theme.primary} theme={theme} />
            <StatCard icon="checkmark-circle" value={stats.completedLessons} label="Lessons" color={theme.accent} theme={theme} />
            <StatCard icon="time" value={stats.studyTime} label="Study Time" color={theme.secondary} theme={theme} />
            <StatCard icon="trending-up" value={`${stats.totalProgress}%`} label="Progress" color={theme.primary} theme={theme} />
          </ScrollView>
        </Animated.View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionCard icon="library" title="My Courses" subtitle="View enrolled" color={theme.primary} theme={theme} onPress={() => navigation.navigate('MyCourses')} />
            <ActionCard icon="trophy" title="Achievements" subtitle="View badges" color={theme.secondary} theme={theme} onPress={() => navigation.navigate('Achievements')} />
            <ActionCard icon="heart" title="Wishlist" subtitle="Saved courses" color={theme.error} theme={theme} onPress={() => navigation.navigate('Wishlist')} />
            <ActionCard icon="notifications" title="Notifications" subtitle="View alerts" color={theme.accent} theme={theme} onPress={() => navigation.navigate('Notifications')} />
            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <ActionCard icon="school" title="For Teachers" subtitle="Teach & earn" color={theme.primary} theme={theme} onPress={() => navigation.navigate('Teachers')} />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.surface }, themeShadows.sm]}>
            <SettingRow
              icon="moon"
              title="Dark Mode"
              subtitle="Switch theme"
              theme={theme}
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
              theme={theme}
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
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Content Management</Text>
            <View style={[styles.settingsCard, { backgroundColor: theme.surface }, themeShadows.sm]}>
              <SettingRow
                icon="videocam"
                title="Sample Videos"
                subtitle="Upload & manage previews"
                theme={theme}
                onPress={() => navigation.navigate('ManageSampleVideos')}
              />
              <SettingRow
                icon="analytics"
                title="Analytics"
                subtitle="View insights"
                theme={theme}
                onPress={() => navigation.navigate('AnalyticsDashboard')}
                isLast
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>More</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.surface }, themeShadows.sm]}>
            <SettingRow icon="card" title="Payment Methods" subtitle="Manage payments" theme={theme} onPress={() => Alert.alert('Coming Soon', 'Payment methods will be available soon')} />
            <SettingRow icon="receipt" title="Purchase History" subtitle="View transactions" theme={theme} onPress={() => Alert.alert('Coming Soon', 'Purchase history will be available soon')} />
            <SettingRow icon="help-circle" title="Help & Support" subtitle="Get assistance" theme={theme} onPress={() => navigation.navigate('Resources')} />
            <SettingRow icon="document-text" title="Terms & Privacy" subtitle="Legal info" theme={theme} onPress={() => Alert.alert('Terms & Privacy', 'Legal information will be displayed here.')} isLast />
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.surface }, themeShadows.sm]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={theme.error} />
          <Text style={[styles.logoutText, { color: theme.error }]}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: theme.textMuted }]}>Version 1.0.0</Text>
      </ScrollView>

      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={handleCloseEditModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={handleCloseEditModal}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.text }]}>Name *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.text }]}>Phone</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
                  placeholder="Enter your phone"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={handleCloseEditModal}>
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={editingProfile}>
                <LinearGradient colors={[theme.primary, theme.primaryLight || theme.primary]} style={styles.saveBtnGradient}>
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

function StatCard({ icon, value, label, color, theme }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.surface }, themeShadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

function ActionCard({ icon, title, subtitle, color, theme, onPress }) {
  return (
    <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.surface }, themeShadows.sm]} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={[color, color + 'CC']} style={styles.actionIcon}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </LinearGradient>
      <Text style={[styles.actionTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function SettingRow({ icon, title, subtitle, theme, isSwitch, value, onValueChange, onPress, isLast }) {
  const Content = (
    <View style={[styles.settingRow, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: theme.primary + '15' }]}>
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
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

  // Background styles
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 280,
    height: 280,
    opacity: 0.6,
  },
  blob2: {
    position: 'absolute',
    bottom: 200,
    left: -100,
    width: 250,
    height: 250,
    opacity: 0.4,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  // Guest logo styles
  logoRing: {
    padding: 6,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  logoInner: {
    padding: 4,
    borderRadius: 44,
    borderWidth: 2,
  },
  guestLogo: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  logoDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  logoDot1: {
    top: -2,
    right: 10,
  },
  logoDot2: {
    bottom: 5,
    left: -5,
  },
  logoDot3: {
    top: 40,
    right: -8,
  },
  guestGreeting: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  btnIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  footerDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 12,
  },
  decorLine: {
    width: 40,
    height: 1,
  },
  guestHeader: {
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: 'relative',
    minHeight: 340,
    justifyContent: 'center',
  },
  guestContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  guestIconContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  guestTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  guestSubtitle: {
    fontSize: 15,
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
    shadowColor: '#1E3A5F',
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
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  createAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 12,
  },
  createAccountText: {
    fontSize: 17,
    fontWeight: '600',
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
    fontWeight: '700',
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  featureBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  featuresGrid: {
    gap: 14,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 16,
    borderWidth: 1,
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
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
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
    top: -60,
    right: -40,
  },
  headerDecor2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    bottom: -40,
    left: -30,
  },
  headerDecor3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
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
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 14,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
    fontWeight: '600',
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
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
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
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
