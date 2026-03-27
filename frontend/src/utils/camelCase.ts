/**
 * Lightweight snake_case → camelCase transformer.
 * Replaces the need for the `humps` dependency.
 */

const snakeToCamel = (str: string): string =>
  str.replace(/_([a-z0-9])/gi, (_, char: string) => char.toUpperCase());

/**
 * Recursively convert all keys in an object/array from snake_case to camelCase.
 * Handles nested objects, arrays, and null/undefined gracefully.
 */
export function camelizeKeys<T = unknown>(data: unknown): T {
  if (data === null || data === undefined) return data as T;

  if (Array.isArray(data)) {
    return data.map((item) => camelizeKeys(item)) as T;
  }

  if (typeof data === 'object' && !(data instanceof Date) && !(data instanceof File) && !(data instanceof Blob)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      result[snakeToCamel(key)] = camelizeKeys(value);
    }
    return result as T;
  }

  return data as T;
}

/**
 * Convert a single key from camelCase to snake_case.
 */
const camelToSnake = (str: string): string =>
  str.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);

/**
 * Recursively convert all keys in an object/array from camelCase to snake_case.
 * Useful when sending data back to the backend.
 */
export function snakizeKeys<T = unknown>(data: unknown): T {
  if (data === null || data === undefined) return data as T;

  if (Array.isArray(data)) {
    return data.map((item) => snakizeKeys(item)) as T;
  }

  if (typeof data === 'object' && !(data instanceof Date) && !(data instanceof File) && !(data instanceof Blob) && !(data instanceof FormData)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      result[camelToSnake(key)] = snakizeKeys(value);
    }
    return result as T;
  }

  return data as T;
}
