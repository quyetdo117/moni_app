import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { DataInvestItem } from "@/screens/InvestmentScreen/types/Investment.types";

export type RootStackParamList = {
    MainTab: undefined;
    ExpenseScreen: undefined;
    Login: undefined;
    InvestmentScreen: undefined;
    InvestmentDetailScreen: {data: DataInvestItem};
};

export type MainTabParamList = {
    Home: undefined;
    Login: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
    CompositeScreenProps<
        BottomTabScreenProps<MainTabParamList, T>,
        NativeStackScreenProps<RootStackParamList> 
    >;