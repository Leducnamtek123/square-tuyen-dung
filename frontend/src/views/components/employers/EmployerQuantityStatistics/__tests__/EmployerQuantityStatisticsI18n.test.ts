import { readFileSync } from 'fs';
import { join } from 'path';

describe('EmployerQuantityStatistics i18n', () => {
  const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

  it('does not hard-code fallback copy for dashboard statistic titles', () => {
    expect(source).not.toMatch(/t\('statItem\.title\.[^']+'\s*,\s*['"]/);
    expect(source).not.toContain('defaultValue:');
  });
});
