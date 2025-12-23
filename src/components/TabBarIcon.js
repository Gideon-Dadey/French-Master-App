import React, { useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { Animated, StyleSheet, View, AccessibilityInfo, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

/**
 * Premium animated tab bar icon component
 * Optimized for performance with memoization and reduced re-renders
 * Includes haptic feedback, accessibility support, and reduce motion
 * 
 * @param {boolean} focused - Whether the tab is currently focused
 * @param {string} route - The route name (Home, Courses, etc.)
 * @param {string} color - Active icon color
 * @param {string} inactiveColor - Inactive icon color
 */
const TabBarIcon = memo(({ focused, route, color, inactiveColor }) => {
  // Check if user prefers reduced motion (accessibility)
  const [reduceMotion, setReduceMotion] = React.useState(false);
  
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription?.remove();
  }, []);

  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.65)).current;

  // Memoize icon name lookup
  const iconName = useMemo(() => {
    switch (route) {
      case 'Home':
        return focused ? 'home' : 'home-outline';
      case 'Learn':
        return focused ? 'book' : 'book-outline';
      case 'Practice':
        return focused ? 'school' : 'school-outline';
      case 'Community':
        return focused ? 'people' : 'people-outline';
      case 'Profile':
        return focused ? 'person-circle' : 'person-circle-outline';
      // Legacy routes for backward compatibility
      case 'Resources':
        return focused ? 'folder' : 'folder-outline';
      case 'Courses':
        return focused ? 'book' : 'book-outline';
      case 'MyCourses':
        return focused ? 'library' : 'library-outline';
      default:
        return 'ellipse-outline';
    }
  }, [route, focused]);

  // Haptic feedback on focus change (optional enhancement)
  useEffect(() => {
    if (focused && Platform.OS !== 'web' && Haptics) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Silently fail if haptics not available
        if (__DEV__) console.warn('Haptics feedback failed:', error);
      }
    }
  }, [focused]);

      // Optimized animation with reduce motion support
      useEffect(() => {
        if (reduceMotion) {
          // Instant transitions for reduce motion
          scaleAnim.setValue(focused ? 1 : 0.9);
          opacityAnim.setValue(focused ? 1 : 0.65);
          return;
        }

        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: focused ? 1 : 0.9,
            useNativeDriver: true,
            tension: 180,
            friction: 10,
          }),
          Animated.timing(opacityAnim, {
            toValue: focused ? 1 : 0.65,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }, [focused, reduceMotion]);

  const iconSize = focused ? 26 : 24;

  // Accessibility label (memoized)
  const accessibilityLabel = useMemo(() => {
    const labels = {
      'Home': focused ? 'Home, selected' : 'Home',
      'Learn': focused ? 'Learn, selected' : 'Learn',
      'Practice': focused ? 'Practice, selected' : 'Practice',
      'Community': focused ? 'Community, selected' : 'Community',
      'Profile': focused ? 'Profile, selected' : 'Profile',
      // Legacy routes
      'Resources': focused ? 'Resources, selected' : 'Resources',
      'Courses': focused ? 'Courses, selected' : 'Courses',
      'MyCourses': focused ? 'My Courses, selected' : 'My Courses',
    };
    return labels[route] || route;
  }, [route, focused]);

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: focused }}
      accessibilityHint={`Navigate to ${route} screen`}
    >
      <Animated.View
        style={[
          styles.iconWrapper,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Ionicons
          name={iconName}
          size={iconSize}
          color={focused ? color : inactiveColor}
          style={styles.icon}
          accessible={false}
          importantForAccessibility="no"
        />
      </Animated.View>
      {focused && (
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              backgroundColor: color,
              opacity: opacityAnim,
            },
          ]}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    // Icon styling
  },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
});

// Performance: Only re-render if props actually change
TabBarIcon.displayName = 'TabBarIcon';

export default TabBarIcon;

