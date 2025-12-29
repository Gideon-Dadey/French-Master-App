import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, themeShadows } from '../utils/organicTheme';

let toastQueue = [];
let toastListeners = [];

const notifyListeners = () => {
  toastListeners.forEach(listener => listener(toastQueue[0] || null));
};

export const showToast = {
  success: (message, description) => {
    toastQueue.push({ type: 'success', message, description });
    notifyListeners();
  },
  error: (message, description) => {
    toastQueue.push({ type: 'error', message, description });
    notifyListeners();
  },
  info: (message, description) => {
    toastQueue.push({ type: 'info', message, description });
    notifyListeners();
  },
  warning: (message, description) => {
    toastQueue.push({ type: 'warning', message, description });
    notifyListeners();
  },
  achievement: (message, description) => {
    toastQueue.push({ type: 'achievement', message, description });
    notifyListeners();
  },
  xp: (amount, description) => {
    toastQueue.push({ type: 'xp', message: `+${amount} XP`, description });
    notifyListeners();
  },
  streak: (count, description) => {
    toastQueue.push({ type: 'streak', message: `${count} Day Streak!`, description });
    notifyListeners();
  },
};

const ToastContainer = () => {
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const [toast, setToast] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const listener = (newToast) => {
      setToast(newToast);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  useEffect(() => {
    if (toast) {
      // Haptic feedback for certain toast types
      if (Platform.OS !== 'web' && ['achievement', 'xp', 'streak'].includes(toast.type)) {
        Vibration.vibrate(50);
      }

      // Reset progress
      progressAnim.setValue(1);

      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Duration based on type
      const duration = {
        error: 5000,
        success: 3000,
        info: 3000,
        warning: 4000,
        achievement: 4000,
        xp: 2500,
        streak: 4000,
      }[toast.type] || 3000;

      // Progress bar animation
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: duration,
        useNativeDriver: false,
      }).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      toastQueue.shift();
      setToast(null);
      if (toastQueue.length > 0) {
        setTimeout(() => notifyListeners(), 300);
      }
    });
  };

  if (!toast) return null;

  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          colors: [theme.success, theme.successLight || '#4CAF50'],
          icon: 'checkmark-circle',
          accentColor: theme.success,
        };
      case 'error':
        return {
          colors: [theme.error, theme.errorLight || '#E53935'],
          icon: 'close-circle',
          accentColor: theme.error,
        };
      case 'warning':
        return {
          colors: [theme.warning || '#D4A84B', theme.warningLight || '#FFA726'],
          icon: 'warning',
          accentColor: theme.warning || '#D4A84B',
        };
      case 'info':
        return {
          colors: [theme.info, theme.infoLight || '#2196F3'],
          icon: 'information-circle',
          accentColor: theme.info,
        };
      case 'achievement':
        return {
          colors: [theme.gold || theme.secondary, theme.secondaryLight || '#FFD700'],
          icon: 'trophy',
          accentColor: theme.gold || theme.secondary,
        };
      case 'xp':
        return {
          colors: [theme.gold || theme.secondary, theme.secondaryLight || '#FFD700'],
          icon: 'star',
          accentColor: theme.gold || theme.secondary,
        };
      case 'streak':
        return {
          colors: [theme.secondary || '#FF6B35', theme.secondaryLight || '#FF8C42'],
          icon: 'flame',
          accentColor: theme.secondary || '#FF6B35',
        };
      default:
        return {
          colors: [theme.primary, theme.primaryLight || theme.primary],
          icon: 'notifications',
          accentColor: theme.primary,
        };
    }
  };

  const config = getToastConfig();

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const isSpecial = ['achievement', 'xp', 'streak'].includes(toast.type);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideToast}
        style={[
          styles.toast,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Left accent gradient */}
        <LinearGradient
          colors={config.colors}
          style={styles.leftAccent}
        />

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: config.accentColor + '15' }]}>
          {isSpecial ? (
            <LinearGradient
              colors={config.colors}
              style={styles.iconGradient}
            >
              <Ionicons name={config.icon} size={20} color="#FFFFFF" />
            </LinearGradient>
          ) : (
            <Ionicons name={config.icon} size={22} color={config.accentColor} />
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {toast.message && (
            <Text
              style={[
                styles.message,
                { color: theme.text },
                isSpecial && styles.specialMessage,
              ]}
              numberOfLines={1}
            >
              {toast.message}
            </Text>
          )}
          {toast.description && (
            <Text
              style={[styles.description, { color: theme.textSecondary }]}
              numberOfLines={2}
            >
              {toast.description}
            </Text>
          )}
        </View>

        {/* Close button */}
        <TouchableOpacity
          onPress={hideToast}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Progress bar */}
        <View style={[styles.progressContainer, { backgroundColor: theme.border }]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
                backgroundColor: config.accentColor,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 45,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 0,
    borderRadius: 16,
    marginHorizontal: 16,
    minHeight: 56,
    maxWidth: '92%',
    borderWidth: 1,
    overflow: 'hidden',
    ...themeShadows.lg,
  },
  leftAccent: {
    width: 5,
    height: '120%',
    marginRight: 14,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGradient: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 1,
  },
  specialMessage: {
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});

export default ToastContainer;
