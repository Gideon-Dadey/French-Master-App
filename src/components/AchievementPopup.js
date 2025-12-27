import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  TouchableOpacity,
  Platform,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, themeShadows } from '../utils/organicTheme';

/**
 * AchievementPopup - Floating notification for unlocked achievements
 * 
 * Appears at top of screen, slides in/out smoothly
 * Can be dismissed by tapping or auto-dismisses after duration
 * 
 * @param {boolean} visible - Show/hide the popup
 * @param {function} onClose - Callback when popup closes
 * @param {string} title - Achievement title (e.g., "First Steps")
 * @param {string} description - Achievement description
 * @param {string} icon - Ionicon name
 * @param {string} rarity - "common", "rare", "epic", "legendary"
 * @param {number} xpReward - XP earned from achievement
 * @param {boolean} isDarkMode - Theme mode
 * @param {number} duration - Auto close after ms (0 = manual close)
 */
export default function AchievementPopup({
  visible,
  onClose,
  title = "Achievement Unlocked!",
  description = "You've earned a new badge",
  icon = "trophy",
  rarity = "common",
  xpReward = 50,
  isDarkMode = false,
  duration = 4000,
}) {
  const theme = getThemeColors(isDarkMode);
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  const rarityConfig = {
    common: {
      colors: [theme.success, '#4CAF50'],
      label: 'COMMON',
      glow: theme.success + '40',
    },
    rare: {
      colors: [theme.info, '#2196F3'],
      label: 'RARE',
      glow: theme.info + '40',
    },
    epic: {
      colors: ['#9C27B0', '#BA68C8'],
      label: 'EPIC',
      glow: '#9C27B040',
    },
    legendary: {
      colors: [theme.secondary, '#FFD700'],
      label: 'LEGENDARY',
      glow: theme.secondary + '40',
    },
  };

  const config = rarityConfig[rarity] || rarityConfig.common;

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      if (Platform.OS !== 'web') {
        Vibration.vibrate(100);
      }

      // Entrance animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Sparkle animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0.3, 0.8],
  });

  const sparkleScale = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handleClose}
        style={styles.touchable}
      >
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: config.glow,
              opacity: glowOpacity,
            }
          ]}
        />

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          {/* Left gradient accent */}
          <LinearGradient
            colors={config.colors}
            style={styles.leftAccent}
          />

          {/* Icon container */}
          <View style={styles.iconSection}>
            <LinearGradient
              colors={config.colors}
              style={styles.iconContainer}
            >
              <Ionicons name={icon} size={24} color="#FFFFFF" />
            </LinearGradient>

            {/* Sparkle */}
            <Animated.View
              style={[
                styles.sparkle,
                { transform: [{ scale: sparkleScale }], opacity: sparkleAnim }
              ]}
            >
              <Ionicons name="sparkles" size={12} color={config.colors[0]} />
            </Animated.View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                {title}
              </Text>
              <View style={[styles.rarityBadge, { backgroundColor: config.colors[0] + '20' }]}>
                <Text style={[styles.rarityText, { color: config.colors[0] }]}>
                  {config.label}
                </Text>
              </View>
            </View>
            <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={1}>
              {description}
            </Text>
            {xpReward > 0 && (
              <View style={styles.xpRow}>
                <Ionicons name="star" size={12} color={theme.secondary} />
                <Text style={[styles.xpText, { color: theme.secondary }]}>
                  +{xpReward} XP
                </Text>
              </View>
            )}
          </View>

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  touchable: {
    width: '100%',
  },
  glow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 14,
    paddingLeft: 0,
    overflow: 'hidden',
    ...themeShadows.lg,
  },
  leftAccent: {
    width: 5,
    height: '120%',
    marginRight: 12,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  iconSection: {
    position: 'relative',
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 12,
    marginBottom: 4,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

