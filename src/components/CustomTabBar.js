import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// Premium Apple-style Tab Configuration
const getTabConfig = (theme) => ({
  Home: {
    icon: 'home',
    iconOutline: 'home-outline',
    label: 'Home',
  },
  Learn: {
    icon: 'school',
    iconOutline: 'school-outline',
    label: 'Learn',
  },
  Practice: {
    icon: 'game-controller',
    iconOutline: 'game-controller-outline',
    label: 'Practice',
  },
  Community: {
    icon: 'people',
    iconOutline: 'people-outline',
    label: 'Club',
  },
  Profile: {
    icon: 'person',
    iconOutline: 'person-outline',
    label: 'Profile',
  },
});

function TabBarItem({ route, focused, onPress, onLongPress, theme }) {
  const tabConfig = getTabConfig(theme);
  const config = tabConfig[route.name] || {
    icon: 'square',
    iconOutline: 'square-outline',
    label: route.name,
  };

  // Subtle spring animation for focus
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.05 : 1, // Very subtle scale
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  // Colors
  const activeColor = theme.primary;
  const inactiveColor = theme.isDarkMode ? '#8E8E93' : '#999999'; // Standard iOS inactive gray

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={config.label}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={1} // Disable default opacity change for instant feel
    >
      <Animated.View style={[styles.tabContent, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons
          name={focused ? config.icon : config.iconOutline}
          size={26} // Standard iOS tab icon size
          color={focused ? activeColor : inactiveColor}
          style={{ marginBottom: 4 }}
        />
        <Text
          style={[
            styles.label,
            {
              color: focused ? activeColor : inactiveColor,
              fontWeight: focused ? '600' : '500',
            }
          ]}
        >
          {config.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, descriptors, navigation }) {
  const { isDarkMode, organicColors: theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Dynamic bottom padding adjustment based on navigation type (gesture vs buttons)
  // insets.bottom will be > 0 for modern phones (Safe Area)
  // insets.bottom will be 0 for older phones with hardware buttons or specific Android configs
  const getBottomPadding = () => {
    if (Platform.OS === 'ios') {
      return insets.bottom > 0 ? insets.bottom - 5 : 20;
    }
    // For Android
    // if insets.bottom > 0, it means we have a gesture bar or software buttons usually
    // if insets.bottom is 0, we need some padding so it doesn't touch the edge
    return Math.max(insets.bottom, 12);
  };

  return (
    <View style={styles.positionWrapper}>
      {/* On iOS we use BlurView for the premium glass effect */}
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={95}
          tint={isDarkMode ? 'dark' : 'light'}
          style={[
            styles.blurContainer,
            {
              borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              paddingBottom: getBottomPadding(),
              // Ensure background color is consistent slightly with theme but transparent enough for blur
              backgroundColor: isDarkMode ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)',
            }
          ]}
        >
          <TabContent state={state} navigation={navigation} theme={{ ...theme, isDarkMode }} />
        </BlurView>
      ) : (
        // On Android, BlurView support is limited/inconsistent across versions.
        // We use a semi-transparent background color that matches the theme perfectly.
        <View style={[
          styles.blurContainer,
          {
            borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            paddingBottom: getBottomPadding(),
            // Use the exact theme surface color but with high opacity to prevent content bleed-thru being ugly
            backgroundColor: isDarkMode ? '#000000Fa' : '#FFFFFFFa',

          }
        ]}>
          <TabContent state={state} navigation={navigation} theme={{ ...theme, isDarkMode }} />
        </View>
      )}
    </View>
  );
}

// Separated content component to avoid duplication
const TabContent = ({ state, navigation, theme }) => (
  <View style={styles.tabsRow}>
    {state.routes.map((route, index) => {
      const focused = state.index === index;

      const onPress = () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!focused && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params);
        }
      };

      const onLongPress = () => {
        navigation.emit({
          type: 'tabLongPress',
          target: route.key,
        });
      };

      return (
        <TabBarItem
          key={route.key}
          route={route}
          focused={focused}
          onPress={onPress}
          onLongPress={onLongPress}
          theme={theme}
        />
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  positionWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0, // Remove shadow elevation to keep it flat and clean
    zIndex: 1000,
  },
  blurContainer: {
    width: '100%',
    borderTopWidth: 0.5, // Hairline border
    paddingTop: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    letterSpacing: 0.1,
  },
});
