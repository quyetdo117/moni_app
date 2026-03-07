// Import the functions you need from the SDKs you need
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZWclSRU9-OWFhBltkDrCTIJPUBsnVBIw",
  authDomain: "moniapp-4846f.firebaseapp.com",
  projectId: "moniapp-4846f",
  storageBucket: "moniapp-4846f.firebasestorage.app",
  messagingSenderId: "1002344017619",
  appId: "1:1002344017619:web:058a38cd6c1f07bcf52e26",
  measurementId: "G-RGPYCGZ2M4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// Cấu hình để Firebase ghi nhớ trạng thái đăng nhập trong Expo Go
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { db };

