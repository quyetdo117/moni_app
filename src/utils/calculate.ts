import { StyleSheet } from "react-native";

export const calculateROI = (capital: number, currentValue: number): number => {
  if (!capital || capital === 0) return 0;

  const roi = ((currentValue - capital) / capital) * 100;
  return Math.round(roi * 100) / 100;
};

export const line_min = StyleSheet.hairlineWidth