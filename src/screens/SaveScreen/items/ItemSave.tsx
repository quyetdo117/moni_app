import { COLOR_APP } from '@/constants/constants';
import { formatSmartMoney } from '@/utils/convertData';
import { commonStyles } from '@/utils/styles_shadow';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ItemSaveProps {
  data: {
    id: string;
    name: string;
    total_capital: number;
    total_value?: number;
    target?: number;
    date_buy: number;
    createdAt?: any;
  };
  onPress?: (data: ItemSaveProps['data']) => void;
}

export default function ItemSave({ data, onPress }: ItemSaveProps) {
  const { name, total_capital, total_value, target, date_buy } = data;

  // Calculate progress towards target
  const currentAmount = total_value || total_capital;
  const targetAmount = target || 0;
  const progress = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 100;

  // Calculate interest earned
  const interestEarned = total_value ? total_value - total_capital : 0;

  const onPressItem = () => {
    if (onPress) {
      onPress(data);
    }
  };

  // Format date
  const dateStr = date_buy ? new Date(date_buy * 1000).toLocaleDateString('vi-VN') : '';

  return (
    <RNBounceable onPress={onPressItem} style={[styles.box, commonStyles.box_shadow]}>
      <View style={styles.header}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.date}>{dateStr}</Text>
      </View>

      <View style={styles.moneyRow}>
        <View style={styles.moneyItem}>
          <Text style={styles.label}>{'Đã tiết kiệm'}</Text>
          <Text style={styles.moneyValue}>{formatSmartMoney(total_capital)}</Text>
        </View>
        <View style={styles.moneyItem}>
          <Text style={[styles.label, { textAlign: 'right' }]}>{'Hiện tại (có lãi)'}</Text>
          <Text style={[styles.moneyValue, styles.currentValue]}>
            {formatSmartMoney(currentAmount)}
          </Text>
        </View>
      </View>

      {interestEarned > 0 && (
        <View style={styles.interestRow}>
          <Text style={styles.interestLabel}>{'Lãi đã nhận:'}</Text>
          <Text style={styles.interestValue}>+{formatSmartMoney(interestEarned)}</Text>
        </View>
      )}

      {targetAmount > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{'Tiến độ mục tiêu'}</Text>
            <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>{'Mục tiêu:'}</Text>
            <Text style={styles.targetValue}>{formatSmartMoney(targetAmount)}</Text>
          </View>
        </View>
      )}
    </RNBounceable>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    marginHorizontal: 15
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
    fontSize: 18,
    color: '#1a1a1a',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  moneyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  moneyItem: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  moneyValue: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1a1a1a',
  },
  currentValue: {
    color: COLOR_APP.green,
    textAlign: 'right',
  },
  interestRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  interestLabel: {
    fontSize: 12,
    color: '#666',
  },
  interestValue: {
    fontSize: 12,
    color: COLOR_APP.green,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_APP.blue,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLOR_APP.blue,
    borderRadius: 4,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  targetLabel: {
    fontSize: 12,
    color: '#666',
  },
  targetValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
});
