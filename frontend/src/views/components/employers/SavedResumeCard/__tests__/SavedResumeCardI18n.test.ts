import { readFileSync } from 'fs';
import { join } from 'path';

describe('SavedResumeCard i18n', () => {
  const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

  it('does not hard-code fallback copy for saved resume fixed keys', () => {
    expect(source).not.toMatch(/t\('employer:savedResume\.[^']+'\s*,\s*['"]/);
    expect(source).not.toContain('defaultValue:');
  });
});
