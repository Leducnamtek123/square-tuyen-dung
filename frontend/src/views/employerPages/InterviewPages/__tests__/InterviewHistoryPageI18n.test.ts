import { readFileSync } from 'fs';
import { join } from 'path';

describe('InterviewHistoryPage i18n', () => {
  const source = readFileSync(join(__dirname, '../InterviewHistoryPage.tsx'), 'utf8');

  it('does not hard-code fallback copy for interview history filter fixed keys', () => {
    expect(source).not.toMatch(/t\('employer:interviewHistory\.filterTitle'\s*,\s*['"]/);
    expect(source).not.toMatch(/t\('common:reset'\s*,\s*['"]/);
    expect(source).not.toContain('defaultValue:');
  });
});
