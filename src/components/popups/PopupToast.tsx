import { Colors } from '@/constants/theme';
import React, { useImperativeHandle, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { PopupRef } from '../../types/view.types';

export interface ToastConfig {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

interface PopupToastProps {
  ref: React.Ref<PopupRef>;
}

export const PopupToast = ({ ref }: PopupToastProps) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ToastConfig | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    onShow: (data?: any) => {
      const toastData = data as ToastConfig;
      setConfig(toastData);
      setVisible(true);

      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Auto hide after duration (default 3000ms)
      const duration = toastData.duration || 3000;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    onClose: () => {
      hideToast();
    },
  }), []);

  const hideToast = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setConfig(null);
    });
  };

  const getBackgroundColor = () => {
    switch (config?.type) {
      case 'success':
        return Colors.success || '#4caf50';
      case 'error':
        return Colors.error || '#f44336';
      default:
        return Colors.primary || '#1a73e8';
    }
  };

  const getIcon = () => {
    switch (config?.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  if (!visible || !config) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: getBackgroundColor(), opacity }
        ]}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={styles.message}>{config.message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    fontSize: 16,
    color: '#ffffff',
    marginRight: 8,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
});