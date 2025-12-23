import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro - 375x812)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Scale factor
const scale = SCREEN_WIDTH / BASE_WIDTH;
const verticalScale = SCREEN_HEIGHT / BASE_HEIGHT;

// Responsive functions
export const normalize = (size) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const verticalNormalize = (size) => {
  const newSize = size * verticalScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const moderateScale = (size, factor = 0.5) => {
  return size + (normalize(size) - size) * factor;
};

// Screen dimensions
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// Breakpoints
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;
export const isTablet = SCREEN_WIDTH >= 768;

// Responsive padding/margin
export const spacing = {
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(12),
  lg: normalize(16),
  xl: normalize(20),
  xxl: normalize(24),
  xxxl: normalize(32),
};

// Responsive font sizes
export const fontSize = {
  xs: normalize(10),
  sm: normalize(12),
  md: normalize(14),
  lg: normalize(16),
  xl: normalize(18),
  xxl: normalize(20),
  xxxl: normalize(24),
  title: normalize(28),
  heading: normalize(32),
};

// Responsive icon sizes
export const iconSize = {
  xs: normalize(16),
  sm: normalize(20),
  md: normalize(24),
  lg: normalize(28),
  xl: normalize(32),
  xxl: normalize(40),
};

// Touch target sizes (minimum 44x44 for accessibility)
export const touchTarget = {
  min: normalize(44),
  sm: normalize(48),
  md: normalize(56),
  lg: normalize(64),
};

// Card dimensions
export const cardWidth = isTablet 
  ? (SCREEN_WIDTH - spacing.xxxl * 3) / 2 
  : SCREEN_WIDTH - spacing.xl * 2;

export const courseCardWidth = isTablet
  ? (SCREEN_WIDTH - spacing.xxxl * 3) / 2
  : SCREEN_WIDTH * 0.85;

