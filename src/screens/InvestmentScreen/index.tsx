
import BoxMoney from '@/components/common/BoxMoney';
import ButtonCustom from '@/components/common/ButtonCustom';
import HeaderView from '@/components/common/HeaderView';
import { key_assets } from '@/constants/constants';
import { getCategories } from '@/services/Api/get.services';
import { useListStore, useUserStore } from '@/store/main.store';
import { RootStackScreenProps } from '@/types/navigation.types';
import { PopupRef } from '@/types/view.types';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';
import ItemInvest from './items/ItemInvest';
import PopupFormInvest from './popups/PopupFormInvest';
import { DataInvestItem } from './types/Investment.types';


interface InvestType {
    item: DataInvestItem;
    index: number;
}

interface DataInvest {
    id: string;
    name: string;
    total_value: number;
    type: number;
}

const data_init = [
    {
        id: '1',
        name: 'Vốn đầu tư',
        total_value: 0,
        type: 1
    },
    {
        id: '2',
        name: 'Giá trị hiện tại',
        total_value: 0,
        type: 2
    }
]

export default function InvestmentScreen({ navigation }: RootStackScreenProps<'InvestmentScreen'>) {
    const PopupFormRef = useRef<PopupRef>(null);
    const infoAsset = useUserStore(state => state.infoAsset);
    const setListInvest = useListStore(state => state.setListInvest);
    const listInvest = useListStore(state => state.listInvest);
    const uid = useUserStore(state => state.uid);
    const [dataInvest, setDataInvest] = useState<DataInvest[]>(data_init);

    useEffect(() => {
        getList();
    }, [])

    useEffect(() => {

    }, [listInvest])

    useEffect(() => {
        const newData = [...data_init];
        newData[0].total_value = infoAsset?.invest?.total_value || 0;
        newData[1].total_value = infoAsset?.invest?.total_market || 0;
        setDataInvest(newData);
    }, [infoAsset])

    const getList = async () => {
        try {
            const dataBody = { asset_id: infoAsset?.invest?.id, type: key_assets.invest }
            const jsonData = await getCategories(dataBody, uid);
            if (jsonData.success && jsonData.data) {
                setListInvest(jsonData.data as DataInvestItem[]);
            }
        } catch (error) {

        }
    }

    const onCreateSuccess = async () => {
        getList();
    }

    const onBack = () => {
        navigation.goBack()
    }

    const onPressCreate = () => {
        if (PopupFormRef.current) {
            PopupFormRef.current.onShow()
        }
    }

    const renderHeader = () => {
        return (
            <View style={styles.headerContent}>
                {/* Overview Cards */}
                <View style={styles.overviewContainer}>
                    {
                        dataInvest.map((item, index) => {
                            const isCurrentValue = item.id === '2';
                            return (
                                <BoxMoney
                                    style_box={{
                                        backgroundColor: isCurrentValue ? Colors.primary : Colors.surface,
                                        marginLeft: isCurrentValue ? Spacing.md : 0
                                    }}
                                    style={{ flex: 1 }}
                                    data={item}
                                    variant={isCurrentValue ? 'primary' : 'default'}
                                    key={index}
                                />
                            )
                        })
                    }
                </View>

                {/* Create Button */}
                <View style={styles.buttonContainer}>
                    <ButtonCustom
                        title='Tạo khoản đầu tư'
                        onPress={onPressCreate}
                        Icon={Ionicons}
                        name_icon='add-circle-outline'
                        variant='primary'
                        style_btn={styles.createButton}
                    />
                </View>
            </View>
        )
    }

    const onPressItem = (data: DataInvestItem) => {
        navigation.navigate('InvestmentDetailScreen', {
            data
        });
    }


    const renderItem = ({ item, index }: InvestType) => {
        return (
            <View key={item.id} style={styles.itemContainer}>
                <ItemInvest data={item} onPress={onPressItem} />
            </View>
        )
    }

    const keyExtractor_ = (item: DataInvestItem, index: number) => {
        return index.toString();
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.container}>
                <HeaderView onBack={onBack} title={'Đầu tư'} />
                <FlatList
                    ListHeaderComponent={renderHeader}
                    data={listInvest}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor_}
                    contentContainerStyle={styles.listContent}
                />
                <PopupFormInvest ref={PopupFormRef} onSuccess={onCreateSuccess} />
            </View>
        </KeyboardAvoidingView>
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
    overviewContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.sm,
        marginBottom: Spacing.base,
    },
    buttonContainer: {
        paddingHorizontal: Spacing.base,
        marginBottom: Spacing.base,
    },
    createButton: {
        width: '100%',
    },
    itemContainer: {
        marginHorizontal: Spacing.base,
        marginVertical: Spacing.sm,
    },
    listContent: {
        paddingBottom: 100,
    },
})
