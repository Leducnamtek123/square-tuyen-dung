import { readFileSync } from 'fs';
import { join } from 'path';

describe('QuestionGroupsCard i18n', () => {
  const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

  it('does not hard-code fallback copy for fixed question group keys', () => {
    expect(source).not.toMatch(/t\('employer:questionGroupsCard\.[^']+'\s*,\s*['"]/);
    expect(source).not.toContain('defaultValue:');
  });
});
