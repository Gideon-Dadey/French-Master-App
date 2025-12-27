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
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { premiumShadows, premiumColors } from '../../src/utils/premiumDesign';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { login } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 15,
        friction: 6,
        useNativeDriver: true,
      }),
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
        
        // Provide helpful messages for different error types
        let alertTitle = 'Authentication Failed';
        let alertMessage = message;
        
        if (message.includes('network') || message.includes('Network')) {
          alertTitle = 'Connection Error';
          alertMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (message.includes('Invalid credentials') || message.includes('not found')) {
          alertMessage = 'Email or password is incorrect. Please try again.';
        }
        
        Alert.alert(alertTitle, alertMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'An unexpected error occurred.';
      Alert.alert('Error', errorMessage + '\n\nPlease check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.bgContainer}>
        <LinearGradient
          colors={isDarkMode ? ['#1e1b4b', '#000000'] : ['#eff6ff', '#ffffff']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.decorCircle, styles.circle1, { backgroundColor: isDarkMode ? '#4338ca20' : '#bfdbfe50' }]} />
        <View style={[styles.decorCircle, styles.circle2, { backgroundColor: isDarkMode ? '#6366f115' : '#dbeafe40' }]} />
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

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: isDarkMode ? '#1c1c1e' : '#f2f2f7' }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoWrapper}>
              <View style={[styles.logoGlow, { shadowColor: isDarkMode ? '#6366f1' : '#3b82f6' }]} />
              <Image
                source={require('../../assets/logo.jpeg')}
                style={styles.logo}
              />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Master French with the world's finest educators.
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formCard,
              {
                backgroundColor: isDarkMode ? '#1c1c1e' : '#ffffff',
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              },
              premiumShadows.lg
            ]}
          >

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>EMAIL ADDRESS</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#2c2c2e' : '#f8f9fa',
                    borderColor: focusedInput === 'email' ? '#6366f1' : 'transparent',
                    borderWidth: 1
                  }
                ]}
              >
                <Ionicons name="mail-outline" size={20} color={focusedInput === 'email' ? '#6366f1' : '#8e8e93'} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="name@example.com"
                  placeholderTextColor="#8e8e93"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>PASSWORD</Text>
                <TouchableOpacity onPress={() => Alert.alert('Reset Password', 'A reset link will be sent to your email.')}>
                  <Text style={styles.forgotLink}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#2c2c2e' : '#f8f9fa',
                    borderColor: focusedInput === 'password' ? '#6366f1' : 'transparent',
                    borderWidth: 1
                  }
                ]}
              >
                <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? '#6366f1' : '#8e8e93'} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor="#8e8e93"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8e8e93" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#6366f1', '#4f46e5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: isDarkMode ? '#3a3a3c' : '#e5e5ea' }]} />
              <Text style={[styles.dividerText, { color: '#8e8e93' }]}>OR CONTINUE WITH</Text>
              <View style={[styles.divider, { backgroundColor: isDarkMode ? '#3a3a3c' : '#e5e5ea' }]} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDarkMode ? '#2c2c2e' : '#f2f2f7' }]}>
                <Ionicons name="logo-google" size={22} color={isDarkMode ? '#ffffff' : '#000000'} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDarkMode ? '#2c2c2e' : '#f2f2f7' }]}>
                <Ionicons name="logo-apple" size={22} color={isDarkMode ? '#ffffff' : '#000000'} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDarkMode ? '#2c2c2e' : '#f2f2f7' }]}>
                <Ionicons name="logo-facebook" size={22} color="#1877F2" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              New to French Master?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signUpLink}>Create Account</Text>
            </TouchableOpacity>
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
  decorCircle: {
    position: 'absolute',
    borderRadius: 200,
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  logoGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  formCard: {
    borderRadius: 32,
    padding: 24,
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 58,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    height: 58,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.7,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 60,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#6366f1',
  },
});
