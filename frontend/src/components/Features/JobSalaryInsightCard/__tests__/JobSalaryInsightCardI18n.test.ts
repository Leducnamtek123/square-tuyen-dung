import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobSalaryInsightCard i18n', () => {
  it('does not hard-code fallback text for salary insight copy', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const salaryInsightLines = source
      .split(/\r?\n/)
      .filter((line) => line.includes('jobDetail.salaryInsight'));

    expect(salaryInsightLines).not.toHaveLength(0);
    for (const line of salaryInsightLines) {
      expect(line).not.toContain('defaultValue');
      expect(line).not.toMatch(/t\([^,]+,\s*['"]/);
    }
  });

  it('does not use fixed Vietnamese salary formatting in the public insight card', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

    expect(source).not.toContain("new Intl.NumberFormat('vi-VN')");
    expect(source).not.toContain("from '@/utils/customData'");
    expect(source).not.toContain('salaryString(');
    expect(source).toContain('i18n.language');
  });
});
