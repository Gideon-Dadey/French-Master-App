import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 90 : 72;
const ICON_SIZE = 22;

const tabConfig = {
  Home: { icon: 'home', label: 'Home', gradient: ['#3B82F6', '#2563EB'] },
  Learn: { icon: 'book', label: 'Learn', gradient: ['#8B5CF6', '#7C3AED'] },
  Practice: { icon: 'fitness', label: 'Practice', gradient: ['#F59E0B', '#D97706'] },
  Community: { icon: 'people', label: 'Community', gradient: ['#10B981', '#059669'] },
  Profile: { icon: 'person', label: 'Profile', gradient: ['#EC4899', '#DB2777'] },
};

function TabBarItem({ route, focused, onPress, onLongPress, colors, isDarkMode }) {
  const { user } = useAuth();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const config = tabConfig[route.name] || { icon: 'ellipse', label: route.name, gradient: ['#6B7280', '#4B5563'] };

  useEffect(() => {
    if (focused) {
      // Bounce animation when selected
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 200,
          friction: 10,
        }),
      ]).start();
      
      Animated.spring(bounceAnim, {
        toValue: -8,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }).start();
      
      Animated.spring(bounceAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }).start();
    }
  }, [focused]);

  const handlePress = () => {
    onPress();
  };

  const isProfile = route.name === 'Profile';
  const showAvatar = isProfile && user?.avatar;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={config.label}
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.tabContent,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: bounceAnim },
            ],
          },
        ]}
      >
        {focused ? (
          <View style={styles.activeTabContainer}>
            <LinearGradient
              colors={config.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activeIconBg}
            >
              {showAvatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarActive} />
              ) : (
                <Ionicons name={config.icon} size={ICON_SIZE} color="#FFFFFF" />
              )}
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.inactiveTabContainer}>
            <View style={[styles.inactiveIconBg, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              {showAvatar ? (
                <Image source={{ uri: user.avatar }} style={[styles.avatarInactive, { borderColor: isDarkMode ? '#374151' : '#E5E7EB' }]} />
              ) : (
                <Ionicons
                  name={`${config.icon}-outline`}
                  size={ICON_SIZE}
                  color={isDarkMode ? '#6B7280' : '#9CA3AF'}
                />
              )}
            </View>
          </View>
        )}
      </Animated.View>
      
      {/* Label */}
      <Text
        style={[
          styles.label,
          focused ? styles.labelActive : styles.labelInactive,
          { color: focused ? config.gradient[0] : (isDarkMode ? '#6B7280' : '#9CA3AF') }
        ]}
      >
        {config.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, descriptors, navigation }) {
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: isDarkMode ? '#111827' : '#FFFFFF',
        borderTopColor: isDarkMode ? '#1F2937' : '#F3F4F6',
      }
    ]}>
      {/* Gradient accent line at top */}
      <LinearGradient
        colors={['#3B82F6', '#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topAccent}
      />
      
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
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
              colors={colors}
              isDarkMode={isDarkMode}
            />
          );
        })}
      </View>
      
      {/* Home indicator safe area for iOS */}
      {Platform.OS === 'ios' && <View style={styles.homeIndicatorSpacer} />}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 24,
  },
  topAccent: {
    height: 2,
    width: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingTop: 8,
    paddingHorizontal: 8,
    height: Platform.OS === 'ios' ? 60 : 58,
  },
  homeIndicatorSpacer: {
    height: 24,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabContainer: {
    alignItems: 'center',
  },
  inactiveTabContainer: {
    alignItems: 'center',
  },
  activeIconBg: {
    width: 46,
    height: 46,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  inactiveIconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '700',
  },
  labelInactive: {
    fontWeight: '500',
  },
});
