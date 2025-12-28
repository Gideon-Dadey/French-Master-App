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
          <RadialGradient id="blobGradRegister" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors[0]} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={colors[1]} stopOpacity="0.15" />
          </RadialGradient>
        </Defs>
        <Path
          d="M39.5,-48.1C52.9,-39.2,66.5,-28.4,72.2,-13.9C77.9,0.7,75.8,19,67.4,33.4C59,47.8,44.4,58.3,28.4,64.2C12.5,70.1,-4.9,71.4,-21.3,67.1C-37.7,62.8,-53.2,52.9,-62.7,38.7C-72.3,24.5,-75.9,6,-72.4,-10.5C-68.9,-27,-58.3,-41.4,-44.9,-50.3C-31.5,-59.2,-15.7,-62.6,-1,-61.4C13.8,-60.2,27.6,-58.4,39.5,-48.1Z"
          fill="url(#blobGradRegister)"
          transform="translate(100 100)"
        />
      </Svg>
    </View>
  );
};

// Floating accent element
const FloatingAccent = ({ style, delay = 0, color }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 4000, delay, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <Animated.View style={[style, { transform: [{ translateY }] }]}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, opacity: 0.5 }} />
    </Animated.View>
  );
};

export default function RegisterScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const theme = getThemeColors(isDarkMode);
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerSlide = useRef(new Animated.Value(-30)).current;
  const inputAnims = useRef([
    new Animated.Value(0), new Animated.Value(0), new Animated.Value(0),
    new Animated.Value(0), new Animated.Value(0), new Animated.Value(0),
  ]).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(fadeAnim, { toValue: 1, tension: 20, friction: 8, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, tension: 25, friction: 9, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 18, friction: 7, useNativeDriver: true }),
      ]),
      Animated.stagger(100, [
        Animated.spring(slideAnim, { toValue: 0, tension: 30, friction: 10, useNativeDriver: true }),
        ...inputAnims.map(anim =>
          Animated.spring(anim, { toValue: 1, tension: 40, friction: 10, useNativeDriver: true })
        ),
      ]),
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

  const renderInput = (config, index) => {
    const { key, label, icon, placeholder, keyboardType, isPassword, showToggle, toggleValue, onToggle, optional } = config;

    return (
      <Animated.View
        key={key}
        style={[
          styles.inputGroup,
          {
            opacity: inputAnims[index],
            transform: [{ translateX: inputAnims[index].interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
          }
        ]}
      >
        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
          {label} {optional && <Text style={{ opacity: 0.6 }}>(Optional)</Text>}
        </Text>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.surface,
              borderColor: focusedInput === key ? theme.primary : theme.border,
            },
            themeShadows.sm
          ]}
        >
          <View style={[styles.inputIconContainer, { backgroundColor: focusedInput === key ? theme.primary + '15' : 'transparent' }]}>
            <Ionicons name={icon} size={18} color={focusedInput === key ? theme.primary : theme.textSecondary} />
          </View>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder={placeholder}
            placeholderTextColor={theme.textMuted}
            value={formData[key]}
            onChangeText={(text) => setFormData({ ...formData, [key]: text })}
            keyboardType={keyboardType || 'default'}
            autoCapitalize={key === 'email' ? 'none' : key === 'name' ? 'words' : 'none'}
            secureTextEntry={isPassword && !toggleValue}
            onFocus={() => setFocusedInput(key)}
            onBlur={() => setFocusedInput(null)}
          />
          {showToggle && (
            <TouchableOpacity onPress={onToggle} style={styles.eyeButton}>
              <Ionicons name={toggleValue ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
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
          colors={[theme.primary, theme.accent]}
        />

        {/* Floating accents */}
        <FloatingAccent style={styles.accent1} delay={0} color={theme.secondary} />
        <FloatingAccent style={styles.accent2} delay={800} color={theme.primary} />
        <FloatingAccent style={styles.accent3} delay={1600} color={theme.secondary} />

        {/* Wave pattern */}
        <View style={styles.waveContainer}>
          <Svg width={width} height="100" viewBox={`0 0 ${width} 100`} style={styles.wave}>
            <Path
              d={`M0,50 Q${width * 0.25},20 ${width * 0.5},50 T${width},50 L${width},100 L0,100 Z`}
              fill={theme.primary + '08'}
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
              <View style={[styles.logoFrame, { backgroundColor: theme.secondary + '15' }]}>
                <View style={[styles.logoInner, { borderColor: theme.primary + '40' }]}>
                  <Image
                    source={require('../../assets/logo.jpeg')}
                    style={styles.logo}
                  />
                </View>
              </View>
              {/* Decorative dots */}
              <View style={[styles.logoDot, styles.logoDot1, { backgroundColor: theme.secondary }]} />
              <View style={[styles.logoDot, styles.logoDot2, { backgroundColor: theme.primary }]} />
            </View>

            <Text style={[styles.greeting, { color: theme.secondary }]}>Commencer</Text>
            <Text style={[styles.title, { color: theme.text }]}>Join the Journey</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Begin your path to L'Alliance fluency today
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
            {/* Role Selection */}
            <Animated.View
              style={[
                styles.inputGroup,
                { opacity: inputAnims[0], transform: [{ translateX: inputAnims[0].interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }
              ]}
            >
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>I am joining as</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    formData.role === 'student' && styles.roleBtnActive,
                    {
                      backgroundColor: formData.role === 'student'
                        ? theme.primary
                        : theme.surface,
                      borderColor: formData.role === 'student' ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'student' })}
                >
                  <Ionicons
                    name="school-outline"
                    size={20}
                    color={formData.role === 'student' ? '#FFFFFF' : theme.textSecondary}
                  />
                  <Text style={[
                    styles.roleBtnText,
                    { color: formData.role === 'student' ? '#FFFFFF' : theme.text }
                  ]}>Student</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    formData.role === 'instructor' && styles.roleBtnActive,
                    {
                      backgroundColor: formData.role === 'instructor'
                        ? theme.secondary
                        : theme.surface,
                      borderColor: formData.role === 'instructor' ? theme.secondary : theme.border,
                    }
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'instructor' })}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={formData.role === 'instructor' ? '#FFFFFF' : theme.textSecondary}
                  />
                  <Text style={[
                    styles.roleBtnText,
                    { color: formData.role === 'instructor' ? '#FFFFFF' : theme.text }
                  ]}>Teacher</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Input Fields */}
            {renderInput({ key: 'name', label: 'Full Name', icon: 'person-outline', placeholder: 'Your full name' }, 1)}
            {renderInput({ key: 'email', label: 'Email Address', icon: 'mail-outline', placeholder: 'your@email.com', keyboardType: 'email-address' }, 2)}
            {renderInput({ key: 'phone', label: 'Phone Number', icon: 'call-outline', placeholder: '+1 (555) 000-0000', keyboardType: 'phone-pad', optional: true }, 3)}
            {renderInput({
              key: 'password', label: 'Password', icon: 'lock-closed-outline', placeholder: '••••••••',
              isPassword: true, showToggle: true, toggleValue: showPassword, onToggle: () => setShowPassword(!showPassword)
            }, 4)}
            {renderInput({
              key: 'confirmPassword', label: 'Confirm Password', icon: 'shield-checkmark-outline', placeholder: '••••••••',
              isPassword: true, showToggle: true, toggleValue: showConfirmPassword, onToggle: () => setShowConfirmPassword(!showConfirmPassword)
            }, 5)}

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
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
                    <Text style={styles.registerButtonText}>Create Account</Text>
                    <View style={styles.buttonIconContainer}>
                      <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={[styles.termsText, { color: theme.textSecondary }]}>
              By joining, you agree to our{' '}
              <Text style={[styles.termsLink, { color: theme.primary }]}>Terms of Service</Text> and{' '}
              <Text style={[styles.termsLink, { color: theme.primary }]}>Privacy Policy</Text>.
            </Text>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Already a member?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.signInLink, { color: theme.primary }]}>Sign In</Text>
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
    top: -60,
    right: -80,
    width: 260,
    height: 260,
    opacity: 0.5,
  },
  blob2: {
    position: 'absolute',
    bottom: 150,
    left: -100,
    width: 220,
    height: 220,
    opacity: 0.35,
  },
  accent1: {
    position: 'absolute',
    top: 100,
    right: 25,
  },
  accent2: {
    position: 'absolute',
    top: 220,
    left: 15,
  },
  accent3: {
    position: 'absolute',
    bottom: 250,
    right: 40,
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
    paddingHorizontal: 26,
    paddingTop: Platform.OS === 'ios' ? 55 : 40,
    paddingBottom: 40,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logoFrame: {
    padding: 8,
    borderRadius: 40,
  },
  logoInner: {
    padding: 3,
    borderRadius: 36,
    borderWidth: 2,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 32,
  },
  logoDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  logoDot1: {
    top: 0,
    right: 5,
  },
  logoDot2: {
    bottom: 5,
    left: 0,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  formCard: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginLeft: 2,
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
    height: 52,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1.5,
  },
  roleBtnActive: {
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
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
    paddingHorizontal: 6,
    paddingRight: 14,
    gap: 8,
    borderWidth: 1.5,
  },
  inputIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 6,
  },
  registerButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
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
    gap: 10,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  termsLink: {
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
  },
  decorLine: {
    width: 35,
    height: 1,
  },
});
