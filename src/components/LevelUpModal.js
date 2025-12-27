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
import { getThemeColors, themeShadows } from '../utils/organicTheme';

const { width } = Dimensions.get('window');

// Particle burst effect
const ParticleBurst = ({ color, delay }) => {
  const particles = useRef([...Array(8)].map(() => ({
    anim: new Animated.Value(0),
    angle: Math.random() * 360,
    distance: 50 + Math.random() * 50,
  }))).current;

  useEffect(() => {
    particles.forEach((particle, i) => {
      Animated.timing(particle.anim, {
        toValue: 1,
        duration: 800,
        delay: delay + i * 30,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <View style={styles.particleContainer}>
      {particles.map((particle, i) => {
        const translateX = particle.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(particle.angle * Math.PI / 180) * particle.distance],
        });
        const translateY = particle.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(particle.angle * Math.PI / 180) * particle.distance],
        });
        const opacity = particle.anim.interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: [0, 1, 0],
        });
        const scale = particle.anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.5, 1.2, 0.3],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                backgroundColor: color,
                opacity,
                transform: [{ translateX }, { translateY }, { scale }],
              }
            ]}
          />
        );
      })}
    </View>
  );
};

/**
 * LevelUpModal - Celebrates when user reaches a new level
 * 
 * @param {boolean} visible - Show/hide the modal
 * @param {function} onClose - Callback when modal closes
 * @param {number} newLevel - The new level reached
 * @param {string} levelTitle - Title for the new level (e.g., "Apprentice")
 * @param {array} rewards - Array of unlocked rewards/features
 * @param {boolean} isDarkMode - Theme mode
 */
export default function LevelUpModal({
  visible,
  onClose,
  newLevel = 2,
  levelTitle = "Apprentice",
  rewards = [],
  isDarkMode = false,
}) {
  const theme = getThemeColors(isDarkMode);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const levelBadgeScale = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const rewardAnims = useRef(rewards.map(() => new Animated.Value(0))).current;

  const levelColors = {
    1: ['#78909C', '#90A4AE'],  // Beginner - Grey
    2: ['#8BC34A', '#AED581'],  // Novice - Green
    3: ['#29B6F6', '#4FC3F7'],  // Apprentice - Blue
    4: ['#AB47BC', '#CE93D8'],  // Intermediate - Purple
    5: ['#FFB300', '#FFCA28'],  // Advanced - Gold
    6: ['#FF7043', '#FF8A65'],  // Expert - Orange
    7: ['#E91E63', '#F06292'],  // Master - Pink
    8: ['#7C4DFF', '#B388FF'],  // Grand Master - Violet
    9: ['#00BFA5', '#64FFDA'],  // Legend - Teal
    10: ['#FFD700', '#FFF176'], // Champion - Gold
  };

  const colors = levelColors[newLevel] || levelColors[2];

  useEffect(() => {
    if (visible) {
      // Entrance animations
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(levelBadgeScale, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Shine animation loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Staggered reward animations
      rewards.forEach((_, i) => {
        if (rewardAnims[i]) {
          Animated.spring(rewardAnims[i], {
            toValue: 1,
            tension: 60,
            friction: 8,
            delay: 800 + i * 150,
            useNativeDriver: true,
          }).start();
        }
      });
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  const shineTranslate = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          style={[styles.overlay, { opacity: opacityAnim }]}
        />

        {/* Particle bursts */}
        <ParticleBurst color={colors[0]} delay={200} />
        <ParticleBurst color={colors[1]} delay={400} />

        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            {/* Header gradient */}
            <LinearGradient
              colors={colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              {/* Animated shine */}
              <Animated.View
                style={[
                  styles.shine,
                  { transform: [{ translateX: shineTranslate }] }
                ]}
              />
              
              <Text style={styles.headerLabel}>LEVEL UP!</Text>
            </LinearGradient>

            {/* Level badge */}
            <Animated.View
              style={[
                styles.levelBadgeWrapper,
                { transform: [{ scale: levelBadgeScale }] }
              ]}
            >
              <LinearGradient
                colors={colors}
                style={styles.levelBadge}
              >
                <View style={styles.levelBadgeInner}>
                  <Text style={styles.levelNumber}>{newLevel}</Text>
                </View>
              </LinearGradient>
              <View style={styles.levelRing} />
            </Animated.View>

            {/* Level title */}
            <Text style={[styles.levelTitle, { color: theme.text }]}>
              {levelTitle}
            </Text>
            <Text style={[styles.congrats, { color: theme.textSecondary }]}>
              You've reached a new level of mastery!
            </Text>

            {/* Rewards section */}
            {rewards.length > 0 && (
              <View style={styles.rewardsSection}>
                <Text style={[styles.rewardsTitle, { color: theme.text }]}>
                  🎁 Unlocked Rewards
                </Text>
                <View style={styles.rewardsList}>
                  {rewards.map((reward, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.rewardItem,
                        {
                          backgroundColor: theme.background,
                          borderColor: theme.border,
                          opacity: rewardAnims[i] || 1,
                          transform: [
                            {
                              translateY: (rewardAnims[i] || new Animated.Value(1)).interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                              })
                            }
                          ],
                        }
                      ]}
                    >
                      <Ionicons name={reward.icon || 'gift'} size={20} color={colors[0]} />
                      <Text style={[styles.rewardText, { color: theme.text }]}>
                        {reward.text || reward}
                      </Text>
                    </Animated.View>
                  ))}
                </View>
              </View>
            )}

            {/* XP info */}
            <View style={[styles.xpInfo, { backgroundColor: colors[0] + '15' }]}>
              <Ionicons name="star" size={18} color={colors[0]} />
              <Text style={[styles.xpText, { color: colors[0] }]}>
                Keep earning XP to reach Level {newLevel + 1}!
              </Text>
            </View>

            {/* Continue button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleClose}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueGradient}
              >
                <Text style={styles.continueText}>Awesome!</Text>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  particleContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardWrapper: {
    width: width - 48,
    maxWidth: 360,
    zIndex: 10,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    ...themeShadows.xl,
  },
  headerGradient: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  headerLabel: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  levelBadgeWrapper: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 16,
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...themeShadows.lg,
  },
  levelBadgeInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
  },
  levelRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  congrats: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 32,
  },
  rewardsSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  rewardsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  rewardsList: {
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '600',
  },
  continueButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

