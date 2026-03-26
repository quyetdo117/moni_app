import { auth, db } from "@/configs/firebaseConfig";
import { key_assets, tables_name } from "@/constants/constants";
import { LoginForm, RegisterForm } from "@/screens/LoginScreen/LoginScreen.types";
import { createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword } from "@firebase/auth";
import { doc, writeBatch } from "firebase/firestore";
import moment from "moment";
import { assets_init, categories_expense_init } from "../InitData/InitData";
import { getNewDocRef } from "./base.services";

const createInitData = async <T extends RegisterForm>(uid: string, data: T) => {
    const batch = writeBatch(db);
    const timestamp = moment(new Date()).unix();

    const { email, name } = data;

    // User
    const newUserRef = doc(db, tables_name.USER, uid);
    batch.set(newUserRef, {
        id: uid,
        uid: uid,
        email: email,
        balance: 0,
        name: name,
        createdAt: timestamp
    });

    let asset_id_expense = ''

    // Assets
    assets_init.forEach((item) => {
        const newAssetRef = getNewDocRef(tables_name.ASSET);
        if(item.type == key_assets.expense) {
            asset_id_expense = newAssetRef.id
        }
        batch.set(newAssetRef, {
            ...item,
            id: newAssetRef.id,
            user_id: uid,
            createdAt: timestamp
        })
    })

    // Category
    if(asset_id_expense){
        categories_expense_init.forEach((item) => {
            const newCategoryRef = getNewDocRef(tables_name.CATEGORY);
            batch.set(newCategoryRef, {
                ...item,
                id: newCategoryRef.id,
                user_id: uid,
                asset_id: asset_id_expense,
                createdAt: timestamp
            })
        })
    }

    await batch.commit();
}

export const registerUser = async (data: RegisterForm) => {
    let userAuth = null;
    try {
        const { email, password } = data;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        userAuth = userCredential.user;
        const uid = userAuth.uid;
        await createInitData<RegisterForm>(uid, data);
        const dataUser = {
            uid: uid
        }
        return { success: true, msg: 'Tao tai khoan thanh cong', data: dataUser}
    } catch (error: any) {
        if (userAuth) {
            try {
                await deleteUser(userAuth);
                console.log('Cleanup: Deleted Auth user due to Firestore failure');
            } catch (delError) {
                console.error('Cleanup Error:', delError);
            }
        }
        console.log('logg error', error)
        return { success: false, msg: 'Dang ky that bai' }
    }
}

export const loginUser = async (data: LoginForm) => {
    try {
        const { email, password } = data;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userAuth = userCredential.user;
        const uid = userAuth.uid;
        const dataUser = {
            uid: uid
        }
        return { success: true, msg: 'Dang nhap thanh cong!', data: dataUser }
    } catch (error) {
        console.log('log error', error);

        return { success: false, msg: 'Dang nhap that bai!' }
    }
}