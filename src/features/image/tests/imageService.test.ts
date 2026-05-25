import {
  compressImage,
  resizeImage,
  cropImage,
  convertImage,
} from '../services/imageService';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({ uri: 'file://mock/manipulated.jpg' }),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png', WEBP: 'webp' }
}));

jest.mock('@utils/fileUtils', () => ({
  getFileInfo: jest.fn().mockResolvedValue({
    uri: 'file://mock/manipulated.jpg',
    name: 'manipulated.jpg',
    size: 1000,
    mimeType: 'image/jpeg',
  }),
}));

describe('imageService', () => {
  const mockUri = 'file://mock/source.jpg';

  it('compressImage runs successfully', async () => {
    const result = await compressImage(mockUri, { quality: 0.8, format: 'jpeg' });
    expect(result.uri).toBe('file://mock/manipulated.jpg');
    expect(result.size).toBe(1000);
  });

  it('resizeImage resizes image', async () => {
    const result = await resizeImage(mockUri, { width: 800, height: 600 });
    expect(result.uri).toBe('file://mock/manipulated.jpg');
  });

  it('cropImage crops image to dimension', async () => {
    const result = await cropImage(mockUri, 0, 0, 400, 400);
    expect(result.uri).toBe('file://mock/manipulated.jpg');
  });

  it('convertImage changes image format', async () => {
    const result = await convertImage(mockUri, 'png');
    expect(result.uri).toBe('file://mock/manipulated.jpg');
  });
});
