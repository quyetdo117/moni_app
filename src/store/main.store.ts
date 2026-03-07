import { type_asset } from '@/types/schema.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { InfoUserStore, ListItem } from './store.types';

export const useUserStore = create<InfoUserStore>()(
    persist(
        (set) => ({
            infoUser: null,
            infoAsset: {},
            uid: '',
            isLogin: false,
            setStateLogin: (type) => set({ isLogin: type }),
            setInfoUser: (data) => {
                const assets = data?.assets || [];
                const infoAsset: Partial<Record<type_asset, string>> = {};
                assets.forEach(item => {
                    const type = item.type.toString() as type_asset;
                    if(type){
                        infoAsset[type] = item.id
                    }
                })
                set({ infoUser: data, infoAsset})
            },
            setUidUser: (id) => set({ uid: id }),
            logout: () => set({ infoUser: null, uid: '', isLogin: false })
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => AsyncStorage),
            skipHydration: true
        }
    )
);

export const useListStore = create<ListItem>((set) => ({
    listExpense: [],
    setListExpense: (data) => set({ listExpense: data })
}))