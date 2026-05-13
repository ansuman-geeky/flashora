/**
 * URL Shortener Service — Shortens URLs using TinyURL API
 */

export interface ShortenResult {
  longUrl: string;
  shortUrl: string;
}

class UrlShortenerService {
  private readonly API_URL = 'https://tinyurl.com/api-create.php?url=';

  /**
   * Shorten a URL using TinyURL (Anonymous API)
   */
  async shorten(url: string): Promise<ShortenResult> {
    try {
      // Validate URL basic
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }

      const response = await fetch(`${this.API_URL}${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error('Failed to shorten URL');
      }

      const shortUrl = await response.text();
      
      return {
        longUrl: url,
        shortUrl,
      };
    } catch (error) {
      console.error('URL Shortener Error:', error);
      throw new Error('Could not shorten URL. Please check your connection.');
    }
  }
}

export const urlShortenerService = new UrlShortenerService();
