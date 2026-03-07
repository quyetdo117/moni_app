import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 150;

export default function VirtualButton() {
  // Tọa độ của nút
  const translateX = useSharedValue(SCREEN_WIDTH - BUTTON_SIZE - 20);
  const translateY = useSharedValue(SCREEN_HEIGHT / 2);
  const context = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      // Lưu vị trí hiện tại trước khi kéo
      context.value = { x: translateX.value, y: translateY.value };
    })
    .onUpdate((event) => {
      // Cập nhật vị trí theo ngón tay
      translateX.value = event.translationX + context.value.x;
      translateY.value = event.translationY + context.value.y;
    })
    .onEnd(() => {
      // Logic hít vào cạnh gần nhất
      if (translateX.value > SCREEN_WIDTH / 2 - BUTTON_SIZE / 2) {
        translateX.value = withSpring(SCREEN_WIDTH - BUTTON_SIZE - 10);
      } else {
        translateX.value = withSpring(10);
      }
      
      // Giới hạn không cho nút bay khỏi màn hình theo chiều dọc
      if (translateY.value < 50) translateY.value = withSpring(50);
      if (translateY.value > SCREEN_HEIGHT - 100) translateY.value = withSpring(SCREEN_HEIGHT - 100);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.ball, animatedStyle]}>
            <View style={styles.innerBall} />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  ball: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    zIndex: 999,
  },
  innerBall: {
    width: BUTTON_SIZE - 20,
    height: BUTTON_SIZE - 20,
    borderRadius: (BUTTON_SIZE - 20) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 2,
    borderColor: '#fff',
  },
});