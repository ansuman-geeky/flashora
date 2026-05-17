import { DocumentQuad } from '../types/scanner';
import { recordError } from '@services/crashlytics';

export interface EdgeDetectionResult {
  quad: DocumentQuad;
  confidence: number;
}

export async function detectDocumentEdges(
  imageUri: string,
  imageWidth: number,
  imageHeight: number
): Promise<EdgeDetectionResult> {
  try {
    // Currently using a fallback heuristic as real ML detection via vision-camera-document-scanner 
    // is unavailable or requires native plugin support.
    // Basic fallback: return a quad that is 80% of the image size centered.
    const paddingX = imageWidth * 0.1;
    const paddingY = imageHeight * 0.1;
    
    return {
      quad: {
        topLeft: { x: paddingX, y: paddingY },
        topRight: { x: imageWidth - paddingX, y: paddingY },
        bottomRight: { x: imageWidth - paddingX, y: imageHeight - paddingY },
        bottomLeft: { x: paddingX, y: imageHeight - paddingY },
      },
      confidence: 0.5, // low confidence -> prompt user to adjust manually
    };
  } catch (error) {
    recordError(error, 'Scanner.detectDocumentEdges');
    // Absolute fallback: full image
    return {
      quad: {
        topLeft: { x: 0, y: 0 },
        topRight: { x: imageWidth, y: 0 },
        bottomRight: { x: imageWidth, y: imageHeight },
        bottomLeft: { x: 0, y: imageHeight },
      },
      confidence: 0.0,
    };
  }
}
