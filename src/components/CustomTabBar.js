import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { screenWidth } from '../utils/responsive';

import { useTheme } from '../context/ThemeContext';

const width = screenWidth;

// LinkedIn-style Tab Configuration - Matching the provided image
const getTabConfig = (theme) => ({
  Home: {
    icon: 'home',
    iconType: 'MaterialCommunityIcons',
    label: 'Home',
  },
  Learn: {
    icon: 'school',
    iconOutline: 'school-outline',
    label: 'Learn',
  },
  Practice: {
    icon: 'brain',
    iconType: 'MaterialCommunityIcons',
    label: 'Practice',
  },
  Community: {
    icon: 'account-group',
    iconType: 'MaterialCommunityIcons',
    label: 'Club',
  },
  Profile: {
    icon: 'account-circle',
    iconType: 'MaterialCommunityIcons',
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

  // Colors - Match LinkedIn style (Black/White for active, Solid Gray for inactive)
  const activeColor = theme.isDarkMode ? '#FFFFFF' : '#000000';
  const inactiveColor = theme.isDarkMode ? '#8E8E93' : '#666666';

  const IconComponent = config.iconType === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;

  // Use solid silhouettes for both states to match the LinkedIn design style
  const iconName = config.icon;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={config.label}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={1}
    >
      {/* Active Indicator Bar at the TOP - Matching LinkedIn style */}
      {focused && (
        <View
          style={[
            styles.activeIndicator,
            { backgroundColor: activeColor }
          ]}
        />
      )}

      <Animated.View style={[styles.tabContent, { transform: [{ scale: scaleAnim }] }]}>
        <IconComponent
          name={iconName}
          size={24} // Adjusted size to match LinkedIn weight
          color={focused ? activeColor : inactiveColor}
          style={{ marginBottom: 2 }}
        />
        <Text
          style={[
            styles.label,
            {
              color: focused ? activeColor : inactiveColor,
              fontWeight: focused ? '700' : '400',
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
      <View style={[
        styles.blurContainer,
        {
          borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          paddingBottom: getBottomPadding(),
          // Match the exact app background color
          backgroundColor: isDarkMode ? theme.background : '#FFFFFF',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }
      ]}>
        <TabContent state={state} navigation={navigation} theme={{ ...theme, isDarkMode }} />
      </View>
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
    paddingTop: 0, // Reset to allow indicator to be at the absolute top
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
    height: 50, // Standard LinkedIn/Professional tab bar height (before safe area)
  },
  activeIndicator: {
    position: 'absolute',
    top: 0, // At the very top edge
    height: 2,
    width: '85%',
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6, // Space from the top bar to the icon
  },
  label: {
    fontSize: 11, // Slightly larger to match standard mobile patterns
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: 0,
    marginTop: -1, // Tighter spacing with the icon
  },
});
