import { useState, useCallback } from 'react';
import { DocumentQuad } from '../types/scanner';
import { detectDocumentEdges } from '../services/edgeDetectionService';

export function useEdgeDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedQuad, setDetectedQuad] = useState<DocumentQuad | null>(null);

  const detectEdges = useCallback(async (uri: string, width: number, height: number) => {
    setIsDetecting(true);
    try {
      const result = await detectDocumentEdges(uri, width, height);
      setDetectedQuad(result.quad);
      return result;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  return {
    isDetecting,
    detectedQuad,
    setDetectedQuad,
    detectEdges,
  };
}
