import { db } from "@/configs/firebaseConfig";
import { key_assets, tables_name, TYPE_TRANSACTION } from "@/constants/constants";
import { InfoUser } from "@/types/info.types";
import { Asset, Category, Transaction, User } from "@/types/schema.types";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { getDocumentRef, getTableRef } from "./base.services";

/// Lay danh sach Categories

export const getCategories = async (type: string, uid: string) => {
    try {
        const categoriesRef = collection(db, tables_name.CATEGORY);
        const assetData = await getAssetForType(type, uid);
        const q = query(categoriesRef,
            where('asset_id', '==', assetData.id),
            orderBy('type_expense', 'asc')
        );
        const querySnap = await getDocs(q);
        if (querySnap.empty) {
            throw new Error('Khong tim thay du lieu!')
        }
        const data = querySnap.docs.map((item, index) => ({
            id: item.id,
            ...item.data()
        } as Category))
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
        where('user_id', '==', uid)
    )

    const assetSnap = await getDocs(q);
    if (assetSnap.empty) throw new Error("Khong tim thay Asset!");

    const dataAsset = assetSnap.docs[0].data() as Asset;

    return dataAsset

}


// Danh sach giao dich

export const getListTransaction = async (uid: string, type?: string, category_id?: string, category_type?: number) => {
    try {
        const categoriesRef = getTableRef(tables_name.TRANSACTION);
        const objectCategories: Record<string, number> = {};
        const constraints = [];
        if (type) {
            const assetData = await getAssetForType(type, uid);
            constraints.push(where('asset_id', '==', assetData.id))
        }
        if (category_id) {
            constraints.push(where('category_id', '==', category_id));
        }
        if (type == key_assets.expense || !type) {
            if (category_id && type == key_assets.expense) {
                const categoryRef = getDocumentRef(tables_name.CATEGORY, category_id);
                const categorySnap = await getDoc(categoryRef);
                if (categorySnap.exists()) {
                    const dataCategory = categorySnap.data() as Category;
                    objectCategories[category_id] = dataCategory.type_expense!;
                }
            } else {
                const jsonCategories = await getCategories(key_assets.expense, uid)
                if (jsonCategories.success) {
                    const categories = jsonCategories.data || [];
                    categories.forEach(item => {
                        objectCategories[item.id] = item.type_expense!
                    })
                } else {
                    throw new Error("Khong lay duoc Categories!");
                }
            }
        }
        if (typeof category_type === 'number') {
            constraints.push(where('type', '==', category_type))
        }
        const q = query(categoriesRef,
            ...constraints,
            where('user_id', '==', uid),
            orderBy('date_buy', 'desc'));
        const querySnap = await getDocs(q);
        const data = querySnap.docs.map((item) => ({
            ...item.data(),
            id: item.id,
            type_expense: objectCategories[item.data().category_id]
        }))
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
        const userSnap = await getDoc(userRef);
        const assetSnap = await getDocs(query_asset);

        if (!userSnap.exists()) {
            throw new Error('Khong tim thay User!')
        } else if (assetSnap.empty) {
            throw new Error('Khong tim thay Asset!')
        }

        const dataUser = userSnap.data();
        const dataAssets = assetSnap.docs.map((item) => {
            return {
                ...item.data(),
                id: item.id
            } as Asset
        });

        const infoUser = {
            ...dataUser,
            uid: dataUser.id,
            assets: dataAssets
        } as InfoUser;

        return { success: true, data: infoUser, msg: 'Done' };
    } catch (error: any) {
        console.log('logg error', error.message, id);

        return { success: false, msg: error.message || 'Co loi xay ra!' };
    }
}

// Lay thong tin tong quart chi tieu

export const getInfoExpense = async (uid: string) => {
    try {
        const transactionsRef = collection(db, tables_name.TRANSACTION);
        const assetData = await getAssetForType(key_assets.expense, uid);
        const userRef = doc(db, tables_name.USER, uid)
        const q = query(transactionsRef,
            where('asset_id', '==', assetData.id)
        );

        const [userSnap, querySnap, categories] = await Promise.all([
            getDoc(userRef),
            getDocs(q),
            getCategories(key_assets.expense, uid)
        ]);
        console.log('logg uid', uid)
        if (!categories.success) {
            throw new Error('Lay danh muc that bai!')
        } else if (!userSnap.exists()) {
            throw new Error('User khong ton tai')
        }

        const dataUser = userSnap.data() as User;

        const total_money = dataUser.total_expense;

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