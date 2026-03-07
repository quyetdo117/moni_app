import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  box_shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 2
  },
  box_shadow_transaction: {
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 5
  }
});