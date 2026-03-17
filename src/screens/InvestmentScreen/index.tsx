import BoxMoney from '@/components/common/BoxMoney';
import ButtonCustom from '@/components/common/ButtonCustom';
import HeaderView from '@/components/common/HeaderView';
import { COLOR_APP, key_assets } from '@/constants/constants';
import { getCategories } from '@/services/Api/get.services';
import { useListStore, useUserStore } from '@/store/main.store';
import { RootStackScreenProps } from '@/types/navigation.types';
import { PopupRef } from '@/types/view.types';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
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
    const PopupRef = useRef<PopupRef>(null);
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
            const jsonData = await getCategories(key_assets.invest, uid);
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
            <View>
                <View style={styles.box_overview}>
                    {
                        dataInvest.map((item, index) => {
                            return <BoxMoney
                                style_box={{ backgroundColor: item.id == '2' ? COLOR_APP.blue : '#fff' }}
                                style={{ flex: 1 }} data={item}
                                style_txt={item.id === '2' && { color: '#fff' }}
                                key={index} />
                        })
                    }
                </View>
                <ButtonCustom
                    title='Tạo khoản đầu tư'
                    style_btn={styles.style_btn}
                    onPress={onPressCreate}
                    Icon={Ionicons}
                    name_icon={'create'}
                />
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
            <View key={item.id} style={{ marginHorizontal: 10, marginVertical: 5 }}>
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
            style={{ flex: 1 }}>
            <View style={styles.conatiner}>
                <HeaderView onBack={onBack} title={'Khoản đầu tư'} />
                <FlatList
                    ListHeaderComponent={renderHeader}
                    data={listInvest}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor_}
                />
                <PopupFormInvest ref={PopupFormRef} onSuccess={onCreateSuccess} />
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    conatiner: {
        flex: 1
    },
    box_overview: {
        flexDirection: 'row',
        marginHorizontal: 5,
        marginTop: 10
    },
    style_btn: {
        marginHorizontal: 10,
        marginVertical: 5
    }
})
