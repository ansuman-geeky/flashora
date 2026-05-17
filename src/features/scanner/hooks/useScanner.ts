import { useEffect } from 'react';
import { useScannerStore } from '../store/useScannerStore';
import { ScannedPage, DocumentQuad } from '../types/scanner';
import { applyPerspectiveCorrection } from '../services/perspectiveService';
import { enhanceImage } from '../services/enhancementService';

export function useScanner() {
  const store = useScannerStore();

  const processCapturedPage = async (uri: string, quad: DocumentQuad, width: number, height: number, rotation: number = 0) => {
    store.setProcessing(true);
    try {
      const croppedUri = await applyPerspectiveCorrection(uri, quad, width, height, rotation);
      const enhancedUri = await enhanceImage(croppedUri, 'auto', { brightness: 0, contrast: 0 });
      
      const newPage: ScannedPage = {
        id: Date.now().toString(),
        rawUri: uri,
        croppedUri,
        enhancedUri,
        quad,
        enhancementMode: 'auto',
        capturedAt: Date.now(),
      };
      
      store.addPage(newPage);
      return newPage;
    } catch (e) {
      store.setError('PROCESSING_FAILED');
      throw e;
    } finally {
      store.setProcessing(false);
    }
  };

  return {
    ...store,
    processCapturedPage,
  };
}
