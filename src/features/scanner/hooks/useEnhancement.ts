import { useCallback } from 'react';
import { useScannerStore } from '../store/useScannerStore';
import { enhanceImage } from '../services/enhancementService';
import { EnhancementMode } from '../types/scanner';

export function useEnhancement() {
  const { enhancementMode, setEnhancement } = useScannerStore();

  const applyEnhancement = useCallback(async (
    imageUri: string,
    mode: EnhancementMode,
    brightness: number = 0,
    contrast: number = 0
  ) => {
    return await enhanceImage(imageUri, mode, { brightness, contrast });
  }, []);

  return {
    enhancementMode,
    setEnhancement,
    applyEnhancement,
  };
}
