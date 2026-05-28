import { NativeModules, Platform } from 'react-native';

const { PdfProcessor } = NativeModules;

export interface PdfProcessorType {
  compressPdf(uri: string, qualityLevel: string): Promise<string>;
  encryptPdf(uri: string, userPass: string, ownerPass: string): Promise<string>;
  renderPageThumbnails(uri: string): Promise<string[]>;
  getPageCount(uri: string): Promise<number>;
  mergePdfs(uris: string[]): Promise<string>;
  splitPdf(uri: string, pageIndices: number[]): Promise<string>;
  imagesToPdf(uris: string[]): Promise<string>;
}

export const PdfProcessorModule = Platform.OS === 'android'
  ? (PdfProcessor as PdfProcessorType)
  : null;
