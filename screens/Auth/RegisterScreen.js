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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

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

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
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
    const result = await register(formData.name, formData.email, formData.password, formData.phone, formData.role);
    setLoading(false);

    if (result.success) {
      const parent = navigation.getParent();
      if (parent) {
        parent.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));
      }
    } else {
      Alert.alert('Registration Failed', result.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }]}>
      {/* Fixed Header */}
      <LinearGradient
        colors={isDarkMode ? ['#065F46', '#047857'] : ['#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.logoBox}>
            <Ionicons name="person-add" size={32} color="#10B981" />
          </View>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join thousands of learners</Text>
        </View>
      </LinearGradient>

      {/* Form Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formSection}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Animated.View style={[styles.formCard, { backgroundColor: colors.card, opacity: fadeAnim }]}>
            {/* Role Selection */}
            <Text style={[styles.sectionLabel, { color: colors.text }]}>I am joining as</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  { backgroundColor: formData.role === 'student' ? '#3B82F6' : (isDarkMode ? '#1E293B' : '#F1F5F9') },
                ]}
                onPress={() => setFormData({ ...formData, role: 'student' })}
              >
                <Ionicons name="school" size={20} color={formData.role === 'student' ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.roleBtnText, { color: formData.role === 'student' ? '#FFFFFF' : colors.text }]}>Student</Text>
                {formData.role === 'student' && <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  { backgroundColor: formData.role === 'instructor' ? '#10B981' : (isDarkMode ? '#1E293B' : '#F1F5F9') },
                ]}
                onPress={() => setFormData({ ...formData, role: 'instructor' })}
              >
                <Ionicons name="person" size={20} color={formData.role === 'instructor' ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.roleBtnText, { color: formData.role === 'instructor' ? '#FFFFFF' : colors.text }]}>Teacher</Text>
                {formData.role === 'instructor' && <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
              <View
                style={[
                  styles.inputBox,
                  { 
                    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                    borderColor: focusedInput === 'name' ? '#10B981' : 'transparent',
                    borderWidth: focusedInput === 'name' ? 2 : 0,
                  },
                ]}
              >
                <Ionicons name="person" size={20} color={focusedInput === 'name' ? '#10B981' : '#94A3B8'} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  autoCorrect={false}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email Address *</Text>
              <View
                style={[
                  styles.inputBox,
                  { 
                    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                    borderColor: focusedInput === 'email' ? '#10B981' : 'transparent',
                    borderWidth: focusedInput === 'email' ? 2 : 0,
                  },
                ]}
              >
                <Ionicons name="mail" size={20} color={focusedInput === 'email' ? '#10B981' : '#94A3B8'} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your email"
                  placeholderTextColor="#94A3B8"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Phone (Optional)</Text>
              <View
                style={[
                  styles.inputBox,
                  { 
                    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                    borderColor: focusedInput === 'phone' ? '#10B981' : 'transparent',
                    borderWidth: focusedInput === 'phone' ? 2 : 0,
                  },
                ]}
              >
                <Ionicons name="call" size={20} color={focusedInput === 'phone' ? '#10B981' : '#94A3B8'} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your phone"
                  placeholderTextColor="#94A3B8"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Password *</Text>
              <View
                style={[
                  styles.inputBox,
                  { 
                    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                    borderColor: focusedInput === 'password' ? '#10B981' : 'transparent',
                    borderWidth: focusedInput === 'password' ? 2 : 0,
                  },
                ]}
              >
                <Ionicons name="lock-closed" size={20} color={focusedInput === 'password' ? '#10B981' : '#94A3B8'} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Create a password"
                  placeholderTextColor="#94A3B8"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Confirm Password *</Text>
              <View
                style={[
                  styles.inputBox,
                  { 
                    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                    borderColor: focusedInput === 'confirmPassword' ? '#10B981' : 'transparent',
                    borderWidth: focusedInput === 'confirmPassword' ? 2 : 0,
                  },
                ]}
              >
                <Ionicons name="lock-closed" size={20} color={focusedInput === 'confirmPassword' ? '#10B981' : '#94A3B8'} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Confirm your password"
                  placeholderTextColor="#94A3B8"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms */}
            <Text style={[styles.termsText, { color: colors.secondaryText }]}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Create Account Button */}
            <TouchableOpacity
              style={[styles.registerBtn, loading && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.registerText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInRow}>
              <Text style={[styles.signInText, { color: colors.secondaryText }]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -30,
    right: -30,
  },
  headerDecor2: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -20,
    left: -20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  formSection: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    marginTop: 8,
  },
  termsLink: {
    color: '#10B981',
    fontWeight: '600',
  },
  registerBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 24,
  },
  registerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    gap: 10,
  },
  registerText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signInText: {
    fontSize: 15,
  },
  signInLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
});
