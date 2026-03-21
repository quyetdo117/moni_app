
import { formatSmartMoney } from '@/utils/convertData';
import { commonStyles } from '@/utils/styles_shadow';
import RNBounceable from "@freakycoder/react-native-bounceable";
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface BoxMoneyProps {
  style?: StyleProp<ViewStyle>,
  data: {
    name: string;
    total_value: number
  },
  onPress?: Function,
  style_box?: StyleProp<ViewStyle>,
  style_txt?: StyleProp<TextStyle>,
  variant?: 'default' | 'primary' | 'success';
}

export default function BoxMoney({ style, data, onPress, style_box, style_txt, variant = 'default' }: BoxMoneyProps) {

  const onPressBtn = () => {
    if (onPress) {
      onPress(data)
    }
  }

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.boxPrimary;
      case 'success':
        return styles.boxSuccess;
      default:
        return {};
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return Colors.textInverse;
      case 'success':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <RNBounceable onPress={onPressBtn} style={[style]} disabled={!onPress}>
      <View style={[
        styles.box, 
        commonStyles.box_shadow, 
        getVariantStyle(), 
        style_box
      ]}>
        <Text style={[
          styles.title, 
          variant === 'primary' && styles.titlePrimary,
          style_txt
        ]}>{data.name}</Text>
        <Text style={[
          styles.txt_money, 
          { color: getTextColor() },
          style_txt
        ]}>{formatSmartMoney(data.total_value)}</Text>
      </View>
    </RNBounceable>
  )
}

const styles = StyleSheet.create({
  box: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    minWidth: 140,
    backgroundColor: Colors.surface,
  },
  boxPrimary: {
    backgroundColor: Colors.primary,
  },
  boxSuccess: {
    backgroundColor: Colors.successLight,
  },
  title: {
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  titlePrimary: {
    color: Colors.textInverse,
  },
  txt_money: {
    fontWeight: Typography.fontWeight.bold,
    fontSize: Typography.fontSize.lg,
  }
})
