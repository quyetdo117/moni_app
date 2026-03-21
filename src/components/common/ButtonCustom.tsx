
import { COLOR_APP } from '@/constants/constants';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { ElementType } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

interface ButtonProps {
    style_btn?: StyleProp<ViewStyle>;
    style_txt?: StyleProp<TextStyle>;
    Icon?: ElementType;
    name_icon?: string;
    title: string;
    onPress?: Function;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

export default function ButtonCustom({ 
    style_txt, 
    style_btn, 
    Icon, 
    title, 
    name_icon, 
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false
}: ButtonProps) {
    const onPressButton = () => {
        if (onPress && !disabled) {
            onPress();
        }
    }

    const buttonStyles = [
        styles.btn,
        styles[variant],
        styles[`btn_${size}`],
        disabled && styles.disabled,
        style_btn
    ];

    const getIconColor = () => {
        if (variant === 'outline' || variant === 'ghost') return COLOR_APP.primary;
        if (variant === 'secondary') return Colors.text;
        return '#fff';
    };

    return (
        <RNBounceable 
            onPress={onPressButton} 
            style={buttonStyles}
            disabled={disabled}
        >
            {Icon && (
                <Icon 
                    style={styles.icon} 
                    name={name_icon} 
                    size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} 
                    color={getIconColor()} 
                />
            )}
            <Text style={[
                styles.txt,
                styles[`txt_${variant}`],
                styles[`txt_${size}`],
                disabled && styles.txt_disabled,
                style_txt
            ]}>{title}</Text>
        </RNBounceable>
    )
}

const styles = StyleSheet.create({
    btn: {
        borderRadius: BorderRadius.base,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    // Variants
    primary: {
        backgroundColor: COLOR_APP.primary,
    },
    secondary: {
        backgroundColor: Colors.surfaceElevated,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLOR_APP.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    // Sizes
    btn_sm: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    btn_md: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    btn_lg: {
        paddingVertical: Spacing.base,
        paddingHorizontal: Spacing.xl,
    },
    // Text styles
    txt: {
        fontWeight: Typography.fontWeight.semiBold,
    },
    txt_primary: {
        color: '#fff',
    },
    txt_secondary: {
        color: Colors.text,
    },
    txt_outline: {
        color: COLOR_APP.primary,
    },
    txt_ghost: {
        color: COLOR_APP.primary,
    },
    txt_sm: {
        fontSize: Typography.fontSize.sm,
    },
    txt_md: {
        fontSize: Typography.fontSize.base,
    },
    txt_lg: {
        fontSize: Typography.fontSize.lg,
    },
    // Icon
    icon: {
        marginRight: Spacing.sm,
    },
    // Disabled
    disabled: {
        opacity: 0.5,
    },
    txt_disabled: {
        opacity: 0.7,
    }
})
