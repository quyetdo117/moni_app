export type type_asset = 'expense' | 'save' | 'invest';

export interface User {
    id: string,
    uid: string;
    name: string;
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
    total_market?: number;
    market_value?: number;
    target_value?: number;
    quantity?: number;
    type: number;
    type_display: number;
    user_id: string;
    date_update: number;
}

export interface Transaction {
    id: string;
    asset_id: string;
    category_id: string;
    type: number;
    name: string;
    quantity?: number;
    rate_value?: number;
    total_value: number;
    date_buy: number;
    note: string;
    createdAt: any;
    user_id: string;
}