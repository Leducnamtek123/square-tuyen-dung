export type ParamsRecord = Record<string, unknown>;

/**
 * Removes null, undefined, empty string, and empty array values from a params object.
 * Accepts any object type (including typed DTOs) and returns a cleaned ParamsRecord.
 */
export const cleanParams = <T extends Record<string, unknown>>(params: T): ParamsRecord => {
  const cleaned: ParamsRecord = {};
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    if (Array.isArray(value) && value.length === 0) return;
    cleaned[key] = value;
  });
  return cleaned;
};
