import { COLOR_APP } from '@/constants/constants';
import { InfoTransaction } from '@/types/info.types';
import { formatSmartMoney } from '@/utils/convertData';
import { commonStyles } from '@/utils/styles_shadow';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface dataPayment {
  data: InfoTransaction
}

export default function ItemInvestPayment({ data }: dataPayment) {
  const {type, date_buy, total_value, rate_value, quantity} = data;
  const dateStr = moment(date_buy * 1000).format('DD/MM/YYYY');
  return (
    <View style={[styles.container, commonStyles.box_shadow_transaction]}>
      <View style={[styles.row, { marginBottom: 2 }]}>
        <Text style={[{ color: type == 0 ? COLOR_APP.red : COLOR_APP.green },
        styles.money]}>{`${type === 0 ? '-' : '+'}${formatSmartMoney(total_value)}`}
        </Text>
        <Text style={[styles.note, { marginLeft: 15 }]}>{dateStr}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.note]}>{data.note}</Text>
        <Text style={[styles.rate_value, { marginLeft: 15 }]}>{`${formatSmartMoney(rate_value || 0)} x ${quantity}`}</Text>
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
    marginVertical: 8,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 10
  },
  point: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginRight: 5
  },
  rate_value: {
    color: COLOR_APP.blue,
    fontWeight: '600',
    fontSize: 12
  }
})