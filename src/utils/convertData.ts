import { getColorCategory, types_display } from "@/constants/constants";
import { ChartTransacion } from "@/screens/ExpenseScreen/items/ChartPayment";
import { Transaction } from "@/types/schema.types";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from "@expo/vector-icons/Ionicons";
import moment from "moment";
import React from "react";
import { StyleSheet } from "react-native";

/**
 * Calculate ROI (Return on Investment)
 */
export const calculateROI = (capital: number, currentValue: number): number => {
  if (!capital || capital === 0) return 0;

  const roi = ((currentValue - capital) / capital) * 100;
  return Math.round(roi * 100) / 100;
};

export const line_min = StyleSheet.hairlineWidth

/**
 * Định dạng số thành tiền tệ VND
 */
export const formatVND = (amount: number | string): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value)) {
    return new Intl.NumberFormat('vi-VN', {
      currency: 'VND',
    }).format(0);
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

export const formatSmartMoney = (amount: number | string): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value) || value === 0) return '0 ₫';
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (value >= 100_000_000) {
    return (value / 100_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  return new Intl.NumberFormat('vi-VN', {
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatSmartMoney_2 = (amount: number | string, isPositive?: boolean): string => {
  let value = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isPositive) {
    value = Math.abs(value);
  }

  if (isNaN(value) || value === 0) return '0 ₫';
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  let formattedValue = '';

  if (absValue >= 1_000_000_000) {
    formattedValue = (absValue / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  } else if (absValue >= 1_000_000) {
    formattedValue = (absValue / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (absValue >= 1_000) {
    formattedValue = (absValue / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    return new Intl.NumberFormat('vi-VN', {
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  }

  return isNegative ? `-${formattedValue}` : formattedValue;
};

export const formatChartData = (
  date: number,
  data: Transaction[]
) => {
  const startOfMonth = moment(date).startOf('month');
  const numDay = startOfMonth.daysInMonth();
  const dataCount: Record<number, number> = {};
  // count money for day
  data.forEach((item) => {
    const date_buy = moment(item.date_buy*1000).startOf('day').valueOf();
    if (date_buy) {
      const valueCurrent = Number(dataCount[date_buy] || 0);
      const total_value = Number(item.total_value || 0);
      dataCount[date_buy] = valueCurrent + total_value;
    }
  })
  // import data in arr
  const dataChart: ChartTransacion[] = [];
  for (let i = 1; i <= numDay; i++) {
    const dateTimestamp = moment(startOfMonth).date(i).startOf('day').valueOf();
    const valueData = dataCount[dateTimestamp] || 0;
    const dataDate: ChartTransacion = { value: valueData };
    dataChart.push(dataDate);
  }
   
  return dataChart;
}

/**
 * Interface for icon data returned by getIconByTypeDisplay
 */
export interface IconData {
  name: string;
  library: React.ComponentType<any>;
  color: string;
}

/**
 * Get icon name based on type_display from constants.ts
 * @param typeDisplay - The type_display value from types_display
 * @returns IconData object containing icon name and icon library
 */

export const getIconByTypeDisplay = (typeDisplay: number): IconData => {
  switch (typeDisplay) {
    case types_display.move:
      return { name: 'car', library: Ionicons, color: getColorCategory(typeDisplay) };
    case types_display.personal:
      return { name: 'person', library: Ionicons, color: getColorCategory(typeDisplay) };
    case types_display.fixed:
      return { name: 'home', library: AntDesign, color: getColorCategory(typeDisplay) };
    case types_display.food:
      return { name: 'restaurant', library: Ionicons, color: getColorCategory(typeDisplay) };
    case types_display.income:
      return { name: 'sack-dollar', library: FontAwesome6, color: getColorCategory(typeDisplay) };
    case types_display.other_expense:
      return { name: 'ellipsis-horizontal', library: Ionicons, color: getColorCategory(typeDisplay) };
    case types_display.invest:
      return { name: 'gold', library: AntDesign, color: getColorCategory(typeDisplay) };
    case types_display.save:
      return { name: 'wallet', library: Fontisto, color: getColorCategory(typeDisplay) };
    default:
      return { name: 'help-circle', library: Ionicons, color: '#000' };
  }
}; 
