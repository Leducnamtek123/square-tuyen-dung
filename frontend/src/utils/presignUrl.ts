import axios from 'axios';
import tokenService from '../services/tokenService';

const isPresigned = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('X-Amz-Signature=') || url.includes('X-Amz-Algorithm=');
};

const isMinioPublicUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('/minio/')) return true;

  try {
    const parsed = new URL(url);
    if (parsed.port === '9000' || parsed.port === '9001') return true;
    if (parsed.hostname.includes('minio')) return true;
    if (parsed.hostname.startsWith('s3.')) return true;
  } catch {
    // ignore invalid URLs
  }

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
  url: string | null | undefined,
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
  path: (string | number)[];
  url: string;
}

/**
 * Simplified presignInObject: single-walk approach.
 *
 * 1. Deep clone the object first (safe — no cache mutation)
 * 2. Walk the clone once, collecting + replacing in-place
 *
 * This eliminates the fragile double-walk where clone tree order
 * had to match original tree order exactly.
 */
export const presignInObject = async <T>(
  value: T,
  maxItems = 200,
): Promise<T> => {
  if (!value || typeof value !== 'object') return value;

  // Phase 1: Deep clone to avoid mutating original/cached data
  let clone: T;
  try {
    clone = structuredClone(value);
  } catch {
    clone = (Array.isArray(value) ? [...value] : { ...value }) as T;
  }

  // Phase 2: Single walk — collect all MinIO URL locations
  const locations: UrlLocation[] = [];
  const visited = new WeakSet();

  const walk = (node: unknown, path: (string | number)[]): void => {
    if (!node || locations.length >= maxItems) return;
    if (typeof node !== 'object') return;
    if (visited.has(node as object)) return;
    visited.add(node as object);

    const entries = Array.isArray(node)
      ? node.map((v, i) => [i, v] as const)
      : Object.entries(node as Record<string, unknown>);

    for (const [key, val] of entries) {
      if (locations.length >= maxItems) break;
      if (typeof val === 'string' && isMinioPublicUrl(val) && !isPresigned(val)) {
        locations.push({ path: [...path, key], url: val });
      } else if (val && typeof val === 'object') {
        walk(val, [...path, key]);
      }
    }
  };

  walk(clone, []);

  if (locations.length === 0) return clone;

  // Phase 3: Presign ALL URLs in parallel
  const presignedResults = await Promise.all(
    locations.map((loc) =>
      ensurePresignedUrl(loc.url).then((result) => ({
        path: loc.path,
        presigned: result,
      })),
    ),
  );

  // Phase 4: Apply presigned URLs directly on the clone (safe — it's our copy)
  for (const { path, presigned } of presignedResults) {
    if (typeof presigned !== 'string') continue;

    let target: unknown = clone;
    for (let i = 0; i < path.length - 1; i++) {
      target = (target as Record<string | number, unknown>)[path[i]];
    }
    const lastKey = path[path.length - 1];
    (target as Record<string | number, unknown>)[lastKey] = presigned;
  }

  return clone;
};
