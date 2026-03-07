import React, { ReactNode, Ref, useImperativeHandle } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export interface TextShakeRef {
  startShake: () => void
}

interface TextShakeProps {
  ref: Ref<TextShakeRef>,
  children: ReactNode,
  style?: StyleProp<TextStyle>
}


const TextShake = ({ children, ref, style }: TextShakeProps) => {
  const shake = useSharedValue(0); // Giá trị dùng để lắc

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: shake.value }, // Lắc theo trục X
      ],
    };
  });

  const startShake = () => {
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  useImperativeHandle(ref, () => ({
    startShake,
  }));

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {children}
    </Animated.Text>
  );
};

export default TextShake;
