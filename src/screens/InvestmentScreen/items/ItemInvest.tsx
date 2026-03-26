
import { COLOR_APP } from '@/constants/constants';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { calculateROI, formatSmartMoney } from '@/utils/convertData';
import { commonStyles } from '@/utils/styles_shadow';
import RNBounceable from '@freakycoder/react-native-bounceable';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DataInvestItem } from '../types/Investment.types';

interface ItemInvestProps {
  data: DataInvestItem,
  onPress?: Function
}

export default function ItemInvest({ data, onPress }: ItemInvestProps) {
  const { name, total_value, total_capital, quantity, date_buy } = data;
  const roi_value = calculateROI(total_capital, total_value || 0);
  const isPositive = roi_value >= 0;
  
  // Format date (date_update is timestamp in milliseconds)
  const formattedDate = date_buy ? moment(date_buy*1000).format('DD/MM/YYYY') : '--/--/----';

  const onPressItem = () => {
    if(onPress) {
      onPress(data)
    }
  }

  return (
    <RNBounceable 
      onPress={onPressItem} 
      style={[styles.container, commonStyles.box_shadow]}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{name}</Text>
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>SL: {quantity ?? 0}</Text>
          </View>
        </View>
      </View>

      {/* Values Section */}
      <View style={styles.valuesContainer}>
        <View style={styles.valueBlock}>
          <Text style={styles.label}>Vốn</Text>
          <Text style={styles.value}>{formatSmartMoney(total_capital || 0)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.valueBlock}>
          <Text style={styles.label}>Giá trị</Text>
          <Text style={[styles.value, styles.valueHighlight]}>
            {formatSmartMoney(total_value || 0)}
          </Text>
        </View>
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateValue}>{formattedDate}</Text>
        </View>
        <View style={[
          styles.roiContainer,
          isPositive ? styles.roiPositive : styles.roiNegative
        ]}>
          <Text style={[
            styles.roiText,
            isPositive ? styles.roiTextPositive : styles.roiTextNegative
          ]}>
            {isPositive ? '↑' : '↓'} {roi_value}%
          </Text>
        </View>
      </View>
    </RNBounceable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  header: {
    marginBottom: Spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  quantityBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.base,
  },
  quantityText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  valuesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  valueBlock: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.text,
  },
  valueHighlight: {
    color: COLOR_APP.green,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textTertiary,
    marginRight: Spacing.xs,
  },
  dateValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  roiContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roiPositive: {
    backgroundColor: Colors.successLight,
  },
  roiNegative: {
    backgroundColor: Colors.errorLight,
  },
  roiText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
  roiTextPositive: {
    color: Colors.success,
  },
  roiTextNegative: {
    color: Colors.error,
  },
})
