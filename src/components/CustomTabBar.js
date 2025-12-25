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
import { LinearGradient } from 'expo-linear-gradient';
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
          {focused ? (
            <View style={styles.activeIconContainer}>
              <LinearGradient
                colors={config.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activeIconBg}
              >
                <Ionicons
                  name={config.icon}
                  size={22}
                  color="#ffffff"
                />
              </LinearGradient>
            </View>
          ) : (
            <View style={[
              styles.inactiveIconContainer,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
            ]}>
              <Ionicons
                name={config.iconOutline}
                size={22}
                color={inactiveColor}
              />
            </View>
          )}
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

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDarkMode ? '#0c0c0c' : '#ffffff',
        borderTopColor: isDarkMode ? '#1f1f1f' : '#f0f0f0',
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

      {Platform.OS === 'ios' && <View style={styles.safeArea} />}
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
    paddingBottom: Platform.OS === 'ios' ? 6 : 12,
    paddingHorizontal: 8,
  },
  safeArea: {
    height: 22,
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
  activeIconContainer: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeIconBg: {
    width: 46,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveIconContainer: {
    width: 46,
    height: 34,
    borderRadius: 12,
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
