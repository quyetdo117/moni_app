export type type_asset = 'expense' | 'income' | 'invest';

export interface User {
    id: string,
    uid: string;
    name: string;
    total_expense: number;
    total_invest: number;
    total_save: number;
}

export interface Asset {
    id: string;
    name: string;
    total_value: number;
    type: type_asset;
    user_id: string
}

export interface Category {
    id: string;
    asset_id: string;
    name: string;
    total_value: number;
    total_current?: number;
    quantity?: number;
    type: number;
    type_expense?: number;
    user_id: string;
}

export interface Transaction {
    id: string;
    asset_id: string;
    category_id: string;
    type: number;
    name: string;
    quantity?: number;
    rate_value?: number;
    market_value?: number;
    extra_value?: number;
    total_value: number;
    date_buy: number;
    note: string;
    createdAt: any;
    user_id: string;
}