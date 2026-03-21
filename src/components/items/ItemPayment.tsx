import { COLOR_APP, TYPE_TRANSACTION } from '@/constants/constants';
import { useUserStore } from '@/store/main.store';
import { InfoTransaction } from '@/types/info.types';
import { formatSmartMoney, getIconByTypeDisplay } from '@/utils/convertData';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface dataPayment {
  data: InfoTransaction
}

export default function ItemPayment({ data }: dataPayment) {
  const infoAsset = useUserStore(state => state.infoAsset);

  const { type, date_buy, type_display, asset_id } = data;

  const isInvest = asset_id === infoAsset.invest?.id;
  const isExpense = asset_id === infoAsset.expense?.id;
  const dateStr = moment(date_buy * 1000).format('DD/MM/YYYY');
  const colorTitle = (type == TYPE_TRANSACTION.IN && isExpense) || (type == TYPE_TRANSACTION.OUT && isInvest)
    ? COLOR_APP.green : COLOR_APP.red;
  const prefix = (type == TYPE_TRANSACTION.IN && isExpense) || (type == TYPE_TRANSACTION.OUT && isInvest)
    ? '+' : '-';

  const infoIcon = getIconByTypeDisplay(type_display);
  const { name, library, color } = infoIcon;
  const IconCategory = library;
  
  return (
    <View style={styles.container}>
      {/* Left: Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <IconCategory size={18} name={name} color={color} />
      </View>

      {/* Middle: Title & Note */}
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {data.name}
        </Text>
        {data.note ? (
          <Text style={styles.note} numberOfLines={1}>{data.note}</Text>
        ) : null}
      </View>

      {/* Right: Amount */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: colorTitle }]}>
          {`${prefix}${formatSmartMoney(data.total_value)}`}
        </Text>
        <Text style={styles.dateRight}>{dateStr}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  contentContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  note: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
  date: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  dateRight: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
})
