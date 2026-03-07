import { PopupRef } from '@/types/view.types';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import InfoInvestment from '../items/InfoInvestment';
import ItemInvestTransaction from '../items/ItemInvestTransaction';
import { DataInvestItem, DataTransaction } from '../types/Investment.types';


const PopupInvest = forwardRef<PopupRef<DataInvestItem>>((props, ref) => {

    const [dataInvest, setData] = useState<DataInvestItem | null>(null)

    const transactions = dataInvest?.transactions || []
    const bottomSheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => ['50%', '90%'], []);

    const onShow = (data?: DataInvestItem) => {
        if (data) {
            setData(data)
        }
        if (bottomSheetRef.current) {
            bottomSheetRef.current.snapToIndex(1);
        }
    }

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
                ressBehavior="close"
            />
        ),
        []
    );
    const onClose = () => {
        if (bottomSheetRef.current) {
            bottomSheetRef.current.close();
        }
    }

    const renderItem = ({ item, index }: { item: DataTransaction, index: number }) => {
        return (
            <ItemInvestTransaction data={item} key={index} />
        )
    }

    useImperativeHandle(ref, () => ({
        onShow,
        onClose
    }))

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            onAnimate={(fromIndex, toIndex) => {
                if (toIndex === 0) {
                    onClose();
                }
            }}
            backdropComponent={renderBackdrop}
        >
            <View style={styles.sheetHeader}>
                {
                    dataInvest &&
                    <InfoInvestment data={dataInvest} />
                }
            </View>
            <BottomSheetFlatList
                data={transactions}
                keyExtractor={(t: DataTransaction) => t.id_transaction}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
            />
        </BottomSheet>
    )
})

const styles = StyleSheet.create({
    sheetHeader: {
        position: 'relative'
    },
    sheetTitle: {

    },
    listContent: {
        paddingBottom: 30
    }
})

PopupInvest.displayName = 'PopupInvest';

export default PopupInvest;