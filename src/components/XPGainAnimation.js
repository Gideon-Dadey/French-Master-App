import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors } from '../utils/organicTheme';

/**
 * XPGainAnimation - Floating XP gain indicator
 * 
 * Shows an animated "+50 XP" style notification that floats up and fades
 * Can be positioned anywhere on screen
 * 
 * @param {boolean} visible - Trigger animation
 * @param {number} amount - XP amount to display
 * @param {function} onComplete - Callback when animation finishes
 * @param {object} position - { x, y } position on screen
 * @param {boolean} isDarkMode - Theme mode
 */
export default function XPGainAnimation({
  visible,
  amount = 10,
  onComplete,
  position = { x: '50%', y: '50%' },
  isDarkMode = false,
}) {
  const theme = getThemeColors(isDarkMode);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const starAnims = useRef([...Array(5)].map(() => ({
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
    opacity: new Animated.Value(0),
    rotate: new Animated.Value(0),
  }))).current;

  useEffect(() => {
    if (visible && !isAnimating) {
      setIsAnimating(true);
      
      // Reset values
      translateY.setValue(0);
      opacity.setValue(0);
      scale.setValue(0.5);
      starAnims.forEach(star => {
        star.translateX.setValue(0);
        star.translateY.setValue(0);
        star.opacity.setValue(0);
        star.rotate.setValue(0);
      });

      // Main XP animation
      Animated.parallel([
        Animated.sequence([
          Animated.spring(scale, {
            toValue: 1.2,
            tension: 200,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(800),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -80,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        setIsAnimating(false);
        if (onComplete) onComplete();
      });

      // Star burst animations
      starAnims.forEach((star, i) => {
        const angle = (i / starAnims.length) * Math.PI * 2 - Math.PI / 2;
        const distance = 40 + Math.random() * 20;
        
        Animated.parallel([
          Animated.sequence([
            Animated.delay(100 + i * 30),
            Animated.timing(star.opacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(star.opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(100 + i * 30),
            Animated.timing(star.translateX, {
              toValue: Math.cos(angle) * distance,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(100 + i * 30),
            Animated.timing(star.translateY, {
              toValue: Math.sin(angle) * distance,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(100 + i * 30),
            Animated.timing(star.rotate, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    }
  }, [visible]);

  if (!visible && !isAnimating) return null;

  return (
    <View
      style={[
        styles.container,
        {
          left: position.x,
          top: position.y,
        },
      ]}
      pointerEvents="none"
    >
      {/* Star particles */}
      {starAnims.map((star, i) => (
        <Animated.View
          key={i}
          style={[
            styles.star,
            {
              opacity: star.opacity,
              transform: [
                { translateX: star.translateX },
                { translateY: star.translateY },
                {
                  rotate: star.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="star" size={12} color={theme.secondary} />
        </Animated.View>
      ))}

      {/* Main XP badge */}
      <Animated.View
        style={[
          styles.xpBadge,
          {
            backgroundColor: theme.secondary,
            opacity,
            transform: [
              { translateY },
              { scale },
            ],
          },
        ]}
      >
        <Ionicons name="star" size={18} color="#FFFFFF" />
        <Text style={styles.xpText}>+{amount}</Text>
        <Text style={styles.xpLabel}>XP</Text>
      </Animated.View>
    </View>
  );
}

/**
 * useXPAnimation - Hook for triggering XP animations
 * 
 * Usage:
 * const { triggerXP, XPAnimationComponent } = useXPAnimation();
 * 
 * // Trigger animation
 * triggerXP(50); // Shows +50 XP
 * 
 * // Render component
 * {XPAnimationComponent}
 */
export function useXPAnimation(isDarkMode = false) {
  const [animState, setAnimState] = useState({
    visible: false,
    amount: 0,
    key: 0,
  });

  const triggerXP = (amount = 10, position = { x: '50%', y: '40%' }) => {
    setAnimState({
      visible: true,
      amount,
      position,
      key: Date.now(),
    });
  };

  const handleComplete = () => {
    setAnimState(prev => ({ ...prev, visible: false }));
  };

  const XPAnimationComponent = (
    <XPGainAnimation
      key={animState.key}
      visible={animState.visible}
      amount={animState.amount}
      position={animState.position}
      onComplete={handleComplete}
      isDarkMode={isDarkMode}
    />
  );

  return { triggerXP, XPAnimationComponent };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    width: 1,
    height: 1,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xpText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 2,
  },
  star: {
    position: 'absolute',
  },
});

