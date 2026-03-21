import React, { useCallback, useImperativeHandle, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../constants/theme';
import { PopupRef } from '../../types/view.types';

export interface ShowPopupConfig {
  title: string;
  data?: any;
  onConfirm: (data?: any) => void;
  onCancel?: () => void;
}

interface PopupConfirmProps {
  ref: React.Ref<PopupRef>;
}

export const PopupConfirm = ({ ref }: PopupConfirmProps) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ShowPopupConfig | null>(null);

  useImperativeHandle(ref, () => ({
    onShow: (data?: any) => {
      setConfig(data as ShowPopupConfig);
      setVisible(true);
    },
    onClose: () => {
      setVisible(false);
    },
  }), []);

  const handleConfirm = useCallback(() => {
    if (config?.onConfirm) {
      config.onConfirm(config.data);
    }
    setVisible(false);
  }, [config]);

  const handleCancel = useCallback(() => {
    if (config?.onCancel) {
      config.onCancel();
    }
    setVisible(false);
  }, [config]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}>
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={styles.content}>
            <Text style={styles.title}>{config?.title || ''}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              activeOpacity={0.7}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
              activeOpacity={0.7}>
              <Text style={styles.confirmText}>Đồng ý</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});

