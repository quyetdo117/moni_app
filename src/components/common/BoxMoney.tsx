import { formatSmartMoney } from '@/utils/convertData';
import { commonStyles } from '@/utils/styles_shadow';
import RNBounceable from "@freakycoder/react-native-bounceable";
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface BoxMoneyProps {
  style?: StyleProp<ViewStyle>,
  data: {
    name: string;
    total_value: number
  },
  onPress?: Function,
  style_box?: StyleProp<ViewStyle>,
  style_txt?: StyleProp<TextStyle>
}

export default function BoxMoney({ style, data, onPress, style_box, style_txt }: BoxMoneyProps) {

  const onPressBtn = () => {
    if (onPress) {
      onPress(data)
    }
  }

  return (
    <RNBounceable onPress={onPressBtn} style={[style]} disabled={!onPress}>
      <View style={[commonStyles.box_shadow, styles.box, style_box]}>
        <Text style={[styles.title, style_txt]}>{data.name}</Text>
        <Text style={[styles.txt_money, style_txt]}>{formatSmartMoney(data.total_value)}</Text>
      </View>
    </RNBounceable>
  )
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 10,
    padding: 10,
    minWidth: 150,
    margin: 5,
    backgroundColor: '#fff'
  },
  title: {
    fontWeight: '600',
    fontSize: 16
  },
  txt_money: {
    fontWeight: '600',
    color: '#00CC00',
    fontSize: 18,
    marginTop: 5
  }
})
