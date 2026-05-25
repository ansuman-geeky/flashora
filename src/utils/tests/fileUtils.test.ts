import {
  validateFile,
  validateBatch,
  getFileExtension,
  generateOutputFilename,
  formatFileSize,
  isSupportedFormat,
  getFileInfo,
  base64ToUint8Array,
  uint8ArrayToBase64,
} from '../fileUtils';

jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, size: 500 }),
}));

describe('File Utilities', () => {
  const mockFile = {
    uri: 'file://test.pdf',
    name: 'test.pdf',
    size: 1000,
    mimeType: 'application/pdf',
  };

  describe('validateFile', () => {
    it('returns null for valid file', () => {
      expect(validateFile(mockFile, ['application/pdf'])).toBeNull();
    });

    it('returns UNSUPPORTED_FORMAT for invalid mimeType', () => {
      expect(validateFile(mockFile, ['image/jpeg'])).toBe('UNSUPPORTED_FORMAT');
    });

    it('returns FILE_TOO_LARGE if file exceeds MAX_FILE_SIZE', () => {
      const largeFile = { ...mockFile, size: 100 * 1024 * 1024 + 1 };
      expect(validateFile(largeFile, ['application/pdf'])).toBe('FILE_TOO_LARGE');
    });
  });

  describe('validateBatch', () => {
    it('returns null for valid batch', () => {
      expect(validateBatch([mockFile, mockFile], ['application/pdf'])).toBeNull();
    });

    it('returns INVALID_FILE for empty batch', () => {
      expect(validateBatch([], ['application/pdf'])).toBe('INVALID_FILE');
    });

    it('returns FILE_TOO_LARGE if batch exceeds MAX_BATCH_SIZE', () => {
      const largeFile = { ...mockFile, size: 250 * 1024 * 1024 + 1 };
      expect(validateBatch([largeFile], ['application/pdf'])).toBe('FILE_TOO_LARGE');
    });
  });

  describe('getFileExtension', () => {
    it('resolves correct extensions', () => {
      expect(getFileExtension('test.pdf')).toBe('pdf');
      expect(getFileExtension('image.JPEG')).toBe('jpeg');
      expect(getFileExtension('noextension')).toBe('');
    });
  });

  describe('generateOutputFilename', () => {
    it('formats clean base name and timestamp', () => {
      const filename = generateOutputFilename('doc.pdf', 'processed', 'pdf');
      expect(filename).toContain('doc_processed_');
      expect(filename.endsWith('.pdf')).toBe(true);
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(100)).toBe('100 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
    });
  });

  describe('isSupportedFormat', () => {
    it('checks MIME type support correctly', () => {
      expect(isSupportedFormat('application/pdf', 'pdf')).toBe(true);
      expect(isSupportedFormat('image/png', 'pdf')).toBe(false);
    });
  });

  describe('getFileInfo', () => {
    it('resolves details from URI', async () => {
      const info = await getFileInfo('file://mock/test.pdf');
      expect(info.name).toBe('test.pdf');
      expect(info.mimeType).toBe('application/pdf');
    });
  });

  describe('base64ToUint8Array / uint8ArrayToBase64', () => {
    it('converts base64 to array and back', () => {
      const base64 = 'SGVsbG8='; // "Hello" in base64
      const arr = base64ToUint8Array(base64);
      expect(arr).toBeInstanceOf(Uint8Array);
      expect(uint8ArrayToBase64(arr)).toBe(base64);
    });
  });
});
