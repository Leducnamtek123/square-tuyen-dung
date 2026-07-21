import { formatLocalizedSalaryRange } from '../customData';

describe('customData salary formatting', () => {
  it('formats salary ranges with separators matching the active locale', () => {
    expect(formatLocalizedSalaryRange(10000000, 20000000, 'en')).toBe('10,000,000 - 20,000,000');
    expect(formatLocalizedSalaryRange(10000000, 20000000, 'vi')).toBe('10.000.000 - 20.000.000');
  });

  it('keeps missing salary values readable without locale-specific compact units', () => {
    expect(formatLocalizedSalaryRange(null, null, 'en')).toBe('---');
    expect(formatLocalizedSalaryRange(0, 0, 'en')).toBe('---');
    expect(formatLocalizedSalaryRange(null, 20000000, 'en')).toBe('? - 20,000,000');
    expect(formatLocalizedSalaryRange(0, 20000000, 'en')).toBe('? - 20,000,000');
    expect(formatLocalizedSalaryRange(10000000, null, 'vi')).toBe('10.000.000 - ?');
    expect(formatLocalizedSalaryRange(10000000, 0, 'vi')).toBe('10.000.000 - ?');
  });
});
