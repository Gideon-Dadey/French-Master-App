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
import LoadingSpinner from '../src/components/LoadingSpinner';
import { showToast } from '../src/components/ToastNotification';
import { getThemeColors, themeShadows, themeRadius } from '../src/utils/organicTheme';

const { width, height } = Dimensions.get('window');

const BackgroundBlur = ({ style, color, size = 300 }) => (
  <View style={[style, {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    opacity: 0.05,
    transform: [{ scale: 1.5 }],
  }]} />
);

export default function ProfileScreen({ navigation }) {
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const gamification = useGamification();
  const gamificationStats = gamification?.stats || {};

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
  const [notifications, setNotifications] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
  });

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([...Array(10)].map(() => new Animated.Value(0))).current;
  const avatarScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
      startAnimations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(avatarScale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
      Animated.stagger(80, cardAnims.map(anim =>
        Animated.spring(anim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true })
      ))
    ]).start();
  };

  const loadProfile = async () => {
    try {
      if (!refreshing) setLoading(true);
      const [profileResponse, progressResponse] = await Promise.all([
        usersAPI.getProfile().catch(() => null),
        progressAPI.getDashboard().catch(() => null),
      ]);

      if (profileResponse?.data?.data) {
        const profileData = profileResponse.data.data;
        setProfile(profileData);
        setMyCourses(profileData.enrolledCourses || []);
        setNotifications(profileData.preferences?.notifications !== false);
        setEditFormData({
          name: profileData.name || '',
          phone: profileData.phone || '',
        });

        const enrolledCount = profileData.enrolledCourses?.length || 0;
        const dashboardData = progressResponse?.data?.data || {};

        setStats({
          enrolledCourses: enrolledCount,
          completedLessons: dashboardData.totalLessonsCompleted || 0,
          totalProgress: Math.round(dashboardData.totalProgress || 0),
          studyTime: formatStudyTime(dashboardData.totalTimeSpent || 0),
          streak: gamificationStats?.streak || 0,
          xp: gamificationStats?.xp || 0,
          level: gamificationStats?.level || 1,
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
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
      // Optimistic update for instant feedback
      if (key === 'theme') {
        toggleTheme();
      } else if (key === 'notifications') {
        setNotifications(value);
      }

      // Persist to backend without blocking UI
      await usersAPI.updateProfile({ preferences: { [key]: value } });
    } catch (error) {
      console.error('Failed to update preference:', error);
    }
  };

  const handleAvatarPicker = () => {
    Alert.alert('Update Photo', 'Select your profile picture', [
      { text: 'Take Photo', onPress: handleOpenCamera },
      { text: 'Choose From Gallery', onPress: handleOpenImageLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleOpenCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled) await handleImageSelected(result.assets[0]);
  };

  const handleOpenImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled) await handleImageSelected(result.assets[0]);
  };

  const handleImageSelected = async (asset) => {
    try {
      setUploadingAvatar(true);
      const base64Image = `data:image/jpeg;base64,${asset.base64}`;
      const res = await usersAPI.updateProfile({ avatar: base64Image });
      if (res.data.success) {
        await updateUser({ avatar: base64Image });
        await loadProfile();
        showToast.success('Updated', 'Profile photo changed!');
      }
    } catch (error) {
      showToast.error('Error', 'Failed to update photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditFormData({ name: profile?.name || '', phone: profile?.phone || '' });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editFormData.name.trim()) return;
    try {
      setEditingProfile(true);
      const res = await usersAPI.updateProfile({ name: editFormData.name.trim(), phone: editFormData.phone.trim() });
      if (res.data.success) {
        await loadProfile();
        setEditModalVisible(false);
        showToast.success('Success', 'Profile updated!');
      }
    } catch (error) {
      showToast.error('Error', 'Failed to save changes');
    } finally {
      setEditingProfile(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
        }
      },
    ]);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  if (loading && !refreshing) return <LoadingSpinner />;

  const displayName = profile?.name || user?.name || 'Explorer';
  const displayEmail = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1E3A5F&color=fff&size=200`;

  if (!isAuthenticated) return null; // Should be handled by navigation usually

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <BackgroundBlur style={{ top: -100, left: -50 }} color={theme.primary} size={400} />
      <BackgroundBlur style={{ bottom: 100, right: -100 }} color={theme.secondary} size={350} />

      {/* Floating Navigation Bar */}
      <Animated.View
        style={[
          styles.floatingNavBar,
          {
            backgroundColor: theme.surface + 'F8',
            opacity: headerOpacity,
            borderBottomColor: theme.border,
          }
        ]}
      >
        <View style={styles.navBarContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: theme.text }]}>Profile</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={theme.error} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim }]}>
          <View style={styles.heroLayout}>
            <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: avatarScale }] }]}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              <TouchableOpacity
                style={[styles.editAvatarBtn, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}
                onPress={handleAvatarPicker}
              >
                {uploadingAvatar ? <ActivityIndicator size="small" color={theme.primary} /> : <Ionicons name="camera" size={16} color={theme.primary} />}
              </TouchableOpacity>
              <View style={[styles.levelBadge, { backgroundColor: theme.secondary }]}>
                <Text style={styles.levelText}>Lvl {stats.level}</Text>
              </View>
            </Animated.View>

            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]}>{displayName}</Text>
              <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>{displayEmail}</Text>
              <TouchableOpacity style={styles.editLink} onPress={handleOpenEditModal}>
                <Text style={[styles.editLinkText, { color: theme.primary }]}>Edit Profile</Text>
                <Ionicons name="chevron-forward" size={12} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* XP Progress Bar */}
          <View style={[styles.xpBarContainer, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.xs]}>
            <View style={styles.xpHeader}>
              <Text style={[styles.xpLabel, { color: theme.textSecondary }]}>Experience</Text>
              <Text style={[styles.xpValue, { color: theme.text }]}>{stats.xp.toLocaleString()} XP</Text>
            </View>
            <View style={[styles.xpTrack, { backgroundColor: theme.border }]}>
              <LinearGradient
                colors={[theme.secondary, theme.secondaryLight || theme.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.xpFill, { width: `${(stats.xp % 1000) / 10}%` }]}
              />
            </View>
            <Text style={[styles.xpFooter, { color: theme.textMuted }]}>{1000 - (stats.xp % 1000)} XP to Next Level</Text>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View style={[styles.statsGrid, { opacity: cardAnims[0], transform: [{ translateY: cardAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <StatCard icon="book-outline" value={stats.enrolledCourses} label="Courses" theme={theme} color={theme.primary} />
          <StatCard icon="checkmark-circle-outline" value={stats.completedLessons} label="Lessons" theme={theme} color={theme.success} />
          <StatCard icon="time-outline" value={stats.studyTime} label="Study Time" theme={theme} color={theme.secondary} />
          <StatCard icon="flash-outline" value={`${stats.totalProgress}%`} label="Overall" theme={theme} color={theme.accent} />
        </Animated.View>

        {/* Continue Learning */}
        {myCourses.length > 0 && (
          <Animated.View style={[styles.section, { opacity: cardAnims[1], transform: [{ translateY: cardAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.titleAccent, { backgroundColor: theme.primary }]} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Continue Learning</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('MyCourses')}>
                <Text style={[styles.seeAll, { color: theme.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.enrolledScroll}>
              {myCourses.map((item, idx) => (
                <CourseProgressCard key={idx} item={item} theme={theme} navigation={navigation} />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Settings & Preferences */}
        <Animated.View style={[styles.section, { opacity: cardAnims[2], transform: [{ translateY: cardAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.titleAccent, { backgroundColor: theme.accent }]} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
          </View>
          <View style={[styles.settingsCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
            <SettingItem
              icon="moon-outline"
              title="Dark Mode"
              isSwitch
              value={isDarkMode}
              onValueChange={() => handleUpdatePreference('theme', !isDarkMode ? 'dark' : 'light')}
              theme={theme}
            />
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              isSwitch
              value={notifications}
              onValueChange={(val) => handleUpdatePreference('notifications', val)}
              theme={theme}
            />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              onPress={() => { }}
              theme={theme}
            />
            <SettingItem
              icon="help-circle-outline"
              title="Help Support"
              onPress={() => navigation.navigate('Resources')}
              theme={theme}
              isLast
            />
          </View>
        </Animated.View>

        {/* Account Actions */}
        <Animated.View style={[styles.section, { opacity: cardAnims[3], transform: [{ translateY: cardAnims[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <TouchableOpacity style={[styles.logoutBtn, { borderColor: theme.error + '40' }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.error} />
            <Text style={[styles.logoutText, { color: theme.error }]}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={[styles.version, { color: theme.textMuted }]}>Version 1.2.0 • L'Alliance Royale</Text>
        </Animated.View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="fade" transparent onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  value={editFormData.name}
                  onChangeText={(t) => setEditFormData({ ...editFormData, name: t })}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Phone Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  value={editFormData.phone}
                  onChangeText={(t) => setEditFormData({ ...editFormData, phone: t })}
                  placeholder="Optional"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="phone-pad"
                />
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={editingProfile}>
                <LinearGradient colors={[theme.primary, theme.primaryLight || theme.primary]} style={styles.saveBtnGradient}>
                  {editingProfile ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

function StatCard({ icon, value, label, theme, color }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statVal, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLab, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

function CourseProgressCard({ item, theme, navigation }) {
  const course = item.course;
  if (!course) return null;
  return (
    <TouchableOpacity
      style={[styles.courseCard, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}
      onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
    >
      <Image source={course.thumbnail ? { uri: course.thumbnail } : require('../assets/logo.jpeg')} style={styles.courseImage} />
      <View style={styles.courseInfo}>
        <Text style={[styles.courseTitle, { color: theme.text }]} numberOfLines={1}>{course.title}</Text>
        <View style={styles.progRow}>
          <View style={[styles.progTrack, { backgroundColor: theme.border }]}>
            <View style={[styles.progFill, { width: `${item.progress || 0}%`, backgroundColor: theme.primary }]} />
          </View>
          <Text style={[styles.progPerc, { color: theme.primary }]}>{item.progress || 0}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SettingItem({ icon, title, isSwitch, value, onValueChange, onPress, theme, isLast }) {
  return (
    <TouchableOpacity
      style={[styles.settingItem, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={[styles.settingIconWrap, { backgroundColor: theme.primary + '10' }]}>
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>
      <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
      {isSwitch ? (
        <Switch value={value} onValueChange={onValueChange} trackColor={{ false: theme.border, true: theme.primary }} thumbColor="#FFF" />
      ) : (
        <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    zIndex: 100,
    borderBottomWidth: 1,
  },
  navBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 50,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 22,
  },
  hero: {
    marginTop: 20,
    marginBottom: 32,
  },
  heroLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  xpBarContainer: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  xpLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  xpValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  xpTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  xpFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpFooter: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: (width - 56) / 2,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLab: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  titleAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
  },
  enrolledScroll: {
    paddingRight: 22,
    gap: 16,
  },
  courseCard: {
    width: width * 0.7,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  courseImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  progRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progFill: {
    height: '100%',
    borderRadius: 3,
  },
  progPerc: {
    fontSize: 11,
    fontWeight: '800',
  },
  settingsCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 16,
  },
  settingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 10,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
  },
  version: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalBody: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  saveBtn: {
    marginTop: 10,
    borderRadius: 18,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
