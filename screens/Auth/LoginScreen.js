import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { getThemeColors, themeShadows } from '../../src/utils/organicTheme';

const { width, height } = Dimensions.get('window');

// Elegant decorative blob
const DecorativeBlob = ({ style, colors }) => {
  return (
    <View style={style}>
      <Svg width="100%" height="100%" viewBox="0 0 200 200">
        <Defs>
          <RadialGradient id="blobGradLogin" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors[0]} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={colors[1]} stopOpacity="0.15" />
          </RadialGradient>
        </Defs>
        <Path
          d="M45.3,-51.2C58.4,-42.3,68.3,-27.4,71.7,-10.7C75.1,6,72,24.4,62.1,37.5C52.2,50.6,35.5,58.4,18.2,63.2C0.9,68,-16.9,69.8,-32.8,64C-48.7,58.2,-62.6,44.8,-70.2,28.1C-77.8,11.4,-79.1,-8.7,-72.3,-25.4C-65.5,-42.1,-50.6,-55.5,-34.6,-63.5C-18.6,-71.5,-1.5,-74.2,13.2,-69.5C27.9,-64.8,32.2,-60.1,45.3,-51.2Z"
          fill="url(#blobGradLogin)"
          transform="translate(100 100)"
        />
      </Svg>
    </View>
  );
};

// Floating accent dot
const FloatingAccent = ({ style, color, delay = 0 }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 3000, delay, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });

  return (
    <Animated.View style={[style, { transform: [{ translateY }] }]}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, opacity: 0.5 }} />
    </Animated.View>
  );
};

export default function LoginScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { login } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerSlide = useRef(new Animated.Value(-30)).current;
  const inputAnims = useRef([new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(fadeAnim, { toValue: 1, tension: 20, friction: 8, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, tension: 25, friction: 9, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 18, friction: 7, useNativeDriver: true }),
      ]),
      Animated.stagger(150, [
        Animated.spring(slideAnim, { toValue: 0, tension: 30, friction: 10, useNativeDriver: true }),
        ...inputAnims.map(anim =>
          Animated.spring(anim, { toValue: 1, tension: 40, friction: 10, useNativeDriver: true })
        ),
      ]),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter both your email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        const parent = navigation.getParent();
        if (parent) {
          parent.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            })
          );
        }
      } else {
        const message = result.message || 'Check your credentials and try again.';
        let alertTitle = 'Authentication Failed';
        let alertMessage = message;

        if (message.includes('network') || message.includes('Network')) {
          alertTitle = 'Connection Error';
          alertMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (message.includes('Invalid credentials') || message.includes('not found')) {
          alertMessage = 'Email or password is incorrect. Please try again.';
        }

        Alert.alert(alertTitle, alertMessage);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Background */}
      <View style={styles.bgContainer}>
        <LinearGradient
          colors={isDarkMode
            ? [theme.background, '#0A1219', theme.background]
            : [theme.background, '#F0EDE8', theme.background]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Decorative blobs */}
        <DecorativeBlob
          style={styles.blob1}
          colors={[theme.secondary, theme.accent]}
        />
        <DecorativeBlob
          style={styles.blob2}
          colors={[theme.accent, theme.primary]}
        />

        {/* Floating accents */}
        <FloatingAccent style={styles.accent1} color={theme.secondary} delay={0} />
        <FloatingAccent style={styles.accent2} color={theme.primary} delay={500} />
        <FloatingAccent style={styles.accent3} color={theme.secondary} delay={1000} />

        {/* Wave pattern */}
        <View style={styles.waveContainer}>
          <Svg width={width} height="120" viewBox={`0 0 ${width} 120`} style={styles.wave}>
            <Path
              d={`M0,60 C${width * 0.25},20 ${width * 0.5},100 ${width * 0.75},40 C${width},0 ${width},60 ${width},60 L${width},120 L0,120 Z`}
              fill={theme.primary + '10'}
            />
          </Svg>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.primary + '10' }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={theme.primary} />
          </TouchableOpacity>

          {/* Header Section */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: headerSlide }, { scale: scaleAnim }]
              }
            ]}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={[styles.logoRing, { borderColor: theme.secondary + '40' }]}>
                <View style={[styles.logoRingInner, { borderColor: theme.primary + '60' }]}>
                  <Image
                    source={require('../../assets/logo.jpeg')}
                    style={styles.logo}
                  />
                </View>
              </View>
              {/* Decorative dots */}
              <View style={[styles.logoDot, styles.logoDot1, { backgroundColor: theme.secondary }]} />
              <View style={[styles.logoDot, styles.logoDot2, { backgroundColor: theme.accent }]} />
              <View style={[styles.logoDot, styles.logoDot3, { backgroundColor: theme.primary }]} />
            </View>

            <Text style={[styles.greeting, { color: theme.secondary }]}>Bienvenue</Text>
            <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Continue your journey to fluency with us
            </Text>
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Email Input */}
            <Animated.View
              style={[
                styles.inputGroup,
                { opacity: inputAnims[0], transform: [{ translateX: inputAnims[0].interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }
              ]}
            >
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.surface,
                    borderColor: focusedInput === 'email' ? theme.primary : theme.border,
                  },
                  themeShadows.sm
                ]}
              >
                <View style={[styles.inputIconContainer, { backgroundColor: focusedInput === 'email' ? theme.primary + '15' : 'transparent' }]}>
                  <Ionicons name="mail-outline" size={18} color={focusedInput === 'email' ? theme.primary : theme.textSecondary} />
                </View>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="your@email.com"
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </Animated.View>

            {/* Password Input */}
            <Animated.View
              style={[
                styles.inputGroup,
                { opacity: inputAnims[1], transform: [{ translateX: inputAnims[1].interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }
              ]}
            >
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Password</Text>
                <TouchableOpacity onPress={() => Alert.alert('Reset Password', 'A reset link will be sent to your email.')}>
                  <Text style={[styles.forgotLink, { color: theme.secondary }]}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.surface,
                    borderColor: focusedInput === 'password' ? theme.primary : theme.border,
                  },
                  themeShadows.sm
                ]}
              >
                <View style={[styles.inputIconContainer, { backgroundColor: focusedInput === 'password' ? theme.primary + '15' : 'transparent' }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={focusedInput === 'password' ? theme.primary : theme.textSecondary} />
                </View>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[theme.primary, theme.primaryLight || theme.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <View style={styles.buttonIconContainer}>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={[styles.dividerIcon, { backgroundColor: theme.background }]}>
                <Ionicons name="sparkles" size={16} color={theme.secondary} />
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>

            {/* Social Login */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
                <Ionicons name="logo-apple" size={20} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.surface, borderColor: theme.border }, themeShadows.sm]}>
                <Ionicons name="logo-facebook" size={20} color="#4267B2" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              New to L'Alliance?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.signUpLink, { color: theme.primary }]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Decoration */}
          <View style={styles.footerDecor}>
            <View style={[styles.decorLine, { backgroundColor: theme.border }]} />
            <Ionicons name="school-outline" size={18} color={theme.textMuted} />
            <View style={[styles.decorLine, { backgroundColor: theme.border }]} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 280,
    height: 280,
    opacity: 0.6,
  },
  blob2: {
    position: 'absolute',
    bottom: 100,
    left: -100,
    width: 250,
    height: 250,
    opacity: 0.4,
  },
  accent1: {
    position: 'absolute',
    top: 120,
    right: 30,
  },
  accent2: {
    position: 'absolute',
    top: 280,
    left: 20,
  },
  accent3: {
    position: 'absolute',
    bottom: 200,
    right: 50,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 40,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logoRing: {
    padding: 6,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  logoRingInner: {
    padding: 4,
    borderRadius: 44,
    borderWidth: 2,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  logoDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  logoDot1: {
    top: -2,
    right: 10,
  },
  logoDot2: {
    bottom: 5,
    left: -5,
  },
  logoDot3: {
    top: 40,
    right: -8,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  formCard: {
    gap: 22,
  },
  inputGroup: {
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginLeft: 2,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    borderRadius: 18,
    paddingHorizontal: 6,
    paddingRight: 14,
    gap: 8,
    borderWidth: 1.5,
  },
  inputIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 6,
  },
  loginButton: {
    height: 58,
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 6,
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
  },
  socialButton: {
    width: 58,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
  },
  signUpLink: {
    fontSize: 15,
    fontWeight: '700',
  },
  footerDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 12,
  },
  decorLine: {
    width: 40,
    height: 1,
  },
});
