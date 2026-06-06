import { camelizeKeys, snakizeKeys } from '../camelCase';

describe('camelCase utilities', () => {
  describe('camelizeKeys', () => {
    it('returns null/undefined as is', () => {
      expect(camelizeKeys(null)).toBeNull();
      expect(camelizeKeys(undefined)).toBeUndefined();
    });

    it('converts single object correctly', () => {
      const snake = { first_name: 'John', last_name: 'Doe' };
      const camel = { firstName: 'John', lastName: 'Doe' };
      expect(camelizeKeys(snake)).toEqual(camel);
    });

    it('converts arrays correctly', () => {
      const snake = [{ user_id: 1 }, { user_id: 2 }];
      const camel = [{ userId: 1 }, { userId: 2 }];
      expect(camelizeKeys(snake)).toEqual(camel);
    });

    it('converts nested objects correctly', () => {
      const snake = { user_profile: { address_line: '123 Main St' } };
      const camel = { userProfile: { addressLine: '123 Main St' } };
      expect(camelizeKeys(snake)).toEqual(camel);
    });

    it('ignores Date, File, Blob, and ArrayBuffer objects', () => {
      const date = new Date();
      const audio = new ArrayBuffer(4);
      const snake = { created_at: date, audio_bytes: audio };
      const result = camelizeKeys<any>(snake);
      expect(result.createdAt).toBe(date);
      expect(result.audioBytes).toBe(audio);
    });

    it('ignores primitives', () => {
      expect(camelizeKeys('string')).toBe('string');
      expect(camelizeKeys(123)).toBe(123);
    });
  });

  describe('snakizeKeys', () => {
    it('returns null/undefined as is', () => {
      expect(snakizeKeys(null)).toBeNull();
      expect(snakizeKeys(undefined)).toBeUndefined();
    });

    it('converts single object correctly', () => {
      const camel = { firstName: 'John', lastName: 'Doe' };
      const snake = { first_name: 'John', last_name: 'Doe' };
      expect(snakizeKeys(camel)).toEqual(snake);
    });

    it('converts arrays correctly', () => {
      const camel = [{ userId: 1 }, { userId: 2 }];
      const snake = [{ user_id: 1 }, { user_id: 2 }];
      expect(snakizeKeys(camel)).toEqual(snake);
    });

    it('converts nested objects correctly', () => {
      const camel = { userProfile: { addressLine: '123 Main St' } };
      const snake = { user_profile: { address_line: '123 Main St' } };
      expect(snakizeKeys(camel)).toEqual(snake);
    });

    it('ignores Date, File, Blob, FormData, and ArrayBuffer objects', () => {
      const date = new Date();
      const audio = new ArrayBuffer(4);
      const camel = { createdAt: date, audioBytes: audio };
      const result = snakizeKeys<any>(camel);
      expect(result.created_at).toBe(date);
      expect(result.audio_bytes).toBe(audio);
    });

    it('ignores primitives', () => {
      expect(snakizeKeys('string')).toBe('string');
      expect(snakizeKeys(123)).toBe(123);
    });
  });
});
