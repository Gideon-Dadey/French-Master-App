import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { subscriptionsAPI } from '../src/services/api';
import { spacing, fontSize } from '../src/utils/responsive';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import { formatCurrency } from '../src/utils/helpers';
import { showToast } from '../src/components/ToastNotification';
import LoadingSpinner from '../src/components/LoadingSpinner';

export default function TeacherSubscriptionPaymentScreen({ route, navigation }) {
  const { plan } = route.params || {};
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // Default to stripe

  useEffect(() => {
    if (!plan) {
      Alert.alert('Error', 'No plan selected', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [plan]);

  if (!plan) {
    return null;
  }

  const handlePayment = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to continue');
      return;
    }

    try {
      setProcessing(true);
      
      // Create payment intent
      const intentResponse = await subscriptionsAPI.createSubscriptionIntent({
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        period: plan.period,
        paymentMethod: paymentMethod
      });

      if (intentResponse.data.success) {
        if (paymentMethod === 'stripe') {
          // For Stripe, we would integrate Stripe SDK here
          // For now, simulate successful payment
          await handlePaymentConfirmation(intentResponse.data);
        } else {
          // For other payment methods, confirm immediately
          await handlePaymentConfirmation(intentResponse.data);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error.response?.data?.message || 'Failed to process payment. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentConfirmation = async (intentData) => {
    try {
      const confirmResponse = await subscriptionsAPI.confirmSubscription({
        paymentIntentId: intentData.paymentIntentId,
        paymentId: intentData.paymentId,
        transactionId: intentData.transactionId
      });

      if (confirmResponse.data.success) {
        showToast.success('Success!', 'Your teacher subscription has been activated!');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      Alert.alert(
        'Confirmation Failed',
        error.response?.data?.message || 'Failed to confirm subscription. Please contact support.'
      );
    }
  };

  const discount = plan.originalPrice ? Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100) : 0;

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
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Complete Subscription</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Plan Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <View style={styles.summaryHeader}>
              <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
                <Ionicons name="school" size={32} color={plan.color} />
              </View>
              <View style={styles.planInfo}>
                <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                <Text style={[styles.planPeriod, { color: colors.secondaryText }]}>
                  Billed {plan.period === 'month' ? 'monthly' : 'annually'}
                </Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                {plan.originalPrice && plan.originalPrice > plan.price && (
                  <>
                    <Text style={[styles.originalPrice, { color: colors.secondaryText }]}>
                      {formatCurrency(plan.originalPrice, 'GHS')}
                    </Text>
                    <View style={[styles.discountBadge, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
                      <Text style={[styles.discountText, { color: premiumColors.accent.emerald }]}>
                        {discount}% OFF
                      </Text>
                    </View>
                  </>
                )}
              </View>
              <View style={styles.currentPriceRow}>
                <Text style={[styles.currency, { color: colors.secondaryText }]}>GHS</Text>
                <Text style={[styles.price, { color: plan.color }]}>{plan.price}</Text>
                <Text style={[styles.period, { color: colors.secondaryText }]}>/{plan.period}</Text>
              </View>
            </View>

            {/* Features List */}
            <View style={styles.featuresList}>
              <Text style={[styles.featuresTitle, { color: colors.text }]}>What's included:</Text>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color={plan.color} />
                  <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Payment Method Selection */}
          <View style={[styles.paymentSection, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                { 
                  backgroundColor: paymentMethod === 'stripe' ? plan.color + '20' : colors.background,
                  borderColor: paymentMethod === 'stripe' ? plan.color : colors.border
                }
              ]}
              onPress={() => setPaymentMethod('stripe')}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodContent}>
                <Ionicons name="card" size={24} color={plan.color} />
                <Text style={[styles.paymentMethodText, { color: colors.text }]}>Credit/Debit Card</Text>
              </View>
              {paymentMethod === 'stripe' && (
                <Ionicons name="checkmark-circle" size={24} color={plan.color} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                { 
                  backgroundColor: paymentMethod === 'mtn' ? plan.color + '20' : colors.background,
                  borderColor: paymentMethod === 'mtn' ? plan.color : colors.border
                }
              ]}
              onPress={() => setPaymentMethod('mtn')}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodContent}>
                <Ionicons name="phone-portrait" size={24} color={plan.color} />
                <Text style={[styles.paymentMethodText, { color: colors.text }]}>Mobile Money (MTN)</Text>
              </View>
              {paymentMethod === 'mtn' && (
                <Ionicons name="checkmark-circle" size={24} color={plan.color} />
              )}
            </TouchableOpacity>
          </View>

          {/* Payment Button */}
          <TouchableOpacity
            style={[
              styles.payButton,
              { backgroundColor: plan.color },
              (processing || loading) && styles.payButtonDisabled,
              premiumShadows.md
            ]}
            onPress={handlePayment}
            disabled={processing || loading}
            activeOpacity={0.9}
          >
            {processing || loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.payButtonText}>Complete Payment</Text>
                <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          <Text style={[styles.securityNote, { color: colors.secondaryText }]}>
            <Ionicons name="shield-checkmark" size={16} color={colors.secondaryText} />{' '}
            Your payment is secure and encrypted
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  summaryCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  planIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  planPeriod: {
    fontSize: fontSize.sm,
  },
  priceContainer: {
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  originalPrice: {
    fontSize: fontSize.md,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: premiumBorderRadius.base,
  },
  discountText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  currentPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginRight: 4,
  },
  price: {
    fontSize: fontSize.xxxl,
    fontWeight: '800',
  },
  period: {
    fontSize: fontSize.lg,
    marginLeft: 4,
  },
  featuresList: {
    marginTop: spacing.md,
  },
  featuresTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  paymentSection: {
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 2,
    marginBottom: spacing.md,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  paymentMethodText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  securityNote: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
});

