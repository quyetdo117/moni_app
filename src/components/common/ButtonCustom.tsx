
import { COLOR_APP } from '@/constants/constants';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { ElementType } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

interface ButtonProps {
    style_btn?: StyleProp<ViewStyle>;
    style_txt?: StyleProp<TextStyle>;
    Icon?: ElementType;
    name_icon?: string;
    title: string;
    onPress?: Function
}

export default function ButtonCustom({ style_txt, style_btn, Icon, title, name_icon, onPress }: ButtonProps) {
    const onPressButton = () => {
        if (onPress) {
            onPress();
        }
    }

    return (
        <RNBounceable onPress={onPressButton} style={[styles.btn, style_btn]}>
            {Icon && <Icon style={styles.icon} name={name_icon} size={20} color={style_txt || "#fff"} />}
            <Text style={[styles.txt, style_txt]}>{title}</Text>
        </RNBounceable>
    )
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: COLOR_APP.green,
        borderRadius: 10,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    txt: {
        color: "#fff",
        fontWeight: '600',
        fontSize: 16
    },
    icon: {
        marginRight: 5
    }
})
