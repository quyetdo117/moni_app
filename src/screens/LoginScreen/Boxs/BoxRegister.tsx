import AntDesign from '@expo/vector-icons/AntDesign';
import React, { Ref, useImperativeHandle, useState } from 'react';
import { Alert, StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../../constants/theme';
import { BoxRef, RegisterForm } from '../LoginScreen.types';

interface InputFieldProps extends TextInputProps {
  icon?: React.ReactNode;
}

const InputField = ({ icon, style, ...props }: InputFieldProps) => (
  <View style={styles.inputContainer}>
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor={Colors.textTertiary}
      {...props}
    />
    {icon && <View style={styles.iconContainer}>{icon}</View>}
  </View>
);

export default function BoxRegister({ ref }: { ref: Ref<BoxRef<RegisterForm>> }) {
  const dataInit = {
    name: '',
    email: '',
    password: '',
    rePassword: '',
  };

  const [dataForm, setData] = useState<RegisterForm>(dataInit);
  const { name, email, password, rePassword } = dataForm;

  const [isShowPass, setIsShow] = useState<boolean>(false);

  const onChangeIsShow = () => {
    setIsShow(!isShowPass);
  };

  useImperativeHandle(ref, () => ({
    getDataForm,
  }));

  const getDataForm = () => {
    if (password !== rePassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return undefined;
    } else if (!name || !email || !password || !rePassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return undefined;
    } else {
      return dataForm;
    }
  };

  const onChangeValue = (txt: string, type: string) => {
    setData({
      ...dataForm,
      [type]: txt,
    });
  };

  return (
    <View style={styles.content}>
      <InputField
        value={name}
        onChangeText={(txt) => onChangeValue(txt, 'name')}
        placeholder="Họ và tên"
        autoCapitalize="words"
      />
      <View style={styles.spacer} />
      <InputField
        value={email}
        onChangeText={(txt) => onChangeValue(txt, 'email')}
        placeholder="Email hoặc số điện thoại"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.spacer} />
      <InputField
        value={password}
        style={styles.passwordInput}
        secureTextEntry={!isShowPass}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(txt) => onChangeValue(txt, 'password')}
        placeholder="Mật khẩu"
        icon={
          <TouchableOpacity onPress={onChangeIsShow} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <AntDesign name="eye" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        }
      />
      <View style={styles.spacer} />
      <InputField
        value={rePassword}
        style={styles.passwordInput}
        secureTextEntry={!isShowPass}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(txt) => onChangeValue(txt, 'rePassword')}
        placeholder="Nhập lại mật khẩu"
        icon={
          <TouchableOpacity onPress={onChangeIsShow} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <AntDesign name="eye" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {},
  inputContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    fontSize: Typography.fontSize.base,
    color: Colors.text,
  },
  passwordInput: {
    paddingRight: Spacing.xs,
  },
  iconContainer: {
    paddingRight: Spacing.base,
  },
  spacer: {
    height: Spacing.base,
  },
});
