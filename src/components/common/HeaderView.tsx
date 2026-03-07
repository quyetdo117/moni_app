import { commonStyles } from '@/utils/styles_shadow';
import AntDesign from '@expo/vector-icons/AntDesign';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
    title: string,
    onBack?: Function
}

export default function HeaderView({ title, onBack}: HeaderProps) {
    const insets = useSafeAreaInsets();

    const onPressBack = () => {
        if(onBack){
            onBack()
        }
    }

    return (
        <View style={[{paddingTop: insets.top}, styles.header, commonStyles.box_shadow]}>
            <RNBounceable onPress={onPressBack}>
                <AntDesign name="arrow-left" size={22} color="black" />
            </RNBounceable>
            <Text style={styles.title}>{title}</Text>
            <View style={{width: 22}}/>
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
        fontSize: 20,
        fontWeight: '600'
        
    }
})
