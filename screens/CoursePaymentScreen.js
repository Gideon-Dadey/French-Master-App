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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { paymentsAPI } from '../src/services/api';
import { spacing, fontSize } from '../src/utils/responsive';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import { formatCurrency } from '../src/utils/helpers';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { getCourseImage } from '../src/utils/courseImages';
import getCourseThumbnail from '../src/utils/courseThumbnailMap';
import { useCurrency } from '../src/context/CurrencyContext';

export default function CoursePaymentScreen({ route, navigation }) {
  const { course, courseId } = route.params || {};
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // Default to stripe
  const [mobileNetwork, setMobileNetwork] = useState('mtn'); // Default mobile network
  const [courseData, setCourseData] = useState(course);

  useEffect(() => {
    if (!course && !courseId) {
      Alert.alert('Error', 'No course information provided', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [course, courseId]);

  if (!courseData && !courseId) {
    return null;
  }

  const handlePayment = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to continue');
      return;
    }

    if (!courseId && !courseData?.id) {
      Alert.alert('Error', 'Course information is missing');
      return;
    }

    const finalCourseId = courseId || courseData?.id;

    try {
      setProcessing(true);
      
      // Create payment intent
      const intentResponse = await paymentsAPI.createIntent({
        courseId: finalCourseId,
        paymentMethod: paymentMethod === 'mobile-money' ? mobileNetwork : paymentMethod
      });

      if (intentResponse.data.success) {
        // Update course data if returned
        if (intentResponse.data.course) {
          setCourseData(intentResponse.data.course);
        }

        if (paymentMethod === 'stripe') {
          // For Stripe, we would integrate Stripe SDK here
          // For now, simulate successful payment
          await handlePaymentConfirmation(intentResponse.data);
        } else {
          // For mobile money and other payment methods, confirm immediately
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
      const confirmResponse = await paymentsAPI.confirmCourse({
        paymentIntentId: intentData.paymentIntentId,
        paymentId: intentData.paymentId,
        transactionId: intentData.transactionId
      });

      if (confirmResponse.data.success) {
        Alert.alert('Success!', 'You have been enrolled in this course!', [
          { 
            text: 'OK', 
            onPress: () => {
              // Navigate back to course detail or main screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      Alert.alert(
        'Confirmation Failed',
        error.response?.data?.message || 'Failed to confirm payment. Please contact support.'
      );
    }
  };

  const coursePrice = courseData?.price || 0;
  const courseTitle = courseData?.title || 'Course';
  const courseThumbnail = courseData?.thumbnail;
  const courseIdForImage = courseId || courseData?.id;
  const isFree = courseData?.isFree || coursePrice === 0;
  const hasDiscount = courseData?.originalPrice && courseData.originalPrice > coursePrice;
  const discount = hasDiscount 
    ? Math.round(((courseData.originalPrice - coursePrice) / courseData.originalPrice) * 100) 
    : 0;

  // Get image source using the same logic as CourseCard
  let imageSource;
  if (courseThumbnail) {
    if (typeof courseThumbnail === 'string' && (courseThumbnail.startsWith('http://') || courseThumbnail.startsWith('https://'))) {
      imageSource = { uri: courseThumbnail };
    } else if (typeof courseThumbnail === 'string') {
      const mappedImage = getCourseThumbnail(courseThumbnail);
      imageSource = mappedImage || getCourseImage(courseIdForImage, 0, courseData?.category || courseData?.language || course?.category || course?.language, courseData?.title || course?.title);
    } else {
      imageSource = courseThumbnail;
    }
  } else {
    imageSource = getCourseImage(courseIdForImage, 0, courseData?.category || courseData?.language || course?.category || course?.language, courseData?.title || course?.title);
  }

  const handleFreeEnrollment = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to continue');
      return;
    }

    const finalCourseId = courseId || courseData?.id;
    if (!finalCourseId) {
      Alert.alert('Error', 'Course information is missing');
      return;
    }

    try {
      setProcessing(true);
      const response = await paymentsAPI.confirm({
        courseId: finalCourseId,
        type: 'course',
        amount: 0,
        paymentMethod: 'free',
        transactionId: `FREE-${Date.now()}`,
      });

      if (response.data.success) {
        Alert.alert('Success!', 'You have been enrolled in this course!', [
          { 
            text: 'OK', 
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            }
          }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Enrollment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (isFree) {
    // Handle free course enrollment directly
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.freeEnrollmentContainer}>
          <Ionicons name="checkmark-circle" size={80} color={premiumColors.accent.emerald} />
          <Text style={[styles.freeTitle, { color: colors.text }]}>Free Course</Text>
          <Text style={[styles.freeDescription, { color: colors.secondaryText }]}>
            This course is free to enroll
          </Text>
          <TouchableOpacity
            style={[styles.enrollButton, { backgroundColor: premiumColors.primary.main }]}
            onPress={handleFreeEnrollment}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.enrollButtonText}>Enroll Now</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Complete Purchase</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Course Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <Image
              source={imageSource}
              style={styles.courseThumbnail}
              resizeMode="cover"
            />
            <View style={styles.courseInfo}>
              <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>
                {courseTitle}
              </Text>
              <View style={styles.priceContainer}>
                {hasDiscount && (
                  <View style={styles.discountContainer}>
                    <Text style={[styles.originalPrice, { color: colors.secondaryText }]}>
                      {formatPrice(courseData.originalPrice, courseData.currency || 'GHS')}
                    </Text>
                    <View style={[styles.discountBadge, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
                      <Text style={[styles.discountText, { color: premiumColors.accent.emerald }]}>
                        {discount}% OFF
                      </Text>
                    </View>
                  </View>
                )}
                <View style={styles.currentPriceRow}>
                  <Text style={[styles.currency, { color: colors.secondaryText }]}>
                    {courseData.currency || 'GHS'}
                  </Text>
                  <Text style={[styles.price, { color: premiumColors.primary.main }]}>
                    {coursePrice}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Payment Method Selection */}
          <View style={[styles.paymentSection, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                { 
                  backgroundColor: paymentMethod === 'stripe' ? premiumColors.primary.main + '20' : colors.background,
                  borderColor: paymentMethod === 'stripe' ? premiumColors.primary.main : colors.border
                }
              ]}
              onPress={() => setPaymentMethod('stripe')}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodContent}>
                <Ionicons name="card" size={24} color={premiumColors.primary.main} />
                <Text style={[styles.paymentMethodText, { color: colors.text }]}>Credit/Debit Card</Text>
              </View>
              {paymentMethod === 'stripe' && (
                <Ionicons name="checkmark-circle" size={24} color={premiumColors.primary.main} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                { 
                  backgroundColor: paymentMethod === 'mobile-money' ? premiumColors.primary.main + '20' : colors.background,
                  borderColor: paymentMethod === 'mobile-money' ? premiumColors.primary.main : colors.border
                }
              ]}
              onPress={() => setPaymentMethod('mobile-money')}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodContent}>
                <Ionicons name="phone-portrait" size={24} color={premiumColors.primary.main} />
                <Text style={[styles.paymentMethodText, { color: colors.text }]}>Mobile Money</Text>
              </View>
              {paymentMethod === 'mobile-money' && (
                <Ionicons name="checkmark-circle" size={24} color={premiumColors.primary.main} />
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
                        backgroundColor: mobileNetwork === 'other' ? premiumColors.primary.main + '20' : colors.card,
                        borderColor: mobileNetwork === 'other' ? premiumColors.primary.main : colors.border
                      }
                    ]}
                    onPress={() => setMobileNetwork('other')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.networkIconContainer, { backgroundColor: mobileNetwork === 'other' ? premiumColors.primary.main : colors.background }]}>
                      <Ionicons name="ellipsis-horizontal" size={20} color={mobileNetwork === 'other' ? '#FFFFFF' : colors.text} />
                    </View>
                    <Text style={[styles.networkText, { color: colors.text }]}>Other Network</Text>
                    {mobileNetwork === 'other' && (
                      <Ionicons name="checkmark-circle" size={20} color={premiumColors.primary.main} />
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
              { backgroundColor: premiumColors.primary.main },
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
                <Text style={styles.payButtonText}>
                  Complete Purchase - {formatPrice(coursePrice, courseData?.currency || 'GHS')}
                </Text>
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
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  courseThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: premiumBorderRadius.lg,
    marginBottom: spacing.md,
  },
  courseInfo: {
    paddingHorizontal: spacing.xs,
  },
  courseTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  priceContainer: {
    marginTop: spacing.sm,
  },
  discountContainer: {
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
  freeEnrollmentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  freeTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  freeDescription: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  enrollButton: {
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    borderRadius: premiumBorderRadius.lg,
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});

