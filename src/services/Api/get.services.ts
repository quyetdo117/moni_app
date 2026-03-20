import { db } from "@/configs/firebaseConfig";
import { key_assets, tables_name, TYPE_TRANSACTION } from "@/constants/constants";
import { InfoAsset } from "@/types/info.types";
import { Asset, Category, Transaction } from "@/types/schema.types";
import { collection, doc, getAggregateFromServer, getDoc, getDocs, limit, orderBy, query, QueryConstraint, sum, where } from "firebase/firestore";
import { getDocumentRef, getTableRef } from "./base.services";

/// Lay danh sach Categories

export const getCategories = async ({ asset_id, type }: { asset_id?: string, type: string }, uid?: string) => {
    try {
        let assetData: Asset | null = null;

        // Nếu không có asset_id thì mới lấy từ getAssetForType
        if (!asset_id) {
            if (!uid) throw new Error("Thieu uid");
            assetData = await getAssetForType(type, uid);
            if (!assetData) throw new Error("Khong tim thay Asset!");
        }

        const categoriesRef = collection(db, tables_name.CATEGORY);
        const targetAssetId = asset_id || assetData?.id;
        if (!targetAssetId) throw new Error("Khong tim thay Asset!");

        const constraints: QueryConstraint[] = [where('asset_id', '==', targetAssetId)];
        if (type == key_assets.expense) {
            constraints.push(orderBy('type_display', 'asc'))
        }
        const q = query(categoriesRef,
            ...constraints
        );
        const querySnap = await getDocs(q);
        const data = querySnap.docs.map((item, index) => {
            const dataCategory = item.data() as Category;
            const total_market = Number(dataCategory.market_value || 0) * Number(dataCategory.quantity || 0);
            return {
                total_market,
                ...dataCategory
            }
        })
        return { success: true, data, msg: 'done' };
    } catch (error: any) {
        console.log('logg error', error)
        return { success: false, msg: error.message || 'Co loi xay ra!' };
    }
}


// Lay asset theo type
export const getAssetForType = async (type: string, uid: string) => {
    const assetRef = getTableRef(tables_name.ASSET);
    const q = query(assetRef,
        where('type', '==', type),
        where('user_id', '==', uid),
        limit(1)
    )

    const assetSnap = await getDocs(q);
    if (assetSnap.empty) return null;

    const dataAsset = assetSnap.docs[0].data() as Asset;

    return dataAsset

}


// Danh sach giao dich

export const getListTransaction = async (uid: string, asset_id?: string, category_id?: string, category_type?: number) => {
    try {
        const transactonsRef = getTableRef(tables_name.TRANSACTION);
        const objectCategories: Record<string, number> = {};
        const constraints = [];


        // Nếu có asset_id thì sử dụng trực tiếp
        let dataAsset;
        if (asset_id) {
            constraints.push(where('asset_id', '==', asset_id));
            const assetRef = getDocumentRef(tables_name.ASSET, asset_id);
            const snapAsset = await getDoc(assetRef);
            if (!snapAsset.exists()) throw Error('Khong tim thay Asset');
            dataAsset = snapAsset.data() as Asset;
        } else {
            dataAsset = await getAssetForType(key_assets.expense, uid);
        }
        if (dataAsset?.type == key_assets.expense) {
            const jsonCategories = await getCategories({ asset_id: asset_id, type: key_assets.expense }, uid);
            if (jsonCategories.success) {
                const categories = jsonCategories.data || [];
                categories.forEach(item => {
                    objectCategories[item.id] = Number(item.type_display || 0);
                });
            } else {
                throw new Error("Khong lay duoc Categories!");
            }
        }
        if (category_id) {
            constraints.push(where('category_id', '==', category_id))
        }
        if (typeof category_type === 'number') {
            constraints.push(where('type', '==', category_type))
        }
        const q = query(transactonsRef,
            ...constraints,
            where('user_id', '==', uid),
            orderBy('date_buy', 'desc'));
        const querySnap = await getDocs(q);
        const data = querySnap.docs.map((doc) => {
            const rawData = doc.data();
            return {
                ...rawData,
                // Gán thông tin phụ trợ, mặc định là 0 nếu không tìm thấy
                type_display: Number(objectCategories[rawData.category_id] || 0)
            };
        });
        return { success: true, data, msg: 'done' };
    } catch (error: any) {
        return { success: false, msg: error.message || 'Co loi xay ra!' };
    }
}

// Lay thong tin tong quat

export const getInfoUser = async (id: string) => {
    try {
        const userRef = doc(db, tables_name.USER, id);
        const assetsRef = collection(db, tables_name.ASSET);
        const query_asset = query(assetsRef,
            where('user_id', '==', id),
            orderBy('stt', 'asc')
        );

        // Lay asset invest
        const assetInvest = await getAssetForType(key_assets.invest, id);
        if (!assetInvest) throw new Error("Khong tim thay Asset Invest!");

        // Su dung getAggregateFromServer de tinh tong total_market tu server
        const categoriesRef = collection(db, tables_name.CATEGORY);
        const q = query(categoriesRef, where('asset_id', '==', assetInvest.id));

        const totalAgg = await getAggregateFromServer(q, {
            total_market: sum('total_market')
        });

        // Lay total_market tu ket qua aggregate
        const total_market = totalAgg.data().total_market || 0;

        const userSnap = await getDoc(userRef);
        const assetSnap = await getDocs(query_asset);

        if (!userSnap.exists()) {
            throw new Error('Khong tim thay User!')
        } else if (assetSnap.empty) {
            throw new Error('Khong tim thay Asset!')
        }

        const dataUser = userSnap.data();
        const dataAssets = assetSnap.docs.map((item) => {
            const itemData = item.data() as Asset;
            const dataAsset = {
                ...itemData
            } as InfoAsset
            if (itemData.type === key_assets.invest) {
                dataAsset.total_market = total_market
            }
            return {
                ...dataAsset
            }
        });

        const infoUser = {
            ...dataUser,
            uid: dataUser.id,
            assets: dataAssets
        };

        return { success: true, data: infoUser, msg: 'Done' };
    } catch (error: any) {
        console.log('logg error', error.message, id);

        return { success: false, msg: error.message || 'Co loi xay ra!' };
    }
}

// Lay thong tin tong quart chi tieu

export const getInfoExpense = async (id: string) => {
    try {
        const transactionsRef = collection(db, tables_name.TRANSACTION);
        const assetRef = getDocumentRef(tables_name.ASSET, id)
        const q = query(transactionsRef,
            where('asset_id', '==', id)
        );

        const [querySnap, categories, assetSnap] = await Promise.all([
            getDocs(q),
            getCategories({ asset_id: id, type: key_assets.expense }),
            getDoc(assetRef)
        ]);
        if (!categories.success) {
            throw new Error('Lay danh muc that bai!')
        }
        if (!assetSnap.exists()) {
            throw new Error('Asset khong ton tai')
        }

        const assetData = assetSnap.data() as Asset;

        const total_money = assetData ? assetData.total_value : 0;

        let total_income = 0;
        let total_expense = 0;
        querySnap.docs.forEach((item) => {
            const dataItem = item.data() as Transaction;
            const total_value = Number(dataItem.total_value);

            if (dataItem.type == TYPE_TRANSACTION.IN) {
                total_income += total_value;
            } else if (dataItem.type == TYPE_TRANSACTION.OUT) {
                total_expense += total_value;
            }
        })
        const dataCatagories = categories.data;
        return {
            success: true,
            data: {
                total_income, total_expense, total_money,
                categories: dataCatagories
            },
            msg: 'Done'
        }
    } catch (error: any) {
        return { success: false, msg: error.message || 'Co loi xay ra' }
    }
}

// Lay thong tin tong quat cho bieu do hinh tron

export interface PieChartData {
    in: {
        expense: number;
        invest: number;
        save: number;
    };
    out: {
        expense: number;
        invest: number;
        save: number;
    };
}

export const getPieChartData = async (uid: string, startTime: number, endTime: number) => {
    try {
        const transactionsRef = collection(db, tables_name.TRANSACTION);

        // Lay tat ca asset cua user
        const assetsRef = getTableRef(tables_name.ASSET);
        const qAssets = query(assetsRef, where('user_id', '==', uid));
        const assetSnap = await getDocs(qAssets);

        const assets = assetSnap.docs.map(doc => doc.data() as Asset);

        // Tao map de luu ket qua theo asset type
        const result: PieChartData = {
            in: {
                expense: 0,
                invest: 0,
                save: 0
            },
            out: {
                expense: 0,
                invest: 0,
                save: 0
            }
        };

        // Lap qua tung asset de tinh tong
        for (const asset of assets) {
            // Query cho giao dich vao (IN)
            const qIncome = query(
                transactionsRef,
                where('asset_id', '==', asset.id),
                where('type', '==', TYPE_TRANSACTION.IN),
                where('date_buy', '>=', startTime),
                where('date_buy', '<=', endTime)
            );

            // Query cho giao dich ra (OUT)
            const qExpense = query(
                transactionsRef,
                where('asset_id', '==', asset.id),
                where('type', '==', TYPE_TRANSACTION.OUT),
                where('date_buy', '>=', startTime),
                where('date_buy', '<=', endTime)
            );

            const [incomeAgg, expenseAgg] = await Promise.all([
                getAggregateFromServer(qIncome, { total_value: sum('total_value') }),
                getAggregateFromServer(qExpense, { total_value: sum('total_value') })
            ]);

            // Map asset type sang key cua result
            let assetKey: 'expense' | 'invest' | 'save' | null = null;
            if (asset.type === key_assets.expense) {
                assetKey = 'expense';
            } else if (asset.type === key_assets.invest) {
                assetKey = 'invest';
            } else if (asset.type === key_assets.save) {
                assetKey = 'save';
            }

            if (assetKey) {
                // Với expense: in -> in, out -> out
                // Với invest và save: in -> out, out -> in (đảo ngược)
                if (assetKey === 'expense') {
                    result.in[assetKey] = incomeAgg.data().total_value || 0;
                    result.out[assetKey] = expenseAgg.data().total_value || 0;
                } else {
                    // invest hoặc save: đảo ngược
                    result.out[assetKey] = incomeAgg.data().total_value || 0;
                    result.in[assetKey] = expenseAgg.data().total_value || 0;
                }
            }
        }

        return { success: true, data: result, msg: 'Done' };
    } catch (error: any) {
        console.log('logg error', error.message);
        return { success: false, msg: error.message || 'Co loi xay ra' };
    }
}