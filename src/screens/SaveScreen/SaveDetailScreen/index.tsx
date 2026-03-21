import BoxSwipeable from '@/components/common/BoxSwipeable';
import EmptyView from '@/components/common/EmptyView';
import HeaderView from '@/components/common/HeaderView';
import ItemSavePayment from '@/components/items/ItemSavePayment';
import { PopupConfirm } from '@/components/popups/PopupConfirm';
import { PopupToast } from '@/components/popups/PopupToast';
import { COLOR_APP, key_assets, TYPE_TRANSACTION } from '@/constants/constants';
import { getListTransaction } from '@/services/Api/get.services';
import { deleteTransaction } from '@/services/Api/transaction.services';
import { useChartStore, useListStore, useUserStore } from '@/store/main.store';
import { InfoTransaction } from '@/types/info.types';
import { RootStackScreenProps } from '@/types/navigation.types';
import { PopupRef } from '@/types/view.types';
import { formatSmartMoney } from '@/utils/convertData';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import PopupEditSaveTransaction from '../popups/PopupEditSaveTransaction';

interface DataItem {
    item: InfoTransaction;
    index: number;
}

export interface SaveDetailData {
    id: string;
    name: string;
    total_value: number;
    total_market?: number;
    target?: number;
    date_buy: number;
    createdAt?: any;
}

export default function SaveDetailScreen({ navigation, route }: RootStackScreenProps<'SaveDetailScreen'>) {
    const saveDataParam = route.params.data as SaveDetailData;
    const uid = useUserStore(state => state.uid);
    const listSave = useListStore(state => state.listSave);
    const setListSave = useListStore(state => state.setListSave);
    const infoAsset = useUserStore(state => state.infoAsset);
    const setInfoAsset = useUserStore(state => state.setInfoAsset);
    const updateChartData = useChartStore(state => state.updateChartData);
    const editTransactionRef = useRef<PopupRef>(null);
    const deleteConfirmRef = useRef<PopupRef>(null);
    const toastRef = useRef<PopupRef>(null);
    const [dataList, setDataList] = useState<InfoTransaction[]>([]);
    const [saveData, setSaveData] = useState<SaveDetailData>(saveDataParam);

    useEffect(() => {
        onGetData();
    }, []);

    const onGetData = async () => {
        const saveAssetId = infoAsset?.[key_assets.save]?.id;
        const category_id = saveData.id;
        const data = await getListTransaction(uid, saveAssetId, category_id);
        if (data.success) {
            const listData = data?.data as InfoTransaction[] || [];
            setDataList(listData);
        } else {
            console.log('error', data.msg);
        }
    };

    const onBack = () => {
        navigation?.goBack();
    };

    const keyExtractor_ = (item: InfoTransaction, index: number) => index.toString();

    // Hàm cập nhật infoUser trong store sau khi có thay đổi save
    const updateInfoUserStore = (newTotalSave: number, newTotalMarket: number, valueChange: number) => {
        if (!infoAsset) return;

        const currentSaveAsset = infoAsset?.[key_assets.save];
        const currentExpenseAsset = infoAsset?.[key_assets.expense];
        if (!currentSaveAsset || !currentExpenseAsset) return;

        // Cập nhật asset thành công mới
        const updatedAsset = {
            ...currentSaveAsset,
            total_value: newTotalSave,
            total_market: newTotalMarket
        };

        const updatedAssetExpense = {
            ...currentExpenseAsset,
            total_value: Number(currentExpenseAsset?.total_value || 0) - valueChange
        };

        // Cập nhật assets
        setInfoAsset([updatedAsset, updatedAssetExpense]);
    };

    // Hàm dùng chung để cập nhật save data sau khi có thay đổi
    const updateSaveData = (
        dataListChange: InfoTransaction[],
        valueChange: number
    ) => {
        setDataList(dataListChange);

        // Update saveData locally
        const { total_value, total_market } = saveData;
        const newTotalValue = (total_value || 0) + valueChange;
        const newTotalMarket = total_market ? (total_market + valueChange) : newTotalValue;

        const newData = {
            ...saveData,
            total_value: newTotalValue,
            total_market: newTotalMarket
        };

        setSaveData(newData);

        // Update store
        const updatedListSave = listSave.map(item =>
            item.id === newData.id ? { ...item, total_value: newTotalValue, total_market: newTotalMarket } : item
        );
        setListSave(updatedListSave);
    };

    const onDelete = async (data: InfoTransaction) => {
        // Show confirmation popup
        if (deleteConfirmRef.current) {
            deleteConfirmRef.current.onShow({
                title: 'Bạn có chắc chắn muốn xóa giao dịch này?',
                data: data,
                onConfirm: confirmDelete,
                onCancel: () => { }
            });
        }
    };

    const confirmDelete = async (transactionData: InfoTransaction) => {
        try {
            const jsonData = await deleteTransaction(transactionData.id);
            if (jsonData.success) {
                const isAdd = transactionData.type === TYPE_TRANSACTION.IN;
                const valueDelete = isAdd ? -transactionData.total_value : transactionData.total_value;

                const newDataList = dataList.filter(item => item.id !== transactionData.id);
                updateSaveData(newDataList, valueDelete);

                // Update infoAsset['save'] in store
                if (infoAsset?.[key_assets.save]) {
                    const currentTotalSave = infoAsset[key_assets.save]?.total_value || 0;
                    const currentTotalMarket = infoAsset[key_assets.save]?.total_market || 0;
                    const newTotalSave = currentTotalSave + valueDelete;
                    const newTotalMarket = currentTotalMarket + valueDelete;
                    updateInfoUserStore(newTotalSave, newTotalMarket, valueDelete);
                }

                // Update chart
                updateChartData(key_assets.save, valueDelete, { date_buy: transactionData.date_buy, type: transactionData.type });

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
    };

    const onUpdateSuccess = (updatedData: InfoTransaction) => {
        // Calculate difference
        const oldTransaction = dataList.find(item => item.id === updatedData.id);
        if (!oldTransaction) return;

        const oldValue = oldTransaction.total_value;
        const newValue = updatedData.total_value;
        const valueDiff = newValue - oldValue;

        const isAdd = updatedData.type === TYPE_TRANSACTION.IN;
        const valueChange = isAdd ? valueDiff : -valueDiff;

        // Update list
        const newDataList = dataList.map(item =>
            item.id === updatedData.id ? updatedData : item
        );

        updateSaveData(newDataList, valueChange);

        // Update infoAsset['save'] in store
        if (infoAsset?.[key_assets.save]) {
            const currentTotalSave = infoAsset[key_assets.save]?.total_value || 0;
            const currentTotalMarket = infoAsset[key_assets.save]?.total_market || 0;
            const newTotalSave = currentTotalSave + valueChange;
            const newTotalMarket = currentTotalMarket + valueChange;
            updateInfoUserStore(newTotalSave, newTotalMarket, valueChange);
        }

        // Update chart
        updateChartData(key_assets.save, valueChange, { date_buy: updatedData.date_buy, type: updatedData.type });
    };

    const onEdit = (data: InfoTransaction) => {
        if (editTransactionRef.current) {
            editTransactionRef.current.onShow(data);
        }
    };

    const renderItem = ({ item, index }: DataItem) => {
        return (
            <BoxSwipeable<InfoTransaction>
                isSmall={true}
                onDelete={onDelete} onEdit={onEdit} key={item.id} data={item}>
                <ItemSavePayment data={item} />
            </BoxSwipeable>
        );
    };

    const dateTimestamp = saveData.date_buy;
    const dateStr = dateTimestamp ? moment.unix(dateTimestamp).format('DD/MM/YYYY') : '';

    // Calculate interest
    const interestEarned = saveData.total_market ? saveData.total_market - saveData.total_value : 0;

    // Calculate progress towards target
    const currentAmount = saveData.total_market || saveData.total_value;
    const targetAmount = saveData.target || 0;
    const progress = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 100;

    const renderHeader = () => {
        return (
            <View style={styles.container_header}>
                <View style={styles.box_info}>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>{'Đã tiết kiệm'}</Text>
                            <Text style={[styles.value, { color: COLOR_APP.green }]}>
                                {formatSmartMoney(saveData.total_value || 0)}
                            </Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>{'Hiện tại (có lãi)'}</Text>
                            <Text style={[styles.value, { color: COLOR_APP.blue }]}>
                                {formatSmartMoney(currentAmount)}
                            </Text>
                        </View>
                    </View>

                    {interestEarned > 0 && (
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>{'Lãi đã nhận'}</Text>
                                <Text style={[styles.value, { color: COLOR_APP.green }]}>
                                    +{formatSmartMoney(interestEarned)}
                                </Text>
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>{'Ngày tạo'}</Text>
                                <Text style={styles.value}>{dateStr}</Text>
                            </View>
                        </View>
                    )}

                    {targetAmount > 0 && (
                        <View style={styles.targetContainer}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>{'Tiến độ mục tiêu'}</Text>
                                <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                            </View>
                            <View style={styles.targetRow}>
                                <Text style={styles.targetLabel}>{'Mục tiêu:'}</Text>
                                <Text style={styles.targetValue}>{formatSmartMoney(targetAmount)}</Text>
                            </View>
                        </View>
                    )}
                </View>
                <Text style={styles.txt_title}>{'Lịch sử giao dịch'}</Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>

            <View style={styles.container}>
                <HeaderView isCenter={true} onBack={onBack} title={saveData.name} />
                <FlatList
                    ListHeaderComponent={renderHeader}
                    renderItem={renderItem}
                    data={dataList}
                    keyExtractor={keyExtractor_}
                    ListEmptyComponent={<EmptyView />}
                />
                <PopupEditSaveTransaction ref={editTransactionRef} onSuccess={onUpdateSuccess} />
                <PopupConfirm ref={deleteConfirmRef} />
                <PopupToast ref={toastRef} />
            </View>
        </KeyboardAvoidingView>
    );
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
    targetContainer: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 12,
        color: '#666',
    },
    progressPercent: {
        fontSize: 14,
        fontWeight: '600',
        color: COLOR_APP.blue,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLOR_APP.blue,
        borderRadius: 4,
    },
    targetRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 6,
    },
    targetLabel: {
        fontSize: 12,
        color: '#666',
    },
    targetValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a1a',
        marginLeft: 4,
    },
});
