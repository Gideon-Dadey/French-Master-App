import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { getThemeColors, themeShadows } from '../src/utils/organicTheme';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const { isAuthenticated } = useAuth();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Main');
      return;
    }
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 10, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 40, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [isAuthenticated]);

  return (
    <View style={[styles.container, { backgroundColor: '#F8F6F3' }]}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Main Content Area */}
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          <View style={styles.brandWrapper}>
            <View style={styles.topArea}>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.appName}>FRENCH MASTER</Text>
            </View>
          </View>

          {/* Hero Text */}
          <View style={styles.textWrapper}>
            <Text style={styles.title}>Master French with Elegance</Text>
            <Text style={styles.subtitle}>
              Professional and Modern.{"\n"}Clear and Clean.
            </Text>
          </View>
        </Animated.View>

        {/* Bottom Actions */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.replace('Onboarding')}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          >
            <Text style={styles.secondaryBtnText}>Sign In to your account</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 50,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandWrapper: {
    alignItems: 'center',
    marginBottom: 60, // Increased spacing for grandeur
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: '#C9A227', // Golden glow to match the brand
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 12,
  },
  logo: {
    width: 160, // Larger size to showcase the detail in the new masterpiece
    height: 160,
  },
  topArea: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A6578',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E3A5F',
    letterSpacing: 8,
    textTransform: 'uppercase',
  },
  heroWrapper: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  circleBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8EDF1',
    borderRadius: 120,
    opacity: 0.8,
  },
  textWrapper: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1E3A5F',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 18,
    color: '#1E3A5F',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
    opacity: 0.8,
    maxWidth: 280,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A5F',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 12,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 10,
  },
  secondaryBtnText: {
    color: '#6A7E91',
    fontSize: 16,
    fontWeight: '600',
  },
});
