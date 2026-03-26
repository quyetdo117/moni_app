import { db } from "@/configs/firebaseConfig";
import { key_assets, tables_name, TYPE_TRANSACTION } from "@/constants/constants";
import { Asset, Category } from "@/types/schema.types";
import { collection, doc, getAggregateFromServer, getDoc, getDocs, limit, orderBy, query, QueryConstraint, sum, where } from "firebase/firestore";
import { getTableRef } from "./base.services";

/// Lay danh sach Categories

export const getCategories = async ({ asset_id, type }: { asset_id?: string, type: string }, uid?: string) => {
    try {
        if (!asset_id) {
            throw new Error("Khong tim thay Asset id!");
        }

        const categoriesRef = collection(db, tables_name.CATEGORY);

        const constraints: QueryConstraint[] = [where('asset_id', '==', asset_id)];
        if (type == key_assets.expense) {
            constraints.push(orderBy('type_display', 'asc'))
        }
        const q = query(categoriesRef,
            ...constraints
        );
        const querySnap = await getDocs(q);
        const data = querySnap.docs.map((item, index) => {
            const dataCategory = item.data() as Category;
            return {
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
        const constraints = [];

        // Nếu có asset_id thì sử dụng trực tiếp
        if (asset_id) {
            constraints.push(where('asset_id', '==', asset_id));
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
                ...rawData
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

        // Lấy tất cả assets trước
        const userSnap = await getDoc(userRef);
        const assetSnap = await getDocs(query_asset);

        if (!userSnap.exists()) {
            throw new Error('Khong tim thay User!')
        } else if (assetSnap.empty) {
            throw new Error('Khong tim thay Asset!')
        }

        const dataUser = userSnap.data();

        // Lấy danh sách asset
        const assets = assetSnap.docs.map((item) => item.data() as Asset);

        const dataAssets = await Promise.all(assets.map(async item => {
            if (item.type === key_assets.expense) {
                return {
                    ...item,
                    total_value: dataUser.balance || 0
                };
            } else {
                const categoriesRef = collection(db, tables_name.CATEGORY);
                const q = query(categoriesRef, where('asset_id', '==', item.id));

                // Gọi Aggregate
                const totalAgg = await getAggregateFromServer(q, {
                    total_value: sum('total_value'),
                    total_capital: sum('total_capital')
                });

                return {
                    ...item,
                    total_value: totalAgg.data().total_value || 0,
                    total_capital: totalAgg.data().total_capital || 0
                };
            }
        }));

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

export const getInfoExpense = async (id?: string) => {
    try {
        if (!id) throw new Error('Khong lay duoc asset id')
        const categoryRef = collection(db, tables_name.CATEGORY);
        const q = query(categoryRef,
            where('asset_id', '==', id),
            orderBy('type_display', 'asc')
        );

        const categoriesSnap = await getDocs(q);

        if (categoriesSnap.empty) {
            throw new Error('Asset khong ton tai')
        }
        let total_income = 0;
        let total_expense = 0;

        const dataCategories = categoriesSnap.docs.map((item) => {
            const dataItem = item.data() as Category;
            const total_value = Number(dataItem.total_value);
            if (dataItem.type == TYPE_TRANSACTION.IN) {
                total_income += total_value;
            } else if (dataItem.type == TYPE_TRANSACTION.OUT) {
                total_expense += total_value;
            }
            return {
                ...dataItem
            }
        });
        return {
            success: true,
            data: {
                total_income, total_expense,
                categories: dataCategories
            },
            msg: 'Done'
        }
    } catch (error: any) {
        console.log('logg error', error)
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