/**
 * PDF Service — All PDF processing logic
 *
 * Pure functions, fully testable. Every async call wrapped in try/catch.
 * Errors are typed as ToolError and reported to Crashlytics.
 *
 * Uses expo-file-system for I/O and expo-document-picker for file selection.
 * Implementation uses pdf-lib for cross-platform PDF manipulation.
 */

import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as ImageManipulator from 'expo-image-manipulator';
import { 
  generateOutputFilename, 
  type FileInfo, 
  validateFile,
  validateBatch,
} from '@utils/fileUtils';
import { recordError } from '@services/crashlytics';
import { saveToFlashora } from '../../../services/storageService';
import { SUPPORTED_FORMATS, FILE_LIMITS } from '@constants/config';
import type { ToolError, ToolResult } from '@app-types/tool';
import type { CompressionQuality } from '../types';
import { PdfProcessorModule } from '../../../native/PdfProcessor';

/**
 * Pick PDF files using the document picker.
 */
export async function pickPdfFiles(multiple: boolean = false): Promise<FileInfo[] | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf'],
      multiple,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const files = result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.name,
      size: asset.size ?? 0,
      mimeType: asset.mimeType ?? 'application/pdf',
    }));

    // Early validation of picked file formats
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isPdf = ext === 'pdf' || file.mimeType === 'application/pdf' || file.mimeType === 'application/octet-stream';
      if (!isPdf) {
        throw createToolError(
          'UNSUPPORTED_FORMAT',
          'Only PDF files are supported. Please select a valid PDF file.'
        );
      }
    }

    return files;
  } catch (error) {
    console.error('[pdfService] pickPdfFiles error:', error);
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.pickPdfFiles');
    throw createToolError('PROCESSING_FAILED', 'Failed to open file picker', error);
  }
}

/**
 * Get the total number of pages in a PDF.
 */
export async function getPdfPageCount(uri: string): Promise<number> {
  try {
    if (PdfProcessorModule) {
      const localUri = await ensureLocalUri(uri);
      return await PdfProcessorModule.getPageCount(localUri);
    }
    return 0;
  } catch (error) {
    recordError(error, 'pdfService.getPdfPageCount');
    return 0;
  }
}

/**
 * Pick image files for Image-to-PDF conversion.
 */
export async function pickImageFiles(): Promise<FileInfo[] | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'image/webp'],
      multiple: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const files = result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.name,
      size: asset.size ?? 0,
      mimeType: asset.mimeType ?? 'image/jpeg',
    }));

    // Early validation of picked file formats
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext ?? '') || file.mimeType.startsWith('image/') || file.mimeType === 'application/octet-stream';
      if (!isImage) {
        throw createToolError(
          'UNSUPPORTED_FORMAT',
          'Only image files (JPG, PNG, WebP) are supported. Please select valid images.'
        );
      }
    }

    return files;
  } catch (error) {
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.pickImageFiles');
    throw createToolError('PROCESSING_FAILED', 'Failed to open file picker', error);
  }
}

/**
 * Validate PDF files before processing.
 */
export function validatePdfFiles(files: FileInfo[]): ToolError | null {
  const errorCode = validateBatch(files, SUPPORTED_FORMATS.pdf);
  if (errorCode) {
    return createToolError(errorCode, getErrorMessage(errorCode));
  }
  return null;
}

/**
 * Validate image files before processing.
 */
export function validateImageFiles(files: FileInfo[]): ToolError | null {
  const errorCode = validateBatch(files, SUPPORTED_FORMATS.image);
  if (errorCode) {
    return createToolError(errorCode, getErrorMessage(errorCode));
  }
  return null;
}

/**
 * Check if device has enough free storage.
 */
export async function checkStorage(): Promise<boolean> {
  try {
    const freeSpace = await FileSystem.getFreeDiskStorageAsync();
    return freeSpace > FILE_LIMITS.MIN_FREE_STORAGE;
  } catch {
    return true;
  }
}

/**
 * Merge multiple PDFs into one.
 */
export async function mergePdfs(files: FileInfo[]): Promise<ToolResult> {
  const startTime = Date.now();
  try {
    const validationError = validatePdfFiles(files);
    if (validationError) throw validationError;

    const hasStorage = await checkStorage();
    if (!hasStorage) throw createToolError('STORAGE_FULL', 'Not enough storage space');

    if (!PdfProcessorModule) {
      throw createToolError('PROCESSING_FAILED', 'Native PDF processor is not available.');
    }

    const uris = await Promise.all(files.map(f => ensureLocalUri(f.uri)));
    const outputPath = await PdfProcessorModule.mergePdfs(uris);
    const outputUri = `file://${outputPath}`;
    
    const savedFile = await saveToFlashora(outputUri, 'PDF', 'merged', '.pdf');

    // Cleanup temp files
    for (let i = 0; i < uris.length; i++) {
      const uri = uris[i];
      const fileUri = files[i]?.uri;
      if (uri && fileUri && uri !== fileUri) {
        await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
      }
    }

    return {
      outputUris: [savedFile.uri],
      outputNames: [savedFile.name],
      durationMs: Date.now() - startTime,
      fileSizeBytes: savedFile.size,
    };
  } catch (error) {
    console.error('[pdfService] mergePdfs error:', error);
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.mergePdfs');
    throw createToolError('PROCESSING_FAILED', 'Failed to merge PDFs', error);
  }
}

/**
 * Split a PDF by page ranges.
 */
export async function splitPdf(file: FileInfo, pages: number[]): Promise<ToolResult> {
  const startTime = Date.now();
  let localUri = file.uri;
  try {
    if (!PdfProcessorModule) {
      throw createToolError('PROCESSING_FAILED', 'Native PDF processor is not available.');
    }

    localUri = await ensureLocalUri(file.uri);
    
    // pages are 1-indexed from UI, converting to 0-indexed for Native
    const indices = pages.map(p => p - 1);
    
    const outputPath = await PdfProcessorModule.splitPdf(localUri, indices);
    const outputUri = `file://${outputPath}`;
    
    const savedFile = await saveToFlashora(outputUri, 'PDF', 'split', '.pdf');

    if (localUri !== file.uri) {
      await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
    }

    return {
      outputUris: [savedFile.uri],
      outputNames: [savedFile.name],
      durationMs: Date.now() - startTime,
      fileSizeBytes: savedFile.size,
    };
  } catch (error) {
    console.error('[pdfService] splitPdf error:', error);
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.splitPdf');
    throw createToolError('PROCESSING_FAILED', 'Failed to split PDF', error);
  }
}

/**
 * Compress a PDF using Native Bridge (Optimizes internal structure).
 */
export async function compressPdf(file: FileInfo, quality: CompressionQuality): Promise<ToolResult> {
  const startTime = Date.now();
  let localUri = file.uri;
  try {
    if (!PdfProcessorModule) {
      throw createToolError('PROCESSING_FAILED', 'Native PDF processor is not available on this platform.');
    }

    localUri = await ensureLocalUri(file.uri);
    const outputPath = await PdfProcessorModule.compressPdf(localUri, quality);
    const outputUri = `file://${outputPath}`;
    const fileInfo = await FileSystem.getInfoAsync(outputUri);

    const savedFile = await saveToFlashora(outputUri, 'PDF', 'compressed', '.pdf');

    if (localUri !== file.uri) {
      await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
    }

    return {
      outputUris: [savedFile.uri],
      outputNames: [savedFile.name],
      durationMs: Date.now() - startTime,
      fileSizeBytes: savedFile.size,
    };
  } catch (error) {
    console.error('[pdfService] compressPdf error:', error);
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.compressPdf');
    throw createToolError('PROCESSING_FAILED', 'Failed to compress PDF', error);
  }
}

/**
 * Convert images to a PDF.
 */
export async function imagesToPdf(images: FileInfo[]): Promise<ToolResult> {
  const startTime = Date.now();
  try {
    if (!PdfProcessorModule) {
      throw createToolError('PROCESSING_FAILED', 'Native PDF processor is not available.');
    }

    // 1. Preprocess: Resize/Compress
    const processedUris = await Promise.all(images.map(img => preprocessImageForPdf(img.uri, img.size)));
    
    // 2. Generate PDF natively
    const outputPath = await PdfProcessorModule.imagesToPdf(processedUris);
    const outputUri = `file://${outputPath}`;
    
    const savedFile = await saveToFlashora(outputUri, 'PDF', 'from_images', '.pdf');

    // 3. Cleanup temp files
    for (let i = 0; i < processedUris.length; i++) {
      const uri = processedUris[i];
      const imgUri = images[i]?.uri;
      if (uri && imgUri && uri !== imgUri) {
        await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
      }
    }

    return {
      outputUris: [savedFile.uri],
      outputNames: [savedFile.name],
      durationMs: Date.now() - startTime,
      fileSizeBytes: savedFile.size,
    };
  } catch (error) {
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.imagesToPdf');
    throw createToolError('PROCESSING_FAILED', 'Failed to convert images to PDF', error);
  }
}



/**
 * Reorder pages in a PDF.
 */
export async function reorderPdf(file: FileInfo, pageOrder: number[]): Promise<ToolResult> {
  const startTime = Date.now();
  try {
    if (!PdfProcessorModule) {
      throw createToolError('PROCESSING_FAILED', 'Native PDF processor is not available.');
    }

    const localUri = await ensureLocalUri(file.uri);
    const indices = pageOrder.map(p => p - 1);
    
    const outputPath = await PdfProcessorModule.splitPdf(localUri, indices);
    const outputUri = `file://${outputPath}`;
    
    const savedFile = await saveToFlashora(outputUri, 'PDF', 'reordered', '.pdf');

    if (localUri !== file.uri) {
      await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
    }

    return {
      outputUris: [savedFile.uri],
      outputNames: [savedFile.name],
      durationMs: Date.now() - startTime,
      fileSizeBytes: savedFile.size,
    };
  } catch (error) {
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.reorderPdf');
    throw createToolError('PROCESSING_FAILED', 'Failed to reorder PDF', error);
  }
}

/**
 * Add password protection to a PDF using Native Bridge.
 */
export async function passwordProtectPdf(file: FileInfo, password: string): Promise<ToolResult> {
  const startTime = Date.now();
  let localUri = file.uri;
  try {
    if (!PdfProcessorModule) {
      throw createToolError('PROCESSING_FAILED', 'Native PDF processor is not available on this platform.');
    }

    localUri = await ensureLocalUri(file.uri);
    const outputPath = await PdfProcessorModule.encryptPdf(localUri, password, password);
    const outputUri = `file://${outputPath}`;
    const fileInfo = await FileSystem.getInfoAsync(outputUri);

    const savedFile = await saveToFlashora(outputUri, 'PDF', 'protected', '.pdf');

    if (localUri !== file.uri) {
      await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
    }

    return {
      outputUris: [savedFile.uri],
      outputNames: [savedFile.name],
      durationMs: Date.now() - startTime,
      fileSizeBytes: savedFile.size,
    };
  } catch (error) {
    console.error('[pdfService] passwordProtectPdf error:', error);
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.passwordProtectPdf');
    throw createToolError('PROCESSING_FAILED', 'Failed to protect PDF', error);
  }
}

/**
 * Share a file using the system share sheet.
 */
export async function shareFile(uri: string): Promise<void> {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      throw createToolError('PROCESSING_FAILED', 'Sharing is not available');
    }
    await Sharing.shareAsync(uri);
  } catch (error) {
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.shareFile');
    throw createToolError('PROCESSING_FAILED', 'Failed to share file', error);
  }
}

/**
 * Unlock PDF (Remove password) using Native Bridge.
 */
export async function unlockPdf(file: FileInfo, password: string): Promise<ToolResult> {
  const startTime = Date.now();
  let localUri = file.uri;
  try {
    if (!PdfProcessorModule) {
      throw createToolError('PROCESSING_FAILED', 'Native PDF processor is not available on this platform.');
    }

    localUri = await ensureLocalUri(file.uri);
    const outputPath = await PdfProcessorModule.decryptPdf(localUri, password);
    const outputUri = `file://${outputPath}`;
    const fileInfo = await FileSystem.getInfoAsync(outputUri);

    const savedFile = await saveToFlashora(outputUri, 'PDF', 'unlocked', '.pdf');

    if (localUri !== file.uri) {
      await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
    }

    return {
      outputUris: [savedFile.uri],
      outputNames: [savedFile.name],
      durationMs: Date.now() - startTime,
      fileSizeBytes: savedFile.size,
    };
  } catch (error) {
    console.error('[pdfService] unlockPdf error:', error);
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.unlockPdf');
    throw createToolError('PROCESSING_FAILED', 'Failed to unlock PDF. Make sure the password is correct.', error);
  }
}



/**
 * Sign a PDF using pdf-lib in Javascript.
 */
export async function signPdf(file: FileInfo, signatureUri: string, pageIndex: number, x: number, y: number, width: number, height: number): Promise<ToolResult> {
  const startTime = Date.now();
  let localUri = file.uri;
  try {
    if (!PdfProcessorModule) {
      throw createToolError('PROCESSING_FAILED', 'Native PDF processor is not available on this platform.');
    }

    localUri = await ensureLocalUri(file.uri);
    const sigLocalUri = await ensureLocalUri(signatureUri);
    
    const outputPath = await PdfProcessorModule.signPdf(localUri, sigLocalUri, pageIndex, x, y, width, height);
    const outputUri = `file://${outputPath}`;
    
    const savedFile = await saveToFlashora(outputUri, 'PDF', 'signed', '.pdf');

    if (localUri !== file.uri) {
      await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
    }

    return {
      outputUris: [savedFile.uri],
      outputNames: [savedFile.name],
      durationMs: Date.now() - startTime,
      fileSizeBytes: savedFile.size,
    };
  } catch (error) {
    console.error('[pdfService] signPdf error:', error);
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.signPdf');
    throw createToolError('PROCESSING_FAILED', 'Failed to sign PDF.', error);
  }
}

/**
 * Add a watermark to a PDF using pdf-lib in Javascript.
 */
export async function watermarkPdf(file: FileInfo, text: string, imageUri: string | null, opacity: number, fontSize: number): Promise<ToolResult> {
  const startTime = Date.now();
  let localUri = file.uri;
  try {
    if (!PdfProcessorModule) {
      throw createToolError('PROCESSING_FAILED', 'Native PDF processor is not available on this platform.');
    }

    localUri = await ensureLocalUri(file.uri);
    let imgLocalUri = null;
    if (imageUri) {
      imgLocalUri = await ensureLocalUri(imageUri);
    }
    
    const outputPath = await PdfProcessorModule.watermarkPdf(localUri, text, imgLocalUri, opacity, fontSize);
    const outputUri = `file://${outputPath}`;
    
    const savedFile = await saveToFlashora(outputUri, 'PDF', 'watermark', '.pdf');

    if (localUri !== file.uri) {
      await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
    }

    return {
      outputUris: [savedFile.uri],
      outputNames: [savedFile.name],
      durationMs: Date.now() - startTime,
      fileSizeBytes: savedFile.size,
    };
  } catch (error) {
    console.error('[pdfService] watermarkPdf error:', error);
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.watermarkPdf');
    throw createToolError('PROCESSING_FAILED', 'Failed to add watermark.', error);
  }
}

// Remove saveToGeneralStorage as it is replaced by saveToFlashora

// ── Helpers ──

/**
 * Copies content:// URIs to a local file:// path in cache directory to ensure
 * reliable access for native modules and large base64 reading.
 */
export async function ensureLocalUri(uri: string): Promise<string> {
  if (uri.startsWith('file://')) return uri;
  
  try {
    const filename = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
    const localUri = `${FileSystem.cacheDirectory}${filename}`;
    
    // Copy the content:// file to local file:// cache
    await FileSystem.copyAsync({ from: uri, to: localUri });
    return localUri;
  } catch (error) {
    console.error('[pdfService] ensureLocalUri failed:', error);
    return uri; // Fallback to original, might fail but worth trying
  }
}



function createToolError(code: ToolError['code'], message: string, originalError?: unknown): ToolError {
  return { code, message, originalError };
}

function isToolError(error: unknown): error is ToolError {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}

function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    INVALID_FILE: 'Invalid file',
    FILE_TOO_LARGE: 'File too large',
    UNSUPPORTED_FORMAT: 'Unsupported format',
    STORAGE_FULL: 'Storage full',
    PROCESSING_FAILED: 'Processing failed',
  };
  return messages[code] ?? 'An unexpected error occurred';
}

/**
 * Preprocess image for PDF embedding.
 * Reduces size if necessary to avoid OOM.
 */
async function preprocessImageForPdf(uri: string, size: number): Promise<string> {
  const SIZE_THRESHOLD = 1.5 * 1024 * 1024; // 1.5MB
  
  if (size < SIZE_THRESHOLD) return uri;

  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1600 } }], // Reasonable resolution for PDF
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (err) {
    console.warn('Image preprocessing failed, falling back to original:', err);
    return uri;
  }
}
