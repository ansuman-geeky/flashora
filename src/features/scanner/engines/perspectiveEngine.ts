import { Skia } from '@shopify/react-native-skia';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { DocumentQuad } from '../types/scanner';

export interface PerspectiveOptions {
  quad: DocumentQuad;
  outputWidth: number;
  outputHeight: number;
  qualityPreset: 'standard' | 'high' | 'archival';
}

const QUALITY_CONFIG = {
  standard: { width: 1240, height: 1754, quality: 80 },
  high: { width: 2480, height: 3508, quality: 90 },
  archival: { width: 3508, height: 4960, quality: 100 },
};

function computeHomography(src: {x: number, y: number}[], dst: {x: number, y: number}[]): number[] {
  const a: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const s = src[i];
    const d = dst[i];
    if (!s || !d) continue;
    
    const { x, y } = s;
    const { x: u, y: v } = d;
    
    a.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    a.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  
  for (let i = 0; i < 8; i++) {
    let pivot = i;
    for (let j = i + 1; j < 8; j++) {
      if (Math.abs(a[j]![i]!) > Math.abs(a[pivot]![i]!)) pivot = j;
    }
    const temp = a[i]!;
    a[i] = a[pivot]!;
    a[pivot] = temp;
    
    for (let j = i + 1; j < 8; j++) {
      const rowJ = a[j]!;
      const rowI = a[i]!;
      const factor = rowJ[i]! / rowI[i]!;
      for (let k = i; k < 9; k++) {
        rowJ[k] = rowJ[k]! - factor * rowI[k]!;
      }
    }
  }
  
  const h = new Array(9).fill(0);
  h[8] = 1;
  for (let i = 7; i >= 0; i--) {
    let sum = 0;
    const rowI = a[i]!;
    for (let j = i + 1; j < 8; j++) {
      sum += rowI[j]! * h[j]!;
    }
    h[i] = (rowI[8]! - sum) / rowI[i]!;
  }
  return h;
}

export async function applyPerspectiveCorrection(
  imageUri: string,
  options: PerspectiveOptions
): Promise<string> {
  try {
    const config = QUALITY_CONFIG[options.qualityPreset];
    const outW = options.outputWidth || config.width;
    const outH = options.outputHeight || config.height;

    const fileData = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const data = Skia.Data.fromBase64(fileData);
    const image = Skia.Image.MakeImageFromEncoded(data);
    
    if (!image) throw new Error('Failed to load image into Skia');

    const src = [
      options.quad.topLeft,
      options.quad.topRight,
      options.quad.bottomRight,
      options.quad.bottomLeft,
    ];
    const dst = [
      { x: 0, y: 0 },
      { x: outW, y: 0 },
      { x: outW, y: outH },
      { x: 0, y: outH },
    ];

    const h = computeHomography(src, dst);
    const matrix = Skia.Matrix(h);

    const surface = Skia.Surface.MakeOffscreen(outW, outH);
    if (!surface) throw new Error('Failed to create Skia surface');
    const canvas = surface.getCanvas();
    canvas.clear(Skia.Color('white'));

    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    
    canvas.save();
    canvas.concat(matrix);
    canvas.drawImage(image, 0, 0, paint);
    canvas.restore();

    const snapshot = surface.makeImageSnapshot();
    const encoded = snapshot.encodeToBytes();
    if (!encoded) throw new Error('Failed to encode image');

    const outUri = `${FileSystem.cacheDirectory}corrected_${Date.now()}.jpg`;
    const base64 = Buffer.from(encoded).toString('base64');
    
    await FileSystem.writeAsStringAsync(outUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return outUri;
  } catch (error) {
    console.error('Perspective Engine Error:', error);
    throw error;
  }
}
