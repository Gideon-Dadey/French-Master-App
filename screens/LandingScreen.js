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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { getThemeColors, themeShadows } from '../src/utils/organicTheme';

const { width } = Dimensions.get('window');

// Organic Background Blob
const Blob = ({ color, style }) => (
  <View style={[
    {
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: color,
      opacity: 0.08,
      transform: [{ scale: 1.5 }],
    },
    style
  ]} />
);

export default function LandingScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 30, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Organic Background Elements */}
      <Blob color={theme.secondary} style={{ top: -100, right: -120 }} />
      <Blob color={theme.primary} style={{ bottom: 100, left: -150, width: 400, height: 400, borderRadius: 200 }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Logo - Centered */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={[styles.logoContainer, themeShadows.md]}>
            <Image source={require('../assets/logo.jpeg')} style={styles.headerLogo} resizeMode="contain" />
          </View>
          <Text style={[styles.headerAppName, { color: theme.text }]}>L'Alliance</Text>
        </Animated.View>

        {/* Hero Section */}
        <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Master French.
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            The most immersive, organic way to learn languages. Join a global community of learners today.
          </Text>
        </Animated.View>

        {/* Features / Value Props */}
        <Animated.View style={[styles.featuresSection, { opacity: fadeAnim }]}>
          <FeatureRow icon="chatbubbles-outline" text="Real-time conversations" theme={theme} />
          <FeatureRow icon="ribbon-outline" text="Certified curriculum" theme={theme} />
          <FeatureRow icon="game-controller-outline" text="Gamified learning path" theme={theme} />
        </Animated.View>

        <View style={{ flex: 1 }} />

        {/* Bottom Actions */}
        <Animated.View style={[styles.bottomActions, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }, themeShadows.md]}
            onPress={() => navigation.replace('Main')}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          >
            <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>I already have an account</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function FeatureRow({ icon, text, theme }) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureIcon, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
        <Ionicons name={icon} size={18} color={theme.primary} />
      </View>
      <Text style={[styles.featureText, { color: theme.textSecondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 28,
    paddingBottom: 50,
    alignItems: 'center', // Center everything by default
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  headerLogo: {
    width: 90,
    height: 90,
    borderRadius: 20,
  },
  headerAppName: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  hero: {
    marginBottom: 60,
    alignItems: 'center',
    width: '100%',
  },
  heroTitle: {
    fontSize: 42, // Slightly smaller since "Unleash Potential" is gone, but still big
    fontWeight: '800',
    lineHeight: 50,
    letterSpacing: -1,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    lineHeight: 28,
    maxWidth: '90%',
    fontWeight: '400',
    textAlign: 'center',
  },
  featuresSection: {
    gap: 20,
    marginBottom: 60,
    width: '100%',
    alignItems: 'center', // Center the rows? Or left align them?
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 320, // Constrain width for nice centering
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomActions: {
    gap: 20,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 99,
    gap: 10,
    width: '100%',
    maxWidth: 320,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
