/**
 * Modern Minimalist Theme for MoniSocial
 * Clean, spacious design with subtle shadows and limited color palette
 */

import { Platform, StyleSheet } from 'react-native';

// ============================================
// COLOR PALETTE - Modern Minimalist
// ============================================

export const Colors = {
  // Primary palette - Clean and minimal
  primary: '#1A1A2E',        // Deep navy - main accent
  primaryLight: '#16213E',  // Lighter navy
  secondary: '#0F3460',     // Medium navy
  
  // Neutral palette
  background: '#FAFBFC',    // Off-white background
  surface: '#FFFFFF',      // Pure white for cards
  surfaceElevated: '#F5F7FA', // Slightly elevated surfaces
  
  // Text colors
  text: '#1A1A2E',          // Primary text - deep navy
  textSecondary: '#6B7280', // Secondary text - gray
  textTertiary: '#9CA3AF',  // Tertiary text - light gray
  textInverse: '#FFFFFF',   // Text on dark backgrounds
  
  // Accent colors - Minimal usage
  accent: '#4F46E5',        // Indigo - for CTAs
  accentLight: '#818CF8',  // Light indigo
  
  // Semantic colors
  success: '#10B981',       // Green
  successLight: '#D1FAE5', // Light green background
  warning: '#F59E0B',      // Amber
  warningLight: '#FEF3C7', // Light amber background
  error: '#EF4444',        // Red
  errorLight: '#FEE2E2',   // Light red background
  
  // Border and divider
  border: '#E5E7EB',        // Light gray border
  divider: '#F3F4F6',      // Very light divider
  
  // Legacy support (for gradual migration)
  light: {
    text: '#1A1A2E',
    background: '#FAFBFC',
    tint: '#4F46E5',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#4F46E5',
  },
  dark: {
    text: '#F9FAFB',
    background: '#1A1A2E',
    tint: '#818CF8',
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#818CF8',
  },
};

// ============================================
// TYPOGRAPHY - Clean and readable
// ============================================

export const Typography = {
  // Font families
  fontFamily: Platform.select({
    ios: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    android: {
      regular: 'Roboto',
      medium: 'Roboto',
      semiBold: 'Roboto',
      bold: 'Roboto',
    },
    default: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
  }),
  
  // Font sizes - Based on 4px grid system
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ============================================
// SPACING - 4px grid system
// ============================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

// ============================================
// BORDER RADIUS - Subtle curves
// ============================================

export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// ============================================
// SHADOWS - Subtle and elegant
// ============================================

export const Shadows = StyleSheet.create({
  // Subtle shadow for cards
  sm: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // Medium shadow for elevated cards
  md: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  // Stronger shadow for modals/popups
  lg: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
});

// ============================================
// COMPONENT STYLES
// ============================================

export const ComponentStyles = {
  // Card style
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.md,
  },
  
  // Button base styles
  button: {
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  // Input base styles
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.fontSize.base,
  },
  
  // Header styles
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  ComponentStyles,
};


