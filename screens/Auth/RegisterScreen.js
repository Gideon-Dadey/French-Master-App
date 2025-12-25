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

export default function RegisterScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { register } = useAuth();

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

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields (Name, Email, Password).');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords you entered do not match.');
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone,
        formData.role
      );

      if (result.success) {
        const parent = navigation.getParent();
        if (parent) {
          parent.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));
        }
      } else {
        Alert.alert('Registration Failed', result.message || 'An error occurred during registration.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.bgContainer}>
        <LinearGradient
          colors={isDarkMode ? ['#064e3b', '#000000'] : ['#ecfdf5', '#ffffff']}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.decorCircle, styles.circle1, { backgroundColor: isDarkMode ? '#10b98115' : '#d1fae550' }]} />
        <View style={[styles.decorCircle, styles.circle2, { backgroundColor: isDarkMode ? '#05966910' : '#a7f3d040' }]} />
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
              <View style={[styles.logoGlow, { shadowColor: isDarkMode ? '#10b981' : '#059669' }]} />
              <Image
                source={require('../../assets/logo.jpeg')}
                style={styles.logo}
              />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Join the Master</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Start your journey to French fluency today.
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
              <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>I AM JOINING AS</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    {
                      backgroundColor: formData.role === 'student' ? (isDarkMode ? '#059669' : '#10b981') : (isDarkMode ? '#2c2c2e' : '#f2f2f7'),
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'student' })}
                >
                  <Ionicons
                    name="school-outline"
                    size={20}
                    color={formData.role === 'student' ? '#FFFFFF' : (isDarkMode ? '#8e8e93' : '#636366')}
                  />
                  <Text style={[styles.roleBtnText, { color: formData.role === 'student' ? '#FFFFFF' : colors.text }]}>Student</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    {
                      backgroundColor: formData.role === 'instructor' ? (isDarkMode ? '#059669' : '#10b981') : (isDarkMode ? '#2c2c2e' : '#f2f2f7'),
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'instructor' })}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={formData.role === 'instructor' ? '#FFFFFF' : (isDarkMode ? '#8e8e93' : '#636366')}
                  />
                  <Text style={[styles.roleBtnText, { color: formData.role === 'instructor' ? '#FFFFFF' : colors.text }]}>Teacher</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>FULL NAME</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#2c2c2e' : '#f8f9fa',
                    borderColor: focusedInput === 'name' ? '#10b981' : 'transparent',
                    borderWidth: 1
                  }
                ]}
              >
                <Ionicons name="person-outline" size={20} color={focusedInput === 'name' ? '#10b981' : '#8e8e93'} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="John Doe"
                  placeholderTextColor="#8e8e93"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>EMAIL ADDRESS</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#2c2c2e' : '#f8f9fa',
                    borderColor: focusedInput === 'email' ? '#10b981' : 'transparent',
                    borderWidth: 1
                  }
                ]}
              >
                <Ionicons name="mail-outline" size={20} color={focusedInput === 'email' ? '#10b981' : '#8e8e93'} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="name@example.com"
                  placeholderTextColor="#8e8e93"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>PHONE (OPTIONAL)</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#2c2c2e' : '#f8f9fa',
                    borderColor: focusedInput === 'phone' ? '#10b981' : 'transparent',
                    borderWidth: 1
                  }
                ]}
              >
                <Ionicons name="call-outline" size={20} color={focusedInput === 'phone' ? '#10b981' : '#8e8e93'} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor="#8e8e93"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>PASSWORD</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#2c2c2e' : '#f8f9fa',
                    borderColor: focusedInput === 'password' ? '#10b981' : 'transparent',
                    borderWidth: 1
                  }
                ]}
              >
                <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? '#10b981' : '#8e8e93'} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor="#8e8e93"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8e8e93" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>CONFIRM PASSWORD</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDarkMode ? '#2c2c2e' : '#f8f9fa',
                    borderColor: focusedInput === 'confirm' ? '#10b981' : 'transparent',
                    borderWidth: 1
                  }
                ]}
              >
                <Ionicons name="shield-checkmark-outline" size={20} color={focusedInput === 'confirm' ? '#10b981' : '#8e8e93'} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor="#8e8e93"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setFocusedInput('confirm')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8e8e93" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={[styles.termsText, { color: colors.secondaryText }]}>
              By joining, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              Already a member?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInLink}>Sign In</Text>
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
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  logoGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 36,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 32,
    padding: 24,
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 4,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  registerButton: {
    height: 58,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.7,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  termsLink: {
    fontWeight: '700',
    color: '#10b981',
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
  signInLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10b981',
  },
});
