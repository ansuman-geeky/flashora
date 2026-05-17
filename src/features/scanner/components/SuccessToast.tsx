import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  Easing
} from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';
import { ScannerColors, ScannerLayout } from '../constants';

interface SuccessToastProps {
  message: string;
  onDismiss: () => void;
  visible: boolean;
}

export function SuccessToast({ message, onDismiss, visible }: SuccessToastProps) {
  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withTiming(0, { 
        duration: 200, 
        easing: Easing.out(Easing.ease) 
      });

      const timeout = setTimeout(() => {
        hide();
      }, 2500);

      return () => clearTimeout(timeout);
    } else {
      hide();
      return undefined;
    }
  }, [visible]);

  const hide = () => {
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setShouldRender)(false);
      runOnJS(onDismiss)();
    });
    translateY.value = withTiming(40, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!shouldRender) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <CheckCircle2 size={18} color="#22C55E" />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: ScannerLayout.screenPadding,
    right: ScannerLayout.screenPadding,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10000,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
