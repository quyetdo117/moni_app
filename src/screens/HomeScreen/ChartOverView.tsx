import { formatSmartMoney } from '@/utils/format';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart, pieDataItem } from "react-native-gifted-charts";

interface itemFocus extends pieDataItem  {
    value: number,
    title: string
}

const pieData = [
    {
        value: 100000,
        color: '#009FFF',
        gradientCenterColor: '#006DFF',
        title: 'Còn lại',
        focused: true,
    },
    { value: 20000, title: 'Đầu tư', color: '#93FCF8', gradientCenterColor: '#3BE9DE' },
    { value: 16700, title: 'Tiết kiệm', color: '#BDB2FA', gradientCenterColor: '#8F80F3' },
    { value: 30000, title: 'Chi tiêu', color: '#FFA5BA', gradientCenterColor: '#FF7F97' },
];

export default function ChartOverView() {

    const [dataFocus, setDataFocus] = useState<itemFocus>(pieData[0])

    const onSelectChart = (item: itemFocus) => {
        setDataFocus(item)
    }

    const renderCenter = () => {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text
                    style={{ fontSize: 22, color: 'white', fontWeight: 'bold' }}>
                    {formatSmartMoney(dataFocus.value)}
                </Text>
                <Text style={{ fontSize: 14, color: 'white' }}>{dataFocus.title}</Text>
            </View>
        )
    }

    const renderNote = () => {
        return (
            <View>
                {
                    pieData.map((item, index) => {
                        return (
                            <View key={index} style={styles.item_note}>
                                <View style={[styles.point, {backgroundColor: item.color}]}/>
                                <Text style={styles.txt_note}>{item.title}</Text>
                            </View>
                        )
                    })
                }
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.box_header}>
                <Text style={styles.title}>{'Tổng quan'}</Text>
                <RNBounceable style={styles.box_date}>
                    <Text>{'Tháng này'}</Text>
                </RNBounceable>
            </View>
            <View style={styles.box_chart}>
                <PieChart
                    data={pieData}
                    donut
                    sectionAutoFocus
                    radius={110}
                    focusOnPress
                    innerRadius={60}
                    innerCircleColor={'#232B5D'}
                    onPress={onSelectChart}
                    centerLabelComponent={renderCenter}
                />
                {renderNote()}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        marginHorizontal: 10
    },
    box_chart: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    point: {
        width: 15,
        height: 15,
        borderRadius: 20
    },
    item_note: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10
    },
    txt_note: {
        marginLeft: 10,
        fontWeight: '600',
        fontSize: 14
    },
    box_date: {
        alignSelf: 'flex-start',
        borderRadius: 5,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderWidth: 0.5
    },
    box_header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    title: {
        fontWeight: '600',
        fontSize: 22
    }
})
