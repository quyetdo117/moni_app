import BoxSwipeable from '@/components/common/BoxSwipeable';
import ButtonCustom from '@/components/common/ButtonCustom';
import EmptyView from '@/components/common/EmptyView';
import HeaderView from '@/components/common/HeaderView';
import ItemSavePayment from '@/components/items/ItemSavePayment';
import { PopupConfirm } from '@/components/popups/PopupConfirm';
import { PopupToast } from '@/components/popups/PopupToast';
import { COLOR_APP, Colors, key_assets, TYPE_TRANSACTION } from '@/constants/constants';
import { getListTransaction } from '@/services/Api/get.services';
import { deleteCategory, deleteTransaction } from '@/services/Api/transaction.services';
import { useChartStore, useListStore, useUserStore } from '@/store/main.store';
import { InfoTransaction } from '@/types/info.types';
import { RootStackScreenProps } from '@/types/navigation.types';
import { PopupRef } from '@/types/view.types';
import { formatSmartMoney } from '@/utils/convertData';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import PopupEditSaveCategory from '../popups/PopupEditSaveCategory';
import PopupEditSaveTransaction from '../popups/PopupEditSaveTransaction';
import PopupFormSave from '../popups/PopupFormSave';

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
    const editCategoryRef = useRef<PopupRef>(null);
    const createTransactionRef = useRef<PopupRef>(null);
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

    // Button handlers for category
    const onEditCategory = () => {
        if (editCategoryRef.current) {
            editCategoryRef.current.onShow(saveData);
        }
    };

    const onDeleteCategory = () => {
        if (deleteConfirmRef.current) {
            deleteConfirmRef.current.onShow({
                title: 'Bạn có chắc chắn muốn xóa danh mục này?',
                data: saveData,
                onConfirm: confirmDeleteCategory,
                onCancel: () => {}
            });
        }
    };

    const confirmDeleteCategory = async (data: SaveDetailData) => {
        try {
            const jsonData = await deleteCategory(data.id, uid || '');
            if (jsonData.success) {
                // Update store - remove this category from list
                const updatedListSave = listSave.filter(item => item.id !== data.id);
                setListSave(updatedListSave);

                // Update infoAsset
                if (infoAsset?.['save']) {
                    const currentTotalSave = infoAsset['save'].total_value || 0;
                    const currentTotalMarket = infoAsset['save'].total_market || 0;
                    const newTotalSave = currentTotalSave - (data.total_value || 0);
                    const newTotalMarket = currentTotalMarket - (data.total_market || 0);
                    
                    const updatedAsset = {
                        ...infoAsset['save'],
                        total_value: newTotalSave,
                        total_market: newTotalMarket || 0
                    };
                    
                    const updatedAssetExpense = {
                        ...infoAsset['expense'],
                        total_value: Number(infoAsset['expense']?.total_value || 0) + (data.total_value || 0)
                    };
                    
                    setInfoAsset([updatedAsset as any, updatedAssetExpense as any]);
                }

                toastRef.current?.onShow({
                    message: 'Xóa danh mục thành công',
                    type: 'success',
                    duration: 2000
                });
                
                // Navigate back
                navigation?.goBack();
            } else {
                toastRef.current?.onShow({
                    message: jsonData.message || 'Xóa danh mục thất bại',
                    type: 'error',
                    duration: 2000
                });
            }
        } catch (error: any) {
            toastRef.current?.onShow({
                message: error.message || 'Xóa danh mục thất bại',
                type: 'error',
                duration: 2000
            });
        }
    };

    const onCreateTransaction = () => {
        if (createTransactionRef.current) {
            createTransactionRef.current.onShow(saveData.id);
        }
    };

    const onCreateTransactionSuccess = () => {
        onGetData();
    };

    const onEditCategorySuccess = (updatedData: SaveDetailData) => {
        setSaveData(updatedData);
        
        // Update list
        const updatedListSave = listSave.map(item =>
            item.id === updatedData.id ? { ...item, ...updatedData } as any : item
        );
        setListSave(updatedListSave);

        toastRef.current?.onShow({
            message: 'Cập nhật thành công',
            type: 'success',
            duration: 2000
        });
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

    // Render action buttons row
    const renderActionButtons = () => {
        return (
            <View style={styles.actionButtonsContainer}>
                <ButtonCustom 
                    title="Thêm giao dịch" 
                    onPress={onCreateTransaction}
                    style_btn={styles.addButton}
                    style_txt={styles.addButtonText}
                />
                
                <View style={styles.secondaryButtonsRow}>
                    <ButtonCustom 
                        title="Sửa" 
                        onPress={onEditCategory}
                        style_btn={styles.editButton}
                        style_txt={styles.editButtonText}
                    />
                    
                    <ButtonCustom 
                        title="Xóa" 
                        onPress={onDeleteCategory}
                        style_btn={styles.deleteButton}
                        style_txt={styles.deleteButtonText}
                    />
                </View>
            </View>
        );
    }

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
                
                {renderActionButtons()}
                
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon} />
                    <Text style={styles.txt_title}>{'Lịch sử tiết kiệm'}</Text>
                </View>
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
                <PopupFormSave ref={createTransactionRef} onSuccess={onCreateTransactionSuccess} />
                <PopupEditSaveTransaction ref={editTransactionRef} onSuccess={onUpdateSuccess} />
                <PopupEditSaveCategory ref={editCategoryRef} onSuccess={onEditCategorySuccess} />
                <PopupConfirm ref={deleteConfirmRef} />
                <PopupToast ref={toastRef} />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    container_header: {
        marginHorizontal: 16,
        marginTop: 15
    },
    box_info: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
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
        fontWeight: 'bold'
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
    // Action Buttons
    actionButtonsContainer: {
        marginBottom: 16,
    },
    addButton: {
        backgroundColor: COLOR_APP.blue,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: COLOR_APP.blue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButtonsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    editButton: {
        backgroundColor: Colors.background,
        borderWidth: 1.5,
        borderColor: COLOR_APP.blue,
        flex: 1,
        borderRadius: 10,
    },
    editButtonText: {
        color: COLOR_APP.blue,
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: Colors.background,
        borderWidth: 1.5,
        borderColor: COLOR_APP.red,
        flex: 1,
        borderRadius: 10,
    },
    deleteButtonText: {
        color: COLOR_APP.red,
        fontSize: 14,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionIcon: {
        width: 4,
        height: 20,
        backgroundColor: COLOR_APP.blue,
        borderRadius: 2,
        marginRight: 10,
    },
});
