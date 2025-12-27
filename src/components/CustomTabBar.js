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
import { useTheme } from '../context/ThemeContext';
import { getThemeColors } from '../utils/organicTheme';

const { width } = Dimensions.get('window');

// Tab configuration with unified theme colors
const getTabConfig = (theme) => ({
  Home: {
    icon: 'home',
    iconOutline: 'home-outline',
    label: 'Home',
    activeColor: theme.primary,
  },
  Learn: {
    icon: 'school',
    iconOutline: 'school-outline',
    label: 'Learn',
    activeColor: theme.primary,
  },
  Practice: {
    icon: 'create',
    iconOutline: 'create-outline',
    label: 'Practice',
    activeColor: theme.primary,
  },
  Community: {
    icon: 'chatbubbles',
    iconOutline: 'chatbubbles-outline',
    label: 'Social',
    activeColor: theme.primary,
  },
  Profile: {
    icon: 'person',
    iconOutline: 'person-outline',
    label: 'Profile',
    activeColor: theme.primary,
  },
});

// Tab item component
function TabBarItem({ route, focused, onPress, onLongPress, theme }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const tabConfig = getTabConfig(theme);
  const config = tabConfig[route.name] || {
    icon: 'ellipse',
    iconOutline: 'ellipse-outline',
    label: route.name,
    activeColor: theme.primary,
  };

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.08 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 15,
    }).start();
  }, [focused]);

  const inactiveColor = theme.textMuted;
  const activeColor = theme.secondary; // Gold color for active state

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={config.label}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.tabContent,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        {/* Active indicator */}
        {focused && (
          <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />
        )}

        {/* Icon */}
        <Ionicons
          name={focused ? config.icon : config.iconOutline}
          size={24}
          color={focused ? activeColor : inactiveColor}
        />

        {/* Label */}
        <Text
          style={[
            styles.label,
            {
              color: focused ? activeColor : inactiveColor,
              fontWeight: focused ? '700' : '500',
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
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();

  // Smart bottom padding for all device types
  const getBottomPadding = () => {
    if (Platform.OS === 'ios') {
      return insets.bottom > 20 ? insets.bottom - 16 : 8;
    } else {
      if (insets.bottom > 40) {
        return 4;
      } else if (insets.bottom > 0) {
        return insets.bottom;
      } else {
        return 10;
      }
    }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.surface,
        paddingBottom: getBottomPadding(),
        borderTopColor: theme.border,
      }
    ]}>
      {/* Subtle top border */}
      <View style={[
        styles.topBorder,
        { backgroundColor: theme.border }
      ]} />

      {/* Tab items */}
      <View style={styles.tabsContainer}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
    borderTopWidth: 1,
  },
  topBorder: {
    height: 0,
    width: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});
