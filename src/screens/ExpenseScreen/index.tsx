import BoxMoney from '@/components/common/BoxMoney';
import BoxSwipeable from '@/components/common/BoxSwipeable';
import EmptyView from '@/components/common/EmptyView';
import HeaderView from '@/components/common/HeaderView';
import LineList from '@/components/common/LineList';
import ItemPayment from '@/components/items/ItemPayment';
import { PopupConfirm } from '@/components/popups/PopupConfirm';
import { PopupToast } from '@/components/popups/PopupToast';
import { COLOR_APP, getColorCategory, key_assets } from '@/constants/constants';
import { getInfoExpense, getListTransaction } from '@/services/Api/get.services';
import { deleteTransaction } from '@/services/Api/transaction.services';
import { useChartStore, useListStore, useUserStore } from '@/store/main.store';
import { InfoTransaction } from '@/types/info.types';
import { RootStackScreenProps } from '@/types/navigation.types';
import { Category } from '@/types/schema.types';
import { PopupRef } from '@/types/view.types';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import ChartPayment, { ChartRef } from './items/ChartPayment';
import ItemCategory from './items/ItemCategory';
import PopupFormExpense from './popups/PopupExpense';

interface DataItem {
    item: InfoTransaction;
    index: number
}


export default function ExpenseScreen({ navigation, route }: RootStackScreenProps<'ExpenseScreen'>) {
    const data_base = useRef([
        {
            name: 'Tổng thu nhập',
            total_value: 0,
            type: 1
        },
        {
            name: 'Tổng chi tiêu',
            total_value: 0,
            type: 0
        }
    ])

    const refPopupForm = useRef<PopupRef>(null);
    const refPopupConfirm = useRef<PopupRef>(null);
    const refPopupToast = useRef<PopupRef>(null);
    const uid = useUserStore(state => state.uid);
    const refChart = useRef<ChartRef>(null);
    const [dataList, setDataList] = useState<InfoTransaction[]>([]);
    const setListExpense = useListStore(state => state.setListExpense);
    const [selectedType, setSelectedType] = useState<number>(0);
    const updateChartData = useChartStore(state => state.updateChartData);
    const infoAsset = useUserStore(state => state.infoAsset);
    const setInfoAsset = useUserStore(state => state.setInfoAsset);

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

    const [categories, setListCate] = useState<Category[]>([]);

    useEffect(() => {
        getListCate();
        // Set initial focus to Tổng chi tiêu (type: 0)
        onPressType({ type: 0 } as Category);
    }, [])

    const onGetData = async (category_id?: string, category_type?: number) => {
        const expenseAssetId = infoAsset?.[key_assets.expense]?.id;
        const data = await getListTransaction(uid, expenseAssetId, category_id, category_type);
        if (data.success) {
            const listData = data?.data as InfoTransaction[] || [];
            setDataList(listData);
            setListExpense(listData);
        } else {
            console.log('error', data.msg)
        }
    }

    const getListCate = async () => {
        const expenseAssetId = infoAsset?.[key_assets.expense]?.id;
        const data = await getInfoExpense(expenseAssetId);
        const data_ = data.data
        if (data.success && data_) {
            data_base.current[0].total_value = data_.total_income;
            data_base.current[1].total_value = data_.total_expense;
            const categories = data_?.categories || [];
            setListCate(categories);
        } else {
            Alert.alert(data.msg)
        }
    }

    const onBack = () => {
        navigation?.goBack();
    }

    const onCreate = () => {
        if (refPopupForm.current) {
            refPopupForm.current.onShow()
        }
    }

    const onRefresh = () => {
        getListCate();
        onGetData();
    }

    const onPressType = (data?: Category) => {
        const typeValue = data?.type ?? 0;
        setSelectedType(typeValue);
        if (data?.type_display) {
            onGetData(data?.id);
            refChart.current?.setColor(getColorCategory(data.type_display))
        } else {
            onGetData('', typeValue);
            refChart.current?.setColor(COLOR_APP.green)
        }
    }

    const onChangeInfo = (data: InfoTransaction) => {
        const { type, category_id } = data;
        const newCateories = [...categories];
        newCateories.forEach(item => {
            if (item.id == category_id) {
                item.total_value -= data.total_value;
            }
        })

        data_base.current.forEach(item => {
            if (item.type == type) {
                item.total_value -= data.total_value;
            }
        })
        setListCate(newCateories);
    }

    const onDelete = async (data: InfoTransaction) => {
        // Show confirmation popup
        refPopupConfirm.current?.onShow({
            title: 'Bạn có chắc chắn muốn xóa giao dịch này không?',
            onConfirm: () => confirmDelete(data),
        });
    }

    const confirmDelete = async (data: InfoTransaction) => {
        const dataJson = await deleteTransaction(data.id);
        if (dataJson.success) {
            setDataList(prev => prev.filter(i => i.id !== data.id));
            onChangeInfo(data);
            
            // Update chart with negative value to subtract
            updateChartData(key_assets.expense, -Number(data.total_value), { date_buy: data.date_buy, type: data.type });
            
            // Update infoAsset in store
            updateInfoAssetValue(Number(data.total_value), data.type);
        }
    }

    const onEdit = (data: InfoTransaction) => {
        refPopupForm.current?.onShow(data, true)
    }

    const keyExtractor_ = (item: InfoTransaction, index: number) => index.toString();

    const renderItem = (({ item, index }: DataItem) => {
        return (
            <BoxSwipeable<InfoTransaction>
                onDelete={onDelete} onEdit={onEdit} key={item.id} data={item}>
                <ItemPayment data={item} />
            </BoxSwipeable>
        )
    })

    const renderHeader = useMemo(() => {
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.top_header}>
                    <View style={styles.header}>
                        <MaterialIcons name="date-range" size={22} color="black" />
                        <Text style={styles.date}>{'Tháng này'}</Text>
                    </View>
                    <RNBounceable style={styles.btn_create} onPress={onCreate}>
                        <FontAwesome6 name="add" size={18} color={COLOR_APP.blue} />
                        <Text style={styles.txt_create}>{'Tạo mới'}</Text>
                    </RNBounceable>
                </View>
                <View>
                    <View style={styles.box_overview}>
                        {
                            data_base.current.map((item, index) => {
                                const isSelected = item.type === selectedType;
                                return <BoxMoney
                                    onPress={onPressType}
                                    style_box={item.type === 0 && { backgroundColor: isSelected ? '#009900' : '#e0e0e0' }}
                                    style={{ flex: 1 }} data={item}
                                    style_txt={item.type === 0 && { color: isSelected ? '#fff' : '#666' }}
                                    key={index} />
                            })
                        }
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View>
                            <View style={styles.list}>
                                {
                                    categories.map((item, index) => {
                                        const type_display = item.type_display;
                                        if (type_display == 5) return null;
                                        return <ItemCategory
                                            onPress={onPressType}
                                            style_box={type_display ?
                                                { backgroundColor: getColorCategory(type_display) } : null} data={item} key={index} />
                                    })
                                }
                            </View>
                        </View>
                    </ScrollView>
                    <ChartPayment ref={refChart} />
                </View>
                <View>
                    <Text style={styles.txt_recent}>{'Gần đây'}</Text>
                </View>
            </View>
        )
    }, [categories])

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>

            <View style={styles.container}>
                <HeaderView onBack={onBack} title={'Khoản chi tiêu'} />
                <FlatList
                    ListHeaderComponent={renderHeader}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <LineList style={styles.line} />}
                    data={dataList}
                    keyExtractor={keyExtractor_}

                    ListEmptyComponent={<EmptyView />}
                />
                <PopupFormExpense onRefresh={onRefresh} ref={refPopupForm} />
                <PopupConfirm ref={refPopupConfirm} />
                <PopupToast ref={refPopupToast} />
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 10
    },
    date: {
        color: '#333',
        marginLeft: 5
    },
    box_overview: {
        flexDirection: 'row',
        marginHorizontal: 5
    },
    list: {
        flexDirection: 'row',
        marginVertical: 10,
        paddingRight: 10,
        height: 40
    },
    btn_create: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    txt_create: {
        color: COLOR_APP.blue,
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 5
    },
    top_header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 10
    },
    txt_recent: {
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 10,
        marginBottom: 10
    },
    line: {
        marginHorizontal: 10
    }
})
