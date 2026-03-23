
import { useUserStore } from '@/store/main.store';
import { MainTabScreenProps } from '@/types/navigation.types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

export default function AccountScreen({ navigation, route }: MainTabScreenProps<'Account'>) {
  const infoUser = useUserStore(state => state.infoUser);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tài khoản</Text>
        <Text style={styles.subtitle}>Chức năng tài khoản đang được phát triển</Text>
      </View>
    </View>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
