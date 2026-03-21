import { key_assets } from '@/constants/constants';
import { getPieChartData, PieChartData } from '@/services/Api/get.services';
import { useChartStore, useUserStore } from '@/store/main.store';
import { ChartDataItemStore } from '@/store/store.types';
import { formatSmartMoney_2 } from '@/utils/convertData';
import { commonStyles } from '@/utils/styles_shadow';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from "react-native-gifted-charts";
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

const width = Dimensions.get('window').width;
const WIDTH_CHART = (width - 240) / 2;

// Modern Minimalist Color Palette
const COLORS = {
    income: '#10B981',     // Success green
    expense: '#EF4444',   // Error red
    invest: '#8B5CF6',    // Purple
    save: '#3B82F6',      // Blue
    inCircle: Colors.surface  // White/light background
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
        setDataFocusIn, setDataFocusOut, setChartDateRange } = useChartStore();

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
                <View style={styles.centerContent}>
                    <Text style={styles.centerValue}>{'0'}</Text>
                </View>
            );
        }
        return (
            <View style={styles.centerContent}>
                <Text style={styles.centerValue}>
                    {formatSmartMoney_2(dataFocusIn.value)}
                </Text>
                <Text style={styles.centerLabel}>{dataFocusIn.title}</Text>
            </View>
        );
    };

    const renderCenterOut = () => {
        if (!dataFocusOut) {
            return (
                <View style={styles.centerContent}>
                    <Text style={styles.centerValue}>{'0'}</Text>
                </View>
            );
        }
        return (
            <View style={styles.centerContent}>
                <Text style={styles.centerValue}>
                    {formatSmartMoney_2(dataFocusOut.value)}
                </Text>
                <Text style={styles.centerLabel}>{dataFocusOut.title}</Text>
            </View>
        );
    };

    const renderNote = () => {
        return (
            <View style={styles.noteContainer}>
                {DEFAULT_NOTES.map((item, index) => {
                    return (
                        <View key={index} style={styles.noteItem}>
                            <View style={[styles.noteDot, { backgroundColor: item.color }]} />
                            <Text style={styles.noteText}>{item.title}</Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{''}</Text>
                <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>{'Tháng này'}</Text>
                </View>
            </View>

            {/* Two charts side by side */}
            <View style={styles.chartsRow}>
                {/* Chart for In (Dòng tiền vào) */}
                <View style={[styles.chartCard, commonStyles.box_shadow]}>
                    <Text style={styles.chartTitle}>{'Dòng tiền vào'}</Text>
                    <View style={styles.chartContainer}>
                        {pieDataIn.length > 0 ? (
                            <PieChart
                                data={pieDataIn}
                                donut
                                sectionAutoFocus
                                radius={WIDTH_CHART}
                                focusOnPress
                                innerRadius={40}
                                innerCircleColor={COLORS.inCircle}
                                onPress={onSelectChartIn}
                                centerLabelComponent={renderCenterIn}
                            />
                        ) : (
                            <View style={[styles.emptyChart, { backgroundColor: Colors.surfaceElevated }]}>
                                <Text style={styles.noData}>0</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Chart for Out (Dòng tiền ra) */}
                <View style={[styles.chartCard, commonStyles.box_shadow]}>
                    <Text style={styles.chartTitle}>{'Dòng tiền ra'}</Text>
                    <View style={styles.chartContainer}>
                        {pieDataOut.length > 0 ? (
                            <PieChart
                                data={pieDataOut}
                                donut
                                sectionAutoFocus
                                radius={WIDTH_CHART}
                                focusOnPress
                                innerRadius={40}
                                innerCircleColor={COLORS.inCircle}
                                onPress={onSelectChartOut}
                                centerLabelComponent={renderCenterOut}
                            />
                        ) : (
                            <View style={[styles.emptyChart, { backgroundColor: Colors.surfaceElevated }]}>
                                <Text style={styles.noData}>0</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Legend */}
            {renderNote()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: Spacing.base,
        marginHorizontal: Spacing.md
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.base,
    },
    title: {
        fontWeight: Typography.fontWeight.bold,
        fontSize: Typography.fontSize.xl,
        color: Colors.text,
    },
    dateBadge: {
        backgroundColor: Colors.surface,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    dateText: {
        fontSize: Typography.fontSize.sm,
        color: Colors.textSecondary,
    },
    chartsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.sm,
    },
    chartCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.base,
    },
    chartTitle: {
        fontWeight: Typography.fontWeight.semiBold,
        fontSize: Typography.fontSize.base,
        color: Colors.text,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    emptyChart: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerValue: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.text,
    },
    centerLabel: {
        fontSize: Typography.fontSize.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    noData: {
        fontSize: Typography.fontSize.lg,
        color: Colors.textTertiary,
        fontWeight: Typography.fontWeight.medium,
    },
    noteContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.base,
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    noteItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    noteDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    noteText: {
        marginLeft: Spacing.xs,
        fontSize: Typography.fontSize.xs,
        color: Colors.textSecondary,
    },
});
