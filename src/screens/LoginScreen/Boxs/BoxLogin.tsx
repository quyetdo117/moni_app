import AntDesign from '@expo/vector-icons/AntDesign';
import React, { Ref, useImperativeHandle, useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../../constants/theme';
import { BoxRef, LoginForm } from '../LoginScreen.types';

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

export default function BoxLogin({ ref }: { ref: Ref<BoxRef<LoginForm>> }) {
  const initData = {
    email: '',
    password: '',
  };

  const [dataForm, setData] = useState<LoginForm>(initData);
  const { email, password } = dataForm;

  const [isShowPass, setIsShow] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    getDataForm,
  }));

  const onChangeIsShow = () => {
    setIsShow(!isShowPass);
  };

  const getDataForm = () => {
    return dataForm;
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
            <AntDesign
              name="eye"
              size={20}
              color={Colors.textSecondary}
            />
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
