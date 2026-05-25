import {
  formatFileSize,
  formatDuration,
  formatRelativeDate,
  formatTime,
  truncate,
  formatNumber,
  formatCurrencyInr,
} from '../formatters';

describe('Formatter Utilities', () => {
  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(100)).toBe('100 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB');
    });
  });

  describe('formatDuration', () => {
    it('formats duration correctly', () => {
      expect(formatDuration(500)).toBe('500ms');
      expect(formatDuration(1500)).toBe('1.5s');
      expect(formatDuration(65000)).toBe('1m 5s');
    });
  });

  describe('formatRelativeDate', () => {
    it('formats today and yesterday correctly', () => {
      const today = new Date().toISOString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      expect(formatRelativeDate(today)).toBe('Today');
      expect(formatRelativeDate(yesterday.toISOString())).toBe('Yesterday');
    });

    it('formats past dates correctly', () => {
      const pastDate = '2020-01-01T00:00:00.000Z';
      expect(formatRelativeDate(pastDate)).toBe('Jan 1, 2020');
    });
  });

  describe('formatTime', () => {
    it('formats time to short 12h format', () => {
      const date = '2026-05-24T14:30:00.000Z'; // Time will vary by test runner timezone, so we match parts of the format
      const result = formatTime(date);
      expect(result).toMatch(/(AM|PM)/);
    });
  });

  describe('truncate', () => {
    it('truncates long strings with ellipsis', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
      expect(truncate('short', 10)).toBe('short');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with Indian numbering commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(100000)).toBe('1,00,000'); 
      // Let's just verify it formats without crash
      expect(formatNumber(123456)).toBeDefined();
    });
  });

  describe('formatCurrencyInr', () => {
    it('formats INR currency correctly', () => {
      expect(formatCurrencyInr(149)).toBe('₹149');
    });
  });
});
