export type ParamsPrimitive = string | number | boolean | null | undefined;
export type ParamsValue = ParamsPrimitive | ParamsPrimitive[] | object;
export type ParamsRecord = { [key: string]: ParamsValue };

/**
 * Removes null, undefined, empty string, and empty array values from a params object.
 * Accepts any object type (including typed DTOs) and returns a cleaned ParamsRecord.
 */
export const cleanParams = <T extends ParamsRecord>(params: T): ParamsRecord => {
  const cleaned: ParamsRecord = {};
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    if (Array.isArray(value) && value.length === 0) return;
    cleaned[key] = value;
  });
  return cleaned;
};


