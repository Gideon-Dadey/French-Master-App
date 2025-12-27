import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  Platform,
} from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getThemeColors } from '../utils/organicTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * ProgressRing - Animated circular progress indicator
 * 
 * @param {number} progress - Progress value 0-100
 * @param {number} size - Ring size in pixels
 * @param {number} strokeWidth - Thickness of the ring
 * @param {array} colors - Gradient colors for the progress
 * @param {string} backgroundColor - Background ring color
 * @param {boolean} showPercentage - Show percentage in center
 * @param {string} centerText - Custom center text (overrides percentage)
 * @param {string} label - Label below percentage
 * @param {boolean} animated - Enable entrance animation
 * @param {boolean} isDarkMode - Theme mode
 * @param {object} style - Additional styles
 */
export default function ProgressRing({
  progress = 0,
  size = 120,
  strokeWidth = 10,
  colors = ['#D4A853', '#FFD700'],
  backgroundColor,
  showPercentage = true,
  centerText,
  label,
  animated = true,
  isDarkMode = false,
  style,
}) {
  const theme = getThemeColors(isDarkMode);
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const bgColor = backgroundColor || (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)');

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(animatedProgress, {
          toValue: progress,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      animatedProgress.setValue(progress);
      scaleAnim.setValue(1);
    }
  }, [progress, animated]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size },
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors[0]} />
            <Stop offset="100%" stopColor={colors[1] || colors[0]} />
          </LinearGradient>
        </Defs>
        
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGrad)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        {centerText ? (
          <Text style={[styles.centerText, { color: theme.text }]}>
            {centerText}
          </Text>
        ) : showPercentage ? (
          <View style={styles.percentageContainer}>
            <Text style={[styles.percentageText, { color: theme.text }]}>
              {Math.round(progress)}
            </Text>
            <Text style={[styles.percentSymbol, { color: theme.textSecondary }]}>%</Text>
          </View>
        ) : null}
        
        {label && (
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {label}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * MiniProgressRing - Compact version for lists/cards
 */
export function MiniProgressRing({
  progress = 0,
  size = 44,
  strokeWidth = 4,
  color,
  isDarkMode = false,
}) {
  const theme = getThemeColors(isDarkMode);
  const ringColor = color || theme.secondary;

  return (
    <ProgressRing
      progress={progress}
      size={size}
      strokeWidth={strokeWidth}
      colors={[ringColor, ringColor]}
      showPercentage={false}
      animated={false}
      isDarkMode={isDarkMode}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  percentSymbol: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});

