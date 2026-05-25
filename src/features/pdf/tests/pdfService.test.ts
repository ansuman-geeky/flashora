import {
  mergePdfs,
  splitPdf,
  compressPdf,
  reorderPdf,
  passwordProtectPdf,
} from '../services/pdfService';

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('MOCK_PDF_BASE64'),
  writeAsStringAsync: jest.fn().mockResolvedValue(true),
  getFreeDiskStorageAsync: jest.fn().mockResolvedValue(500 * 1024 * 1024),
  deleteAsync: jest.fn().mockResolvedValue(true),
  cacheDirectory: 'file://mock/cache/',
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    createFileAsync: jest.fn().mockResolvedValue('saf://mock/file'),
  },
  EncodingType: { Base64: 'base64' },
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn().mockResolvedValue({
      copyPages: jest.fn().mockResolvedValue([{}]),
      addPage: jest.fn(),
      save: jest.fn().mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46])),
      embedJpg: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
    }),
    load: jest.fn().mockResolvedValue({
      getPageCount: jest.fn().mockReturnValue(3),
      getPageIndices: jest.fn().mockReturnValue([0, 1, 2]),
      copyPages: jest.fn().mockResolvedValue([{}]),
      addPage: jest.fn(),
      save: jest.fn().mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46])),
    }),
  },
}));

describe('pdfService', () => {
  const mockFileInfo = {
    uri: 'file://mock/test.pdf',
    name: 'test.pdf',
    size: 500,
    mimeType: 'application/pdf',
  };

  it('mergePdfs merges files successfully', async () => {
    const result = await mergePdfs([mockFileInfo, mockFileInfo]);
    expect(result.outputUris[0]).toContain('file://mock/cache/');
    expect(result.fileSizeBytes).toBeGreaterThan(0);
  });

  it('splitPdf splits document pages correctly', async () => {
    const result = await splitPdf(mockFileInfo, [1, 2]);
    expect(result.outputUris[0]).toContain('file://mock/cache/doc_split_');
  });

  it('compressPdf runs without crash', async () => {
    const result = await compressPdf(mockFileInfo, 'medium');
    expect(result.outputUris[0]).toContain('file://mock/cache/doc_compressed_');
  });

  it('reorderPdf reorders pages successfully', async () => {
    const result = await reorderPdf(mockFileInfo, [2, 1, 3]);
    expect(result.outputUris[0]).toContain('file://mock/cache/doc_reordered_');
  });

  it('passwordProtectPdf returns result successfully', async () => {
    const result = await passwordProtectPdf(mockFileInfo, 'secret123');
    expect(result.outputUris[0]).toContain('file://mock/cache/doc_protected_');
  });
});
