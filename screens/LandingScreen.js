import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const features = [
    {
      icon: 'school',
      title: 'Expert Instructors',
      description: 'Learn from certified language experts',
      gradient: ['#10B981', '#059669'],
    },
    {
      icon: 'play-circle',
      title: 'Interactive Lessons',
      description: 'Engaging video lessons with quizzes',
      gradient: ['#3B82F6', '#2563EB'],
    },
    {
      icon: 'trophy',
      title: 'Exam Preparation',
      description: 'Comprehensive DELF, DALF prep',
      gradient: ['#F59E0B', '#D97706'],
    },
    {
      icon: 'people',
      title: 'Community',
      description: 'Connect with fellow learners',
      gradient: ['#8B5CF6', '#6366F1'],
    },
  ];

  const stats = [
    { value: '10K+', label: 'Students', icon: 'people' },
    { value: '50+', label: 'Courses', icon: 'book' },
    { value: '98%', label: 'Success', icon: 'trophy' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B', '#0F172A']} style={styles.gradient}>

        <View style={styles.bgDecor1} />
        <View style={styles.bgDecor2} />
        <View style={styles.bgDecor3} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <Animated.View
            style={[
              styles.logoSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
            ]}
          >
            <View style={styles.logoWrapper}>
              <LinearGradient colors={['#3B82F6', '#8B5CF6', '#EC4899']} style={styles.logoRingOuter}>
                <View style={styles.logoRingInner}>
                  <Image source={require('../assets/logo.jpeg')} style={styles.logo} resizeMode="contain" />
                </View>
              </LinearGradient>

              <Animated.View style={[styles.animatedRing, { transform: [{ scale: pulseAnim }] }]} />
            </View>

            <Text style={styles.appName}>L'Alliance</Text>
            <View style={styles.taglineContainer}>
              <View style={styles.frenchFlag}>
                <View style={[styles.flagStripe, { backgroundColor: '#0055A4' }]} />
                <View style={[styles.flagStripe, { backgroundColor: '#FFFFFF' }]} />
                <View style={[styles.flagStripe, { backgroundColor: '#EF4135' }]} />
              </View>
              <Text style={styles.tagline}>Learn French • Apprendre Anglais</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.welcomeSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.welcomeText}>Welcome!</Text>
            <Text style={styles.description}>
              Your gateway to mastering French and English languages.{'\n'}
              Start your learning journey today.
            </Text>
          </Animated.View>

          <Animated.View style={[styles.statsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.statIconContainer}>
                  <Ionicons name={stat.icon} size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </Animated.View>

          <Animated.View style={[styles.featuresContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </View>
          </Animated.View>

          <Animated.View style={[styles.actions, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: pulseAnim }] }]}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.replace('Main')} activeOpacity={0.9}>
              <LinearGradient colors={['#3B82F6', '#8B5CF6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButtonGradient}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <View style={styles.arrowContainer}>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.secondaryActions, { opacity: fadeAnim }]}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Auth', { screen: 'Login' })} activeOpacity={0.7}>
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
              <Text style={styles.secondaryButtonText}>I already have an account</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.trustSection, { opacity: fadeAnim }]}>
            <View style={styles.trustBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.trustText}>Secure</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.trustText}>4.9 Rating</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="ribbon" size={16} color="#8B5CF6" />
              <Text style={styles.trustText}>Certified</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function FeatureCard({ feature, index }) {
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardAnim, { toValue: 1, duration: 600, delay: index * 100, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureCard,
        { opacity: cardAnim, transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] },
      ]}
    >
      <LinearGradient colors={feature.gradient} style={styles.featureIconContainer}>
        <Ionicons name={feature.icon} size={24} color="#FFFFFF" />
      </LinearGradient>
      <Text style={styles.featureTitle}>{feature.title}</Text>
      <Text style={styles.featureDescription}>{feature.description}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  bgDecor1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#3B82F6',
    opacity: 0.08,
  },
  bgDecor2: {
    position: 'absolute',
    bottom: 200,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#8B5CF6',
    opacity: 0.08,
  },
  bgDecor3: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#EC4899',
    opacity: 0.06,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRingInner: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  animatedRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  frenchFlag: {
    flexDirection: 'row',
    width: 24,
    height: 16,
    borderRadius: 3,
    overflow: 'hidden',
  },
  flagStripe: {
    flex: 1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: -1,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  actions: {
    width: '100%',
    marginBottom: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActions: {
    marginBottom: 30,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  secondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    fontWeight: '600',
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  trustText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
});
