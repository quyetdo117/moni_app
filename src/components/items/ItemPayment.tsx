import { COLOR_APP, getColorCategory, TYPE_TRANSACTION } from '@/constants/constants';
import { useUserStore } from '@/store/main.store';
import { InfoTransaction } from '@/types/info.types';
import { formatSmartMoney } from '@/utils/format';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface dataPayment {
  data: InfoTransaction
}

export default function ItemPayment({ data }: dataPayment) {
  const infoAsset = useUserStore(state => state.infoAsset);

  const { type, date_buy, type_expense, asset_id } = data;

  const isInvest = asset_id === infoAsset.invest?.id;
  const isExpense = asset_id === infoAsset.expense?.id;
  const dateStr = moment(date_buy * 1000).format('DD/MM/YYYY');
  const color_title = (type == TYPE_TRANSACTION.IN && isExpense) || (type == TYPE_TRANSACTION.OUT && isInvest)
    ? COLOR_APP.green : COLOR_APP.red;
  const prefix = (type == TYPE_TRANSACTION.IN && isExpense) || (type == TYPE_TRANSACTION.OUT && isInvest)
    ? '+' : '-';
  return (
    <View style={[styles.container]}>
      <View style={[styles.row, { marginBottom: 2 }]}>
        <View style={[styles.row, { alignItems: 'center' }]}>
          {
            isInvest ?
              <FontAwesome6 name="coins" size={16} color={COLOR_APP.yellow} />
              : null
          }
          {type_expense ? <View style={[styles.point, { backgroundColor: getColorCategory(type_expense) }]} /> : null}
          <Text style={[styles.title]}>{
            data.name
          }</Text>
        </View>
        <Text style={[{ color: color_title },
        styles.money]}>{`${prefix}${formatSmartMoney(data.total_value)}`}
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
    fontSize: 14,
    marginLeft: 10
  },
  container: {
    marginHorizontal: 15,
    marginVertical: 5
  },
  point: {
    width: 10,
    height: 10,
    borderRadius: 10
  }
})