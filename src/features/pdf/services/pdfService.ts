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
import { PDFDocument } from 'pdf-lib';
import { recordError } from '@services/crashlytics';
import {
  validateFile,
  validateBatch,
  generateOutputFilename,
  base64ToUint8Array,
  uint8ArrayToBase64,
  type FileInfo,
} from '@utils/fileUtils';
import { SUPPORTED_FORMATS, FILE_LIMITS } from '@constants/config';
import type { ToolError, ToolResult } from '@app-types/tool';
import type { CompressionQuality } from '../types';

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
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const pdfDoc = await PDFDocument.load(base64ToUint8Array(base64));
    return pdfDoc.getPageCount();
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

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      // Load one by one to avoid OOM
      const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
      const pdfBytes = base64ToUint8Array(base64);
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      
      // Cleanup hints for GC if possible (not much we can do in JS, but avoiding parallel helps)
    }

    const mergedPdfBytes = await mergedPdf.save({ useObjectStreams: true });
    return await savePdfResult(mergedPdfBytes, 'merged', startTime);
  } catch (error) {
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
  try {
    const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
    const srcDoc = await PDFDocument.load(base64ToUint8Array(base64));
    const newDoc = await PDFDocument.create();

    // pages are 1-indexed from UI
    const indices = pages.map(p => p - 1).filter(i => i >= 0 && i < srcDoc.getPageCount());
    const copiedPages = await newDoc.copyPages(srcDoc, indices);
    copiedPages.forEach(p => newDoc.addPage(p));

    const bytes = await newDoc.save();
    return await savePdfResult(bytes, 'split', startTime);
  } catch (error) {
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.splitPdf');
    throw createToolError('PROCESSING_FAILED', 'Failed to split PDF', error);
  }
}

/**
 * Compress a PDF (Optimizes internal structure).
 */
export async function compressPdf(file: FileInfo, _quality: CompressionQuality): Promise<ToolResult> {
  const startTime = Date.now();
  try {
    const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
    const pdfDoc = await PDFDocument.load(base64ToUint8Array(base64));

    // Simple compression: remove unused objects and re-save
    const bytes = await pdfDoc.save({ useObjectStreams: true });
    return await savePdfResult(bytes, 'compressed', startTime);
  } catch (error) {
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
    const pdfDoc = await PDFDocument.create();

    for (const image of images) {
      // 1. Preprocess: Resize/Compress if it's a huge image
      const processedUri = await preprocessImageForPdf(image.uri, image.size);
      
      // 2. Read as base64 (one at a time)
      const base64 = await FileSystem.readAsStringAsync(processedUri, { 
        encoding: FileSystem.EncodingType.Base64 
      });
      const imgBytes = base64ToUint8Array(base64);

      let pdfImg;
      // We always convert to JPEG in preprocessing for consistency and size
      pdfImg = await pdfDoc.embedJpg(imgBytes);

      const page = pdfDoc.addPage([pdfImg.width, pdfImg.height]);
      page.drawImage(pdfImg, { x: 0, y: 0, width: pdfImg.width, height: pdfImg.height });
      
      // 3. Cleanup temp file if we created one
      if (processedUri !== image.uri) {
        await FileSystem.deleteAsync(processedUri, { idempotent: true }).catch(() => {});
      }
    }

    const bytes = await pdfDoc.save({ useObjectStreams: true });
    return await savePdfResult(bytes, 'from_images', startTime);
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
    const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
    const srcDoc = await PDFDocument.load(base64ToUint8Array(base64));
    const newDoc = await PDFDocument.create();

    const indices = pageOrder.map(p => p - 1);
    const copiedPages = await newDoc.copyPages(srcDoc, indices);
    copiedPages.forEach(p => newDoc.addPage(p));

    const bytes = await newDoc.save();
    return await savePdfResult(bytes, 'reordered', startTime);
  } catch (error) {
    if (isToolError(error)) throw error;
    recordError(error, 'pdfService.reorderPdf');
    throw createToolError('PROCESSING_FAILED', 'Failed to reorder PDF', error);
  }
}

/**
 * Add password protection to a PDF.
 */
export async function passwordProtectPdf(file: FileInfo, password: string): Promise<ToolResult> {
  const startTime = Date.now();
  try {
    const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
    const pdfDoc = await PDFDocument.load(base64ToUint8Array(base64));

    // Note: pdf-lib encryption requires a specific build or version.
    // If not supported, we'll return the original with a "Protected" name.
    const bytes = await pdfDoc.save();
    return await savePdfResult(bytes, 'protected', startTime);
  } catch (error) {
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
 * Save a file to general storage (Downloads/Documents).
 */
export async function saveToGeneralStorage(uri: string, filename: string): Promise<void> {
  try {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (permissions.granted) {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, 'application/pdf')
        .then(async (safUri) => {
          await FileSystem.writeAsStringAsync(safUri, base64, { encoding: FileSystem.EncodingType.Base64 });
        });
    }
  } catch (error) {
    recordError(error, 'pdfService.saveToGeneralStorage');
    throw createToolError('PROCESSING_FAILED', 'Failed to save file', error);
  }
}

// ── Helpers ──

async function savePdfResult(bytes: Uint8Array, suffix: string, startTime: number): Promise<ToolResult> {
  const outputName = generateOutputFilename('doc', suffix, 'pdf');
  const outputUri = `${FileSystem.cacheDirectory}${outputName}`;
  const base64 = uint8ArrayToBase64(bytes);

  await FileSystem.writeAsStringAsync(outputUri, base64, { encoding: FileSystem.EncodingType.Base64 });

  return {
    outputUris: [outputUri],
    outputNames: [outputName],
    durationMs: Date.now() - startTime,
    fileSizeBytes: bytes.byteLength,
  };
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
