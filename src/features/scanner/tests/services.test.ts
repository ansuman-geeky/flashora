import { detectDocumentEdges } from '../services/edgeDetectionService';
import { applyPerspectiveCorrection } from '../services/perspectiveService';
import { enhanceImage } from '../services/enhancementService';
import { exportToPdf } from '../services/pdfExportService';
import { exportToDocx } from '../services/docxExportService';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({ uri: 'mock-cropped-uri.jpg' }),
  SaveFormat: { JPEG: 'jpeg' }
}));

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file://mock/cache/',
  copyAsync: jest.fn().mockResolvedValue(true),
  readAsStringAsync: jest.fn().mockResolvedValue('MOCK_BASE64'),
  writeAsStringAsync: jest.fn().mockResolvedValue(true),
  EncodingType: { Base64: 'base64' }
}));

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn().mockResolvedValue({
      embedJpg: jest.fn().mockResolvedValue({ scaleToFit: () => ({ width: 100, height: 100 }) }),
      addPage: jest.fn().mockReturnValue({ drawImage: jest.fn() }),
      saveAsBase64: jest.fn().mockResolvedValue('PDF_BASE64')
    })
  }
}));

jest.mock('docx', () => ({
  Document: jest.fn(),
  Packer: { toBase64String: jest.fn().mockResolvedValue('DOCX_BASE64') },
  Paragraph: jest.fn(),
  ImageRun: jest.fn()
}));

jest.mock('@services/crashlytics', () => ({
  recordError: jest.fn()
}));

describe('Scanner Services', () => {
  const dummyQuad = {
    topLeft: { x: 10, y: 10 },
    topRight: { x: 90, y: 10 },
    bottomRight: { x: 90, y: 90 },
    bottomLeft: { x: 10, y: 90 }
  };

  const dummyPage = {
    id: '1',
    rawUri: 'raw.jpg',
    croppedUri: 'cropped.jpg',
    enhancedUri: 'enhanced.jpg',
    quad: dummyQuad,
    enhancementMode: 'auto' as const,
    capturedAt: 123
  };

  it('detectDocumentEdges returns fallback quad', async () => {
    const result = await detectDocumentEdges('test.jpg', 100, 100);
    expect(result.quad).toBeDefined();
    expect(result.confidence).toBe(0.5);
  });

  it('applyPerspectiveCorrection uses image manipulator', async () => {
    const result = await applyPerspectiveCorrection('test.jpg', dummyQuad, 800, 1000);
    expect(result).toBe('mock-cropped-uri.jpg');
  });

  it('enhanceImage copies file as fallback', async () => {
    const result = await enhanceImage('test.jpg', 'auto', { brightness: 0, contrast: 0 });
    expect(result).toContain('file://mock/cache/enhanced_');
  });

  it('exportToPdf generates pdf uri', async () => {
    const result = await exportToPdf([dummyPage], { format: 'pdf', quality: 'standard', fileName: 'test' });
    expect(result).toBe('file://mock/cache/test.pdf');
  });

  it('exportToDocx generates docx uri', async () => {
    const result = await exportToDocx([dummyPage], { format: 'docx', quality: 'standard', fileName: 'test' });
    expect(result).toBe('file://mock/cache/test.docx');
  });
});
