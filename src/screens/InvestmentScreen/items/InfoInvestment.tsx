import { COLOR_APP } from '@/constants/constants';
import { calculateROI } from '@/utils/calculate';
import { formatSmartMoney } from '@/utils/format';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DataInvestItem } from '../types/Investment.types';

interface InfoInvestmentProps {
  data: DataInvestItem
}

export default function InfoInvestment({ data }: InfoInvestmentProps) {

  const { title, value_current, value_origin, date_buy } = data;

  const roi_value = calculateROI(value_origin, value_current);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.row_txt}>
          <Text style={styles.name}>{title}</Text>
        </View>
        <View style={styles.row_txt}>
          <Text style={styles.date}>{'Ngày mua: '}</Text>
          <Text style={styles.date}>{date_buy}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.row_txt}>
          <Text style={styles.title}>{'Tổng vốn: '}</Text>
          <Text style={[styles.title, { color: COLOR_APP.green }]}>{formatSmartMoney(value_origin)}</Text>
        </View>
        <View style={styles.row_txt}>
          <Text style={styles.title}>{'Giá trị: '}</Text>
          <Text style={[styles.title, { color: COLOR_APP.green }]}>{formatSmartMoney(value_current)}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.row_txt}>
          <Text style={styles.title}>{'Số lượng: '}</Text>
          <Text style={styles.title}>{1}</Text>
        </View>
        <View style={styles.row_txt}>
          <Text style={styles.title}>{'ROI: '}</Text>
          <Text style={styles.title}>{`${roi_value}%`}</Text>
        </View>
      </View>
      <Text style={styles.txt}>{'Các giao dịch'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10
  },
  row_txt: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2
  },
  title: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14
  },
  value: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16
  },
  name: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold'
  },
  date: {
    color: '#000',
    fontSize: 12
  },
  txt: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5
  }
})
