import { readFileSync } from 'fs';
import { join } from 'path';

describe('QuestionBankCard i18n', () => {
  const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

  it('does not hard-code fallback copy for fixed question bank keys', () => {
    expect(source).not.toMatch(/t\('interview:employer\.questionBank\.[^']+'\s*,\s*['"]/);
    expect(source).not.toContain('defaultValue:');
  });
});
