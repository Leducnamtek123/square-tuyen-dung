import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobPostFilterForm i18n', () => {
  const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

  it('does not hard-code fallback copy for filter fixed keys', () => {
    expect(source).not.toMatch(/t\('jobPostFilterForm\.[^']+'\s*,\s*['"]/);
    expect(source).not.toContain('defaultValue:');
  });
});
