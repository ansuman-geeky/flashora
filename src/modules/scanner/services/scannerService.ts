import * as FileSystem from 'expo-file-system';
import { startScan, DocumentScannerOptions } from '../native/DocumentScanner';
import { useScannerHistory, ScanItem } from '../store/useScannerHistory';

export const scanAndSave = async (options?: DocumentScannerOptions) => {
  try {
    const result = await startScan(options);
    if (!result || (!result.pdf && (!result.pages || result.pages.length === 0))) {
      return null;
    }

    const timestamp = Date.now();
    const id = `scan_${timestamp}`;
    const defaultName = `Scan ${new Date(timestamp).toLocaleDateString()}`;

    let finalPdfUri: string | null = null;
    let size = 0;

    if (result.pdf) {
      const destUri = `${FileSystem.documentDirectory}${id}.pdf`;
      await FileSystem.copyAsync({
        from: result.pdf.uri,
        to: destUri,
      });
      finalPdfUri = destUri;
      
      const fileInfo = await FileSystem.getInfoAsync(destUri);
      if (fileInfo.exists) {
        size = fileInfo.size;
      }
    }

    const finalImageUris: string[] = [];
    if (result.pages) {
      for (let i = 0; i < result.pages.length; i++) {
        const page = result.pages[i];
        if (page) {
          const destUri = `${FileSystem.documentDirectory}${id}_page_${i}.jpg`;
          await FileSystem.copyAsync({
            from: page.imageUri,
            to: destUri,
          });
          finalImageUris.push(destUri);
          
          if (!finalPdfUri) {
            const fileInfo = await FileSystem.getInfoAsync(destUri);
            if (fileInfo.exists) {
              size += fileInfo.size;
            }
          }
        }
      }
    }

    const firstImage = finalImageUris[0];
    const scanItem: ScanItem = {
      id,
      name: defaultName,
      date: timestamp,
      size,
      thumbnailUri: firstImage ?? null,
      pdfUri: finalPdfUri,
      imageUris: finalImageUris,
    };

    useScannerHistory.getState().addScan(scanItem);

    return scanItem;
  } catch (error) {
    console.error('Scan failed:', error);
    throw error;
  }
};
