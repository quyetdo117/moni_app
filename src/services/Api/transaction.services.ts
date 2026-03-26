import { db } from "@/configs/firebaseConfig";
import { key_assets, key_status, tables_name, TYPE_TRANSACTION, types_display } from "@/constants/constants";
import { DataFormExpense } from "@/screens/ExpenseScreen/types/Expense.types";
import { DataFormInvest } from "@/screens/InvestmentScreen/types/Investment.types";
import { DataFormSave } from "@/screens/SaveScreen/types/Save.types";
import { Asset, Category, Transaction } from "@/types/schema.types";
import { roundNumber } from "@/utils/convertData";
import { getDoc, increment, runTransaction, serverTimestamp, updateDoc } from "firebase/firestore";
import moment from "moment";
import { getDocumentRef, getNewDocRef } from "./base.services";


/// - Tao Giao dich dau tu
export const createTransactionInvest = async (body: DataFormInvest) => {
    try {
        const { user_id, asset_id } = body;
        if (!user_id) throw new Error("Thiếu user_id!");
        if (!asset_id) throw new Error("Thiếu asset_id! Vui lòng kiểm tra thông tin tài sản.");
        let dataResult: any = null;
        await runTransaction(db, async (ts) => {
            const userRef = getDocumentRef(tables_name.USER, user_id);
            const newTransactionRef = getNewDocRef(tables_name.TRANSACTION);
            const categoriesRef = getNewDocRef(tables_name.CATEGORY);

            const [userSnap] = await Promise.all([
                ts.get(userRef)
            ])

            let categorySnap;
            let categoryRef;

            if (body.category_id) {
                categoryRef = getDocumentRef(tables_name.CATEGORY, body.category_id);
                categorySnap = await ts.get(categoryRef);
            }

            if (userSnap.exists()) {
                const isAdd = body.type === TYPE_TRANSACTION.IN;
                const total_capital = Number(body.total_capital);
                const newInvestBalance = isAdd
                    ? total_capital
                    : - total_capital;

                // -- update balance user
                ts.update(userRef, {
                    balance: increment(-newInvestBalance)
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

                    // Tinh total_capital moi (thay vi su dung increment)
                    const currentTotalCapital = Number(categoryData.total_capital || 0);
                    const newTotalCapitalRaw = isAdd
                        ? currentTotalCapital + Number(body.total_capital)
                        : currentTotalCapital - Number(body.total_capital);
                    const newTotalCapital = roundNumber(newTotalCapitalRaw);

                    const dataUpdate: any = {
                        quantity,
                        total_capital: newTotalCapital
                    };


                    const existingDateUpdate = categoryData.date_update || 0;
                    const bodyDateBuy = Number(body.date_buy) || currentTimestamp;

                    if (bodyDateBuy > existingDateUpdate) {
                        dataUpdate.market_value = Number(body.market_value);
                        dataUpdate.date_update = bodyDateBuy;
                    }

                    // Tinh total_value = market_value * quantity (sau khi market_value duoc cap nhat)
                    const marketValueForTotal = dataUpdate.market_value !== undefined
                        ? dataUpdate.market_value
                        : Number(categoryData.market_value || 0);
                    dataUpdate.total_value = marketValueForTotal * quantity;

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
                    categoryData.total_capital = Number(body.total_capital || 0);
                    categoryData.market_value = Number(body.market_value || 0);
                    categoryData.total_value = Number(body.market_value || 0) * Number(body.quantity || 0);
                    categoryData.status = key_status.active;
                    categoryData.type = Number(body.type || 0);
                    categoryData.createdAt = currentTimestamp;
                    categoryData.type_display = types_display.invest;
                    categoryData.date_update = Number(body.date_buy || currentTimestamp);
                    categoryData.date_buy = Number(body.date_buy || currentTimestamp);
                    dataResult = {
                        ...categoryData
                    }
                    ts.set(categoriesRef, dataResult);
                }

                /// --- Transaction
                const { market_value, ...bodyWithoutMarketValue } = body;
                const newTransactionData = {
                    ...bodyWithoutMarketValue,
                    quantity: Number(body.quantity || 0),
                    rate_value: Number(body.rate_value || 0),
                    total_value: Number(body.total_capital || 0),
                    date_buy: Number(body.date_buy || currentTimestamp),
                    category_id: body.category_id || categoriesRef.id,
                    type_display: types_display.invest,
                    id: newTransactionRef.id,
                    createdAt: currentTimestamp
                };
                dataResult.transaction = {...newTransactionData};
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

/// - Tao Giao dich Tiết kiệm
export const createTransactionSave = async (body: DataFormSave) => {
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
                const isAdd = body.type === TYPE_TRANSACTION.IN;
                const total_value = Number(body.total_value);
                const newSaveBalance = isAdd
                    ? total_value
                    : - total_value;

                // -- Asset expense
                ts.update(userRef, {
                    balance: increment(-newSaveBalance)
                })

                const currentTimestamp = moment(new Date()).unix();

                /// --- Category
                if (categoryRef && categorySnap?.exists()) {
                    /// Update category
                    const categoryData = categorySnap.data() as Category;
                    // Tinh total_value va total_capital moi (thay vi su dung increment)
                    const currentTotalValue = Number(categoryData.total_value || 0);
                    const currentTotalCapital = Number(categoryData.total_capital || 0);
                    const newTotalValueRaw = currentTotalValue + newSaveBalance;
                    const newTotalValue = roundNumber(newTotalValueRaw);
                    const newTotalCapitalRaw = currentTotalCapital + newSaveBalance;
                    const newTotalCapital = roundNumber(newTotalCapitalRaw);
                    const dataUpdate: any = {
                        total_value: newTotalValue,
                        total_capital: newTotalCapital,
                    };

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
                    categoryData.total_value = Number(body.total_value || 0);
                    categoryData.total_capital = Number(body.total_value || 0);
                    categoryData.target_value = Number(body.target || 0);
                    categoryData.type = Number(body.type || 0);
                    categoryData.status = key_status.active;
                    categoryData.createdAt = currentTimestamp;
                    categoryData.user_id = body.user_id;
                    categoryData.type_display = types_display.save;
                    categoryData.date_buy = Number(body.date_buy || currentTimestamp);
                    dataResult = {
                        ...categoryData
                    }
                    ts.set(categoriesRef, categoryData);
                }

                /// --- Asset
                ts.update(assetRef, {
                    total_value: increment(newSaveBalance)
                })

                /// --- Transaction
                const newTransactionData = {
                    type: Number(body.type || 0),
                    name: body.name,
                    total_value: Number(body.total_value || 0),
                    date_buy: Number(body.date_buy || currentTimestamp),
                    note: body.note || '',
                    asset_id: body.asset_id,
                    user_id: body.user_id,
                    type_display: types_display.save,
                    category_id: body.category_id || categoriesRef.id,
                    target: Number(body.target || 0),
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
        const { user_id, category_id } = body;
        const userRef = getDocumentRef(tables_name.USER, user_id);
        const categoryRef = getDocumentRef(tables_name.CATEGORY, category_id);
        await runTransaction(db, async (ts) => {
            const newTransactionRef = getNewDocRef(tables_name.TRANSACTION);

            const [userSnap, categorySnap] = await Promise.all([
                ts.get(userRef),
                ts.get(categoryRef)
            ])

            if (userSnap.exists() && categorySnap?.exists()) {
                const isAdd = body.type === TYPE_TRANSACTION.IN;
                const total_value = Number(body.total_value);
                const newValue = isAdd ? total_value
                    : -total_value;

                // -- User
                ts.update(userRef, { balance: increment(Number(newValue)) })

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

export const deleteTransaction = async (id: string, type_asset: string) => {
    try {
        const transactionRef = getDocumentRef(tables_name.TRANSACTION, id);
        const transactionSnap = await getDoc(transactionRef);
        if (!transactionSnap.exists()) {
            throw new Error("Khong tim thay giao dich!");
        }

        const dataTransaction = transactionSnap.data() as Transaction;
        const { type, user_id, total_value, quantity, category_id } = dataTransaction;
        const newTotalValue = type === TYPE_TRANSACTION.IN ? -Number(total_value) : Number(total_value);

        await runTransaction(db, async (ts) => {
            const userRef = getDocumentRef(tables_name.USER, user_id);
            const categoryRef = getDocumentRef(tables_name.CATEGORY, category_id);

            const [userSnap, categorySnap] = await Promise.all([
                ts.get(userRef),
                ts.get(categoryRef)
            ]);

            if (!userSnap.exists() || !categorySnap.exists()) {
                throw new Error("Khong tim thay du lieu!");
            }
            const isInvest = type_asset === key_assets.invest;

            // Cap nhat user
            ts.update(userRef, { balance: increment(newTotalValue) });

            // Cap nhat category
            const categoryUpdate: Record<string, any> = {};
            if (isInvest) {
                const categoryData = categorySnap.data() as Category;
                const newQuantityRaw = Number(categoryData.quantity || 0) - Number(quantity || 0);
                const newQuantity = Math.round(newQuantityRaw * 10000000000) / 10000000000;
                categoryUpdate.quantity = increment(-Number(quantity || 0));
                categoryUpdate.total_capital = increment(-Number(total_value));
                categoryUpdate.total_value = newQuantity * Number(categoryData.market_value || 0);
            } else {
                categoryUpdate.total_value = increment(-Number(total_value))
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

// Update category (saving)
export const updateCategorySave = async (dataBody: {
    id: string;
    name: string;
    target_value: number;
    date_buy: number;
    total_value: number;
}) => {
    try {
        const { id, name, target_value, date_buy, total_value } = dataBody;
        const categoryRef = getDocumentRef(tables_name.CATEGORY, id);
        const categorySnap = await getDoc(categoryRef);

        if (!categorySnap.exists()) {
            throw new Error("Không tìm thấy danh mục!");
        }

        const updateData: Record<string, any> = {
            name: name,
            target_value: Number(target_value) || 0,
            date_update: date_buy,
            total_value: Number(total_value) || 0,
        };

        await updateDoc(categoryRef, updateData);

        return {
            success: true,
            message: "Cập nhật thành công",
            data: {
                ...categorySnap.data(),
                ...updateData
            }
        };
    } catch (error: any) {
        console.error("Update Save Category Error:", error);
        return { success: false, message: error.message || "Cập nhật thất bại!" };
    }
}

// Update category (investment)
export const updateCategory = async (dataBody: {
    id: string;
    name: string;
    market_value: number;
    date_buy: number;
    quantity: number;
}) => {
    try {
        const { id, name, market_value, date_buy, quantity } = dataBody;
        const categoryRef = getDocumentRef(tables_name.CATEGORY, id);
        const categorySnap = await getDoc(categoryRef);

        if (!categorySnap.exists()) {
            throw new Error("Không tìm thấy danh mục!");
        }

        const updateData: Record<string, any> = {
            name: name,
            market_value: Number(market_value) || 0,
            date_update: date_buy,
        };

        // Recalculate total_value based on new market_value and quantity
        const qty = quantity || 0;
        updateData.total_value = roundNumber(Number(market_value || 0) * qty);

        await updateDoc(categoryRef, updateData);

        return {
            success: true,
            message: "Cập nhật thành công",
            data: {
                ...categorySnap.data(),
                ...updateData
            }
        };
    } catch (error: any) {
        console.error("Update Category Error:", error);
        return { success: false, message: error.message || "Cập nhật thất bại!" };
    }
}

// Delete category (investment)// invest, save
export const deleteCategory = async (categoryId: string, userId: string) => {
    try {
        const categoryRef = getDocumentRef(tables_name.CATEGORY, categoryId);
        const userRef = getDocumentRef(tables_name.USER, userId);

        await runTransaction(db, async (ts) => {
            const [categorySnap, userSnap] = await Promise.all([
                ts.get(categoryRef),
                ts.get(userRef),
            ]);

            if (!categorySnap.exists() || !userSnap.exists()) {
                throw new Error("Dữ liệu tài sản không hợp lệ!");
            }

            const categoryData = categorySnap.data() as Category;
            const total_capital = Number(categoryData.total_capital || 0);
            ts.update(userRef, {
                balance: increment(total_capital)
            });

            // 3. Xóa danh mục
            ts.delete(categoryRef);
        });

        return { success: true, message: "Xóa danh mục thành công" };
    } catch (error: any) {
        console.error("Delete Category Error:", error);
        return { success: false, message: error.message || "Xóa thất bại!" };
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

                await runTransaction(db, async (ts) => {
                    const value_diffirent = Number(total_value) - Number(total_value_current);
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
                        const assetData = assetSnap.data() as Asset;
                        const type_asset = assetData.type;
                        const isInvest = type_asset === key_assets.invest;

                        // User
                        ts.update(userRef, {
                            balance: increment(money_diffirent_)
                        })

                        // Category
                        if (category_id == category_id_current) {
                            const categoryData = categorySnap.data() as Category;
                            const quantityDiffRaw = Number(data_.quantity || 0) - Number(dataTransaction.quantity || 0);
                            const quantityDiff = Math.round(quantityDiffRaw * 10000000000) / 10000000000;
                            const marketValue = Number(categoryData.market_value || 0);
                            const categoryUpdate: Record<string, any> = {};
                            if (isInvest) {
                                categoryUpdate.quantity = increment(quantityDiff);
                                categoryUpdate.total_value = increment(quantityDiff * marketValue);
                                categoryUpdate.total_capital = increment(Number(value_diffirent));
                            } else {
                                categoryUpdate.total_value = increment(Number(value_diffirent));
                            }
                            ts.update(categoryRef, categoryUpdate);
                        } else {
                            // case nay chi danh cho expense
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