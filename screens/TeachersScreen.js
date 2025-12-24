import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { spacing, fontSize } from '../src/utils/responsive';
import { premiumShadows, premiumColors, premiumBorderRadius } from '../src/utils/premiumDesign';
import LoadingSpinner from '../src/components/LoadingSpinner';

const { width } = Dimensions.get('window');

export default function TeachersScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const teacherPlans = [
    {
      id: 'basic',
      name: 'Basic Teacher',
      price: 49,
      period: 'month',
      originalPrice: 69,
      color: premiumColors.primary.main,
      features: [
        'Create up to 5 courses',
        'Upload video lessons',
        'Student progress tracking',
        'Basic analytics dashboard',
        'Email support',
        'Course certificates',
      ],
      popular: false,
    },
    {
      id: 'professional',
      name: 'Professional Teacher',
      price: 99,
      period: 'month',
      originalPrice: 149,
      color: premiumColors.accent.emerald,
      features: [
        'Unlimited courses',
        'Advanced video hosting',
        'Detailed analytics & reports',
        'Student engagement tools',
        'Priority support',
        'Custom branding',
        'Bulk student management',
        'Advanced assessments',
        'Live session hosting',
        'Revenue sharing (70/30)',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      period: 'month',
      originalPrice: 299,
      color: premiumColors.accent.gold,
      features: [
        'Everything in Professional',
        'White-label solution',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security features',
        'Multi-instructor support',
        'Custom domain',
        'Advanced reporting suite',
        'Revenue sharing (80/20)',
      ],
      popular: false,
    },
  ];

  const advancedFeatures = [
    {
      id: 'video-hosting',
      icon: 'videocam',
      title: 'Advanced Video Hosting',
      description: 'Upload HD videos with automatic optimization and CDN delivery',
      color: premiumColors.primary.main,
    },
    {
      id: 'analytics',
      icon: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Track student progress, engagement, and course performance',
      color: premiumColors.accent.emerald,
    },
    {
      icon: 'people',
      title: 'Student Management',
      description: 'Manage students, track progress, and send personalized messages',
      color: premiumColors.accent.sky,
    },
    {
      icon: 'school',
      title: 'Course Builder',
      description: 'Create interactive courses with quizzes, assignments, and resources',
      color: premiumColors.accent.gold,
    },
    {
      icon: 'cash',
      title: 'Revenue Sharing',
      description: 'Earn money from your courses with flexible revenue sharing',
      color: premiumColors.accent.rose,
    },
    {
      icon: 'shield-checkmark',
      title: 'Security & Privacy',
      description: 'Enterprise-grade security with GDPR compliance',
      color: premiumColors.info,
    },
  ];

  const handleSubscribe = (plan) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to subscribe to a teacher plan',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
        ]
      );
      return;
    }

    setSelectedPlan(plan);
    // Navigate to payment screen with plan details
    navigation.navigate('CourseDetail', {
      screen: 'Payment',
      params: {
        type: 'teacher-subscription',
        plan: plan,
      },
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <LinearGradient
        colors={isDarkMode 
          ? ['#1a0a2e', '#16213e', '#0f3460']
          : ['#E8EAF6', '#F3E5F5', '#E1BEE7']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: isDarkMode ? '#BB86FC' : '#9C27B0' }]}>
                For Teachers
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Professional tools to create and sell courses
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.lg]}>
            <LinearGradient
              colors={[premiumColors.primary.main, premiumColors.primary.main + 'DD']}
              style={styles.heroGradient}
            >
              <Ionicons name="school" size={48} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.heroContent}>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Teach French & English Professionally
              </Text>
              <Text style={[styles.heroDescription, { color: colors.secondaryText }]}>
                Join thousands of educators creating engaging courses and earning from their expertise.
                Build your teaching business with our advanced platform.
              </Text>
            </View>
          </View>
        </View>

        {/* Advanced Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Advanced Features</Text>
          <View style={styles.featuresGrid}>
            {advancedFeatures.map((feature, index) => (
              <FeatureCard
                key={index}
                feature={feature}
                colors={colors}
                navigation={navigation}
              />
            ))}
          </View>
        </View>

        {/* Subscription Plans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Your Plan</Text>
            <View style={[styles.badge, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
              <Text style={[styles.badgeText, { color: premiumColors.accent.emerald }]}>
                Best Value
              </Text>
            </View>
          </View>
          <View style={styles.plansContainer}>
            {teacherPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                colors={colors}
                isSelected={selectedPlan?.id === plan.id}
                onSelect={() => handleSubscribe(plan)}
              />
            ))}
          </View>
        </View>

        {/* Why Choose Us */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Why Choose Us</Text>
          <View style={[styles.whyCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.md]}>
            <BenefitItem
              icon="rocket"
              title="Easy Setup"
              description="Get started in minutes with our intuitive course builder"
              colors={colors}
            />
            <BenefitItem
              icon="trending-up"
              title="Grow Your Income"
              description="Earn from your expertise with flexible revenue sharing"
              colors={colors}
            />
            <BenefitItem
              icon="people-circle"
              title="Reach More Students"
              description="Access to our growing community of learners"
              colors={colors}
            />
            <BenefitItem
              icon="headset"
              title="24/7 Support"
              description="Dedicated support team to help you succeed"
              colors={colors}
            />
          </View>
        </View>

        {/* Success Stories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Success Stories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsContainer}
          >
            <TestimonialCard
              name="Marie Dubois"
              role="French Instructor"
              text="I've created 12 courses and earned over 50,000 GHS. The platform is amazing!"
              colors={colors}
            />
            <TestimonialCard
              name="John Smith"
              role="English Teacher"
              text="The analytics help me understand my students better. Highly recommended!"
              colors={colors}
            />
            <TestimonialCard
              name="Sophie Martin"
              role="Language Expert"
              text="Best investment for my teaching career. The tools are professional and easy to use."
              colors={colors}
            />
          </ScrollView>
        </View>

        {/* CTA Section */}
        <View style={styles.section}>
          <View style={[styles.ctaCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.lg]}>
            <LinearGradient
              colors={[premiumColors.accent.gold, premiumColors.accent.gold + 'DD']}
              style={styles.ctaGradient}
            >
              <Ionicons name="trophy" size={32} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.ctaContent}>
              <Text style={[styles.ctaTitle, { color: colors.text }]}>
                Ready to Start Teaching?
              </Text>
              <Text style={[styles.ctaDescription, { color: colors.secondaryText }]}>
                Join our community of professional educators today
              </Text>
              <TouchableOpacity
                style={[styles.ctaButton, { backgroundColor: premiumColors.accent.gold }]}
                onPress={() => handleSubscribe(teacherPlans[1])}
              >
                <Text style={styles.ctaButtonText}>Get Started Now</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function FeatureCard({ feature, colors, navigation }) {
  const handlePress = () => {
    if (feature.id === 'video-hosting') {
      navigation.navigate('AdvancedVideoHosting');
    } else if (feature.id === 'analytics') {
      navigation.navigate('AnalyticsDashboard');
    } else if (feature.title === 'Student Management') {
      navigation.navigate('StudentManagement');
    } else {
      // Handle other features
      Alert.alert('Coming Soon', `${feature.title} feature will be available soon!`);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
        <Ionicons name={feature.icon} size={28} color={feature.color} />
      </View>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
      <Text style={[styles.featureDescription, { color: colors.secondaryText }]}>
        {feature.description}
      </Text>
      <View style={styles.featureArrow}>
        <Ionicons name="arrow-forward" size={16} color={feature.color} />
      </View>
    </TouchableOpacity>
  );
}

function PlanCard({ plan, colors, isSelected, onSelect }) {
  const discount = Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100);

  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        {
          backgroundColor: colors.card,
          borderColor: isSelected ? plan.color : colors.border,
          borderWidth: isSelected ? 2 : 1,
        },
        premiumShadows.md,
      ]}
      onPress={onSelect}
      activeOpacity={0.9}
    >
      {plan.popular && (
        <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
          <Text style={styles.popularBadgeText}>Most Popular</Text>
        </View>
      )}
      <View style={styles.planHeader}>
        <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={[styles.currency, { color: colors.secondaryText }]}>GHS</Text>
            <Text style={[styles.price, { color: plan.color }]}>{plan.price}</Text>
            <Text style={[styles.period, { color: colors.secondaryText }]}>/{plan.period}</Text>
          </View>
          {plan.originalPrice > plan.price && (
            <View style={styles.originalPriceRow}>
              <Text style={[styles.originalPrice, { color: colors.secondaryText }]}>
                GHS {plan.originalPrice}
              </Text>
              <View style={[styles.discountBadge, { backgroundColor: premiumColors.accent.emerald + '20' }]}>
                <Text style={[styles.discountText, { color: premiumColors.accent.emerald }]}>
                  {discount}% OFF
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
      <View style={styles.featuresList}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color={plan.color} />
            <Text style={[styles.featureText, { color: colors.text }]}>{feature}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.subscribeButton, { backgroundColor: plan.color }]}
        onPress={onSelect}
      >
        <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function BenefitItem({ icon, title, description, colors }) {
  return (
    <View style={styles.benefitItem}>
      <View style={[styles.benefitIcon, { backgroundColor: premiumColors.primary.main + '20' }]}>
        <Ionicons name={icon} size={24} color={premiumColors.primary.main} />
      </View>
      <View style={styles.benefitContent}>
        <Text style={[styles.benefitTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.benefitDescription, { color: colors.secondaryText }]}>{description}</Text>
      </View>
    </View>
  );
}

function TestimonialCard({ name, role, text, colors }) {
  return (
    <View style={[styles.testimonialCard, { backgroundColor: colors.card, borderColor: colors.border }, premiumShadows.sm]}>
      <View style={styles.testimonialHeader}>
        <View style={[styles.avatar, { backgroundColor: premiumColors.primary.main + '20' }]}>
          <Ionicons name="person" size={24} color={premiumColors.primary.main} />
        </View>
        <View style={styles.testimonialInfo}>
          <Text style={[styles.testimonialName, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.testimonialRole, { color: colors.secondaryText }]}>{role}</Text>
        </View>
      </View>
      <Text style={[styles.testimonialText, { color: colors.text }]}>"{text}"</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons key={star} name="star" size={16} color={premiumColors.accent.gold} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  heroSection: {
    marginBottom: spacing.xl,
  },
  heroCard: {
    borderRadius: premiumBorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  heroGradient: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    padding: spacing.lg,
  },
  heroTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  heroDescription: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: premiumBorderRadius.base,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  featureCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  featureArrow: {
    marginTop: spacing.xs,
  },
  plansContainer: {
    gap: spacing.md,
  },
  planCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: premiumBorderRadius.full,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  planHeader: {
    marginBottom: spacing.md,
  },
  planName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  priceContainer: {
    marginTop: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs / 2,
  },
  currency: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginRight: 4,
  },
  price: {
    fontSize: fontSize.xxxl,
    fontWeight: '800',
  },
  period: {
    fontSize: fontSize.md,
    marginLeft: 4,
  },
  originalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  originalPrice: {
    fontSize: fontSize.sm,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: premiumBorderRadius.base,
  },
  discountText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  featuresList: {
    marginBottom: spacing.lg,
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
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    gap: spacing.xs,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  whyCard: {
    borderRadius: premiumBorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.xs / 2,
  },
  benefitDescription: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  testimonialsContainer: {
    paddingRight: spacing.md,
    gap: spacing.md,
  },
  testimonialCard: {
    width: width * 0.85,
    padding: spacing.md,
    borderRadius: premiumBorderRadius.lg,
    borderWidth: 1,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  testimonialRole: {
    fontSize: fontSize.xs,
  },
  testimonialText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ctaCard: {
    flexDirection: 'row',
    borderRadius: premiumBorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  ctaGradient: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaContent: {
    flex: 1,
    padding: spacing.lg,
  },
  ctaTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  ctaDescription: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: premiumBorderRadius.lg,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});

