import BoxMoney from '@/components/common/BoxMoney';
import ButtonCustom from '@/components/common/ButtonCustom';
import HeaderView from '@/components/common/HeaderView';
import { COLOR_APP } from '@/constants/constants';
import { RootStackScreenProps } from '@/types/navigation.types';
import { PopupRef } from '@/types/view.types';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import ItemInvest from './items/ItemInvest';
import PopupFormInvest from './popups/PopupFormInvest';
import PopupInvest from './popups/PopupInvest';
import { DataInvestItem } from './types/Investment.types';

const data_fake = [
    {
        id: '1',
        name: 'Tài sản đầu tư',
        total_value: 10000,
        type: 1
    },
    {
        id: '2',
        name: 'Giá trị hiện tại',
        total_value: 100000,
        type: 2
    }
]

const data_list = [
    {
        id: 1,
        title: 'Bitcoin',
        value_origin: 10000,
        value_current: 100000,
        date_buy: '11/01/2026',
        note: 'mua choi choi',
        extra_value: 100,
        transactions: [
            {
                id_transaction: 1,
                type: 1,
                name: 'Bitcoin',
                quantity: 2,
                rate_value: 9000,
                market_value: 10000,
                extra_value: 100,
                total_value: 30000,
                date_buy: '11/01/2026'
            },
            {
                id_transaction: 2,
                type: 0,
                name: 'Bitcoin',
                quantity: 2,
                rate_value: 9000,
                market_value: 10000,
                extra_value: 100,
                total_value: 30000,
                date_buy: '11/01/2026'
            },
            {
                id_transaction: 3,
                type: 1,
                name: 'Bitcoin',
                quantity: 2,
                rate_value: 9000,
                market_value: 10000,
                extra_value: 100,
                total_value: 30000,
                date_buy: '11/01/2026'
            },
            {
                id_transaction: 4,
                type: 0,
                name: 'Bitcoin',
                quantity: 2,
                rate_value: 9000,
                market_value: 10000,
                extra_value: 100,
                total_value: 30000,
                date_buy: '11/01/2026'
            },
            {
                id_transaction: 5,
                type: 1,
                name: 'Bitcoin',
                quantity: 2,
                rate_value: 9000,
                market_value: 10000,
                extra_value: 100,
                total_value: 30000,
                date_buy: '11/01/2026'
            },
            {
                id_transaction: 6,
                type: 0,
                name: 'Bitcoin',
                quantity: 2,
                rate_value: 9000,
                market_value: 10000,
                extra_value: 100,
                total_value: 30000,
                date_buy: '11/01/2026'
            },
            {
                id_transaction: 7,
                type: 1,
                name: 'Bitcoin',
                quantity: 2,
                rate_value: 9000,
                market_value: 10000,
                extra_value: 100,
                total_value: 30000,
                date_buy: '11/01/2026'
            },
            {
                id_transaction: 8,
                type: 0,
                name: 'Bitcoin',
                quantity: 2,
                rate_value: 9000,
                market_value: 10000,
                extra_value: 100,
                total_value: 30000,
                date_buy: '11/01/2026'
            }
        ]
    },
    {
        id: 2,
        title: 'Mua Vang',
        value_origin: 13000,
        value_current: 1000,
        date_buy: '11/01/2026',
        note: 'msds',
        transactions: []
    },
    {
        id: 3,
        title: 'Mua dat',
        value_origin: 10000000,
        value_current: 1000000000,
        date_buy: '11/01/2026',
        note: 'ko co j',
        transactions: []
    },
    {
        id: 4,
        title: 'Co Phieu Vin',
        value_origin: 10000,
        value_current: 100000,
        date_buy: '11/01/2026',
        note: '',
        transactions: []
    }
]

interface InvestType {
    item: DataInvestItem;
    index: number;
}

export default function InvestmentScreen({ navigation }: RootStackScreenProps<'InvestmentScreen'>) {


    const PopupRef = useRef<PopupRef>(null);
    const PopupFormRef = useRef<PopupRef>(null);

    const onBack = () => {
        navigation.goBack()
    }

    const onPressCreate = () => {
        if(PopupFormRef.current){
            PopupFormRef.current.onShow()
        }
    }

    const renderHeader = () => {
        return (
            <View>
                <View style={styles.box_overview}>
                    {
                        data_fake.map((item, index) => {
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
        if(PopupRef.current){
            PopupRef.current.onShow(data);
        }
    }

    const renderItem = ({ item, index }: InvestType) => {
        return (
            <View style={{marginHorizontal: 10, marginVertical: 5}}>
                <ItemInvest data={item} onPress={onPressItem}/>
            </View>
        )
    }

    const keyExtractor_ = (item: DataInvestItem, index: number) => {
        return index.toString();
    }

    return (
        <View style={styles.conatiner}>
            <HeaderView onBack={onBack} title={'Khoản đầu tư'} />
            <FlatList
                ListHeaderComponent={renderHeader}
                data={data_list}
                renderItem={renderItem}
                keyExtractor={keyExtractor_}
            />
            <PopupInvest ref={PopupRef}/>
            <PopupFormInvest ref={PopupFormRef} />
        </View>
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
