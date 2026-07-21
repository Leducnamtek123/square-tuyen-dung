/**
 * Lightweight snake_case → camelCase transformer.
 * Replaces the need for the `humps` dependency.
 */

const snakeToCamel = (str: string): string =>
  str.replace(/_([a-z0-9])/gi, (_, char: string) => char.toUpperCase());

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

const isBinaryObject = (data: unknown): boolean =>
  typeof ArrayBuffer !== 'undefined'
  && (data instanceof ArrayBuffer || ArrayBuffer.isView(data));

const isBrowserFileObject = (data: unknown): boolean =>
  (typeof File !== 'undefined' && data instanceof File)
  || (typeof Blob !== 'undefined' && data instanceof Blob)
  || (typeof FormData !== 'undefined' && data instanceof FormData);

const shouldTransformObject = (data: unknown): boolean =>
  typeof data === 'object'
  && data !== null
  && !(data instanceof Date)
  && !isBrowserFileObject(data)
  && !isBinaryObject(data);

/**
 * Recursively convert all keys in an object/array from snake_case to camelCase.
 * Handles nested objects, arrays, and null/undefined gracefully without touching
 * browser/binary payloads such as Blob, FormData, and ArrayBuffer.
 */
export function camelizeKeys<T = unknown>(data: unknown): T {
  if (data === null || data === undefined) return data as T;

  if (Array.isArray(data)) {
    return data.map((item) => camelizeKeys(item)) as T;
  }

  if (shouldTransformObject(data)) {
    const result: JsonObject = {};
    for (const [key, value] of Object.entries(data as JsonObject)) {
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

  if (shouldTransformObject(data)) {
    const result: JsonObject = {};
    for (const [key, value] of Object.entries(data as JsonObject)) {
      result[camelToSnake(key)] = snakizeKeys(value);
    }
    return result as T;
  }

  return data as T;
}


