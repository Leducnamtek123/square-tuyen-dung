import axios from 'axios';
import tokenService from '../services/tokenService';

const isPresigned = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('X-Amz-Signature=') || url.includes('X-Amz-Algorithm=');
};

const isMinioPublicUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  // Nhận diện URL MinIO: có /minio/ trong path, hoặc là MinIO public URL dạng host:port/bucket/
  if (url.includes('/minio/')) return true;

  try {
    const parsed = new URL(url);
    // MinIO URL thường có port 9000 hoặc 9001
    if (parsed.port === '9000' || parsed.port === '9001') return true;
    // MinIO hostname thường chứa 'minio' trong tên
    if (parsed.hostname.includes('minio')) return true;
    // Production S3/MinIO: hostname starts with 's3.' (e.g. s3.tuyendung.square.vn)
    if (parsed.hostname.startsWith('s3.')) return true;
  } catch {
    // ignore invalid URLs
  }

  // Check against NEXT_PUBLIC_MINIO_PUBLIC_URL env setting
  const minioPublicUrl = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
  if (minioPublicUrl && url.startsWith(minioPublicUrl)) return true;

  return false;
};

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE || '/api/';
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

interface UrlLocation {
  parent: Record<string, unknown> | unknown[];
  key: string | number;
  url: string;
}

/**
 * Collect all MinIO URLs that need presigning, then presign them
 * ALL IN PARALLEL instead of one-by-one sequentially.
 */
export const presignInObject = async <T>(
  value: T,
  maxItems = 200
): Promise<T> => {
  const locations: UrlLocation[] = [];

  // Phase 1: Collect all MinIO URLs that need presigning (synchronous walk)
  const collect = (node: unknown): void => {
    if (!node || locations.length >= maxItems) return;
    if (typeof node === 'string') return; // strings are handled by parent
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i += 1) {
        if (locations.length >= maxItems) break;
        const item = node[i];
        if (typeof item === 'string' && isMinioPublicUrl(item) && !isPresigned(item)) {
          locations.push({ parent: node, key: i, url: item });
        } else {
          collect(item);
        }
      }
      return;
    }
    if (typeof node === 'object') {
      const record = node as Record<string, unknown>;
      const keys = Object.keys(record);
      for (let i = 0; i < keys.length; i += 1) {
        if (locations.length >= maxItems) break;
        const key = keys[i];
        const val = record[key];
        if (typeof val === 'string' && isMinioPublicUrl(val) && !isPresigned(val)) {
          locations.push({ parent: record, key, url: val });
        } else {
          collect(val);
        }
      }
    }
  };

  collect(value);

  if (locations.length === 0) return value;

  // Phase 2: Presign ALL URLs in parallel (instead of sequential!)
  const presignedResults = await Promise.all(
    locations.map((loc) =>
      ensurePresignedUrl(loc.url).then((result) => ({
        ...loc,
        presigned: result,
      }))
    )
  );

  // Phase 3: Apply presigned URLs to a clone of the original object
  // to avoid mutating the original object which might be in TanStack Query cache.
  // Note: This only shallow clones the top level or the parent of the URL.
  // In a real project, we might want a recursive clone, but here we just
  // want to avoid direct mutation of the 'value' passed in if it's the parent.
  const resultObject = Array.isArray(value) ? [...value] : { ...value } as any;

  for (const item of presignedResults) {
    if (typeof item.presigned === 'string') {
      const targetParent = item.parent === value ? resultObject : item.parent;
      (targetParent as any)[item.key] = item.presigned;
    }
  }

  return resultObject as T;
};

