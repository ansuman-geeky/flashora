import { useCallback, useState } from 'react';
import { useScannerStore } from '../store/useScannerStore';
import { exportToPdf } from '../services/pdfExportService';
import { exportToDocx } from '../services/docxExportService';
import { ExportOptions } from '../types/scanner';
import * as MediaLibrary from 'expo-media-library';

export function useExport() {
  const { session } = useScannerStore();
  const [isExporting, setIsExporting] = useState(false);

  const exportSession = useCallback(async (options: ExportOptions) => {
    if (!session || session.pages.length === 0) throw new Error('No pages to export');
    
    setIsExporting(true);
    try {
      if (options.format === 'pdf') {
        const uri = await exportToPdf(session.pages, options);
        return [uri]; // Return array for consistency
      } else if (options.format === 'docx') {
        const uri = await exportToDocx(session.pages, options);
        return [uri];
      } else if (options.format === 'jpg' || options.format === 'png') {
        const uris = [];
        for (const page of session.pages) {
          const uri = page.enhancedUri || page.croppedUri || page.rawUri;
          const asset = await MediaLibrary.createAssetAsync(uri);
          await MediaLibrary.createAlbumAsync('Flashora Scanner', asset, false);
          uris.push(uri);
        }
        return uris;
      }
      throw new Error('Unsupported format');
    } finally {
      setIsExporting(false);
    }
  }, [session]);

  return { exportSession, isExporting };
}
