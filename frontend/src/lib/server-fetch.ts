/**
 * Server-side fetch utility for Next.js Server Components / generateMetadata.
 * Uses the internal Docker backend URL (BACKEND_API_URL) when available,
 * falls back to NEXT_PUBLIC_API_BASE for local development.
 */

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  'http://localhost:8001/api';

// Normalise: ensure trailing slash
const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL : `${BACKEND_URL}/`;

/**
 * Lightweight server-side GET request.
 * Returns parsed JSON data, or null on failure (never throws).
 */
export async function serverFetch<T = any>(
  path: string,
  options?: { revalidate?: number }
): Promise<T | null> {
  const url = `${baseUrl}${path.startsWith('/') ? path.slice(1) : path}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: options?.revalidate ?? 60 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return null;

    const json = await res.json();
    // Backend wraps payload in { data } via MyJSONRenderer
    return (json?.data ?? json) as T;
  } catch {
    return null;
  }
}
