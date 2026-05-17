import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  runOnJS,
  SharedValue
} from 'react-native-reanimated';
import { ScannerColors } from '../constants';

interface EdgeHandleProps {
  x1: SharedValue<number>; y1: SharedValue<number>;
  x2: SharedValue<number>; y2: SharedValue<number>;
  type: 'top' | 'right' | 'bottom' | 'left';
  onDragStart?: () => void;
  onDragEnd?: (v1: {x: number, y: number}, v2: {x: number, y: number}) => void;
  minX?: number; maxX?: number;
  minY?: number; maxY?: number;
}

export function EdgeHandle({ 
  x1, y1, x2, y2, 
  onDragStart, onDragEnd,
  minX = 0, maxX = 1000,
  minY = 0, maxY = 1000 
}: EdgeHandleProps) {
  
  const pan = Gesture.Pan()
    .onStart(() => {
      if (onDragStart) runOnJS(onDragStart)();
    })
    .onChange((event) => {
      const dx = event.changeX;
      const dy = event.changeY;

      x1.value = Math.max(minX, Math.min(maxX, x1.value + dx));
      y1.value = Math.max(minY, Math.min(maxY, y1.value + dy));
      x2.value = Math.max(minX, Math.min(maxX, x2.value + dx));
      y2.value = Math.max(minY, Math.min(maxY, y2.value + dy));
    })
    .onEnd(() => {
      // PASS DATA TO JS THREAD TO AVOID ILLEGAL ACCESS
      if (onDragEnd) {
        runOnJS(onDragEnd)(
          { x: x1.value, y: y1.value },
          { x: x2.value, y: y2.value }
        );
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const midX = (x1.value + x2.value) / 2;
    const midY = (y1.value + y2.value) / 2;
    const angle = Math.atan2(y2.value - y1.value, x2.value - x1.value);

    return {
      transform: [
        { translateX: midX },
        { translateY: midY },
        { rotate: `${angle}rad` },
      ],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.handle, animatedStyle]}>
        <View style={styles.pill} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  handle: {
    position: 'absolute',
    width: 60,
    height: 40,
    marginLeft: -30,
    marginTop: -20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 90,
  },
  pill: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: ScannerColors.accent,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
});
