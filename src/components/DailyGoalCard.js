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
import ProgressRing from './ProgressRing';

const { width } = Dimensions.get('window');

/**
 * DailyGoalCard - Beautiful daily goal progress tracker
 * 
 * Shows progress toward daily learning goal with motivational feedback
 * 
 * @param {number} current - Current progress (e.g., lessons completed)
 * @param {number} goal - Daily goal target
 * @param {string} unit - Unit label (e.g., "lessons", "minutes", "words")
 * @param {function} onPress - Callback when card is pressed
 * @param {boolean} isDarkMode - Theme mode
 * @param {object} style - Additional styles
 */
export default function DailyGoalCard({
  current = 0,
  goal = 5,
  unit = "lessons",
  onPress,
  isDarkMode = false,
  style,
}) {
  const theme = getThemeColors(isDarkMode);
  const progress = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const celebrateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isComplete) {
      // Celebration animation
      Animated.parallel([
        Animated.spring(celebrateAnim, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    }
  }, [isComplete]);

  const getMessage = () => {
    if (isComplete) {
      return { text: "🎉 Goal Complete!", subtext: "Amazing work today!" };
    }
    if (progress >= 80) {
      return { text: "Almost there!", subtext: `Just ${goal - current} more to go!` };
    }
    if (progress >= 50) {
      return { text: "Great progress!", subtext: "Keep up the momentum!" };
    }
    if (progress > 0) {
      return { text: "You've started!", subtext: "Every step counts!" };
    }
    return { text: "Ready to learn?", subtext: `Complete ${goal} ${unit} today!` };
  };

  const message = getMessage();

  const celebrateScale = celebrateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: isComplete ? Animated.multiply(celebrateScale, pulseAnim) : 1 },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onPress}
        disabled={!onPress}
      >
        <LinearGradient
          colors={isComplete
            ? [theme.success, theme.successLight || '#4CAF50']
            : [theme.primary, theme.primaryLight || theme.primary]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Decorative elements */}
          <View style={styles.decorations}>
            {isComplete && (
              <>
                <View style={[styles.confetti, styles.confetti1]} />
                <View style={[styles.confetti, styles.confetti2]} />
                <View style={[styles.confetti, styles.confetti3]} />
              </>
            )}
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
          </View>

          <View style={styles.content}>
            {/* Left section - Progress ring */}
            <View style={styles.progressSection}>
              <ProgressRing
                progress={progress}
                size={80}
                strokeWidth={8}
                colors={isComplete
                  ? ['#FFFFFF', theme.successLight || 'rgba(255,255,255,0.7)']
                  : [theme.secondary, theme.secondaryLight || '#FFD700']
                }
                backgroundColor="rgba(255,255,255,0.2)"
                showPercentage={false}
                centerText={isComplete ? "✓" : `${current}`}
                isDarkMode={isDarkMode}
              />
            </View>

            {/* Right section - Text content */}
            <View style={styles.textSection}>
              <View style={styles.labelRow}>
                <Ionicons
                  name={isComplete ? "checkmark-circle" : "flag"}
                  size={16}
                  color={theme.secondary}
                />
                <Text style={styles.label}>DAILY GOAL</Text>
              </View>

              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.subtext}>{message.subtext}</Text>

              {/* Progress bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: isComplete ? '#FFFFFF' : theme.secondary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  {current}/{goal} {unit}
                </Text>
              </View>
            </View>
          </View>

          {/* Arrow indicator */}
          {onPress && (
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
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
    padding: 20,
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
    width: 100,
    height: 100,
    top: -30,
    right: -20,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: -20,
    left: 40,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  confetti1: {
    top: 20,
    right: 40,
  },
  confetti2: {
    top: 60,
    right: 20,
  },
  confetti3: {
    bottom: 30,
    right: 60,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  progressSection: {
    marginRight: 20,
  },
  textSection: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  messageText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    minWidth: 70,
    textAlign: 'right',
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
});

