import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { getThemeColors, themeShadows } from '../utils/organicTheme';

const { width, height } = Dimensions.get('window');

// Animated flame
const AnimatedFlame = ({ delay = 0 }) => {
  const flameAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(flameAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
          Animated.timing(flameAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.spring(scaleAnim, { toValue: 1.1, tension: 100, friction: 5, delay, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 0.9, tension: 100, friction: 5, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const translateY = flameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  return (
    <Animated.View style={{ transform: [{ translateY }, { scale: scaleAnim }] }}>
      <Ionicons name="flame" size={24} color="#FF6B35" />
    </Animated.View>
  );
};

/**
 * StreakCelebration - Celebrates streak milestones
 * 
 * @param {boolean} visible - Show/hide the celebration
 * @param {function} onClose - Callback when celebration ends
 * @param {number} streakCount - Current streak number
 * @param {boolean} isDarkMode - Theme mode
 */
export default function StreakCelebration({
  visible,
  onClose,
  streakCount = 7,
  isDarkMode = false,
}) {
  const theme = getThemeColors(isDarkMode);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const numberScale = useRef(new Animated.Value(0)).current;
  const flameAnims = useRef([...Array(5)].map(() => new Animated.Value(0))).current;

  const getStreakMessage = (count) => {
    if (count >= 365) return { title: "LEGENDARY!", subtitle: "A full year of dedication! 🏆" };
    if (count >= 100) return { title: "UNSTOPPABLE!", subtitle: "100+ days of commitment!" };
    if (count >= 30) return { title: "INCREDIBLE!", subtitle: "A full month of learning!" };
    if (count >= 14) return { title: "AMAZING!", subtitle: "Two weeks strong!" };
    if (count >= 7) return { title: "ON FIRE!", subtitle: "A week of consistency!" };
    if (count >= 3) return { title: "KEEP GOING!", subtitle: "You're building momentum!" };
    return { title: "STREAK STARTED!", subtitle: "Great start to your journey!" };
  };

  const message = getStreakMessage(streakCount);

  useEffect(() => {
    if (visible) {
      // Main card animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(numberScale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Rotating ring animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      ).start();

      // Staggered flame animations
      flameAnims.forEach((anim, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 300 + i * 50,
              delay: i * 100,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 300 + i * 50,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (onClose) onClose();
    });
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={styles.overlay} />

        <Animated.View
          style={[
            styles.cardContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <LinearGradient
            colors={['#FF6B35', '#FF8C42', '#FFB347']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Animated ring */}
            <Animated.View
              style={[
                styles.rotatingRing,
                { transform: [{ rotate: rotation }] }
              ]}
            >
              {[...Array(12)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.ringDot,
                    {
                      transform: [
                        { rotate: `${i * 30}deg` },
                        { translateY: -90 },
                      ],
                    }
                  ]}
                >
                  <View style={styles.dot} />
                </View>
              ))}
            </Animated.View>

            {/* Flames row */}
            <View style={styles.flamesRow}>
              {flameAnims.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={{
                    transform: [
                      {
                        translateY: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -8],
                        })
                      },
                      {
                        scale: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1.1],
                        })
                      }
                    ],
                    opacity: 0.8 + (i * 0.05),
                  }}
                >
                  <Ionicons 
                    name="flame" 
                    size={20 + (i === 2 ? 8 : i === 1 || i === 3 ? 4 : 0)} 
                    color={i === 2 ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} 
                  />
                </Animated.View>
              ))}
            </View>

            {/* Streak number */}
            <Animated.View
              style={[
                styles.numberContainer,
                { transform: [{ scale: numberScale }] }
              ]}
            >
              <Text style={styles.streakNumber}>{streakCount}</Text>
              <Text style={styles.daysLabel}>DAY STREAK</Text>
            </Animated.View>

            {/* Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.title}>{message.title}</Text>
              <Text style={styles.subtitle}>{message.subtitle}</Text>
            </View>

            {/* Motivation text */}
            <View style={styles.motivationContainer}>
              <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.motivationText}>
                Keep it going tomorrow!
              </Text>
              <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.8)" />
            </View>

            {/* Continue button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleClose}
              activeOpacity={0.9}
            >
              <Text style={styles.continueText}>Continue Learning</Text>
              <Ionicons name="arrow-forward" size={18} color="#FF6B35" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.tapHint}>Tap anywhere to continue</Text>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  cardContainer: {
    width: width - 48,
    maxWidth: 340,
    borderRadius: 28,
    overflow: 'hidden',
    ...themeShadows.xl,
  },
  card: {
    padding: 32,
    alignItems: 'center',
  },
  rotatingRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: '50%',
    marginTop: -100,
  },
  ringDot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  flamesRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 16,
  },
  numberContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  streakNumber: {
    fontSize: 72,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  daysLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 3,
    marginTop: -8,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  motivationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  motivationText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
  },
  tapHint: {
    position: 'absolute',
    bottom: 50,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
});

