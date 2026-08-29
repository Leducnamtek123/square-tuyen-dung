import type { PaginatedResponse } from '../types/api';

type PaginatedLike<T> = Partial<PaginatedResponse<T>> & {
  data?: T[] | Partial<PaginatedResponse<T>> | { data?: T[] | Partial<PaginatedResponse<T>> };
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const asItems = <T>(value: unknown): T[] | null =>
  Array.isArray(value) ? (value as T[]) : null;

const asCount = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export const unwrapDataResponse = <T>(raw: unknown, maxDepth = 3): T => {
  let value = raw;

  for (let depth = 0; depth < maxDepth; depth += 1) {
    if (!isObject(value) || !('data' in (value as object))) {
      break;
    }

    // If value is already a paginated container with count & data array, do not peel off count
    const obj = value as Record<string, unknown>;
    if (typeof obj.count === 'number' && Number.isFinite(obj.count) && Array.isArray(obj.data)) {
      break;
    }

    value = obj.data;
  }

  return value as T;
};

export const normalizePaginatedResponse = <T>(raw: unknown): PaginatedResponse<T> => {
  const directItems = asItems<T>(raw);
  if (directItems) {
    return { count: directItems.length, results: directItems };
  }

  if (!isObject(raw)) {
    return { count: 0, results: [] };
  }

  let current: unknown = raw;
  for (let depth = 0; depth < 4; depth += 1) {
    if (!isObject(current)) break;

    const countVal = asCount(current.count);
    const resultsVal = asItems<T>(current.results) || asItems<T>(current.data) || asItems<T>(current.items);

    // If this level has a finite count and items array, return it directly
    if (countVal !== null && resultsVal !== null) {
      return { count: countVal, results: resultsVal };
    }

    // If current contains 'data', drill down while checking if it has count attached
    if ('data' in current) {
      const nested = (current as Record<string, unknown>).data;
      const nestedItems = asItems<T>(nested);
      if (nestedItems) {
        const count = countVal !== null ? countVal : nestedItems.length;
        return { count, results: nestedItems };
      }
      current = nested;
    } else {
      break;
    }
  }

  if (asItems<T>(current)) {
    const items = asItems<T>(current)!;
    return { count: items.length, results: items };
  }

  if (isObject(current)) {
    const results =
      asItems<T>(current.results) ||
      asItems<T>(current.data) ||
      asItems<T>(current.items) ||
      [];
    const count = asCount(current.count) ?? results.length;
    return { count, results };
  }

  return { count: 0, results: [] };
};

export const getApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error && typeof error === 'object') {
    const errObj = error as { response?: { data?: { detail?: string; message?: string } }; message?: string };
    return errObj.response?.data?.detail || errObj.response?.data?.message || errObj.message || fallbackMessage;
  }
  return fallbackMessage;
};
