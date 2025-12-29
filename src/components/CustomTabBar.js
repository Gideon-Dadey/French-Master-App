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

// Tab configuration with unified theme colors
const getTabConfig = (theme) => ({
  Home: {
    icon: 'home-sharp',
    iconOutline: 'home-outline',
    label: 'Home',
  },
  Learn: {
    icon: 'school-sharp',
    iconOutline: 'school-outline',
    label: 'Learn',
  },
  Practice: {
    icon: 'extension-puzzle-sharp',
    iconOutline: 'extension-puzzle-outline',
    label: 'Practice',
  },
  Community: {
    icon: 'chatbubbles-sharp',
    iconOutline: 'chatbubbles-outline',
    label: 'Chats',
  },
  Profile: {
    icon: 'person-circle-sharp',
    iconOutline: 'person-circle-outline',
    label: 'Profile',
  },
});

// Tab item component
function TabBarItem({ route, focused, onPress, onLongPress, theme }) {
  const tabConfig = getTabConfig(theme);
  const config = tabConfig[route.name] || {
    icon: 'ellipse',
    iconOutline: 'ellipse-outline',
    label: route.name,
  };

  const inactiveColor = theme.textSecondary;
  const activeColor = theme.primary;

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
      <View style={styles.tabContent}>
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
              fontWeight: focused ? '700' : '400',
            }
          ]}
        >
          {config.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, descriptors, navigation }) {
  const { isDarkMode, organicColors: theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Smart bottom padding for all device types
  const getBottomPadding = () => {
    if (Platform.OS === 'ios') {
      return insets.bottom > 20 ? insets.bottom - 5 : 15;
    } else {
      return Math.max(insets.bottom, 15);
    }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.surface,
        borderTopColor: theme.border,
        paddingBottom: getBottomPadding(),
      }
    ]}>
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
    borderTopWidth: 1,
    paddingTop: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});
