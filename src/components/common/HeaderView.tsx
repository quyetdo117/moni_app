
import { commonStyles } from '@/utils/styles_shadow';
import Ionicons from '@expo/vector-icons/Ionicons';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface HeaderProps {
    title: string,
    onBack?: Function,
    isCenter?: boolean,
    style_txt?: StyleProp<TextStyle>,
    style_container?: StyleProp<ViewStyle>,
    rightComponent?: React.ReactNode,
}

export default function HeaderView({ title, onBack, isCenter, style_txt, style_container, rightComponent }: HeaderProps) {
    const insets = useSafeAreaInsets();

    const onPressBack = () => {
        if (onBack) {
            onBack()
        }
    }

    return (
        <View style={[
            styles.header, 
            { paddingTop: insets.top + Spacing.sm },
            commonStyles.box_shadow,
            style_container
        ]}>
            <RNBounceable onPress={onPressBack} style={styles.backButton}>
               <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </RNBounceable>
            <View style={[
                styles.titleContainer,
                isCenter ? styles.titleCenter : null
            ]}>
                <Text style={[styles.title, style_txt]} numberOfLines={1}>{title}</Text>
            </View>
            {rightComponent ? rightComponent : <View style={styles.placeholder} />}
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: Colors.surface,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: Spacing.xs,
        marginLeft: -Spacing.xs,
    },
    titleContainer: {
        flex: 1,
        marginHorizontal: Spacing.md,
    },
    titleCenter: {
        alignItems: 'center',
    },
    title: {
        color: Colors.text,
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.semiBold,
    },
    placeholder: {
        width: 32,
    }
})
