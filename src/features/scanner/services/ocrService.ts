import TextRecognition, { TextRecognitionResult } from '@react-native-ml-kit/text-recognition';

export interface OCRResult {
  text: string;
  blocks: OCRBlock[];
  confidence?: number;
}

export interface OCRBlock {
  text: string;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export class OCRService {
  /**
   * Recognizes text from a local image file using on-device ML Kit.
   */
  public static async recognize(imageUri: string): Promise<OCRResult> {
    try {
      // Ensure the URI is in the format ML Kit expects (absolute path)
      const cleanUri = imageUri.replace('file://', '');
      
      const result: TextRecognitionResult = await TextRecognition.recognize(cleanUri);

      const blocks: OCRBlock[] = (result.blocks || []).map((block) => ({
        text: block.text,
        rect: {
          top: block.frame?.top || 0,
          left: block.frame?.left || 0,
          width: block.frame?.width || 0,
          height: block.frame?.height || 0,
        },
      }));

      return {
        text: result.text || '',
        blocks,
      };
    } catch (error) {
      console.error('OCR Service Error:', error);
      return {
        text: '',
        blocks: [],
      };
    }
  }

  /**
   * Generates a searchable text overlay for PDF generation.
   */
  public static async getSearchableOverlay(imageUri: string) {
    const result = await this.recognize(imageUri);
    return result.blocks;
  }
}
