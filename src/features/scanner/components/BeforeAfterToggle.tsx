import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface BeforeAfterToggleProps {
  showAfter: boolean;
  onChange: (showAfter: boolean) => void;
}

export function BeforeAfterToggle({ showAfter, onChange }: BeforeAfterToggleProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, !showAfter && styles.buttonActive]}
        onPress={() => onChange(false)}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, !showAfter && styles.textActive]}>before</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, showAfter && styles.buttonActive]}
        onPress={() => onChange(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, showAfter && styles.textActive]}>after</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  buttonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  text: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  textActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
