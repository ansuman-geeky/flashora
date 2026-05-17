import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { Document, Packer, Paragraph, ImageRun } from 'docx';
import { ScannedPage, ExportOptions } from '../types/scanner';
import { recordError } from '@services/crashlytics';

export async function exportToDocx(
  pages: ScannedPage[],
  options: ExportOptions
): Promise<string> {
  try {
    const children = [];

    for (const page of pages) {
      const uri = page.enhancedUri || page.croppedUri || page.rawUri;
      const base64Img = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const imgBuffer = Buffer.from(base64Img, 'base64');
      
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: imgBuffer,
              transformation: {
                width: 600,
                height: 800,
              },
              type: 'jpg',
            }),
          ],
        })
      );
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children,
      }],
    });

    const docxBase64 = await Packer.toBase64String(doc);
    const outputUri = `${FileSystem.cacheDirectory}${options.fileName}.docx`;

    await FileSystem.writeAsStringAsync(outputUri, docxBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return outputUri;
  } catch (error) {
    recordError(error, 'Scanner.exportToDocx');
    throw 'DOCX_GENERATION_FAILED';
  }
}
