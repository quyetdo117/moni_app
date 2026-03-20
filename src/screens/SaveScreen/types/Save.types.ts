export interface DataFormSave {
  type: number;
  name: string;
  quantity: string;
  rate_value: string;
  market_value: string;
  total_value: string;
  date_buy: number;
  note: string;
  asset_id: string;
  user_id: string;
  target: string;
  category_id?: string;
}
