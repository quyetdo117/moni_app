import AntDesign from '@expo/vector-icons/AntDesign';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { Ref, useImperativeHandle, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { BoxRef, LoginForm } from '../LoginScreen.types';

export default function BoxLogin({ ref }: { ref: Ref<BoxRef<LoginForm>> }) {

    const initData = {
        email: '',
        password: ''
    }

    const [dataForm, setData] = useState<LoginForm>(initData);
    const { email, password } = dataForm;

    const [isShowPass, setIsShow] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
        getDataForm
    }))

    const onChangeIsShow = () => {
        setIsShow(!isShowPass)
    }

    const getDataForm = () => {
        return dataForm
    }

    const onChangeValue = (txt: string, type: string) => {
        setData({
            ...dataForm,
            [type]: txt
        })
    }

    return (
        <View style={styles.content}>
            <View style={styles.box}>
                <TextInput
                    value={email}
                    onChangeText={(txt) => onChangeValue(txt, 'email')}
                    placeholder='SDT/Email...'
                />
            </View>
            <View style={[styles.box, styles.box_pass]}>
                <TextInput
                    value={password}
                    style={{flex: 1}}
                    secureTextEntry={!isShowPass}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={(txt) => onChangeValue(txt, 'password')}
                    placeholder='Password...'
                />
                <RNBounceable onPress={onChangeIsShow}>
                    <AntDesign name="eye" size={20} color="black" />
                </RNBounceable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    box: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginTop: 20
    },
    content: {
    },
    box_pass: {
        flexDirection: 'row',
        alignItems: 'center'
    }
})
