/**
 * Local Converter Provider — Handles client-side conversions
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import { getFileInfo, type FileInfo } from '@utils/fileUtils';
import type { ConversionProvider, ConversionRequest, ConversionResult } from '../types';

export class LocalConversionProvider implements ConversionProvider {
  id = 'local';
  name = 'Device Processor';
  supportedConversions = [
    { from: 'txt' as const, to: 'pdf' as const },
  ];

  async convert(request: ConversionRequest): Promise<ConversionResult> {
    const { inputFile, targetFormat } = request;

    if (inputFile.mimeType === 'text/plain' && targetFormat === 'pdf') {
      return this.txtToPdf(inputFile);
    }

    throw new Error(`Unsupported local conversion: ${inputFile.mimeType} to ${targetFormat}`);
  }

  private async txtToPdf(file: FileInfo): Promise<ConversionResult> {
    try {
      const content = await FileSystem.readAsStringAsync(file.uri);
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const fontSize = 12;
      const margin = 50;

      // Simple text wrapping (very basic)
      const lines = content.split('\n');
      let y = height - margin;

      for (const line of lines) {
        if (y < margin) {
          pdfDoc.addPage();
          y = height - margin;
        }
        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        y -= fontSize + 5;
      }

      const pdfBytes = await pdfDoc.saveAsBase64();
      const outputUri = `${FileSystem.cacheDirectory}${file.name.replace('.txt', '')}.pdf`;
      await FileSystem.writeAsStringAsync(outputUri, pdfBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const outputFile = await getFileInfo(outputUri);
      return { outputFile, success: true };
    } catch (error) {
      return { 
        outputFile: file, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during conversion' 
      };
    }
  }
}
