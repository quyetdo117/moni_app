import BoxSwipeable from '@/components/common/BoxSwipeable';
import EmptyView from '@/components/common/EmptyView';
import HeaderView from '@/components/common/HeaderView';
import ItemInvestPayment from '@/components/items/ItemInvestPayment';
import { PopupConfirm } from '@/components/popups/PopupConfirm';
import { PopupToast } from '@/components/popups/PopupToast';
import { COLOR_APP, key_assets, TYPE_TRANSACTION } from '@/constants/constants';
import { DataInvestItem } from '@/screens/InvestmentScreen/types/Investment.types';
import { getListTransaction } from '@/services/Api/get.services';
import { deleteTransaction } from '@/services/Api/transaction.services';
import { useChartStore, useListStore, useUserStore } from '@/store/main.store';
import { InfoTransaction } from '@/types/info.types';
import { RootStackScreenProps } from '@/types/navigation.types';
import { PopupRef } from '@/types/view.types';
import { calculateROI } from '@/utils/calculate';
import { formatSmartMoney } from '@/utils/format';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import PopupEditTransaction from '../popups/PopupEditTransaction';

interface DataItem {
    item: InfoTransaction;
    index: number
}

export default function InvestmentDetailScreen({ navigation, route }: RootStackScreenProps<'InvestmentDetailScreen'>) {
    const investmentDataParam = route.params.data;
    const uid = useUserStore(state => state.uid);
    const listInvest = useListStore(state => state.listInvest);
    const setListInvest = useListStore(state => state.setListInvest);
    const infoAsset = useUserStore(state => state.infoAsset);
    const setInfoAsset = useUserStore(state => state.setInfoAsset);
    const updateChartData = useChartStore(state => state.updateChartData);
    const editTransactionRef = useRef<PopupRef>(null);
    const deleteConfirmRef = useRef<PopupRef>(null);
    const toastRef = useRef<PopupRef>(null);
    const [dataList, setDataList] = useState<InfoTransaction[]>([]);
    const [investmentData, setInvestmentData] = useState<DataInvestItem>(investmentDataParam);

    useEffect(() => {
        onGetData();
    }, []);

    const onGetData = async () => {
        const type = key_assets.invest;
        const category_id = investmentData.id;
        const data = await getListTransaction(uid, type, category_id);
        if (data.success) {
            const listData = data?.data as InfoTransaction[] || [];
            setDataList(listData);
        } else {
            console.log('error', data.msg);
        }
    }

    const onBack = () => {
        navigation?.goBack();
    }

    const keyExtractor_ = (item: InfoTransaction, index: number) => index.toString();

    // Hàm cập nhật infoUser trong store sau khi có thay đổi investment
    const updateInfoUserStore = (newTotalInvest: number, newTotalMarket: number, valueChange: number) => {
        if (!infoAsset) return;

        const currentInvestAsset = infoAsset['invest'];
        const currentExpenseAsset = infoAsset['expense'];
        if (!currentInvestAsset || !currentExpenseAsset ) return;

        // Cập nhật asset thành công mới
        const updatedAsset = {
            ...currentInvestAsset,
            total_value: newTotalInvest,
            total_market: newTotalMarket
        };

        const updatedAssetExpense = {
            ...currentExpenseAsset,
            total_value: Number(currentExpenseAsset?.total_value || 0) - valueChange
        }

        // Cập nhật assets
        setInfoAsset([updatedAsset, updatedAssetExpense])
    }

    // Hàm dùng chung để cập nhật investment data sau khi có thay đổi
    const updateInvestmentData = (
        dataListChange: InfoTransaction[],
        valueChange: number,
        quantityChange: number
    ) => {
        setDataList(dataListChange);

        // Update investmentData locally
        const { quantity, total_value, market_value } = investmentData;
        const newQuantity = (quantity || 0) + quantityChange;
        const newTotalValue = (total_value || 0) + valueChange;
        const total_market = newQuantity * (market_value || 0);

        const newData = {
            ...investmentData,
            total_value: newTotalValue,
            quantity: newQuantity,
            total_market: total_market
        };

        setInvestmentData(newData);

        // Update store
        const updatedListInvest = listInvest.map(item =>
            item.id === newData.id ? newData : item
        );
        setListInvest(updatedListInvest);
    }

    const onDelete = async (data: InfoTransaction) => {
        // Show confirmation popup
        if (deleteConfirmRef.current) {
            deleteConfirmRef.current.onShow({
                title: 'Bạn có chắc chắn muốn xóa giao dịch này?',
                data: data,
                onConfirm: confirmDelete,
                onCancel: () => {}
            });
        }
    }

    const confirmDelete = async (transactionData: InfoTransaction) => {
        try {
            const jsonData = await deleteTransaction(transactionData.id);
            if (jsonData.success) {
                const isAdd = transactionData.type === TYPE_TRANSACTION.IN;
                const valueDelete = isAdd ? -transactionData.total_value : transactionData.total_value;
                const quantityDelete = isAdd ? -(transactionData.quantity || 0) : (transactionData.quantity || 0);

                const newDataList = dataList.filter(item => item.id !== transactionData.id);
                updateInvestmentData(newDataList, valueDelete, quantityDelete);

                // Update infoAsset['invest'] in store
                if (infoAsset['invest']) {
                    const currentTotalInvest = infoAsset['invest'].total_value || 0;
                    const currentTotalMarket = infoAsset['invest'].total_market || 0;
                    const newTotalInvest = currentTotalInvest + valueDelete;
                    const newTotalMarket = currentTotalMarket + (investmentData.market_value || 0) * quantityDelete;
                    updateInfoUserStore(newTotalInvest, newTotalMarket, valueDelete);
                }

                // Update chart
                updateChartData(key_assets.invest, valueDelete, { date_buy: transactionData.date_buy, type: transactionData.type });

                // Show success toast
                toastRef.current?.onShow({
                    message: 'Xóa giao dịch thành công',
                    type: 'success',
                    duration: 2000
                });
            } else {
                // Show error toast
                toastRef.current?.onShow({
                    message: 'Xóa giao dịch thất bại',
                    type: 'error',
                    duration: 2000
                });
            }
        } catch (error) {
            // Show error toast
            toastRef.current?.onShow({
                message: 'Xóa giao dịch thất bại',
                type: 'error',
                duration: 2000
            });
        }
    }

    const onUpdateSuccess = (updatedData: InfoTransaction) => {
        // Calculate difference
        const oldTransaction = dataList.find(item => item.id === updatedData.id);
        if (!oldTransaction) return;

        const oldValue = oldTransaction.total_value;
        const newValue = updatedData.total_value;
        const valueDiff = newValue - oldValue;

        const isAdd = updatedData.type === TYPE_TRANSACTION.IN;
        const valueChange = isAdd ? valueDiff : -valueDiff;
        const quantityChange = (updatedData.quantity || 0) - (oldTransaction.quantity || 0);

        // Update list
        const newDataList = dataList.map(item =>
            item.id === updatedData.id ? updatedData : item
        );

        updateInvestmentData(newDataList, valueChange, quantityChange);

        // Update infoAsset['invest'] in store
        if (infoAsset['invest']) {
            const currentTotalInvest = infoAsset['invest'].total_value || 0;
            const currentTotalMarket = infoAsset['invest'].total_market || 0;
            const newTotalInvest = currentTotalInvest + valueChange;
            const newTotalMarket = currentTotalMarket + (investmentData.market_value || 0) * quantityChange;
            updateInfoUserStore(newTotalInvest, newTotalMarket, valueChange);
        }

        // Update chart
        updateChartData(key_assets.invest, valueChange, { date_buy: updatedData.date_buy, type: updatedData.type });
    }

    const onEdit = (data: InfoTransaction) => {
        if (editTransactionRef.current) {
            editTransactionRef.current.onShow(data);
        }
    }

    const renderItem = ({ item, index }: DataItem) => {
        return (
            <BoxSwipeable<InfoTransaction>
                isSmall={true}
                onDelete={onDelete} onEdit={onEdit} key={item.id} data={item}>
                <ItemInvestPayment data={item} />
            </BoxSwipeable>
        )
    }

    const roi_value = calculateROI(investmentData.total_value || 0, investmentData.total_market || 0);
    const dateTimestamp = investmentData.createdAt;
    const dateStr = dateTimestamp ? moment.unix(dateTimestamp).format('DD/MM/YYYY') : '';

    const renderHeader = () => {
        return (
            <View style={styles.container_header}>
                <View style={styles.box_info}>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>{'Tổng vốn'}</Text>
                            <Text style={[styles.value, { color: COLOR_APP.green }]}>
                                {formatSmartMoney(investmentData.total_value || 0)}
                            </Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>{'Giá trị hiện tại'}</Text>
                            <Text style={[styles.value, { color: COLOR_APP.blue }]}>
                                {formatSmartMoney(investmentData.total_market || 0)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>{'Số lượng'}</Text>
                            <Text style={styles.value}>{investmentData.quantity || 0}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>{'Giá thị trường'}</Text>
                            <Text style={styles.value}>
                                {formatSmartMoney(investmentData.market_value || 0)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>{'ROI'}</Text>
                            <Text style={[
                                styles.value,
                                { color: roi_value >= 0 ? COLOR_APP.green : COLOR_APP.red }
                            ]}>
                                {`${roi_value}%`}
                            </Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>{'Ngày mua'}</Text>
                            <Text style={styles.value}>{dateStr}</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.txt_title}>{'Lịch sử giao dịch'}</Text>
            </View>
        )
    }

    console.log('loggg dataList', dataList)

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>

            <View style={styles.container}>
                <HeaderView onBack={onBack} title={investmentData.name} />
                <FlatList
                    ListHeaderComponent={renderHeader}
                    renderItem={renderItem}
                    data={dataList}
                    keyExtractor={keyExtractor_}
                    ListEmptyComponent={<EmptyView />}
                />
                <PopupEditTransaction ref={editTransactionRef} onSuccess={onUpdateSuccess} />
                <PopupConfirm ref={deleteConfirmRef} />
                <PopupToast ref={toastRef} />
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    container_header: {
        marginHorizontal: 10,
        marginBottom: 10
    },
    box_info: {
        backgroundColor: '#f2f6f9',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15
    },
    txt_name: {
        color: '#000',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5
    },
    col: {
        flex: 1,
        alignItems: 'center'
    },
    label: {
        color: '#666',
        fontSize: 12,
        marginBottom: 3
    },
    value: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600'
    },
    txt_title: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5
    },
    line: {
        marginHorizontal: 10
    },
    item_container: {
        marginHorizontal: 10
    }
})
