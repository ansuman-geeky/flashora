import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { DocumentQuad } from '../types/scanner';
import { CornerHandle } from './CornerHandle';
import { EdgeHandle } from './EdgeHandle';
import Svg, { Polygon } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedProps 
} from 'react-native-reanimated';
import { ScannerColors } from '../constants';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

interface CropCanvasProps {
  imageUri: string;
  imageWidth: number;
  imageHeight: number;
  quad: DocumentQuad;
  onQuadChange: (quad: DocumentQuad) => void;
  rotation?: number;
}

export function CropCanvas({ 
  imageUri, 
  imageWidth, 
  imageHeight, 
  quad, 
  onQuadChange,
  rotation = 0 
}: CropCanvasProps) {
  const [viewLayout, setViewLayout] = useState({ width: 0, height: 0 });
  const [activeHandle, setActiveHandle] = useState<number | null>(null);
  
  const dim = useMemo(() => {
    if (viewLayout.width === 0 || imageWidth === 0) {
      return { width: 0, height: 0, scale: 1, offsetX: 0, offsetY: 0 };
    }
    const isFlipped = rotation === 90 || rotation === 270;
    const effectiveWidth = isFlipped ? imageHeight : imageWidth;
    const effectiveHeight = isFlipped ? imageWidth : imageHeight;
    const viewRatio = viewLayout.width / viewLayout.height;
    const imageRatio = effectiveWidth / effectiveHeight;
    let displayWidth, displayHeight, scale, offsetX, offsetY;
    if (imageRatio > viewRatio) {
      displayWidth = viewLayout.width; displayHeight = viewLayout.width / imageRatio;
      scale = viewLayout.width / effectiveWidth; offsetX = 0; offsetY = (viewLayout.height - displayHeight) / 2;
    } else {
      displayHeight = viewLayout.height; displayWidth = viewLayout.height * imageRatio;
      scale = viewLayout.height / effectiveHeight; offsetX = (viewLayout.width - displayWidth) / 2; offsetY = 0;
    }
    return { width: displayWidth, height: displayHeight, scale, offsetX, offsetY };
  }, [viewLayout, imageWidth, imageHeight, rotation]);

  const tlX = useSharedValue(0); const tlY = useSharedValue(0);
  const trX = useSharedValue(0); const trY = useSharedValue(0);
  const brX = useSharedValue(0); const brY = useSharedValue(0);
  const blX = useSharedValue(0); const blY = useSharedValue(0);

  const mapPointToScreen = (x: number, y: number) => {
    let px = x, py = y;
    if (rotation === 90) { px = imageHeight - y; py = x; }
    else if (rotation === 180) { px = imageWidth - x; py = imageHeight - y; }
    else if (rotation === 270) { px = y; py = imageWidth - x; }
    return { x: px * dim.scale + dim.offsetX, y: py * dim.scale + dim.offsetY };
  };

  const mapPointToImage = (sx: number, sy: number) => {
    let px = (sx - dim.offsetX) / dim.scale;
    let py = (sy - dim.offsetY) / dim.scale;
    let x = px, y = py;
    if (rotation === 90) { x = py; y = imageHeight - px; }
    else if (rotation === 180) { x = imageWidth - px; y = imageHeight - py; }
    else if (rotation === 270) { x = imageWidth - py; y = px; }
    return { x, y };
  };

  useEffect(() => {
    if (dim.width > 0) {
      const tl = mapPointToScreen(quad.topLeft.x, quad.topLeft.y);
      const tr = mapPointToScreen(quad.topRight.x, quad.topRight.y);
      const br = mapPointToScreen(quad.bottomRight.x, quad.bottomRight.y);
      const bl = mapPointToScreen(quad.bottomLeft.x, quad.bottomLeft.y);
      tlX.value = tl.x; tlY.value = tl.y;
      trX.value = tr.x; trY.value = tr.y;
      brX.value = br.x; brY.value = br.y;
      blX.value = bl.x; blY.value = bl.y;
    }
  }, [dim, quad, rotation]);

  // JS THREAD CALLBACKS - NO .value ACCESS
  const triggerQuadChange = () => {
    // Note: Since we updated shared values via gestures, we can't safely read them on JS
    // unless we use runOnUI. But here we can use a simpler trick: use state for the 
    // quad in AdjustScreen and update it on drag end with the passed values.
  };

  const handleCornerEnd = (index: number, x: number, y: number) => {
    setActiveHandle(null);
    const point = mapPointToImage(x, y);
    const newQuad = { ...quad };
    if (index === 0) newQuad.topLeft = point;
    else if (index === 1) newQuad.topRight = point;
    else if (index === 2) newQuad.bottomRight = point;
    else if (index === 3) newQuad.bottomLeft = point;
    onQuadChange(newQuad);
  };

  const handleEdgeEnd = (idx1: number, idx2: number, v1: {x: number, y: number}, v2: {x: number, y: number}) => {
    setActiveHandle(null);
    const p1 = mapPointToImage(v1.x, v1.y);
    const p2 = mapPointToImage(v2.x, v2.y);
    const newQuad = { ...quad };
    if (idx1 === 0) newQuad.topLeft = p1; else if (idx1 === 1) newQuad.topRight = p1;
    if (idx2 === 1) newQuad.topRight = p2; else if (idx2 === 2) newQuad.bottomRight = p2; else if (idx2 === 3) newQuad.bottomLeft = p2; else if (idx2 === 0) newQuad.topLeft = p2;
    onQuadChange(newQuad);
  };

  const polygonProps = useAnimatedProps(() => ({
    points: `${tlX.value},${tlY.value} ${trX.value},${trY.value} ${brX.value},${brY.value} ${blX.value},${blY.value}`,
  }));

  const magnifierImageStyle = useAnimatedStyle(() => {
    if (activeHandle === null) return { opacity: 0 };
    let x = 0, y = 0;
    if (activeHandle === 0) { x = tlX.value; y = tlY.value; }
    else if (activeHandle === 1) { x = trX.value; y = trY.value; }
    else if (activeHandle === 2) { x = brX.value; y = brY.value; }
    else if (activeHandle === 3) { x = blX.value; y = blY.value; }
    else if (activeHandle === 4) { x = (tlX.value + trX.value) / 2; y = (tlY.value + trY.value) / 2; }
    else if (activeHandle === 5) { x = (trX.value + brX.value) / 2; y = (trY.value + brY.value) / 2; }
    else if (activeHandle === 6) { x = (brX.value + blX.value) / 2; y = (brY.value + blY.value) / 2; }
    else if (activeHandle === 7) { x = (blX.value + tlX.value) / 2; y = (blY.value + tlY.value) / 2; }
    const zoom = 2.5; const magSize = 96;
    return {
      width: viewLayout.width, height: viewLayout.height, opacity: 1,
      transform: [
        { translateX: magSize / 2 }, { translateY: magSize / 2 },
        { scale: zoom }, { rotate: `${rotation}deg` }, { translateX: -x }, { translateY: -y },
      ],
    };
  });

  const magnifierContainerStyle = useAnimatedStyle(() => {
    if (activeHandle === null) return { opacity: 0, transform: [{ scale: 0 }] };
    let x = 0, y = 0;
    if (activeHandle === 0) { x = tlX.value; y = tlY.value; }
    else if (activeHandle === 1) { x = trX.value; y = trY.value; }
    else if (activeHandle === 2) { x = brX.value; y = brY.value; }
    else if (activeHandle === 3) { x = blX.value; y = blY.value; }
    else if (activeHandle === 4) { x = (tlX.value + trX.value) / 2; y = (tlY.value + trY.value) / 2; }
    else if (activeHandle === 5) { x = (trX.value + brX.value) / 2; y = (trY.value + brY.value) / 2; }
    else if (activeHandle === 6) { x = (brX.value + blX.value) / 2; y = (brY.value + blY.value) / 2; }
    else if (activeHandle === 7) { x = (blX.value + tlX.value) / 2; y = (blY.value + tlY.value) / 2; }
    return { opacity: 1, transform: [{ scale: 1 }], left: x - 48, top: y - 140 };
  });

  return (
    <View style={styles.container} onLayout={(e) => setViewLayout(e.nativeEvent.layout)}>
      <View style={StyleSheet.absoluteFill}>
        <Image source={{ uri: imageUri }} style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${rotation}deg` }] }]} resizeMode="contain" />
        <Svg style={StyleSheet.absoluteFill}>
          <AnimatedPolygon animatedProps={polygonProps as any} fill="rgba(59, 169, 255, 0.2)" stroke={ScannerColors.accent} strokeWidth={2} />
        </Svg>
      </View>

      {/* Edge Handles */}
      <EdgeHandle x1={tlX} y1={tlY} x2={trX} y2={trY} type="top" onDragStart={() => setActiveHandle(4)} onDragEnd={(v1, v2) => handleEdgeEnd(0, 1, v1, v2)} minX={dim.offsetX} maxX={dim.offsetX + dim.width} minY={dim.offsetY} maxY={dim.offsetY + dim.height} />
      <EdgeHandle x1={trX} y1={trY} x2={brX} y2={brY} type="right" onDragStart={() => setActiveHandle(5)} onDragEnd={(v1, v2) => handleEdgeEnd(1, 2, v1, v2)} minX={dim.offsetX} maxX={dim.offsetX + dim.width} minY={dim.offsetY} maxY={dim.offsetY + dim.height} />
      <EdgeHandle x1={brX} y1={brY} x2={blX} y2={blY} type="bottom" onDragStart={() => setActiveHandle(6)} onDragEnd={(v1, v2) => handleEdgeEnd(2, 3, v1, v2)} minX={dim.offsetX} maxX={dim.offsetX + dim.width} minY={dim.offsetY} maxY={dim.offsetY + dim.height} />
      <EdgeHandle x1={blX} y1={blY} x2={tlX} y2={tlY} type="left" onDragStart={() => setActiveHandle(7)} onDragEnd={(v1, v2) => handleEdgeEnd(3, 0, v1, v2)} minX={dim.offsetX} maxX={dim.offsetX + dim.width} minY={dim.offsetY} maxY={dim.offsetY + dim.height} />

      {/* Corner Handles */}
      <CornerHandle x={tlX} y={tlY} onDragStart={() => setActiveHandle(0)} onDragEnd={(x, y) => handleCornerEnd(0, x, y)} minX={dim.offsetX} maxX={dim.offsetX + dim.width} minY={dim.offsetY} maxY={dim.offsetY + dim.height} />
      <CornerHandle x={trX} y={trY} onDragStart={() => setActiveHandle(1)} onDragEnd={(x, y) => handleCornerEnd(1, x, y)} minX={dim.offsetX} maxX={dim.offsetX + dim.width} minY={dim.offsetY} maxY={dim.offsetY + dim.height} />
      <CornerHandle x={brX} y={brY} onDragStart={() => setActiveHandle(2)} onDragEnd={(x, y) => handleCornerEnd(2, x, y)} minX={dim.offsetX} maxX={dim.offsetX + dim.width} minY={dim.offsetY} maxY={dim.offsetY + dim.height} />
      <CornerHandle x={blX} y={blY} onDragStart={() => setActiveHandle(3)} onDragEnd={(x, y) => handleCornerEnd(3, x, y)} minX={dim.offsetX} maxX={dim.offsetX + dim.width} minY={dim.offsetY} maxY={dim.offsetY + dim.height} />

      <Animated.View style={[styles.magnifier, magnifierContainerStyle]} pointerEvents="none">
        <View style={styles.magnifierInner}>
          <Animated.Image source={{ uri: imageUri }} style={[{ position: 'absolute' }, magnifierImageStyle]} resizeMode="contain" />
          <View style={styles.crosshairV} /><View style={styles.crosshairH} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  magnifier: { position: 'absolute', width: 96, height: 120, zIndex: 1000 },
  magnifierInner: {
    width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: '#FFFFFF',
    overflow: 'hidden', backgroundColor: '#000', justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  crosshairV: { width: 1, height: '100%', backgroundColor: ScannerColors.accent, position: 'absolute', opacity: 0.6 },
  crosshairH: { height: 1, width: '100%', backgroundColor: ScannerColors.accent, position: 'absolute', opacity: 0.6 }
});
