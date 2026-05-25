import {
  isValidUrl,
  isValidEmail,
  isValidPhone,
  isValidSsid,
  isValidPdfPassword,
  isNonEmpty,
} from '../validators';

describe('Validator Utilities', () => {
  describe('isValidUrl', () => {
    it('returns true for valid http and https URLs', () => {
      expect(isValidUrl('http://google.com')).toBe(true);
      expect(isValidUrl('https://www.github.com/some/path?param=1')).toBe(true);
    });

    it('returns false for invalid URLs', () => {
      expect(isValidUrl('google.com')).toBe(false);
      expect(isValidUrl('ftp://google.com')).toBe(false);
      expect(isValidUrl('https://')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('a@b.co')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(isValidEmail('testexample.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('returns true for valid phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('9876543210')).toBe(true);
    });

    it('returns false for invalid phone numbers', () => {
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('123')).toBe(false);
    });
  });

  describe('isValidSsid', () => {
    it('returns true for valid SSIDs', () => {
      expect(isValidSsid('MyHomeWifi')).toBe(true);
      expect(isValidSsid('a')).toBe(true);
    });

    it('returns false for empty or overly long SSIDs', () => {
      expect(isValidSsid('')).toBe(false);
      expect(isValidSsid('a'.repeat(33))).toBe(false);
    });
  });

  describe('isValidPdfPassword', () => {
    it('returns true for valid PDF passwords', () => {
      expect(isValidPdfPassword('1234')).toBe(true);
      expect(isValidPdfPassword('a'.repeat(128))).toBe(true);
    });

    it('returns false for overly short or long passwords', () => {
      expect(isValidPdfPassword('123')).toBe(false);
    });
  });

  describe('isNonEmpty', () => {
    it('returns true for non-empty strings', () => {
      expect(isNonEmpty('abc')).toBe(true);
      expect(isNonEmpty(' a ')).toBe(true);
    });

    it('returns false for empty or whitespace-only strings', () => {
      expect(isNonEmpty('')).toBe(false);
      expect(isNonEmpty('   ')).toBe(false);
    });
  });
});
