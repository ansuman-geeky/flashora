import { NativeModules, Platform } from 'react-native';

const { PdfProcessor } = NativeModules;

export interface PdfProcessorType {
  compressPdf(uri: string, qualityLevel: string): Promise<string>;
  encryptPdf(uri: string, userPass: string, ownerPass: string): Promise<string>;
  decryptPdf(uri: string, userPass: string): Promise<string>;
  renderPageThumbnails(uri: string): Promise<string[]>;
  getPageCount(uri: string): Promise<number>;
  mergePdfs(uris: string[]): Promise<string>;
  splitPdf(uri: string, pageIndices: number[]): Promise<string>;
  imagesToPdf(uris: string[]): Promise<string>;
  signPdf(uri: string, signatureUri: string, pageIndex: number, x: number, y: number, width: number, height: number): Promise<string>;
  watermarkPdf(uri: string, text: string, imageUri: string | null, opacity: number, fontSize: number): Promise<string>;
}

export const PdfProcessorModule = Platform.OS === 'android'
  ? (PdfProcessor as PdfProcessorType)
  : null;
