import { Category } from "@/types/schema.types";

export interface DataInvestItem extends Category {
    createdAt?: number;
    total_market: number;
}

export interface DataTransaction {
    id_transaction: number;
    type: number;
    name: string,
    quantity: number,
    rate_value: number,
    market_value: number,
    extra_value: number,
    total_value: number,
    date_buy: string
}

export interface DataFormInvest {
    type: number;
    name: string,
    quantity: string,
    rate_value: string,
    market_value: string,
    total_value: string,
    date_buy: number,
    note?: string,
    category_id?: string,
    asset_id: string,
    user_id: string
}
