import { COLOR_APP } from '@/constants/constants';
import { InfoTransaction } from '@/types/info.types';
import { formatSmartMoney } from '@/utils/convertData';
import { commonStyles } from '@/utils/styles_shadow';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ItemSavePaymentProps {
  data: InfoTransaction;
}

export default function ItemSavePayment({ data }: ItemSavePaymentProps) {
  const { type, date_buy, total_value, note } = data;
  const dateStr = moment(date_buy * 1000).format('DD/MM/YYYY');
  
  // For save: IN (deposit) = green (positive), OUT (withdraw) = red (negative)
  const isDeposit = type === 1; // TYPE_TRANSACTION.IN = 1 means deposit
  const displayValue = isDeposit ? `+${formatSmartMoney(total_value)}` : `-${formatSmartMoney(total_value)}`;
  const valueColor = isDeposit ? COLOR_APP.green : COLOR_APP.red;
  
  // Transaction type label
  const typeLabel = isDeposit ? 'Gửi tiết kiệm' : 'Rút tiết kiệm';

  return (
    <View style={[styles.container, commonStyles.box_shadow_transaction]}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <View style={[styles.typeDot, { backgroundColor: valueColor }]} />
          <Text style={styles.typeLabel}>{typeLabel}</Text>
        </View>
        <Text style={styles.date}>{dateStr}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.money, { color: valueColor }]}>{displayValue}</Text>
        {note ? <Text style={styles.note} numberOfLines={2}>{note}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  typeLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  money: {
    fontWeight: '700',
    fontSize: 16,
  },
  note: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'right',
    marginLeft: 15,
  },
});
