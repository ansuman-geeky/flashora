import { shortenUrl, registerProvider, UrlShortenerProvider } from '../urlShortener';

describe('urlShortener', () => {
  beforeEach(() => {
    // Reset global fetch mock
    global.fetch = jest.fn();
  });

  it('shortens url using default tinyurl provider', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          tiny_url: 'https://tinyurl.com/abc123',
        },
      }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await shortenUrl('https://google.com');
    expect(result).toBe('https://tinyurl.com/abc123');
    expect(global.fetch).toHaveBeenCalled();
  });

  it('registers and uses custom provider', async () => {
    const mockProvider: UrlShortenerProvider = {
      name: 'custom',
      shorten: jest.fn().mockResolvedValue('https://custom.url/xyz'),
    };

    registerProvider(mockProvider);

    const result = await shortenUrl('https://google.com', 'custom');
    expect(result).toBe('https://custom.url/xyz');
    expect(mockProvider.shorten).toHaveBeenCalledWith('https://google.com');
  });

  it('throws error if provider does not exist', async () => {
    await expect(shortenUrl('https://google.com', 'nonexistent')).rejects.toThrow(
      'URL shortener provider "nonexistent" not found'
    );
  });
});
