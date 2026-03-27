import { COLOR_APP, key_assets, TYPE_TRANSACTION } from '@/constants/constants'
import { getCategories } from '@/services/Api/get.services'
import { createTransactionInvest } from '@/services/Api/transaction.services'
import { useChartStore, useListStore, useUserStore } from '@/store/main.store'
import { Category } from '@/types/schema.types'
import { PopupRef } from '@/types/view.types'
import { commonStyles } from '@/utils/styles_shadow'
import RNBounceable from '@freakycoder/react-native-bounceable'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import moment from 'moment'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
import { DataFormInvest } from '../types/Investment.types'

const dataOptions = [
    {
        id: 2,
        title: 'Mua tài sản',
        type: TYPE_TRANSACTION.IN
    },
    {
        id: 1,
        title: 'Bán tài sản',
        type: TYPE_TRANSACTION.OUT
    }
]

interface dataOption {
    id: number;
    title: string;
    type: number;
}

type NameInputMode = 'existing' | 'new';

interface PopupFormInvestProps {
    onSuccess?: (data: any) => void;
}

export interface ShowPopupFormInvestConfig {
    category_id?: string;
}

const PopupFormInvest = forwardRef<PopupRef, PopupFormInvestProps>((props, ref) => {

    const bottomSheetRef = useRef<BottomSheet>(null);
    const isChangeMarket = useRef(false);
    const dataType = useRef<dataOption>(dataOptions[0]);
    const [isOpen, setOpen] = useState(false);
    const [nameInputMode, setNameInputMode] = useState<NameInputMode>('existing');
    const [selectedAsset, setSelectedAsset] = useState<Category | null>(null);
    const uid = useUserStore(state => state.uid);
    const infoAsset = useUserStore(state => state.infoAsset);
    const listInvest = useListStore(state => state.listInvest);
    const setListInvest = useListStore(state => state.setListInvest);
    const updateChartData = useChartStore(state => state.updateChartData);

    const initData: DataFormInvest = {
        type: 1,
        name: '',
        quantity: '',
        rate_value: '',
        market_value: '',
        total_capital: '',
        date_buy: moment(new Date()).unix(),
        note: '',
        asset_id: infoAsset?.invest?.id ?? '',
        user_id: uid
    }
    const [categories, setCategories] = useState<Category[]>([]);
    const [dataForm, setDataForm] = useState<DataFormInvest>(initData);
    const { name, quantity, rate_value, total_capital, date_buy, market_value } = dataForm;
    const date_ = new Date(date_buy * 1000);
    const dataStr = moment(date_buy * 1000).format('DD/MM/YYYY')

    const snapPoints = useMemo(() => ['90%'], []);

    useEffect(() => {
        getCategoriesInvest();
    }, [])

    const getCategoriesInvest = async () => {
        try {
            const dataBody = { asset_id: infoAsset?.invest?.id, type: key_assets.invest }
            const jsonData = await getCategories(dataBody, uid);
            if (jsonData.success) {
                const list = jsonData.data as Category[] || [];
                setCategories(list)
            }
        } catch (error) {

        }
    }

    const onShow = (config?: ShowPopupFormInvestConfig | string) => {
        // Handle both string (category_id) and object config
        const categoryId = typeof config === 'string' ? config : config?.category_id;

        if (categoryId) {
            // Pre-select the category - try to find in loaded categories first
            const category = categories.find(c => c.id === categoryId);
            if (category) {
                setSelectedAsset(category);
                setDataForm(prev => ({
                    ...prev,
                    category_id: categoryId,
                    name: category.name,
                    market_value: category.market_value?.toString() || prev.market_value
                }));
            } else {
                // Category not found in list yet, just set the category_id
                setDataForm(prev => ({
                    ...prev,
                    category_id: categoryId
                }));
            }
        }
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
                [type]: value,
                market_value: value
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
        if (name && quantity && rate_value && total_capital && date_buy && market_value) {
            const jsonCreate = await createTransactionInvest(dataForm)
            if (jsonCreate.success) {
                handleCreateSuccess(jsonCreate.data);
            } else {
                Alert.alert('Lỗi', jsonCreate.message)
            }
        } else {
            Alert.alert('Nhap du thong tin!', JSON.stringify(dataForm))
        }
    }

    // Hàm xử lý sau khi tạo thành công
    const handleCreateSuccess = (createdData: any) => {
        if (!createdData) {
            onClose();
            return;
        }

        // Cập nhật listInvest: nếu đã có thì cộng dồn, nếu chưa thì thêm vào đầu
        const existingIndex = listInvest.findIndex(item => item.id === createdData.id);
        if (existingIndex >= 0) {
            // Cập nhật item hiện có
            const updatedList = [...listInvest];
            updatedList[existingIndex] = {
                ...createdData
            };
            setListInvest(updatedList);
        } else {
            // Thêm mới vào đầu danh sách
            setListInvest([createdData, ...listInvest]);
        }

        // Cập nhật chart
        const valueChange = dataForm.type === TYPE_TRANSACTION.IN ? Number(total_capital) : -Number(total_capital);
        updateChartData(key_assets.invest, valueChange, { date_buy: dataForm.date_buy, type: dataForm.type });

        // Gọi callback onSuccess với dữ liệu trả về
        console.log('logg createdData', createdData)
        if (props.onSuccess) {
            props.onSuccess(createdData);
        }

        onClose();
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
            case 'total_capital': return 'Tổng vốn';
            case 'date_buy': return 'Ngày tạo';
            case 'note': return 'Note';

            default: return '';
        }
    }

    const onGetValue = (type: string) => {
        const { name, quantity, rate_value, market_value, total_capital, note } = dataForm;
        switch (type) {
            case 'name': return name;
            case 'quantity': return quantity.toString();
            case 'rate_value': return rate_value.toString();
            case 'market_value': return market_value.toString();
            // case 'extra_value': return extra_value?.toString();
            case 'total_capital': return total_capital.toString();
            case 'date_buy': return dataStr;
            case 'note': return note;

            default: return '';
        }
    }

    const renderField = (type: string, isNote: boolean = false) => {
        return (
            <>
                <Text style={styles.label}>{onGetTitle(type)}</Text>
                <BottomSheetTextInput
                    style={[styles.input, isNote && styles.noteInput]}
                    value={onGetValue(type)}
                    onChangeText={(txt) => {
                        onChangeText(txt, type);
                    }}
                    keyboardType={isNote ? 'default' : 'numeric'}
                    placeholder={`Nhập ${onGetTitle(type).toLowerCase()}`}
                    multiline={isNote}
                />
            </>
        );
    };

    const onSelectNameMode = (mode: NameInputMode) => {
        setNameInputMode(mode);
        setSelectedAsset(null);
        setDataForm({ ...dataForm, name: '' });
    }

    const onSelectExistingAsset = (item: Category) => {
        setSelectedAsset(item);
        setDataForm(prev => ({ ...prev, name: item.name, category_id: item.id }));
    }

    const renderItemCategory = (data: Category) => {
        return (
            <View style={styles.item_category}>
                <Text style={styles.item_category_txt}>{data.name}</Text>
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
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
            onAnimate={(fromIndex, toIndex) => {
                if (toIndex === 0) {
                    onClose();
                }
            }}
            backdropComponent={renderBackdrop}
        >
            <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.title}>{'Nhập thông tin'}</Text>

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
                    {/* Name Section */}
                    <Text style={styles.label}>{'Tên tài sản'}</Text>
                    <View style={[styles.box_name_input]}>
                        {nameInputMode === 'existing' ? (
                            <Dropdown
                                data={categories}
                                labelField="name"
                                valueField="name"
                                placeholder="Chọn tài sản..."
                                style={styles.dropdown_name}
                                renderItem={renderItemCategory}
                                value={selectedAsset?.name}
                                onChange={onSelectExistingAsset}
                            />
                        ) : (
                            <BottomSheetTextInput
                                placeholder='Nhập tên tài sản ...'
                                onChangeText={(txt) => onChangeText(txt, 'name')}
                                value={dataForm.name}
                                style={styles.txt_name}
                            />
                        )}
                    </View>
                </View>

                {/* Type */}
                <Text style={styles.label}>{'Loại giao dịch'}</Text>
                <View style={styles.input}>
                    <Dropdown
                        data={dataOptions}
                        labelField="title"
                        valueField="title"
                        renderItem={renderItemDrop}
                        placeholder="Chọn một mục..."
                        value={dataType.current}
                        onChange={item => {
                            onChangeType(item);
                        }}
                    />
                </View>

                {/* Quantity */}
                {renderField('quantity')}

                {/* Rate Value */}
                {renderField('rate_value')}

                {/* Market Value */}
                {renderField('market_value')}

                {/* Total Value */}
                {renderField('total_capital')}

                {/* Date */}
                <Text style={styles.label}>{onGetTitle('date_buy')}</Text>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => openShowDate()}
                >
                    <Text style={styles.dateText}>{dataStr}</Text>
                </TouchableOpacity>

                {isOpen && (
                    <DateTimePicker
                        value={date_}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                    />
                )}

                {/* Note */}
                {renderField('note', true)}

            </BottomSheetScrollView>
            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={onCreate}>
                <Text style={styles.saveButtonText}>{'Tạo'}</Text>
            </TouchableOpacity>
        </BottomSheet>
    )
})

PopupFormInvest.displayName = 'PopupFormInvest'

export default PopupFormInvest;

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
    box_name_section: {
        marginBottom: 5
    },
    box_name_input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginVertical: 5,
        paddingHorizontal: 5,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    box_name: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginHorizontal: 10,
        marginVertical: 5,
        paddingHorizontal: 5
    },
    row_mode: {
        flexDirection: 'row',
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
        fontSize: 14,
        fontWeight: '600'
    },
    box_input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    txt_input: {
        fontSize: 14,
        fontWeight: '600'
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginVertical: 5
    },
    box_txt: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 20,
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
    },
    item_category: {
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    item_category_txt: {
        fontSize: 15,
        color: '#000',
        fontWeight: '600'
    }
})