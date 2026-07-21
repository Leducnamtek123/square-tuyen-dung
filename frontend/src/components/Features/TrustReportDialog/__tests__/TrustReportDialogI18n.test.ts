import { readFileSync } from 'fs';
import { join } from 'path';

describe('TrustReportDialog i18n', () => {
  const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

  it('does not hard-code fallback copy for fixed report dialog keys', () => {
    expect(source).not.toMatch(/t\('public:(?:jobDetail|companyDetail)\.[^']+'\s*,\s*['"]/);
    expect(source).not.toMatch(/t\('common:actions\.submit'\s*,\s*['"]/);
    expect(source).not.toContain('defaultValue:');
  });

  it('does not keep English fallback reason labels in report options', () => {
    expect(source).not.toContain('fallback:');
    expect(source).not.toContain('option.fallback');
  });
});
