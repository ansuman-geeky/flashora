import { NativeModules, Platform } from 'react-native';

const { PdfProcessor } = NativeModules;

export interface PdfProcessorType {
  compressPdf(uri: string, qualityLevel: string): Promise<string>;
  encryptPdf(uri: string, userPass: string, ownerPass: string): Promise<string>;
  renderPageThumbnails(uri: string): Promise<string[]>;
}

export const PdfProcessorModule = Platform.OS === 'android'
  ? (PdfProcessor as PdfProcessorType)
  : null;
