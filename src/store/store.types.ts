import { DataInvestItem } from '@/screens/InvestmentScreen/types/Investment.types';
import { InfoAsset, InfoTransaction, InfoUser } from "@/types/info.types";
import { type_asset } from "@/types/schema.types";

export interface InfoUserStore {
    infoUser: InfoUser | null;
    uid: string;
    infoAsset: Partial<Record<type_asset, InfoAsset>>;
    isLogin: boolean;
    setUidUser: (id: string) => void;
    setInfoUser: (data: InfoUser | null) => void;
    setStateLogin: (type: boolean) => void;
    setInfoAsset: (data: InfoAsset[]) => void;
    logout: () => void
}

export interface ListItem {
    listExpense: InfoTransaction[],
    setListExpense: (data: InfoTransaction[]) => void;
    listInvest: DataInvestItem[],
    setListInvest: (data: DataInvestItem[]) => void;
}

export interface ChartStore {
    pieDataIn: ChartDataItemStore[]; pieDataOut: ChartDataItemStore[];
    dataFocusIn: ChartDataItemStore | null; dataFocusOut: ChartDataItemStore | null;
    chartDateRange: ChartDateRange;
    setPieDataIn: (data: ChartDataItemStore[]) => void;
    setPieDataOut: (data: ChartDataItemStore[]) => void;
    setDataFocusIn: (data: ChartDataItemStore | null) => void;
    setDataFocusOut: (data: ChartDataItemStore | null) => void;
    setChartDateRange: (range: ChartDateRange) => void;
    updateChartData: (type: type_asset, valueChange: number, data: { date_buy: number; type: number }) => void;
}

export type ChartDataItemStore = { value: number; color: string; title: string; type: string; focused?: boolean; };

export type ChartDateRange = { startDate: number; endDate: number; label: string; };