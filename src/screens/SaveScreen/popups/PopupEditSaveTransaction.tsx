import { COLOR_APP } from '@/constants/constants';
import { updateTransaction } from '@/services/Api/transaction.services';
import { InfoTransaction } from '@/types/info.types';
import { PopupRef } from '@/types/view.types';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import moment from 'moment';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface PopupEditSaveTransactionProps {
    onSuccess?: (data: InfoTransaction) => void;
}

const PopupEditSaveTransaction = forwardRef<PopupRef, PopupEditSaveTransactionProps>((props, ref) => {
    const { onSuccess } = props;
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [isOpen, setOpen] = useState(false);
    const [dataForm, setDataForm] = useState<InfoTransaction | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const snapPoints = useMemo(() => ['70%'], []);

    useImperativeHandle(ref, () => ({
        onShow,
        onClose
    }));

    const onClose = () => {
        setOpen(false);
        bottomSheetRef.current?.close();
    }

    const onShow = (data?: InfoTransaction) => {
        if (data) {
            setDataForm(data);
        }
        setOpen(true);
        bottomSheetRef.current?.expand();
    }

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
        []
    );

    const onChangeText = (key: string, value: any) => {
        if (dataForm) {
            const newData = { ...dataForm, [key]: value };
            setDataForm(newData);
        }
    };

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate && dataForm) {
            setDataForm({
                ...dataForm,
                date_buy: moment(selectedDate).unix()
            });
        }
    };

    const onGetValue = (type: string) => {
        if (!dataForm) return '';
        const { total_value } = dataForm;
        switch (type) {
            case 'total_value':
                return total_value?.toString() || '';
            default:
                return '';
        }
    }

    const onSave = async () => {
        if (!dataForm) return;

        try {
            const jsonData = await updateTransaction(dataForm);
            if (jsonData.success && jsonData.data) {
                onSuccess?.(jsonData.data as InfoTransaction);
                bottomSheetRef.current?.close();
                setOpen(false);
            } else {
                Alert.alert('Lỗi', jsonData.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Đã xảy ra lỗi');
        }
    };

    const dateStr = dataForm ? moment(dataForm.date_buy * 1000).format('DD/MM/YYYY') : '';

    if (!isOpen || !dataForm) return null;

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            onClose={() => setOpen(false)}
            backdropComponent={renderBackdrop}
            enablePanDownToClose
        >
            <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>Chỉnh sửa giao dịch tiết kiệm</Text>

                {/* Name Input - Read only */}
                <Text style={styles.label}>Tên</Text>
                <Text style={styles.inputDisabled}>
                    {dataForm.name}
                </Text>

                {/* Type - Read only */}
                <Text style={styles.label}>Loại giao dịch</Text>
                <Text style={styles.inputDisabled}>
                    {dataForm.type === 1 ? 'Gửi tiết kiệm' : 'Rút tiết kiệm'}
                </Text>

                {/* Total Value Input */}
                <Text style={styles.label}>Số tiền</Text>
                <BottomSheetTextInput
                    style={styles.input}
                    value={onGetValue('total_value')}
                    onChangeText={(value) => onChangeText('total_value', value)}
                    keyboardType="numeric"
                    placeholder="Nhập số tiền"
                />

                {/* Date Picker */}
                <Text style={styles.label}>Ngày</Text>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={styles.dateText}>{dateStr}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={new Date(dataForm.date_buy * 1000)}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                    />
                )}

                {/* Note Input */}
                <Text style={styles.label}>Ghi chú</Text>
                <BottomSheetTextInput
                    style={[styles.input, styles.noteInput]}
                    value={dataForm.note || ''}
                    onChangeText={(value) => onChangeText('note', value)}
                    placeholder="Nhập ghi chú"
                    multiline
                />

            </BottomSheetScrollView>
            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    contentContainer: {
        marginHorizontal: 20
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    inputDisabled: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        backgroundColor: '#f5f5f5',
        color: '#666',
        fontWeight: 'bold'
    },
    noteInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
    },
    dateText: {
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: COLOR_APP.blue,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 40,
        marginHorizontal: 20
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

PopupEditSaveTransaction.displayName = 'PopupEditSaveTransaction';

export default PopupEditSaveTransaction;
