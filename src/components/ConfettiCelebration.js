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

const { width, height } = Dimensions.get('window');
const CONFETTI_COUNT = 50;

// Confetti piece component
const ConfettiPiece = ({ index, color, startX, duration }) => {
  const fallAnim = useRef(new Animated.Value(-50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 30;
    
    Animated.parallel([
      Animated.timing(fallAnim, {
        toValue: height + 100,
        duration: duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(swayAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(swayAnim, {
            toValue: -1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: duration,
        delay: delay + duration * 0.7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const translateX = swayAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-30, 30],
  });

  const shapes = ['square', 'circle', 'rectangle'];
  const shape = shapes[index % shapes.length];

  const pieceStyle = {
    position: 'absolute',
    left: startX,
    backgroundColor: color,
    opacity: opacityAnim,
    transform: [
      { translateY: fallAnim },
      { translateX },
      { rotate },
    ],
  };

  if (shape === 'square') {
    return (
      <Animated.View
        style={[
          pieceStyle,
          { width: 10, height: 10, borderRadius: 2 }
        ]}
      />
    );
  } else if (shape === 'circle') {
    return (
      <Animated.View
        style={[
          pieceStyle,
          { width: 12, height: 12, borderRadius: 6 }
        ]}
      />
    );
  } else {
    return (
      <Animated.View
        style={[
          pieceStyle,
          { width: 6, height: 14, borderRadius: 1 }
        ]}
      />
    );
  }
};

/**
 * ConfettiCelebration - A beautiful celebration overlay
 * 
 * @param {boolean} visible - Show/hide the celebration
 * @param {function} onClose - Callback when celebration ends
 * @param {string} title - Main celebration text (e.g., "Congratulations!")
 * @param {string} subtitle - Secondary text (e.g., "You completed the lesson!")
 * @param {string} icon - Ionicon name (default: "trophy")
 * @param {string} type - Celebration type: "achievement", "streak", "levelup", "complete"
 * @param {boolean} isDarkMode - Theme mode
 * @param {number} autoClose - Auto close after ms (0 = manual close)
 */
export default function ConfettiCelebration({
  visible,
  onClose,
  title = "Congratulations!",
  subtitle = "You've achieved something amazing!",
  icon = "trophy",
  type = "achievement",
  isDarkMode = false,
  autoClose = 4000,
}) {
  const theme = getThemeColors(isDarkMode);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const starBurst = useRef(new Animated.Value(0)).current;

  // Color schemes for different celebration types
  const typeColors = {
    achievement: [theme.secondary, theme.gold || theme.secondary, '#FFD700', theme.accent],
    streak: ['#FF6B6B', '#FF8E53', '#FFA726', theme.secondary],
    levelup: [theme.primary, theme.accent, theme.secondary, '#7C4DFF'],
    complete: [theme.success, '#4CAF50', '#8BC34A', theme.secondary],
  };

  const confettiColors = typeColors[type] || typeColors.achievement;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(starBurst, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(starBurst, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      if (autoClose > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoClose);
        return () => clearTimeout(timer);
      }
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

  const starScale = starBurst.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1.2],
  });

  // Generate confetti pieces
  const confettiPieces = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    color: confettiColors[i % confettiColors.length],
    startX: Math.random() * width,
    duration: 2500 + Math.random() * 1500,
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Confetti Layer */}
        <View style={styles.confettiContainer} pointerEvents="none">
          {confettiPieces.map((piece) => (
            <ConfettiPiece
              key={piece.id}
              index={piece.id}
              color={piece.color}
              startX={piece.startX}
              duration={piece.duration}
            />
          ))}
        </View>

        {/* Overlay */}
        <Animated.View
          style={[
            styles.overlay,
            { opacity: opacityAnim }
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Content Card */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            {/* Star Burst Background */}
            <Animated.View
              style={[
                styles.starBurst,
                {
                  transform: [{ scale: starScale }],
                  opacity: starBurst,
                }
              ]}
            >
              <LinearGradient
                colors={[confettiColors[0] + '40', confettiColors[0] + '10', 'transparent']}
                style={styles.starBurstGradient}
              />
            </Animated.View>

            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: confettiColors[0] + '20' }]}>
              <LinearGradient
                colors={[confettiColors[0], confettiColors[1] || confettiColors[0]]}
                style={styles.iconGradient}
              >
                <Ionicons name={icon} size={40} color="#FFFFFF" />
              </LinearGradient>
            </View>

            {/* Text */}
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>

            {/* Continue Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleClose}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.primary, theme.primaryLight || theme.primary]}
                style={styles.continueGradient}
              >
                <Text style={styles.continueText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Tap to dismiss hint */}
        <Animated.View style={[styles.hintContainer, { opacity: opacityAnim }]}>
          <Text style={styles.hintText}>Tap anywhere to continue</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  contentContainer: {
    zIndex: 10,
    paddingHorizontal: 32,
    width: '100%',
    maxWidth: 360,
  },
  card: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    overflow: 'hidden',
    ...themeShadows.xl,
  },
  starBurst: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    bottom: -100,
    zIndex: -1,
  },
  starBurstGradient: {
    flex: 1,
    borderRadius: 999,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  continueButton: {
    width: '100%',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hintContainer: {
    position: 'absolute',
    bottom: 60,
    zIndex: 10,
  },
  hintText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
});

