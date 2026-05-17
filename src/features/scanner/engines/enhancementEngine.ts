import { Skia, TileMode, FilterMode, MipmapMode } from '@shopify/react-native-skia';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

export type EnhancementMode =
  | 'original'
  | 'auto'
  | 'vintage'
  | 'light'
  | 'grey'
  | 'bw';

const DOCUMENT_SHADER = `
uniform shader image;
uniform shader blurred;
uniform float threshold;
uniform float contrast;
uniform float mode; // 0: color photo, 1: color document, 2: grayscale document, 3: bw document, 4: vintage

half4 main(float2 fragCoord) {
    vec4 color = image.eval(fragCoord);
    vec4 localMean = blurred.eval(fragCoord);
    
    if (mode == 0.0) {
        // Photo mode: simple contrast
        vec3 processed = clamp((color.rgb - 0.5) * contrast + 0.5, 0.0, 1.0);
        return vec4(processed, 1.0);
    }
    
    // Shadow Removal (Normalization)
    vec3 normalized = clamp(color.rgb / (localMean.rgb + 0.01), 0.0, 1.0);
    
    // Protect dark non-paper areas (like thick black borders or photos) from being turned white
    float paperness = smoothstep(0.2, 0.5, dot(localMean.rgb, vec3(0.333, 0.333, 0.333)));
    vec3 finalColor = mix(color.rgb, normalized, paperness);
    
    // Push the background to white and darken the text
    vec3 docColor = clamp((finalColor - threshold) * contrast + 0.5, 0.0, 1.0);
    
    if (mode == 1.0) {
        // Color Document
        return vec4(docColor, 1.0);
    } else if (mode == 2.0) {
        // Grayscale Document
        float intensity = dot(docColor, vec3(0.2126, 0.7152, 0.0722));
        return vec4(vec3(intensity), 1.0);
    } else if (mode == 3.0) {
        // B&W Document
        float intensity = dot(docColor, vec3(0.2126, 0.7152, 0.0722));
        return (intensity > 0.5) ? vec4(1.0, 1.0, 1.0, 1.0) : vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        // Vintage Document
        float intensity = dot(docColor, vec3(0.2126, 0.7152, 0.0722));
        vec3 sepia = mix(vec3(0.2, 0.1, 0.05), vec3(0.95, 0.9, 0.8), intensity);
        return vec4(sepia, 1.0);
    }
}
`;

export async function applyEnhancement(
  imageUri: string,
  mode: EnhancementMode
): Promise<string> {
  if (mode === 'original') return imageUri;
  
  try {
    const fileData = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const data = Skia.Data.fromBase64(fileData);
    const image = Skia.Image.MakeImageFromEncoded(data);
    if (!image) throw new Error('Failed to load image');

    const width = image.width();
    const height = image.height();

    const surface = Skia.Surface.MakeOffscreen(width, height);
    if (!surface) throw new Error('Failed to create surface');
    const canvas = surface.getCanvas();

    const runtimeEffect = Skia.RuntimeEffect.Make(DOCUMENT_SHADER);
    if (!runtimeEffect) throw new Error('Failed to compile AGSL shader');

    // Create a blurred version for shadow removal (local mean estimation)
    // We scale down significantly for speed and a large effective blur radius
    const blurScale = 0.05; 
    const bw = Math.max(1, Math.ceil(width * blurScale));
    const bh = Math.max(1, Math.ceil(height * blurScale));
    
    // 1. Downscale the image
    const downscaleSurface = Skia.Surface.MakeOffscreen(bw, bh);
    const downscaleCanvas = downscaleSurface!.getCanvas();
    downscaleCanvas.scale(blurScale, blurScale);
    downscaleCanvas.drawImage(image, 0, 0);
    const downscaledImage = downscaleSurface!.makeImageSnapshot();
    
    // 2. Apply blur to the downscaled image
    const blurSurface = Skia.Surface.MakeOffscreen(bw, bh);
    const blurCanvas = blurSurface!.getCanvas();
    const blurPaint = Skia.Paint();
    // 4px blur on 5% image = 80px effective blur radius
    blurPaint.setImageFilter(Skia.ImageFilter.MakeBlur(4, 4, TileMode.Clamp, null)); 
    blurCanvas.drawImage(downscaledImage, 0, 0, blurPaint);
    const blurredImage = blurSurface!.makeImageSnapshot();
    
    // Setup Shaders
    const imageShader = image.makeShaderOptions(
      TileMode.Clamp, 
      TileMode.Clamp, 
      FilterMode.Linear,
      MipmapMode.None,
      Skia.Matrix()
    );
    
    const blurredShader = blurredImage.makeShaderOptions(
      TileMode.Clamp, 
      TileMode.Clamp, 
      FilterMode.Linear,
      MipmapMode.None,
      Skia.Matrix().scale(1/blurScale, 1/blurScale)
    );

    // Set Parameters based on mode
    let threshold = 0.85;
    let contrast = 2.5;
    let shaderMode = 1.0;

    switch (mode) {
      case 'auto': shaderMode = 1.0; threshold = 0.85; contrast = 2.5; break;
      case 'vintage': shaderMode = 4.0; threshold = 0.85; contrast = 2.2; break;
      case 'light': shaderMode = 1.0; threshold = 0.95; contrast = 1.5; break;
      case 'grey': shaderMode = 2.0; threshold = 0.85; contrast = 2.5; break;
      case 'bw': shaderMode = 3.0; threshold = 0.85; contrast = 3.0; break;
      default: shaderMode = 1.0; threshold = 0.85; contrast = 2.5;
    }

    const finalShader = runtimeEffect.makeShaderWithChildren(
      [threshold, contrast, shaderMode],
      [imageShader, blurredShader],
      Skia.Matrix()
    );

    const paint = Skia.Paint();
    paint.setShader(finalShader);
    canvas.drawRect(Skia.XYWHRect(0, 0, width, height), paint);

    const snapshot = surface.makeImageSnapshot();
    const encoded = snapshot.encodeToBytes();
    if (!encoded) throw new Error('Failed to encode');

    const outUri = `${FileSystem.cacheDirectory}enhanced_${Date.now()}.jpg`;
    const base64 = Buffer.from(encoded).toString('base64');
    
    await FileSystem.writeAsStringAsync(outUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return outUri;
  } catch (error) {
    console.error('Enhancement Engine Error:', error);
    throw error;
  }
}
