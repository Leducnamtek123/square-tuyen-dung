import { existsSync } from 'node:fs';

/**
 * Server-side fetch utility for Next.js Server Components / generateMetadata.
 * It must fail quickly because metadata fetches block route transitions.
 */

const DEFAULT_SERVER_FETCH_TIMEOUT_MS = 2500;

const stripTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const ensureApiBase = (value: string) => {
  const normalized = stripTrailingSlash(value);
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

const isAbsoluteHttpUrl = (value = '') => /^https?:\/\//i.test(value);
const isDockerRuntime = existsSync('/.dockerenv');
const isDockerBackendHost = (value = '') => /^https?:\/\/backend(?::|\/|$)/i.test(value);

const resolveBackendBaseUrl = () => {
  const backendUrl = process.env.BACKEND_API_URL || '';

  if (backendUrl && (!isDockerBackendHost(backendUrl) || isDockerRuntime)) {
    return ensureApiBase(backendUrl);
  }

  const apiProxyOrigin = process.env.API_PROXY_ORIGIN || '';
  if (apiProxyOrigin) {
    return ensureApiBase(apiProxyOrigin);
  }

  const publicApiBase = process.env.NEXT_PUBLIC_API_BASE || '';
  if (isAbsoluteHttpUrl(publicApiBase)) {
    return ensureApiBase(publicApiBase);
  }

  if (!isDockerRuntime) {
    return ensureApiBase(`http://localhost:${process.env.NGINX_PORT || '8080'}`);
  }

  return 'http://backend:8000/api';
};

const baseUrl = `${resolveBackendBaseUrl()}/`;

/**
 * Lightweight server-side GET request.
 * Returns parsed JSON data, or null on failure (never throws).
 */
export async function serverFetch<T = unknown>(
  path: string,
  options?: { revalidate?: number; timeoutMs?: number }
): Promise<T | null> {
  const url = `${baseUrl}${path.startsWith('/') ? path.slice(1) : path}`;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_SERVER_FETCH_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: options?.revalidate ?? 60 },
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-Proto': 'https',
      },
    });

    if (!res.ok) return null;

    const json = await res.json();
    // Backend wraps payload in { data } via MyJSONRenderer
    return (json?.data ?? json) as T;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[serverFetch] ${path} failed`, error);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
