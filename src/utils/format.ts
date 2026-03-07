import { ChartTransacion } from "@/screens/ExpenseScreen/items/ChartPayment";
import { Transaction } from "@/types/schema.types";
import moment from "moment";

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
