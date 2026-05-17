import { useState } from 'react';
import { DocumentQuad, Corner } from '../types/scanner';

export function useCropGestures(initialQuad: DocumentQuad | null) {
  const [quad, setQuad] = useState<DocumentQuad | null>(initialQuad);

  const updateCorner = (cornerKey: keyof DocumentQuad, position: Corner) => {
    if (!quad) return;
    setQuad(prev => prev ? ({ ...prev, [cornerKey]: position }) : null);
  };

  return { quad, updateCorner, setQuad };
}
