import { colors_chart, TYPE_TRANSACTION } from '@/constants/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ChartStore, InfoUserStore, ListItem } from './store.types';

export const useUserStore = create<InfoUserStore>()(
    persist(
        (set, get) => ({
            infoUser: null,
            infoAsset: {}, // lay thong tin id cua asset
            uid: '',
            isLogin: false,
            setStateLogin: (type) => set({ isLogin: type }),
            setInfoUser: (data) => set({ infoUser: data }),
            setInfoAsset: (assets => {
                const { infoAsset } = get();
                const newInfoAsset = { ...infoAsset };
                assets.forEach((item) => {
                    newInfoAsset[item.type] = item;
                });
                set({ infoAsset: newInfoAsset })
            }),
            setUidUser: (id) => set({ uid: id }),
            logout: () => set({ infoUser: null, uid: '', isLogin: false })
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage),
            skipHydration: true
        }
    )
);

export const useListStore = create<ListItem>((set) => ({
    listExpense: [],
    setListExpense: (data) => set({ listExpense: data }),
    listInvest: [],
    setListInvest: (data) => set({ listInvest: data }),
    listSave: [],
    setListSave: (data) => set({ listSave: data })
}))

export const useChartStore = create<ChartStore>()(
    persist(
        (set, get) => ({
            pieDataIn: [], pieDataOut: [], dataFocusIn: null, dataFocusOut: null,
            chartDateRange: { startDate: 0, endDate: 0, label: 'Tháng này' },
            setPieDataIn: (data) => set({ pieDataIn: data }),
            setPieDataOut: (data) => set({ pieDataOut: data }),
            setDataFocusIn: (data) => set({ dataFocusIn: data }),
            setDataFocusOut: (data) => set({ dataFocusOut: data }),
            setChartDateRange: (range) => set({ chartDateRange: range }),
            updateChartData: (type_, valueChange, data) => {
                const { chartDateRange } = get();
                // Check if date is within range
                const transactionDate = data.date_buy * 1000;
                if (transactionDate < chartDateRange.startDate || transactionDate > chartDateRange.endDate) {
                    return;
                }

                // Determine which chart to update
                let targetChart: 'in' | 'out';

                if (type_ === 'expense' || type_ === 'income') {
                    // expense: IN -> 'in', OUT -> 'out'
                    targetChart = data.type === TYPE_TRANSACTION.IN ? 'in' : 'out';
                } else {
                    // not expense (invest/save): based on data.type (TYPE_TRANSACTION)
                    // IN=1 (buy) -> 'out', OUT=0 (sell) -> 'in'
                    // When invest/save transaction occurs:
                    // IN (buy) -> reduces expense, update pieDataOut (expense)
                    // OUT (sell) -> increases income, update pieDataIn (income)
                    targetChart = data.type === TYPE_TRANSACTION.IN ? 'out' : 'in';

                    // Also update expense chart when there's invest/save transaction
                    const expenseChartData = get().pieDataOut;
                    const expenseIndex = expenseChartData.findIndex(item => item.type === 'expense');
                    let newExpenseData = [...expenseChartData];
                    const expenseChange = data.type === TYPE_TRANSACTION.IN ? -Math.abs(valueChange) : Math.abs(valueChange);

                    if (expenseIndex >= 0) {
                        newExpenseData[expenseIndex].value = Math.max(0, newExpenseData[expenseIndex].value + expenseChange);
                    }
                    get().setPieDataOut(newExpenseData);
                }

                const chartData = targetChart === 'in' ? get().pieDataIn : get().pieDataOut;
                const setChartData = targetChart === 'in' ? get().setPieDataIn : get().setPieDataOut;

                // Map type_ to title
                const titleMap: Record<string, string> = {
                    'income': 'Thu nhập',
                    'expense': 'Chi tiêu',
                    'invest': 'Đầu tư',
                    'save': 'Tiết kiệm'
                };
                const title = titleMap[type_];

                const existingIndex = chartData.findIndex(item => item.type === type_);
                let newData = [...chartData];
                const absValue = Math.abs(valueChange);

                if (existingIndex >= 0) {
                    newData[existingIndex].value = Math.max(0, newData[existingIndex].value + valueChange);
                } else if (valueChange > 0) {
                    const COLORS: Record<string, string> = {
                        'income': colors_chart.income,
                        'expense': colors_chart.expense,
                        'save': colors_chart.save,
                        'invest': colors_chart.income
                    };
                    newData.push({ value: absValue, color: COLORS[type_] || '#999', title, type: type_ });
                }
                setChartData(newData);
            }
        }),
        { name: 'chart-storage', storage: createJSONStorage(() => AsyncStorage), skipHydration: true }
    )
);