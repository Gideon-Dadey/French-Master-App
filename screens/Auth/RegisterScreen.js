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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { spacing, fontSize } from '../../src/utils/responsive';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../../src/utils/premiumDesign';

export default function RegisterScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student', // Default to student
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { register } = useAuth();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.phone,
      formData.role
    );
    setLoading(false);

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
      Alert.alert('Registration Failed', result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={isDarkMode 
          ? ['#1a0a2e', '#16213e', '#0f3460']
          : ['#F5F7FA', '#FFFFFF', '#FFFFFF']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Premium Header */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: premiumColors.primary.main + '20' }]}>
                <Ionicons name="person-add" size={40} color={premiumColors.primary.main} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Create Your Account</Text>
              <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                Choose how you'd like to join us
              </Text>
            </View>

            {/* Premium Form */}
            <View style={styles.form}>
              {/* Role Selection - Moved to Top for Clarity */}
              <View style={styles.inputWrapper}>
                <View style={styles.roleHeader}>
                  <Text style={[styles.roleSectionTitle, { color: colors.text }]}>I am joining as</Text>
                  <Text style={[styles.roleSectionSubtitle, { color: colors.secondaryText }]}>
                    Select the option that best describes you
                  </Text>
                </View>
                <View style={styles.roleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.roleCard,
                      {
                        backgroundColor: formData.role === 'student' 
                          ? colors.card 
                          : colors.card,
                        borderColor: formData.role === 'student' 
                          ? premiumColors.primary.main 
                          : colors.border,
                        borderWidth: formData.role === 'student' ? 2.5 : 1,
                      },
                      formData.role === 'student' && premiumShadows.md,
                      formData.role !== 'student' && premiumShadows.sm,
                    ]}
                    onPress={() => setFormData({ ...formData, role: 'student' })}
                    activeOpacity={0.8}
                  >
                    {formData.role === 'student' && (
                      <LinearGradient
                        colors={[premiumColors.primary.main + '15', premiumColors.primary.main + '05']}
                        style={styles.roleGradient}
                      />
                    )}
                    <View style={styles.roleCardContent}>
                      <View style={[
                        styles.roleIconWrapper,
                        { 
                          backgroundColor: formData.role === 'student' 
                            ? premiumColors.primary.main 
                            : premiumColors.primary.main + '20'
                        }
                      ]}>
                        <Ionicons 
                          name="school" 
                          size={28} 
                          color={formData.role === 'student' ? '#FFFFFF' : premiumColors.primary.main}
                        />
                      </View>
                      <View style={styles.roleTextContainer}>
                        <View style={styles.roleTitleRow}>
                          <Text style={[styles.roleTitle, { color: colors.text }]}>Student</Text>
                          {formData.role === 'student' && (
                            <View style={[styles.selectedBadge, { backgroundColor: premiumColors.primary.main }]}>
                              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                            </View>
                          )}
                        </View>
                        <Text style={[styles.roleDescription, { color: colors.secondaryText }]}>
                          I want to learn French and English through courses
                        </Text>
                        <View style={styles.roleFeatures}>
                          <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={14} color={formData.role === 'student' ? premiumColors.primary.main : colors.secondaryText} />
                            <Text style={[styles.featureText, { color: colors.secondaryText }]}>Access all courses</Text>
                          </View>
                          <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={14} color={formData.role === 'student' ? premiumColors.primary.main : colors.secondaryText} />
                            <Text style={[styles.featureText, { color: colors.secondaryText }]}>Track your progress</Text>
                          </View>
                          <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={14} color={formData.role === 'student' ? premiumColors.primary.main : colors.secondaryText} />
                            <Text style={[styles.featureText, { color: colors.secondaryText }]}>Earn certificates</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleCard,
                      {
                        backgroundColor: formData.role === 'instructor' 
                          ? colors.card 
                          : colors.card,
                        borderColor: formData.role === 'instructor' 
                          ? premiumColors.accent.emerald 
                          : colors.border,
                        borderWidth: formData.role === 'instructor' ? 2.5 : 1,
                      },
                      formData.role === 'instructor' && premiumShadows.md,
                      formData.role !== 'instructor' && premiumShadows.sm,
                    ]}
                    onPress={() => setFormData({ ...formData, role: 'instructor' })}
                    activeOpacity={0.8}
                  >
                    {formData.role === 'instructor' && (
                      <LinearGradient
                        colors={[premiumColors.accent.emerald + '15', premiumColors.accent.emerald + '05']}
                        style={styles.roleGradient}
                      />
                    )}
                    <View style={styles.roleCardContent}>
                      <View style={[
                        styles.roleIconWrapper,
                        { 
                          backgroundColor: formData.role === 'instructor' 
                            ? premiumColors.accent.emerald 
                            : premiumColors.accent.emerald + '20'
                        }
                      ]}>
                        <Ionicons 
                          name="person" 
                          size={28} 
                          color={formData.role === 'instructor' ? '#FFFFFF' : premiumColors.accent.emerald}
                        />
                      </View>
                      <View style={styles.roleTextContainer}>
                        <View style={styles.roleTitleRow}>
                          <Text style={[styles.roleTitle, { color: colors.text }]}>Instructor</Text>
                          {formData.role === 'instructor' && (
                            <View style={[styles.selectedBadge, { backgroundColor: premiumColors.accent.emerald }]}>
                              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                            </View>
                          )}
                        </View>
                        <Text style={[styles.roleDescription, { color: colors.secondaryText }]}>
                          I want to teach and create courses for students
                        </Text>
                        <View style={styles.roleFeatures}>
                          <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={14} color={formData.role === 'instructor' ? premiumColors.accent.emerald : colors.secondaryText} />
                            <Text style={[styles.featureText, { color: colors.secondaryText }]}>Create courses</Text>
                          </View>
                          <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={14} color={formData.role === 'instructor' ? premiumColors.accent.emerald : colors.secondaryText} />
                            <Text style={[styles.featureText, { color: colors.secondaryText }]}>Manage students</Text>
                          </View>
                          <View style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={14} color={formData.role === 'instructor' ? premiumColors.accent.emerald : colors.secondaryText} />
                            <Text style={[styles.featureText, { color: colors.secondaryText }]}>Earn revenue</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.sectionDivider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.secondaryText }]}>Your Information</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              {/* Name Input */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: focusedInput === 'name' 
                        ? premiumColors.primary.main 
                        : colors.border,
                      borderWidth: focusedInput === 'name' ? 2 : 1,
                    },
                    premiumShadows.sm,
                  ]}
                >
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={focusedInput === 'name' ? premiumColors.primary.main : colors.secondaryText} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Email *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: focusedInput === 'email' 
                        ? premiumColors.primary.main 
                        : colors.border,
                      borderWidth: focusedInput === 'email' ? 2 : 1,
                    },
                    premiumShadows.sm,
                  ]}
                >
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={focusedInput === 'email' ? premiumColors.primary.main : colors.secondaryText} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* Phone Input */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Phone (Optional)</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: focusedInput === 'phone' 
                        ? premiumColors.primary.main 
                        : colors.border,
                      borderWidth: focusedInput === 'phone' ? 2 : 1,
                    },
                    premiumShadows.sm,
                  ]}
                >
                  <Ionicons 
                    name="call-outline" 
                    size={20} 
                    color={focusedInput === 'phone' ? premiumColors.primary.main : colors.secondaryText} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter your phone number"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    keyboardType="phone-pad"
                    onFocus={() => setFocusedInput('phone')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Password *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: focusedInput === 'password' 
                        ? premiumColors.primary.main 
                        : colors.border,
                      borderWidth: focusedInput === 'password' ? 2 : 1,
                    },
                    premiumShadows.sm,
                  ]}
                >
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={focusedInput === 'password' ? premiumColors.primary.main : colors.secondaryText} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Create a password"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={colors.secondaryText}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm Password *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: focusedInput === 'confirmPassword' 
                        ? premiumColors.primary.main 
                        : colors.border,
                      borderWidth: focusedInput === 'confirmPassword' ? 2 : 1,
                    },
                    premiumShadows.sm,
                  ]}
                >
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={focusedInput === 'confirmPassword' ? premiumColors.primary.main : colors.secondaryText} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    secureTextEntry={!showConfirmPassword}
                    onFocus={() => setFocusedInput('confirmPassword')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={colors.secondaryText}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonDisabled, premiumShadows.md]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[premiumColors.primary.main, premiumColors.primary.dark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.registerButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.registerButtonText}>Create Account</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Sign In Link */}
              <View style={styles.loginContainer}>
                <Text style={[styles.loginText, { color: colors.secondaryText }]}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                  <Text style={[styles.loginLink, { color: premiumColors.primary.main }]}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    paddingVertical: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...premiumShadows.md,
  },
  title: {
    fontSize: fontSize.heading,
    fontWeight: '800',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
    paddingLeft: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: premiumBorderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 56,
    ...premiumShadows.sm,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  registerButton: {
    borderRadius: premiumBorderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    height: 56,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: spacing.sm,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: spacing.xs,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
  },
  loginText: {
    fontSize: fontSize.md,
  },
  loginLink: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  roleHeader: {
    marginBottom: spacing.md,
  },
  roleSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  roleSectionSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  roleContainer: {
    gap: spacing.md,
  },
  roleCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xs,
    overflow: 'hidden',
    position: 'relative',
  },
  roleGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    zIndex: 1,
  },
  roleIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  roleTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleDescription: {
    fontSize: fontSize.md,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  roleFeatures: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
