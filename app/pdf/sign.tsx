/**
 * Sign PDF Screen — Pick PDF → Draw/Upload Signature → Drag over preview → Apply
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, ScrollView, Text, Image, Dimensions, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { FilePickerButton, FileList, ProcessingView, ResultView } from '@features/pdf/components';
import { pickPdfFiles, pickImageFiles, signPdf, shareFile } from '@features/pdf/services';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useTheme } from '@hooks/useTheme';
import { useRouter } from 'expo-router';
import type { FileInfo } from '@utils/fileUtils';
import { PdfProcessorModule } from '../../src/native/PdfProcessor';

import { Canvas, Path, Skia, useCanvasRef, useTouchHandler, SkPath } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import { Modal } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PdfSignScreen() {
  const { colors, isDark } = useTheme();
  const [file, setFile] = useState<FileInfo | null>(null);
  
  // Preview
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Signature Image (base64 or file uri)
  const [signatureUri, setSignatureUri] = useState<string | null>(null);
  const [isSignatureModalVisible, setSignatureModalVisible] = useState(false);

  // Skia Drawing State
  const canvasRef = useCanvasRef();
  const [paths, setPaths] = useState<SkPath[]>([]);
  const currentPath = useRef<SkPath | null>(null);

  // Drag state
  const sigX = useSharedValue(50);
  const sigY = useSharedValue(50);
  const sigScale = useSharedValue(1);

  const processor = useToolProcessor({ toolId: 'pdf_sign', toolName: 'Sign PDF', category: 'pdf' });
  const router = useRouter();

  // Load preview
  useEffect(() => {
    if (!file || !PdfProcessorModule) return;
    let mounted = true;
    const loadPreview = async () => {
      setPreviewLoading(true);
      try {
        const thumbs = PdfProcessorModule ? await PdfProcessorModule.renderPageThumbnails(file.uri) : null;
        if (mounted && thumbs && thumbs.length > 0) {
          setPreviewUri(`file://${thumbs[0]}`);
        }
      } catch (e) {
        console.warn('Failed to load preview', e);
      } finally {
        if (mounted) setPreviewLoading(false);
      }
    };
    void loadPreview();
    return () => { mounted = false; };
  }, [file]);

  const handlePick = useCallback(async () => {
    const picked = await pickPdfFiles(false);
    if (picked?.[0]) setFile(picked[0]);
  }, []);

  const handleUploadSignature = useCallback(async () => {
    const picked = await pickImageFiles();
    if (picked?.[0]) {
      setSignatureUri(picked[0].uri);
      setSignatureModalVisible(false);
    }
  }, []);

  const handleSaveSignature = useCallback(async () => {
    const image = canvasRef.current?.makeImageSnapshot();
    if (image) {
      const base64 = image.encodeToBase64();
      const uri = `${FileSystem.cacheDirectory}drawn_sig_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(uri, base64, { encoding: 'base64' });
      setSignatureUri(uri);
      setSignatureModalVisible(false);
    }
  }, [canvasRef]);

  const handleClearSignature = useCallback(() => {
    setPaths([]);
    currentPath.current = null;
  }, []);

  const touchHandler = useTouchHandler({
    onStart: ({ x, y }) => {
      currentPath.current = Skia.Path.Make();
      currentPath.current.moveTo(x, y);
    },
    onActive: ({ x, y }) => {
      if (currentPath.current) {
        currentPath.current.lineTo(x, y);
        // Force re-render by replacing the array
        setPaths(prev => {
            const arr = [...prev];
            if (currentPath.current) arr[arr.length - 1] = currentPath.current;
            return arr;
        });
      }
    },
    onEnd: () => {
      if (currentPath.current) {
        setPaths(prev => [...prev, currentPath.current!]);
        currentPath.current = null;
      }
    },
  });

  // Gestures for signature
  const panGesture = Gesture.Pan()
    .onChange((e) => {
      sigX.value += e.changeX;
      sigY.value += e.changeY;
    });
    
  const pinchGesture = Gesture.Pinch()
    .onChange((e) => {
      sigScale.value *= e.scaleChange;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: sigX.value },
        { translateY: sigY.value },
        { scale: sigScale.value }
      ]
    };
  });

  const handleApply = useCallback(() => {
    if (!file || !signatureUri || !previewUri) return;
    
    // We assume the preview is 300px wide (from UI rendering)
    // We need to map the visual x, y coordinates to the PDF points
    // Let's use an approximate mapping: 
    // PDF typical page size is A4: 595 x 842 points.
    const pdfPageWidth = 595;
    const pdfPageHeight = 842;
    
    const uiPreviewWidth = SCREEN_WIDTH - 32; // padding
    const uiPreviewHeight = (uiPreviewWidth * 842) / 595; // Maintain A4 aspect ratio in UI

    const relativeX = sigX.value / uiPreviewWidth;
    const relativeY = sigY.value / uiPreviewHeight;
    const relativeScale = sigScale.value;

    const signatureBaseWidth = 100;
    const signatureBaseHeight = 50;
    
    const pdfSigWidth = signatureBaseWidth * relativeScale;
    const pdfSigHeight = signatureBaseHeight * relativeScale;
    
    const pdfX = relativeX * pdfPageWidth;
    // PDF-lib's Y-axis is inverted (0,0 is bottom left)
    const pdfY = pdfPageHeight - (relativeY * pdfPageHeight) - pdfSigHeight;

    void processor.execute(() => signPdf(
      file, 
      signatureUri, 
      0, // Currently defaulting to page 1 (index 0)
      pdfX, 
      pdfY, 
      pdfSigWidth, 
      pdfSigHeight
    ));
  }, [file, signatureUri, previewUri, sigX, sigY, sigScale, processor]);

  const handleReset = useCallback(() => { 
    setFile(null); 
    setPreviewUri(null);
    setSignatureUri(null);
    setPaths([]);
    processor.reset(); 
  }, [processor]);

  if (processor.status === 'processing') {
    return (
      <SafeAreaView className="flex-1" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Sign PDF" showBack={true} />
        <ProcessingView toolName="Sign PDF" progress={processor.progress} />
      </SafeAreaView>
    );
  }

  if (processor.status === 'completed' && processor.result) {
    return (
      <SafeAreaView className="flex-1" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Sign PDF" />
        <ResultView 
          result={processor.result} 
          onShare={(u) => { void shareFile(u); }} 
          onBackToTools={() => router.replace('/(tabs)/tools')} 
          onProcessAnother={handleReset} 
          toolName="Sign PDF" 
        />
      </SafeAreaView>
    );
  }

  const surfaceColor = isDark ? '#161A23' : colors.surface;

  return (
    <SafeAreaView
      className="flex-1"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScreenHeader title="Sign PDF" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {processor.error && (
          <View className="px-2 mb-2">
            <ErrorDisplay 
              errorCode={processor.error.code} 
              onRetry={handleReset} 
              onDismiss={() => processor.reset()} 
            />
          </View>
        )}
        
        {!file ? (
          <FilePickerButton 
            label="Select PDF" 
            description="Choose a document to sign" 
            onPress={handlePick} 
          />
        ) : (
          <View className="px-2">
            <FileList files={[file]} />
            
            {previewLoading ? (
              <View style={[styles.previewContainer, { backgroundColor: surfaceColor, justifyContent: 'center' }]}>
                <ActivityIndicator color={colors.primary} />
                <Text style={{ color: colors.onSurfaceVariant, marginTop: 8 }}>Loading preview...</Text>
              </View>
            ) : previewUri ? (
              <View style={{ marginTop: 16 }}>
                <Text style={{ color: colors.onSurfaceVariant, marginBottom: 8, fontSize: 12 }}>
                  Drag to move • Pinch to resize
                </Text>
                <View style={[styles.previewContainer, { backgroundColor: surfaceColor, height: ((SCREEN_WIDTH - 32) * 842) / 595 }]}>
                  <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
                  
                  {signatureUri && (
                    <GestureDetector gesture={Gesture.Simultaneous(panGesture, pinchGesture)}>
                      <Animated.View style={[styles.signatureOverlay, animatedStyle]}>
                        <Image source={{ uri: signatureUri }} style={styles.signatureImage} resizeMode="contain" />
                      </Animated.View>
                    </GestureDetector>
                  )}
                </View>
              </View>
            ) : null}

            <View style={{ marginTop: 16, gap: 12 }}>
              {!signatureUri ? (
                <Button 
                  label="Create Signature" 
                  variant="outline" 
                  fullWidth 
                  onPress={() => setSignatureModalVisible(true)} 
                />
              ) : (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Button 
                      label="Change Signature" 
                      variant="outline" 
                      fullWidth 
                      onPress={() => setSignatureModalVisible(true)} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button 
                      label="Apply & Save" 
                      variant="primary" 
                      fullWidth 
                      onPress={handleApply} 
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isSignatureModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSignatureModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={[styles.sheetContent, { backgroundColor: surfaceColor, maxHeight: '60%', borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}>
            <Text style={[styles.sheetTitle, { color: colors.onSurface }]}>Add Signature</Text>
            
            <View style={[styles.canvasContainer, { borderColor: colors.outlineVariant }]}>
              <Canvas style={{ flex: 1 }} onTouch={touchHandler} ref={canvasRef}>
                {paths.map((p, i) => (
                  <Path key={i} path={p} color={isDark ? "white" : "black"} style="stroke" strokeWidth={3} strokeJoin="round" strokeCap="round" />
                ))}
              </Canvas>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <Pressable onPress={handleClearSignature}>
                <Text style={{ color: colors.error, fontWeight: '500' }}>Clear</Text>
              </Pressable>
              <Pressable onPress={handleUploadSignature}>
                <Text style={{ color: colors.primary, fontWeight: '500' }}>Upload Image instead</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 24, gap: 12 }}>
              <Button label="Use Signature" variant="primary" fullWidth onPress={handleSaveSignature} />
              <Button label="Cancel" variant="outline" fullWidth onPress={() => setSignatureModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  previewContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  signatureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 50,
  },
  signatureImage: {
    width: '100%',
    height: '100%',
  },
  sheetContent: {
    padding: 20,
    flex: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  canvasContainer: {
    height: 200,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    overflow: 'hidden',
  }
});
