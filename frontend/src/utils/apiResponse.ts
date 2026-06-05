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

export const normalizePaginatedResponse = <T>(raw: unknown): PaginatedResponse<T> => {
  const directItems = asItems<T>(raw);
  if (directItems) {
    return { count: directItems.length, results: directItems };
  }

  if (!isObject(raw)) {
    return { count: 0, results: [] };
  }

  const obj = raw as PaginatedLike<T>;
  const nested = isObject(obj.data) ? obj.data : null;
  const nestedData = nested && isObject((nested as { data?: unknown }).data)
    ? (nested as { data?: unknown }).data
    : null;

  const results =
    asItems<T>(obj.results) ||
    asItems<T>(obj.data) ||
    (nested ? asItems<T>((nested as Partial<PaginatedResponse<T>>).results) : null) ||
    (nestedData ? asItems<T>((nestedData as Partial<PaginatedResponse<T>>).results) : null) ||
    [];

  const count =
    asCount(obj.count) ??
    (nested ? asCount((nested as Partial<PaginatedResponse<T>>).count) : null) ??
    (nestedData ? asCount((nestedData as Partial<PaginatedResponse<T>>).count) : null) ??
    results.length;

  return { count, results };
};
