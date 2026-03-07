import { db } from "@/configs/firebaseConfig";
import { tables_name, TYPE_TRANSACTION } from "@/constants/constants";
import { DataFormExpense } from "@/screens/ExpenseScreen/types/Expense.types";
import { DataFormInvest } from "@/screens/InvestmentScreen/types/Investment.types";
import { Asset, Category, Transaction, type_asset, User } from "@/types/schema.types";
import { collection, getDoc, getDocs, increment, query, runTransaction, serverTimestamp, where } from "firebase/firestore";
import moment from "moment";
import { getDocumentRef, getNewDocRef } from "./base.services";


/// - Tao Giao dich dau tu
export const createTransactionInvest = async (body: DataFormInvest) => {
    try {
        const { user_id, type_asset } = body;
        const assetQuery = query(collection(db, tables_name.ASSET),
            where("type", "==", type_asset),
            where("user_id", "==", user_id),
        );
        const assetDocs = await getDocs(assetQuery);
        await runTransaction(db, async (ts) => {
            const userRef = getDocumentRef(tables_name.USER, body.user_id);
            const newTransactionRef = getNewDocRef(tables_name.TRANSACTION);
            const categoriesRef = getNewDocRef(tables_name.CATEGORY);

            if (assetDocs.empty) throw new Error("Không tìm thấy tài sản tương ứng.");

            const assetRef = assetDocs.docs[0].ref;


            const [userSnap, assetsSnap] = await Promise.all([
                ts.get(userRef),
                ts.get(assetRef)
            ])

            let categorySnap;
            let categoryRef;

            if (body.category_id) {
                categoryRef = getDocumentRef(tables_name.CATEGORY, body.category_id);
                categorySnap = await ts.get(categoryRef);
            }

            if (userSnap.exists() && assetsSnap.exists()) {
                const userData = userSnap.data() as User;

                const isAdd = body.type === TYPE_TRANSACTION.IN;
                const total_invest = Number(userData.total_invest);
                const total_value = Number(body.total_value);
                const newInvestBalance = isAdd
                    ? total_invest + total_value
                    : total_invest - total_value;



                /// --- User
                ts.update(userRef, { total_invest: newInvestBalance });

                /// --- Asset
                ts.update(assetRef, { total_value: newInvestBalance })

                /// --- Category
                if (categoryRef && categorySnap?.exists()) {
                    /// Update categry
                    const categoryData = categorySnap.data() as Category;
                    const quantity = (categoryData.quantity || 0) + Number(body.quantity) * (isAdd ? 1 : -1);
                    if (quantity < 0) {
                        throw new Error("Số lượng không đủ!");
                    }
                    const total_value = (Number(categoryData.total_value) || 0) + Number(body.total_value);
                    const total_current = quantity * Number(body.market_value);
                    const dataUpdate = {
                        quantity, total_current, total_value
                    }
                    ts.update(categoryRef, dataUpdate)
                } else {
                    /// Tao category
                    const categoryData: any = {};
                    categoryData.name = body.name;
                    categoryData.type_asset = body.type_asset;
                    categoryData.quantity = body.quantity;
                    categoryData.total_value = body.total_value;
                    categoryData.total_current = body.market_value * body.quantity;
                    categoryData.type = body.type;
                    ts.set(categoriesRef, categoryData);
                }

                /// --- Transaction

                ts.set(newTransactionRef, {
                    ...body,
                    createdAt: serverTimestamp(),
                })

            } else {
                throw new Error("Dữ liệu không tồn tại!");
            }
        })
        // TRẢ VỀ TRẠNG THÁI THÀNH CÔNG
        return { success: true, message: "Giao dịch hoàn tất" };
    } catch (error: any) {
        return { success: false, message: error.message || "Có lỗi xảy ra" };
    }
}

// - Tao Giao dich Chi tieu
export const createTransactionExpense = async (body: DataFormExpense) => {
    try {
        const { user_id, asset_id, category_id } = body;
        const assetRef = getDocumentRef(tables_name.ASSET, asset_id);
        const userRef = getDocumentRef(tables_name.USER, user_id);
        const categoryRef = getDocumentRef(tables_name.CATEGORY, category_id);
        await runTransaction(db, async (ts) => {
            const newTransactionRef = getNewDocRef(tables_name.TRANSACTION);

            const [userSnap, assetsSnap, categorySnap] = await Promise.all([
                ts.get(userRef),
                ts.get(assetRef),
                ts.get(categoryRef)
            ])



            if (userSnap.exists() && assetsSnap.exists() && categorySnap?.exists()) {
                const isAdd = body.type === TYPE_TRANSACTION.IN;
                const total_value = Number(body.total_value);
                const newValue = isAdd ? total_value
                    : -total_value;

                /// --- User
                ts.update(userRef, { total_expense: increment(newValue) });

                /// --- Asset
                ts.update(assetRef, { total_value: increment(newValue) })

                /// --- Category
                ts.update(categoryRef, { total_value: increment(total_value) })

                /// --- Transaction

                ts.set(newTransactionRef, {
                    ...body,
                    id: newTransactionRef.id,
                    createdAt: serverTimestamp(),
                })

            } else {
                throw new Error("Dữ liệu không tồn tại!");
            }
        })
        // TRẢ VỀ TRẠNG THÁI THÀNH CÔNG
        return { success: true, message: "Giao dịch hoàn tất" };
    } catch (error: any) {
        console.log('logg error', error)
        return { success: false, message: error.message || "Có lỗi xảy ra" };
    }
}

// - Xoa giao dich

export const deleteTransaction = async (id: string) => {
    try {
        const transactionRef = getDocumentRef(tables_name.TRANSACTION, id);
        const transactionSnap = await getDoc(transactionRef);
        if (transactionSnap.exists()) {
            const dataTransaction = { ...transactionSnap.data() } as Transaction;
            const { type, user_id, asset_id, total_value } = dataTransaction;
            const newTotal_value = type == TYPE_TRANSACTION.IN
                ? -total_value
                : total_value;
            const userRef = getDocumentRef(tables_name.USER, user_id);

            const assetRef = getDocumentRef(tables_name.ASSET, asset_id);

            const category_id = dataTransaction.category_id;
            const categoryRef = getDocumentRef(tables_name.CATEGORY, category_id);
            await runTransaction(db, async (ts) => {
                const [userSnap, assetSnap, categorySnap] = await Promise.all([
                    ts.get(userRef),
                    ts.get(assetRef),
                    ts.get(categoryRef),
                ])
                if (userSnap.exists() && assetSnap.exists() && categorySnap.exists()) {
                    const dataAsset = assetSnap.data() as Asset;
                    const type_asset = dataAsset.type as type_asset;


                    // update asset
                    ts.update(assetRef, {
                        total_value: increment(newTotal_value)
                    })

                    // update user
                    const userFieldName = `total_${type_asset}`;
                    ts.update(userRef, {
                        [userFieldName]: increment(newTotal_value)
                    })

                    // update category
                    ts.update(categoryRef, {
                        total_value: increment(-total_value)
                    })

                    // delete transaction
                    ts.delete(transactionRef)
                } else {
                    throw new Error("Khong tim thay du lieu!")
                }
                // TRẢ VỀ TRẠNG THÁI THÀNH CÔNG
            })
        } else {
            throw new Error("Khong tim thay giao dich!")
        }
        return { success: true, message: "Xoa thanh cong" };
    } catch (error: any) {
        return { success: false, message: error.message || "Xoa that bai!" };
    }
}

// update transaction

export const updateTransaction = async (data: any) => {
    try {
        const data_ = data as Transaction;
        const { id, category_id, total_value, type } = data_;
        if (id) {
            const transactionRef = getDocumentRef(tables_name.TRANSACTION, id);
            const transactionSnap = await getDoc(transactionRef);
            if (transactionSnap.exists()) {
                const dataTransaction = transactionSnap.data() as Transaction;
                const { user_id, asset_id } = dataTransaction;
                const category_id_current = dataTransaction.category_id;
                const total_value_current = dataTransaction.total_value;
                const userRef = getDocumentRef(tables_name.USER, user_id);
                const assetRef = getDocumentRef(tables_name.ASSET, asset_id);
                const categoryCurrentRef = getDocumentRef(tables_name.CATEGORY, category_id_current);
                const categoryRef = getDocumentRef(tables_name.CATEGORY, category_id);
                await runTransaction(db, async (ts) => {
                    const value_diffirent = total_value - total_value_current;
                    const money_diffirent_ = type == TYPE_TRANSACTION.IN
                        ? value_diffirent
                        : -value_diffirent;
                    const [userSnap, assetSnap, categorySnap, categoryCurrentSnap] = await Promise.all([
                        ts.get(userRef),
                        ts.get(assetRef),
                        ts.get(categoryRef),
                        ts.get(categoryCurrentRef)
                    ]);
                    if (userSnap.exists() && assetSnap.exists() && categorySnap.exists() && categoryCurrentSnap.exists()) {
                        const type_asset = (assetSnap.data() as Asset).type;

                        // User
                        const filedName = `total_${type_asset}`;
                        ts.update(userRef, {
                            [filedName]: increment(money_diffirent_)
                        })

                        // Asset
                        ts.update(assetRef, {
                            total_value: increment(money_diffirent_)
                        })

                        // Category
                        if (category_id == category_id_current) {
                            ts.update(categoryRef, {
                                total_value: increment(value_diffirent)
                            })
                        } else {
                            ts.update(categoryRef, {
                                total_value: increment(total_value)
                            })
                            ts.update(categoryCurrentRef, {
                                total_value: increment(-total_value_current)
                            })
                        }

                        // transaction
                        ts.update(transactionRef, {
                            ...data_,
                            updateAt: moment(new Date).unix()
                        })

                    } else {
                        throw new Error("Dữ liệu không hợp lệ hoặc không tồn tại!");
                    }

                })
            } else {
                throw new Error("Không tìm thấy giao dịch!");
            }
        } else {
                throw new Error("Thiếu id giao dịch!");
        }
        return { success: true, message: "Cập nhật thành công" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}