
import { COLOR_APP } from '@/constants/constants';
import { calculateROI, formatSmartMoney } from '@/utils/convertData';
import { commonStyles } from '@/utils/styles_shadow';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DataInvestItem } from '../types/Investment.types';

interface ItemInvestProps {
  data: DataInvestItem, 
  onPress?: Function
}

export default function ItemInvest({ data, onPress }: ItemInvestProps) {
  const { name, total_value, total_market, market_value, quantity } = data;
  const roi_value = calculateROI(total_value, total_market || 0);

  const onPressItem = () => {
    if(onPress) {
      onPress(data)
    }
  }
  return (
    <RNBounceable onPress={onPressItem} style={[styels.box, commonStyles.box_shadow]}>
      <View style={styels.row}>
        <Text style={styels.title}>{name}</Text>
        <Text style={styels.date}>{`SL: ${quantity ?? 0}`}</Text>
      </View>
      <View style={styels.row}>
        <View>
          <Text style={styels.date}>{'Vốn:'}</Text>
          <Text style={styels.price}>{formatSmartMoney(total_value)}</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styels.date}>{'Giá trị:'}</Text>
          <Text style={styels.price}>{formatSmartMoney(total_market || 0)}</Text>
        </View>
      </View>
       <View style={styels.row}>
        <Text style={styels.date}>{`Giá TT: ${formatSmartMoney(market_value || 0)}`}</Text>
        <Text style={styels.roi}>{`ROI: ${roi_value}%`}</Text>
      </View>
    </RNBounceable>
  )
}

const styels = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10
  },
  title: {
    fontWeight: 600,
    fontSize: 16
  },
  date: {
    fontSize: 12,
    color: '#999'
  },
  price: {
    color: COLOR_APP.green,
    fontWeight: '600',
    fontSize: 14
  },
  roi: {
    fontSize: 12,
    fontWeight: '600'
  }
})
