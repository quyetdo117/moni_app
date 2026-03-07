import AntDesign from '@expo/vector-icons/AntDesign';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { Ref, useImperativeHandle, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { BoxRef, RegisterForm } from '../LoginScreen.types';


export default function BoxRegister({ ref }: { ref: Ref<BoxRef<RegisterForm>> }) {

    const dataInit = {
        name: '',
        email: '',
        password: '',
        rePassword: ''
    }

    const [dataForm, setData] = useState<RegisterForm>(dataInit)
    const { name, email, password, rePassword } = dataForm;

    const [isShowPass, setIsShow] = useState<boolean>(false);

    const onChangeIsShow = () => {
        setIsShow(!isShowPass)
    }

    useImperativeHandle(ref, () => ({
        getDataForm
    }))

    const getDataForm = () => {
        if(password !== rePassword){
            Alert.alert('Mật khẩu không khớp !!!')
            return undefined
        } else if(!name || !email || !password || !rePassword){
            Alert.alert('Nhập đủ thông tin !!!')
            return undefined
        } else {
            return dataForm
        }
    }

    const onChangeValue = (txt: string, type: string) => {
        setData({
            ...dataForm,
            [type]: txt
        })
    }

    return (
        <View>
            <View style={styles.content}>
                <View style={styles.box}>
                    <TextInput
                        value={name}
                        onChangeText={(txt) => onChangeValue(txt, 'name')}
                        placeholder='Nhập tên...'
                    />
                </View>
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
                        style={{ flex: 1 }}
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
                <View style={[styles.box, styles.box_pass]}>
                    <TextInput
                        value={rePassword}
                        style={{ flex: 1 }}
                        secureTextEntry={!isShowPass}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={(txt) => onChangeValue(txt, 'rePassword')}
                        placeholder='Re-Password...'
                    />
                    <RNBounceable onPress={onChangeIsShow}>
                        <AntDesign name="eye" size={20} color="black" />
                    </RNBounceable>
                </View>
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
