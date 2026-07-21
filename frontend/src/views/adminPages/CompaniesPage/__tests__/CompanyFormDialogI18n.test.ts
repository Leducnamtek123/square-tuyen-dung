import { readFileSync } from 'fs';
import { join } from 'path';

describe('CompanyFormDialog i18n', () => {
  const source = readFileSync(join(__dirname, '../CompanyFormDialog.tsx'), 'utf8');
  const hookSource = readFileSync(join(__dirname, '../hooks/useCompanies.ts'), 'utf8');

  const toastKeys = [
    'pages.companies.toast.addSuccess',
    'pages.companies.toast.addError',
    'pages.companies.toast.updateSuccess',
    'pages.companies.toast.updateError',
    'pages.companies.toast.deleteSuccess',
    'pages.companies.toast.deleteError',
  ];

  it('does not hard-code fallback copy for company location form labels', () => {
    [
      'pages.companies.form.since',
      'pages.companies.form.cityId',
      'pages.companies.form.districtId',
      'pages.companies.form.wardId',
      'pages.companies.form.address',
      'pages.companies.form.latitude',
      'pages.companies.form.longitude',
    ].forEach((key) => {
      expect(source).not.toMatch(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'\\s*,\\s*['"]`));
    });
    expect(source).not.toContain('defaultValue:');
  });

  it('does not hard-code mutation toast copy in the company hook source', () => {
    [
      'Company added successfully',
      'An error occurred while adding the company',
      'Company updated successfully',
      'An error occurred while updating the company',
      'Company deleted successfully',
      'An error occurred while deleting the company',
    ].forEach((text) => {
      expect(hookSource).not.toContain(text);
    });

    toastKeys.forEach((key) => {
      expect(hookSource).toContain(`admin:${key}`);
    });
  });

  it('has Vietnamese and English locale entries for company mutation toasts', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/admin.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/admin.json'), 'utf8'));

    toastKeys.forEach((key) => {
      const path = key.replace('pages.', '').split('.');
      const readKey = (locale: Record<string, unknown>) => path.reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale.pages
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
