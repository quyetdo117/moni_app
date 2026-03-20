import { key_assets } from '@/constants/constants';
import { getPieChartData, PieChartData } from '@/services/Api/get.services';
import { useChartStore, useUserStore } from '@/store/main.store';
import { ChartDataItemStore } from '@/store/store.types';
import { formatSmartMoney_2 } from '@/utils/convertData';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from "react-native-gifted-charts";

const width = Dimensions.get('window').width;
const WIDTH_CHART = (width - 230) / 2;

const COLORS = {
    income: '#54A0FF',
    expense: '#FF8383',
    invest: '#A29BFE',
    save: '#55E6C1',
    inCircle: '#162472'
};

const DEFAULT_NOTES = [
    { title: 'Thu nhập', color: COLORS.income },
    { title: 'Chi tiêu', color: COLORS.expense },
    { title: 'Đầu tư', color: COLORS.invest },
    { title: 'Tiết kiệm', color: COLORS.save }
];


export default function ChartOverView() {
    const uid = useUserStore(state => state.uid);
    const { pieDataIn, pieDataOut,
        dataFocusIn, dataFocusOut,
        setPieDataIn, setPieDataOut,
        setDataFocusIn, setDataFocusOut, chartDateRange, setChartDateRange } = useChartStore();

    // Get date range for chart
    const getChartDateRange = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();
        return {
            startDate: startOfMonth,
            endDate: endOfMonth,
            label: 'Tháng này'
        };
    };

    useEffect(() => {
        if (uid) {
            loadChartData();
        }
    }, [uid]);

    const loadChartData = async () => {
        // Get current month time range
        const dateRange = getChartDateRange();
        setChartDateRange(dateRange);

        const result = await getPieChartData(uid, dateRange.startDate / 1000, dateRange.endDate / 1000);
        if (result.success && result.data) {
            const data = result.data as PieChartData;

            // Prepare data for "in" chart with first item focused
            const inData: ChartDataItemStore[] = [];
            if (data.in.expense > 0) {
                inData.push({
                    value: data.in.expense,
                    color: COLORS.income,
                    type: key_assets.expense,
                    title: 'Thu nhập'
                });
            }
            if (data.in.invest > 0) {
                inData.push({
                    value: data.in.invest,
                    color: COLORS.invest,
                    type: key_assets.invest,
                    title: 'Đầu tư'
                });
            }
            if (data.in.save > 0) {
                inData.push({
                    value: data.in.save,
                    color: COLORS.save,
                    type: key_assets.save,
                    title: 'Tiết kiệm'
                });
            }

            // Set focused for first item
            if (inData.length > 0) {
                inData[0].focused = true;
                setDataFocusIn(inData[0]);
            }
            setPieDataIn(inData);

            // Prepare data for "out" chart with first item focused
            const outData: ChartDataItemStore[] = [];
            if (data.out.expense > 0) {
                outData.push({
                    value: data.out.expense,
                    color: COLORS.expense,
                    type: key_assets.expense,
                    title: 'Chi tiêu'
                });
            }
            if (data.out.invest > 0) {
                outData.push({
                    value: data.out.invest,
                    color: COLORS.invest,
                    type: key_assets.invest,
                    title: 'Đầu tư'
                });
            }
            if (data.out.save > 0) {
                outData.push({
                    value: data.out.save,
                    color: COLORS.save,
                    type: key_assets.save,
                    title: 'Tiết kiệm'
                });
            }

            // Set focused for first item
            if (outData.length > 0) {
                outData[0].focused = true;
                setDataFocusOut(outData[0]);
            }
            setPieDataOut(outData);
        }
    };

    const onSelectChartIn = (item: ChartDataItemStore) => {
        setDataFocusIn(item);
    };

    const onSelectChartOut = (item: ChartDataItemStore) => {
        setDataFocusOut(item);
    };

    const renderCenterIn = () => {
        if (!dataFocusIn) {
            return (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: 'white' }}>{'0'}</Text>
                </View>
            );
        }
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>
                    {formatSmartMoney_2(dataFocusIn.value)}
                </Text>
                <Text style={{ fontSize: 12, color: 'white' }}>{dataFocusIn.title}</Text>
            </View>
        );
    };

    const renderCenterOut = () => {
        if (!dataFocusOut) {
            return (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: 'white' }}>{'0'}</Text>
                </View>
            );
        }
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>
                    {formatSmartMoney_2(dataFocusOut.value)}
                </Text>
                <Text style={{ fontSize: 12, color: 'white' }}>{dataFocusOut.title}</Text>
            </View>
        );
    };

    const renderNote = () => {
        return (
            <View style={styles.note_container}>
                {DEFAULT_NOTES.map((item, index) => {
                    return (
                        <View key={index} style={styles.item_note}>
                            <View style={[styles.point, { backgroundColor: item.color }]} />
                            <Text style={styles.txt_note}>{item.title}</Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    const totalIn = pieDataIn.reduce((sum, item) => sum + item.value, 0);
    const totalOut = pieDataOut.reduce((sum, item) => sum + item.value, 0);

    return (
        <View style={styles.container}>
            <View style={styles.box_header}>
                <Text style={styles.title}>{'Tổng quan'}</Text>
                <RNBounceable style={styles.box_date}>
                    <Text>{'Tháng này'}</Text>
                </RNBounceable>
            </View>

            {/* Two charts side by side */}
            <View style={styles.charts_row}>
                {/* Chart for In (Dòng tiền vào) */}
                <View style={styles.chart_section}>
                    <Text style={styles.chart_title}>{'Dòng tiền vào'}</Text>
                    <View style={styles.box_chart}>
                        {pieDataIn.length > 0 ? (
                            <PieChart
                                data={pieDataIn}
                                donut
                                sectionAutoFocus
                                radius={WIDTH_CHART}
                                focusOnPress
                                innerRadius={35}
                                innerCircleColor={COLORS.inCircle}
                                onPress={onSelectChartIn}
                                centerLabelComponent={renderCenterIn}
                            />
                        ) : (
                            <View style={[styles.empty_chart, { backgroundColor: COLORS.inCircle }]}>
                                <Text style={styles.no_data}>0</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Chart for Out (Dòng tiền ra) */}
                <View style={styles.chart_section}>
                    <Text style={styles.chart_title}>{'Dòng tiền ra'}</Text>
                    <View style={styles.box_chart}>
                        {pieDataOut.length > 0 ? (
                            <PieChart
                                data={pieDataOut}
                                donut
                                sectionAutoFocus
                                radius={WIDTH_CHART}
                                focusOnPress
                                innerRadius={35}
                                innerCircleColor={COLORS.inCircle}
                                onPress={onSelectChartOut}
                                centerLabelComponent={renderCenterOut}
                            />
                        ) : (
                            <View style={[styles.empty_chart, { backgroundColor: COLORS.inCircle }]}>
                                <Text style={styles.no_data}>0</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Common note - horizontal */}
            {renderNote()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        marginHorizontal: 10
    },
    charts_row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    chart_section: {
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 10
    },
    chart_title: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 15
    },
    total_amount: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10
    },
    box_chart: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120
    },
    empty_chart: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center'
    },
    note_container: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15
    },
    point: {
        width: 12,
        height: 12,
        borderRadius: 20
    },
    item_note: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10
    },
    txt_note: {
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 12
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
    },
    no_data: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold'
    }
});
