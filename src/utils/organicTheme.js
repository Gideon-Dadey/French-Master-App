/**
 * French Master - Unified Color Theme
 * 
 * A sophisticated Midnight Blue & Gold palette inspired by French elegance.
 * This palette evokes Parisian luxury, trust, and intellectual sophistication.
 * 
 * Use these colors consistently across all screens for a professional,
 * cohesive brand experience.
 */

export const organicTheme = {
  light: {
    // Primary Colors
    primary: '#1E3A5F',           // Deep Midnight Blue - main actions, headers
    primaryLight: '#2D4A6F',      // Lighter blue for hover states
    primaryDark: '#152C4A',       // Darker blue for pressed states

    // Accent Colors
    secondary: '#C9A227',         // Warm Gold - highlights, badges, premium
    secondaryLight: '#D4B445',    // Lighter gold
    accent: '#5B8FB9',            // Soft Sky Blue - secondary actions

    // Background Colors
    background: '#F8F6F3',        // Warm Cream - main background
    surface: '#FFFFFF',           // Pure White - cards, modals
    surfaceAlt: '#F0EDE8',        // Light Beige - alternate surface
    surfaceElevated: '#FFFFFF',   // Elevated cards

    // Text Colors
    text: '#1A2332',              // Dark Charcoal - primary text
    textSecondary: '#5A6578',     // Muted Slate - secondary text
    textMuted: '#8A94A6',         // Light Slate - hints, placeholders
    textOnPrimary: '#FFFFFF',     // White text on primary color
    textOnSecondary: '#1A2332',   // Dark text on gold

    // Border Colors
    border: '#E5E1DB',            // Warm Grey - subtle borders
    borderLight: '#F0EDE8',       // Light border
    divider: '#E5E1DB',           // Dividers

    // Semantic Colors
    success: '#2E7D5A',           // Forest Green
    successLight: '#E8F5EE',      // Light green background
    error: '#C94C4C',             // Muted Red
    errorLight: '#FDEAEA',        // Light red background
    warning: '#D4A84B',           // Amber
    warningLight: '#FDF6E3',      // Light amber background
    info: '#5B8FB9',              // Sky Blue
    infoLight: '#EBF4FA',         // Light blue background

    // Special Colors
    gold: '#C9A227',              // Premium gold
    bronze: '#B87333',            // Achievement bronze
    silver: '#8A94A6',            // Achievement silver

    // Gradient Stops
    gradientStart: '#1E3A5F',
    gradientEnd: '#2D4A6F',
    heroGradient: ['#1E3A5F', '#2D4A6F', '#3D5A7F'],
  },

  dark: {
    // Primary Colors
    primary: '#FFFFFF',           // Set to White for better dark mode visibility
    primaryLight: '#5B8CC8',      // Lighter blue for hover
    primaryDark: '#3A6BA7',       // Darker blue for pressed

    // Accent Colors
    secondary: '#E5B94E',         // Brighter Gold for dark mode
    secondaryLight: '#F0C85D',    // Lighter gold
    accent: '#7AA8D4',            // Soft Blue

    // Background Colors
    background: '#000000',        // Pure Black - main background
    surface: '#121212',           // Dark Grey - cards, modals
    surfaceAlt: '#1E1E1E',        // Slightly Lighter Grey - alternate surface
    surfaceElevated: '#121212',   // Elevated cards

    // Text Colors
    text: '#F0EBE3',              // Warm Cream - primary text
    textSecondary: '#A8B4C4',     // Muted Blue-Grey - secondary text
    textMuted: '#6B7C93',         // Slate - hints, placeholders
    textOnPrimary: '#000000',     // Dark text on primary (now white) color
    textOnSecondary: '#000000',   // Dark text on gold

    // Border Colors
    border: '#333333',            // Dark Grey
    borderLight: '#444444',       // Lighter border
    divider: '#333333',           // Dividers

    // Semantic Colors
    success: '#4CAF7A',           // Bright Green
    successLight: '#1A2F24',      // Dark green background
    error: '#E57373',             // Soft Red
    errorLight: '#2A1A1A',        // Dark red background
    warning: '#F5C664',           // Bright Amber
    warningLight: '#2A2517',      // Dark amber background
    info: '#7AA8D4',              // Light Blue
    infoLight: '#1A2530',         // Dark blue background

    // Special Colors
    gold: '#E5B94E',              // Premium gold
    bronze: '#CD8543',            // Achievement bronze
    silver: '#A8B4C4',            // Achievement silver

    // Gradient Stops
    gradientStart: '#000000',
    gradientEnd: '#121212',
    heroGradient: ['#000000', '#121212', '#1E3A5F'],
  },
};

/**
 * Get theme colors based on dark mode state
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 * @returns {object} Theme colors object
 */
export const getThemeColors = (isDarkMode) => {
  return isDarkMode ? organicTheme.dark : organicTheme.light;
};

/**
 * Common shadow styles for cards and elevated elements
 */
export const themeShadows = {
  sm: {
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#1E3A5F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
};

/**
 * Common border radius values
 */
export const themeRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
};

/**
 * Typography scale
 */
export const themeTypography = {
  fontFamily: {
    heading: 'Georgia',      // Serif for headings - elegant, French feel
    body: 'System',          // System font for body - readable
  },
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export default organicTheme;

