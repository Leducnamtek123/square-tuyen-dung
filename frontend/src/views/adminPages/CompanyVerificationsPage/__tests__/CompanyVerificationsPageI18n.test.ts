import { readFileSync } from 'fs';
import { join } from 'path';

describe('CompanyVerificationsPage i18n', () => {
  it('does not hard-code fallback text for the update action', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const key = 'pages.companyVerifications.actions.update';
    const call = source.match(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'[\\s\\S]*?\\)`))?.[0] || '';

    expect(call).toContain(`t('${key}'`);
    expect(call).not.toContain('defaultValue');
    expect(call).not.toMatch(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'\\s*,\\s*['"]`));
  });
});
