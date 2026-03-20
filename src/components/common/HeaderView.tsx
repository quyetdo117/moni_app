import { commonStyles } from '@/utils/styles_shadow';
import Ionicons from '@expo/vector-icons/Ionicons';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
    title: string,
    onBack?: Function,
    isCenter?: boolean
}

export default function HeaderView({ title, onBack, isCenter }: HeaderProps) {
    const insets = useSafeAreaInsets();

    const onPressBack = () => {
        if (onBack) {
            onBack()
        }
    }

    return (
        <View style={[{ paddingTop: insets.top },
        styles.header,
        commonStyles.box_shadow
        ]}>
            <RNBounceable onPress={onPressBack}>
               <Ionicons name="chevron-back" size={24} color="black" />
            </RNBounceable>
            <View style={[{flex: 1, marginLeft: 10},
                isCenter ? {alignItems: 'center'} : null]}>
                <Text style={styles.title}>{title}</Text>
            </View>
            <View style={{ width: 22 }} />
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#fff',
        paddingBottom: 10,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        color: '#000',
        fontSize: 25,
        fontWeight: 'bold'

    }
})
