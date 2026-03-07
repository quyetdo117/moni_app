import { getColorCategory } from '@/constants/constants';
import { InfoTransaction } from '@/types/info.types';
import { formatSmartMoney } from '@/utils/format';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface dataPayment {
  data: InfoTransaction
}

export default function ItemPayment({ data }: dataPayment) {
  const type = data?.type;
  const date_buy = data.date_buy;
  const dateStr = moment(date_buy * 1000).format('DD/MM/YYYY');
  const type_expense = data.type_expense;
  return (
    <View style={[styles.container]}>
      <View style={[styles.row, { marginBottom: 2 }]}>
        <View style={[styles.row, { alignItems: 'center' }]}>
          <View style={[styles.point,
          type_expense ? { backgroundColor: getColorCategory(type_expense) } : null]} />
          <Text style={[styles.title]}>{
            data.name
          }</Text>
        </View>
        <Text style={[{ color: type == 0 ? 'red' : '#00CC00' },
        styles.money]}>{`${type === 0 ? '-' : '+'}${formatSmartMoney(data.total_value)}`}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.note}>{data.note}</Text>
        <Text style={[styles.note, { marginLeft: 15 }]}>{dateStr}</Text>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  money: {
    fontWeight: '600',
    fontSize: 14
  },
  note: {
    fontSize: 12,
    color: '#666'
  },
  title: {
    fontWeight: '600',
    fontSize: 14
  },
  container: {
    marginHorizontal: 15,
    marginVertical: 5
  },
  point: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginRight: 5
  }
})