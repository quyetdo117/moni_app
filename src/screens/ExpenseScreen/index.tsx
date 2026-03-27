
import BoxMoney from '@/components/common/BoxMoney';
import BoxSwipeable from '@/components/common/BoxSwipeable';
import EmptyView from '@/components/common/EmptyView';
import HeaderView from '@/components/common/HeaderView';
import LineList from '@/components/common/LineList';
import ItemPayment from '@/components/items/ItemPayment';
import { PopupConfirm } from '@/components/popups/PopupConfirm';
import { PopupToast } from '@/components/popups/PopupToast';
import { COLOR_APP, getColorCategory, key_assets, TYPE_TRANSACTION } from '@/constants/constants';
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
import { Alert, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
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
    const setCategoriesExpense = useListStore(state => state.setCategoriesExpense);
    const categoriesExpense = useListStore(state => state.categoriesExpense);
    const [selectedType, setSelectedType] = useState<number>(0);
    const updateChartData = useChartStore(state => state.updateChartData);
    const infoAsset = useUserStore(state => state.infoAsset);
    const setInfoAsset = useUserStore(state => state.setInfoAsset);
    const updateInfoAssetValue = (valueChange: number, transactionType: number) => {

        const currentExpenseAsset = infoAsset.expense;
        if (!currentExpenseAsset) return;
        const actualChange = transactionType === TYPE_TRANSACTION.IN ? -valueChange : valueChange;

        const updatedAsset = {
            ...currentExpenseAsset,
            total_value: Number(currentExpenseAsset.total_value || 0) + actualChange
        };
        setInfoAsset([updatedAsset]);
    };

    useEffect(() => {
        getListCate();
        // Set initial focus to Tổng chi tiêu (type: 0)
        onPressType({ type: 0 } as Category);
    }, [])

    const onGetData = async (category_id?: string, category_type?: number) => {
        const expenseAssetId = infoAsset.expense?.id;
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
        const expenseAssetId = infoAsset.expense?.id;
        const data = await getInfoExpense(expenseAssetId);
        const data_ = data.data
        if (data.success && data_) {
            data_base.current[0].total_value = data_.total_income;
            data_base.current[1].total_value = data_.total_expense;
            const categories = data_?.categories || [];
            setCategoriesExpense(categories)
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
        const newCateories = [...categoriesExpense];
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
        setCategoriesExpense(newCateories);
    }

    const onDelete = async (data: InfoTransaction) => {
        // Show confirmation popup
        refPopupConfirm.current?.onShow({
            title: 'Bạn có chắc chắn muốn xóa giao dịch này không?',
            onConfirm: () => confirmDelete(data),
        });
    }

    const confirmDelete = async (data: InfoTransaction) => {
        const dataJson = await deleteTransaction(data.id, key_assets.expense);
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

    // Callback to update data_base when creating or editing transaction
    const onUpdateDataBase = (type: number, valueChange: number, isNew: boolean, oldType?: number) => {
        if (isNew) {
            // New transaction - add value
            data_base.current.forEach(item => {
                if (item.type == type) {
                    item.total_value += valueChange;
                }
            });
        } else {
            // Edit transaction - calculate the difference
            if (oldType !== undefined && oldType !== type) {
                // Type changed - subtract from old type and add to new type
                data_base.current.forEach(item => {
                    if (item.type == oldType) {
                        item.total_value -= valueChange;
                    }
                    if (item.type == type) {
                        item.total_value += valueChange;
                    }
                });
            } else {
                // Same type - just add the difference
                data_base.current.forEach(item => {
                    if (item.type == type) {
                        item.total_value += valueChange;
                    }
                });
            }
        }
        // Force re-render by creating a new array reference
        data_base.current = [...data_base.current];
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
            <View style={styles.headerContent}>
                {/* Top Section */}
                <View style={styles.topHeader}>
                    <View style={styles.dateContainer}>
                        <MaterialIcons name="date-range" size={20} color={Colors.textSecondary} />
                        <Text style={styles.dateText}>{'Tháng này'}</Text>
                    </View>
                    <RNBounceable style={styles.createButton} onPress={onCreate}>
                        <FontAwesome6 name="plus" size={16} color={Colors.accent} />
                        <Text style={styles.createText}>{'Tạo mới'}</Text>
                    </RNBounceable>
                </View>

                {/* Overview Cards */}
                <View style={styles.overviewContainer}>
                    {
                        data_base.current.map((item, index) => {
                            const isSelected = item.type === selectedType;
                            const isExpense = item.type === 0;
                            return (
                                <BoxMoney
                                    onPress={onPressType}
                                    style={[{ flex: 1 }, isExpense ? { marginLeft: Spacing.md } : null]}
                                    data={item}
                                    variant={isSelected ? 'success' : 'default'}
                                    key={index}
                                />
                            )
                        })
                    }
                </View>

                {/* Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                >
                    <View style={styles.categoriesRow}>
                        {
                            categoriesExpense.map((item, index) => {
                                const type_display = item.type_display;
                                if (type_display == 5) return null;
                                return (
                                    <ItemCategory
                                        onPress={onPressType}
                                        style_box={type_display ?
                                            { backgroundColor: getColorCategory(type_display) } : null}
                                        data={item}
                                        key={index}
                                    />
                                )
                            })
                        }
                    </View>
                </ScrollView>

                {/* Chart */}
                <ChartPayment ref={refChart} />

                {/* Recent Transactions Header */}
                <View style={styles.recentHeader}>
                    <Text style={styles.recentTitle}>{'Gần đây'}</Text>
                </View>
            </View>
        )
    }, [categoriesExpense, selectedType])

    return (
        <View style={styles.container}>
            <HeaderView onBack={onBack} title={'Chi tiêu'} />
            <FlatList
                ListHeaderComponent={renderHeader}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <LineList style={styles.separator} />}
                data={dataList}
                keyExtractor={keyExtractor_}
                ListEmptyComponent={<EmptyView />}
                contentContainerStyle={styles.listContent}
            />
            <PopupFormExpense ref={refPopupForm} onUpdateDataBase={onUpdateDataBase} />
            <PopupConfirm ref={refPopupConfirm} />
            <PopupToast ref={refPopupToast} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    headerContent: {
        paddingTop: Spacing.md,
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.base,
        marginBottom: Spacing.md,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSize.base,
        marginLeft: Spacing.xs,
        fontWeight: Typography.fontWeight.medium,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
    },
    createText: {
        color: Colors.accent,
        fontWeight: Typography.fontWeight.semiBold,
        fontSize: Typography.fontSize.sm,
        marginLeft: Spacing.xs,
    },
    overviewContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.base,
    },
    categoriesContainer: {
        maxHeight: 50,
        marginBottom: Spacing.base,
    },
    categoriesRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.sm,
    },
    recentHeader: {
        paddingHorizontal: Spacing.base,
        marginBottom: Spacing.sm,
        marginTop: Spacing.sm,
    },
    recentTitle: {
        color: Colors.text,
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
    },
    separator: {
        marginHorizontal: Spacing.base,
    },
    listContent: {
        paddingBottom: 100,
    },
})
