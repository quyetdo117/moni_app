import { db } from "@/configs/firebaseConfig";
import { collection, doc } from "firebase/firestore";

/// - Lay dia chi document
export const getDocumentRef = (name: string, id: string) => doc(db, name, id);

/// - Lay table ref
export const getTableRef = (name: string) => collection(db, name);

/// - lay vi tri co ban ghi moi

export const getNewDocRef = (name: string) =>  doc(collection(db, name));