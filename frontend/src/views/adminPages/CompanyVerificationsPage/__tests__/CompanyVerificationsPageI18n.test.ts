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

  it('keeps admin company verification review independent from interview appointments', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const forbiddenAppointmentKey = ['pages', 'companyVerifications', 'table', 'appointment'].join('.');
    const translationCallPrefix = 't' + "('";

    expect(source).not.toContain(`${translationCallPrefix}${forbiddenAppointmentKey}')`);
    expect(source).not.toContain('formatDate(row.scheduledAt)');
    expect(source).not.toContain('row.contactName');
    expect(source).not.toContain('row.contactPhone');
  });
});
