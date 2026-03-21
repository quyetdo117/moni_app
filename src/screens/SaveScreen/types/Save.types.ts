export interface DataFormSave {
  type: number;
  name: string;
  quantity: string;
  total_value: string;
  date_buy: number;
  note: string;
  asset_id: string;
  user_id: string;
  target: string;
  category_id?: string;
}
