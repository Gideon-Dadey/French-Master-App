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

const { width } = Dimensions.get('window');

const tabConfig = {
  Home: {
    icon: 'home',
    iconOutline: 'home-outline',
    label: 'Home',
    gradient: ['#6366f1', '#818cf8'],
  },
  Learn: {
    icon: 'school',
    iconOutline: 'school-outline',
    label: 'Learn',
    gradient: ['#8b5cf6', '#a78bfa'],
  },
  Practice: {
    icon: 'create',
    iconOutline: 'create-outline',
    label: 'Practice',
    gradient: ['#f59e0b', '#fbbf24'],
  },
  Community: {
    icon: 'chatbubbles',
    iconOutline: 'chatbubbles-outline',
    label: 'Community',
    gradient: ['#10b981', '#34d399'],
  },
  Profile: {
    icon: 'person',
    iconOutline: 'person-outline',
    label: 'Profile',
    gradient: ['#ec4899', '#f472b6'],
  },
};

function TabBarItem({ route, focused, onPress, onLongPress, isDarkMode }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  const config = tabConfig[route.name] || {
    icon: 'ellipse',
    iconOutline: 'ellipse-outline',
    label: route.name,
    gradient: ['#6366f1', '#818cf8'],
  };

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.spring(translateAnim, {
          toValue: -2,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.spring(translateAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
      ]).start();
    }
  }, [focused]);

  const inactiveColor = isDarkMode ? '#6b7280' : '#9ca3af';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={config.label}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={0.6}
    >
      <Animated.View
        style={[
          styles.tabContent,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: translateAnim },
            ]
          }
        ]}
      >

        <View style={styles.iconWrapper}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={focused ? config.icon : config.iconOutline}
              size={24}
              color={focused ? config.gradient[0] : inactiveColor}
            />
          </View>
        </View>

        <Text
          style={[
            styles.label,
            {
              color: focused ? config.gradient[0] : inactiveColor,
              fontWeight: focused ? '700' : '500',
            }
          ]}
        >
          {config.label}
        </Text>

        {focused && (
          <View style={[styles.activeDot, { backgroundColor: config.gradient[0] }]} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, descriptors, navigation }) {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding based on device type
  // - iOS with home indicator: uses insets.bottom
  // - Android gesture nav: typically has small inset
  // - Android 3-button nav: no inset, but needs padding
  const bottomPadding = Platform.select({
    ios: Math.max(insets.bottom, 8),
    android: insets.bottom > 0 ? insets.bottom : 8,
  });

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDarkMode ? '#0c0c0c' : '#ffffff',
        borderTopColor: isDarkMode ? '#1f1f1f' : '#f0f0f0',
        paddingBottom: bottomPadding,
      }
    ]}>

      <View style={[
        styles.topBorder,
        { backgroundColor: isDarkMode ? '#1f1f1f' : '#e5e5e5' }
      ]} />

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
              isDarkMode={isDarkMode}
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
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  topBorder: {
    height: 1,
    width: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 6,
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
    paddingVertical: 2,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 46,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    marginTop: 6,
    letterSpacing: 0.1,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
