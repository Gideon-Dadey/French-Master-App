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
    color: '#6366f1',
  },
  Learn: {
    icon: 'school',
    iconOutline: 'school-outline',
    label: 'Learn',
    color: '#8b5cf6',
  },
  Practice: {
    icon: 'create',
    iconOutline: 'create-outline',
    label: 'Practice',
    color: '#f59e0b',
  },
  Community: {
    icon: 'chatbubbles',
    iconOutline: 'chatbubbles-outline',
    label: 'Social',
    color: '#10b981',
  },
  Profile: {
    icon: 'person',
    iconOutline: 'person-outline',
    label: 'Profile',
    color: '#ec4899',
  },
};

// Tab item component - same for all navigation types
function TabBarItem({ route, focused, onPress, onLongPress, isDarkMode }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const config = tabConfig[route.name] || {
    icon: 'ellipse',
    iconOutline: 'ellipse-outline',
    label: route.name,
    color: '#6366f1',
  };

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.05 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 15,
    }).start();
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
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.tabContent,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        {/* Icon - no background, transparent */}
        <Ionicons
          name={focused ? config.icon : config.iconOutline}
          size={24}
          color={focused ? config.color : inactiveColor}
        />

        {/* Label */}
        <Text
          style={[
            styles.label,
            {
              color: focused ? config.color : inactiveColor,
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
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  // Smart bottom padding for all device types
  const getBottomPadding = () => {
    if (Platform.OS === 'ios') {
      // iOS with home indicator: insets.bottom ~34
      // iOS with home button: insets.bottom ~0
      return insets.bottom > 20 ? insets.bottom - 16 : 8;
    } else {
      // Android gesture nav: insets.bottom ~24-48
      // Android 3-button nav: insets.bottom ~0
      if (insets.bottom > 40) {
        return 4; // Gesture nav - minimal padding
      } else if (insets.bottom > 0) {
        return insets.bottom; // Some inset present
      } else {
        return 10; // 3-button nav - comfortable padding
      }
    }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDarkMode ? '#0f0f0f' : '#ffffff',
        paddingBottom: getBottomPadding(),
      }
    ]}>
      {/* Subtle top border */}
      <View style={[
        styles.topBorder,
        { backgroundColor: isDarkMode ? '#1f1f1f' : '#e8e8e8' }
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
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 16,
  },
  topBorder: {
    height: 0.5,
    width: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 4,
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
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
