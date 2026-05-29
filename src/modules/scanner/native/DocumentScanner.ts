import { NativeModules } from 'react-native';

export interface DocumentScannerResult {
  pdf?: {
    uri: string;
    pageCount: number;
  };
  pages?: Array<{
    imageUri: string;
  }>;
}

export interface DocumentScannerOptions {
  pageLimit?: number;
}

const { DocumentScanner } = NativeModules;

export const startScan = async (
  options: DocumentScannerOptions = {}
): Promise<DocumentScannerResult> => {
  if (!DocumentScanner) {
    throw new Error('DocumentScanner native module is not linked.');
  }
  return DocumentScanner.startScan(options);
};
