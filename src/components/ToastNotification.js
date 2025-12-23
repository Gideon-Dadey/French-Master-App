import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

/**
 * Simple Toast notification system
 * Lightweight alternative to react-native-toast-message
 * Adapted from HEYY app patterns
 */

let toastQueue = [];
let currentToast = null;
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
};

const ToastContainer = () => {
  const { colors } = useTheme();
  const [toast, setToast] = useState(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

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
      // Animate in
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
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, toast.type === 'error' ? 4000 : 3000);

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
    ]).start(() => {
      toastQueue.shift();
      setToast(null);
      if (toastQueue.length > 0) {
        setTimeout(() => notifyListeners(), 300);
      }
    });
  };

  if (!toast) return null;

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          backgroundColor: colors.success || '#4CAF50',
          icon: 'checkmark-circle',
        };
      case 'error':
        return {
          backgroundColor: colors.error || '#E53935',
          icon: 'close-circle',
        };
      case 'info':
        return {
          backgroundColor: colors.text,
          icon: 'information-circle',
        };
      default:
        return {
          backgroundColor: colors.primary,
          icon: 'notifications',
        };
    }
  };

  const toastStyles = getToastStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
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
            backgroundColor: toastStyles.backgroundColor,
            shadowColor: colors.shadow || '#000',
          },
        ]}
      >
        <Ionicons
          name={toastStyles.icon}
          size={24}
          color={toast.type === 'info' ? colors.background : '#fff'}
        />
        <View style={styles.content}>
          {toast.message && (
            <Text
              style={[
                styles.message,
                { color: toast.type === 'info' ? colors.background : '#fff' },
              ]}
            >
              {toast.message}
            </Text>
          )}
          {toast.description && (
            <Text
              style={[
                styles.description,
                {
                  color: toast.type === 'info' ? colors.background : '#fff',
                  opacity: 0.9,
                },
              ]}
            >
              {toast.description}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons
            name="close"
            size={20}
            color={toast.type === 'info' ? colors.background : '#fff'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    minHeight: 50,
    maxWidth: '90%',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default ToastContainer;
