import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  SharedValue
} from 'react-native-reanimated';
import { AutoCaptureState } from '../engines/autoCaptureEngine';

interface EdgeOverlayProps {
  // Individual primitive SharedValues to avoid object proxying issues
  tlX: SharedValue<number>; tlY: SharedValue<number>;
  trX: SharedValue<number>; trY: SharedValue<number>;
  brX: SharedValue<number>; brY: SharedValue<number>;
  blX: SharedValue<number>; blY: SharedValue<number>;
  confidence: SharedValue<number>;
  width: number;
  height: number;
  state: AutoCaptureState;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function EdgeOverlay({ 
  tlX, tlY, trX, trY, brX, brY, blX, blY, 
  confidence, width, height, state 
}: EdgeOverlayProps) {
  
  const animatedProps = useAnimatedProps(() => {
    'worklet';
    
    if (tlX.value === 0 && trX.value === 0) {
      return { d: '', stroke: 'transparent', fill: 'transparent', strokeWidth: 0 };
    }

    const d = `M ${tlX.value} ${tlY.value} 
               L ${trX.value} ${trY.value} 
               L ${brX.value} ${brY.value} 
               L ${blX.value} ${blY.value} Z`;

    const isActive = confidence.value > 0.7 || state === 'STABILIZING';
    const strokeColor = isActive ? '#3BA9FF' : 'rgba(255,255,255,0.4)';
    const fillColor = state === 'STABILIZING' ? 'rgba(59, 169, 255, 0.2)' : 'rgba(59, 169, 255, 0.1)';

    return {
      d,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: state === 'STABILIZING' ? 2.5 : 1.5,
    };
  }, [state]);

  const renderGuides = () => {
    if (state !== 'SCANNING') return null;
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.topGuide}>
          <Text style={styles.guideText}>Fit into screen and snap</Text>
        </View>
        <View style={styles.bottomGuide}>
          <Text style={styles.statusText}>Searching for document</Text>
        </View>
        <View style={[styles.corner, styles.tl, { top: height * 0.2, left: width * 0.1 }]} />
        <View style={[styles.corner, styles.tr, { top: height * 0.2, right: width * 0.1 }]} />
        <View style={[styles.corner, styles.bl, { top: height * 0.7, left: width * 0.1 }]} />
        <View style={[styles.corner, styles.br, { top: height * 0.7, right: width * 0.1 }]} />
      </View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {renderGuides()}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <AnimatedPath animatedProps={animatedProps} />
      </Svg>
      {state === 'STABILIZING' && (
        <View style={[styles.stabilizingPill, { top: height * 0.15 }]}>
          <Text style={styles.stabilizingText}>Hold steady...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topGuide: { position: 'absolute', top: 120, left: 0, right: 0, alignItems: 'center' },
  guideText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
  bottomGuide: { position: 'absolute', bottom: 220, left: 0, right: 0, alignItems: 'center' },
  statusText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: 'rgba(255,255,255,0.4)' },
  tl: { borderLeftWidth: 2, borderTopWidth: 2 },
  tr: { borderRightWidth: 2, borderTopWidth: 2 },
  bl: { borderLeftWidth: 2, borderBottomWidth: 2 },
  br: { borderRightWidth: 2, borderBottomWidth: 2 },
  stabilizingPill: { position: 'absolute', alignSelf: 'center', backgroundColor: '#3BA9FF', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, zIndex: 100 },
  stabilizingText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
