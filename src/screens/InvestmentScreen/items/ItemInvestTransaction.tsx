
import { COLOR_APP } from '@/constants/constants';
import { formatSmartMoney } from '@/utils/convertData';
import { commonStyles } from '@/utils/styles_shadow';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DataTransaction } from '../types/Investment.types';

interface ItemTransactionProps {
    data: DataTransaction
}

export default function ItemInvestTransaction({ data }: ItemTransactionProps) {

    const {quantity, date_buy, rate_value, market_value, total_value, extra_value} = data;
    return (
        <RNBounceable style={[styles.container, commonStyles.box_shadow_transaction]}>
            <View style={styles.row}>
                <View style={styles.row_txt}>
                    <Text style={styles.title}>{'Số lượng: '}</Text>
                    <Text style={styles.title}>{quantity}</Text>
                </View>
                <View style={styles.row_txt}>
                    <Text style={styles.value}>{date_buy}</Text>
                </View>
            </View>
            <View style={styles.row}>
                <View style={styles.row_txt}>
                    <Text style={styles.title}>{'Tỉ giá: '}</Text>
                    <Text style={[styles.title, { color: COLOR_APP.green }]}>{formatSmartMoney(rate_value)}</Text>
                </View>
                <View style={styles.row_txt}>
                    <Text style={styles.title}>{'Thị giá: '}</Text>
                    <Text style={[styles.title, { color: COLOR_APP.green }]}>{formatSmartMoney(market_value)}</Text>
                </View>
            </View>
            <View style={styles.row}>
                <View style={styles.row_txt}>
                    <Text style={styles.title}>{'Tổng vốn: '}</Text>
                    <Text style={styles.title}>{formatSmartMoney(total_value)}</Text>
                </View>
                <View style={styles.row_txt}>
                    <Text style={styles.title}>{'Phí phát sinh: '}</Text>
                    <Text style={styles.title}>{formatSmartMoney(extra_value)}</Text>
                </View>
            </View>
        </RNBounceable>
    )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    backgroundColor: '#f2f6f9',
    marginVertical: 5,
    borderRadius: 15,
    padding: 10
  },
  row_txt: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2
  },
  title: {
    color: '#999',
    fontWeight: '600',
    fontSize: 14
  },
  value: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16
  }
})
