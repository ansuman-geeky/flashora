import { useFrameProcessor } from 'react-native-vision-camera';
import { useSharedValue, useRunOnJS } from 'react-native-worklets-core';
import { DocumentQuad } from '../types/scanner';
import { DetectionResult, computeWarnings } from './detectionEngine';

// Native frame processor plugin
let scanDocument: any;
try {
  scanDocument = require('vision-camera-document-scanner').scanDocument;
} catch (e) {
  scanDocument = (frame: any) => {
    'worklet';
    return { found: false };
  };
}

export function useDocumentFrameProcessor(
  onDetection: (result: DetectionResult) => void,
  isAutoSnap: boolean,
  updateUI: (corners: any | null, confidence: number, shouldSnap: boolean, resultObj?: any) => void
) {
  // Create JS-bound functions that the Worklets-Core frame processor can call safely
  const updateUIJS = useRunOnJS(updateUI, [updateUI]);
  const onDetectionJS = useRunOnJS(onDetection, [onDetection]);

  // Internal state for the frame processor (must use Worklets-Core for cross-frame persistence)
  const stableFrames = useSharedValue(0);
  const lastTlX = useSharedValue(0);
  const lastTlY = useSharedValue(0);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    const result = scanDocument(frame);

    if (result && result.found) {
      const corners = result.corners;

      const dist = Math.sqrt(
        Math.pow(corners.topLeft.x - lastTlX.value, 2) + 
        Math.pow(corners.topLeft.y - lastTlY.value, 2)
      );
      
      const isStable = dist < 12;
      stableFrames.value = isStable ? stableFrames.value + 1 : 0;
      
      lastTlX.value = corners.topLeft.x;
      lastTlY.value = corners.topLeft.y;
      
      const conf = result.confidence ?? 0.8;
      
      let shouldSnap = false;

      if (isAutoSnap && isStable && conf > 0.75) {
        if (stableFrames.value >= 25) { 
          shouldSnap = true;
          stableFrames.value = 0;
        }
      } else if (!isAutoSnap) {
        stableFrames.value = 0;
      }
      
      // Pass the primitive data back to the JS thread to update Reanimated safely
      updateUIJS(corners, conf, shouldSnap, result);
      
      if (shouldSnap) {
        onDetectionJS({
          quad: corners,
          frameWidth: frame.width,
          frameHeight: frame.height,
          confidence: conf,
          isStable: true,
          stableFrames: 25,
          blurScore: result.blurScore ?? 0.9,
          lightingScore: result.lightingScore ?? 0.8,
          warnings: computeWarnings(result),
        });
      }

    } else {
      stableFrames.value = 0;
      updateUIJS(null, 0, false);
    }
  }, [isAutoSnap, updateUIJS, onDetectionJS]);

  return frameProcessor;
}
