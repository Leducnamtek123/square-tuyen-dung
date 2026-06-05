const formatterCache = new Map<string, Intl.NumberFormat>();

export const resolveSalaryInsightLocale = (language?: string | null) => {
  const normalized = String(language || '').toLowerCase();
  return normalized.startsWith('vi') ? 'vi-VN' : 'en-US';
};

const getFormatter = (language?: string | null) => {
  const locale = resolveSalaryInsightLocale(language);
  const cached = formatterCache.get(locale);
  if (cached) return cached;

  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  });
  formatterCache.set(locale, formatter);
  return formatter;
};

export const formatSalaryInsightMoney = (
  value?: number | null,
  language?: string | null,
) => {
  const numericValue = Number(value);
  if (value == null || !Number.isFinite(numericValue)) return '---';

  return getFormatter(language).format(numericValue);
};

const hasDisplayableSalary = (value?: number | null) => {
  const numericValue = Number(value);
  return value != null && Number.isFinite(numericValue) && numericValue > 0;
};

export const formatSalaryInsightRange = (
  salaryFrom?: number | null,
  salaryTo?: number | null,
  language?: string | null,
) => {
  if (!hasDisplayableSalary(salaryFrom) && !hasDisplayableSalary(salaryTo)) return '---';

  const fromText = hasDisplayableSalary(salaryFrom) ? formatSalaryInsightMoney(salaryFrom, language) : '?';
  const toText = hasDisplayableSalary(salaryTo) ? formatSalaryInsightMoney(salaryTo, language) : '?';

  return `${fromText} - ${toText}`;
};
