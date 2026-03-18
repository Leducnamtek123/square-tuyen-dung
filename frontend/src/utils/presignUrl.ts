import axios from 'axios';
import tokenService from '../services/tokenService';

const isPresigned = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('X-Amz-Signature=') || url.includes('X-Amz-Algorithm=');
};

const isMinioPublicUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('/minio/');
};

const getBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE || '/api/';
};

const unwrapResponse = (response: { data?: { data?: unknown } }): unknown =>
  response?.data?.data ?? response?.data;

const requestPresign = async (url: string): Promise<string | null> => {
  const accessToken = tokenService.getAccessTokenFromCookie();
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  const response = await axios.get(`${getBaseUrl()}common/presign/`, {
    params: { url },
    headers,
    withCredentials: true,
  });
  const data = unwrapResponse(response) as { url?: string } | null;
  return data?.url || null;
};

export const ensurePresignedUrl = async (
  url: string | null | undefined
): Promise<string | null | undefined> => {
  if (!url || !isMinioPublicUrl(url) || isPresigned(url)) {
    return url;
  }

  try {
    const presigned = await requestPresign(url);
    return presigned || url;
  } catch {
    return url;
  }
};

export const presignInObject = async <T>(
  value: T,
  maxItems = 200
): Promise<T> => {
  let count = 0;

  const walk = async (node: unknown): Promise<unknown | undefined> => {
    if (!node || count >= maxItems) return;
    if (typeof node === 'string') {
      if (isMinioPublicUrl(node) && !isPresigned(node)) {
        count += 1;
        return ensurePresignedUrl(node);
      }
      return node;
    }
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i += 1) {
        if (count >= maxItems) break;
        const updated = await walk(node[i]);
        if (typeof updated === 'string') node[i] = updated;
      }
      return node;
    }
    if (typeof node === 'object') {
      const record = node as Record<string, unknown>;
      const keys = Object.keys(record);
      for (let i = 0; i < keys.length; i += 1) {
        if (count >= maxItems) break;
        const key = keys[i];
        const updated = await walk(record[key]);
        if (typeof updated === 'string') record[key] = updated;
      }
      return record;
    }
    return node;
  };

  await walk(value);
  return value;
};
