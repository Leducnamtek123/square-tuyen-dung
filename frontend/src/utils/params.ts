export type ParamsRecord = Record<string, unknown>;

export const cleanParams = (params: ParamsRecord): ParamsRecord => {
  const cleaned: ParamsRecord = {};
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    if (Array.isArray(value) && value.length === 0) return;
    cleaned[key] = value;
  });
  return cleaned;
};
