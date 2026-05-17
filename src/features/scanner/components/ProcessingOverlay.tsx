import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ScannerColors } from '../constants';

interface ProcessingOverlayProps {
  message?: string;
  subMessage?: string;
}

export function ProcessingOverlay({ 
  message = 'Processing...', 
  subMessage = 'This may take a moment' 
}: ProcessingOverlayProps) {
  return (
    <Animated.View 
      entering={FadeIn.duration(150)} 
      exiting={FadeOut.duration(150)}
      style={styles.container}
    >
      <View style={styles.content}>
        <ActivityIndicator size="large" color={ScannerColors.accent} />
        <View style={styles.textContainer}>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.subMessage}>{subMessage}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 15, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  textContainer: {
    alignItems: 'center',
    gap: 4,
  },
  message: {
    fontSize: 14,
    color: ScannerColors.textPrimary,
    fontWeight: '500',
  },
  subMessage: {
    fontSize: 12,
    color: ScannerColors.textTertiary,
  },
});
