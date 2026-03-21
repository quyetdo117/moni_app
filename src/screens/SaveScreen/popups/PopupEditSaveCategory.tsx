import { COLOR_APP } from '@/constants/constants';
import { updateCategorySave } from '@/services/Api/transaction.services';
import { PopupRef } from '@/types/view.types';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import moment from 'moment';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SaveDetailData } from '../SaveDetailScreen';

interface PopupEditSaveCategoryProps {
    onSuccess?: (data: SaveDetailData) => void;
}

const PopupEditSaveCategory = forwardRef<PopupRef, PopupEditSaveCategoryProps>((props, ref) => {
    const { onSuccess } = props;
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [isOpen, setOpen] = useState(false);
    const [dataForm, setDataForm] = useState<SaveDetailData | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const snapPoints = useMemo(() => ['55%'], []);

    useImperativeHandle(ref, () => ({
        onShow,
        onClose
    }));

    const onClose = () => {
        setOpen(false);
        bottomSheetRef.current?.close();
    }

    const onShow = (data?: SaveDetailData) => {
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

    const onChangeText = (key: string, value: string) => {
        if (dataForm) {
            const newData = { ...dataForm, [key]: value };
            setDataForm(newData);
        }
    };

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate && dataForm) {
            const timestamp = moment(selectedDate).unix();
            setDataForm({
                ...dataForm,
                date_buy: timestamp,
                createdAt: timestamp
            });
        }
    };

    const onSave = async () => {
        if (!dataForm) return;

        try {
            const result = await updateCategorySave({
                id: dataForm.id,
                name: dataForm.name,
                target_value: dataForm.target || 0,
                date_buy: dataForm.date_buy || 0,
                total_market: dataForm.total_market || dataForm.total_value || 0,
            });

            if (result.success) {
                const updatedData: SaveDetailData = {
                    ...dataForm,
                    name: dataForm.name,
                    target: dataForm.target,
                    date_buy: dataForm.date_buy,
                    createdAt: dataForm.createdAt
                };

                onSuccess?.(updatedData);
                bottomSheetRef.current?.close();
                setOpen(false);
            } else {
                Alert.alert('Lỗi', result.message || 'Cập nhật thất bại');
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Cập nhật thất bại');
        }
    };

    const dateStr = dataForm?.date_buy ? moment(dataForm.date_buy * 1000).format('DD/MM/YYYY') : '';
    const targetStr = dataForm?.target?.toString() || '';

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
                <Text style={styles.title}>Chỉnh sửa thông tin</Text>

                {/* Name Input */}
                <Text style={styles.label}>Tên</Text>
                <TextInput
                    style={styles.input}
                    value={dataForm.name}
                    onChangeText={(value) => onChangeText('name', value)}
                    placeholder="Nhập tên"
                />

                {/* Target Input */}
                <Text style={styles.label}>Mục tiêu (VNĐ)</Text>
                <TextInput
                    style={styles.input}
                    value={targetStr}
                    onChangeText={(value) => onChangeText('target', value)}
                    keyboardType="numeric"
                    placeholder="Nhập số tiền mục tiêu"
                />

                {/* Current Amount Display */}
                <View style={styles.rowInfo}>
                    <Text style={styles.label}>Số tiền hiện tại:</Text>
                    <Text style={styles.valueInfo}>
                        {((dataForm.total_market || dataForm.total_value) || 0).toLocaleString()} ₫
                    </Text>
                </View>

                {/* Date Picker */}
                <Text style={styles.label}>Ngày tạo</Text>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={styles.dateText}>{dateStr || 'Chọn ngày'}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={new Date((dataForm.date_buy || Date.now() / 1000) * 1000)}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                    />
                )}

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
        marginBottom: 20,
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
        padding: 12,
        fontSize: 14,
    },
    rowInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    valueInfo: {
        fontSize: 14,
        fontWeight: '600',
        color: COLOR_APP.blue,
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
        marginTop: 10,
        marginBottom: 40,
        marginHorizontal: 20
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

PopupEditSaveCategory.displayName = 'PopupEditSaveCategory';

export default PopupEditSaveCategory;
