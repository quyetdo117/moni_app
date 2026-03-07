
import { COLOR_APP } from '@/constants/constants';
import RNBounceable from '@freakycoder/react-native-bounceable';
import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface ButtonProps {
    children?: ReactNode,
    style?: StyleProp<ViewStyle>,
    style_txt?: StyleProp<TextStyle>,
    onPress?: () => void,
    title?: string
}

export default function ButtonAnimated(props: ButtonProps) {

    const rippleScale = useSharedValue(0); // Điều khiển hiệu ứng lan tỏa
    const rippleOpacity = useSharedValue(0); // Kiểm soát độ mờ

    const handlePressIn = () => {
        rippleScale.value = withTiming(1, { duration: 120, easing: Easing.linear });
        rippleOpacity.value = withTiming(1, { duration: 200 });
    };

    const handlePressOut = () => {
        rippleScale.value = withTiming(0, { duration: 120, easing: Easing.linear });
        rippleOpacity.value = withTiming(0, { duration: 200 });
        if (props.onPress) props.onPress();
    };

    // Hiệu ứng động cho vòng lan tỏa
    const rippleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: rippleScale.value }],
        opacity: rippleOpacity.value,
    }));

    return (
        <RNBounceable
            style={[styles.button, props?.style]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View style={[styles.ripple, rippleStyle]} />
            {props.children || <Text style={[styles.txt, props?.style_txt]}>{props.title}</Text>}
        </RNBounceable>
    )
}

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden', // Giữ hiệu ứng trong nút
        backgroundColor: COLOR_APP.blue,
        paddingVertical: 10,
        paddingHorizontal: 10
    },
    ripple: {
        position: 'absolute',
        width: '100%',
        height: '500%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)', // Màu vòng lan tỏa
        borderRadius: 100,
        zIndex: 0,
    },
    txt: {
        color: '#fff',
        fontSize: 16
    }
})
