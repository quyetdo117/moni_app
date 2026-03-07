import { COLOR_APP } from '@/constants/constants'
import { createTransactionInvest } from '@/services/Api/transaction.services'
import { Category } from '@/types/schema.types'
import { PopupRef } from '@/types/view.types'
import { line_min } from '@/utils/calculate'
import { commonStyles } from '@/utils/styles_shadow'
import RNBounceable from '@freakycoder/react-native-bounceable'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import moment from 'moment'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
import { DataFormInvest } from '../types/Investment.types'

const dataOptions = [
    {
        id: 1,
        title: 'Sell',
        type: 0
    },
    {
        id: 2,
        title: 'Buy',
        type: 1
    }
]

interface dataOption {
    id: number;
    title: string;
    type: number;
}

type NameInputMode = 'existing' | 'new';

const PopupFormInvest = forwardRef<PopupRef>((props, ref) => {

    const bottomSheetRef = useRef<BottomSheet>(null);
    const isChangeMarket = useRef(false);
    const dataType = useRef<dataOption>(dataOptions[0]);
    const refInput = useRef<Record<string, TextInput | null>>({});
    const [isOpen, setOpen] = useState(false);
    const [nameInputMode, setNameInputMode] = useState<NameInputMode>('existing');
    const [selectedAsset, setSelectedAsset] = useState<Category | null>(null);

    const initData = {
        type: 1,
        name: '',
        quantity: 0,
        rate_value: 0,
        market_value: 0,
        extra_value: 0,
        total_value: 0,
        date_buy: moment(new Date()).unix(),
        note: '',
        asset_id: 'Uu1DSauWI73HYTzSqupr',
        type_asset: '',
        user_id: 'o82cmc6AGTHlPl6HDlga'
    }
    const [categories, setCategories] = useState<Category[]>([]);
    const [dataForm, setDataForm] = useState<DataFormInvest>(initData);
    const { type, name, quantity, rate_value, total_value, date_buy, market_value } = dataForm;
    const date_ = new Date(date_buy * 1000);
    const dataStr = moment(date_buy * 1000).format('DD/MM/YYYY')

    const snapPoints = useMemo(() => ['50%', '90%'], []);

    useEffect(() => {
    }, [])

    const onShow = () => {
        if (bottomSheetRef.current) {
            bottomSheetRef.current.snapToIndex(1);
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
        if (bottomSheetRef.current) {
            bottomSheetRef.current.close();
        }
    }

    const onChangeText = (value: string, type: string) => {
        if (type == 'rate_value' && !isChangeMarket.current) {
            setDataForm({
                ...dataForm,
                [type]: Number(value),
                market_value: Number(value)
            })
        } else {
            if (!isChangeMarket.current && type == 'market_value') {
                isChangeMarket.current = true
            }
            setDataForm({
                ...dataForm,
                [type]: value
            })
        }

    }

    const onCreate = async () => {
        if (name && quantity && rate_value && total_value && date_buy && market_value) {
            const jsonCreate = await createTransactionInvest(dataForm)
            console.log('loggg json', jsonCreate);

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
            case 'name': return 'Tên tài sản';
            case 'type': return 'Loại giao dịch';
            case 'quantity': return 'Số lượng';
            case 'rate_value': return 'Đơn giá';
            case 'market_value': return 'Giá thị trường';
            case 'extra_value': return 'Chi phí phát sinh';
            case 'total_value': return 'Tổng vốn';
            case 'date_buy': return 'Ngày tạo';
            case 'note': return 'Note';

            default: return '';
        }
    }

    const onGetValue = (type: string) => {
        const { name, quantity, rate_value, market_value, extra_value, total_value, date_buy, note } = dataForm;
        switch (type) {
            case 'name': return name;
            case 'quantity': return quantity.toString();
            case 'rate_value': return rate_value.toString();
            case 'market_value': return market_value.toString();
            case 'extra_value': return extra_value?.toString();
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
        const isNote = type == 'note';
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
                        keyboardType={isNote ? 'default' : 'numeric'}
                        readOnly={isDate ? true : false}
                        placeholder='Nhập ...'
                        value={onGetValue(type)}
                        onChangeText={(txt) => onChangeText(txt, type)}
                    // value=''
                    />
                </View>
            </RNBounceable>
        )
    }

    const onSelectNameMode = (mode: NameInputMode) => {
        setNameInputMode(mode);
        setSelectedAsset(null);
        setDataForm({ ...dataForm, name: '' });
    }

    const onSelectExistingAsset = (item: Category) => {
        setSelectedAsset(item);
        onChangeText(item.name, 'name')
    }

    const renderInputName = () => {
        return (
            <View style={styles.box_name_section}>
                <View style={styles.row_mode}>
                    <RNBounceable
                        style={[styles.mode_btn, nameInputMode === 'existing' && styles.mode_btn_active]}
                        onPress={() => onSelectNameMode('existing')}
                    >
                        <Text style={[styles.mode_btn_txt, nameInputMode === 'existing' && styles.mode_btn_txt_active]}>
                            {'Có sẵn'}
                        </Text>
                    </RNBounceable>
                    <RNBounceable
                        style={[styles.mode_btn, nameInputMode === 'new' && styles.mode_btn_active]}
                        onPress={() => onSelectNameMode('new')}
                    >
                        <Text style={[styles.mode_btn_txt, nameInputMode === 'new' && styles.mode_btn_txt_active]}>
                            {'Tạo mới'}
                        </Text>
                    </RNBounceable>
                </View>

                <Text style={styles.name_txt}>{'Tên tài sản'}</Text>
                <View style={[styles.box_name_input, commonStyles.box_shadow_transaction]}>
                    {nameInputMode === 'existing' ? (
                        <Dropdown
                            data={categories}
                            labelField="label"
                            valueField="value"
                            placeholder="Chọn tài sản..."
                            style={styles.dropdown_name}
                            value={selectedAsset?.name}
                            onChange={onSelectExistingAsset}
                        />
                    ) : (
                        <TextInput
                            placeholder='Nhập tên tài sản ...'
                            onChangeText={(txt) => onChangeText(txt, 'name')}
                            value={dataForm.name}
                            style={styles.txt_name}
                        />
                    )}
                </View>
            </View>
        )
    }

    const renderItemDrop = (item: dataOption, selected?: boolean) => {
        return (
            <View key={item.id} style={[styles.item_list, selected && { backgroundColor: COLOR_APP.blue }]}>
                <Text style={[styles.txt_list, selected && { color: '#fff' }]}>{item.title}</Text>
            </View>
        )
    }

    const onChangeType = (data: dataOption) => {
        dataType.current = data;
        setDataForm({
            ...dataForm,
            type: data.type
        })
    }

    const renderBoxOption = () => {
        return (
            <View style={[styles.box_input,
            commonStyles.box_shadow_transaction, { marginLeft: 10 }]}>
                <Text>{'Title'}</Text>
                <View style={[styles.box_txt]}>
                    <Dropdown
                        data={dataOptions}
                        labelField="title"
                        valueField="title"
                        renderItem={renderItemDrop}
                        placeholder="Chọn một mục..."
                        style={styles.box_option}
                        value={dataType.current}
                        onChange={item => {
                            onChangeType(item);
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
                <Text style={styles.title}>{'Nhập thông tin'}</Text>
                <RNBounceable onPress={onCreate}>
                    <Text style={styles.txt_create}>{'Tạo'}</Text>
                </RNBounceable>
            </View>
            <BottomSheetScrollView>
                {renderInputName()}
                <View style={styles.row}>
                    {
                        renderBoxInput('quantity')
                    }
                    {
                        renderBoxOption()
                    }
                </View>
                <View style={styles.row}>
                    {
                        renderBoxInput('rate_value')
                    }
                    {
                        renderBoxInput('market_value', true)
                    }
                </View>
                <View style={styles.row}>
                    {
                        renderBoxInput('total_value')
                    }
                    {
                        renderBoxInput('extra_value', true)
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
})

PopupFormInvest.displayName = 'PopupFormInvest'

export default PopupFormInvest;

const styles = StyleSheet.create({
    box_name_section: {
        marginBottom: 5
    },
    box_name_input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        paddingHorizontal: 5
    },
    box_name: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        paddingHorizontal: 5
    },
    row_mode: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginBottom: 5,
        gap: 8
    },
    mode_btn: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        backgroundColor: '#f5f5f5'
    },
    mode_btn_active: {
        backgroundColor: COLOR_APP.blue,
        borderColor: COLOR_APP.blue
    },
    mode_btn_txt: {
        fontSize: 13,
        color: '#555',
        fontWeight: '600'
    },
    mode_btn_txt_active: {
        color: '#fff'
    },
    dropdown_name: {
        paddingVertical: 10,
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