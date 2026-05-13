/**
 * Validators — input validation utilities
 */

/** URL validation regex */
const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

/**
 * Validate that a string is a valid HTTP/HTTPS URL.
 */
export function isValidUrl(url: string): boolean {
  return URL_REGEX.test(url.trim());
}

/**
 * Validate that a string is a valid email address.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate that a string is a valid phone number (basic check).
 */
export function isValidPhone(phone: string): boolean {
  return /^[+]?[\d\s()-]{7,15}$/.test(phone.trim());
}

/**
 * Validate WiFi SSID (non-empty, max 32 chars).
 */
export function isValidSsid(ssid: string): boolean {
  const trimmed = ssid.trim();
  return trimmed.length > 0 && trimmed.length <= 32;
}

/**
 * Validate that a password for PDF lock meets minimum requirements.
 */
export function isValidPdfPassword(password: string): boolean {
  return password.length >= 4 && password.length <= 128;
}

/**
 * Validate that a string is non-empty after trimming.
 */
export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}
