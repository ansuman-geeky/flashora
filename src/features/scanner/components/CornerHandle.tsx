import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  runOnJS,
  SharedValue
} from 'react-native-reanimated';
import { ScannerColors } from '../constants';

interface CornerHandleProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
  onDragStart?: () => void;
  onDragEnd?: (finalX: number, finalY: number) => void;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export function CornerHandle({ 
  x, y, 
  onDragStart, onDragEnd,
  minX = 0, maxX = 1000,
  minY = 0, maxY = 1000 
}: CornerHandleProps) {
  
  const pan = Gesture.Pan()
    .onStart(() => {
      if (onDragStart) runOnJS(onDragStart)();
    })
    .onChange((event) => {
      const nextX = x.value + event.changeX;
      const nextY = y.value + event.changeY;
      
      x.value = Math.max(minX, Math.min(maxX, nextX));
      y.value = Math.max(minY, Math.min(maxY, nextY));
    })
    .onEnd(() => {
      // PASS THE VALUE FROM UI TO JS THREAD TO AVOID .value ACCESS ON JS
      if (onDragEnd) runOnJS(onDragEnd)(x.value, y.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value }
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.dot} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: ScannerColors.accent,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});
