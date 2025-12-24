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
import { useCurrency } from '../src/context/CurrencyContext';
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
  const { formatPrice, formatPriceValue, getCurrencyData } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // Default to stripe
  const [mobileNetwork, setMobileNetwork] = useState('mtn'); // Default mobile network

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
        paymentMethod: paymentMethod === 'mobile-money' ? mobileNetwork : paymentMethod
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
                      {formatPrice(plan.originalPrice, 'GHS')}
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
                <Text style={[styles.currency, { color: colors.secondaryText }]}>
                  {getCurrencyData?.()?.symbol || 'GH₵'}
                </Text>
                <Text style={[styles.price, { color: plan.color }]}>
                  {formatPriceValue(plan.price, 'GHS')}
                </Text>
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
                  backgroundColor: paymentMethod === 'mobile-money' ? plan.color + '20' : colors.background,
                  borderColor: paymentMethod === 'mobile-money' ? plan.color : colors.border
                }
              ]}
              onPress={() => setPaymentMethod('mobile-money')}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodContent}>
                <Ionicons name="phone-portrait" size={24} color={plan.color} />
                <Text style={[styles.paymentMethodText, { color: colors.text }]}>Mobile Money</Text>
              </View>
              {paymentMethod === 'mobile-money' && (
                <Ionicons name="checkmark-circle" size={24} color={plan.color} />
              )}
            </TouchableOpacity>

            {/* Mobile Network Selection - Show only when Mobile Money is selected */}
            {paymentMethod === 'mobile-money' && (
              <View style={[styles.mobileNetworkSection, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.networkSectionTitle, { color: colors.text }]}>Select Mobile Network</Text>
                <View style={styles.networkGrid}>
                  <TouchableOpacity
                    style={[
                      styles.networkOption,
                      {
                        backgroundColor: mobileNetwork === 'mtn' ? premiumColors.accent.emerald + '20' : colors.card,
                        borderColor: mobileNetwork === 'mtn' ? premiumColors.accent.emerald : colors.border
                      }
                    ]}
                    onPress={() => setMobileNetwork('mtn')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.networkIconContainer, { backgroundColor: mobileNetwork === 'mtn' ? premiumColors.accent.emerald : colors.background }]}>
                      <Text style={styles.networkIconText}>MTN</Text>
                    </View>
                    <Text style={[styles.networkText, { color: colors.text }]}>MTN Mobile Money</Text>
                    {mobileNetwork === 'mtn' && (
                      <Ionicons name="checkmark-circle" size={20} color={premiumColors.accent.emerald} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.networkOption,
                      {
                        backgroundColor: mobileNetwork === 'vodafone' ? '#E60000' + '20' : colors.card,
                        borderColor: mobileNetwork === 'vodafone' ? '#E60000' : colors.border
                      }
                    ]}
                    onPress={() => setMobileNetwork('vodafone')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.networkIconContainer, { backgroundColor: mobileNetwork === 'vodafone' ? '#E60000' : colors.background }]}>
                      <Text style={styles.networkIconText}>VF</Text>
                    </View>
                    <Text style={[styles.networkText, { color: colors.text }]}>Vodafone Cash</Text>
                    {mobileNetwork === 'vodafone' && (
                      <Ionicons name="checkmark-circle" size={20} color="#E60000" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.networkOption,
                      {
                        backgroundColor: mobileNetwork === 'airteltigo' ? '#FF6600' + '20' : colors.card,
                        borderColor: mobileNetwork === 'airteltigo' ? '#FF6600' : colors.border
                      }
                    ]}
                    onPress={() => setMobileNetwork('airteltigo')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.networkIconContainer, { backgroundColor: mobileNetwork === 'airteltigo' ? '#FF6600' : colors.background }]}>
                      <Text style={styles.networkIconText}>AT</Text>
                    </View>
                    <Text style={[styles.networkText, { color: colors.text }]}>AirtelTigo Money</Text>
                    {mobileNetwork === 'airteltigo' && (
                      <Ionicons name="checkmark-circle" size={20} color="#FF6600" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.networkOption,
                      {
                        backgroundColor: mobileNetwork === 'other' ? plan.color + '20' : colors.card,
                        borderColor: mobileNetwork === 'other' ? plan.color : colors.border
                      }
                    ]}
                    onPress={() => setMobileNetwork('other')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.networkIconContainer, { backgroundColor: mobileNetwork === 'other' ? plan.color : colors.background }]}>
                      <Ionicons name="ellipsis-horizontal" size={20} color={mobileNetwork === 'other' ? '#FFFFFF' : colors.text} />
                    </View>
                    <Text style={[styles.networkText, { color: colors.text }]}>Other Network</Text>
                    {mobileNetwork === 'other' && (
                      <Ionicons name="checkmark-circle" size={20} color={plan.color} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
  mobileNetworkSection: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
  },
  networkSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  networkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  networkOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: premiumBorderRadius.md,
    borderWidth: 2,
    minWidth: '47%',
    flex: 1,
    gap: spacing.sm,
  },
  networkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: premiumBorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkIconText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  networkText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    flex: 1,
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

