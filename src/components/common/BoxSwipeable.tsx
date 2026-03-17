import { COLOR_APP } from '@/constants/constants';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';

interface BoxSwipeableProps<T> {
    children: ReactNode;
    data: T;
    onEdit: (data: T) => void;
    onDelete: (data: T) => void;
    isSmall?: boolean
}

export default function BoxSwipeable<T>({ children, data, onEdit, onDelete, isSmall }: BoxSwipeableProps<T>) {

    const onEdit_ = () => {
        onEdit(data);
    }

    const onDelete_ = () => {
        onDelete(data);
    }

    const RightActions = ({ prog, drag }: { prog: any, drag: any }) => {
        const styleAnimation = useAnimatedStyle(() => {
            return {
                transform: [{ translateX: drag.value + 80 }],
            };
        });

        return (
            <View style={{ width: 90, flexDirection: 'row' }}>
                <Reanimated.View style={[{ flexDirection: 'row' }, styleAnimation, isSmall && { alignItems: 'center' }]}>
                    <RNBounceable
                        style={[styles.btn, { backgroundColor: COLOR_APP.yellow }, isSmall && { height: 45, borderRadius: 10 }]}
                        onPress={onEdit_}
                    >
                        <MaterialIcons name="edit" size={24} color="white" />
                    </RNBounceable>

                    <RNBounceable
                        style={[styles.btn, { backgroundColor: COLOR_APP.red }, isSmall && { height: 45, borderRadius: 10 }]}
                        onPress={onDelete_}
                    >
                        <MaterialIcons name="delete" size={24} color="white" />
                    </RNBounceable>
                </Reanimated.View>
            </View>
        );
    };

    return (
        <Swipeable renderRightActions={(prog, drag) => (
            <RightActions prog={prog} drag={drag} />
        )}>
            {children}
        </Swipeable>
    )
}

const styles = StyleSheet.create({
    btn: {
        width: 45,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
