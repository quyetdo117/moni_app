
import { COLOR_APP, key_assets, types_expense } from '@/constants/constants'
import { getCategories } from '@/services/Api/get.services'
import { createTransactionExpense, updateTransaction } from '@/services/Api/transaction.services'
import { useUserStore } from '@/store/main.store'
import { Category } from '@/types/schema.types'
import { PopupRef } from '@/types/view.types'
import { line_min } from '@/utils/calculate'
import { commonStyles } from '@/utils/styles_shadow'
import RNBounceable from '@freakycoder/react-native-bounceable'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import moment from 'moment'
import React, { Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native'
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
    const refInput = useRef<Record<string, TextInput | null>>({});
    const uid = useUserStore(state => state.uid);
    const infoAsset = useUserStore(state => state.infoAsset);
    const [isOpen, setOpen] = useState(false);
    const isEdit = useRef(false);
    const isSelect = useRef(false);


    const initData = {
        type: 1,
        name: '',
        total_value: 0,
        date_buy: moment(new Date()).unix(),
        note: '',
        asset_id: infoAsset.expense || '',
        category_id: '',
        user_id: uid,
    }
    const [dataForm, setDataForm] = useState<DataFormExpense>(initData);
    const { name, total_value, date_buy } = dataForm;
    const [listCate, setListCate] = useState<Category[]>([]);
    const date_ = new Date(date_buy * 1000);
    const dataStr = moment(date_buy * 1000).format('DD/MM/YYYY')

    const snapPoints = useMemo(() => ['50%', '90%'], []);

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
            const { category_id, type } = data
            setDataForm(data);
            const dataCate = listCate.find(item => item.id == category_id);
            if(dataCate){
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
            if(jsonCreate.success){
                onClose();
                onRefresh();
            }
        } else {
            Alert.alert('Nhap du thong tin!', JSON.stringify(dataForm))
        }
    }

    const onCreate = async () => {
        if (name && total_value && date_buy) {
            const jsonCreate = await createTransactionExpense(dataForm)
            console.log('loggg dataForm', JSON.stringify(dataForm));
            if(jsonCreate.success){
                onClose();
                onRefresh();
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
            case 'note': return 'Note';

            default: return '';
        }
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

    const onPressBoxInput = (type: string) => {
        if (type == 'date_buy') {
            openShowDate();
        } else {
            if (refInput.current[type]) {
                refInput.current[type].focus();
            }
        }
    }

    const renderBoxInput = (type: string, isRight?: boolean) => {
        const isString = type == 'note' || type == 'name';
        const isDate = type == 'date_buy';
        return (
            <RNBounceable style={[styles.box_input,
            commonStyles.box_shadow_transaction,
            isRight && { marginLeft: 10 }]}
                onPress={() => {
                    onPressBoxInput(type);
                }}
            >
                <Text style={styles.title_input}>{onGetTitle(type)}</Text>
                <View style={[styles.box_txt]}>
                    <TextInput
                        ref={(el) => { refInput.current[type] = el }}
                        keyboardType={isString ? 'default' : 'numeric'}
                        readOnly={isDate ? true : false}
                        placeholder='Nhập ...'
                        value={onGetValue(type)}
                        onChangeText={(txt) => {
                            let newTxt = txt;
                            if (!isString && newTxt[0] == '0') {
                                newTxt = Number(newTxt).toString();
                            }
                            onChangeText(newTxt, type)
                        }}
                    // value=''
                    />
                </View>
            </RNBounceable>
        )
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

    const renderBoxOption = (isCategory?: boolean) => {

        return (
            <View style={[styles.box_input,
            commonStyles.box_shadow_transaction, { marginLeft: 10 }]}>
                <Text style={styles.title_input}>{isCategory ? 'Danh mục' : 'Loại giao dịch'}</Text>
                <View style={[styles.box_txt]}>
                    <Dropdown
                        data={isCategory ? listCate : types_expense}
                        disable={!isCategory && !isSelect.current}
                        labelField={isCategory ? "name" : "title"}
                        valueField={isCategory ? "name" : "title"}
                        renderItem={renderItemDrop}
                        placeholder="Chọn một mục..."
                        style={styles.box_option}
                        value={isCategory ? dataCategory : dataType}
                        onChange={item => {
                            onChangeType(item, isCategory);
                        }}
                    />
                </View>
            </View>
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
            <View style={styles.header}>
                <Text style={styles.title}>{isEdit.current ? "Chỉnh sửa" : 'Nhập thông tin'}</Text>
                <RNBounceable onPress={isEdit.current ? onUpdate : onCreate}>
                    <Text style={styles.txt_create}>{isEdit.current ? 'Lưu' : 'Tạo'}</Text>
                </RNBounceable>
            </View>
            <BottomSheetScrollView>
                <View style={styles.row}>
                    {
                        renderBoxInput('name')
                    }
                    {
                        renderBoxOption(true)
                    }
                </View>
                <View style={styles.row}>
                    {
                        renderBoxInput('total_value')
                    }
                    {
                        renderBoxOption()
                    }
                </View>
                <View style={styles.row}>
                    {
                        renderBoxInput('date_buy')
                    }
                    {
                        renderBoxInput('note', true)
                    }
                </View>

                {isOpen && (
                    <DateTimePicker
                        value={date_}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}

                    />
                )}
            </BottomSheetScrollView>
        </BottomSheet>
    )
}



export default PopupFormExpense;

const styles = StyleSheet.create({
    box_name: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        paddingHorizontal: 5
    },
    name_txt: {
        color: '#7c7c7c',
        fontSize: 14,
        marginLeft: 10
    },
    txt_name: {
        fontSize: 16,
        fontWeight: '600'
    },
    box_input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 10
    },
    txt_input: {
        fontSize: 14,
        fontWeight: '600'
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginVertical: 5
    },
    box_txt: {
        borderWidth: line_min,
        borderColor: '#dbdbdb',
        borderRadius: 5,
        backgroundColor: '#fff',
        paddingHorizontal: 5
    },
    title: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginBottom: 20
    },
    txt_create: {
        color: COLOR_APP.blue,
        fontWeight: '600',
        fontSize: 16
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
    box_option: {
        paddingVertical: 10
    },
    title_input: {
        color: '#000',
        fontSize: 14,
        marginBottom: 3,
        fontWeight: '600'
    }
})