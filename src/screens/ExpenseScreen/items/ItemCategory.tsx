import { Category } from '@/types/schema.types';
import { formatSmartMoney_2 } from '@/utils/convertData';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React from 'react';
import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

interface ItemProps {
    style_box?: StyleProp<ViewStyle>,
    data: Category,
    onPress?: (data?: Category) => void
}

export default function ItemCategory({ style_box, data, onPress }: ItemProps) {
    const onPressBtn = () => {
        if(onPress){
            onPress(data)
        }
    }
    return (
        <RNBounceable style={[styles.box, style_box]} onPress={onPressBtn}>
            <Text style={styles.title}>{data.name}</Text>
            <Text style={styles.money}>{formatSmartMoney_2(data.total_value, true)}</Text>
        </RNBounceable>
    )
}

const styles = StyleSheet.create({
    box: {
        backgroundColor: 'red',
        minWidth: 80,
        paddingHorizontal: 15,
        borderRadius: 25,
        flexDirection: 'row',
        marginLeft: 10,
        alignItems: 'center',
        height: 40
    },
    title: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        marginRight: 5
    },
    money: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600'
    }
})
