import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
const hookSource = readFileSync(join(__dirname, '../hooks/useBannerTypes.ts'), 'utf8');

const fixedKeys = [
  'pages.bannerTypes.title',
  'pages.bannerTypes.breadcrumbAdmin',
  'pages.bannerTypes.breadcrumbList',
  'pages.bannerTypes.addButton',
  'pages.bannerTypes.addTitle',
  'pages.bannerTypes.editTitle',
  'pages.bannerTypes.deleteTitle',
  'pages.bannerTypes.deleteConfirm',
  'pages.bannerTypes.searchPlaceholder',
  'pages.bannerTypes.table.id',
  'pages.bannerTypes.table.code',
  'pages.bannerTypes.table.name',
  'pages.bannerTypes.table.value',
  'pages.bannerTypes.table.webAspectRatio',
  'pages.bannerTypes.table.status',
  'pages.bannerTypes.fields.code',
  'pages.bannerTypes.fields.name',
  'pages.bannerTypes.fields.value',
  'pages.bannerTypes.fields.webAspectRatio',
  'pages.bannerTypes.fields.mobileAspectRatio',
  'pages.bannerTypes.fields.isActive',
];

const toastKeys = [
  'pages.bannerTypes.toast.addSuccess',
  'pages.bannerTypes.toast.addError',
  'pages.bannerTypes.toast.updateSuccess',
  'pages.bannerTypes.toast.updateError',
  'pages.bannerTypes.toast.deleteSuccess',
  'pages.bannerTypes.toast.deleteError',
];

describe('BannerTypesPage i18n', () => {
  it('does not hard-code fixed visible copy in the page source', () => {
    [
      />Banner Types</,
      />Add Banner Type</,
      /'Add Banner Type'/,
      /'Edit Banner Type'/,
      />Delete Banner Type</,
      /Search banner types\.\.\./,
      /header:\s*'Code'/,
      /header:\s*'Name'/,
      /header:\s*'Value'/,
      /header:\s*'Web Aspect Ratio'/,
      /header:\s*'Status'/,
      /label="Code"/,
      /label="Name"/,
      /label="Value"/,
      /label="Web Aspect Ratio"/,
      /label="Mobile Aspect Ratio"/,
      /label="Active"/,
      /Are you sure you want to delete banner type/,
    ].forEach((pattern) => {
      expect(source).not.toMatch(pattern);
    });
  });

  it('uses locale keys without fallback strings for fixed copy', () => {
    fixedKeys.forEach((key) => {
      expect(source).toContain(`t('${key}'`);
      expect(source).not.toMatch(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'\\s*,\\s*['"]`));
    });
  });

  it('does not hard-code mutation toast copy in the hook source', () => {
    [
      'Banner type added successfully',
      'An error occurred while adding the banner type',
      'Banner type updated successfully',
      'An error occurred while updating the banner type',
      'Banner type deleted successfully',
      'An error occurred while deleting the banner type',
    ].forEach((text) => {
      expect(hookSource).not.toContain(text);
    });

    toastKeys.forEach((key) => {
      expect(hookSource).toContain(`admin:${key}`);
    });
  });

  it('has Vietnamese and English locale entries for fixed copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/admin.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/admin.json'), 'utf8'));

    [...fixedKeys, ...toastKeys].forEach((key) => {
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
