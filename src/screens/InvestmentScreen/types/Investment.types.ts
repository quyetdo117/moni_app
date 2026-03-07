export interface DataInvestItem {
    id: number | string;
    title: string;
    value_origin: number;
    value_current: number;
    date_buy: string;
    note: string,
    transactions: DataTransaction[]
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
    quantity: number,
    rate_value: number,
    market_value: number,
    extra_value?: number,
    total_value: number,
    date_buy: number,
    note?: string,
    category_id?: string,
    type_asset: string,
    user_id: string
}
