import BoxMoney from '@/components/common/BoxMoney';
import BoxSwipeable from '@/components/common/BoxSwipeable';
import EmptyView from '@/components/common/EmptyView';
import HeaderView from '@/components/common/HeaderView';
import LineList from '@/components/common/LineList';
import ItemPayment from '@/components/items/ItemPayment';
import { COLOR_APP, getColorCategory, key_assets } from '@/constants/constants';
import { getInfoExpense, getListTransaction } from '@/services/Api/get.services';
import { deleteTransaction } from '@/services/Api/transaction.services';
import { useListStore, useUserStore } from '@/store/main.store';
import { InfoTransaction } from '@/types/info.types';
import { RootStackScreenProps } from '@/types/navigation.types';
import { Category } from '@/types/schema.types';
import { PopupRef } from '@/types/view.types';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    const uid = useUserStore(state => state.uid);
    const refChart = useRef<ChartRef>(null);
    const [dataList, setDataList] = useState<InfoTransaction[]>([]);
    const setListExpense = useListStore(state => state.setListExpense);


    const [categories, setListCate] = useState<Category[]>([]);

    useEffect(() => {
        getListCate();
        onGetData();
    }, [])

    const onGetData = async (category_id?: string, category_type?: number) => {
        const type = key_assets.expense;
        const data = await getListTransaction(uid, type, category_id, category_type);
        if (data.success) {
            const listData = data?.data as InfoTransaction[] || [];
            setDataList(listData);
            setListExpense(listData);
        } else {
            console.log('error', data.msg)
        }
    }

    const getListCate = async () => {
        const data = await getInfoExpense(uid);
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
        if (data?.type_expense) {
            onGetData(data?.id);
            refChart.current?.setColor(getColorCategory(data.type_expense))
        } else {
            onGetData('', data?.type);
            refChart.current?.setColor(COLOR_APP.green)
        }
    }

    const onChangeInfo = (data: InfoTransaction) => {
        const { type, category_id } = data;
        const newCateories = [...categories];
        newCateories.forEach(item => {
            if(item.id == category_id){
                item.total_value -= data.total_value;
            }
        })

        data_base.current.forEach(item => {
            if(item.type == type){
                item.total_value -= data.total_value;
            }
        })
        setListCate(newCateories);
    }

    const onDelete = async (data: InfoTransaction) => {
        const dataJson = await deleteTransaction(data.id);
        if (dataJson.success) {
            setDataList(prev => prev.filter(i => i.id !== data.id));
            onChangeInfo(data);
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
                                return <BoxMoney
                                    onPress={onPressType}
                                    style_box={item.type === 0 && { backgroundColor: '#009900' }}
                                    style={{ flex: 1 }} data={item}
                                    style_txt={item.type === 0 && { color: '#fff' }}
                                    key={index} />
                            })
                        }
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View>
                            <View style={styles.list}>
                                {
                                    categories.map((item, index) => {
                                        const type_expense = item.type_expense;
                                        if (type_expense == 5) return null;
                                        return <ItemCategory
                                            onPress={onPressType}
                                            style_box={type_expense ?
                                                { backgroundColor: getColorCategory(type_expense) } : null} data={item} key={index} />
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
        </View>
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
