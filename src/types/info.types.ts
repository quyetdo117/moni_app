import { Asset, Transaction, User } from "./schema.types";

export interface InfoUser extends User {
  assets: Asset[]
}

export interface InfoTransaction extends Transaction {
  type_expense?: number
}

export interface AuthResponse {
  success: boolean;
  msg: string;
  data?: {
    uid: string;
    email?: string;
  };
}