import ButtonAnimated from '@/components/common/ButtonAnimated';
import { COLOR_APP } from '@/constants/constants';
import { loginUser, registerUser } from '@/services/Api/auth.services';
import { useUserStore } from '@/store/main.store';
import { line_min } from '@/utils/convertData';
import { commonStyles } from '@/utils/styles_shadow';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BoxLogin from './Boxs/BoxLogin';
import BoxRegister from './Boxs/BoxRegister';
import { BoxRef, LoginForm, RegisterForm } from './LoginScreen.types';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const registerBox = useRef<BoxRef<RegisterForm>>(null);
  const loginBox = useRef<BoxRef<LoginForm>>(null);
  const setStateLogin = useUserStore((state) => state.setStateLogin);
  const setUidUser = useUserStore((state) => state.setUidUser);


  const onChangeOption = () => {
    setIsLogin(!isLogin)
  }

  const onPressButton = async () => {
    const dataBody = isLogin
      ? loginBox.current?.getDataForm()
      : registerBox.current?.getDataForm();

    if (!dataBody) return;
    const dataJson = isLogin
      ? await loginUser(dataBody as LoginForm)
      : await registerUser(dataBody as RegisterForm);

    if (dataJson.success && dataJson.data) {
      setUidUser(dataJson.data.uid);
      setStateLogin(true);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</Text>
        {
          isLogin ? <BoxLogin ref={loginBox} /> : <BoxRegister ref={registerBox} />
        }
        <ButtonAnimated
          onPress={onPressButton}
          style={[styles.btn, commonStyles.box_shadow]}
          style_txt={{ fontWeight: '600' }}
          title={isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
        />
        <RNBounceable>
          <Text style={styles.txt_more} onPress={onChangeOption}>{isLogin ? 'Tạo tài khoản' : 'Đăng Nhập'}</Text>
        </RNBounceable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLOR_APP.blue,
    flex: 1,
    justifyContent: 'center'
  },
  content: {

  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30
  },
  btn: {
    backgroundColor: COLOR_APP.blue,
    borderWidth: line_min,
    borderColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20
  },
  txt_more: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '600',
    marginTop: 10,
    padding: 5
  }
})
