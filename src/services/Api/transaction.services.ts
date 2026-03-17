import { db } from "@/configs/firebaseConfig";
import { key_assets, tables_name, TYPE_TRANSACTION } from "@/constants/constants";
import { DataFormExpense } from "@/screens/ExpenseScreen/types/Expense.types";
import { DataFormInvest } from "@/screens/InvestmentScreen/types/Investment.types";
import { Asset, Category, Transaction } from "@/types/schema.types";
import { getDoc, increment, runTransaction, serverTimestamp } from "firebase/firestore";
import moment from "moment";
import { getDocumentRef, getNewDocRef } from "./base.services";
import { getAssetForType } from "./get.services";


/// - Tao Giao dich dau tu
export const createTransactionInvest = async (body: DataFormInvest) => {
    try {
        const { user_id, asset_id } = body;
        if (!user_id) throw new Error("Thiếu user_id!");
        if (!asset_id) throw new Error("Thiếu asset_id! Vui lòng kiểm tra thông tin tài sản.");
        let dataResult: any = null;
        await runTransaction(db, async (ts) => {
            const userRef = getDocumentRef(tables_name.USER, user_id);
            const assetRef = getDocumentRef(tables_name.ASSET, asset_id);
            const newTransactionRef = getNewDocRef(tables_name.TRANSACTION);
            const categoriesRef = getNewDocRef(tables_name.CATEGORY);
            const dataAssetExpense = await getAssetForType(key_assets.expense, user_id);
            if (!dataAssetExpense) throw new Error("Khong tim thay Asset!");
            const assetExpenseRef = getDocumentRef(tables_name.ASSET, dataAssetExpense.id);


            const [userSnap, assetsSnap, assetExpenseSnap] = await Promise.all([
                ts.get(userRef),
                ts.get(assetRef),
                ts.get(assetExpenseRef)
            ])

            let categorySnap;
            let categoryRef;

            if (body.category_id) {
                categoryRef = getDocumentRef(tables_name.CATEGORY, body.category_id);
                categorySnap = await ts.get(categoryRef);
            }

            if (userSnap.exists() && assetsSnap.exists() && assetExpenseSnap.exists()) {
                const isAdd = body.type === TYPE_TRANSACTION.IN;
                const total_value = Number(body.total_value);
                const newInvestBalance = isAdd
                    ? total_value
                    : - total_value;

                // -- Asset expense
                ts.update(assetExpenseRef, {
                    total_value: increment(-newInvestBalance)
                })

                const currentTimestamp = moment(new Date()).unix();

                /// --- Category)
                if (categoryRef && categorySnap?.exists()) {
                    /// Update category
                    const categoryData = categorySnap.data() as Category;
                    // Su dung Math.round de tranh loi floating point (0.3 - 0.1 = 0.19999999999999998)
                    const quantityRaw = (categoryData.quantity || 0) + Number(body.quantity) * (isAdd ? 1 : -1);
                    const quantity = Math.round(quantityRaw * 10000000000) / 10000000000;

                    if (quantity < 0) {
                        throw new Error("Số lượng không đủ!");
                    }

                    const dataUpdate: any = {
                        quantity,
                        total_value: increment(Number(body.total_value)),
                    };


                    const existingDateUpdate = categoryData.date_update || 0;
                    const bodyDateBuy = Number(body.date_buy) || currentTimestamp;

                    if (bodyDateBuy > existingDateUpdate) {
                        dataUpdate.market_value = Number(body.market_value);
                        dataUpdate.date_update = bodyDateBuy;
                    }

                    // Tinh total_market = market_value * quantity (sau khi market_value duoc cap nhat)
                    const marketValueForTotal = dataUpdate.market_value !== undefined 
                        ? dataUpdate.market_value 
                        : Number(categoryData.market_value || 0);
                    dataUpdate.total_market = marketValueForTotal * quantity;

                    dataResult = {
                        ...categoryData,
                        ...dataUpdate
                    }
                    ts.update(categoryRef, dataUpdate)
                } else {
                    /// Tao category
                    const categoryData: any = {};
                    categoryData.name = body.name;
                    categoryData.id = categoriesRef.id;
                    categoryData.asset_id = body.asset_id;
                    categoryData.quantity = Number(body.quantity || 0);
                    categoryData.total_value = Number(body.total_value || 0);
                    categoryData.market_value = Number(body.market_value || 0);
                    categoryData.total_market = Number(body.market_value || 0) * Number(body.quantity || 0);
                    categoryData.type = Number(body.type || 0);
                    categoryData.createdAt = currentTimestamp;
                    categoryData.date_update = Number(body.date_buy || currentTimestamp);
                    dataResult = {
                        ...categoryData
                    }
                    ts.set(categoriesRef, dataResult);
                }

                /// --- Asset
                ts.update(assetRef, {
                    total_value: increment(newInvestBalance)
                })

                /// --- Transaction
                const { market_value, ...bodyWithoutMarketValue } = body;
                const newTransactionData = {
                    ...bodyWithoutMarketValue,
                    quantity: Number(body.quantity || 0),
                    rate_value: Number(body.rate_value || 0),
                    total_value: Number(body.total_value || 0),
                    date_buy: Number(body.date_buy || currentTimestamp),
                    category_id: body.category_id || categoriesRef.id,
                    id: newTransactionRef.id,
                    createdAt: currentTimestamp
                };
                ts.set(newTransactionRef, newTransactionData)

            } else {
                throw new Error("Dữ liệu không tồn tại!");
            }
        })
        // TRẢ VỀ TRẠNG THÁI THÀNH CÔNG
        return { success: true, message: "Giao dịch hoàn tất", data: dataResult };
    } catch (error: any) {
        console.log('logg error', error)
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

                /// --- Asset
                ts.update(assetRef, { total_value: increment(newValue) })

                /// --- Category
                ts.update(categoryRef, { total_value: increment(Number(total_value)) })

                /// --- Transaction

                ts.set(newTransactionRef, {
                    ...body,
                    total_value: Number(body.total_value || 0),
                    date_buy: Number(body.date_buy || 0),
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
        if (!transactionSnap.exists()) {
            throw new Error("Khong tim thay giao dich!");
        }

        const dataTransaction = transactionSnap.data() as Transaction;
        const { type, user_id, asset_id, total_value, quantity, category_id } = dataTransaction;
        const newTotalValue = type === TYPE_TRANSACTION.IN ? -Number(total_value) : Number(total_value);

        // Lay asset expense truoc khi vao transaction
        const dataAssetExpense = await getAssetForType(key_assets.expense, user_id);
        if (!dataAssetExpense) throw new Error("Khong tim thay Asset expense!");

        await runTransaction(db, async (ts) => {
            const userRef = getDocumentRef(tables_name.USER, user_id);
            const assetRef = getDocumentRef(tables_name.ASSET, asset_id);
            const categoryRef = getDocumentRef(tables_name.CATEGORY, category_id);
            const assetExpenseRef = getDocumentRef(tables_name.ASSET, dataAssetExpense.id);

            const [userSnap, assetSnap, categorySnap, assetExpenseSnap] = await Promise.all([
                ts.get(userRef),
                ts.get(assetRef),
                ts.get(categoryRef),
                ts.get(assetExpenseRef)
            ]);

            if (!userSnap.exists() || !assetSnap.exists() || !categorySnap.exists() || !assetExpenseSnap.exists()) {
                throw new Error("Khong tim thay du lieu!");
            }

            const assetData = assetSnap.data() as Asset;
            const assetType = assetData.type;
            const isInvest = assetType === key_assets.invest;
            const isExpense = assetType === key_assets.expense;

            // Cap nhat asset
            ts.update(assetRef, { total_value: increment(newTotalValue) });

            // Cap nhat asset expense (neu khong phai giao dich expense)
            if (!isExpense) {
                ts.update(assetExpenseRef, { total_value: increment(-newTotalValue) });
            }

            // Cap nhat category
            const categoryUpdate: Record<string, any> = {
                total_value: increment(-Number(total_value))
            };
            if (isInvest) {
                const categoryData = categorySnap.data() as Category;
                const newQuantityRaw = Number(categoryData.quantity || 0) - Number(quantity || 0);
                const newQuantity = Math.round(newQuantityRaw * 10000000000) / 10000000000;
                categoryUpdate.quantity = increment(-Number(quantity || 0));
                categoryUpdate.total_market = newQuantity * Number(categoryData.market_value || 0);
            }
            ts.update(categoryRef, categoryUpdate);

            // Xoa giao dich
            ts.delete(transactionRef);
        });

        return { success: true, message: "Xoa thanh cong" };
    } catch (error: any) {
        return { success: false, message: error.message || "Xoa that bai!" };
    }
}

// update transaction

export const updateTransaction = async (data: any) => {
    try {
        // Format input data - convert string values to numbers
        const formattedData = {
            ...data,
            quantity: Number(data?.quantity || 0),
            rate_value: Number(data?.rate_value || 0),
            total_value: Number(data?.total_value || 0),
            date_buy: Number(data?.date_buy || 0),
        };
        console.log('loggg formattedData',formattedData)
        const data_ = formattedData as Transaction;
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
                
                // Lay asset expense truoc khi vao transaction
                const dataAssetExpense = await getAssetForType(key_assets.expense, user_id);
                if (!dataAssetExpense) throw new Error("Khong tim thay Asset expense!");
                const assetExpenseRef = getDocumentRef(tables_name.ASSET, dataAssetExpense.id);
                await runTransaction(db, async (ts) => {
                    const value_diffirent = Number(total_value) - Number(total_value_current);
                    const money_diffirent_ = type == TYPE_TRANSACTION.IN
                        ? value_diffirent
                        : -value_diffirent;
                    const [userSnap, assetSnap, categorySnap, categoryCurrentSnap, assetExpenseSnap] = await Promise.all([
                        ts.get(userRef),
                        ts.get(assetRef),
                        ts.get(categoryRef),
                        ts.get(categoryCurrentRef),
                        ts.get(assetExpenseRef)
                    ]);
                    if (userSnap.exists() && assetSnap.exists() && categorySnap.exists() && categoryCurrentSnap.exists() && assetExpenseSnap.exists()) {
                        const assetData = assetSnap.data() as Asset;
                        const type_asset = assetData.type;
                        const isInvest = type_asset === key_assets.invest;

                        // Asset
                        ts.update(assetRef, {
                            total_value: increment(money_diffirent_)
                        })

                        // Cap nhat asset expense khi la giao dich invest
                        if (isInvest) {
                            ts.update(assetExpenseRef, {
                                total_value: increment(-money_diffirent_)
                            });
                        }

                        // Category
                        if (category_id == category_id_current) {
                            const categoryData = categorySnap.data() as Category;
                            const quantityDiffRaw = Number(data_.quantity || 0) - Number(dataTransaction.quantity || 0);
                            const quantityDiff = Math.round(quantityDiffRaw * 10000000000) / 10000000000;
                            const marketValue = Number(categoryData.market_value || 0);
                            const categoryUpdate: Record<string, any> = {
                                total_value: increment(Number(value_diffirent))
                            };
                            if (isInvest) {
                                categoryUpdate.quantity = increment(quantityDiff);
                                categoryUpdate.total_market = increment(quantityDiff * marketValue);
                            }
                            ts.update(categoryRef, categoryUpdate);
                        } else {
                            ts.update(categoryRef, {
                                total_value: increment(Number(total_value))
                            });
                            ts.update(categoryCurrentRef, {
                                total_value: increment(-Number(total_value_current))
                            });
                        }

                        // transaction
                        ts.update(transactionRef, {
                            ...data_,
                            quantity: Number(data_.quantity || 0),
                            rate_value: Number(data_.rate_value || 0),
                            total_value: Number(data_.total_value || 0),
                            date_buy: Number(data_.date_buy || 0),
                            updateAt: moment(new Date()).unix()
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
        return { success: true, message: "Cập nhật thành công", data: formattedData };
    } catch (error: any) {
        console.log('logg error', error.message)
        return { success: false, message: error.message };
    }
}