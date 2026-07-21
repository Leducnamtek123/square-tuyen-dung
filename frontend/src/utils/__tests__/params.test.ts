import { cleanParams } from '../params';

describe('params utility', () => {
  describe('cleanParams', () => {
    it('removes undefined and null values', () => {
      const result = cleanParams({ a: 1, b: null, c: undefined });
      expect(result).toEqual({ a: 1 });
    });

    it('removes empty string values but keeps non-empty ones', () => {
      const result = cleanParams({ a: '   ', b: '', c: 'valid' });
      expect(result).toEqual({ c: 'valid' });
    });

    it('removes empty array values but keeps non-empty ones', () => {
      const result = cleanParams({ a: [], b: [1, 2] });
      expect(result).toEqual({ b: [1, 2] });
    });

    it('keeps other falsy values like 0 or false', () => {
      const result = cleanParams({ a: 0, b: false, c: '' });
      expect(result).toEqual({ a: 0, b: false });
    });

    it('handles null/undefined param object gracefully', () => {
      // TypeScript warns, but we should handle it at runtime
      expect(cleanParams(null as any)).toEqual({});
      expect(cleanParams(undefined as any)).toEqual({});
    });
  });
});
