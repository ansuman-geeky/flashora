import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { ScannedPage, ExportOptions } from '../types/scanner';
import { recordError } from '@services/crashlytics';

export async function exportToPdf(
  pages: ScannedPage[],
  options: ExportOptions
): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.create();

    // 1. Parallel Load: Fetch all images into memory buffers simultaneously
    // This removes the serial I/O bottleneck
    const imageBuffers = await Promise.all(
      pages.map(async (page) => {
        const uri = page.enhancedUri || page.croppedUri || page.rawUri;
        const base64Img = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return Buffer.from(base64Img, 'base64');
      })
    );

    // 2. Sequential Embed: pdf-lib requires sequential embedding for document integrity
    for (const imgBytes of imageBuffers) {
      let image;
      if (imgBytes[0] === 0xFF && imgBytes[1] === 0xD8) {
        image = await pdfDoc.embedJpg(imgBytes);
      } else if (imgBytes[0] === 0x89 && imgBytes[1] === 0x50) {
        image = await pdfDoc.embedPng(imgBytes);
      } else {
        image = await pdfDoc.embedJpg(imgBytes);
      }
      
      const A4_WIDTH = 595.28;
      const A4_HEIGHT = 841.89;
      
      const { width, height } = image.scaleToFit(A4_WIDTH, A4_HEIGHT);
      const pdfPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      
      pdfPage.drawImage(image, {
        x: (A4_WIDTH - width) / 2,
        y: (A4_HEIGHT - height) / 2,
        width,
        height,
      });
    }

    // 3. Fast Save: Use useObjectStreams for faster processing of large documents
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    
    // Convert Uint8Array directly to Base64 (faster than intermediate string)
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    
    const outputUri = `${FileSystem.cacheDirectory}${options.fileName}.pdf`;
    
    await FileSystem.writeAsStringAsync(outputUri, pdfBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return outputUri;
  } catch (error) {
    recordError(error, 'Scanner.exportToPdf');
    console.error('PDF Export Error:', error);
    throw 'EXPORT_FAILED';
  }
}
