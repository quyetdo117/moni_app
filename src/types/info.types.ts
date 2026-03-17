import { Asset, Transaction, User } from "./schema.types";

export interface InfoUser extends User {
  assets: InfoAsset[]
}

export interface InfoTransaction extends Transaction {
  type_expense?: number
}

export interface InfoAsset extends Asset {
  total_market: number;
  stt?: number;
}

export interface AuthResponse {
  success: boolean;
  msg: string;
  data?: {
    uid: string;
    email?: string;
  };
}