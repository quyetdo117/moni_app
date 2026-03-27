import BoxSwipeable from '@/components/common/BoxSwipeable';
import ButtonCustom from '@/components/common/ButtonCustom';
import EmptyView from '@/components/common/EmptyView';
import HeaderView from '@/components/common/HeaderView';
import ItemInvestPayment from '@/components/items/ItemInvestPayment';
import { PopupConfirm } from '@/components/popups/PopupConfirm';
import { PopupToast } from '@/components/popups/PopupToast';
import { COLOR_APP, key_assets, TYPE_TRANSACTION } from '@/constants/constants';
import { DataInvestItem } from '@/screens/InvestmentScreen/types/Investment.types';
import { getListTransaction } from '@/services/Api/get.services';
import { deleteCategory, deleteTransaction } from '@/services/Api/transaction.services';
import { useChartStore, useListStore, useUserStore } from '@/store/main.store';
import { InfoAsset, InfoTransaction } from '@/types/info.types';
import { RootStackScreenProps } from '@/types/navigation.types';
import { PopupRef } from '@/types/view.types';
import { calculateROI, formatSmartMoney } from '@/utils/convertData';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/theme';
import PopupEditInvestCategory from '../popups/PopupEditInvestCategory';
import PopupEditTransaction from '../popups/PopupEditTransaction';
import PopupFormInvest from '../popups/PopupFormInvest';

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
    const editCategoryRef = useRef<PopupRef>(null);
    const createTransactionRef = useRef<PopupRef>(null);
    const deleteConfirmRef = useRef<PopupRef>(null);
    const toastRef = useRef<PopupRef>(null);
    const [dataList, setDataList] = useState<InfoTransaction[]>([]);
    const [investmentData, setInvestmentData] = useState<DataInvestItem>(investmentDataParam);
    useEffect(() => {
        onGetData();
    }, []);

    const onGetData = async () => {
        const investAssetId = infoAsset?.[key_assets.invest]?.id;
        const category_id = investmentData.id;
        const data = await getListTransaction(uid, investAssetId, category_id);
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

    // Button handlers for category
    const onEditCategory = () => {
        if (editCategoryRef.current) {
            editCategoryRef.current.onShow(investmentData);
        }
    }

    const onDeleteCategory = () => {
        if (deleteConfirmRef.current) {
            deleteConfirmRef.current.onShow({
                title: 'Bạn có chắc chắn muốn xóa danh mục này?',
                data: investmentData,
                onConfirm: confirmDeleteCategory,
                onCancel: () => { }
            });
        }
    }

    const confirmDeleteCategory = async (data: DataInvestItem) => {
        try {
            const jsonData = await deleteCategory(data.id, uid);
            if (jsonData.success) {
                // Update store - remove this category from list
                const updatedListInvest = listInvest.filter(item => item.id !== data.id);
                setListInvest(updatedListInvest);

                // Update infoAsset
                if (infoAsset?.['invest']) {
                    const currentTotalInvest = infoAsset['invest'].total_capital || 0;
                    const currentTotalMarket = infoAsset['invest'].total_value || 0;
                    const newTotalInvest = currentTotalInvest - (data.total_capital || 0);
                    const newTotalMarket = currentTotalMarket - (data.total_value || 0);

                    const updatedAsset = {
                        ...infoAsset['invest'],
                        total_capital: newTotalInvest,
                        total_value: newTotalMarket
                    } as InfoAsset;

                    const updatedAssetExpense = {
                        ...infoAsset['expense'],
                        total_value: Number(infoAsset['expense']?.total_value || 0) + (data.total_capital || 0)
                    } as InfoAsset;

                    setInfoAsset([updatedAsset, updatedAssetExpense]);
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
    }

    const onCreateTransaction = () => {
        if (createTransactionRef.current) {
            createTransactionRef.current.onShow(investmentData.id);
        }
    }

    const onCreateTransactionSuccess = (data: any) => {
        // Cập nhật dữ liệu từ kết quả trả về khi tạo giao dịch thành công
        if (data) {
            // Cập nhật danh sách giao dịch
            if (data.transaction) {
                const newTransaction = data.transaction;
                const isAdd = newTransaction.type === TYPE_TRANSACTION.IN;
                const valueChange = isAdd ? Number(newTransaction.total_value) : -Number(newTransaction.total_value);
                const quantityChange = isAdd ? Number(newTransaction.quantity || 0) : -Number(newTransaction.quantity || 0);
                const market_value = data.market_value;
                const newDataList = [newTransaction, ...dataList];
                updateInvestmentData(newDataList, valueChange, quantityChange, market_value);

                // Cập nhật infoAsset
                if (infoAsset?.['invest']) {
                    const currentTotalCapital = infoAsset['invest'].total_capital || 0;
                    const currentTotalValue = infoAsset['invest'].total_value || 0;
                    const newCapital = currentTotalCapital + valueChange;
                    const newTotal = currentTotalValue + (investmentData.market_value || 0) * quantityChange;
                    updateInfoUserStore(newCapital, newTotal, valueChange);
                }
            }
        } else {
            // Fallback: lấy lại dữ liệu nếu không có dữ liệu trả về
            onGetData();
        }
    }

    const onEditCategorySuccess = (updatedData: DataInvestItem) => {
        setInvestmentData(updatedData);

        // Update list
        const updatedListInvest = listInvest.map(item =>
            item.id === updatedData.id ? updatedData : item
        );
        setListInvest(updatedListInvest);

        toastRef.current?.onShow({
            message: 'Cập nhật thành công',
            type: 'success',
            duration: 2000
        });
    }

    const keyExtractor_ = (item: InfoTransaction, index: number) => index.toString();

    // Hàm cập nhật infoUser trong store sau khi có thay đổi investment
    const updateInfoUserStore = (newTotalCapital: number, newTotalValue: number, valueChange: number) => {
        if (!infoAsset) return;

        const currentInvestAsset = infoAsset['invest'];
        const currentExpenseAsset = infoAsset['expense'];
        if (!currentInvestAsset || !currentExpenseAsset) return;

        // Cập nhật asset thành công mới
        const updatedAsset = {
            ...currentInvestAsset,
            total_value: newTotalValue,
            total_capital: newTotalCapital
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
        quantityChange: number,
        new_market_value?: number
    ) => {
        setDataList(dataListChange);

        // Update investmentData locally
        const { quantity, total_capital, market_value } = investmentData;
        const market_value_ = new_market_value || market_value
        const newQuantity = (quantity || 0) + quantityChange;
        const newTotalCapital = (total_capital || 0) + valueChange;
        const newTotalValue = newQuantity * (market_value_ || 0);

        const newData = {
            ...investmentData,
            total_value: newTotalValue,
            quantity: newQuantity,
            total_capital: newTotalCapital,
            market_value: market_value_
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
                onCancel: () => { }
            });
        }
    }

    const confirmDelete = async (transactionData: InfoTransaction) => {
        try {
            const jsonData = await deleteTransaction(transactionData.id, key_assets.invest);
            if (jsonData.success) {
                const isAdd = transactionData.type === TYPE_TRANSACTION.IN;
                const valueDelete = isAdd ? -transactionData.total_value : transactionData.total_value;
                const quantityDelete = isAdd ? -(transactionData.quantity || 0) : (transactionData.quantity || 0);

                const newDataList = dataList.filter(item => item.id !== transactionData.id);
                updateInvestmentData(newDataList, valueDelete, quantityDelete);

                // Update infoAsset['invest'] in store
                if (infoAsset['invest']) {
                    const currentTotalCapital = infoAsset['invest'].total_capital || 0;
                    const currentTotalValue = infoAsset['invest'].total_value || 0;
                    const newCapital = currentTotalCapital + valueDelete;
                    const newTotal = currentTotalValue + (investmentData.market_value || 0) * quantityDelete;
                    updateInfoUserStore(newCapital, newTotal, valueDelete);
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
            const currentTotal = infoAsset['invest'].total_value || 0;
            const currentCapital = infoAsset['invest'].total_capital || 0;
            const newCapital = currentCapital + valueChange;
            const newTotal = currentTotal + (investmentData.market_value || 0) * quantityChange;
            updateInfoUserStore(newCapital, newTotal, valueChange);
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

    const roi_value = calculateROI(investmentData.total_capital || 0, investmentData.total_value || 0);
    const dateTimestamp = investmentData.date_buy;
    const dateStr = dateTimestamp ? moment.unix(dateTimestamp).format('DD/MM/YYYY') : '--/--/----';

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
        const roiColor = roi_value >= 0 ? COLOR_APP.green : COLOR_APP.red;
        const roiBgColor = roi_value >= 0 ? '#e8f5e9' : '#ffebee';
        console.log('logg investmentData', investmentData)

        return (
            <View style={styles.container_header}>
                <View style={styles.box_info}>
                    <View style={styles.boxHeader}>
                        <Text style={styles.investmentName} numberOfLines={1}>
                            {investmentData.name}
                        </Text>
                        <View style={[styles.roiBadge, { backgroundColor: roiBgColor }]}>
                            <Text style={[styles.roiBadgeText, { color: roiColor }]}>
                                ROI: {roi_value}%
                            </Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.colHighlight}>
                            <Text style={styles.label}>{'Tổng vốn'}</Text>
                            <Text style={[styles.valueSmall, { color: COLOR_APP.green }]}>
                                {formatSmartMoney(investmentData.total_capital || 0)}
                            </Text>
                        </View>
                        <View style={styles.colHighlight}>
                            <Text style={styles.label}>{'Giá trị hiện tại'}</Text>
                            <Text style={[styles.valueSmall, { color: COLOR_APP.blue }]}>
                                {formatSmartMoney(investmentData.total_value || 0)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>{'Số lượng'}</Text>
                            <Text style={styles.valueSmall}>{investmentData.quantity || 0}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>{'Giá thị trường'}</Text>
                            <Text style={styles.valueSmall}>
                                {formatSmartMoney(investmentData.market_value || 0)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>{'Lãi/Lỗ'}</Text>
                            <Text style={[styles.valueSmall, { color: roiColor }]}>
                                {formatSmartMoney((investmentData.total_value || 0) - (investmentData.total_capital || 0))}
                            </Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>{'Ngày mua'}</Text>
                            <Text style={styles.valueSmall}>{dateStr}</Text>
                        </View>
                    </View>
                </View>

                {renderActionButtons()}

                <View style={styles.sectionHeader}>
                    <View style={styles.sectionIcon} />
                    <Text style={styles.txt_title}>{'Lịch sử tích lũy'}</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <HeaderView
                isCenter={true}
                onBack={onBack}
                style_txt={{ fontSize: 20 }}
                title={'Chi tiết khoản đầu tư'} />
            <FlatList
                ListHeaderComponent={renderHeader}
                renderItem={renderItem}
                data={dataList}
                keyExtractor={keyExtractor_}
                ListEmptyComponent={<EmptyView />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
            <PopupEditTransaction ref={editTransactionRef} onSuccess={onUpdateSuccess} />
            <PopupEditInvestCategory ref={editCategoryRef} onSuccess={onEditCategorySuccess} />
            <PopupFormInvest ref={createTransactionRef} onSuccess={onCreateTransactionSuccess} />
            <PopupConfirm ref={deleteConfirmRef} />
            <PopupToast ref={toastRef} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    container_header: {
        marginHorizontal: 16,
        marginBottom: 10,
        marginTop: 15
    },
    box_info: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 10,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    boxHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    investmentName: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        flex: 1,
    },
    roiBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    roiBadgeText: {
        fontSize: 14,
        fontWeight: '700',
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
        marginVertical: 8
    },
    col: {
        flex: 1,
        alignItems: 'center'
    },
    colHighlight: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 8,
        marginHorizontal: 4,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: 13,
        marginBottom: 4,
        fontWeight: '500'
    },
    value: {
        color: Colors.text,
        fontSize: 17,
        fontWeight: '700'
    },
    valueSmall: {
        color: Colors.text,
        fontSize: 15,
        fontWeight: '600'
    },
    txt_title: {
        color: Colors.text,
        fontSize: 20,
        fontWeight: '700'
    },
    line: {
        marginHorizontal: 10
    },
    item_container: {
        marginHorizontal: 10
    },
    actionButtonsContainer: {
        marginBottom: 16,
    },
    addButton: {
        backgroundColor: COLOR_APP.blue,
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
        alignItems: 'center'
    },
    sectionIcon: {
        width: 4,
        height: 20,
        backgroundColor: COLOR_APP.blue,
        borderRadius: 2,
        marginRight: 10,
    },
    listContent: {
        paddingBottom: 20,
    },
})
