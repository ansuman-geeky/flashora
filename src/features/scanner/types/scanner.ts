export type EnhancementMode =
  | 'auto'
  | 'bw'
  | 'grayscale'
  | 'photo'
  | 'whiteboard';

export type ExportFormat = 'pdf' | 'jpg' | 'png' | 'docx';

export type ExportQuality = 'standard' | 'high';

export interface Corner {
  x: number;
  y: number;
}

export interface DocumentQuad {
  topLeft:     Corner;
  topRight:    Corner;
  bottomRight: Corner;
  bottomLeft:  Corner;
}

export interface ScannedPage {
  id:              string;
  rawUri:          string;    // Original captured image URI
  croppedUri:      string;    // After perspective correction
  enhancedUri:     string;    // After enhancement
  quad:            DocumentQuad;
  enhancementMode: EnhancementMode;
  capturedAt:      number;    // timestamp
}

export interface ScanSession {
  id:        string;
  pages:     ScannedPage[];
  createdAt: number;
}

export interface ExportOptions {
  format:   ExportFormat;
  quality:  ExportQuality;
  fileName: string;
  searchable?: boolean;
}

export interface ScannerState {
  session:         ScanSession | null;
  isDetecting:     boolean;
  detectedQuad:    DocumentQuad | null;
  flashMode:       'off' | 'on' | 'auto';
  enhancementMode: EnhancementMode;
}

export type ScannerError =
  | 'CAMERA_PERMISSION_DENIED'
  | 'CAMERA_UNAVAILABLE'
  | 'EDGE_DETECTION_FAILED'
  | 'PERSPECTIVE_FAILED'
  | 'ENHANCEMENT_FAILED'
  | 'EXPORT_FAILED'
  | 'STORAGE_FULL'
  | 'INVALID_IMAGE'
  | 'DOCX_GENERATION_FAILED';
