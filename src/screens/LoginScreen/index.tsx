
import ButtonAnimated from '@/components/common/ButtonAnimated';
import { loginUser, registerUser } from '@/services/Api/auth.services';
import { useUserStore } from '@/store/main.store';
import { commonStyles } from '@/utils/styles_shadow';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Brand Section */}
        <View style={styles.headerSection}>
          <Text style={styles.appName}>MoniSocial</Text>
          <Text style={styles.tagline}>Quản lý tài chính thông minh</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.title}>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'}</Text>
          <View style={styles.formContainer}>
            {isLogin ? <BoxLogin ref={loginBox} /> : <BoxRegister ref={registerBox} />}
          </View>
          
          <ButtonAnimated
            onPress={onPressButton}
            style={[styles.btn, commonStyles.box_shadow]}
            style_txt={{ fontWeight: Typography.fontWeight.semiBold }}
            title={isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
          />
          <RNBounceable>
            <Text style={styles.txt_more} onPress={onChangeOption}>
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </Text>
          </RNBounceable>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  appName: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  formSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...StyleSheet.flatten(commonStyles.box_shadow),
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  formContainer: {
    marginBottom: Spacing.base,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.base,
    marginTop: Spacing.sm,
  },
  txt_more: {
    color: Colors.accent,
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.base,
    padding: Spacing.sm,
  }
})
