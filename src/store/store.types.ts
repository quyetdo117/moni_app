import { InfoUser } from "@/types/info.types";
import { Transaction, type_asset } from "@/types/schema.types";

export interface InfoUserStore {
    infoUser: InfoUser | null;
    uid: string;
    infoAsset: Partial<Record<type_asset, string>>;
    isLogin: boolean;
    setUidUser: (id: string) => void;
    setInfoUser: (data: InfoUser | null) => void;
    setStateLogin: (type: boolean) => void;
    logout: () => void
}

export interface ListItem {
    listExpense: Transaction[],
    setListExpense: (data: Transaction[]) => void
}