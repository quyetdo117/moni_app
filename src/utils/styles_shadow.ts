import { StyleSheet, ViewStyle } from "react-native";
import { Colors } from "../constants/theme";

// Modern Minimalist shadow styles
export const commonStyles = StyleSheet.create({
  // Subtle shadow for cards and small elements
  box_shadow: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    backgroundColor: Colors.surface,
  } as ViewStyle,
  
  // Medium shadow for elevated cards
  box_shadow_medium: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    backgroundColor: Colors.surface,
  } as ViewStyle,
  
  // Stronger shadow for modals and popups
  box_shadow_transaction: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: Colors.surface,
  } as ViewStyle,
  
  // Minimal border style
  border: {
    borderWidth: 1,
    borderColor: Colors.border,
  } as ViewStyle,
  
  // No shadow, just clean surface
  no_shadow: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
});
