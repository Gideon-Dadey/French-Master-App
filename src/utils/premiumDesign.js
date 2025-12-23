/**
 * Premium Design System
 * Advanced design tokens and utilities for a premium SaaS platform
 */

export const premiumColors = {
  // Primary Brand Colors
  primary: {
    main: '#6366F1', // Indigo
    light: '#818CF8',
    dark: '#4F46E5',
    gradient: ['#6366F1', '#8B5CF6', '#EC4899'], // Premium gradient
  },
  
  // Accent Colors
  accent: {
    gold: '#F59E0B',
    emerald: '#10B981',
    rose: '#F43F5E',
    sky: '#0EA5E9',
  },
  
  // Neutral Palette
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Status Colors
  status: {
    completed: '#10B981',
    inProgress: '#3B82F6',
    notStarted: '#9CA3AF',
    locked: '#6B7280',
  },
};

export const premiumShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 12,
  },
  premium: {
    // Premium glow effect
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const premiumTypography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const premiumSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const premiumBorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const premiumAnimations = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'spring',
  },
};

/**
 * Premium gradient generator
 */
export const getPremiumGradient = (variant = 'primary') => {
  const gradients = {
    primary: ['#6366F1', '#8B5CF6'],
    sunset: ['#F59E0B', '#EF4444'],
    ocean: ['#0EA5E9', '#3B82F6'],
    forest: ['#10B981', '#059669'],
    royal: ['#6366F1', '#8B5CF6', '#EC4899'],
  };
  return gradients[variant] || gradients.primary;
};

/**
 * Premium card style
 */
export const premiumCardStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: premiumBorderRadius.xl,
  ...premiumShadows.md,
  padding: premiumSpacing.lg,
};

/**
 * Glass morphism effect
 */
export const glassMorphism = {
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.18)',
};

/**
 * Premium button variants
 */
export const buttonVariants = {
  primary: {
    backgroundColor: premiumColors.primary.main,
    borderRadius: premiumBorderRadius.lg,
    paddingVertical: premiumSpacing.md,
    paddingHorizontal: premiumSpacing.xl,
    ...premiumShadows.md,
  },
  secondary: {
    backgroundColor: premiumColors.neutral[100],
    borderRadius: premiumBorderRadius.lg,
    paddingVertical: premiumSpacing.md,
    paddingHorizontal: premiumSpacing.xl,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: premiumColors.primary.main,
    borderRadius: premiumBorderRadius.lg,
    paddingVertical: premiumSpacing.md,
    paddingHorizontal: premiumSpacing.xl,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: premiumBorderRadius.lg,
    paddingVertical: premiumSpacing.md,
    paddingHorizontal: premiumSpacing.xl,
  },
};

