import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, themeShadows } from '../utils/organicTheme';

const { width } = Dimensions.get('window');

/**
 * Get time-based greeting
 */
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return { english: 'Good night', french: 'Bonne nuit', icon: 'moon' };
  if (hour < 12) return { english: 'Good morning', french: 'Bonjour', icon: 'sunny' };
  if (hour < 17) return { english: 'Good afternoon', french: 'Bon après-midi', icon: 'partly-sunny' };
  if (hour < 21) return { english: 'Good evening', french: 'Bonsoir', icon: 'cloudy-night' };
  return { english: 'Good night', french: 'Bonne nuit', icon: 'moon' };
};

/**
 * Get streak-based message
 */
const getStreakMessage = (streak) => {
  if (!streak || streak === 0) {
    return "Start your learning journey today!";
  }
  if (streak === 1) {
    return "Great start! Keep it up tomorrow!";
  }
  if (streak < 7) {
    return `${streak} day streak! You're on fire! 🔥`;
  }
  if (streak < 30) {
    return `Amazing ${streak} day streak! Don't break it!`;
  }
  if (streak < 100) {
    return `Incredible ${streak} days! You're a legend!`;
  }
  return `Legendary ${streak} day streak! 🏆`;
};

/**
 * WelcomeBackBanner - Personalized welcome greeting
 * 
 * @param {string} userName - User's display name
 * @param {number} streak - Current streak count
 * @param {number} xp - Current XP
 * @param {number} level - Current level
 * @param {function} onStreakPress - Callback when streak is pressed
 * @param {boolean} isDarkMode - Theme mode
 * @param {object} style - Additional styles
 */
export default function WelcomeBackBanner({
  userName = "Learner",
  streak = 0,
  xp = 0,
  level = 1,
  onStreakPress,
  isDarkMode = false,
  style,
}) {
  const theme = getThemeColors(isDarkMode);
  const greeting = getTimeGreeting();
  const streakMessage = getStreakMessage(streak);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const flameAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Flame pulse for active streak
    if (streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(flameAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [streak]);

  const firstName = userName?.split(' ')[0] || 'Learner';

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={theme.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative elements */}
        <View style={styles.decorations}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        <View style={styles.content}>
          {/* Main greeting */}
          <View style={styles.greetingSection}>
            <View style={styles.greetingRow}>
              <View style={styles.iconWrapper}>
                <Ionicons name={greeting.icon} size={24} color={theme.secondary} />
              </View>
              <View style={styles.greetingText}>
                <Text style={styles.frenchGreeting}>{greeting.french}</Text>
                <Text style={styles.userName}>{firstName}!</Text>
              </View>
            </View>
            <Text style={styles.englishGreeting}>{greeting.english}</Text>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {/* Streak badge */}
            <TouchableOpacity
              style={styles.streakBadge}
              onPress={onStreakPress}
              activeOpacity={0.8}
            >
              <Animated.View style={{ transform: [{ scale: flameAnim }] }}>
                <Ionicons
                  name="flame"
                  size={20}
                  color={streak > 0 ? theme.secondary : 'rgba(255,255,255,0.4)'}
                />
              </Animated.View>
              <Text style={[
                styles.streakCount,
                { opacity: streak > 0 ? 1 : 0.5 }
              ]}>
                {streak}
              </Text>
            </TouchableOpacity>

            {/* Level badge */}
            <View style={styles.levelBadge}>
              <Ionicons name="shield-checkmark" size={18} color={theme.secondary} />
              <Text style={styles.levelText}>Lv. {level}</Text>
            </View>

            {/* XP badge */}
            <View style={styles.xpBadge}>
              <Ionicons name="star" size={18} color={theme.secondary} />
              <Text style={styles.xpText}>{xp.toLocaleString()} XP</Text>
            </View>
          </View>

          {/* Motivation message */}
          <View style={styles.motivationRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.motivationText}>{streakMessage}</Text>
            <View style={styles.dividerLine} />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
    ...themeShadows.md,
  },
  card: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  decorations: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circle1: {
    width: 120,
    height: 120,
    top: -40,
    right: -20,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: -20,
    left: 30,
  },
  circle3: {
    width: 50,
    height: 50,
    top: 20,
    left: -15,
  },
  content: {
    zIndex: 1,
  },
  greetingSection: {
    marginBottom: 16,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  greetingText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  frenchGreeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  englishGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 56,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  streakCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  motivationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  motivationText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
  },
});

