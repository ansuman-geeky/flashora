/**
 * URL Shortener Service — Provider abstraction
 *
 * Uses a Strategy pattern for extensibility:
 * - Default: TinyURL API
 * - Future: Rebrandly, Bit.ly — just add a new provider implementation
 */

import { URL_SHORTENER_CONFIG } from '@constants/config';
import { recordError } from './crashlytics';

/** URL shortener provider interface */
export interface UrlShortenerProvider {
  name: string;
  shorten(url: string): Promise<string>;
}

/** TinyURL provider implementation */
const tinyUrlProvider: UrlShortenerProvider = {
  name: 'tinyurl',
  async shorten(url: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      URL_SHORTENER_CONFIG.requestTimeoutMs
    );

    try {
      const apiToken = process.env.TINYURL_API_TOKEN;

      const response = await fetch(`${URL_SHORTENER_CONFIG.tinyurlBaseUrl}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
        },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`TinyURL API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as { data?: { tiny_url?: string } };
      const shortUrl = data?.data?.tiny_url;

      if (!shortUrl) {
        throw new Error('TinyURL API returned no short URL');
      }

      return shortUrl;
    } finally {
      clearTimeout(timeoutId);
    }
  },
};

/** Registry of available providers */
const providers: Record<string, UrlShortenerProvider> = {
  tinyurl: tinyUrlProvider,
};

/**
 * Register a custom URL shortener provider.
 * Use this to add Rebrandly, Bit.ly, etc. without changing existing code.
 */
export function registerProvider(provider: UrlShortenerProvider): void {
  providers[provider.name] = provider;
}

/**
 * Shorten a URL using the configured provider.
 */
export async function shortenUrl(
  url: string,
  providerName?: string
): Promise<string> {
  const name = providerName ?? URL_SHORTENER_CONFIG.defaultProvider;
  const provider = providers[name];

  if (!provider) {
    throw new Error(`URL shortener provider "${name}" not found`);
  }

  try {
    return await provider.shorten(url);
  } catch (error) {
    recordError(error, `UrlShortener.${name}`);
    throw error;
  }
}
