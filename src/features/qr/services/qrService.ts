/**
 * QR Service — Logic for parsing and formatting QR data
 */

import { QrType, QrData, WifiData } from '../types';

/**
 * Parse a raw string from a QR scan into a structured QrData object.
 */
export function parseQrString(raw: string): QrData {
  const lower = raw.toLowerCase();

  // WiFi: WIFI:S:SSID;T:WPA;P:PASSWORD;;
  if (lower.startsWith('wifi:')) {
    const ssidMatch = raw.match(/S:([^;]+)/);
    const ssid = ssidMatch ? ssidMatch[1] : 'Unknown';
    return { type: 'wifi', value: raw, label: `WiFi: ${ssid}` };
  }

  // URL: http:// or https://
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('www.')) {
    return { type: 'url', value: raw, label: raw };
  }

  // Phone: tel:123456789
  if (lower.startsWith('tel:')) {
    const number = raw.substring(4);
    return { type: 'phone', value: number, label: `Phone: ${number}` };
  }

  // Email: mailto:test@example.com
  if (lower.startsWith('mailto:')) {
    const email = raw.substring(7);
    return { type: 'email', value: email, label: `Email: ${email}` };
  }

  // Default to text
  return { type: 'text', value: raw, label: raw.length > 30 ? `${raw.substring(0, 27)}...` : raw };
}

/**
 * Format a WiFi object into a standard QR string.
 */
export function formatWifiString(data: WifiData): string {
  return `WIFI:S:${data.ssid};T:${data.encryption};P:${data.password ?? ''};;`;
}

/**
 * Format a Phone number into a tel: string.
 */
export function formatPhoneString(number: string): string {
  return `tel:${number}`;
}

/**
 * Format an Email into a mailto: string.
 */
export function formatEmailString(email: string, subject?: string, body?: string): string {
  let str = `mailto:${email}`;
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  if (params.length > 0) str += `?${params.join('&')}`;
  return str;
}
