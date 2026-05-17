import React from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  Image 
} from 'react-native';
import { ScannedPage } from '../types/scanner';
import { ScannerColors, ScannerLayout } from '../constants';

interface PageStripProps {
  pages: ScannedPage[];
  onAddPress: () => void;
  onPagePress: (index: number) => void;
}

export function PageStrip({ pages, onAddPress, onPagePress }: PageStripProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {pages.map((page, index) => (
          <TouchableOpacity 
            key={page.id}
            style={styles.thumb}
            onPress={() => onPagePress(index)}
            activeOpacity={0.8}
          >
            <Image 
              source={{ uri: page.enhancedUri || page.croppedUri }} 
              style={styles.image} 
            />
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>pg {index + 1}</Text>
            </View>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={onAddPress}
          activeOpacity={0.7}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 88,
    left: 0,
    right: 0,
  },
  scrollContent: {
    paddingHorizontal: ScannerLayout.screenPadding,
    gap: 8,
    alignItems: 'center',
  },
  thumb: {
    width: ScannerLayout.cameraThumbW,
    height: ScannerLayout.cameraThumbH,
    borderRadius: 6,
    backgroundColor: '#2A2A2A',
    borderWidth: 1.5,
    borderColor: ScannerColors.accentBorder,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  labelContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  labelText: {
    fontSize: 8,
    color: ScannerColors.accent,
    fontWeight: 'bold',
  },
  addButton: {
    width: ScannerLayout.cameraThumbW,
    height: ScannerLayout.cameraThumbH,
    borderRadius: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '300',
  },
});
