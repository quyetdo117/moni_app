
export interface DataFormExpense  {
    type: number;
    name: string;
    total_value: number;
    date_buy: number;
    note?: string;
    category_id: string;
    asset_id: string;
    user_id: string
}