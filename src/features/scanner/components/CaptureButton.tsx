import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ScannerColors, ScannerLayout } from '../constants';

interface CaptureButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function CaptureButton({ onPress, disabled }: CaptureButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    
    // Animation 0.92 -> 1.0 (100ms) as per spec
    scale.value = withSequence(
      withTiming(0.92, { duration: 50 }),
      withTiming(1, { duration: 50 })
    );

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View style={[styles.outer, animatedStyle]}>
        <View style={styles.inner} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: ScannerLayout.captureButtonOuter,
    height: ScannerLayout.captureButtonOuter,
    borderRadius: ScannerLayout.captureButtonOuter / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: ScannerLayout.captureButtonInner,
    height: ScannerLayout.captureButtonInner,
    borderRadius: ScannerLayout.captureButtonInner / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: ScannerColors.accent,
  },
});
