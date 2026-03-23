import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { DataInvestItem } from "@/screens/InvestmentScreen/types/Investment.types";
import { SaveDetailData } from "@/screens/SaveScreen/SaveDetailScreen/index";

export type RootStackParamList = {
    MainTab: undefined;
    ExpenseScreen: undefined;
    Login: undefined;
    InvestmentScreen: undefined;
    InvestmentDetailScreen: {data: DataInvestItem};
    SaveScreen: undefined;
    SaveDetailScreen: {data: SaveDetailData};
};

export type MainTabParamList = {
    Home: undefined;
    TransactionList: undefined;
    Report: undefined;
    Account: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
    CompositeScreenProps<
        BottomTabScreenProps<MainTabParamList, T>,
        NativeStackScreenProps<RootStackParamList> 
    >;
