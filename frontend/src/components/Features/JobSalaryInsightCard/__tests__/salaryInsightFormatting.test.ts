import {
  formatSalaryInsightMoney,
  formatSalaryInsightRange,
  resolveSalaryInsightLocale,
} from '../salaryInsightFormatting';

describe('salaryInsightFormatting', () => {
  it('formats salary numbers using the active app language', () => {
    expect(resolveSalaryInsightLocale('vi')).toBe('vi-VN');
    expect(resolveSalaryInsightLocale('vi-VN')).toBe('vi-VN');
    expect(resolveSalaryInsightLocale('en')).toBe('en-US');

    expect(formatSalaryInsightMoney(1234567, 'vi')).toBe('1.234.567');
    expect(formatSalaryInsightMoney(1234567, 'en')).toBe('1,234,567');
    expect(formatSalaryInsightMoney(null, 'en')).toBe('---');
  });

  it('formats salary ranges without fixed Vietnamese compact units', () => {
    expect(formatSalaryInsightRange(10000000, 20000000, 'en')).toBe('10,000,000 - 20,000,000');
    expect(formatSalaryInsightRange(10000000, 20000000, 'vi')).toBe('10.000.000 - 20.000.000');
    expect(formatSalaryInsightRange(null, 20000000, 'en')).toBe('? - 20,000,000');
    expect(formatSalaryInsightRange(0, 20000000, 'en')).toBe('? - 20,000,000');
    expect(formatSalaryInsightRange(null, null, 'en')).toBe('---');
    expect(formatSalaryInsightRange(0, 0, 'en')).toBe('---');
  });
});
