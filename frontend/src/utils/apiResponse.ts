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

    value = (value as Record<string, unknown>).data;
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

  const unwrapped = unwrapDataResponse<unknown>(raw);
  if (asItems<T>(unwrapped)) {
    const items = asItems<T>(unwrapped)!;
    return { count: items.length, results: items };
  }

  if (isObject(unwrapped)) {
    const results =
      asItems<T>(unwrapped.results) ||
      asItems<T>(unwrapped.data) ||
      [];
    const count =
      asCount(unwrapped.count) ??
      results.length;
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
