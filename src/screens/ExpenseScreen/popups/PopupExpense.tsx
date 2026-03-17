
import { COLOR_APP, key_assets, types_expense } from '@/constants/constants'
import { getCategories } from '@/services/Api/get.services'
import { createTransactionExpense, updateTransaction } from '@/services/Api/transaction.services'
import { useChartStore, useUserStore } from '@/store/main.store'
import { Category } from '@/types/schema.types'
import { PopupRef } from '@/types/view.types'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import moment from 'moment'
import React, { Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
import { DataFormExpense } from '../types/Expense.types'


interface dataOption {
    name?: string
    id: string;
    title?: string;
    type: number;
    type_asset?: string
}

interface PopupExpenseProps {
    ref: Ref<PopupRef>,
    onRefresh: () => void
}

const PopupFormExpense = ({ ref, onRefresh }: PopupExpenseProps) => {

    const bottomSheetRef = useRef<BottomSheet>(null);
    const [dataType, setType] = useState<dataOption>(types_expense[0]);
    const [dataCategory, setCategory] = useState<Category | null>(null);
    const uid = useUserStore(state => state.uid);
    const infoAsset = useUserStore(state => state.infoAsset);
    const setInfoAsset = useUserStore(state => state.setInfoAsset);
    const [isOpen, setOpen] = useState(false);
    const isEdit = useRef(false);
    const isSelect = useRef(false);
    const oldDataRef = useRef<DataFormExpense | null>(null);
    const updateChartData = useChartStore(state => state.updateChartData);

    // Hàm dùng chung để cập nhật infoAsset
    const updateInfoAssetValue = (valueChange: number, transactionType: number) => {
        const currentExpenseAsset = infoAsset?.[key_assets.expense];
        if (!currentExpenseAsset) return;

        // Xác định giá trị thay đổi dựa trên type giao dịch
        // transactionType = 1 (IN/Thu nhập) -> cộng vào
        // transactionType = 0 (OUT/Chi tiêu) -> trừ đi
        const actualChange = transactionType === 1 ? valueChange : -valueChange;

        const updatedAsset = {
            ...currentExpenseAsset,
            total_value: Number(currentExpenseAsset.total_value || 0) + actualChange
        };
        setInfoAsset([updatedAsset]);
    };


    const initData = {
        type: 1,
        name: '',
        total_value: '',
        date_buy: moment(new Date()).unix(),
        note: '',
        asset_id: infoAsset?.expense?.id || '',
        category_id: '',
        user_id: uid,
    }
    const [dataForm, setDataForm] = useState<DataFormExpense>(initData);
    const { name, total_value, date_buy } = dataForm;
    const [listCate, setListCate] = useState<Category[]>([]);
    const date_ = new Date(date_buy * 1000);
    const dataStr = moment(date_buy * 1000).format('DD/MM/YYYY')

    const snapPoints = useMemo(() => ['70%'], []);

    useEffect(() => {
        getListCate();
    }, [])

    const getListCate = async () => {
        const data = await getCategories(key_assets.expense, uid)
        const dataList = data.data
        if (data.success && dataList) {
            setCategory(dataList[0]);
            onSetType(dataList[0].type);
            setDataForm({ ...dataForm, category_id: dataList[0].id, type: dataList[0].type })
            setListCate(dataList)
        } else {
            Alert.alert(data.msg)
        }
    }

    const onSetType = (type: number) => {
        if (type === 1) {
            isSelect.current = false;
            setType(types_expense[1]);
        } else if (type === 0) {
            isSelect.current = false;
            setType(types_expense[0])
        } else if (type === 2) {
            isSelect.current = true;
        }
    }

    const onShow = (data?: DataFormExpense, isEdit_ = false) => {
        if (bottomSheetRef.current) {
            bottomSheetRef.current.snapToIndex(1);
        }

        // edit
        isEdit.current = isEdit_;
        if (data) {
            // Store old data for update
            oldDataRef.current = data;
            const { category_id, type } = data
            setDataForm(data);
            const dataCate = listCate.find(item => item.id == category_id);
            if (dataCate) {
                setCategory(dataCate);
                onSetType(type);
            }
        }
    }

    const openShowDate = () => {
        setOpen(true);
    }

    const cancelDate = () => {
        setOpen(false);
    }

    const onChangeDate = (e: DateTimePickerEvent, date?: Date) => {
        cancelDate();
        setDataForm({
            ...dataForm,
            date_buy: moment(date).unix()
        })


    }

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
                ressBehavior="close"
            />
        ),
        []
    );
    const onClose = () => {
        const newCate = listCate[0];
        setCategory(newCate);
        onSetType(newCate.type);
        const dataReset = {
            ...initData,
            category_id: newCate.id, type: newCate.type
        }
        setDataForm(dataReset);
        if (bottomSheetRef.current) {
            bottomSheetRef.current.close();
        }
    }

    const onChangeText = (value: string, type: string) => {
        setDataForm({
            ...dataForm,
            [type]: value
        })
    }

    const onUpdate = async () => {
        if (name && total_value && date_buy) {
            const jsonCreate = await updateTransaction(dataForm)
            console.log('loggg dataForm', JSON.stringify(dataForm));
            if (jsonCreate.success) {
                // Calculate value change: new - old
                const valueChange = Number(total_value) - Number(oldDataRef.current?.total_value || 0);
                // Update chart with the difference
                updateChartData(key_assets.expense, valueChange, { date_buy: dataForm.date_buy, type: dataForm.type });
                // Update infoAsset
                updateInfoAssetValue(valueChange, dataForm.type);
                onClose();
            }
        } else {
            Alert.alert('Nhap du thong tin!', JSON.stringify(dataForm))
        }
    }

    const onCreate = async () => {
        if (name && total_value && date_buy) {
            const jsonCreate = await createTransactionExpense(dataForm)
            console.log('loggg dataForm', JSON.stringify(dataForm));
            if (jsonCreate.success) {
                // Add new value
                updateChartData(key_assets.expense, Number(total_value), { date_buy: dataForm.date_buy, type: dataForm.type });
                // Update infoAsset
                updateInfoAssetValue(Number(total_value), dataForm.type);
                onClose();
            }
        } else {
            Alert.alert('Nhap du thong tin!', JSON.stringify(dataForm))
        }
    }

    useImperativeHandle(ref, () => ({
        onShow,
        onClose
    }))

    const onGetTitle = (type: string) => {
        switch (type) {
            case 'name': return 'Tên';
            case 'type': return 'Loại giao dịch';
            case 'total_value': return 'Số tiền';
            case 'date_buy': return 'Ngày';
            case 'note': return 'Ghi chú';
            default: return '';
        }
    }

    const renderField = (type: string, isNote: boolean = false) => {
        const isString = type === 'note' || type === 'name';
        const isDate = type === 'date_buy';
        return (
            <>
                <Text style={styles.label}>{onGetTitle(type)}</Text>
                {isDate ? (
                    <TouchableOpacity style={styles.dateButton} onPress={() => openShowDate()}>
                        <Text style={styles.dateText}>{onGetValue(type)}</Text>
                    </TouchableOpacity>
                ) : (
                    <TextInput
                        style={[styles.input, isNote && styles.noteInput]}
                        value={onGetValue(type)}
                        onChangeText={(txt) => {
                            onChangeText(txt, type);
                        }}
                        keyboardType={isString ? 'default' : 'numeric'}
                        placeholder={`Nhập ${onGetTitle(type).toLowerCase()}`}
                        multiline={isNote}
                    />
                )}
            </>
        );
    }

    const onGetValue = (type: string) => {
        const { name, total_value, note } = dataForm;
        switch (type) {
            case 'name': return name;
            case 'total_value': return total_value.toString();
            case 'date_buy': return dataStr;
            case 'note': return note;
            default: return '';
        }
    }

    const renderItemDrop = (item: dataOption, selected?: boolean) => {
        const title = item.title || item.name;
        return (
            <View key={item.id} style={[styles.item_list, selected && { backgroundColor: COLOR_APP.blue }]}>
                <Text style={[styles.txt_list, selected && { color: '#fff' }]}>{title}</Text>
            </View>
        )
    }

    const onChangeType = (data: dataOption | Category, isCategory?: boolean) => {
        if (isCategory) {
            setCategory(data as Category)
            onSetType(data.type);
            setDataForm({
                ...dataForm,
                category_id: data.id,
                type: data.type
            })
        } else {
            setType(data as dataOption)
            setDataForm({
                ...dataForm,
                type: data.type
            })
        }
    }

    const renderTypeBox = () => {
        return (
            <>
                <Text style={styles.label}>{'Loại giao dịch'}</Text>
                <View style={[styles.input, styles.typeBox, styles.typeBoxDisabled]}>
                    <Text style={styles.typeText}>{dataType.title}</Text>
                </View>
            </>
        )
    }

    const renderBoxOption = (isCategory?: boolean) => {
        return (
            <>
                <Text style={styles.label}>{isCategory ? 'Danh mục' : 'Loại giao dịch'}</Text>
                <View style={styles.input}>
                    <Dropdown
                        data={isCategory ? listCate : types_expense}
                        disable={!isCategory && !isSelect.current}
                        labelField={isCategory ? "name" : "title"}
                        valueField={isCategory ? "name" : "title"}
                        renderItem={renderItemDrop}
                        placeholder="Chọn một mục..."
                        value={isCategory ? dataCategory : dataType}
                        onChange={item => {
                            onChangeType(item, isCategory);
                        }}
                    />
                </View>
            </>
        )
    }

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            onAnimate={(fromIndex, toIndex) => {
                if (toIndex === 0) {
                    onClose();
                }
            }}
            backdropComponent={renderBackdrop}
        >
            <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>{isEdit.current ? "Chỉnh sửa" : 'Nhập thông tin'}</Text>

                {/* Name */}
                {renderField('name')}

                {/* Category */}
                {renderBoxOption(true)}

                {/* Total Value */}
                {renderField('total_value')}

                {/* Type */}
                {renderTypeBox()}

                {/* Date */}
                {renderField('date_buy')}

                {/* Note */}
                {renderField('note', true)}

                {isOpen && (
                    <DateTimePicker
                        value={date_}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                    />
                )}
            </BottomSheetScrollView>
            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={isEdit.current ? onUpdate : onCreate}>
                <Text style={styles.saveButtonText}>{isEdit.current ? 'Lưu' : 'Tạo'}</Text>
            </TouchableOpacity>
        </BottomSheet>
    )
}



export default PopupFormExpense;

const styles = StyleSheet.create({
    contentContainer: {
        marginHorizontal: 20
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
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    header: {
        marginHorizontal: 20,
        marginBottom: 10
    },
    item_list: {
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    txt_list: {
        fontSize: 15,
        color: '#000',
        fontWeight: '600'
    },
    typeBox: {
        justifyContent: 'center',
    },
    typeBoxDisabled: {
        backgroundColor: '#f5f5f5e7',
        borderColor: '#e0e0e0',
    },
    typeText: {
        fontSize: 14,
        color: '#666',
    }
})