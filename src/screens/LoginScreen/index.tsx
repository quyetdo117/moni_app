
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { loginUser, registerUser } from '@/services/Api/auth.services';
import { useUserStore } from '@/store/main.store';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
    setIsLogin(!isLogin);
  };

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
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={styles.appName}>MoniSocial</Text>
          <Text style={styles.tagline}>Quản lý tài chính thông minh</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.title}>{isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</Text>
          
          <View style={styles.formContainer}>
            {isLogin ? <BoxLogin ref={loginBox} /> : <BoxRegister ref={registerBox} />}
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={onPressButton}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </Text>
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            </Text>
            <TouchableOpacity onPress={onChangeOption}>
              <Text style={styles.switchButtonText}>
                {isLogin ? ' Đăng ký ngay' : ' Đăng nhập'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
    ...Shadows.md,
  },
  logoText: {
    fontSize: 36,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  appName: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  formSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    ...Shadows.lg,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  formContainer: {
    marginBottom: Spacing.base,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  submitButtonText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.base,
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  switchText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
  },
  switchButtonText: {
    color: Colors.accent,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
