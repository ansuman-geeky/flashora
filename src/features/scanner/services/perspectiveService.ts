import * as ImageManipulator from 'expo-image-manipulator';
import { DocumentQuad } from '../types/scanner';
import { recordError } from '@services/crashlytics';

export async function applyPerspectiveCorrection(
  imageUri: string,
  quad: DocumentQuad,
  imageWidth: number,
  imageHeight: number,
  rotation: number = 0
): Promise<string> {
  try {
    const actions: any[] = [];
    const MAX_DIMENSION = 2000;
    
    let scale = 1;
    if (imageWidth > MAX_DIMENSION || imageHeight > MAX_DIMENSION) {
      scale = MAX_DIMENSION / Math.max(imageWidth, imageHeight);
    }

    const currentWidth = Math.floor(imageWidth * scale);
    const currentHeight = Math.floor(imageHeight * scale);

    if (scale < 1) {
      actions.push({ resize: { width: currentWidth, height: currentHeight } });
    }

    // Calculate crop area relative to original dimensions, then scale
    const minX = Math.min(quad.topLeft.x, quad.topRight.x, quad.bottomRight.x, quad.bottomLeft.x);
    const minY = Math.min(quad.topLeft.y, quad.topRight.y, quad.bottomRight.y, quad.bottomLeft.y);
    const maxX = Math.max(quad.topLeft.x, quad.topRight.x, quad.bottomRight.x, quad.bottomLeft.x);
    const maxY = Math.max(quad.topLeft.y, quad.topRight.y, quad.bottomRight.y, quad.bottomLeft.y);

    const cropWidth = Math.max(10, maxX - minX);
    const cropHeight = Math.max(10, maxY - minY);

    actions.push({
      crop: {
        originX: Math.floor(minX * scale),
        originY: Math.floor(minY * scale),
        width: Math.min(Math.floor(cropWidth * scale), currentWidth),
        height: Math.min(Math.floor(cropHeight * scale), currentHeight),
      }
    });

    const finalResult = await ImageManipulator.manipulateAsync(
      imageUri,
      actions,
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    return finalResult.uri;
  } catch (error) {
    recordError(error, 'Scanner.applyPerspectiveCorrection');
    throw 'PERSPECTIVE_FAILED';
  }
}
