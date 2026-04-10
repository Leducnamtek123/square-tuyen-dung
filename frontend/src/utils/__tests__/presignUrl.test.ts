import axios from 'axios';
import { ensurePresignedUrl, presignInObject } from '../presignUrl';
import tokenService from '../../services/tokenService';

jest.mock('axios');
jest.mock('../../services/tokenService', () => ({
  getAccessTokenFromCookie: jest.fn(),
}));

describe('presignUrl utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ensurePresignedUrl', () => {
    it('returns original url if falsy', async () => {
      expect(await ensurePresignedUrl(null)).toBeNull();
      expect(await ensurePresignedUrl(undefined)).toBeUndefined();
      expect(await ensurePresignedUrl('')).toBe('');
    });

    it('returns original url if already presigned', async () => {
      const url = 'http://localhost/minio/bucket/file.jpg?X-Amz-Signature=123';
      expect(await ensurePresignedUrl(url)).toBe(url);
    });

    it('returns original url if not a minio url', async () => {
      const url = 'https://google.com/image.jpg';
      expect(await ensurePresignedUrl(url)).toBe(url);
    });

    it('presigns a valid minio url successfully', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: { data: { url: 'http://localhost/minio/bucket/file.jpg?X-Amz-Signature=123' } }
      });
      (tokenService.getAccessTokenFromCookie as jest.Mock).mockReturnValue('fake-token');

      const url = 'http://localhost/minio/bucket/file.jpg';
      const result = await ensurePresignedUrl(url);

      expect(axios.get).toHaveBeenCalledWith('/api/common/presign/', expect.objectContaining({
        params: { url },
        headers: { Authorization: 'Bearer fake-token' }
      }));
      expect(result).toBe('http://localhost/minio/bucket/file.jpg?X-Amz-Signature=123');
    });

    it('returns original url if presign api fails', async () => {
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const url = 'http://localhost/minio/bucket/file.jpg';
      const result = await ensurePresignedUrl(url);
      
      expect(result).toBe(url);
    });
  });

  describe('presignInObject', () => {
    it('returns non-object values as is', async () => {
      expect(await presignInObject(null)).toBeNull();
      expect(await presignInObject(123)).toBe(123);
      expect(await presignInObject('test')).toBe('test');
    });

    it('presigns urls inside an array', async () => {
      const mockPresigned = 'http://minio/bucket/file.jpg?X-Amz-Signature=abc';
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: { url: mockPresigned } }
      });

      const input = ['http://minio/bucket/file.jpg', 'other'];
      const result = await presignInObject(input);
      
      expect(result).toEqual([mockPresigned, 'other']);
      expect(result).not.toBe(input); // Should be a clone
    });

    it('presigns urls inside a deep object', async () => {
      const mockPresigned = 'http://minio/bucket/file.jpg?X-Amz-Signature=abc';
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: { url: mockPresigned } }
      });

      const input = {
        user: { avatarUrl: 'http://minio/bucket/file.jpg' },
        meta: 'other'
      };
      const result = await presignInObject(input);
      
      expect(result).toEqual({
        user: { avatarUrl: mockPresigned },
        meta: 'other'
      });
      expect(result).not.toBe(input); // Clone
    });

    it('stops walking at maxItems limit', async () => {
      const mockPresigned = 'http://minio/bucket/file.jpg?X-Amz-Signature=abc';
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: { url: mockPresigned } }
      });

      const input = [
        'http://minio/bucket/file1.jpg',
        'http://minio/bucket/file2.jpg',
        'http://minio/bucket/file3.jpg'
      ];
      // Limit to 2 items Max
      const result = await presignInObject(input, 2);
      
      // Only first two are presigned
      expect(result[0]).toBe(mockPresigned);
      expect(result[1]).toBe(mockPresigned);
      expect(result[2]).toBe('http://minio/bucket/file3.jpg');
    });

    it('handles circular references gracefully (by try-catch fallback and weakset)', async () => {
      // NOTE: structuredClone handles circular references naturally.
      // But we just verify it doesn't crash
      const input: any = { a: 1 };
      input.self = input;
      
      const result = await presignInObject(input);
      expect(result.a).toBe(1);
    });
  });
});
