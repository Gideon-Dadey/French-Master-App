import React, { useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { Animated, StyleSheet, View, AccessibilityInfo, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
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
  const avatarSize = focused ? 28 : 26;

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

  // Show avatar for Profile tab if user is authenticated and has avatar
  const showAvatar = route === 'Profile' && user && user.avatar;
  const avatarUrl = showAvatar 
    ? (user.avatar.startsWith('http') || user.avatar.startsWith('data:') 
        ? user.avatar 
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=6366F1&color=fff&size=200`)
    : null;

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
        {showAvatar ? (
          <Image
            source={{ uri: avatarUrl }}
            style={[
              styles.avatar,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                borderColor: focused ? color : inactiveColor,
                borderWidth: focused ? 2 : 1.5,
              },
            ]}
            accessible={false}
            importantForAccessibility="no"
          />
        ) : (
          <Ionicons
            name={iconName}
            size={iconSize}
            color={focused ? color : inactiveColor}
            style={styles.icon}
            accessible={false}
            importantForAccessibility="no"
          />
        )}
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
  avatar: {
    // Size is set dynamically based on focused state
  },
  activeIndicator: {
    width: 30,
    height: 3,
    borderRadius: 1.5,
    marginTop: 4,
  },
});

// Performance: Only re-render if props actually change
TabBarIcon.displayName = 'TabBarIcon';

export default TabBarIcon;

